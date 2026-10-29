// File limits (see src/lib/cv/file-validation.ts for accepted types and checks)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ATS Scoring
export const ATS_SCORE_WEIGHTS = {
  FORMAT_COMPATIBILITY: 0.4,
  KEYWORD_MATCH: 0.3,
  STRUCTURE_CLARITY: 0.2,
  LENGTH_APPROPRIATENESS: 0.1,
};

// Application statuses
export const APPLICATION_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'gray' },
  { value: 'READY', label: 'Ready', color: 'blue' },
  { value: 'APPLIED', label: 'Applied', color: 'green' },
  { value: 'INTERVIEWING', label: 'Interviewing', color: 'purple' },
  { value: 'OFFERED', label: 'Offer Received', color: 'yellow' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'emerald' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: 'orange' },
] as const;

// Cover letter tones
export const COVER_LETTER_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'creative', label: 'Creative' },
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
] as const;
