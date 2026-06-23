import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCustomCV } from '@/lib/ai/cv-generator';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';
import { requireAuthApi } from '@/lib/auth/server-session';
import { AIError } from '@/lib/ai/errors';
import type { CV, JobListing } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await requireAuthApi();

    const body = await request.json();
    const { baseCVId, jobListingId, tone = 'professional' } = body;

    if (!baseCVId || !jobListingId) {
      return NextResponse.json(
        { error: 'Base CV ID and Job Listing ID are required' },
        { status: 400 }
      );
    }

    // Get base CV and job listing
    const [baseCV, jobListing] = await Promise.all([
      prisma.base_cvs.findUnique({ where: { id: baseCVId } }),
      prisma.job_listings.findUnique({ where: { id: jobListingId } }),
    ]);

    if (!baseCV || !jobListing) {
      return NextResponse.json(
        { error: 'Base CV or Job listing not found' },
        { status: 404 }
      );
    }

    console.log('Generating custom CV with AI...');

    // Convert Prisma data to CV type
    const cvData: CV = {
      personalInfo: baseCV.personalInfo as never,
      summary: baseCV.summary || undefined,
      experience: baseCV.experience as never,
      education: baseCV.education as never,
      skills: baseCV.skills as never,
      projects: (baseCV.projects as never) || undefined,
      certifications: (baseCV.certifications as never) || undefined,
    };

    const jobData: JobListing = {
      title: jobListing.title,
      company: jobListing.company,
      location: jobListing.location || undefined,
      workMode:
        (jobListing.workMode as 'remote' | 'hybrid' | 'onsite') || undefined,
      salary: jobListing.salary || undefined,
      description: jobListing.description,
      keywords: jobListing.keywords as never,
      requirements: jobListing.requirements as never,
      url: jobListing.url || undefined,
      source: jobListing.source || undefined,
    };

    // Generate custom CV and Cover Letter in parallel
    const [customCV, coverLetter] = await Promise.all([
      generateCustomCV(cvData, jobData),
      generateCoverLetter(cvData, jobData, tone),
    ]);

    console.log('Saving application to database...');

    // Use Prisma transaction for atomic operations
    // This also prevents sequential awaits by executing both operations together
    // Increase timeout to 15 seconds to handle large data inserts
    const application = await prisma.$transaction(
      async (tx: any) => {
        // Create cover letter
        const coverLetterId = `cl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const coverLetterRecord = await tx.cover_letters.create({
          data: {
            id: coverLetterId,
            userId,
            content: coverLetter.content,
            htmlContent: coverLetter.htmlContent || null,
            tone,
            updatedAt: new Date(),
          },
        });

        // Create application with cover letter ID
        const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        return await tx.applications.create({
          data: {
            id: applicationId,
            userId,
            baseCVId,
            jobListingId,
            customCV: customCV as never,
            atsScore: customCV.atsOptimizations?.matchScore || null,
            atsAnalysis: {
              keywordsAdded: customCV.atsOptimizations?.keywordsAdded || [],
              sectionsReordered:
                customCV.atsOptimizations?.sectionsReordered || [],
            } as never,
            matchScore: customCV.atsOptimizations?.matchScore || null,
            status: 'DRAFT',
            coverLetterId: coverLetterRecord.id,
            updatedAt: new Date(),
          },
          include: {
            cover_letters: true,
            job_listings: true,
            base_cvs: {
              select: {
                title: true,
              },
            },
          },
        });
      },
      {
        maxWait: 15000, // Maximum time to wait for a transaction slot (15s)
        timeout: 15000, // Maximum time the transaction can run (15s)
      }
    );

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        customCV: application.customCV,
        cover_letters: application.cover_letters,
        atsScore: application.atsScore,
        matchScore: application.matchScore,
        job_listings: {
          title: application.job_listings.title,
          company: application.job_listings.company,
        },
      },
    });
  } catch (error) {
    console.error('Error generating application:', error);
    if (error instanceof AIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          errorCode: error.code,
          isRetryable: error.isRetryable,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Error generating application',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'AI_UNKNOWN',
        isRetryable: false,
      },
      { status: 500 }
    );
  }
}

// GET - Get user applications
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await requireAuthApi();

    const applications = await prisma.applications.findMany({
      where: { userId },
      include: {
        job_listings: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
        base_cvs: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Error fetching applications' },
      { status: 500 }
    );
  }
}
