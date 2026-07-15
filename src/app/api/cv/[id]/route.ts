import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { baseCVSchema, BaseCVInput } from '@/lib/utils/validation';

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthApi();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'CV ID required' }, { status: 400 });
    }

    const body = await request.json();
    const validation = baseCVSchema.safeParse(body);

    if (!validation.success) {
      console.error('Invalid CV data:', validation.error.flatten());
      return NextResponse.json(
        {
          error: 'Invalid CV data',
          details: validation.error.flatten(),
        },
        { status: 422 }
      );
    }

    const { title, ...cvData }: BaseCVInput = validation.data;

    // Verify the CV exists and belongs to the current user
    const existingCV = await prisma.base_cvs.findUnique({
      where: { id, userId },
    });

    if (!existingCV) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const updatedCV = await prisma.base_cvs.update({
      where: { id, userId },
      data: {
        title,
        personalInfo: cvData.personalInfo as never,
        summary: cvData.summary || null,
        experience: cvData.experience as never,
        education: cvData.education as never,
        skills: cvData.skills as never,
        projects: (cvData.projects || null) as never,
        certifications: (cvData.certifications || null) as never,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      cv: {
        id: updatedCV.id,
        title: updatedCV.title,
        personalInfo: updatedCV.personalInfo,
        summary: updatedCV.summary,
        experience: updatedCV.experience,
        education: updatedCV.education,
        skills: updatedCV.skills,
        projects: updatedCV.projects,
        certifications: updatedCV.certifications,
      },
    });
  } catch (error) {
    console.error('Error updating CV:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: 'Error updating CV',
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
