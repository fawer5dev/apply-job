import { prisma } from '@/lib/db/prisma';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  'password-reset': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  '2fa-verify': {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  'email-verification': {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
};

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
}

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    // No rate limit configured for this endpoint
    return { allowed: true };
  }

  const record = await prisma.rateLimit.findUnique({
    where: {
      identifier_endpoint: {
        identifier,
        endpoint,
      },
    },
  });

  // Check if currently blocked
  if (record?.blockedUntil && record.blockedUntil > new Date()) {
    const retryAfter = Math.ceil(
      (record.blockedUntil.getTime() - Date.now()) / 1000
    );
    return { allowed: false, retryAfter, remaining: 0 };
  }

  // No record or window expired - allow and create/reset
  if (
    !record ||
    Date.now() - record.windowStart.getTime() > config.windowMs
  ) {
    await prisma.rateLimit.upsert({
      where: {
        identifier_endpoint: { identifier, endpoint },
      },
      create: {
        identifier,
        endpoint,
        attempts: 1,
        windowStart: new Date(),
      },
      update: {
        attempts: 1,
        windowStart: new Date(),
        blockedUntil: null,
      },
    });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
    };
  }

  // Increment attempts
  const newAttempts = record.attempts + 1;

  // Check if exceeds limit
  if (newAttempts > config.maxAttempts) {
    const blockedUntil = new Date(Date.now() + config.blockDurationMs);
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: {
        attempts: newAttempts,
        blockedUntil,
      },
    });

    const retryAfter = Math.ceil(config.blockDurationMs / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  // Update attempts
  await prisma.rateLimit.update({
    where: { id: record.id },
    data: { attempts: newAttempts },
  });

  return {
    allowed: true,
    remaining: config.maxAttempts - newAttempts,
  };
}

/**
 * Reset rate limit for an identifier and endpoint
 */
export async function resetRateLimit(
  identifier: string,
  endpoint: string
): Promise<void> {
  await prisma.rateLimit
    .delete({
      where: {
        identifier_endpoint: { identifier, endpoint },
      },
    })
    .catch(() => {
      // Ignore if doesn't exist
    });
}

/**
 * Clean up old rate limit records (run periodically)
 */
export async function cleanupRateLimits(): Promise<number> {
  // Delete records older than 7 days
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await prisma.rateLimit.deleteMany({
    where: {
      windowStart: { lt: cutoffDate },
      blockedUntil: { lt: new Date() },
    },
  });

  return result.count;
}

/**
 * Get rate limit status without incrementing
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string
): Promise<{ blocked: boolean; remaining: number; resetAt?: Date }> {
  const config = RATE_LIMITS[endpoint];
  if (!config) {
    return { blocked: false, remaining: 999 };
  }

  const record = await prisma.rateLimit.findUnique({
    where: {
      identifier_endpoint: { identifier, endpoint },
    },
  });

  if (!record) {
    return { blocked: false, remaining: config.maxAttempts };
  }

  // Check if blocked
  if (record.blockedUntil && record.blockedUntil > new Date()) {
    return {
      blocked: true,
      remaining: 0,
      resetAt: record.blockedUntil,
    };
  }

  // Check if window expired
  if (Date.now() - record.windowStart.getTime() > config.windowMs) {
    return { blocked: false, remaining: config.maxAttempts };
  }

  return {
    blocked: false,
    remaining: Math.max(0, config.maxAttempts - record.attempts),
  };
}
