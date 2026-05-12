import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { parseCV } from '../src/lib/cv/parser';
import { analyzeJobDescription } from '../src/lib/ai/job-analyzer';
import { generateCustomCV } from '../src/lib/ai/cv-generator';
import { generateCoverLetter } from '../src/lib/ai/cover-letter-generator';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Application Flow with Google AI\n');

  try {
    // Step 1: Parse CV
    console.log('📄 Step 1: Parsing CV from PDF...');
    const cvPath = path.join(process.cwd(), 'files', 'FawerV-CV.pdf');
    const cvBuffer = fs.readFileSync(cvPath);
    const cvFile = new File([cvBuffer], 'FawerV-CV.pdf', {
      type: 'application/pdf',
    });

    const parsedCV = await parseCV(cvFile);
    console.log('✅ CV parsed successfully');
    console.log(`   Name: ${parsedCV.personalInfo.name}`);
    console.log(
      `   Skills: ${parsedCV.skills.technical.slice(0, 5).join(', ')}`
    );
    console.log();

    // Step 2: Analyze Job Description
    console.log('💼 Step 2: Analyzing job description...');
    const jobDescription = `
We are looking for a Senior Full Stack Developer to join our team.

Requirements:
- 5+ years of experience with JavaScript/TypeScript
- Strong knowledge of React and Node.js
- Experience with PostgreSQL and MongoDB
- Familiarity with Docker and CI/CD
- Excellent problem-solving skills
- Strong communication skills

Nice to have:
- Experience with Next.js
- Knowledge of AWS or Google Cloud
- Previous experience in fintech

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews
    `;

    const jobAnalysis = await analyzeJobDescription(
      jobDescription,
      'Senior Full Stack Developer',
      'Tech Company Inc'
    );
    console.log('✅ Job analyzed successfully');
    const requiredSkills = jobAnalysis.requirements
      .filter((r) => r.category === 'required')
      .slice(0, 3)
      .map((r) => r.skill);
    console.log(`   Required skills: ${requiredSkills.join(', ')}`);
    console.log();

    // Step 3: Generate Custom CV
    console.log('📝 Step 3: Generating customized CV...');
    const jobListing = {
      title: 'Senior Full Stack Developer',
      company: 'Tech Company Inc',
      description: jobDescription,
      keywords: jobAnalysis.keywords,
      requirements: jobAnalysis.requirements,
      location: 'Remote',
      workMode: 'remote' as const,
    };

    const customCV = await generateCustomCV(parsedCV, jobListing);
    console.log('✅ Custom CV generated successfully');
    console.log(`   Match Score: ${customCV.atsOptimizations.matchScore}%`);
    console.log(
      `   Keywords Added: ${customCV.atsOptimizations.keywordsAdded.slice(0, 3).join(', ')}`
    );
    console.log();

    // Step 4: Generate Cover Letter
    console.log('✉️  Step 4: Generating cover letter...');
    const coverLetter = await generateCoverLetter(
      parsedCV,
      jobListing,
      'professional'
    );
    console.log('✅ Cover letter generated successfully');
    console.log(`   Length: ${coverLetter.content.length} characters`);
    console.log();

    // Summary
    console.log('🎉 Complete flow test successful!\n');
    console.log('Summary:');
    console.log('--------');
    console.log(`✅ CV parsed: ${parsedCV.personalInfo.name}`);
    console.log(
      `✅ Job analyzed: ${jobAnalysis.keywords.technical.length} technical keywords found`
    );
    console.log(
      `✅ Custom CV generated with ${customCV.atsOptimizations.matchScore}% match`
    );
    console.log(
      `✅ Cover letter generated (${coverLetter.content.length} chars)`
    );

    // Save results
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    fs.writeFileSync(
      path.join(resultsDir, 'complete-flow-test.json'),
      JSON.stringify(
        {
          parsedCV,
          jobAnalysis,
          customCV,
          coverLetter,
        },
        null,
        2
      )
    );
    console.log(`\n📁 Results saved to test-results/complete-flow-test.json`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testCompleteFlow();
