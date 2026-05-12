import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import type { ParsedCV } from '@/types';

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
  // Use Google AI to extract CV structure
  const { generateContent } = await import('@/lib/ai/google-ai');

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
      "graduationDate": "Graduation date or period",
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
- Achievements should be specific and quantifiable when possible
- For skills, group them into logical categories (Technical Skills, Soft Skills, Languages, etc.)
- Extract key achievements mentioned in the CV
`;

  try {
    console.log('Calling Google AI to structure CV...');
    const content = await generateContent(systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 3000,
      responseFormat: 'json',
    });

    if (!content) {
      throw new Error('No response received from Google AI');
    }

    console.log('Received response from Google AI, parsing JSON...');
    const parsed = JSON.parse(content);

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
