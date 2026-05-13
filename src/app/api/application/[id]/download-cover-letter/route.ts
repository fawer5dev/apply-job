import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCoverLetterPDF } from '@/lib/pdf/generator';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get the application with cover letter
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        coverLetter: true,
        jobListing: {
          select: {
            title: true,
            company: true,
          },
        },
        user: {
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

    if (!application.coverLetter) {
      return NextResponse.json(
        { error: 'No cover letter found' },
        { status: 404 }
      );
    }

    // Generate PDF
    console.log('Generating cover letter PDF...');
    const pdfBuffer = await generateCoverLetterPDF(
      application.coverLetter.content,
      application.coverLetter.htmlContent || undefined
    );

    // Generate filename
    const companyName = application.jobListing.company.replace(/\s+/g, '_');
    const filename = `Fawer_Vargas_CL_${companyName}.pdf`;

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
