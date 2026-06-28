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

function extractJSONContent(content: string): string {
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

  return cleanContent;
}

/**
 * Unified function to generate structured JSON with automatic fallback
 * and retry logic for malformed responses.
 */
export async function generateJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  config: Omit<GenerateConfig, 'responseFormat'> = {}
): Promise<T> {
  const { provider = 'auto', ...rest } = config;
  const maxAttempts = 3;
  let lastError: unknown;
  let shouldTryOpenAIFallback = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { content, originalError } = await tryGenerateContent(
        systemPrompt,
        userPrompt,
        {
          ...rest,
          responseFormat: 'json',
        }
      );

      const cleanContent = extractJSONContent(content);

      try {
        return JSON.parse(cleanContent) as T;
      } catch (parseError) {
        shouldTryOpenAIFallback = true;
        console.warn(
          `Failed to parse JSON response (attempt ${attempt}/${maxAttempts}):`,
          parseError
        );
        console.warn('Raw content:', content.substring(0, 500));

        // If the primary provider failed with a retryable error but the
        // fallback returned content we can't parse, surface the original root
        // cause on the last attempt.
        if (attempt === maxAttempts && originalError?.isRetryable) {
          throw originalError;
        }

        // Retryable parse failure - continue loop unless last attempt.
        if (attempt < maxAttempts) {
          // Small backoff before retrying.
          await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
          continue;
        }

        if (parseError instanceof AIError) {
          throw parseError;
        }

        throw toAIError(
          new Error(`Failed to parse AI response as JSON: ${parseError}`)
        );
      }
    } catch (error) {
      lastError = error;

      // Only retry retryable AI errors.
      if (
        error instanceof AIError &&
        error.isRetryable &&
        attempt < maxAttempts
      ) {
        console.warn(
          `Retryable AI error (attempt ${attempt}/${maxAttempts}):`,
          error.code,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        continue;
      }

      // Non-retryable error or last attempt: exit the loop.
      break;
    }
  }

  // If the primary provider kept returning malformed JSON, try OpenAI once as
  // a last resort because its JSON mode has stronger output guarantees.
  if (shouldTryOpenAIFallback && provider !== 'openai') {
    try {
      const { content } = await tryGenerateContent(
        systemPrompt,
        userPrompt,
        {
          ...rest,
          provider: 'openai',
          responseFormat: 'json',
        }
      );
      return JSON.parse(extractJSONContent(content)) as T;
    } catch (fallbackError) {
      // Prefer a concrete AI error from the fallback; otherwise keep the
      // original last error.
      if (fallbackError instanceof AIError) {
        throw fallbackError;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to generate valid JSON after multiple attempts');
}
