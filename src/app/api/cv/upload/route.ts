import { NextRequest, NextResponse } from 'next/server';
import { parseCV } from '@/lib/cv/parser';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import { checkAIRateLimit } from '@/lib/auth/rate-limit';
import { AIError } from '@/lib/ai/errors';
import { baseCVSchema } from '@/lib/utils/validation';
import {
  CVInputError,
  checkUploadContentLength,
  readValidatedCVFile,
} from '@/lib/cv/file-validation';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthApi();

    const lengthError = checkUploadContentLength(request);
    if (lengthError) {
      return NextResponse.json(
        { error: lengthError.message, errorCode: lengthError.code },
        { status: lengthError.status }
      );
    }

    const rateLimit = await checkAIRateLimit(userId, 'ai-parse');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many CV parsing requests. Please try again later.',
          errorCode: 'AI_RATE_LIMITED',
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const { buffer, kind } = await readValidatedCVFile(file);

    const parsedCV = await parseCV(buffer, kind);

    // Validate parsed data before saving so incomplete AI responses
    // surface clear errors instead of corrupt DB records.
    const validation = baseCVSchema.safeParse({
      title: title.trim(),
      ...parsedCV,
    });

    if (!validation.success) {
      console.error('Invalid parsed CV data:', validation.error.flatten());
      return NextResponse.json(
        {
          error: 'AI parsed CV is incomplete or invalid',
          details: validation.error.flatten(),
        },
        { status: 422 }
      );
    }

    // Save to database. rawText is intentionally not stored: the structured
    // fields hold the CV content and the original file is not retained.
    const baseCV = await prisma.base_cvs.create({
      data: {
        id: `cv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId,
        title: validation.data.title,
        personalInfo: parsedCV.personalInfo as never,
        summary: parsedCV.summary || null,
        experience: parsedCV.experience as never,
        education: parsedCV.education as never,
        skills: parsedCV.skills as never,
        projects: (parsedCV.projects || null) as never,
        certifications: (parsedCV.certifications || null) as never,
        rawText: null,
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof CVInputError) {
      return NextResponse.json(
        { error: error.message, errorCode: error.code },
        { status: error.status }
      );
    }
    if (error instanceof AIError) {
      return NextResponse.json(
        {
          error: error.message,
          errorCode: error.code,
          isRetryable: error.isRetryable,
        },
        { status: 500 }
      );
    }

    console.error('Error processing CV:', error);
    return NextResponse.json(
      { error: 'Error processing CV' },
      { status: 500 }
    );
  }
}

// GET - Get user CVs
export async function GET() {
  try {
    const userId = await requireAuthApi();

    const base_cvs = await prisma.base_cvs.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        personalInfo: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        isDefault: true,
      },
    });

    return NextResponse.json({ base_cvs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json({ error: 'Error fetching CVs' }, { status: 500 });
  }
}
