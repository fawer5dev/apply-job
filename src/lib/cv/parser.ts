import mammoth from 'mammoth';
import type { Experience, ParsedCV } from '@/types';
import { generateJSON } from '@/lib/ai/service';
import type { PdfAttachment } from '@/lib/ai/google-ai';
import { DATA_SAFETY_RULES } from '@/lib/ai/prompts';
import { parsedCVSchema } from '@/lib/ai/schemas';
import {
  CVInputError,
  MAX_CV_TEXT_CHARS,
  MAX_VISUAL_PDF_PAGES,
  MIN_CV_TEXT_CHARS,
  type CVFileKind,
} from './file-validation';
import { analyzePdf } from './pdf-analysis';

/** How the CV text was obtained. Shown to the user for review. */
export type ExtractionMethod = 'text' | 'visual';

export interface ParseCVResult {
  cv: ParsedCV;
  extractionMethod: ExtractionMethod;
}

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
 * Read an already validated CV file and structure it with AI.
 *
 * - DOCX/TXT and PDFs with a text layer use the extracted text.
 * - PDFs without a usable text layer (scanned or mixed) are sent to Gemini
 *   visually, up to MAX_VISUAL_PDF_PAGES pages.
 *
 * Extracted text is used only for this call and is not returned or stored.
 */
export async function parseCV(
  buffer: Buffer,
  kind: CVFileKind
): Promise<ParseCVResult> {
  if (kind === 'pdf') {
    return parsePDFCV(buffer);
  }

  const rawText = await extractText(buffer, kind);
  return {
    cv: await structureCV({ text: validateExtractedText(rawText) }),
    extractionMethod: 'text',
  };
}

async function parsePDFCV(buffer: Buffer): Promise<ParseCVResult> {
  let analysis;
  try {
    analysis = await analyzePdf(buffer);
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new CVInputError(
      'The file could not be read. Check that it is not corrupted or password-protected.',
      422,
      'FILE_UNREADABLE'
    );
  }

  if (analysis.kind === 'text') {
    return {
      cv: await structureCV({ text: validateExtractedText(analysis.text) }),
      extractionMethod: 'text',
    };
  }

  // Scanned or mixed: visual reading. Keep the page cap to bound cost.
  if (analysis.pageCount > MAX_VISUAL_PDF_PAGES) {
    throw new CVInputError(
      `This PDF has no readable text on some or all pages and has ${analysis.pageCount} pages. Scanned CVs are limited to ${MAX_VISUAL_PDF_PAGES} pages. Upload a shorter version or a text-based PDF.`,
      422,
      'PDF_TOO_MANY_PAGES'
    );
  }

  console.log(
    `PDF classified as ${analysis.kind}; reading ${analysis.pageCount} page(s) visually.`
  );
  return {
    cv: await parseCVVisually(buffer),
    extractionMethod: 'visual',
  };
}

async function extractText(
  buffer: Buffer,
  kind: Exclude<CVFileKind, 'pdf'>
): Promise<string> {
  try {
    if (kind === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    return buffer.toString('utf8');
  } catch (error) {
    console.error('Error extracting CV text:', error);
    throw new CVInputError(
      'The file could not be read. Check that it is not corrupted or password-protected.',
      422,
      'FILE_UNREADABLE'
    );
  }
}

function validateExtractedText(rawText: string): string {
  const text = rawText.replace(/\u0000/g, '').trim();
  if (text.length < MIN_CV_TEXT_CHARS) {
    throw new CVInputError(
      'No readable text was found. Use a text-based PDF, DOCX or TXT.',
      422,
      'NO_TEXT'
    );
  }
  if (text.length > MAX_CV_TEXT_CHARS) {
    throw new CVInputError(
      'The CV text is too long. Shorten it to about 2 pages and try again.',
      422,
      'TEXT_TOO_LONG'
    );
  }
  return text;
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Structure a CV with Gemini. Input is either the extracted text or the PDF
 * itself (visual reading, for scanned or mixed documents).
 */
async function structureCV(input: {
  text: string;
  attachments?: PdfAttachment[];
}): Promise<ParsedCV> {
  const text = input.text;
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
- If text is illegible or cut off, leave that field empty; never guess names, dates, emails or phone numbers
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
      attachments: input.attachments,
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
    console.error('Error in structureCV:', error);
    throw error;
  }
}

/**
 * Read a PDF whose text layer is missing or incomplete by sending the file to
 * Gemini. The PDF lives only in memory for this request.
 */
export async function parseCVVisually(buffer: Buffer): Promise<ParsedCV> {
  return structureCV({
    text:
      'The CV is provided as an attached PDF document. Read every page, including text that appears only in images. Pages may be scanned or photographed.',
    attachments: [
      { mimeType: 'application/pdf', data: buffer.toString('base64') },
    ],
  });
}


