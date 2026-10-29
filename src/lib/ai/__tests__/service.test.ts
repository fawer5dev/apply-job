/**
 * @jest-environment node
 */
import * as googleAI from '../google-ai';
import { generateJSON } from '../service';
import { jobKeywordsSchema } from '../schemas';

jest.mock('../google-ai', () => ({
  generateContent: jest.fn(),
}));

const mockGenerate = googleAI.generateContent as jest.Mock;

const validKeywords = {
  technical: ['TypeScript'],
  soft: ['Teamwork'],
  tools: ['Docker'],
};

describe('generateJSON (Google only)', () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns schema-validated data on the first valid response', async () => {
    mockGenerate.mockResolvedValueOnce(JSON.stringify(validKeywords));

    const result = await generateJSON('user', 'system', {
      schema: jobKeywordsSchema,
    });

    expect(result).toEqual(validKeywords);
    expect(mockGenerate).toHaveBeenCalledTimes(1);
    expect(mockGenerate).toHaveBeenCalledWith('system', 'user', {
      responseFormat: 'json',
    });
  });

  it('strips markdown fences before parsing', async () => {
    mockGenerate.mockResolvedValueOnce(
      '```json\n' + JSON.stringify(validKeywords) + '\n```'
    );

    const result = await generateJSON('user', 'system', {
      schema: jobKeywordsSchema,
    });

    expect(result.technical).toEqual(['TypeScript']);
  });

  it('retries invalid JSON and succeeds on a later attempt', async () => {
    mockGenerate
      .mockResolvedValueOnce('this is not json')
      .mockResolvedValueOnce(JSON.stringify(validKeywords));

    const result = await generateJSON('user', 'system', {
      schema: jobKeywordsSchema,
    });

    expect(result.soft).toEqual(['Teamwork']);
    expect(mockGenerate).toHaveBeenCalledTimes(2);
  });

  it('never returns data that fails the schema; fails after max attempts', async () => {
    // Missing required "technical" array is coerced to []; a non-object is not.
    mockGenerate.mockResolvedValue('[1, 2, 3]');

    await expect(
      generateJSON('user', 'system', { schema: jobKeywordsSchema })
    ).rejects.toMatchObject({
      code: 'AI_INVALID_RESPONSE',
    });
    expect(mockGenerate).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-retryable errors', async () => {
    mockGenerate.mockRejectedValue(
      new Error('GOOGLE_AI_API_KEY is not configured.')
    );

    await expect(
      generateJSON('user', 'system', { schema: jobKeywordsSchema })
    ).rejects.toMatchObject({
      code: 'AI_API_KEY_MISSING',
      isRetryable: false,
    });
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('does not retry truncated output', async () => {
    mockGenerate.mockRejectedValue(
      new Error('AI response was truncated (MAX_TOKENS)')
    );

    await expect(
      generateJSON('user', 'system', { schema: jobKeywordsSchema })
    ).rejects.toMatchObject({ code: 'AI_INVALID_RESPONSE', isRetryable: false });
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('retries transient provider errors (503)', async () => {
    mockGenerate
      .mockRejectedValueOnce(new Error('503 Service Unavailable: high demand'))
      .mockResolvedValueOnce(JSON.stringify(validKeywords));

    const result = await generateJSON('user', 'system', {
      schema: jobKeywordsSchema,
    });

    expect(result.tools).toEqual(['Docker']);
    expect(mockGenerate).toHaveBeenCalledTimes(2);
  });
});
