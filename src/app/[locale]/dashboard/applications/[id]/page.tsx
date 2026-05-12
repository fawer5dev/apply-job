'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import {
  Loader2,
  ArrowLeft,
  Briefcase,
  FileText,
  Download,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
} from 'lucide-react';

interface ApplicationDetail {
  id: string;
  status: string;
  atsScore: number | null;
  matchScore: number | null;
  createdAt: string;
  appliedAt: string | null;
  notes: string | null;
  customCV: any;
  atsAnalysis: any;
  jobListing: {
    title: string;
    company: string;
    location: string | null;
    workMode: string | null;
    salary: string | null;
    description: string;
  };
  baseCV: {
    title: string;
  };
  coverLetter: {
    content: string;
  } | null;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'cv' | 'cover-letter' | 'job'>(
    'cv'
  );

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/application/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error loading application');
      }

      setApplication(data.application);
    } catch (err) {
      console.error('Error loading application:', err);
      setError(
        err instanceof Error ? err.message : 'Error loading application'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      READY: 'bg-blue-100 text-blue-800',
      APPLIED: 'bg-green-100 text-green-800',
      INTERVIEWING: 'bg-purple-100 text-purple-800',
      OFFERED: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACCEPTED: 'bg-emerald-100 text-emerald-800',
      WITHDRAWN: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleDownloadCV = async () => {
    try {
      const response = await fetch(`/api/application/${id}/download-cv`);
      if (!response.ok) {
        throw new Error('Failed to download CV');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'CV.pdf';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CV:', err);
      alert('Error downloading CV. Please try again.');
    }
  };

  const handleDownloadCoverLetter = async () => {
    try {
      const response = await fetch(
        `/api/application/${id}/download-cover-letter`
      );
      if (!response.ok) {
        throw new Error('Failed to download cover letter');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'CoverLetter.pdf';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading cover letter:', err);
      alert('Error downloading cover letter. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center">
            <Link
              href="/dashboard/applications"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-bold">Back to Applications</span>
            </Link>
          </div>
        </header>
        <main className="container flex-1 py-8">
          <div className="rounded-lg border border-red-500 bg-red-50 p-6 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error || 'Application not found'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link
            href="/dashboard/applications"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold">Back to Applications</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCV}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-4 w-4" />
              Download CV
            </button>
            <button
              onClick={handleDownloadCoverLetter}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-4 w-4" />
              Download Cover Letter
            </button>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {application.jobListing.title}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(application.status)}`}
                >
                  {application.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{application.jobListing.company}</span>
                </div>
                {application.jobListing.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{application.jobListing.location}</span>
                  </div>
                )}
                {application.jobListing.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{application.jobListing.salary}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  ATS Score
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${getScoreColor(application.atsScore)}`}
              >
                {application.atsScore?.toFixed(0) || 'N/A'}%
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Match Score
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${getScoreColor(application.matchScore)}`}
              >
                {application.matchScore?.toFixed(0) || 'N/A'}%
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Created
                </span>
              </div>
              <p className="text-2xl font-bold">
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('cv')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === 'cv'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Custom CV
            </button>
            <button
              onClick={() => setActiveTab('cover-letter')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === 'cover-letter'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === 'job'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Job Description
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border p-6">
          {activeTab === 'cv' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Custom CV</h2>
              {application.customCV ? (
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="mb-2 font-semibold">Personal Information</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{application.customCV.personalInfo?.name}</p>
                      <p>{application.customCV.personalInfo?.email}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  {application.customCV.summary && (
                    <div>
                      <h3 className="mb-2 font-semibold">Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        {application.customCV.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills - Moved after Summary */}
                  {application.customCV.skills &&
                    application.customCV.skills.length > 0 && (
                      <div>
                        <h3 className="mb-3 font-semibold">Key Skills</h3>
                        <div className="space-y-4">
                          {application.customCV.skills.map(
                            (skillCategory: any, index: number) => (
                              <div key={index}>
                                <h4 className="mb-2 text-sm font-medium text-foreground">
                                  {skillCategory.category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {skillCategory.items?.map(
                                    (skill: string, i: number) => (
                                      <span
                                        key={i}
                                        className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Experience */}
                  {application.customCV.experience &&
                    application.customCV.experience.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Experience</h3>
                        <div className="space-y-4">
                          {application.customCV.experience.map(
                            (exp: any, index: number) => (
                              <div key={index} className="text-sm">
                                <p className="font-medium">{exp.title}</p>
                                <p className="text-muted-foreground">
                                  {exp.company}
                                  {exp.location && ` · ${exp.location}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {exp.startDate} -{' '}
                                  {exp.current ? 'Present' : exp.endDate}
                                </p>
                                {exp.achievements &&
                                  exp.achievements.length > 0 && (
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                                      {exp.achievements
                                        .slice(0, 3)
                                        .map(
                                          (achievement: string, i: number) => (
                                            <li key={i}>{achievement}</li>
                                          )
                                        )}
                                      {exp.achievements.length > 3 && (
                                        <li className="italic">
                                          ... and {exp.achievements.length - 3}{' '}
                                          more
                                        </li>
                                      )}
                                    </ul>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Education */}
                  {application.customCV.education &&
                    application.customCV.education.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">Education</h3>
                        <div className="space-y-4">
                          {application.customCV.education.map(
                            (edu: any, index: number) => (
                              <div key={index} className="text-sm">
                                <p className="font-medium">{edu.degree}</p>
                                <p className="text-muted-foreground">
                                  {edu.institution}
                                  {edu.location && ` · ${edu.location}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {edu.graduationDate}
                                </p>
                                {edu.gpa && (
                                  <p className="text-xs text-muted-foreground">
                                    GPA: {edu.gpa}
                                  </p>
                                )}
                                {edu.description && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No CV data available
                </p>
              )}
            </div>
          )}

          {activeTab === 'cover-letter' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Cover Letter</h2>
              {application.coverLetter ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                    {application.coverLetter.content}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No cover letter available
                </p>
              )}
            </div>
          )}

          {activeTab === 'job' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Job Description</h2>
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                {application.jobListing.description}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
