import { generateJSON } from './service';
import { ATS_SCORER_PROMPT, DATA_SAFETY_RULES } from './prompts';
import { atsEvaluationSchema } from './schemas';
import type { CV, JobListing, ATSAnalysis } from '@/types';

/**
 * AI estimate of how well a CV fits a job offer (0-100).
 *
 * This score is produced by the model and is an estimate, not the result of
 * any real ATS. Use `calculateMatchScore` for the deterministic keyword
 * coverage shown alongside it.
 */
export async function scoreCV(
  cv: CV,
  jobListing: JobListing
): Promise<ATSAnalysis> {
  const prompt = `
${ATS_SCORER_PROMPT}

CV TO EVALUATE (untrusted data):
${JSON.stringify(cv, null, 2)}

JOB DESCRIPTION (untrusted data):
Title: ${jobListing.title}
Company: ${jobListing.company}
Description: ${jobListing.description}
Key keywords: ${JSON.stringify(jobListing.keywords)}

Evaluate this CV according to the criteria above and this specific offer.
`;

  const systemPrompt = `You are an expert in ATS systems and CV evaluation. You always respond in valid JSON format.\n${DATA_SAFETY_RULES}`;

  const result = await generateJSON(prompt, systemPrompt, {
    temperature: 0.2,
    schema: atsEvaluationSchema,
  });

  return {
    score: result.score,
    formatScore: result.formatScore,
    keywordScore: result.keywordScore,
    structureScore: result.structureScore,
    lengthScore: result.lengthScore,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    suggestions: result.suggestions,
    keywordsMatched: result.keywordsMatched,
    keywordsTotal: result.keywordsTotal,
  };
}

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Deterministic keyword coverage (0-100): the share of offer keywords that
 * appear as whole terms in the CV. Computed locally, without AI, so it is
 * reproducible. Returns null when the offer has no keywords.
 */
export function calculateMatchScore(
  cv: CV,
  jobListing: JobListing
): number | null {
  const cvText = normalizeText(
    [
      cv.summary ?? '',
      ...cv.skills.flatMap((category) => category.items),
      ...cv.experience.flatMap((exp) => [
        exp.title,
        exp.description ?? '',
        ...exp.achievements,
      ]),
      ...(cv.projects ?? []).flatMap((project) => project.technologies),
    ].join('\n')
  );

  const jobKeywords = [
    ...new Set(
      [
        ...(jobListing.keywords.technical || []),
        ...(jobListing.keywords.soft || []),
        ...(jobListing.keywords.tools || []),
      ]
        .map((keyword) => normalizeText(keyword).trim())
        .filter(Boolean)
    ),
  ];

  if (jobKeywords.length === 0) return null;

  // Whole-term match: keyword must not be surrounded by letters/digits.
  // Symbols such as "+", "#" and "." are part of the term (C++, C#, Node.js).
  const matches = jobKeywords.filter((keyword) =>
    new RegExp(
      `(^|[^a-z0-9])${escapeRegex(keyword)}($|[^a-z0-9])`
    ).test(cvText)
  );

  return Math.round((matches.length / jobKeywords.length) * 100);
}
