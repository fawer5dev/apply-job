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
    // Cast to any to avoid TypeScript build failures caused by mismatches
    // between generated Prisma client types and runtime shape in CI.
    const s: any = session as any;

    const accountType: 'FREE' | 'PROFESSIONAL' =
      s.users?.accountType ?? 'FREE';
    let applicationCount = 0;
    if (s.users?.id) {
      applicationCount = await prisma.applications.count({
        where: { userId: s.users.id },
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: s.id,
        userId: s.userId,
        expires: s.expires,
        lastActive: s.lastActive,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        deviceId: s.deviceId,
      },
      user: {
        id: s.users?.id,
        email: s.users?.email,
        name: s.users?.name,
        emailVerified: s.users?.emailVerified,
        twoFactorEnabled: s.users?.twoFactorEnabled,
        isActive: s.users?.isActive,
        accountType,
        applicationCount,
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
