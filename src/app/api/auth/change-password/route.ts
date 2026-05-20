import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from '@/lib/auth/password';
import { revokeAllSessions, createSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/audit-log';
import { sendSecurityNotification } from '@/lib/email/sender';
import { setSessionCookie } from '@/lib/auth/server-session';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(12, 'New password must be at least 12 characters'),
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
    const validation = changePasswordSchema.safeParse(body);

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

    const { currentPassword, newPassword } = validation.data;

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be different from current password',
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordStrength = validatePasswordStrength(newPassword);
    if (!passwordStrength.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password does not meet requirements',
          details: passwordStrength.errors,
        },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordValid = await verifyPassword(
      user.passwordHash,
      currentPassword
    );

    if (!passwordValid) {
      await createAuditLog({
        userId: user.id,
        action: 'password_changed',
        details: { reason: 'invalid_current_password' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Invalid current password',
      });

      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Revoke all sessions except current one (security measure)
    await revokeAllSessions(user.id);

    // Create new session for current device
    const newSessionToken = await createSession(user.id, {
      ipAddress: ip,
      userAgent,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'password_changed',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    // Send security notification
    try {
      await sendSecurityNotification(
        user.email,
        'Password Changed',
        'Your password has been successfully changed. All other sessions have been logged out for security. If you did not perform this action, please contact support immediately.',
        user.name || undefined
      );
    } catch (emailError) {
      console.error('Failed to send security notification:', emailError);
      // Don't fail the request if email fails
    }

    // Create response with new session cookie
    const response = NextResponse.json({
      success: true,
      message:
        'Password changed successfully! All other sessions have been logged out.',
      sessionToken: newSessionToken,
    });

    response.headers.set('Set-Cookie', setSessionCookie(newSessionToken, expiresAt));

    return response;
  } catch (error) {
    console.error('Change password error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while changing password',
      },
      { status: 500 }
    );
  }
}
