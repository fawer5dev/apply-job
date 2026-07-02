import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
} from '@/lib/auth/totp';
import { createAuditLog } from '@/lib/auth/audit-log';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { requireAuthApi } from '@/lib/auth/server-session';

const verifySetupSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    // Derive user ID from the validated session cookie only
    const userId = await requireAuthApi();

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
    const validation = verifySetupSchema.safeParse(body);

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

    const { code } = validation.data;

    // Get the temporary secret from verification token
    const setupToken = await prisma.verification_tokens.findFirst({
      where: {
        userId,
        type: 'TWO_FACTOR',
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!setupToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Setup session expired. Please start the setup process again.',
        },
        { status: 400 }
      );
    }

    const secret = setupToken.token;

    // Verify the code
    const isValid = verifyTOTP(secret, code);

    if (!isValid) {
      await createAuditLog({
        userId,
        action: '2fa_enabled',
        details: { reason: 'invalid_code' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Invalid verification code',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid verification code. Please try again.',
        },
        { status: 400 }
      );
    }

    // Generate backup codes and store only their hashes
    const backupCodes = generateBackupCodes();
    const backupCodeHashes = backupCodes.map(hashBackupCode);

    // Enable 2FA and store secret and hashed backup codes
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodeHashes,
      },
    });

    // Delete the temporary setup token
    await prisma.verification_tokens.delete({
      where: { id: setupToken.id },
    });

    // Create audit log
    await createAuditLog({
      userId,
      action: '2fa_enabled',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled successfully!',
      backupCodes,
      warning:
        'Save these backup codes in a secure location. You can use them to log in if you lose access to your authenticator app.',
    });
  } catch (error) {
    console.error('2FA verify setup error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while verifying 2FA setup',
      },
      { status: 500 }
    );
  }
}
