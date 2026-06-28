import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import type { Experience, ParsedCV } from '@/types';

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

export async function parseCV(file: File): Promise<ParsedCV> {
  const fileType = file.type;
  let rawText = '';

  try {
    if (fileType === 'application/pdf') {
      rawText = await parsePDF(file);
    } else if (
      fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      rawText = await parseDOCX(file);
    } else if (fileType === 'text/plain') {
      rawText = await file.text();
    } else {
      throw new Error('File type not supported');
    }

    // Use OpenAI to structure the parsed text
    const structuredCV = await structureCVText(rawText);
    return {
      ...structuredCV,
      rawText,
    };
  } catch (error) {
    console.error('Error parsing CV:', error);
    throw new Error('Could not parse CV');
  }
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdf(buffer);
  return data.text;
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function structureCVText(text: string): Promise<ParsedCV> {
  const systemPrompt =
    'You are an expert in CV analysis. You extract structured information from CVs with precision. You always respond in valid JSON format.';

  const userPrompt = `
Analyze the following CV and extract all structured information.

CV:
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
    const { generateJSON } = await import('@/lib/ai/service');
    const parsed = await generateJSON<Omit<ParsedCV, 'rawText'>>(
      userPrompt,
      systemPrompt,
      {
        temperature: 0.3,
        maxTokens: 8000,
      }
    );

    parsed.experience = normalizeExperience(parsed.experience);

    console.log('Successfully parsed CV structure:', {
      hasPersonalInfo: !!parsed.personalInfo,
      experienceCount: parsed.experience?.length || 0,
      educationCount: parsed.education?.length || 0,
      skillsCount: parsed.skills?.length || 0,
    });

    return {
      ...parsed,
      rawText: text,
    };
  } catch (error) {
    console.error('Error in structureCVText:', error);
    throw error;
  }
}

export async function enhanceParsedCV(rawText: string): Promise<ParsedCV> {
  // Future implementation: use OpenAI to better structure the CV
  // For now use the basic implementation
  return structureCVText(rawText);
}
