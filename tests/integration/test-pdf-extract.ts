/**
 * Test script to test PDF text extraction (without AI)
 *
 * Run: pnpm tsx tests/integration/test-pdf-extract.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import fs from 'fs';
import pdf from 'pdf-parse';

async function testPDFExtraction() {
  console.log('🚀 Starting PDF extraction test...\n');

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

    // 2. Extract text from PDF
    console.log('📤 Extracting text from PDF...');
    const startTime = Date.now();

    const data = await pdf(buffer);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Text extracted successfully in ${duration} seconds\n`);

    // 3. Show statistics
    console.log('📊 EXTRACTION STATISTICS:\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`\n📄 Pages: ${data.numpages}`);
    console.log(`📝 Characters: ${data.text.length}`);
    console.log(`🔤 Words: ${data.text.split(/\s+/).length}`);
    console.log(`📏 Lines: ${data.text.split('\n').length}`);

    // 4. Show first lines of CV
    console.log('\n📄 FIRST 30 LINES OF CV:\n');
    console.log('─────────────────────────────────────');
    const lines = data.text.split('\n').filter((line) => line.trim());
    lines.slice(0, 30).forEach((line, index) => {
      console.log(
        `${(index + 1).toString().padStart(2, '0')}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`
      );
    });

    // 5. Basic analysis (without AI)
    console.log('\n\n🔍 BASIC ANALYSIS (WITHOUT AI):\n');
    console.log('─────────────────────────────────────');

    // Extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = data.text.match(emailRegex);
    if (emails) {
      console.log(`\n📧 Emails found:`);
      emails.forEach((email) => console.log(`   • ${email}`));
    }

    // Extract phones (basic pattern)
    const phoneRegex =
      /[\+]?[(]?[0-9]{2,4}[)]?[-\s\.]?[0-9]{2,4}[-\s\.]?[0-9]{2,4}[-\s\.]?[0-9]{2,4}/g;
    const phones = data.text.match(phoneRegex);
    if (phones) {
      console.log(`\n📱 Possible phones found:`);
      [...new Set(phones)]
        .slice(0, 5)
        .forEach((phone) => console.log(`   • ${phone}`));
    }

    // Extract URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const urls = data.text.match(urlRegex);
    if (urls) {
      console.log(`\n🔗 URLs found:`);
      [...new Set(urls)]
        .slice(0, 10)
        .forEach((url) => console.log(`   • ${url}`));
    }

    // Detect common sections
    const sections = [
      'EXPERIENCE',
      'EXPERIENCIA',
      'WORK EXPERIENCE',
      'EDUCATION',
      'EDUCACIÓN',
      'FORMACIÓN',
      'SKILLS',
      'HABILIDADES',
      'COMPETENCIAS',
      'PROJECTS',
      'PROYECTOS',
      'CERTIFICATIONS',
      'CERTIFICACIONES',
      'SUMMARY',
      'RESUMEN',
      'PERFIL',
    ];

    const foundSections = sections.filter((section) =>
      data.text.toUpperCase().includes(section)
    );

    if (foundSections.length > 0) {
      console.log(`\n📋 Sections detected:`);
      foundSections.forEach((section) => console.log(`   • ${section}`));
    }

    // Search for common technical keywords
    const techKeywords = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'React',
      'Node',
      'AWS',
      'Docker',
      'Kubernetes',
      'SQL',
      'MongoDB',
      'Git',
      'CI/CD',
      'API',
      'REST',
      'GraphQL',
      'Microservices',
      'Next.js',
      'Vue',
      'Angular',
      'Express',
      'Django',
      'Flask',
    ];

    const foundKeywords = techKeywords.filter((keyword) =>
      data.text.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      console.log(`\n💻 Technologies detected:`);
      foundKeywords.forEach((keyword) => console.log(`   • ${keyword}`));
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n✅ SUMMARY:');
    console.log(`   • File: ${filePath.split('/').pop()}`);
    console.log(`   • Size: ${fileSize} KB`);
    console.log(`   • Extraction time: ${duration}s`);
    console.log(`   • Pages extracted: ${data.numpages}`);
    console.log(`   • Total text: ${data.text.length} characters`);
    console.log(`   • Emails: ${emails?.length || 0}`);
    console.log(`   • URLs: ${urls?.length || 0}`);
    console.log(`   • Sections: ${foundSections.length}`);
    console.log(`   • Technologies: ${foundKeywords.length}`);

    console.log('\n🎉 EXTRACTION TEST COMPLETED!\n');
    console.log(
      '📝 NOTE: The complete parser with AI will automatically structure all this information'
    );
    console.log('   into an organized JSON format.\n');

    return data;
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
  testPDFExtraction()
    .then(() => {
      console.log('✅ Extraction test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

export { testPDFExtraction };
