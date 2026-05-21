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

// Helper function to get API key with validation at runtime
function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return apiKey;
}

// Lazy initialization of OpenAI client (only when actually used)
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: getApiKey(),
    });
  }
  return openaiClient;
}

export const openai = getOpenAI;

export const AI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4000,
};
