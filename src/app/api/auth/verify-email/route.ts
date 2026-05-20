import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyEmailToken } from '@/lib/auth/email-verification';
import { createAuditLog } from '@/lib/auth/audit-log';

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
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
    const validation = verifySchema.safeParse(body);

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

    const { token } = validation.data;

    // Verify token
    const result = await verifyEmailToken(token);

    if (!result.valid || !result.userId) {
      await createAuditLog({
        action: 'email_verified',
        details: { reason: result.error },
        ipAddress: ip,
        userAgent,
        success: false,
        errorMessage: result.error || 'Invalid token',
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Invalid or expired verification token',
        },
        { status: 400 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: result.userId,
      action: 'email_verified',
      details: {},
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during email verification',
      },
      { status: 500 }
    );
  }
}
