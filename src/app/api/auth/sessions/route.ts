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
    } catch (_error) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active sessions for user. Never expose sessionToken to the client.
    const sessions = await prisma.sessions.findMany({
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
      },
    });

    // Identify the current session by the most recently active valid session for this user.
    // requireAuthApi has already validated the cookie, so this is safe and avoids leaking hashes.
    const currentSession = await prisma.sessions.findFirst({
      where: {
        userId,
        isValid: true,
        expires: { gt: new Date() },
      },
      orderBy: { lastActive: 'desc' },
      select: { id: true },
    });
    const currentSessionId = currentSession?.id || null;

    // Format sessions with parsed device info
    const formattedSessions = sessions.map((session: any) => {
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
