import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { sendVerificationEmail } from '@/lib/auth/email-verification';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/lib/auth/audit-log';

const resendSchema = z.object({
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

    // Check rate limit (stricter than register)
    const rateLimit = await checkRateLimit(ip, 'email-verification');

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many verification email requests. Please try again later.',
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
    const validation = resendSchema.safeParse(body);

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
        emailVerified: true,
        isActive: true,
      },
    });

    // Don't reveal if user exists or not (security)
    if (!user) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with this email, a verification link has been sent.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      await createAuditLog({
        userId: user.id,
        action: 'email_verified',
        details: { email, reason: 'already_verified' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Email already verified',
      });

      return NextResponse.json({
        success: false,
        error: 'This email is already verified. You can log in.',
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.id, user.email, user.name || undefined);

      await createAuditLog({
        userId: user.id,
        action: 'email_verified',
        details: { email },
        ipAddress: ip,
        userAgent,
        success: true,
      });

      return NextResponse.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);

      await createAuditLog({
        userId: user.id,
        action: 'email_verified',
        details: { email },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Failed to send email',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send verification email. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Resend verification error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
