import { prisma } from '@/lib/db/prisma';

export type AuditAction =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'logout_all'
  | 'register'
  | 'email_verified'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | 'backup_codes_regenerated'
  | 'account_locked'
  | 'account_unlocked'
  | 'session_refreshed'
  | 'oauth_connected';

interface AuditLogOptions {
  userId?: string;
  action: AuditAction;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId,
        action: options.action,
        details: options.details || {},
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        success: options.success,
        errorMessage: options.errorMessage,
      },
    });
  } catch (error) {
    // Don't throw - audit logs shouldn't break the application
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
  }
) {
  const where: any = { userId };
  if (options?.action) {
    where.action = options.action;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    select: {
      id: true,
      action: true,
      details: true,
      ipAddress: true,
      userAgent: true,
      success: true,
      errorMessage: true,
      createdAt: true,
    },
  });
}

/**
 * Get recent failed login attempts
 */
export async function getRecentFailedLogins(
  emailOrUserId: string,
  minutesAgo: number = 30
): Promise<number> {
  const cutoffDate = new Date(Date.now() - minutesAgo * 60 * 1000);

  const count = await prisma.auditLog.count({
    where: {
      OR: [
        { userId: emailOrUserId },
        { details: { path: ['email'], equals: emailOrUserId } },
      ],
      action: 'login_failure',
      createdAt: { gte: cutoffDate },
    },
  });

  return count;
}

/**
 * Detect suspicious activity
 */
export async function detectSuspiciousActivity(
  userId: string
): Promise<{
  suspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  // Check for multiple failed logins in last hour
  const recentFailures = await prisma.auditLog.count({
    where: {
      userId,
      action: 'login_failure',
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });

  if (recentFailures >= 5) {
    reasons.push(`${recentFailures} failed login attempts in last hour`);
  }

  // Check for logins from multiple IPs in last hour
  const recentLogins = await prisma.auditLog.findMany({
    where: {
      userId,
      action: 'login_success',
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
    select: { ipAddress: true },
    distinct: ['ipAddress'],
  });

  if (recentLogins.length >= 3) {
    reasons.push(
      `Logins from ${recentLogins.length} different IP addresses in last hour`
    );
  }

  // Check for password changes after failed logins
  const recentPasswordChange = await prisma.auditLog.findFirst({
    where: {
      userId,
      action: 'password_changed',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  if (recentPasswordChange && recentFailures > 0) {
    reasons.push('Password changed shortly after failed login attempts');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}

/**
 * Clean up old audit logs (run periodically)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * Get security summary for user
 */
export async function getSecuritySummary(userId: string): Promise<{
  lastLogin?: Date;
  lastLoginIp?: string;
  totalLogins: number;
  failedLoginsLast30Days: number;
  passwordChanges: number;
  twoFactorEvents: number;
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [lastLogin, totalLogins, failedLogins, passwordChanges, twoFactorEvents] =
    await Promise.all([
      prisma.auditLog.findFirst({
        where: { userId, action: 'login_success' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({
        where: { userId, action: 'login_success' },
      }),
      prisma.auditLog.count({
        where: {
          userId,
          action: 'login_failure',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.auditLog.count({
        where: { userId, action: 'password_changed' },
      }),
      prisma.auditLog.count({
        where: {
          userId,
          action: { in: ['2fa_enabled', '2fa_disabled', '2fa_verified'] },
        },
      }),
    ]);

  return {
    lastLogin: lastLogin?.createdAt,
    lastLoginIp: lastLogin?.ipAddress || undefined,
    totalLogins,
    failedLoginsLast30Days: failedLogins,
    passwordChanges,
    twoFactorEvents,
  };
}
