const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function testPDFParse() {
  try {
    const pdfPath = path.join(__dirname, '../files/FawerV-CV.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);

    const data = await pdf(dataBuffer);

    console.log('=== PDF TEXT EXTRACTION ===');
    console.log('Number of pages:', data.numpages);
    console.log('Number of characters:', data.text.length);
    console.log('\n=== EXTRACTED TEXT ===');
    console.log(data.text);
    console.log('\n=== END ===');

    // Save to file for review
    fs.writeFileSync(
      path.join(__dirname, '../files/extracted-cv-text.txt'),
      data.text,
      'utf8'
    );
    console.log('\nText saved to files/extracted-cv-text.txt');
  } catch (error) {
    console.error('Error:', error);
  }
}

testPDFParse();
