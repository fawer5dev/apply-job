import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await prisma.users.upsert({
    where: { email: 'demo@applyjob.com' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'demo@applyjob.com',
      name: 'Demo User',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create CV templates
  const modernTemplate = await prisma.cv_templates.upsert({
    where: { id: 'modern-template' },
    update: {},
    create: {
      id: 'modern-template',
      name: 'Modern',
      description: 'Clean and modern design with Space Grotesk font',
      htmlContent: '<html><!-- Template HTML --></html>',
      isPublic: true,
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created CV templates');
  console.log('🎉 Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
