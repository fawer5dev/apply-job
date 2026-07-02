import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthApi();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'CV ID required' }, { status: 400 });
    }

    // Check if CV exists and belongs to the current user
    const cv = await prisma.base_cvs.findUnique({
      where: { id, userId },
      include: {
        applications: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Check if CV is being used in any applications
    if (cv.applications && cv.applications.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete CV that is being used in applications',
          applicationsCount: cv.applications.length,
        },
        { status: 400 }
      );
    }

    // Delete the CV
    await prisma.base_cvs.delete({
      where: { id, userId },
    });

    return NextResponse.json({
      success: true,
      message: 'CV deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CV:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: 'Error deleting CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthApi();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'CV ID required' }, { status: 400 });
    }

    const cv = await prisma.base_cvs.findUnique({
      where: { id, userId },
      include: {
        applications: {
          select: {
            id: true,
            createdAt: true,
            job_listings: {
              select: {
                title: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    return NextResponse.json({ cv });
  } catch (error) {
    console.error('Error fetching CV:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: 'Error fetching CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
