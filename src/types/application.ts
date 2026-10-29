import { CV } from './cv';

export type ApplicationStatus =
    | 'DRAFT'
    | 'READY'
    | 'APPLIED'
    | 'INTERVIEWING'
    | 'OFFERED'
    | 'REJECTED'
    | 'ACCEPTED'
    | 'WITHDRAWN';

/**
 * AI estimate produced by the ATS evaluator. Not a real ATS result.
 * Sub-scores: formatScore 0-40, keywordScore 0-30, structureScore 0-20,
 * lengthScore 0-10; score is their sum.
 */
export interface ATSAnalysis {
    score: number; // 0-100, AI estimate
    formatScore: number;
    keywordScore: number;
    structureScore: number;
    lengthScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keywordsMatched: number;
    keywordsTotal: number;
}

export interface Application {
    id: string;
    userId: string;
    baseCVId: string;
    jobListingId: string;
    customCV: CV;
    atsScore?: number;
    atsAnalysis?: ATSAnalysis;
    matchScore?: number;
    status: ApplicationStatus;
    appliedAt?: Date;
    cvPdfUrl?: string;
    coverLetterId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApplicationWithRelations extends Application {
    job_listings: {
        title: string;
        company: string;
        location?: string;
    };
}
