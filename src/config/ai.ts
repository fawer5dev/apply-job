/**
 * Central AI configuration. Google Gemini is the only provider.
 *
 * The model can be overridden with GOOGLE_AI_MODEL so it can be changed
 * without a code change (for example to compare models in staging).
 */
export const AI_CONFIG = {
  provider: 'google' as const,
  model: process.env.GOOGLE_AI_MODEL?.trim() || 'gemini-3.8-flash',
  defaultTemperature: 0.7,
  defaultMaxOutputTokens: 8000,
  /** Per-request timeout for the provider HTTP call. */
  requestTimeoutMs: 90_000,
  /** Attempts per operation for retryable errors (busy, rate limit, network, invalid output). */
  maxAttempts: 3,
} as const;
