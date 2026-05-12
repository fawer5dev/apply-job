import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';
import { prisma } from '@/lib/db/prisma';
import type { CV, JobListing } from '@/types';

export async function POST(req: NextRequest) {
  try {
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

    // Get application with relations
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        baseCV: true,
        jobListing: true,
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
      personalInfo: application.baseCV.personalInfo,
      summary: application.baseCV.summary || undefined,
      experience: application.baseCV.experience,
      education: application.baseCV.education,
      skills: application.baseCV.skills,
    } as unknown as CV;

    const jobData = {
      title: application.jobListing.title,
      company: application.jobListing.company,
      location: application.jobListing.location || undefined,
      description: application.jobListing.description,
      requirements: application.jobListing.requirements as any,
      keywords: application.jobListing.keywords as any,
    } as JobListing;

    // Generate cover letter
    const coverLetterResult = await generateCoverLetter(
      cvData,
      jobData,
      tone || 'professional',
      additionalInfo
    );

    // Save cover letter
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: application.userId,
        content: coverLetterResult.content,
        htmlContent: coverLetterResult.htmlContent,
        tone: tone || 'professional',
      },
    });

    // Update application
    await prisma.application.update({
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
