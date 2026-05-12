import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { analyzeJobDescription } from '@/lib/ai/job-analyzer';

export async function POST(req: NextRequest) {
  try {
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

    console.log('Analyzing job description with AI...');

    // Analyze job description with AI
    const analysis = await analyzeJobDescription(
      body.description,
      body.title,
      body.company
    );

    // Create job listing in DB
    const jobListing = await prisma.jobListing.create({
      data: {
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
      },
    });

    return NextResponse.json({
      success: true,
      jobListing: {
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
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error analyzing job offer',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const jobListings = await prisma.jobListing.findMany({
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
    return NextResponse.json(
      {
        success: false,
        error: 'Error fetching job offers',
      },
      { status: 500 }
    );
  }
}
