import { NextRequest, NextResponse } from 'next/server';
import { parseCV } from '@/lib/cv/parser';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await requireAuthApi();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
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

    // Parse CV using OpenAI
    console.log('Parsing CV...');
    const parsedCV = await parseCV(file);

    // Save to database
    const baseCV = await prisma.baseCV.create({
      data: {
        userId,
        title,
        personalInfo: parsedCV.personalInfo as never,
        summary: parsedCV.summary || null,
        experience: parsedCV.experience as never,
        education: parsedCV.education as never,
        skills: parsedCV.skills as never,
        projects: (parsedCV.projects || null) as never,
        certifications: (parsedCV.certifications || null) as never,
        rawText: parsedCV.rawText || null,
      },
    });

    return NextResponse.json({
      success: true,
      baseCV: {
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
    console.error('Error processing CV:', error);
    return NextResponse.json(
      {
        error: 'Error processing CV',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Get user CVs
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user ID
    const userId = await requireAuthApi();

    const baseCVs = await prisma.baseCV.findMany({
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

    return NextResponse.json({ baseCVs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json({ error: 'Error fetching CVs' }, { status: 500 });
  }
}
