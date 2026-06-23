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

interface GenerateContentResult {
  content: string;
  /**
   * When the primary provider failed but the fallback succeeded, this holds the
   * classified primary error. If the fallback response can't be processed we can
   * surface the root cause (e.g. "AI service is busy") instead of a generic
   * "unexpected response" parse error.
   */
  originalError?: AIError;
}

async function tryGenerateContent(
  systemPrompt: string,
  userPrompt: string,
  config: GenerateConfig = {}
): Promise<GenerateContentResult> {
  const { provider = 'auto', ...rest } = config;

  // If specific provider is requested
  if (provider === 'google') {
    try {
      return {
        content: await googleAI.generateContent(systemPrompt, userPrompt, rest),
      };
    } catch (error) {
      throw toAIError(error);
    }
  }
  if (provider === 'openai') {
    try {
      return {
        content: await openaiAI.generateContent(
          systemPrompt,
          userPrompt,
          rest
        ),
      };
    } catch (error) {
      throw toAIError(error);
    }
  }

  // Auto mode: Try Google first (usually cheaper/available), then fallback to OpenAI
  let googleAIError: AIError | null = null;
  try {
    return {
      content: await googleAI.generateContent(systemPrompt, userPrompt, rest),
    };
  } catch (error) {
    googleAIError = toAIError(error);
    console.warn(
      'Google AI failed, trying OpenAI fallback...',
      googleAIError.code,
      googleAIError.message
    );

    try {
      const content = await openaiAI.generateContent(
        systemPrompt,
        userPrompt,
        rest
      );
      return {
        content,
        // Remember the root cause only when it's a transient failure. That way
        // if the fallback response can't be parsed we can show a useful message
        // (e.g. service busy) instead of blaming the fallback's response shape.
        originalError: googleAIError.isRetryable ? googleAIError : undefined,
      };
    } catch {
      console.error('Both AI providers failed');
      // Throw the classified primary (Google) error so the UI can show a
      // localized, retryable-aware message instead of the raw technical string.
      throw googleAIError;
    }
  }
}

/**
 * Unified function to generate content with automatic fallback
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  config: GenerateConfig = {}
): Promise<string> {
  const { content } = await tryGenerateContent(systemPrompt, userPrompt, config);
  return content;
}

/**
 * Unified function to generate structured JSON with automatic fallback
 */
export async function generateJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  config: Omit<GenerateConfig, 'responseFormat'> = {}
): Promise<T> {
  const { content, originalError } = await tryGenerateContent(
    systemPrompt,
    userPrompt,
    {
      ...config,
      responseFormat: 'json',
    }
  );

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
    // Re-throw existing AIError as-is.
    if (error instanceof AIError) {
      throw error;
    }
    // If the primary provider failed with a retryable error but the fallback
    // returned content we can't parse, surface the original root cause so the
    // user gets a meaningful message (e.g. "AI service is busy") and a retry
    // button instead of "unexpected response".
    if (originalError?.isRetryable) {
      throw originalError;
    }
    throw toAIError(
      new Error(`Failed to parse AI response as JSON: ${error}`)
    );
  }
}
