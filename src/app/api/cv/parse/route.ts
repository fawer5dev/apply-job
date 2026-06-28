import { NextRequest, NextResponse } from 'next/server';
import { parseCV } from '@/lib/cv/parser';
import { requireAuthApi } from '@/lib/auth/server-session';

export async function POST(request: NextRequest) {
  try {
    await requireAuthApi();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. Use PDF, DOCX or TXT.' },
        { status: 400 }
      );
    }

    // Parse CV using AI without saving to the database
    console.log('Parsing CV...');
    const parsedCV = await parseCV(file);

    return NextResponse.json({
      success: true,
      cv: {
        personalInfo: parsedCV.personalInfo,
        summary: parsedCV.summary ?? null,
        experience: parsedCV.experience,
        education: parsedCV.education,
        skills: parsedCV.skills,
        projects: parsedCV.projects ?? null,
        certifications: parsedCV.certifications ?? null,
        rawText: parsedCV.rawText ?? null,
      },
    });
  } catch (error) {
    console.error('Error parsing CV:', error);
    return NextResponse.json(
      {
        error: 'Error parsing CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
