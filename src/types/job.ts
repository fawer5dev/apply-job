export interface JobRequirement {
    category: 'required' | 'preferred' | 'bonus';
    skill: string;
    description?: string;
}

export interface JobKeywords {
    technical: string[];
    soft: string[];
    tools: string[];
}

export interface JobListing {
    title: string;
    company: string;
    location?: string;
    workMode?: 'remote' | 'hybrid' | 'onsite';
    salary?: string;
    description: string;
    requirements: JobRequirement[];
    keywords: JobKeywords;
    url?: string;
    source?: string;
}

export interface JobAnalysis {
    keywords: JobKeywords;
    requirements: JobRequirement[];
    skillsBreakdown: {
        technical: string[];
        soft: string[];
        experience: string[];
    };
    seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
    matchScore?: number;
}
