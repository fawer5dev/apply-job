import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateBackupCodes } from '@/lib/auth/totp';
import { createAuditLog } from '@/lib/auth/audit-log';

const regenerateSchema = z.object({
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
    const validation = regenerateSchema.safeParse(body);

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

    // Get user
    const user = await prisma.user.findUnique({
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

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Cannot regenerate backup codes' },
        { status: 400 }
      );
    }

    const passwordValid = await verifyPassword(user.passwordHash, password);

    if (!passwordValid) {
      await createAuditLog({
        userId,
        action: 'backup_codes_regeneration_failure',
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

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();

    // Update backup codes
    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: newBackupCodes,
      },
    });

    // Create audit log
    await createAuditLog({
      userId,
      action: 'backup_codes_regenerated',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      backupCodes: newBackupCodes,
      message: 'Backup codes regenerated successfully',
      warning:
        'Your old backup codes are now invalid. Save these new codes in a secure location.',
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while regenerating backup codes',
      },
      { status: 500 }
    );
  }
}
