import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AI_CONFIG } from '@/config/ai';

// Load environment variables if not already present (scripts / tsx runs).
if (!process.env.GOOGLE_AI_API_KEY) {
  try {
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
    if (!process.env.GOOGLE_AI_API_KEY) {
      dotenv.config({ path: path.join(process.cwd(), '.env') });
    }
  } catch {
    // Ignore if dotenv is not available
  }
}

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GOOGLE_AI_API_KEY is not configured. Please add it to your .env.local file or environment variables.'
    );
  }
  return apiKey;
}

// Lazy initialization so the app can boot without an API key.
let client: GoogleGenAI | null = null;
export function getGoogleAIClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({
      apiKey: getApiKey(),
      httpOptions: { timeout: AI_CONFIG.requestTimeoutMs },
    });
  }
  return client;
}

export interface GoogleGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

/**
 * Generate text with Gemini. System instructions go in `systemInstruction`
 * (not concatenated into the user prompt).
 *
 * Throws a plain Error on empty output or truncation so the service layer
 * can classify it.
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  options: GoogleGenerateOptions = {}
): Promise<string> {
  const isJSON = options.responseFormat === 'json';

  const response = await getGoogleAIClient().models.generateContent({
    model: AI_CONFIG.model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: options.temperature ?? AI_CONFIG.defaultTemperature,
      maxOutputTokens: options.maxTokens ?? AI_CONFIG.defaultMaxOutputTokens,
      responseMimeType: isJSON ? 'application/json' : 'text/plain',
    },
  });

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    throw new Error('AI response was truncated (MAX_TOKENS)');
  }

  const text = response.text ?? '';
  if (!text.trim()) {
    throw new Error('Failed to parse AI response: empty content');
  }

  return text;
}
