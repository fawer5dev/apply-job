/**
 * Test script to simulate CV upload
 * Run with: node scripts/test-upload.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
  const filePath = path.join(__dirname, '..', 'files', 'FawerV-CV.pdf');

  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    process.exit(1);
  }

  console.log('📄 Reading file:', filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

  const formData = new FormData();
  formData.append('file', fileBuffer, {
    filename: 'FawerV-CV.pdf',
    contentType: 'application/pdf',
  });
  formData.append('title', 'Test CV Upload - FawerV');
  formData.append('userId', 'temp-user');

  console.log('🚀 Uploading to http://localhost:3000/api/cv/upload...');
  console.log('⏳ This may take 10-30 seconds...\n');

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:3000/api/cv/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Upload successful in ${duration}s\n`);
      console.log('📊 Results:');
      console.log('  CV ID:', data.baseCV.id);
      console.log('  Title:', data.baseCV.title);
      console.log('\n📝 Personal Info:');
      console.log('  Name:', data.baseCV.personalInfo.name);
      console.log('  Email:', data.baseCV.personalInfo.email);
      console.log('  Location:', data.baseCV.personalInfo.location);
      console.log('\n📊 Statistics:');
      console.log('  Experience entries:', data.baseCV.experience.length);
      console.log('  Education entries:', data.baseCV.education.length);
      console.log('  Skill categories:', data.baseCV.skills.length);
      console.log('  Projects:', data.baseCV.projects?.length || 0);
      console.log('  Certifications:', data.baseCV.certifications?.length || 0);

      if (data.baseCV.experience.length > 0) {
        console.log('\n💼 First Experience Entry:');
        const exp = data.baseCV.experience[0];
        console.log('  Title:', exp.title);
        console.log('  Company:', exp.company);
        console.log('  Period:', exp.startDate, '-', exp.endDate || 'Present');
        console.log('  Achievements:', exp.achievements?.length || 0);
      }

      if (data.baseCV.skills.length > 0) {
        console.log('\n🛠️ Skills Categories:');
        data.baseCV.skills.forEach((cat) => {
          console.log(
            `  ${cat.category}:`,
            cat.items.slice(0, 3).join(', '),
            '...'
          );
        });
      }

      console.log('\n✅ Test completed successfully!');
    } else {
      console.error(`❌ Upload failed in ${duration}s`);
      console.error('Status:', response.status);
      console.error('Error:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
      process.exit(1);
    }
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ Request failed after ${duration}s`);
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Check if server is running
console.log('🔍 Checking if server is running...');
fetch('http://localhost:3000')
  .then(() => {
    console.log('✅ Server is running\n');
    testUpload();
  })
  .catch(() => {
    console.error('❌ Server is not running on http://localhost:3000');
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  });
