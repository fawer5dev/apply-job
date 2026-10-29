import { prisma } from '@/lib/db/prisma';
import { generateCustomCV } from '@/lib/ai/cv-generator';
import { generateCoverLetter } from '@/lib/ai/cover-letter-generator';
import { scoreCV, calculateMatchScore } from '@/lib/ai/ats-scorer';
import { FREE_PLAN_APPLICATION_LIMIT } from '@/lib/plans';
import type { CV, JobListing, ATSAnalysis } from '@/types';
import type { CoverLetterTone } from '@/lib/ai/cover-letter-generator';

export const COVER_LETTER_TONES: readonly CoverLetterTone[] = [
  'professional',
  'creative',
  'formal',
  'friendly',
];

/** Languages the generators can write in. Keys come from the client. */
export const OUTPUT_LANGUAGES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
};

export function resolveTone(input: unknown): CoverLetterTone {
  return COVER_LETTER_TONES.includes(input as CoverLetterTone)
    ? (input as CoverLetterTone)
    : 'professional';
}

export function resolveLanguage(input: unknown): string {
  if (typeof input === 'string' && OUTPUT_LANGUAGES[input]) {
    return OUTPUT_LANGUAGES[input];
  }
  return OUTPUT_LANGUAGES.en;
}

/**
 * Atomically reserve one application under the user's plan.
 *
 * The check and the increment happen in a single conditional UPDATE, so two
 * concurrent requests cannot both pass a limit of N when only one slot is left.
 * Call `releaseApplicationSlot` if generation or persistence fails afterwards.
 */
export async function reserveApplicationSlot(userId: string): Promise<boolean> {
  const result = await prisma.users.updateMany({
    where: {
      id: userId,
      OR: [
        { accountType: 'PROFESSIONAL' },
        { applicationsUsed: { lt: FREE_PLAN_APPLICATION_LIMIT } },
      ],
    },
    data: { applicationsUsed: { increment: 1 } },
  });
  return result.count === 1;
}

export async function releaseApplicationSlot(userId: string): Promise<void> {
  await prisma.users
    .update({
      where: { id: userId },
      data: { applicationsUsed: { decrement: 1 } },
    })
    .catch((error: unknown) => {
      console.error('Failed to release application slot:', error);
    });
}

export function toCVData(baseCV: {
  personalInfo: unknown;
  summary?: string | null;
  experience: unknown;
  education: unknown;
  skills: unknown;
  projects?: unknown;
  certifications?: unknown;
}): CV {
  return {
    personalInfo: baseCV.personalInfo as CV['personalInfo'],
    summary: baseCV.summary || undefined,
    experience: baseCV.experience as CV['experience'],
    education: baseCV.education as CV['education'],
    skills: baseCV.skills as CV['skills'],
    projects: (baseCV.projects as CV['projects']) || undefined,
    certifications: (baseCV.certifications as CV['certifications']) || undefined,
  };
}

export function toJobData(jobListing: {
  title: string;
  company: string;
  location?: string | null;
  workMode?: string | null;
  salary?: string | null;
  description: string;
  keywords: unknown;
  requirements: unknown;
  url?: string | null;
  source?: string | null;
}): JobListing {
  return {
    title: jobListing.title,
    company: jobListing.company,
    location: jobListing.location || undefined,
    workMode:
      (jobListing.workMode as JobListing['workMode']) || undefined,
    salary: jobListing.salary || undefined,
    description: jobListing.description,
    keywords: jobListing.keywords as JobListing['keywords'],
    requirements: jobListing.requirements as JobListing['requirements'],
    url: jobListing.url || undefined,
    source: jobListing.source || undefined,
  };
}

export interface ApplicationArtifacts {
  customCV: Awaited<ReturnType<typeof generateCustomCV>>;
  coverLetterContent: string | null;
  /** AI estimate. Null if the evaluator failed; the application is still saved. */
  atsAnalysis: ATSAnalysis | null;
  /** Deterministic keyword coverage (0-100), or null if the offer has no keywords. */
  matchScore: number | null;
}

/**
 * Generate the adapted CV, optional cover letter and ATS evaluation.
 * Shared by every route that creates applications so they produce the same
 * scores and respect the same language/tone rules.
 */
export async function generateApplicationArtifacts(
  cvData: CV,
  jobData: JobListing,
  options: {
    tone: CoverLetterTone;
    language: string;
    includeCoverLetter: boolean;
  }
): Promise<ApplicationArtifacts> {
  const [customCV, coverLetter] = await Promise.all([
    generateCustomCV(cvData, jobData, options.language),
    options.includeCoverLetter
      ? generateCoverLetter(cvData, jobData, options.tone, undefined, options.language)
      : Promise.resolve(null),
  ]);

  // Evaluator failure should not discard the generated CV.
  const atsAnalysis = await scoreCV(customCV, jobData).catch((error: unknown) => {
    console.warn('ATS evaluation failed; saving application without it:', error);
    return null;
  });

  return {
    customCV,
    coverLetterContent: coverLetter?.content ?? null,
    atsAnalysis,
    matchScore: calculateMatchScore(customCV, jobData),
  };
}
