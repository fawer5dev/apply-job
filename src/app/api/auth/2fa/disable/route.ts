import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createAuditLog } from '@/lib/auth/audit-log';

const disableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
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
    const validation = disableSchema.safeParse(body);

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

    const { password } = validation.data;

    // Get user with 2FA status and password hash
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Two-factor authentication is not enabled',
        },
        { status: 400 }
      );
    }

    // Verify password (security measure)
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Cannot disable 2FA for this account' },
        { status: 400 }
      );
    }

    const passwordValid = await verifyPassword(user.passwordHash, password);

    if (!passwordValid) {
      await createAuditLog({
        userId,
        action: '2fa_disabled',
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

    // Disable 2FA and clear secret and backup codes
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    // Create audit log
    await createAuditLog({
      userId,
      action: '2fa_disabled',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while disabling 2FA',
      },
      { status: 500 }
    );
  }
}
