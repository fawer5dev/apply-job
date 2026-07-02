import { NextRequest, NextResponse } from 'next/server';
import { generateCVPDF } from '@/lib/pdf/generator';
import { prisma } from '@/lib/db/prisma';
import { requireAuthApi } from '@/lib/auth/server-session';
import type { CV } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuthApi();
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

    // Get application, enforcing ownership
    const application = await prisma.applications.findUnique({
      where: { id: applicationId, userId },
      include: {
        job_listings: true,
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
        'Content-Disposition': `attachment; filename="CV_${application.job_listings.company}_${application.job_listings.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error generating PDF',
      },
      { status: 500 }
    );
  }
}
