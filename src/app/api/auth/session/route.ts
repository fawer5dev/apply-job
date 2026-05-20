import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSessionToken } from '@/lib/auth/server-session';
import { validateSession } from '@/lib/auth/session';

// GET /api/auth/session - Get current session info
export async function GET(request: NextRequest) {
  try {
    const sessionToken = await getSessionToken();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No active session' },
        { status: 401 }
      );
    }

    const sessionCheck = await validateSession(sessionToken);

    if (!sessionCheck.valid || !sessionCheck.session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { session } = sessionCheck;

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        lastActivityAt: session.lastActivityAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        deviceId: session.deviceId,
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        twoFactorEnabled: session.user.twoFactorEnabled,
        isActive: session.user.isActive,
      },
    });
  } catch (error) {
    console.error('Get session error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching session',
      },
      { status: 500 }
    );
  }
}
