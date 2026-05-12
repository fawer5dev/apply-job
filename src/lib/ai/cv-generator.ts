import { generateJSON } from './google-ai';
import { CV_GENERATOR_PROMPT } from './prompts';
import type { CV, JobListing } from '@/types';

export interface GeneratedCV extends CV {
  atsOptimizations: {
    keywordsAdded: string[];
    sectionsReordered: string[];
    matchScore: number;
  };
}

export async function generateCustomCV(
  baseCV: CV,
  jobListing: JobListing
): Promise<GeneratedCV> {
  const prompt = `
${CV_GENERATOR_PROMPT}

ORIGINAL CV:
${JSON.stringify(baseCV, null, 2)}

JOB OFFER:
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location || 'Not specified'}
Work Mode: ${jobListing.workMode || 'Not specified'}
Description: ${jobListing.description}
Key keywords: ${JSON.stringify(jobListing.keywords)}

Generate an optimized CV for this specific offer.
`;

  const systemPrompt =
    'You are an expert in CV optimization for ATS. You always respond in valid JSON format.';

  const generatedCV = await generateJSON<GeneratedCV>(prompt, systemPrompt, {
    maxTokens: 8000, // Increase token limit for larger responses
    temperature: 0.5,
  });
  return generatedCV;
}
