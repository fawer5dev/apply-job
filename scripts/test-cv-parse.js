const { parseCV } = require('../src/lib/cv/parser');
const fs = require('fs');
const path = require('path');

async function testCVParsing() {
  try {
    console.log('🔍 Starting CV parsing test...\n');

    const pdfPath = path.join(__dirname, '../files/FawerV-CV.pdf');
    const fileBuffer = fs.readFileSync(pdfPath);

    // Create a File-like object
    const file = new File([fileBuffer], 'FawerV-CV.pdf', {
      type: 'application/pdf',
    });

    console.log(
      '📄 File loaded:',
      file.name,
      `(${(file.size / 1024).toFixed(2)} KB)`
    );
    console.log('⏳ Parsing CV with AI...\n');

    const startTime = Date.now();
    const parsedCV = await parseCV(file);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✅ CV parsed successfully in ${duration}s\n`);

    console.log('=== PARSED CV STRUCTURE ===\n');

    console.log('👤 Personal Info:');
    console.log(`   Name: ${parsedCV.personalInfo.name}`);
    console.log(`   Email: ${parsedCV.personalInfo.email}`);
    console.log(`   Location: ${parsedCV.personalInfo.location || 'N/A'}`);
    console.log(`   LinkedIn: ${parsedCV.personalInfo.linkedin || 'N/A'}\n`);

    if (parsedCV.summary) {
      console.log('📝 Summary:');
      console.log(`   ${parsedCV.summary.substring(0, 150)}...\n`);
    }

    console.log(`💼 Experience (${parsedCV.experience.length} positions):`);
    parsedCV.experience.forEach((exp, i) => {
      console.log(`   ${i + 1}. ${exp.title} at ${exp.company}`);
      console.log(
        `      ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'N/A'}`
      );
      if (exp.achievements && exp.achievements.length > 0) {
        console.log(`      Achievements: ${exp.achievements.length}`);
      }
    });
    console.log('');

    console.log(`🎓 Education (${parsedCV.education.length} entries):`);
    parsedCV.education.forEach((edu, i) => {
      console.log(`   ${i + 1}. ${edu.degree} - ${edu.institution}`);
      console.log(`      ${edu.graduationDate}`);
    });
    console.log('');

    console.log(`🛠️ Skills (${parsedCV.skills.length} categories):`);
    parsedCV.skills.forEach((skillGroup) => {
      console.log(
        `   ${skillGroup.category}: ${skillGroup.items.length} items`
      );
      console.log(
        `      ${skillGroup.items.slice(0, 5).join(', ')}${skillGroup.items.length > 5 ? '...' : ''}`
      );
    });
    console.log('');

    if (parsedCV.projects && parsedCV.projects.length > 0) {
      console.log(`🚀 Projects: ${parsedCV.projects.length}`);
    }

    if (parsedCV.certifications && parsedCV.certifications.length > 0) {
      console.log(`📜 Certifications: ${parsedCV.certifications.length}`);
    }

    console.log('\n=== FULL JSON ===\n');
    console.log(JSON.stringify(parsedCV, null, 2));

    // Save to file
    const outputPath = path.join(__dirname, '../files/parsed-cv-output.json');
    fs.writeFileSync(outputPath, JSON.stringify(parsedCV, null, 2), 'utf8');
    console.log(`\n💾 Full output saved to: ${outputPath}`);
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

testCVParsing();
