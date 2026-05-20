/**
 * Edge Runtime compatible session validation
 * For use in Next.js middleware only
 */

import { prisma } from '@/lib/db/prisma';
import type { Session, User } from '@prisma/client';
import { hashToken } from './edge-crypto';

interface SessionWithUser extends Session {
  user: User;
}

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
    const session = await prisma.session.findUnique({
      where: { sessionToken: tokenHash },
      include: { user: true },
    });

    // Check if session exists and is not expired
    if (!session || session.expires < new Date()) {
      return { valid: false };
    }

    // Check if user is active and not suspended
    if (!session.user.isActive || session.user.isSuspended) {
      return { valid: false };
    }

    // Check if account is locked
    if (session.user.lockedUntil && session.user.lockedUntil > new Date()) {
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
