/**
 * @jest-environment node
 */
import { calculateMatchScore } from '../ats-scorer';
import type { CV, JobListing } from '@/types';

jest.mock('../google-ai', () => ({
  generateContent: jest.fn(),
}));

const cv: CV = {
  personalInfo: { name: 'Jane Doe', email: 'jane@example.com' },
  experience: [
    {
      title: 'Backend Developer',
      company: 'Acme',
      startDate: '2020',
      achievements: ['Built APIs in Node.js and PostgreSQL'],
    },
  ],
  education: [],
  skills: [{ category: 'Technical Skills', items: ['TypeScript', 'C++'] }],
};

const job = (keywords: JobListing['keywords']): JobListing => ({
  title: 'Engineer',
  company: 'Globex',
  description: 'x'.repeat(60),
  requirements: [],
  keywords,
});

describe('calculateMatchScore', () => {
  it('computes the share of offer keywords present in the CV', () => {
    const score = calculateMatchScore(
      cv,
      job({ technical: ['TypeScript', 'Go'], soft: [], tools: ['PostgreSQL', 'Docker'] })
    );
    // 2 of 4 keywords match
    expect(score).toBe(50);
  });

  it('matches whole terms only (no substring false positives)', () => {
    // "Java" must not match "JavaScript" in the CV
    const score = calculateMatchScore(
      cv,
      job({ technical: ['Java'], soft: [], tools: [] })
    );
    expect(score).toBe(0);
  });

  it('handles symbols such as C++ and Node.js', () => {
    expect(
      calculateMatchScore(cv, job({ technical: ['C++'], soft: [], tools: [] }))
    ).toBe(100);
    expect(
      calculateMatchScore(cv, job({ technical: ['Node.js'], soft: [], tools: [] }))
    ).toBe(100);
  });

  it('is case and accent insensitive', () => {
    expect(
      calculateMatchScore(cv, job({ technical: ['typescript'], soft: [], tools: [] }))
    ).toBe(100);
  });

  it('returns null when the offer has no keywords', () => {
    expect(calculateMatchScore(cv, job({ technical: [], soft: [], tools: [] }))).toBeNull();
  });
});
