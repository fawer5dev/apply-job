import { generateJSON } from './google-ai';
import { JOB_ANALYZER_PROMPT } from './prompts';
import type { JobAnalysis, JobKeywords, JobRequirement } from '@/types';

export async function analyzeJobDescription(
  description: string,
  title: string,
  company: string
): Promise<JobAnalysis> {
  const prompt = `
${JOB_ANALYZER_PROMPT}

JOB DESCRIPTION:
Title: ${title}
Company: ${company}
Full description:
${description}

Analyze this offer and extract all relevant information.
`;

  const systemPrompt =
    'You are an expert in job offer analysis. You always respond in valid JSON format.';

  const analysis = await generateJSON<JobAnalysis>(prompt, systemPrompt, {
    temperature: 0.5, // Less creative for analysis
  });

  return analysis;
}

export async function extractKeywords(
  description: string
): Promise<JobKeywords> {
  const prompt = `
Extract the most important keywords from this job description.
Categorize them into: technical (languages, frameworks, technologies), soft (soft skills), tools (specific tools).

Job Description:
${description}

Return only JSON with this structure:
{
  "technical": ["keyword1", "keyword2"],
  "soft": ["keyword1", "keyword2"],
  "tools": ["keyword1", "keyword2"]
}
`;

  const systemPrompt =
    'You are an expert in keyword extraction. Respond only with JSON.';

  const keywords = await generateJSON<JobKeywords>(prompt, systemPrompt, {
    temperature: 0.3,
  });

  return keywords;
}

export async function extractRequirements(
  description: string
): Promise<JobRequirement[]> {
  const prompt = `
Extract the requirements from this job description.
Classify them as: required (required/must have), preferred (preferred/nice to have), bonus (bonus/plus).

Job Description:
${description}

Return JSON:
{
  "requirements": [
    {
      "category": "required",
      "skill": "Python",
      "description": "5+ years of experience"
    }
  ]
}
`;

  const systemPrompt =
    'Extract requirements from job descriptions. Respond only with JSON.';

  const result = await generateJSON<{ requirements: JobRequirement[] }>(
    prompt,
    systemPrompt,
    {
      temperature: 0.3,
    }
  );

  return result.requirements;
}
