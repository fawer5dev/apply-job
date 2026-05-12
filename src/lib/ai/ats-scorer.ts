import { generateJSON } from './google-ai';
import { ATS_SCORER_PROMPT } from './prompts';
import type { CV, JobListing, ATSAnalysis } from '@/types';

export async function scoreCV(
  cv: CV,
  jobListing: JobListing
): Promise<ATSAnalysis> {
  const prompt = `
${ATS_SCORER_PROMPT}

CV TO EVALUATE:
${JSON.stringify(cv, null, 2)}

JOB DESCRIPTION:
Title: ${jobListing.title}
Company: ${jobListing.company}
Description: ${jobListing.description}
Key keywords: ${JSON.stringify(jobListing.keywords)}

Evaluate this CV according to ATS criteria and this specific offer.
`;

  const systemPrompt =
    'You are an expert in ATS systems and CV evaluation. You always respond in valid JSON format.';

  const result = await generateJSON<any>(prompt, systemPrompt, {
    temperature: 0.5,
  });

  return {
    score: result.score,
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    suggestions: result.suggestions || [],
    keywordsMatched: result.keywordsMatched || 0,
    keywordsTotal: result.keywordsTotal || 0,
    formatScore: result.formatScore || 0,
    contentScore: result.keywordScore || 0,
  };
}

export async function calculateMatchScore(
  cv: CV,
  jobListing: JobListing
): Promise<number> {
  // Simplified match score implementation
  // Flatten all skills from all categories
  const cvSkills = cv.skills
    .flatMap((category) => category.items)
    .map((s) => s.toLowerCase());

  const jobKeywords = [
    ...(jobListing.keywords.technical || []),
    ...(jobListing.keywords.soft || []),
    ...(jobListing.keywords.tools || []),
  ].map((s) => s.toLowerCase());

  const matches = jobKeywords.filter((keyword) =>
    cvSkills.some((skill) => skill.includes(keyword) || keyword.includes(skill))
  );

  const score =
    jobKeywords.length > 0 ? (matches.length / jobKeywords.length) * 100 : 0;
  return Math.round(score);
}
