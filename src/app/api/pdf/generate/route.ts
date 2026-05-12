import { NextRequest, NextResponse } from 'next/server';
import { generateCVPDF } from '@/lib/pdf/generator';
import { prisma } from '@/lib/db/prisma';
import type { CV } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { applicationId, template } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application ID required',
        },
        { status: 400 }
      );
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        jobListing: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
        },
        { status: 404 }
      );
    }

    const cvData = application.customCV as unknown as CV;

    // Generate PDF
    const pdfBuffer = await generateCVPDF(cvData, template || 'modern');

    // In production, upload the PDF to S3/Vercel Blob
    // For now, return the PDF directly

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${application.jobListing.company}_${application.jobListing.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error generating PDF',
      },
      { status: 500 }
    );
  }
}
