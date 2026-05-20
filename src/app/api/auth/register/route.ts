import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { sendVerificationEmail } from '@/lib/auth/email-verification';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { createAuditLog } from '@/lib/auth/audit-log';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  name: z.string().min(1, 'Name is required').optional(),
  locale: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const rateLimit = await checkRateLimit(ip, 'register');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many registration attempts. Please try again later.',
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
    const validation = registerSchema.safeParse(body);

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

    const { email, password, name, locale } = validation.data;

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Don't reveal that email exists - security best practice
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists. Please login instead.',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (inactive until email verified)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
        isActive: false, // Will be activated on email verification
        emailVerified: null,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.id, user.email, user.name || undefined);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'register',
      details: { email: user.email, locale },
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || undefined,
      success: true,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          'Registration successful! Please check your email to verify your account.',
        userId: user.id,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during registration. Please try again.',
      },
      { status: 500 }
    );
  }
}
