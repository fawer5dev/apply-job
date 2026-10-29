import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { AIError } from '@/lib/ai/errors';
import {
  FREE_PLAN_APPLICATION_LIMIT,
  canCreateApplication,
} from '@/lib/plans';
import { createAuditLog } from '@/lib/auth/audit-log';
import { checkAIRateLimit } from '@/lib/auth/rate-limit';
import {
  generateApplicationArtifacts,
  releaseApplicationSlot,
  reserveApplicationSlot,
  resolveLanguage,
  resolveTone,
  toCVData,
  toJobData,
} from '@/lib/applications/generate-application';

function limitReachedResponse(
  accountType: string | undefined,
  applicationsUsed: number
) {
  return NextResponse.json(
    {
      success: false,
      error: 'Free plan application limit reached',
      errorCode: 'APPLICATION_LIMIT_REACHED',
      details: {
        limit: FREE_PLAN_APPLICATION_LIMIT,
        current: applicationsUsed,
        accountType,
      },
      isRetryable: false,
    },
    { status: 402 }
  );
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let slotReserved = false;

  try {
    userId = await requireAuthApi();

    const body = await request.json();
    const { baseCVId, jobListingId } = body;
    const tone = resolveTone(body.tone);
    const language = resolveLanguage(body.language);

    if (!baseCVId || !jobListingId) {
      return NextResponse.json(
        { error: 'Base CV ID and Job Listing ID are required' },
        { status: 400 }
      );
    }

    const rateLimit = await checkAIRateLimit(userId, 'ai-generate');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many generation requests. Please try again later.',
          errorCode: 'AI_RATE_LIMITED',
          isRetryable: true,
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // Fast pre-check so free users get a clear message before any AI work.
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { accountType: true, applicationsUsed: true },
    });
    const applicationsUsed = user?.applicationsUsed ?? 0;
    if (!canCreateApplication(user?.accountType, applicationsUsed)) {
      await createAuditLog({
        userId,
        action: 'application_limit_reached',
        details: {
          limit: FREE_PLAN_APPLICATION_LIMIT,
          current: applicationsUsed,
          accountType: user?.accountType,
        },
        success: true,
      });
      return limitReachedResponse(user?.accountType, applicationsUsed);
    }

    const [baseCV, jobListing] = await Promise.all([
      prisma.base_cvs.findUnique({ where: { id: baseCVId, userId } }),
      prisma.job_listings.findUnique({ where: { id: jobListingId } }),
    ]);

    if (!baseCV || !jobListing) {
      return NextResponse.json(
        { error: 'Base CV or Job listing not found' },
        { status: 404 }
      );
    }

    // Atomic reservation: closes the race between the pre-check above and
    // concurrent requests. Released below if anything fails.
    slotReserved = await reserveApplicationSlot(userId);
    if (!slotReserved) {
      return limitReachedResponse(user?.accountType, applicationsUsed);
    }

    const artifacts = await generateApplicationArtifacts(
      toCVData(baseCV),
      toJobData(jobListing),
      { tone, language, includeCoverLetter: true }
    );

    const application = await prisma.$transaction(
      async (tx: any) => {
        const coverLetterRecord = await tx.cover_letters.create({
          data: {
            id: `cl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            userId,
            content: artifacts.coverLetterContent,
            tone,
            updatedAt: new Date(),
          },
        });

        return tx.applications.create({
          data: {
            id: `app_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            userId,
            baseCVId,
            jobListingId,
            customCV: artifacts.customCV as never,
            atsScore: artifacts.atsAnalysis?.score ?? null,
            atsAnalysis: (artifacts.atsAnalysis as never) ?? null,
            matchScore: artifacts.matchScore,
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
    if (slotReserved && userId) {
      await releaseApplicationSlot(userId);
    }

    console.error('Error generating application:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
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
        errorCode: 'AI_UNKNOWN',
        isRetryable: false,
      },
      { status: 500 }
    );
  }
}

// GET - Get user applications
export async function GET() {
  try {
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
