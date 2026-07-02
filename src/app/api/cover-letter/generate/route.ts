import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import type { CV, JobListing } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuthApi();
    const { applicationId, tone, additionalInfo } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID required',
        },
        { status: 400 }
      );
    }

    // Get application with relations, enforcing ownership
    const application = await prisma.applications.findUnique({
      where: { id: applicationId, userId },
      include: {
        base_cvs: true,
        job_listings: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
        },
        { status: 404 }
      );
    }

    // Prepare data
    const cvData = {
      personalInfo: application.base_cvs.personalInfo,
      summary: application.base_cvs.summary || undefined,
      experience: application.base_cvs.experience,
      education: application.base_cvs.education,
      skills: application.base_cvs.skills,
    } as unknown as CV;

    const jobData = {
      title: application.job_listings.title,
      company: application.job_listings.company,
      location: application.job_listings.location || undefined,
      description: application.job_listings.description,
      requirements: application.job_listings.requirements as any,
      keywords: application.job_listings.keywords as any,
    } as JobListing;

    // Generate cover letter
    const coverLetterResult = await generateCoverLetter(
      cvData,
      jobData,
      tone || 'professional',
      additionalInfo
    );

    // Save cover letter
    const coverLetterId = `cl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const coverLetter = await prisma.cover_letters.create({
      data: {
        id: coverLetterId,
        userId: application.userId,
        content: coverLetterResult.content,
        htmlContent: coverLetterResult.htmlContent,
        tone: tone || 'professional',
        updatedAt: new Date(),
      },
    });

    // Update application
    await prisma.applications.update({
      where: { id: applicationId },
      data: {
        coverLetterId: coverLetter.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: coverLetter,
    });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error generating cover letter',
      },
      { status: 500 }
    );
  }
}
