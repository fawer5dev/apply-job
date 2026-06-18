import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables if not already present
if (!process.env.OPENAI_API_KEY) {
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
    throw new Error(
      'OPENAI_API_KEY is not configured. Please add it to your .env.local file or environment variables.'
    );
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

/**
 * Helper function to generate content with OpenAI
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  config?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: 'json' | 'text';
  }
): Promise<string> {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: AI_CONFIG.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: config?.temperature ?? AI_CONFIG.temperature,
    max_tokens: config?.maxTokens ?? AI_CONFIG.maxTokens,
    response_format:
      config?.responseFormat === 'json' ? { type: 'json_object' } : undefined,
  });

  return response.choices[0]?.message?.content || '';
}
