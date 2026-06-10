import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { sendPasswordResetEmail } from '@/lib/auth/email-verification';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/lib/auth/audit-log';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check rate limit
    const rateLimit = await checkRateLimit(ip, 'password-reset');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many password reset requests. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 3600),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

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

    const { email } = validation.data;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isSuspended: true,
      },
    });

    // Don't reveal if user exists (security best practice)
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Don't send reset email to suspended accounts
    if (user.isSuspended) {
      await createAuditLog({
        userId: user.id,
        action: 'password_reset_requested',
        details: { email, reason: 'account_suspended' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Account suspended',
      });

      // Still return generic success message
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email);

      await createAuditLog({
        userId: user.id,
        action: 'password_reset_requested',
        details: { email },
        ipAddress: ip,
        userAgent,
        success: true,
      });

      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent. Please check your inbox.',
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);

      await createAuditLog({
        userId: user.id,
        action: 'password_reset_completed',
        details: { email },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Failed to send email',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send password reset email. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
