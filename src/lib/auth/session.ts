import { randomBytes, createHash } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import type { sessions, users } from '@prisma/client';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SESSIONS_PER_USER = 5;

interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
}

interface SessionWithUser extends sessions {
  users: users;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: SessionWithUser;
  shouldRefresh?: boolean;
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  metadata: SessionMetadata
): Promise<string> {
  // Generate cryptographically secure token
  const tokenBytes = randomBytes(32);
  const token = tokenBytes.toString('base64url');

  // Hash token for database storage
  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Clean up old sessions (keep only N most recent)
  await cleanupUserSessions(userId, MAX_SESSIONS_PER_USER - 1);

  // Create session
  const sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  await prisma.sessions.create({
    data: {
      id: sessionId,
      userId,
      sessionToken: tokenHash,
      expires: new Date(Date.now() + SESSION_DURATION),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      deviceId: metadata.deviceId,
    },
  });

  // Return unhashed token to client
  return token;
}

/**
 * Validate a session token
 */
export async function validateSession(
  token: string
): Promise<SessionValidationResult> {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const session = await prisma.sessions.findUnique({
    where: { sessionToken: tokenHash },
    include: { users: true },
  });

  // Session not found or revoked
  if (!session || !session.isValid) {
    return { valid: false };
  }

  // Session expired
  if (session.expires < new Date()) {
    await revokeSession(tokenHash);
    return { valid: false };
  }

  // Check if user is active
  if (!session.users.isActive || session.users.isSuspended) {
    return { valid: false };
  }

  // Update last activity
  await prisma.sessions.update({
    where: { id: session.id },
    data: { lastActive: new Date() },
  });

  // Check if session should be refreshed
  const timeUntilExpiry = session.expires.getTime() - Date.now();
  const shouldRefresh = timeUntilExpiry < SESSION_REFRESH_THRESHOLD;

  return { valid: true, session, shouldRefresh };
}

/**
 * Refresh a session (extend expiry)
 */
export async function refreshSession(token: string): Promise<string> {
  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Get old session data
  const oldSession = await prisma.sessions.findUnique({
    where: { sessionToken: tokenHash },
    select: {
      userId: true,
      userAgent: true,
      ipAddress: true,
      deviceId: true,
    },
  });

  if (!oldSession) {
    throw new Error('Session not found');
  }

  // Revoke old session
  await revokeSession(tokenHash);

  // Create new session with same metadata
  return createSession(oldSession.userId, {
    userAgent: oldSession.userAgent || undefined,
    ipAddress: oldSession.ipAddress || undefined,
    deviceId: oldSession.deviceId || undefined,
  });
}

/**
 * Revoke a session
 */
export async function revokeSession(
  tokenHash: string,
  reason: string = 'user_logout'
): Promise<void> {
  await prisma.sessions.updateMany({
    where: { sessionToken: tokenHash },
    data: {
      isValid: false,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(
  userId: string,
  reason: string = 'security_action'
): Promise<number> {
  const result = await prisma.sessions.updateMany({
    where: { userId, isValid: true },
    data: {
      isValid: false,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });

  return result.count;
}

/**
 * Alias for backward compatibility
 */
export { revokeAllUserSessions as revokeAllSessions };

/**
 * Revoke all sessions except current one
 */
export async function revokeOtherSessions(
  userId: string,
  currentToken: string
): Promise<number> {
  const currentTokenHash = createHash('sha256')
    .update(currentToken)
    .digest('hex');

  const result = await prisma.sessions.updateMany({
    where: {
      userId,
      isValid: true,
      sessionToken: { not: currentTokenHash },
    },
    data: {
      isValid: false,
      revokedAt: new Date(),
      revokedReason: 'user_logout_others',
    },
  });

  return result.count;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  return prisma.sessions.findMany({
    where: {
      userId,
      isValid: true,
      expires: { gt: new Date() },
    },
    orderBy: { lastActive: 'desc' },
    select: {
      id: true,
      createdAt: true,
      lastActive: true,
      expires: true,
      userAgent: true,
      ipAddress: true,
      deviceId: true,
    },
  });
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.sessions.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });

  return result.count;
}

/**
 * Clean up old user sessions (keep only N most recent)
 */
async function cleanupUserSessions(
  userId: string,
  keepCount: number
): Promise<void> {
  const sessions = await prisma.sessions.findMany({
    where: { userId, isValid: true },
    orderBy: { lastActive: 'desc' },
    select: { id: true },
  });

    if (sessions.length > keepCount) {
    const toDelete = sessions.slice(keepCount).map((s: any) => s.id);
    await prisma.sessions.updateMany({
      where: { id: { in: toDelete } },
      data: {
        isValid: false,
        revokedAt: new Date(),
        revokedReason: 'max_sessions_exceeded',
      },
    });
  }
}
