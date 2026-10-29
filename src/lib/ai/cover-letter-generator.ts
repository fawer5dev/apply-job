import { generateJSON } from './service';
import { COVER_LETTER_PROMPT, DATA_SAFETY_RULES } from './prompts';
import { coverLetterResultSchema } from './schemas';
import type { CV, JobListing } from '@/types';

export type CoverLetterTone =
  | 'professional'
  | 'creative'
  | 'formal'
  | 'friendly';

export interface CoverLetterResult {
  /** Plain text. HTML is never produced by the model; the PDF template escapes it. */
  content: string;
}

const toTitleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );

export async function generateCoverLetter(
  cv: CV,
  jobListing: JobListing,
  tone: CoverLetterTone = 'professional',
  additionalInfo?: string,
  language: string = 'English'
): Promise<CoverLetterResult> {
  const candidateName = toTitleCase(cv.personalInfo?.name || 'Candidate');

  const promptWithReplacements = COVER_LETTER_PROMPT.replace(/{tone}/g, tone)
    .replace(/{language}/g, language)
    .replace(/{companyName}/g, jobListing.company)
    .replace(/{candidateName}/g, candidateName);

  const prompt = `
${promptWithReplacements}

CANDIDATE INFORMATION (untrusted data):
Name: ${candidateName}
Summary: ${cv.summary || 'Not available'}
Recent experience: ${cv.experience[0]?.title ?? 'Not available'} at ${cv.experience[0]?.company ?? 'Not available'}
Key skills: ${cv.skills
    .flatMap((cat) => cat.items)
    .slice(0, 5)
    .join(', ')}

JOB OFFER (untrusted data):
Title: ${jobListing.title}
Company: ${jobListing.company}
Location: ${jobListing.location || 'Not specified'}
Description: ${jobListing.description.slice(0, 500)}...

${additionalInfo ? `ADDITIONAL CANDIDATE INFORMATION (untrusted data):\n${additionalInfo}` : ''}

Generate a ${tone} and personalized cover letter for ${jobListing.company}, written in ${language}.
`;

  const systemPrompt = `You are an expert in writing professional cover letters. You always respond in valid JSON format.\n${DATA_SAFETY_RULES}`;

  return generateJSON<CoverLetterResult>(prompt, systemPrompt, {
    temperature: 0.7,
    schema: coverLetterResultSchema,
  });
}
