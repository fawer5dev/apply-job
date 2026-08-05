import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import {
  checkAccountLocked,
  recordFailedLogin,
  resetFailedAttempts,
} from '@/lib/auth/account-lockout';
import { createAuditLog } from '@/lib/auth/audit-log';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
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
    let rateLimit;
    try {
      rateLimit = await checkRateLimit(ip, 'login');
    } catch (err) {
      console.error('Rate limit check error:', err);
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 1800),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

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

    const { email, password, deviceId } = validation.data;

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        emailVerified: true,
        isActive: true,
        isSuspended: true,
        twoFactorEnabled: true,
        lockedUntil: true,
      },
    });

    // Generic error message (don't reveal if user exists)
    const genericError = 'Invalid email or password';

    if (!user || !user.passwordHash) {
      // Log failed attempt
      await createAuditLog({
        action: 'login_failure',
        details: { email, reason: 'user_not_found' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: genericError,
      });

      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Check if account is locked
    const lockStatus = await checkAccountLocked(user.id);
    if (lockStatus.locked) {
      const minutesRemaining = Math.ceil(
        (lockStatus.unlockAt!.getTime() - Date.now()) / 60000
      );

      await createAuditLog({
        userId: user.id,
        action: 'login_failure',
        details: { email, reason: 'account_locked' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Account locked',
      });

      return NextResponse.json(
        {
          success: false,
          error: `Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minutes.`,
          lockedUntil: lockStatus.unlockAt,
        },
        { status: 423 }
      );
    }

    // Check if account is suspended
    if (user.isSuspended) {
      await createAuditLog({
        userId: user.id,
        action: 'login_failure',
        details: { email, reason: 'account_suspended' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Account suspended',
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Your account has been suspended. Please contact support.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(user.passwordHash, password);

    if (!passwordValid) {
      // Record failed login attempt
      const isLocked = await recordFailedLogin(user.id);

      await createAuditLog({
        userId: user.id,
        action: 'login_failure',
        details: { email, reason: 'invalid_password' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Invalid password',
      });

      if (isLocked) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Too many failed login attempts. Your account has been locked for 30 minutes.',
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      await createAuditLog({
        userId: user.id,
        action: 'login_failure',
        details: { email, reason: 'email_not_verified' },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: 'Email not verified',
      });

      return NextResponse.json(
        {
          success: false,
          error:
            'Please verify your email address before logging in. Check your inbox for the verification link.',
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Create temporary token for 2FA verification (valid for 5 minutes)
      const tempToken = await createSession(
        user.id,
        {
          ipAddress: ip,
          userAgent,
          deviceId,
        },
        new Date(Date.now() + 5 * 60 * 1000)
      );

      // This session will be revoked after 2FA verification and replaced with a real one

      await createAuditLog({
        userId: user.id,
        action: 'login_success',
        details: { email, requires2FA: true },
        ipAddress: ip,
        userAgent,
        success: true,
      });

      return NextResponse.json({
        success: true,
        requires2FA: true,
        tempToken,
        expiresIn: 300, // 5 minutes
      });
    }

    // Successful login - reset failed attempts
    await resetFailedAttempts(user.id);
    await resetRateLimit(ip, 'login');

    // Create session
    const sessionToken = await createSession(user.id, {
      ipAddress: ip,
      userAgent,
      deviceId,
    });

    // Calculate expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'login_success',
      details: { email },
      ipAddress: ip,
      userAgent,
      success: true,
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      sessionToken,
      users: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      expiresAt,
    });

    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}
