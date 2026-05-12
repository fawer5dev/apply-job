import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEducationToCV() {
  try {
    // Find the base CV for Fawer Vargas
    const cv = await prisma.baseCV.findFirst({
      where: {
        personalInfo: {
          path: ['name'],
          equals: 'FAWER VARGAS',
        },
      },
    });

    if (!cv) {
      console.error('CV not found');
      return;
    }

    console.log('Found CV:', cv.id);
    console.log('Current education:', cv.education);

    // Add education section
    const educationData = [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University of Melbourne',
        location: 'Melbourne, VIC',
        graduationDate: '2012',
        gpa: '3.8',
        description: 'Specialized in Software Engineering and Database Systems',
      },
    ];

    // Update the CV
    await prisma.baseCV.update({
      where: { id: cv.id },
      data: {
        education: educationData,
      },
    });

    console.log('Education section added successfully!');
    console.log('Updated education:', educationData);

    // Also update any applications using this CV
    const applications = await prisma.application.findMany({
      where: { baseCVId: cv.id },
    });

    console.log(`\nFound ${applications.length} application(s) using this CV`);

    for (const app of applications) {
      if (app.customCV) {
        const customCV = app.customCV as any;
        customCV.education = educationData;

        await prisma.application.update({
          where: { id: app.id },
          data: { customCV },
        });

        console.log(`Updated application: ${app.id}`);
      }
    }

    console.log('\n✅ All done! Education section has been added.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEducationToCV();
