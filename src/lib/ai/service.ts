import type { z } from 'zod';
import * as googleAI from './google-ai';
import type { PdfAttachment } from './google-ai';
import { AIError, FRIENDLY_FALLBACK, toAIError } from './errors';
import { AI_CONFIG } from '@/config/ai';

export interface GenerateConfig {
  temperature?: number;
  maxTokens?: number;
  attachments?: PdfAttachment[];
}

export interface GenerateJSONConfig<T> extends GenerateConfig {
  /** Schema the model output must satisfy before it is returned. */
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run a provider call, retrying only errors that are marked retryable.
 * Every thrown value leaves this function as an AIError.
 */
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: AIError | undefined;

  for (let attempt = 1; attempt <= AI_CONFIG.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = toAIError(error);

      if (!lastError.isRetryable || attempt === AI_CONFIG.maxAttempts) {
        break;
      }

      console.warn(
        `Retryable AI error (attempt ${attempt}/${AI_CONFIG.maxAttempts}):`,
        lastError.code
      );
      await sleep(500 * attempt);
    }
  }

  throw lastError ?? new AIError({
    code: 'AI_UNKNOWN',
    isRetryable: false,
    message: FRIENDLY_FALLBACK.AI_UNKNOWN,
  });
}

/**
 * Generate free text with Google Gemini.
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  config: GenerateConfig = {}
): Promise<string> {
  return withRetry(() =>
    googleAI.generateContent(systemPrompt, userPrompt, {
      ...config,
      responseFormat: 'text',
    })
  );
}

/**
 * Remove markdown fences and surrounding prose so the JSON can be parsed.
 */
function extractJSONContent(content: string): string {
  let cleaned = content.trim();
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  }

  const start = cleaned.search(/[{[]/);
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (start !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
}

/**
 * Generate JSON with Gemini, parse it and validate it against `schema`.
 *
 * Invalid JSON or schema mismatches are classified as AI_INVALID_RESPONSE
 * (retryable), so the operation is retried up to `maxAttempts` times before
 * failing. Nothing is returned unless it satisfies the schema.
 */
export async function generateJSON<T>(
  userPrompt: string,
  systemPrompt: string,
  config: GenerateJSONConfig<T>
): Promise<T> {
  const { schema, ...generation } = config;

  return withRetry(async () => {
    const raw = await googleAI.generateContent(systemPrompt, userPrompt, {
      ...generation,
      responseFormat: 'json',
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJSONContent(raw));
    } catch (parseError) {
      console.warn('Failed to parse JSON response. Raw content:', raw.slice(0, 300));
      throw new AIError(
        {
          code: 'AI_INVALID_RESPONSE',
          isRetryable: true,
          message: FRIENDLY_FALLBACK.AI_INVALID_RESPONSE,
        },
        parseError
      );
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        'AI response failed schema validation:',
        result.error.issues.slice(0, 5)
      );
      throw new AIError(
        {
          code: 'AI_INVALID_RESPONSE',
          isRetryable: true,
          message: FRIENDLY_FALLBACK.AI_INVALID_RESPONSE,
        },
        result.error
      );
    }

    return result.data;
  });
}
