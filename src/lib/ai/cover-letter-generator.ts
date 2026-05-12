import { generateJSON } from './google-ai';
import { COVER_LETTER_PROMPT } from './prompts';
import type { CV, JobListing } from '@/types';

export interface CoverLetterResult {
  content: string;
  htmlContent: string;
}

export async function generateCoverLetter(
  cv: CV,
  jobListing: JobListing,
  tone: 'professional' | 'creative' | 'formal' | 'friendly' = 'professional',
  additionalInfo?: string
): Promise<CoverLetterResult> {
  const prompt = `
${COVER_LETTER_PROMPT.replace('{tone}', tone)}

CANDIDATE INFORMATION:
Name: ${cv.personalInfo.name}
Summary: ${cv.summary || 'Not available'}
Recent experience: ${cv.experience[0]?.title} at ${cv.experience[0]?.company}
Key skills: ${cv.skills
    .flatMap((cat) => cat.items)
    .slice(0, 5)
    .join(', ')}

JOB OFFER:
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location || 'Not specified'}
Description: ${jobListing.description.slice(0, 500)}...

${additionalInfo ? `ADDITIONAL CANDIDATE INFORMATION:\n${additionalInfo}` : ''}

Generate a ${tone} and personalized cover letter.
`;

  const systemPrompt =
    'You are an expert in writing professional cover letters. You always respond in valid JSON format.';

  const result = await generateJSON<CoverLetterResult>(prompt, systemPrompt, {
    temperature: 0.8, // More creative for cover letters
  });

  return result;
}
