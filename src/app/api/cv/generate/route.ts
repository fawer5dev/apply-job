import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { checkAIRateLimit } from '@/lib/auth/rate-limit';
import { canCreateApplication, FREE_PLAN_APPLICATION_LIMIT } from '@/lib/plans';
import {
  generateApplicationArtifacts,
  releaseApplicationSlot,
  reserveApplicationSlot,
  resolveLanguage,
  toCVData,
  toJobData,
} from '@/lib/applications/generate-application';

export async function POST(req: NextRequest) {
  let userId: string | undefined;
  let slotReserved = false;

  try {
    userId = await requireAuthApi();
    const body = await req.json();
    const { baseCVId, jobListingId } = body;
    const language = resolveLanguage(body.language);

    if (!baseCVId || !jobListingId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
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
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // Same plan rules as /api/application/create.
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { accountType: true, applicationsUsed: true },
    });
    if (!canCreateApplication(user?.accountType, user?.applicationsUsed ?? 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Free plan application limit reached',
          errorCode: 'APPLICATION_LIMIT_REACHED',
          details: {
            limit: FREE_PLAN_APPLICATION_LIMIT,
            current: user?.applicationsUsed ?? 0,
            accountType: user?.accountType,
          },
        },
        { status: 402 }
      );
    }

    const [baseCV, jobListing] = await Promise.all([
      prisma.base_cvs.findUnique({ where: { id: baseCVId, userId } }),
      prisma.job_listings.findUnique({ where: { id: jobListingId } }),
    ]);

    if (!baseCV || !jobListing) {
      return NextResponse.json(
        { success: false, error: 'CV or job offer not found' },
        { status: 404 }
      );
    }

    slotReserved = await reserveApplicationSlot(userId);
    if (!slotReserved) {
      return NextResponse.json(
        {
          success: false,
          error: 'Free plan application limit reached',
          errorCode: 'APPLICATION_LIMIT_REACHED',
        },
        { status: 402 }
      );
    }

    const artifacts = await generateApplicationArtifacts(
      toCVData(baseCV),
      toJobData(jobListing),
      { tone: 'professional', language, includeCoverLetter: false }
    );

    const application = await prisma.applications.create({
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
        updatedAt: new Date(),
      },
      include: {
        job_listings: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (error) {
    if (slotReserved && userId) {
      await releaseApplicationSlot(userId);
    }

    console.error('Error generating CV:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Error generating CV' },
      { status: 500 }
    );
  }
}
