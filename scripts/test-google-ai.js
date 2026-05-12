/**
 * Test Google AI API connection
 */
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGoogleAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env.local');
    process.exit(1);
  }

  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  console.log('🔍 Testing Google AI connection...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  // Test different model names
  const modelsToTest = ['gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash'];

  for (const modelName of modelsToTest) {
    console.log(`\n📝 Testing model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(
        'Say "Hello, I am working!" in 5 words or less.'
      );
      const response = result.response;
      const text = response.text();

      console.log(`✅ ${modelName} works!`);
      console.log(`   Response: ${text}`);
    } catch (error) {
      console.log(`❌ ${modelName} failed`);
      console.log(`   Error: ${error.message}`);
      if (error.status) {
        console.log(`   Status: ${error.status}`);
      }
    }
  }

  console.log('\n✅ Test completed');
}

testGoogleAI().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
