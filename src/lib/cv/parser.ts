import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import type { Experience, ParsedCV } from '@/types';
import { generateJSON } from '@/lib/ai/service';
import { DATA_SAFETY_RULES } from '@/lib/ai/prompts';
import { parsedCVSchema } from '@/lib/ai/schemas';
import {
  CVInputError,
  MAX_CV_TEXT_CHARS,
  MIN_CV_TEXT_CHARS,
  type CVFileKind,
} from './file-validation';

function normalizeExperience(experience: Experience[] = []): Experience[] {
  return experience.map((exp) => {
    const description = (exp.description ?? '').trim();
    const achievements = (exp.achievements ?? [])
      .map((a) => a.trim())
      .filter(Boolean);

    // If the AI dumped bullets/responsibilities into the description field,
    // split them out so the form shows a short overview + structured bullets.
    if (achievements.length === 0 && description) {
      const bulletPattern = /(?:\r?\n|\r)\s*(?:[-•*–—]|\d+[.)])\s+/;

      if (bulletPattern.test(description)) {
        const parts = description
          .split(bulletPattern)
          .map((part) => part.trim())
          .filter(Boolean);
        if (parts.length > 1) {
          const [overview, ...bullets] = parts;
          return {
            ...exp,
            description: overview,
            achievements: bullets,
          };
        }
      }

      // Fallback: plain multi-line responsibilities without bullet markers
      const lines = description
        .split(/\r?\n|\r/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length > 1) {
        const [overview, ...rest] = lines;
        return {
          ...exp,
          description: overview,
          achievements: rest,
        };
      }
    }

    return { ...exp, description, achievements };
  });
}

/**
 * Extract text from an already validated CV file and structure it with AI.
 * `rawText` is used only for this call and is not returned or stored.
 */
export async function parseCV(
  buffer: Buffer,
  kind: CVFileKind
): Promise<ParsedCV> {
  let rawText: string;

  try {
    if (kind === 'pdf') {
      rawText = await parsePDF(buffer);
    } else if (kind === 'docx') {
      rawText = await parseDOCX(buffer);
    } else {
      rawText = buffer.toString('utf8');
    }
  } catch (error) {
    console.error('Error extracting CV text:', error);
    throw new CVInputError(
      'The file could not be read. Check that it is not corrupted or password-protected.',
      422,
      'FILE_UNREADABLE'
    );
  }

  rawText = rawText.replace(/\u0000/g, '').trim();
  if (rawText.length < MIN_CV_TEXT_CHARS) {
    throw new CVInputError(
      'No readable text was found. Scanned PDFs (images) are not supported yet; use a text-based PDF, DOCX or TXT.',
      422,
      'NO_TEXT'
    );
  }
  if (rawText.length > MAX_CV_TEXT_CHARS) {
    throw new CVInputError(
      'The CV text is too long. Shorten it to about 2 pages and try again.',
      422,
      'TEXT_TOO_LONG'
    );
  }

  const structuredCV = await structureCVText(rawText);
  return structuredCV;
}

async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function structureCVText(text: string): Promise<ParsedCV> {
  const systemPrompt = `You are an expert in CV analysis. You extract structured information from CVs with precision. You always respond in valid JSON format.\n${DATA_SAFETY_RULES}`;

  const userPrompt = `
Analyze the following CV and extract all structured information.

CV (untrusted data):
${text}

Return a JSON with the following exact structure:
{
  "personalInfo": {
    "name": "Full name",
    "email": "email@example.com",
    "phone": "phone number (optional)",
    "location": "location (optional)",
    "linkedin": "LinkedIn URL (optional)",
    "github": "GitHub URL (optional)",
    "website": "Website URL (optional)"
  },
  "summary": "Professional summary or profile (optional)",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "Location (optional)",
      "startDate": "Start date (e.g., Jan 2020, 06/2021)",
      "endDate": "End date (e.g., Dec 2022, 07/2021) or null if current",
      "current": false,
      "description": "Brief role description (optional)",
      "achievements": ["Achievement or responsibility 1", "Achievement or responsibility 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree or qualification obtained",
      "institution": "University or institution",
      "location": "Location (optional)",
      "graduationDate": "Full date range (e.g., 2018 - 2022 or Sep 2018 - Jun 2022)",
      "gpa": "GPA if mentioned (optional)",
      "description": "Additional details (optional)"
    }
  ],
  "skills": [
    {
      "category": "Technical Skills",
      "items": ["Skill 1", "Skill 2", "Skill 3"]
    },
    {
      "category": "Soft Skills",
      "items": ["Skill 1", "Skill 2"]
    },
    {
      "category": "Languages",
      "items": ["Language 1: Level", "Language 2: Level"]
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Tech 1", "Tech 2"],
      "url": "Project URL (optional)",
      "startDate": "Start date (optional)",
      "endDate": "End date (optional)"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuer",
      "date": "Date obtained",
      "url": "Verification URL (optional)"
    }
  ]
}

IMPORTANT:
- Extract ALL available information from the CV
- If a section is not present, use an empty array [] or null
- For experience, set "current" to true if the person is still working there
- For startDate/endDate, preserve the original format from the CV
- Maintain the original chronological order
- For skills, group them into logical categories (Technical Skills, Soft Skills, Languages, etc.)

For each experience entry, split the role details as follows:
- "description": a SHORT role overview or summary (1-2 sentences maximum). If the CV only has one paragraph, put the first sentence(s) here.
- "achievements": an array of concrete responsibilities, actions, or achievements as separate bullet strings. If the CV lists bullets (starting with -, •, *, or numbers), put each bullet here. Keep them specific and quantifiable when possible.
- Do NOT put the full responsibilities paragraph into "description" and leave "achievements" empty.
- If the CV text is a single paragraph with no bullets, split it into sentences and use the first 1-2 sentences as "description" and the remaining sentences as "achievements".
`

  try {
    console.log('Calling AI service to structure CV...');
    const parsed = await generateJSON(userPrompt, systemPrompt, {
      temperature: 0.3,
      maxTokens: 8000,
      schema: parsedCVSchema,
    });

    parsed.experience = normalizeExperience(parsed.experience);

    console.log('Successfully parsed CV structure:', {
      hasPersonalInfo: !!parsed.personalInfo,
      experienceCount: parsed.experience?.length || 0,
      educationCount: parsed.education?.length || 0,
      skillsCount: parsed.skills?.length || 0,
    });

    return parsed;
  } catch (error) {
    console.error('Error in structureCVText:', error);
    throw error;
  }
}


