import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { revokeSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/auth/audit-log';
import { requireAuthApi } from '@/lib/auth/server-session';

// DELETE /api/auth/sessions/[sessionId] - Revoke a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Derive user ID from the validated session cookie only
    const userId = await requireAuthApi();

    // Get request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    const { sessionId } = await params;

    // Verify session belongs to user
    const session = await prisma.sessions.findUnique({
      where: { id: sessionId },
      select: {
        userId: true,
        sessionToken: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to revoke this session',
        },
        { status: 403 }
      );
    }

    // Revoke session
    await revokeSession(session.sessionToken);

    // Create audit log
    await createAuditLog({
      userId,
      action: 'logout',
      details: { sessionId, type: 'single_session_revoked' },
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    console.error('Revoke session error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while revoking session',
      },
      { status: 500 }
    );
  }
}
