import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCVPDF } from '@/lib/pdf/generator';
import type { CV } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get the application with custom CV
    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        customCV: true,
        jobListing: {
          select: {
            title: true,
            company: true,
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

    if (!application.customCV) {
      return NextResponse.json({ error: 'No CV found' }, { status: 404 });
    }

    // Convert customCV to CV type
    const cv = application.customCV as unknown as CV;

    // Generate PDF
    console.log('Generating CV PDF...');
    const pdfBuffer = await generateCVPDF(cv);

    // Generate filename
    const companyName = application.jobListing.company.replace(/\s+/g, '_');
    const filename = `Fawer_Vargas_CV_${companyName}.pdf`;

    // Return PDF as Uint8Array
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating CV PDF:', error);
    return NextResponse.json(
      {
        error: 'Error generating PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
