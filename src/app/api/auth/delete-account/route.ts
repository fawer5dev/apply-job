import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { verifyTOTP } from '@/lib/auth/totp';
import { createAuditLog } from '@/lib/auth/audit-log';
import { clearSessionCookie } from '@/lib/auth/server-session';

const deleteSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Parse and validate request body
    const body = await request.json();
    const validation = deleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { password, totpCode } = validation.data;

    // Get user with auth fields
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify password (security measure)
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete this account' },
        { status: 400 }
      );
    }

    const passwordValid = await verifyPassword(user.passwordHash, password);

    if (!passwordValid) {
      await createAuditLog({
        userId,
        action: 'account_deletion_failed',
        details: { reason: 'invalid_password' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Invalid password',
      });

      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Verify TOTP code if 2FA is enabled
    if (user.twoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          { success: false, error: 'Two-factor authentication code is required' },
          { status: 400 }
        );
      }

      if (!user.twoFactorSecret || !verifyTOTP(user.twoFactorSecret, totpCode)) {
        await createAuditLog({
          userId,
          action: 'account_deletion_failed',
          details: { reason: 'invalid_totp' },
          ipAddress: ip,
          userAgent,
          success: false,
          errorMessage: 'Invalid 2FA code',
        });

        return NextResponse.json(
          { success: false, error: 'Invalid 2FA code' },
          { status: 401 }
        );
      }
    }

    // Create audit log BEFORE deleting the user (while userId still resolves).
    // audit_logs.userId is optional (SetNull on delete), so we record the action
    // then null out the FK during the transaction below to retain the log.
    await createAuditLog({
      userId,
      action: 'account_deleted',
      details: { email: user.email },
      ipAddress: ip,
      userAgent,
      success: true,
    });

    // Permanently delete the user and all owned data in an ordered transaction.
    // Order matters: applications reference base_cvs with a Restrict FK, so
    // applications must be deleted before base_cvs. job_listings and cv_templates
    // are global (no userId) and are intentionally left untouched. audit_logs are
    // retained for forensics with userId nulled out.
    await prisma.$transaction(
      [
        prisma.applications.deleteMany({ where: { userId } }),
        prisma.cover_letters.deleteMany({ where: { userId } }),
        prisma.base_cvs.deleteMany({ where: { userId } }),
        prisma.sessions.deleteMany({ where: { userId } }),
        prisma.accounts.deleteMany({ where: { userId } }),
        prisma.verification_tokens.deleteMany({ where: { userId } }),
        prisma.audit_logs.updateMany({
          where: { userId },
          data: { userId: null },
        }),
        prisma.users.delete({ where: { id: userId } }),
      ],
      { maxWait: 15000, timeout: 15000 }
    );

    // Clear the session cookie to log the user out
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while deleting the account',
      },
      { status: 500 }
    );
  }
}
