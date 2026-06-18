import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { createAuditLog } from '@/lib/auth/audit-log';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuthApi();
    
    const body = await request.json();
    const validation = profileSchema.safeParse(body);

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

    const { name } = validation.data;

    const user = await prisma.users.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        twoFactorEnabled: true,
      },
    });

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    await createAuditLog({
      userId,
      action: 'profile_update',
      details: { name },
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while updating the profile.',
      },
      { status: 500 }
    );
  }
}
