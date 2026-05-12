import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables in development/script mode
if (process.env.NODE_ENV !== 'production' && !process.env.OPENAI_API_KEY) {
  try {
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
    if (!process.env.OPENAI_API_KEY) {
      dotenv.config({ path: path.join(process.cwd(), '.env') });
    }
  } catch {
    // Ignore if dotenv is not available
  }
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4000,
};
