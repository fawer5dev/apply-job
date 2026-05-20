import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateTOTPSecret } from '@/lib/auth/totp';
import { createAuditLog } from '@/lib/auth/audit-log';
import { requireAuthApi } from '@/lib/auth/server-session';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const userId = await requireAuthApi();

    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check if 2FA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Two-factor authentication is already enabled',
        },
        { status: 400 }
      );
    }

    // Generate TOTP secret and QR code
    const { secret, qrCodeUrl, backupCodes } = await generateTOTPSecret(user.email);

    // Store secret and backup codes temporarily (not enabled until verified)
    await prisma.verificationToken.create({
      data: {
        userId,
        email: user.email,
        token: secret, // Store secret temporarily
        type: 'TWO_FACTOR_SETUP',
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes to complete setup
      },
    });

    // Create audit log
    await createAuditLog({
      userId,
      action: '2fa_setup_initiated',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl,
      backupCodes,
      message:
        'Scan the QR code with your authenticator app and verify with a code to complete setup',
    });
  } catch (error) {
    console.error('2FA enable error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while enabling 2FA',
      },
      { status: 500 }
    );
  }
}
