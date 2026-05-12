import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBaseCV() {
  try {
    const baseCV = await prisma.baseCV.findFirst({
      where: {
        personalInfo: {
          path: ['name'],
          equals: 'FAWER VARGAS',
        },
      },
    });

    if (!baseCV) {
      console.log('Base CV not found');
      return;
    }

    console.log('Base CV ID:', baseCV.id);
    console.log('\n--- Full Base CV Data ---');
    console.log(JSON.stringify(baseCV, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBaseCV();
