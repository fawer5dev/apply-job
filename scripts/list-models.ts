import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

/**
 * Lists the Gemini models available to GOOGLE_AI_API_KEY.
 * Use it to confirm the model in src/config/ai.ts (or GOOGLE_AI_MODEL) exists.
 */
async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY not found');
    process.exit(1);
  }

  console.log('Listing available Google AI models...\n');

  const client = new GoogleGenAI({ apiKey });

  try {
    let count = 0;
    for await (const model of await client.models.list()) {
      count++;
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Actions: ${model.supportedActions?.join(', ')}`);
      console.log();
    }
    console.log(`Found ${count} models.`);
  } catch (error) {
    console.error('Error listing models:', error);
    process.exit(1);
  }
}

listModels();
