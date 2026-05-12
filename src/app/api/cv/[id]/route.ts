import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'CV ID required' }, { status: 400 });
    }

    // Check if CV exists
    const cv = await prisma.baseCV.findUnique({
      where: { id },
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
    await prisma.baseCV.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'CV deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CV:', error);
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
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'CV ID required' }, { status: 400 });
    }

    const cv = await prisma.baseCV.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            createdAt: true,
            jobListing: {
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
    return NextResponse.json(
      {
        error: 'Error fetching CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
