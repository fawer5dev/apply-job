import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { verifyPasswordResetToken } from '@/lib/auth/email-verification';
import { revokeAllUserSessions } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/audit-log';
import { prisma } from '@/lib/db/prisma';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Parse and validate request body
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

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

    const { token, password } = validation.data;

    // Validate password strength
    const passwordStrength = validatePasswordStrength(password);
    if (!passwordStrength.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not meet requirements',
          details: passwordStrength.errors,
        },
        { status: 400 }
      );
    }

    // Verify token
    const result = await verifyPasswordResetToken(token);

    if (!result.valid || !result.userId) {
      await createAuditLog({
        action: 'password_reset_failure',
        details: { reason: result.error },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: result.error || 'Invalid token',
      });

      return NextResponse.json(
        {
          success: false,
          error:
            result.error ||
            'Invalid or expired password reset token. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password and reset failed login attempts
    await prisma.user.update({
      where: { id: result.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke all existing sessions (security measure)
    await revokeAllUserSessions(result.userId);

    // Create audit log
    await createAuditLog({
      userId: result.userId,
      action: 'password_reset_success',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });

    // Send security notification
    try {
      await sendSecurityNotification(
        user.email,
        'Password Reset',
        'Your password has been successfully reset. If you did not perform this action, please contact support immediately.',
        user.name || undefined
      );
    } catch (emailError) {
      console.error('Failed to send security notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message:
        'Password reset successfully! All sessions have been logged out for security. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during password reset',
      },
      { status: 500 }
    );
  }
}
