import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/audit-log';
import { clearSessionCookie, getSessionToken } from '@/lib/auth/server-session';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = await getSessionToken();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No active session' },
        { status: 401 }
      );
    }

    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Get user ID from session before revoking
    const userId = request.headers.get('x-user-id');

    // Hash token before revoking
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    // Revoke session
    await revokeSession(tokenHash);

    // Create audit log
    if (userId) {
      await createAuditLog({
        userId,
        action: 'logout',
        details: {},
        ipAddress: ip,
        userAgent,
        success: true,
      });
    }

    // Create response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
