import * as dotenv from 'dotenv';
import * as path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testAPI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not found');
    process.exit(1);
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 20) + '...');
  console.log('\n🧪 Testing different model names...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "hello"');
      const response = result.response.text();
      console.log(
        `✅ ${modelName} works! Response: ${response.substring(0, 50)}...\n`
      );
      break; // Stop at first working model
    } catch (error: any) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }
}

testAPI();
