import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCustomCV } from '@/lib/ai/cv-generator';
import { scoreCV } from '@/lib/ai/ats-scorer';
import type { CV, JobListing } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { baseCVId, jobListingId, userId } = await req.json();

    if (!baseCVId || !jobListingId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
        },
        { status: 400 }
      );
    }

    // Get base CV and job listing
    const [baseCV, jobListing] = await Promise.all([
      prisma.baseCV.findUnique({
        where: { id: baseCVId },
      }),
      prisma.jobListing.findUnique({
        where: { id: jobListingId },
      }),
    ]);

    if (!baseCV || !jobListing) {
      return NextResponse.json(
        {
          success: false,
          error: 'CV or job offer not found',
        },
        { status: 404 }
      );
    }

    // Prepare data for AI
    const cvData = {
      personalInfo: baseCV.personalInfo,
      summary: baseCV.summary || undefined,
      experience: baseCV.experience,
      education: baseCV.education,
      skills: baseCV.skills,
      projects: baseCV.projects || undefined,
      certifications: baseCV.certifications || undefined,
    } as unknown as CV;

    const jobData = {
      title: jobListing.title,
      company: jobListing.company,
      location: jobListing.location || undefined,
      workMode: jobListing.workMode as
        | 'remote'
        | 'hybrid'
        | 'onsite'
        | undefined,
      salary: jobListing.salary || undefined,
      description: jobListing.description,
      requirements: jobListing.requirements as any,
      keywords: jobListing.keywords as any,
      url: jobListing.url || undefined,
      source: jobListing.source || undefined,
    } as JobListing;

    // Generar CV personalizado
    const customCV = await generateCustomCV(cvData, jobData);

    // Calcular ATS score
    const atsAnalysis = await scoreCV(customCV, jobData);

    // Crear application
    const application = await prisma.application.create({
      data: {
        userId,
        baseCVId,
        jobListingId,
        customCV: customCV as any,
        atsScore: atsAnalysis.score,
        atsAnalysis: atsAnalysis as any,
        matchScore: customCV.atsOptimizations.matchScore,
        status: 'DRAFT',
      },
      include: {
        jobListing: {
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
    console.error('Error generating CV:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error generating CV',
      },
      { status: 500 }
    );
  }
}
