import { NextRequest, NextResponse } from 'next/server';
import { parseCV } from '@/lib/cv/parser';
import { requireAuthApi } from '@/lib/auth/server-session';
import { checkAIRateLimit } from '@/lib/auth/rate-limit';
import { AIError } from '@/lib/ai/errors';
import {
  CVInputError,
  checkUploadContentLength,
  readValidatedCVFile,
} from '@/lib/cv/file-validation';

// Parse a CV with AI without saving it. The extracted text is not returned.
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

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const { buffer, kind } = await readValidatedCVFile(file);

    const { cv: parsedCV, extractionMethod } = await parseCV(buffer, kind);

    return NextResponse.json({
      success: true,
      // 'visual' means the text was read from the PDF image by Gemini; the
      // client should ask the user to review the fields before saving.
      extractionMethod,
      cv: {
        personalInfo: parsedCV.personalInfo,
        summary: parsedCV.summary ?? null,
        experience: parsedCV.experience,
        education: parsedCV.education,
        skills: parsedCV.skills,
        projects: parsedCV.projects ?? null,
        certifications: parsedCV.certifications ?? null,
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

    console.error('Error parsing CV:', error);
    return NextResponse.json(
      { error: 'Error parsing CV' },
      { status: 500 }
    );
  }
}
