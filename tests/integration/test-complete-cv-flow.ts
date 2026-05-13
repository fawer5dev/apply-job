/**
 * Complete flow test: Create Base CV → Create Job → Generate Application
 *
 * This script tests the complete application flow:
 * 1. Load and parse a CV from PDF file
 * 2. Create a Base CV in the database
 * 3. Create a job listing (Job Listing)
 * 4. Generate a personalized application (Application)
 *
 * Run: pnpm tsx tests/integration/test-complete-cv-flow.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import fs from 'fs';
import { parseCV } from '../src/lib/cv/parser';
import { prisma } from '../src/lib/db/prisma';
import { generateCustomCV } from '../src/lib/ai/cv-generator';
import { generateCoverLetter } from '../src/lib/ai/cover-letter-generator';
import type { CV, JobListing } from '../src/types';

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

async function testCompleteFlow() {
  const startTime = Date.now();

  log('\n🚀 STARTING COMPLETE APPLICATION FLOW TEST', 'bright');
  log(
    'This process may take 30-60 seconds due to AI calls\n',
    'yellow'
  );

  let baseCVId: string;
  let jobListingId: string;
  let applicationId: string;
  let testUserId: string;

  try {
    // ====================================================
    // STEP 0: CREATE TEST USER
    // ====================================================
    printSection('STEP 0: CREATE TEST USER');

    log('👤 Creating temporary user for test...', 'blue');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
      },
    });
    testUserId = testUser.id;
    log(`✅ Test user created with ID: ${testUserId}`, 'green');

    // ====================================================
    // STEP 1: LOAD AND PARSE CV
    // ====================================================
    printSection('STEP 1: LOAD AND PARSE CV');

    const filePath = path.join(process.cwd(), 'files', 'FawerV-CV.pdf');

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found: ' + filePath);
    }

    log('📄 Reading PDF file...', 'blue');
    const buffer = fs.readFileSync(filePath);
    const fileSize = (buffer.length / 1024).toFixed(2);
    log(`✅ File read: ${fileSize} KB`, 'green');

    log('📤 Creating File object...', 'blue');
    const file = new File([buffer], 'FawerV-CV.pdf', {
      type: 'application/pdf',
    });
    log(`✅ File created: ${file.name} (${file.type})`, 'green');

    log('🤖 Parsing CV with AI (10-30 seconds)...', 'blue');
    const parseStartTime = Date.now();
    const parsedCV = await parseCV(file);
    const parseDuration = ((Date.now() - parseStartTime) / 1000).toFixed(2);
    log(`✅ CV parsed successfully in ${parseDuration}s`, 'green');

    printSubSection('Information extracted from CV:');
    log(`   Name: ${parsedCV.personalInfo.name}`);
    log(`   Email: ${parsedCV.personalInfo.email}`);
    log(`   Experience entries: ${parsedCV.experience.length}`);
    log(`   Education entries: ${parsedCV.education.length}`);
    log(`   Technical skills: ${parsedCV.skills.technical.length}`);
    log(`   Projects: ${parsedCV.projects?.length || 0}`);

    // ====================================================
    // STEP 2: CREATE BASE CV IN DATABASE
    // ====================================================
    printSection('STEP 2: SAVE BASE CV TO DATABASE');

    log('💾 Saving CV to PostgreSQL...', 'blue');
    const baseCV = await prisma.baseCV.create({
      data: {
        userId: testUserId,
        title: 'Professional CV - Test',
        personalInfo: parsedCV.personalInfo as never,
        summary: parsedCV.summary || null,
        experience: parsedCV.experience as never,
        education: parsedCV.education as never,
        skills: parsedCV.skills as never,
        projects: (parsedCV.projects || null) as never,
        certifications: (parsedCV.certifications || null) as never,
        rawText: parsedCV.rawText || null,
        isDefault: true,
      },
    });

    baseCVId = baseCV.id;
    log(`✅ Base CV created with ID: ${baseCVId}`, 'green');

    // ====================================================
    // STEP 3: CREATE JOB LISTING
    // ====================================================
    printSection('STEP 3: CREATE JOB LISTING');

    log('💼 Creating example job listing...', 'blue');
    const jobListing = await prisma.jobListing.create({
      data: {
        title: 'Senior Full Stack Developer',
        company: 'Tech Innovations Inc.',
        location: 'Remote',
        workMode: 'remote',
        salary: '$120,000 - $150,000',
        description: `
We are looking for a Senior Full Stack Developer to join our innovative team.

About the Role:
- Design and develop scalable web applications
- Work with React, Next.js, Node.js, and PostgreSQL
- Collaborate with cross-functional teams
- Mentor junior developers

Requirements:
- 5+ years of experience in full stack development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with PostgreSQL and Prisma
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Excellent problem-solving skills
- Strong communication skills

Nice to Have:
- Experience with AI/ML integrations
- Knowledge of DevOps practices
- Open source contributions
- Experience with Tailwind CSS and modern UI frameworks
        `,
        requirements: [
          '5+ years of full stack development',
          'React and TypeScript expertise',
          'Node.js and API development',
          'PostgreSQL and database design',
          'Cloud platform experience',
          'Agile methodologies',
        ] as never,
        keywords: {
          technical: [
            'React',
            'Next.js',
            'TypeScript',
            'Node.js',
            'PostgreSQL',
            'Prisma',
            'AWS',
            'Docker',
            'REST API',
            'GraphQL',
            'Tailwind CSS',
          ],
          soft: [
            'Communication',
            'Problem-solving',
            'Team collaboration',
            'Mentoring',
            'Leadership',
          ],
          tools: ['Git', 'GitHub', 'CI/CD', 'Jira', 'Figma'],
        } as never,
        url: 'https://example.com/jobs/senior-fullstack-developer',
        source: 'Manual - Test',
      },
    });

    jobListingId = jobListing.id;
    log(`✅ Job Listing created with ID: ${jobListingId}`, 'green');

    printSubSection('Job details:');
    log(`   Position: ${jobListing.title}`);
    log(`   Company: ${jobListing.company}`);
    log(`   Location: ${jobListing.location}`);
    log(`   Work mode: ${jobListing.workMode}`);
    log(`   Salary: ${jobListing.salary}`);

    // ====================================================
    // STEP 4: GENERATE PERSONALIZED APPLICATION
    // ====================================================
    printSection('STEP 4: GENERATE PERSONALIZED APPLICATION WITH AI');

    log(
      '🤖 Generating personalized CV and Cover Letter (30-60 seconds)...',
      'blue'
    );

    // Prepare data for generation
    const cvData: CV = {
      personalInfo: baseCV.personalInfo as never,
      summary: baseCV.summary || undefined,
      experience: baseCV.experience as never,
      education: baseCV.education as never,
      skills: baseCV.skills as never,
      projects: (baseCV.projects as never) || undefined,
      certifications: (baseCV.certifications as never) || undefined,
    };

    const jobData: JobListing = {
      title: jobListing.title,
      company: jobListing.company,
      location: jobListing.location || undefined,
      workMode: jobListing.workMode as 'remote' | 'hybrid' | 'onsite',
      salary: jobListing.salary || undefined,
      description: jobListing.description,
      keywords: jobListing.keywords as never,
      requirements: jobListing.requirements as never,
      url: jobListing.url || undefined,
      source: jobListing.source || undefined,
    };

    const genStartTime = Date.now();

    // Generate personalized CV and Cover Letter in parallel
    log('   → Generating personalized CV...', 'cyan');
    log('   → Generating Cover Letter...', 'cyan');

    const [customCV, coverLetter] = await Promise.all([
      generateCustomCV(cvData, jobData),
      generateCoverLetter(cvData, jobData, 'professional'),
    ]);

    const genDuration = ((Date.now() - genStartTime) / 1000).toFixed(2);
    log(`✅ Documents generated in ${genDuration}s`, 'green');

    // Create Cover Letter in DB
    log('💾 Saving Cover Letter to DB...', 'blue');
    const coverLetterRecord = await prisma.coverLetter.create({
      data: {
        userId: testUserId,
        content: coverLetter.content,
        htmlContent: coverLetter.htmlContent || null,
        tone: 'professional',
      },
    });
    log(`✅ Cover Letter saved with ID: ${coverLetterRecord.id}`, 'green');

    // Create Application
    log('💾 Saving Application to DB...', 'blue');
    const application = await prisma.application.create({
      data: {
        userId: testUserId,
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
    printSection('✨ COMPLETE TEST RESULTS');

    printSubSection('Generated IDs:');
    log(`   Base CV ID:        ${baseCVId}`);
    log(`   Job Listing ID:    ${jobListingId}`);
    log(`   Cover Letter ID:   ${coverLetterRecord.id}`);
    log(`   Application ID:    ${applicationId}`);

    printSubSection('ATS Score and Match:');
    log(
      `   ATS Score:         ${application.atsScore?.toFixed(1) || 'N/A'}%`,
      application.atsScore && application.atsScore > 80 ? 'green' : 'yellow'
    );
    log(
      `   Match Score:       ${application.matchScore?.toFixed(1) || 'N/A'}%`,
      application.matchScore && application.matchScore > 80 ? 'green' : 'yellow'
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
        log(
          `   • ${customCV.atsOptimizations.keywordsAdded.slice(0, 5).join(', ')}`,
          'cyan'
        );
      }
      log(
        `   Sections reordered: ${customCV.atsOptimizations.sectionsReordered?.length || 0}`
      );
    }

    printSubSection('Cover Letter Preview:');
    const coverPreview = coverLetter.content.substring(0, 300);
    log(`   ${coverPreview}...`, 'cyan');

    printSubSection('Processing Times:');
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`   Parse CV:          ${parseDuration}s`);
    log(`   Generate docs:      ${genDuration}s`);
    log(`   Total time:      ${totalTime}s`);

    printSection('🎉 TEST COMPLETED SUCCESSFULLY');
    log('All flow components worked correctly\n', 'green');

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
    // Cleanup: Delete test data
    log('\n🧹 Cleaning up test data...', 'yellow');

    try {
      if (applicationId!) {
        await prisma.application.delete({ where: { id: applicationId } });
        log('   ✓ Application deleted', 'yellow');
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    try {
      if (baseCVId!) {
        await prisma.baseCV.delete({ where: { id: baseCVId } });
        log('   ✓ Base CV deleted', 'yellow');
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    try {
      if (jobListingId!) {
        await prisma.jobListing.delete({ where: { id: jobListingId } });
        log('   ✓ Job Listing deleted', 'yellow');
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    try {
      if (testUserId!) {
        await prisma.user.delete({ where: { id: testUserId } });
        log('   ✓ Test user deleted', 'yellow');
      }
    } catch (e) {
      // Ignore cleanup errors
    }

    await prisma.$disconnect();
    log('   ✓ DB connection closed\n', 'yellow');
  }
}

// Run the test
if (require.main === module) {
  testCompleteFlow()
    .then(() => {
      log('✅ All tests passed!', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log(`❌ Test failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

export { testCompleteFlow };
