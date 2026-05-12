import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY not found');
    process.exit(1);
  }

  console.log('🔍 Listing available Google AI models...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const models = await genAI.listModels();
    console.log(`Found ${models.length} models:\n`);

    models.forEach((model) => {
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(
        `  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`
      );
      console.log();
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
