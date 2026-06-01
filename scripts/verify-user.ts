import { prisma } from '../src/lib/db/prisma';

/**
 * Manually verify a user's email address
 * Usage: tsx scripts/verify-user.ts <email>
 */
async function verifyUser() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: tsx scripts/verify-user.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, emailVerified: true, name: true },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    if (user.emailVerified) {
      console.log(`✅ User ${email} is already verified at ${user.emailVerified}`);
      process.exit(0);
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        isActive: true,
      },
    });

    console.log(`✅ Successfully verified user: ${email}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   You can now log in!`);
  } catch (error) {
    console.error('❌ Error verifying user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();
