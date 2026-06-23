import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCoverLetterPDF } from '@/lib/pdf/generator';

const toTitleCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get the application with cover letter
    const application = await prisma.applications.findUnique({
      where: { id },
      include: {
        cover_letters: true,
        job_listings: {
          select: {
            title: true,
            company: true,
          },
        },
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (!application.cover_letters) {
      return NextResponse.json(
        { error: 'No cover letter found' },
        { status: 404 }
      );
    }

    // Extract candidate name from customCV
    const customCV = application.customCV as any;
    const candidateName = customCV?.personalInfo?.name || 'Candidate';

    // Generate PDF
    console.log('Generating cover letter PDF...');
    const pdfBuffer = await generateCoverLetterPDF(
      application.cover_letters.content,
      application.cover_letters.htmlContent || undefined,
      candidateName
    );

    // Generate filename
    const companyName = application.job_listings.company.replace(/\s+/g, '_');
    const candidateFileName = toTitleCase(candidateName).replace(/\s+/g, '_');
    const filename = `${candidateFileName}_cover-letter_${companyName}.pdf`;

    // Return PDF as Uint8Array
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    return NextResponse.json(
      {
        error: 'Error generating PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
