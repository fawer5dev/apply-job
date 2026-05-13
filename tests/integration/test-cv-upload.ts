/**
 * Test script to test the complete CV upload flow
 *
 * Run: pnpm tsx tests/integration/test-cv-upload.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import fs from 'fs';
import { parseCV } from '../src/lib/cv/parser';

async function testCVUpload() {
  console.log('🚀 Starting CV upload test...\n');

  try {
    // 1. Read the PDF file
    console.log('📄 Reading PDF file...');
    const filePath = path.join(process.cwd(), 'files', 'FawerV-CV.pdf');

    if (!fs.existsSync(filePath)) {
      throw new Error('File not found: ' + filePath);
    }

    const buffer = fs.readFileSync(filePath);
    const fileSize = (buffer.length / 1024).toFixed(2);
    console.log(`✅ File read: ${fileSize} KB\n`);

    // 2. Create File object to simulate upload
    console.log('📤 Creating File object...');
    const file = new File([buffer], 'FawerV-CV.pdf', {
      type: 'application/pdf',
    });
    console.log(`✅ File created: ${file.name} (${file.type})\n`);

    // 3. Parse CV with parser function
    console.log('🤖 Parsing CV with AI (this may take 10-30 seconds)...');
    const startTime = Date.now();

    const parsedCV = await parseCV(file);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ CV parsed successfully in ${duration} seconds\n`);

    // 4. Show results
    console.log('📊 PARSING RESULTS:\n');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n👤 PERSONAL INFORMATION:');
    console.log('─────────────────────────────────────');
    console.log(`Name: ${parsedCV.personalInfo.name}`);
    console.log(`Email: ${parsedCV.personalInfo.email}`);
    if (parsedCV.personalInfo.phone) {
      console.log(`Phone: ${parsedCV.personalInfo.phone}`);
    }
    if (parsedCV.personalInfo.location) {
      console.log(`Location: ${parsedCV.personalInfo.location}`);
    }
    if (parsedCV.personalInfo.linkedin) {
      console.log(`LinkedIn: ${parsedCV.personalInfo.linkedin}`);
    }
    if (parsedCV.personalInfo.github) {
      console.log(`GitHub: ${parsedCV.personalInfo.github}`);
    }

    if (parsedCV.summary) {
      console.log('\n📝 PROFESSIONAL SUMMARY:');
      console.log('─────────────────────────────────────');
      console.log(parsedCV.summary);
    }

    console.log('\n💼 EXPERIENCE:');
    console.log('─────────────────────────────────────');
    parsedCV.experience.forEach((exp, index) => {
      console.log(`\n${index + 1}. ${exp.title} at ${exp.company}`);
      console.log(`   Period: ${exp.dates}`);
      console.log(`   Achievements (${exp.bullets.length}):`);
      exp.bullets.forEach((bullet, i) => {
        console.log(
          `   • ${bullet.substring(0, 80)}${bullet.length > 80 ? '...' : ''}`
        );
      });
    });

    console.log('\n🎓 EDUCATION:');
    console.log('─────────────────────────────────────');
    parsedCV.education.forEach((edu, index) => {
      console.log(`\n${index + 1}. ${edu.degree}`);
      console.log(`   ${edu.institution}`);
      console.log(`   ${edu.dates}`);
      if (edu.details) {
        console.log(`   Details: ${edu.details}`);
      }
    });

    console.log('\n🛠️  SKILLS:');
    console.log('─────────────────────────────────────');
    if (parsedCV.skills.technical.length > 0) {
      console.log(`\nTechnical (${parsedCV.skills.technical.length}):`);
      console.log(parsedCV.skills.technical.join(', '));
    }
    if (parsedCV.skills.soft && parsedCV.skills.soft.length > 0) {
      console.log(`\nSoft Skills (${parsedCV.skills.soft.length}):`);
      console.log(parsedCV.skills.soft.join(', '));
    }
    if (parsedCV.skills.languages && parsedCV.skills.languages.length > 0) {
      console.log(`\nLanguages (${parsedCV.skills.languages.length}):`);
      console.log(parsedCV.skills.languages.join(', '));
    }

    if (parsedCV.projects && parsedCV.projects.length > 0) {
      console.log('\n🚀 PROJECTS:');
      console.log('─────────────────────────────────────');
      parsedCV.projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   ${project.description}`);
        console.log(`   Technologies: ${project.technologies.join(', ')}`);
        if (project.url) {
          console.log(`   URL: ${project.url}`);
        }
      });
    }

    if (parsedCV.certifications && parsedCV.certifications.length > 0) {
      console.log('\n📜 CERTIFICATIONS:');
      console.log('─────────────────────────────────────');
      parsedCV.certifications.forEach((cert, index) => {
        console.log(`\n${index + 1}. ${cert.name}`);
        console.log(`   Issuer: ${cert.issuer}`);
        console.log(`   Date: ${cert.date}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✨ STATISTICS:');
    console.log(`   • Experience entries: ${parsedCV.experience.length}`);
    console.log(`   • Education entries: ${parsedCV.education.length}`);
    console.log(
      `   • Technical skills: ${parsedCV.skills.technical.length}`
    );
    console.log(`   • Projects: ${parsedCV.projects?.length || 0}`);
    console.log(
      `   • Certifications: ${parsedCV.certifications?.length || 0}`
    );
    console.log(`   • Processing time: ${duration}s`);

    if (parsedCV.rawText) {
      const wordCount = parsedCV.rawText.split(/\s+/).length;
      console.log(`   • Words extracted: ${wordCount}`);
    }

    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!\n');

    return parsedCV;
  } catch (error) {
    console.error('\n❌ TEST ERROR:');
    console.error('─────────────────────────────────────');
    console.error(error);
    console.error('\n');
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testCVUpload()
    .then(() => {
      console.log('✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

export { testCVUpload };
