import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - Get a specific application
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        job_listings: {
          select: {
            title: true,
            company: true,
            location: true,
            workMode: true,
            salary: true,
            description: true,
          },
        },
        base_cvs: {
          select: {
            title: true,
          },
        },
        cover_letters: {
          select: {
            content: true,
            htmlContent: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Error fetching application' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, notes } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    if (status === 'APPLIED' && !updateData.appliedAt) {
      updateData.appliedAt = new Date();
    }

    const application = await prisma.applications.update({
      where: { id },
      data: updateData,
      include: {
        job_listings: {
          select: {
            title: true,
            company: true,
            location: true,
            workMode: true,
            salary: true,
            description: true,
          },
        },
        base_cvs: {
          select: {
            title: true,
          },
        },
        cover_letters: {
          select: {
            content: true,
            htmlContent: true,
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Error updating application' },
      { status: 500 }
    );
  }
}

// DELETE - Delete application
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.applications.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Error deleting application' },
      { status: 500 }
    );
  }
}
