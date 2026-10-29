import { z } from 'zod';

/**
 * Zod schemas for every AI response. Each AI operation parses its output with
 * one of these before anything is persisted or rendered to a PDF.
 *
 * Model output is untrusted: fields are coerced to safe defaults where a
 * missing value is harmless, and anything structurally wrong makes
 * `generateJSON` fail (and retry) instead of reaching the database.
 *
 * Models often return `null` for fields they cannot read (for example a date
 * in a scanned CV). Required text fields accept null and become '' so an
 * unreadable value does not fail the whole response.
 */

const optionalText = z
  .string()
  .nullish()
  .transform((value) => value?.trim() || undefined);

/** Required text: null/undefined becomes '' (caller decides how to handle). */
const requiredText = z
  .string()
  .nullish()
  .transform((value) => value?.trim() ?? '');

const textList = z
  .array(z.string())
  .nullish()
  .transform((value) =>
    (value ?? []).map((item) => item.trim()).filter(Boolean)
  );

const score = z
  .number()
  .min(0)
  .max(100)
  .transform((value) => Math.round(value));

// ---------- CV ----------

export const personalInfoSchema = z.object({
  name: requiredText,
  email: requiredText,
  phone: optionalText,
  location: optionalText,
  linkedin: optionalText,
  github: optionalText,
  website: optionalText,
});

export const experienceSchema = z.object({
  title: requiredText,
  company: requiredText,
  location: optionalText,
  startDate: requiredText,
  endDate: optionalText,
  current: z.boolean().nullish().transform((value) => value ?? undefined),
  description: optionalText,
  achievements: textList,
});

export const educationSchema = z.object({
  degree: requiredText,
  institution: requiredText,
  location: optionalText,
  graduationDate: requiredText,
  gpa: optionalText,
  description: optionalText,
});

export const skillCategorySchema = z.object({
  category: requiredText.transform((value) => value || 'Skills'),
  items: textList,
});

export const projectSchema = z.object({
  name: requiredText,
  description: requiredText,
  technologies: textList,
  url: optionalText,
  startDate: optionalText,
  endDate: optionalText,
});

export const certificationSchema = z.object({
  name: requiredText,
  issuer: requiredText,
  date: requiredText,
  url: optionalText,
});

/** Shared CV body: used for CV parsing and for CV adaptation. */
export const cvBodySchema = z.object({
  personalInfo: personalInfoSchema,
  summary: optionalText,
  experience: z
    .array(experienceSchema)
    .nullish()
    .transform((value) => value ?? []),
  education: z
    .array(educationSchema)
    .nullish()
    .transform((value) => value ?? []),
  skills: z
    .array(skillCategorySchema)
    .nullish()
    .transform((value) => value ?? []),
  projects: z
    .array(projectSchema)
    .nullish()
    .transform((value) => value ?? []),
  certifications: z
    .array(certificationSchema)
    .nullish()
    .transform((value) => value ?? []),
});

export const parsedCVSchema = cvBodySchema;

export const generatedCVSchema = cvBodySchema.extend({
  atsOptimizations: z
    .object({
      keywordsAdded: textList,
      sectionsReordered: textList,
      // Self-reported by the model; NOT used as a score. See ats-scorer.ts.
      matchScore: z
        .number()
        .min(0)
        .max(100)
        .nullish()
        .transform((value) => (value == null ? undefined : Math.round(value))),
    })
    .nullish()
    .transform(
      (value) =>
        value ?? {
          keywordsAdded: [],
          sectionsReordered: [],
          matchScore: undefined,
        }
    ),
});

// ---------- Job offer ----------

export const jobRequirementSchema = z.object({
  category: z.enum(['required', 'preferred', 'bonus']).catch('preferred'),
  skill: requiredText,
  description: optionalText,
});

export const jobKeywordsSchema = z.object({
  technical: textList,
  soft: textList,
  tools: textList,
});

export const jobAnalysisSchema = z.object({
  keywords: jobKeywordsSchema,
  requirements: z
    .array(jobRequirementSchema)
    .nullish()
    .transform((value) => value ?? []),
  skillsBreakdown: z
    .object({
      technical: textList,
      soft: textList,
      experience: textList,
    })
    .nullish()
    .transform(
      (value) => value ?? { technical: [], soft: [], experience: [] }
    ),
  seniorityLevel: z
    .enum(['junior', 'mid', 'senior', 'lead', 'executive'])
    .catch('mid'),
  matchScore: z.number().nullish().transform((v) => (v == null ? undefined : v)),
});

export const jobRequirementsResultSchema = z.object({
  requirements: z
    .array(jobRequirementSchema)
    .nullish()
    .transform((value) => value ?? []),
});

// ---------- ATS evaluation ----------

export const atsEvaluationSchema = z.object({
  score,
  formatScore: score.nullish().transform((v) => v ?? 0),
  keywordScore: score.nullish().transform((v) => v ?? 0),
  structureScore: score.nullish().transform((v) => v ?? 0),
  lengthScore: score.nullish().transform((v) => v ?? 0),
  strengths: textList,
  weaknesses: textList,
  suggestions: textList,
  keywordsMatched: z.number().int().min(0).nullish().transform((v) => v ?? 0),
  keywordsTotal: z.number().int().min(0).nullish().transform((v) => v ?? 0),
});

// ---------- Cover letter ----------

export const coverLetterResultSchema = z.object({
  content: z.string().trim().min(100, 'Cover letter is too short'),
});
