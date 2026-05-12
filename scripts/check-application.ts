import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkApplication() {
  try {
    // Find the "Junior IT Service Desk Engineer" application
    const application = await prisma.application.findFirst({
      where: {
        jobListing: {
          title: {
            contains: 'Junior IT Service Desk Engineer',
          },
        },
      },
      include: {
        jobListing: true,
        baseCV: true,
      },
    });

    if (!application) {
      console.log('Application not found');
      return;
    }

    console.log('Application ID:', application.id);
    console.log('Job Title:', application.jobListing.title);
    console.log('\n--- Custom CV Data ---');
    console.log('Education in customCV:', (application.customCV as any)?.education);
    console.log('\nFull customCV:', JSON.stringify(application.customCV, null, 2));
    
    console.log('\n--- Base CV Data ---');
    console.log('Education in baseCV:', (application.baseCV.data as any)?.education);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApplication();
