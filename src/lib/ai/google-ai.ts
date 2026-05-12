import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables in development/script mode
if (process.env.NODE_ENV !== 'production' && !process.env.GOOGLE_AI_API_KEY) {
  try {
    // Try loading .env.local first, then .env
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });
    if (!process.env.GOOGLE_AI_API_KEY) {
      dotenv.config({ path: path.join(process.cwd(), '.env') });
    }
  } catch {
    // Ignore if dotenv is not available
  }
}

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is not configured');
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Default configuration
export const AI_CONFIG = {
  model: 'gemini-2.5-flash', // Gemini 2.5 Flash - faster and more available
  temperature: 0.7,
  maxTokens: 8000, // Increased default
};

/**
 * Helper function to generate content with Google AI
 * Maintains a similar interface to OpenAI to facilitate migration
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
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.model,
    generationConfig: {
      temperature: config?.temperature ?? AI_CONFIG.temperature,
      maxOutputTokens: config?.maxTokens ?? AI_CONFIG.maxTokens,
    },
  });

  // Combine system prompt with user prompt for Gemini
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  // If JSON is required, add explicit instructions
  const finalPrompt =
    config?.responseFormat === 'json'
      ? `${fullPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown, no additional text.`
      : fullPrompt;

  const result = await model.generateContent(finalPrompt);
  const response = result.response;
  let text = response.text();

  // Clean response if it's JSON
  if (config?.responseFormat === 'json') {
    // Remove markdown code blocks if they exist
    text = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Fix common JSON issues
    // Remove any text before the first { or [
    const jsonStart = Math.min(
      text.indexOf('{') >= 0 ? text.indexOf('{') : Infinity,
      text.indexOf('[') >= 0 ? text.indexOf('[') : Infinity
    );
    if (jsonStart !== Infinity && jsonStart > 0) {
      text = text.substring(jsonStart);
    }

    // Remove any text after the last } or ]
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    const jsonEnd = Math.max(lastBrace, lastBracket);
    if (jsonEnd >= 0 && jsonEnd < text.length - 1) {
      text = text.substring(0, jsonEnd + 1);
    }
  }

  return text;
}

/**
 * Helper function to generate structured JSON
 */
export async function generateJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  config?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<T> {
  const content = await generateContent(systemPrompt, userPrompt, {
    ...config,
    responseFormat: 'json',
  });

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    // Log the problematic content for debugging
    console.error('Failed to parse JSON. Raw content:');
    console.error(content.substring(0, 500));
    console.error('...');
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}

/**
 * Function for streaming (for future implementations)
 */
export async function generateContentStream(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({
    model: AI_CONFIG.model,
  });

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const result = await model.generateContentStream(fullPrompt);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });
}

export { genAI };
