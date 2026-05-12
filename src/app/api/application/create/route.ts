import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCustomCV } from '@/lib/ai/cv-generator';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';
import type { CV, JobListing } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseCVId, jobListingId, userId, tone = 'professional' } = body;

    if (!baseCVId || !jobListingId) {
      return NextResponse.json(
        { error: 'Base CV ID and Job Listing ID are required' },
        { status: 400 }
      );
    }

    // Get base CV and job listing
    const [baseCV, jobListing] = await Promise.all([
      prisma.baseCV.findUnique({ where: { id: baseCVId } }),
      prisma.jobListing.findUnique({ where: { id: jobListingId } }),
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
      async (tx) => {
        // Create cover letter
        const coverLetterRecord = await tx.coverLetter.create({
          data: {
            userId: userId || 'temp-user',
            content: coverLetter.content,
            htmlContent: coverLetter.htmlContent || null,
            tone,
          },
        });

        // Create application with cover letter ID
        return await tx.application.create({
          data: {
            userId: userId || 'temp-user',
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
          },
          include: {
            coverLetter: true,
            jobListing: true,
            baseCV: {
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
        coverLetter: application.coverLetter,
        atsScore: application.atsScore,
        matchScore: application.matchScore,
        jobListing: {
          title: application.jobListing.title,
          company: application.jobListing.company,
        },
      },
    });
  } catch (error) {
    console.error('Error generating application:', error);
    return NextResponse.json(
      {
        error: 'Error generating application',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Get user applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'temp-user';

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        jobListing: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
        baseCV: {
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
