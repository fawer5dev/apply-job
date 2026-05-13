/**
 * Test for complete New Application flow
 * Simulates the process done by the user interface
 *
 * Flow:
 * 1. Get user's CVs
 * 2. Analyze job listing (create Job Listing)
 * 3. Generate application (Personalized CV + Cover Letter)
 *
 * Run: pnpm tsx tests/integration/test-new-application.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { prisma } from '../src/lib/db/prisma';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printSection(title: string) {
  console.log('\n');
  log('═'.repeat(70), 'cyan');
  log(`  ${title}`, 'bright');
  log('═'.repeat(70), 'cyan');
}

function printSubSection(title: string) {
  console.log('');
  log(`─── ${title}`, 'blue');
}

async function testNewApplicationFlow() {
  const startTime = Date.now();

  log('\n🚀 STARTING NEW APPLICATION FLOW TEST', 'bright');
  log('Simulating the complete process done by the UI\n', 'yellow');

  let baseCVId: string;
  let jobListingId: string;
  let applicationId: string;
  let userId = 'temp-user';

  try {
    // ====================================================
    // STEP 1: GET USER'S CVs
    // ====================================================
    printSection('STEP 1: GET USER CVs');

    log('📋 Looking for existing user CVs...', 'blue');
    const baseCVs = await prisma.baseCV.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        personalInfo: true,
        createdAt: true,
      },
    });

    if (baseCVs.length === 0) {
      log('❌ No CVs found for user', 'red');
      log(
        '💡 Run first: pnpm tsx tests/integration/test-complete-cv-flow.ts',
        'yellow'
      );
      log(
        '   Or upload a CV from: http://localhost:3000/en/test-upload\n',
        'yellow'
      );
      return;
    }

    log(`✅ Found ${baseCVs.length} CV(s)`, 'green');
    baseCVs.forEach((cv, index) => {
      const personalInfo = cv.personalInfo as any;
      log(
        `   ${index + 1}. ${cv.title} - ${personalInfo.name || 'No name'}`
      );
    });

    // Use the first CV found
    baseCVId = baseCVs[0].id;
    log(`\n✅ Using CV: ${baseCVs[0].title} (ID: ${baseCVId})`, 'green');

    // ====================================================
    // STEP 2: ANALYZE JOB LISTING
    // ====================================================
    printSection('STEP 2: ANALYZE JOB LISTING');

    const jobData = {
      title: 'Senior Full Stack Developer',
      company: 'Tech Innovations Inc.',
      location: 'Remote',
      workMode: 'remote',
      salary: '$120,000 - $150,000',
      description: `
We are looking for a Senior Full Stack Developer to join our innovative team.

About the Role:
- Design and develop scalable web applications using React, Next.js, and Node.js
- Work with PostgreSQL and modern databases
- Collaborate with cross-functional teams
- Mentor junior developers
- Implement best practices and code reviews

Requirements:
- 5+ years of experience in full stack development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with PostgreSQL, Prisma ORM
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Excellent problem-solving and communication skills
- Experience with Agile methodologies

Nice to Have:
- Experience with AI/ML integrations
- Knowledge of DevOps practices (Docker, CI/CD)
- Open source contributions
- Experience with modern UI frameworks (Tailwind CSS, shadcn/ui)

Benefits:
- Competitive salary and equity
- Remote-first culture
- Health insurance
- Professional development budget
- Latest tech equipment
      `,
      url: 'https://example.com/jobs/senior-fullstack-developer',
    };

    log('💼 Job listing data:', 'blue');
    log(`   Position: ${jobData.title}`);
    log(`   Company: ${jobData.company}`);
    log(`   Location: ${jobData.location}`);
    log(`   Work mode: ${jobData.workMode}`);
    log(`   Salary: ${jobData.salary}`);

    log('\n🤖 Analyzing listing with AI (10-20 seconds)...', 'blue');
    const analyzeStartTime = Date.now();

    // Import analysis function
    const { analyzeJobDescription } =
      await import('../src/lib/ai/job-analyzer');

    const analyzedJob = await analyzeJobDescription(
      jobData.description,
      jobData.title,
      jobData.company
    );

    const analyzeDuration = ((Date.now() - analyzeStartTime) / 1000).toFixed(2);
    log(`✅ Analysis completed in ${analyzeDuration}s`, 'green');

    // Create Job Listing in database
    log('\n💾 Saving Job Listing to database...', 'blue');
    const jobListing = await prisma.jobListing.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        workMode: jobData.workMode,
        salary: jobData.salary,
        description: jobData.description,
        requirements: analyzedJob.requirements as never,
        keywords: analyzedJob.keywords as never,
        url: jobData.url,
        source: 'Manual - Test',
      },
    });

    jobListingId = jobListing.id;
    log(`✅ Job Listing created with ID: ${jobListingId}`, 'green');

    printSubSection('Job Analysis:');
    log(`   Technical keywords: ${analyzedJob.keywords.technical.length}`);
    log(`   Soft skills keywords: ${analyzedJob.keywords.soft.length}`);
    log(`   Requirements: ${analyzedJob.requirements.length}`);

    if (analyzedJob.keywords.technical.length > 0) {
      log(`\n   Top 5 technical keywords:`, 'cyan');
      analyzedJob.keywords.technical.slice(0, 5).forEach((kw: string) => {
        log(`     • ${kw}`, 'cyan');
      });
    }

    // ====================================================
    // STEP 3: GENERATE APPLICATION
    // ====================================================
    printSection('STEP 3: GENERATE APPLICATION WITH AI');

    log(
      '🤖 Generating personalized CV and Cover Letter (20-40 seconds)...',
      'blue'
    );
    log('   → Getting base CV data...', 'cyan');

    // Get complete base CV
    const baseCV = await prisma.baseCV.findUnique({
      where: { id: baseCVId },
    });

    if (!baseCV) {
      throw new Error('Base CV not found');
    }

    log('   → Preparing data for generation...', 'cyan');

    // Prepare data in correct format
    const cvData = {
      personalInfo: baseCV.personalInfo as any,
      summary: baseCV.summary || undefined,
      experience: baseCV.experience as any,
      education: baseCV.education as any,
      skills: baseCV.skills as any,
      projects: (baseCV.projects as any) || undefined,
      certifications: (baseCV.certifications as any) || undefined,
    };

    const jobDataForGeneration = {
      title: jobListing.title,
      company: jobListing.company,
      location: jobListing.location || undefined,
      workMode: jobListing.workMode as 'remote' | 'hybrid' | 'onsite',
      salary: jobListing.salary || undefined,
      description: jobListing.description,
      keywords: jobListing.keywords as any,
      requirements: jobListing.requirements as any,
      url: jobListing.url || undefined,
      source: jobListing.source || undefined,
    };

    const genStartTime = Date.now();

    log('   → Generating personalized CV...', 'cyan');
    log('   → Generating Cover Letter...', 'cyan');

    // Import generation functions
    const { generateCustomCV } = await import('../src/lib/ai/cv-generator');
    const { generateCoverLetter } =
      await import('../src/lib/ai/cover-letter-generator');

    // Generate both documents in parallel
    const [customCV, coverLetter] = await Promise.all([
      generateCustomCV(cvData, jobDataForGeneration),
      generateCoverLetter(cvData, jobDataForGeneration, 'professional'),
    ]);

    const genDuration = ((Date.now() - genStartTime) / 1000).toFixed(2);
    log(`✅ Documents generated in ${genDuration}s`, 'green');

    // Create Cover Letter in DB
    log('\n💾 Saving Cover Letter...', 'blue');
    const coverLetterRecord = await prisma.coverLetter.create({
      data: {
        userId: userId,
        content: coverLetter.content,
        htmlContent: coverLetter.htmlContent || null,
        tone: 'professional',
      },
    });
    log(`✅ Cover Letter saved with ID: ${coverLetterRecord.id}`, 'green');

    // Create Application
    log('💾 Saving Application...', 'blue');
    const application = await prisma.application.create({
      data: {
        userId: userId,
        baseCVId: baseCVId,
        jobListingId: jobListingId,
        customCV: customCV as never,
        atsScore: customCV.atsOptimizations?.matchScore || null,
        atsAnalysis: {
          keywordsAdded: customCV.atsOptimizations?.keywordsAdded || [],
          sectionsReordered: customCV.atsOptimizations?.sectionsReordered || [],
        } as never,
        matchScore: customCV.atsOptimizations?.matchScore || null,
        status: 'DRAFT',
        coverLetterId: coverLetterRecord.id,
      },
    });

    applicationId = application.id;
    log(`✅ Application created with ID: ${applicationId}`, 'green');

    // ====================================================
    // FINAL RESULTS
    // ====================================================
    printSection('✨ TEST RESULTS');

    printSubSection('Generated IDs:');
    log(`   Base CV ID:        ${baseCVId}`);
    log(`   Job Listing ID:    ${jobListingId}`);
    log(`   Cover Letter ID:   ${coverLetterRecord.id}`);
    log(`   Application ID:    ${applicationId}`);

    printSubSection('Job Information:');
    log(`   Position:            ${jobListing.title}`);
    log(`   Company:           ${jobListing.company}`);
    log(`   Location:         ${jobListing.location}`);

    printSubSection('ATS Score and Match:');
    const atsColor =
      application.atsScore && application.atsScore > 80 ? 'green' : 'yellow';
    log(
      `   ATS Score:         ${application.atsScore?.toFixed(1) || 'N/A'}%`,
      atsColor
    );
    log(
      `   Match Score:       ${application.matchScore?.toFixed(1) || 'N/A'}%`,
      atsColor
    );

    if (customCV.atsOptimizations) {
      printSubSection('ATS Optimizations:');
      log(
        `   Keywords added:    ${customCV.atsOptimizations.keywordsAdded?.length || 0}`
      );
      if (
        customCV.atsOptimizations.keywordsAdded &&
        customCV.atsOptimizations.keywordsAdded.length > 0
      ) {
        const topKeywords = customCV.atsOptimizations.keywordsAdded.slice(0, 5);
        log(`   • ${topKeywords.join(', ')}`, 'cyan');
      }
      log(
        `   Sections reordered: ${customCV.atsOptimizations.sectionsReordered?.length || 0}`
      );
    }

    printSubSection('Cover Letter Preview:');
    const coverPreview = coverLetter.content.substring(0, 250);
    log(`   ${coverPreview}...`, 'cyan');

    printSubSection('Processing Times:');
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`   Job analysis:      ${analyzeDuration}s`);
    log(`   Generate docs:      ${genDuration}s`);
    log(`   Total time:      ${totalTime}s`);

    printSubSection('URLs to view results:');
    log(
      `   Dashboard:         http://localhost:3000/en/dashboard/applications`,
      'cyan'
    );
    log(
      `   This application:   http://localhost:3000/en/dashboard/applications/${applicationId}`,
      'cyan'
    );

    printSection('🎉 TEST COMPLETED SUCCESSFULLY');
    log('New Application flow worked correctly\n', 'green');
    log(
      '💡 Test data was kept in the database so you can view it in the UI',
      'yellow'
    );
    log('   To delete it manually, run:', 'yellow');
    log(`   DELETE FROM applications WHERE id = '${applicationId}';`, 'yellow');
    log(
      `   DELETE FROM job_listings WHERE id = '${jobListingId}';\n`,
      'yellow'
    );

    return {
      baseCVId,
      jobListingId,
      applicationId,
      atsScore: application.atsScore,
      matchScore: application.matchScore,
    };
  } catch (error) {
    printSection('❌ TEST ERROR');
    log(error instanceof Error ? error.message : String(error), 'red');
    if (error instanceof Error && error.stack) {
      console.log('\nStack trace:');
      console.log(error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
    log('✓ DB connection closed\n', 'yellow');
  }
}

// Run the test
if (require.main === module) {
  testNewApplicationFlow()
    .then(() => {
      log('✅ Test completed successfully!', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ Test failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

export { testNewApplicationFlow };
