/**
 * AI error classification.
 *
 * Raw errors from @google/generative-ai and openai are long, technical and
 * always in English (e.g. "[GoogleGenerativeAI Error]: ... 503 Service
 * Unavailable ... high demand"). This module converts them into stable,
 * machine-readable codes the API layer and UI can localize.
 */

export type AICode =
  | 'AI_SERVICE_BUSY'
  | 'AI_RATE_LIMITED'
  | 'AI_API_KEY_MISSING'
  | 'AI_INVALID_RESPONSE'
  | 'AI_NETWORK_ERROR'
  | 'AI_UNKNOWN';

export interface ClassifiedAIError {
  code: AICode;
  isRetryable: boolean;
  message: string;
}

export class AIError extends Error {
  readonly code: AICode;
  readonly isRetryable: boolean;
  readonly cause?: unknown;

  constructor(classified: ClassifiedAIError, cause?: unknown) {
    super(classified.message);
    this.name = 'AIError';
    this.code = classified.code;
    this.isRetryable = classified.isRetryable;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

interface Rule {
  code: AICode;
  isRetryable: boolean;
  /** Tested against the lowercased error message. */
  patterns: RegExp[];
}

const RULES: Rule[] = [
  {
    code: 'AI_SERVICE_BUSY',
    isRetryable: true,
    patterns: [
      /503/,
      /service unavailable/,
      /high demand/,
      /currently experiencing/,
      /temporarily unavailable/,
      /overloaded/,
    ],
  },
  {
    code: 'AI_RATE_LIMITED',
    isRetryable: true,
    patterns: [
      /429/,
      /rate limit/,
      /rate_limit/,
      /resource_exhausted/,
      /too many requests/,
      /quota/,
    ],
  },
  {
    code: 'AI_API_KEY_MISSING',
    isRetryable: false,
    patterns: [
      /api key/,
      /not configured/,
      /permission_denied/,
      /unauthorized/,
      /invalid_api_key/,
      /api_key_invalid/,
    ],
  },
  {
    code: 'AI_INVALID_RESPONSE',
    isRetryable: true,
    patterns: [
      /failed to parse json/i,
      /failed to parse ai response/i,
      /json/i,
      /parse/i,
    ],
  },
  {
    code: 'AI_NETWORK_ERROR',
    isRetryable: true,
    patterns: [
      /fetch/i,
      /econnreset/i,
      /etimedout/i,
      /enotfound/i,
      /econnrefused/i,
      /network/i,
      /socket hang up/i,
    ],
  },
];

const FRIENDLY_FALLBACK: Record<AICode, string> = {
  AI_SERVICE_BUSY:
    'The AI service is temporarily busy. Please try again in a moment.',
  AI_RATE_LIMITED:
    'The AI service rate limit was reached. Please wait a moment and try again.',
  AI_API_KEY_MISSING:
    'The AI service is not configured correctly. Contact an administrator.',
  AI_INVALID_RESPONSE:
    'The AI returned an unexpected response. Please try again.',
  AI_NETWORK_ERROR:
    'A network error occurred while contacting the AI service. Please try again.',
  AI_UNKNOWN: 'An unexpected error occurred while contacting the AI service.',
};

/**
 * Convert any thrown value into a stable ClassifiedAIError.
 * Never throws — always returns a result so callers can use it in catch
 * blocks without additional try/catch.
 */
export function classifyAIError(error: unknown): ClassifiedAIError {
  const raw =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error ?? '');
  const text = raw.toLowerCase();

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return {
        code: rule.code,
        isRetryable: rule.isRetryable,
        message: FRIENDLY_FALLBACK[rule.code],
      };
    }
  }

  return {
    code: 'AI_UNKNOWN',
    isRetryable: false,
    message: FRIENDLY_FALLBACK.AI_UNKNOWN,
  };
}

/**
 * Wrap any thrown value as an AIError. Use in catch blocks to propagate a
 * classified, retryable-aware error up the stack.
 */
export function toAIError(error: unknown): AIError {
  if (error instanceof AIError) {
    return error;
  }
  return new AIError(classifyAIError(error), error);
}
