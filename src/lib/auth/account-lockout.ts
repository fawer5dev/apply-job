import { prisma } from '@/lib/db/prisma';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Record a failed login attempt
 * @returns true if account is now locked, false otherwise
 */
export async function recordFailedLogin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true, lockedUntil: true },
  });

  if (!user) return false;

  // Check if already locked and duration not expired
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true; // Still locked
  }

  const newAttempts = user.failedLoginAttempts + 1;
  const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: newAttempts,
      lockedUntil: shouldLock
        ? new Date(Date.now() + LOCKOUT_DURATION_MS)
        : null,
    },
  });

  return shouldLock;
}

/**
 * Reset failed login attempts (call on successful login)
 */
export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}

/**
 * Check if an account is currently locked
 */
export async function checkAccountLocked(userId: string): Promise<{
  locked: boolean;
  unlockAt?: Date;
  attemptsRemaining?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lockedUntil: true,
      failedLoginAttempts: true,
    },
  });

  if (!user) {
    return { locked: false };
  }

  // Check if locked and lock hasn't expired
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      locked: true,
      unlockAt: user.lockedUntil,
    };
  }

  // Not locked, return attempts remaining
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    // Lock expired, auto-reset
    await resetFailedAttempts(userId);
    return {
      locked: false,
      attemptsRemaining: MAX_FAILED_ATTEMPTS,
    };
  }

  return {
    locked: false,
    attemptsRemaining: Math.max(
      0,
      MAX_FAILED_ATTEMPTS - user.failedLoginAttempts
    ),
  };
}

/**
 * Manually unlock an account (admin function)
 */
export async function unlockAccount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
  });
}

/**
 * Get failed login attempts for a user
 */
export async function getFailedAttempts(
  userId: string
): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });

  return user?.failedLoginAttempts ?? null;
}
