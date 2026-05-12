import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllApplications() {
  try {
    console.log('🗑️  Starting deletion of all applications...\n');

    // Get count before deletion
    const applicationCount = await prisma.application.count();
    const coverLetterCount = await prisma.coverLetter.count();
    
    console.log(`Found ${applicationCount} applications`);
    console.log(`Found ${coverLetterCount} cover letters\n`);

    if (applicationCount === 0 && coverLetterCount === 0) {
      console.log('✅ No applications or cover letters to delete.');
      return;
    }

    // Delete all applications (will cascade delete relationships)
    const deletedApplications = await prisma.application.deleteMany({});
    console.log(`✅ Deleted ${deletedApplications.count} applications`);

    // Delete orphaned cover letters (if any)
    const deletedCoverLetters = await prisma.coverLetter.deleteMany({});
    console.log(`✅ Deleted ${deletedCoverLetters.count} cover letters`);

    // Delete all job listings (optional - uncomment if you want to delete jobs too)
    // const deletedJobs = await prisma.jobListing.deleteMany({});
    // console.log(`✅ Deleted ${deletedJobs.count} job listings`);

    console.log('\n✨ All applications have been deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting applications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllApplications()
  .then(() => {
    console.log('\n🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
