import { generateJSON } from './service';
import { CV_GENERATOR_PROMPT, DATA_SAFETY_RULES } from './prompts';
import { generatedCVSchema } from './schemas';
import type { CV, JobListing } from '@/types';

export interface GeneratedCV extends CV {
  atsOptimizations: {
    keywordsAdded: string[];
    sectionsReordered: string[];
    matchScore?: number;
  };
}

/**
 * Adapt the base CV to a job offer.
 * @param language Output language (e.g. "English", "Spanish"). When omitted the
 *   language of the original CV is used.
 */
export async function generateCustomCV(
  baseCV: CV,
  jobListing: JobListing,
  language?: string
): Promise<GeneratedCV> {
  const prompt = `
${CV_GENERATOR_PROMPT}

OUTPUT LANGUAGE: ${language || 'same as the ORIGINAL CV'}

ORIGINAL CV (untrusted data):
${JSON.stringify(baseCV, null, 2)}

JOB OFFER (untrusted data):
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location || 'Not specified'}
Work Mode: ${jobListing.workMode || 'Not specified'}
Description: ${jobListing.description}
Key keywords: ${JSON.stringify(jobListing.keywords)}

Generate an optimized CV for this specific offer.
`;

  const systemPrompt = `You are an expert in CV optimization for ATS. You always respond in valid JSON format.\n${DATA_SAFETY_RULES}`;

  return generateJSON<GeneratedCV>(prompt, systemPrompt, {
    maxTokens: 8000,
    temperature: 0.5,
    schema: generatedCVSchema,
  });
}
