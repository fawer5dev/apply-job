/**
 * Edge Runtime compatible session validation
 * For use in Next.js middleware only
 */

import { prisma } from '@/lib/db/prisma';
// Don't import Prisma model types directly to avoid build failures when the
// generated client exports different type names across environments. Define a
// minimal local type that covers the fields we use here.
type MinimalUser = {
  id: string;
  isActive: boolean;
  isSuspended: boolean;
  lockedUntil?: Date | null;
};

type SessionWithUser = {
  id: string;
  sessionToken?: string;
  expires: Date;
  lastActive: Date;
  users: MinimalUser;
};
import { hashToken } from './edge-crypto';

export interface EdgeSessionValidationResult {
  valid: boolean;
  session?: SessionWithUser;
  shouldRefresh?: boolean;
}

/**
 * Validate a session token (Edge Runtime compatible)
 * Only for use in middleware
 */
export async function validateSessionEdge(
  token: string
): Promise<EdgeSessionValidationResult> {
  try {
    // Hash the token
    const tokenHash = await hashToken(token);

    // Look up session
    const session = await prisma.sessions.findUnique({
      where: { sessionToken: tokenHash },
      include: { users: true },
    });

    // Check if session exists and is not expired
    if (!session || session.expires < new Date()) {
      return { valid: false };
    }

    // Check if user is active and not suspended
    if (!session.users.isActive || session.users.isSuspended) {
      return { valid: false };
    }

    // Check if account is locked
    if (session.users.lockedUntil && session.users.lockedUntil > new Date()) {
      return { valid: false };
    }

    // Check if session should be refreshed (more than 24 hours since last activity)
    const shouldRefresh =
      Date.now() - session.lastActive.getTime() > 24 * 60 * 60 * 1000;

    return {
      valid: true,
      session,
      shouldRefresh,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false };
  }
}
