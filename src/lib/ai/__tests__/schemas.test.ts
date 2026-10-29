/**
 * @jest-environment node
 */
import {
  atsEvaluationSchema,
  coverLetterResultSchema,
  generatedCVSchema,
  jobAnalysisSchema,
} from '../schemas';

describe('generatedCVSchema', () => {
  it('accepts null optional sections and fills safe defaults', () => {
    const result = generatedCVSchema.parse({
      personalInfo: { name: 'Jane', email: 'jane@example.com', phone: null },
      summary: null,
      experience: null,
      education: null,
      skills: [{ category: 'Technical Skills', items: null }],
      projects: null,
      certifications: null,
      atsOptimizations: null,
    });

    expect(result.experience).toEqual([]);
    expect(result.skills[0].items).toEqual([]);
    expect(result.personalInfo.phone).toBeUndefined();
    expect(result.atsOptimizations.keywordsAdded).toEqual([]);
  });

  it('rejects structurally invalid output (non-object personalInfo)', () => {
    expect(() =>
      generatedCVSchema.parse({ personalInfo: 'Jane', experience: [] })
    ).toThrow();
  });

  it('rejects self-reported matchScore outside 0-100', () => {
    expect(() =>
      generatedCVSchema.parse({
        personalInfo: { name: 'Jane', email: '' },
        atsOptimizations: { matchScore: 250 },
      })
    ).toThrow();
  });
});

describe('atsEvaluationSchema', () => {
  it('requires a numeric score and rounds it', () => {
    const result = atsEvaluationSchema.parse({ score: 81.6, formatScore: 30 });
    expect(result.score).toBe(82);
    expect(result.keywordScore).toBe(0);
  });

  it('rejects a missing score', () => {
    expect(() => atsEvaluationSchema.parse({ formatScore: 30 })).toThrow();
  });
});

describe('jobAnalysisSchema', () => {
  it('maps unknown seniority to a safe default', () => {
    const result = jobAnalysisSchema.parse({
      keywords: { technical: ['Go'] },
      seniorityLevel: 'wizard',
    });
    expect(result.seniorityLevel).toBe('mid');
    expect(result.keywords.soft).toEqual([]);
  });
});

describe('coverLetterResultSchema', () => {
  it('rejects a cover letter that is too short to be useful', () => {
    expect(() => coverLetterResultSchema.parse({ content: 'Hi team' })).toThrow();
  });
});
