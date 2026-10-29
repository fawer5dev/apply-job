import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { analyzeJobDescription } from '@/lib/ai/job-analyzer';
import { AIError } from '@/lib/ai/errors';
import { requireAuthApi } from '@/lib/auth/server-session';
import { checkAIRateLimit } from '@/lib/auth/rate-limit';

const MAX_JOB_DESCRIPTION_CHARS = 20_000;

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuthApi();
    const body = await req.json();

    // Validate basic data (without using schema for now)
    if (!body.title || !body.company || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, company and description are required',
        },
        { status: 400 }
      );
    }

    if (
      typeof body.description !== 'string' ||
      body.description.length > MAX_JOB_DESCRIPTION_CHARS
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Job description must be a text of at most ${MAX_JOB_DESCRIPTION_CHARS} characters`,
        },
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

    console.log('Analyzing job description with AI...');

    // Analyze job description with AI
    const analysis = await analyzeJobDescription(
      body.description,
      String(body.title).slice(0, 200),
      String(body.company).slice(0, 200)
    );

    // Create job listing in DB
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const jobListing = await prisma.job_listings.create({
      data: {
        id: jobId,
        title: body.title,
        company: body.company,
        location: body.location || null,
        workMode: body.workMode || null,
        salary: body.salary || null,
        description: body.description,
        url: body.url || null,
        source: body.source || 'Manual',
        requirements: analysis.requirements as never,
        keywords: analysis.keywords as never,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      job_listings: {
        id: jobListing.id,
        title: jobListing.title,
        company: jobListing.company,
        location: jobListing.location,
        workMode: jobListing.workMode,
        description: jobListing.description,
        keywords: jobListing.keywords,
        requirements: jobListing.requirements,
      },
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing job:', error);
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
        error:
          error instanceof Error ? error.message : 'Error analyzing job offer',
        errorCode: 'AI_UNKNOWN',
        isRetryable: false,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await requireAuthApi();
    const jobListings = await prisma.job_listings.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: jobListings,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Error fetching job offers',
      },
      { status: 500 }
    );
  }
}
