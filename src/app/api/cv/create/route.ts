import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { baseCVSchema, BaseCVInput } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthApi();

    const body = await request.json();
    const validation = baseCVSchema.safeParse(body);

    if (!validation.success) {
      console.error('Invalid CV data:', validation.error.flatten());
      return NextResponse.json(
        {
          error: 'Invalid CV data',
          details: validation.error.flatten(),
        },
        { status: 422 }
      );
    }

    const { title, ...cvData }: BaseCVInput = validation.data;

    const baseCVId = `cv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const baseCV = await prisma.base_cvs.create({
      data: {
        id: baseCVId,
        userId,
        title,
        personalInfo: cvData.personalInfo as never,
        summary: cvData.summary || null,
        experience: cvData.experience as never,
        education: cvData.education as never,
        skills: cvData.skills as never,
        projects: (cvData.projects || null) as never,
        certifications: (cvData.certifications || null) as never,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      base_cvs: {
        id: baseCV.id,
        title: baseCV.title,
        personalInfo: baseCV.personalInfo,
        summary: baseCV.summary,
        experience: baseCV.experience,
        education: baseCV.education,
        skills: baseCV.skills,
        projects: baseCV.projects,
        certifications: baseCV.certifications,
      },
    });
  } catch (error) {
    console.error('Error creating CV:', error);
    return NextResponse.json(
      {
        error: 'Error creating CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
