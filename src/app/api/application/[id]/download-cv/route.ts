import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateCVPDF } from '@/lib/pdf/generator';
import { requireAuthApi } from '@/lib/auth/server-session';
import type { CV } from '@/types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuthApi();
    const { id } = await context.params;

    // Get the application with custom CV, enforcing ownership
    const application = await prisma.applications.findUnique({
      where: { id, userId },
      select: {
        customCV: true,
        job_listings: {
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
    const companyName = application.job_listings.company.replace(/\s+/g, '_');
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: 'Error generating PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
