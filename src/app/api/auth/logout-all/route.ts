import { NextRequest, NextResponse } from 'next/server';
import { revokeAllSessions } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/audit-log';
import { clearSessionCookie } from '@/lib/auth/server-session';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Revoke all sessions for user
    const revokedCount = await revokeAllSessions(userId);

    // Create audit log
    await createAuditLog({
      userId,
      action: 'logout_all',
      details: { revokedSessions: revokedCount },
      ipAddress: ip,
      userAgent,
      success: true,
    });

    // Create response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: `Logged out from ${revokedCount} device(s) successfully`,
      revokedCount,
    });

    response.headers.set('Set-Cookie', clearSessionCookie());

    return response;
  } catch (error) {
    console.error('Logout all error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
