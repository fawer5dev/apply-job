import * as googleAI from './google-ai';
import * as openaiAI from './openai';
import { toAIError, AIError } from './errors';

export type AIProvider = 'google' | 'openai' | 'auto';

export interface GenerateConfig {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  provider?: AIProvider;
}

/**
 * Unified function to generate content with automatic fallback
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  config: GenerateConfig = {}
): Promise<string> {
  const { provider = 'auto', ...rest } = config;

  // If specific provider is requested
  if (provider === 'google') {
    try {
      return await googleAI.generateContent(systemPrompt, userPrompt, rest);
    } catch (error) {
      throw toAIError(error);
    }
  }
  if (provider === 'openai') {
    try {
      return await openaiAI.generateContent(systemPrompt, userPrompt, rest);
    } catch (error) {
      throw toAIError(error);
    }
  }

  // Auto mode: Try Google first (usually cheaper/available), then fallback to OpenAI
  let googleError: unknown = null;
  try {
    return await googleAI.generateContent(systemPrompt, userPrompt, rest);
  } catch (error) {
    googleError = error;
    console.warn(
      'Google AI failed, trying OpenAI fallback...',
      error instanceof Error ? error.message : 'Unknown error'
    );

    try {
      return await openaiAI.generateContent(systemPrompt, userPrompt, rest);
    } catch {
      console.error('Both AI providers failed');
      // Throw a classified version of the primary (Google) error so the UI
      // can show a localized, retryable-aware message instead of the raw
      // technical string (e.g. "503 Service Unavailable ... high demand").
      throw toAIError(googleError);
    }
  }
}

/**
 * Unified function to generate structured JSON with automatic fallback
 */
export async function generateJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  config: Omit<GenerateConfig, 'responseFormat'> = {}
): Promise<T> {
  const content = await generateContent(systemPrompt, userPrompt, {
    ...config,
    responseFormat: 'json',
  });

  try {
    // Clean content if it's not perfectly clean JSON
    let cleanContent = content;
    if (content.includes('```')) {
      cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    // Find the first { or [ and last } or ]
    const startIdx = Math.min(
      cleanContent.indexOf('{') >= 0 ? cleanContent.indexOf('{') : Infinity,
      cleanContent.indexOf('[') >= 0 ? cleanContent.indexOf('[') : Infinity
    );
    const endIdx = Math.max(
      cleanContent.lastIndexOf('}'),
      cleanContent.lastIndexOf(']')
    );

    if (startIdx !== Infinity && endIdx !== -1 && endIdx > startIdx) {
      cleanContent = cleanContent.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(cleanContent) as T;
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    console.error('Raw content:', content.substring(0, 500));
    // Re-throw existing AIError as-is; otherwise classify the parse failure.
    if (error instanceof AIError) {
      throw error;
    }
    throw toAIError(
      new Error(`Failed to parse AI response as JSON: ${error}`)
    );
  }
}
