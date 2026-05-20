import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { UAParser } from 'ua-parser-js';

// GET /api/auth/sessions - List all active sessions for current user
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    let userId: string;
    try {
      userId = await requireAuthApi();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: {
          gt: new Date(),
        },
        isValid: true,
      },
      orderBy: {
        lastActive: 'desc',
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceId: true,
        createdAt: true,
        lastActive: true,
        expires: true,
        sessionToken: true,
      },
    });

    // Get current session token to mark it
    const currentSessionToken = request.cookies.get('session-token')?.value;
    let currentSessionId: string | null = null;

    if (currentSessionToken) {
      // Session tokens in DB are already hashed, so we need to compare with the hashed version
      // But requireAuthApi already validated our session, so we can get the session ID from there
      const currentSession = await prisma.session.findUnique({
        where: { sessionToken: currentSessionToken },
        select: { id: true },
      });
      currentSessionId = currentSession?.id || null;
    }

    // Format sessions with parsed device info
    const formattedSessions = sessions.map((session) => {
      let deviceInfo = {
        browser: 'Unknown',
        os: 'Unknown',
        device: 'Desktop',
      };

      if (session.userAgent) {
        const parser = new UAParser(session.userAgent);
        const result = parser.getResult();

        deviceInfo = {
          browser: result.browser.name || 'Unknown',
          os: result.os.name || 'Unknown',
          device: result.device.type
            ? result.device.type.charAt(0).toUpperCase() +
              result.device.type.slice(1)
            : 'Desktop',
        };
      }

      return {
        id: session.id,
        ipAddress: session.ipAddress,
        deviceId: session.deviceId,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActive,
        expiresAt: session.expires,
        isCurrent: session.id === currentSessionId,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        deviceType: deviceInfo.device,
      };
    });

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length,
    });
  } catch (error) {
    console.error('Get sessions error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while fetching sessions',
      },
      { status: 500 }
    );
  }
}
