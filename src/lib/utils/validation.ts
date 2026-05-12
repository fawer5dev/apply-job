import { z } from 'zod';

// Base CV validation
export const baseCVSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  personalInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      title: z.string().min(1, 'Title is required'),
      company: z.string().min(1, 'Company is required'),
      location: z.string().optional(),
      startDate: z.string().min(1, 'Start date is required'),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
      achievements: z.array(z.string()),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string().min(1, 'Degree is required'),
      institution: z.string().min(1, 'Institution is required'),
      location: z.string().optional(),
      graduationDate: z.string().min(1, 'Graduation date is required'),
      gpa: z.string().optional(),
      description: z.string().optional(),
    })
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    })
  ),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()),
        url: z.string().url().optional().or(z.literal('')),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
        url: z.string().url().optional().or(z.literal('')),
      })
    )
    .optional(),
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
