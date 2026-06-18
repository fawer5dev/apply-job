import * as googleAI from './google-ai';
import * as openaiAI from './openai';

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
    return googleAI.generateContent(systemPrompt, userPrompt, rest);
  }
  if (provider === 'openai') {
    return openaiAI.generateContent(systemPrompt, userPrompt, rest);
  }

  // Auto mode: Try Google first (usually cheaper/available), then fallback to OpenAI
  try {
    return await googleAI.generateContent(systemPrompt, userPrompt, rest);
  } catch (error) {
    console.warn('Google AI failed, trying OpenAI fallback...', 
      error instanceof Error ? error.message : 'Unknown error');
    
    try {
      return await openaiAI.generateContent(systemPrompt, userPrompt, rest);
    } catch (openAIError) {
      console.error('Both AI providers failed');
      // Throw the original error which is usually more descriptive of the main provider's issue
      throw error;
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
    throw new Error(`Failed to parse AI response as JSON: ${error}`);
  }
}
