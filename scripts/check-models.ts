import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY not found');
    process.exit(1);
  }

  console.log('API Key configured:', apiKey.substring(0, 10) + '...');
  console.log('\nFetching available models...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Try the latest model
    const models = [
      'gemini-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'models/gemini-pro',
    ];

    console.log('Testing models:\n');

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        console.log(`✅ ${modelName}: AVAILABLE`);
        console.log(
          `   Response: ${result.response.text().substring(0, 50)}...\n`
        );
      } catch (error: any) {
        console.log(`❌ ${modelName}: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
