import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyTOTP } from '@/lib/auth/totp';
import { createSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/audit-log';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { setSessionCookie } from '@/lib/auth/server-session';

const verifySchema = z.object({
  tempToken: z.string().min(1, 'Temporary token is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
  useBackupCode: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check rate limit
    const rateLimit = await checkRateLimit(ip, '2fa-verify');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many verification attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 300),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = verifySchema.safeParse(body);

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

    const { tempToken, code, useBackupCode } = validation.data;

    // Verify temporary session exists (created during login)
    const tempSession = await prisma.session.findUnique({
      where: { token: tempToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            twoFactorSecret: true,
            backupCodes: true,
          },
        },
      },
    });

    if (!tempSession || tempSession.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired temporary session. Please log in again.',
        },
        { status: 400 }
      );
    }

    const user = tempSession.user;

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Two-factor authentication is not set up for this account',
        },
        { status: 400 }
      );
    }

    let isValid = false;
    let usedBackupCode = false;

    if (useBackupCode) {
      // Verify backup code
      const backupCodes = user.backupCodes || [];
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex !== -1) {
        isValid = true;
        usedBackupCode = true;

        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter((_, i) => i !== codeIndex);
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodes: updatedBackupCodes },
        });
      }
    } else {
      // Verify TOTP code
      isValid = verifyTOTP(user.twoFactorSecret, code);
    }

    if (!isValid) {
      await createAuditLog({
        userId: user.id,
        action: '2fa_verification_failure',
        details: { useBackupCode },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Invalid 2FA code',
      });

      return NextResponse.json(
        {
          success: false,
          error: useBackupCode
            ? 'Invalid backup code'
            : 'Invalid verification code. Please try again.',
        },
        { status: 400 }
      );
    }

    // Delete temporary session
    await prisma.session.delete({
      where: { id: tempSession.id },
    });

    // Create real session
    const sessionToken = await createSession(user.id, {
      ipAddress: ip,
      userAgent,
      deviceId: tempSession.deviceId || undefined,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: '2fa_verified',
      details: { usedBackupCode },
      ipAddress: ip,
      userAgent,
      success: true,
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: '2FA verification successful',
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      expiresAt,
      ...(usedBackupCode && {
        warning: `Backup code used. You have ${
          (user.backupCodes?.length || 0) - 1
        } backup codes remaining.`,
      }),
    });

    response.headers.set('Set-Cookie', setSessionCookie(sessionToken, expiresAt));

    return response;
  } catch (error) {
    console.error('2FA verify error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during 2FA verification',
      },
      { status: 500 }
    );
  }
}
