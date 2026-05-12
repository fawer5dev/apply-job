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

export interface ATSAnalysis {
    score: number; // 0-100
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    keywordsMatched: number;
    keywordsTotal: number;
    formatScore: number;
    contentScore: number;
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
    jobListing: {
        title: string;
        company: string;
        location?: string;
    };
}
