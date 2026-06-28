import { z } from 'zod';

// The AI parser returns `null` for missing optional fields, so the schema must
// accept `null` in addition to `undefined` and coerce everything to clean
// string/array values that the form and database expect.
const optionalString = z
  .string()
  .nullish()
  .transform((value) => value ?? '');
const optionalUrl = z
  .string()
  .url()
  .or(z.literal(''))
  .nullish()
  .transform((value) => value ?? '');
const optionalStringArray = z
  .array(z.string())
  .nullish()
  .transform((value) => value ?? []);

// Base CV validation
export const baseCVSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  personalInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: optionalString,
    location: optionalString,
    linkedin: optionalUrl,
    github: optionalUrl,
    website: optionalUrl,
  }),
  summary: optionalString,
  experience: z
    .array(
      z.object({
        title: z.string().min(1, 'Title is required'),
        company: z.string().min(1, 'Company is required'),
        location: optionalString,
        startDate: z.string().min(1, 'Start date is required'),
        endDate: optionalString,
        current: z.boolean().optional(),
        description: optionalString,
        achievements: optionalStringArray,
      })
    )
    .nullish()
    .transform((value) => value ?? []),
  education: z
    .array(
      z.object({
        degree: z.string().min(1, 'Degree is required'),
        institution: z.string().min(1, 'Institution is required'),
        location: optionalString,
        graduationDate: z.string().min(1, 'Graduation date is required'),
        gpa: optionalString,
        description: optionalString,
      })
    )
    .nullish()
    .transform((value) => value ?? []),
  skills: z
    .array(
      z.object({
        category: z.string(),
        items: optionalStringArray,
      })
    )
    .nullish()
    .transform((value) => value ?? []),
  projects: z
    .array(
      z.object({
        name: optionalString,
        description: optionalString,
        technologies: optionalStringArray,
        url: optionalUrl,
        startDate: optionalString,
        endDate: optionalString,
      })
    )
    .nullish()
    .transform((value) => value ?? []),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
        url: optionalUrl,
      })
    )
    .nullish()
    .transform((value) => value ?? []),
});

export type BaseCVInput = z.infer<typeof baseCVSchema>;

// Job listing validation
export const jobListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  salary: z.string().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  url: z.string().url().optional().or(z.literal('')),
  source: z.string().optional(),
});

export type JobListingInput = z.infer<typeof jobListingSchema>;

// Cover letter validation
export const coverLetterSchema = z.object({
  tone: z.enum(['professional', 'creative', 'formal', 'friendly']),
  additionalInfo: z.string().optional(),
});

export type CoverLetterInput = z.infer<typeof coverLetterSchema>;
