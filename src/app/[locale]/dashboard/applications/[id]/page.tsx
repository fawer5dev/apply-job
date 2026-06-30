'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  ArrowLeft,
  Download,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Trash2,
  X,
} from 'lucide-react';

// Helper function to clean markdown formatting
const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic/list markers
    .replace(/^[-•]\s+/gm, '') // Remove list markers at start of lines
    .trim();
};

// Helper to convert a string to Title Case
const toTitleCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

// Converts the signature name in a cover letter to Title Case
const processSignatureCase = (content: string): string => {
  if (!content) return content;
  const lines = content.split('\n');
  let inSignatureBlock = false;
  return lines
    .map((line) => {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.includes('best regards') || trimmed.includes('sincerely')) {
        inSignatureBlock = true;
        return line;
      }
      if (inSignatureBlock && line.trim()) {
        return toTitleCase(line);
      }
      return line;
    })
    .join('\n');
};

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
  job_listings: {
    title: string;
    company: string;
    location: string | null;
    workMode: string | null;
    salary: string | null;
    description: string;
  };
  base_cvs: {
    title: string;
  };
  cover_letters: {
    content: string;
  } | null;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('Applications');
  const id = params.id as string;

  const [application, setApplication] = useState<ApplicationDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'cv' | 'cover-letter' | 'job'>(
    'cv'
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const allStatuses = [
    'DRAFT',
    'READY',
    'APPLIED',
    'INTERVIEWING',
    'OFFERED',
    'REJECTED',
    'ACCEPTED',
    'WITHDRAWN',
  ];

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

      // Create blob with octet-stream to avoid OS-level PDF handler launch
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
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

      // Create blob with octet-stream to avoid OS-level PDF handler launch
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
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

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === application?.status) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/application/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      setApplication(data.application);
      showToast(t('notifications.statusUpdated'), 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(t('notifications.statusError'), 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/application/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      showToast(t('notifications.deleted'), 'success');
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 1000);
    } catch (err) {
      console.error('Error deleting application:', err);
      showToast(t('notifications.deleteError'), 'error');
      setIsDeleting(false);
      setShowDeleteModal(false);
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
      <div className="flex flex-col">
        <div className="container py-8">
          <Link
            href="/dashboard/applications"
            className="group mb-8 inline-flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold">{t('backToApplications')}</span>
          </Link>
          <div className="rounded-lg border border-red-500 bg-red-50 p-6 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error || 'Application not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-20 z-50 animate-in slide-in-from-top-5">
          <div
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                : 'border-red-500 bg-red-50 text-red-800 dark:bg-red-950 dark:text-green-200'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {t('actions.deleteConfirm')}
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                disabled={isDeleting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {t('actions.confirmDeleteMessage')}
            </p>
            <p className="mb-6 text-sm font-medium text-muted-foreground">
              {t('actions.deleteWarning')}
            </p>
            <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('actions.deleting')}
                  </>
                ) : (
                  t('actions.delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            href="/dashboard/applications"
            className="group flex min-w-0 items-center gap-2 transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-colors group-hover:text-primary" />
            <span className="truncate font-bold transition-colors group-hover:text-primary">
              {t('backToApplications')}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleDownloadCV}
              className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:w-auto sm:px-4"
              aria-label={t('downloadCV')}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('downloadCV')}</span>
            </button>
            <button
              onClick={handleDownloadCoverLetter}
              className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:w-auto sm:px-4"
              aria-label={t('downloadCoverLetter')}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('coverLetter')}</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-md border border-red-500 bg-background text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 sm:w-auto sm:px-4"
              aria-label={t('actions.delete')}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{t('actions.delete')}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="container flex-1 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                  {application.job_listings.title}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${getStatusColor(application.status)}`}
                >
                  {t(`status.${application.status}`)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="break-words">{application.job_listings.company}</span>
                </div>
                {application.job_listings.location && (
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="break-words">{application.job_listings.location}</span>
                  </div>
                )}
                {application.job_listings.salary && (
                  <div className="flex min-w-0 items-center gap-2">
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span className="break-words">{application.job_listings.salary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="w-full sm:min-w-[200px] sm:w-auto">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                {t('labels.currentStatus')}
              </label>
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {allStatuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`status.${status}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('atsScore')}
                </span>
              </div>
              <p
                className={`break-words text-2xl font-bold ${getScoreColor(application.atsScore)}`}
              >
                {application.atsScore?.toFixed(0) || 'N/A'}%
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('matchScore')}
                </span>
              </div>
              <p
                className={`break-words text-2xl font-bold ${getScoreColor(application.matchScore)}`}
              >
                {application.matchScore?.toFixed(0) || 'N/A'}%
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t('created')}
                </span>
              </div>
              <p className="break-words text-2xl font-bold">
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <button
              onClick={() => setActiveTab('cv')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === 'cv'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('tabs.customCV')}
            </button>
            <button
              onClick={() => setActiveTab('cover-letter')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === 'cover-letter'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('tabs.coverLetter')}
            </button>
            <button
              onClick={() => setActiveTab('job')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                activeTab === 'job'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('tabs.jobDescription')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border p-6">
          {activeTab === 'cv' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">{t('detail.customCV')}</h2>
              {application.customCV ? (
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="mb-2 font-semibold">{t('detail.personalInfo')}</h3>
                    <div className="text-sm text-muted-foreground">
                      <p>{application.customCV.personalInfo?.name}</p>
                      <p>{application.customCV.personalInfo?.email}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  {application.customCV.summary && (
                    <div>
                      <h3 className="mb-2 font-semibold">{t('detail.summary')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cleanMarkdown(application.customCV.summary)}
                      </p>
                    </div>
                  )}

                  {/* Skills - Moved after Summary */}
                  {application.customCV.skills &&
                    application.customCV.skills.length > 0 && (
                      <div>
                        <h3 className="mb-3 font-semibold">{t('detail.keySkills')}</h3>
                        <div className="space-y-4">
                          {application.customCV.skills
                            .filter(
                              (skillCategory: any) =>
                                skillCategory.items &&
                                skillCategory.items.length > 0
                            )
                            .map((skillCategory: any, index: number) => (
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
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Experience */}
                  {application.customCV.experience &&
                    application.customCV.experience.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold">{t('detail.experience')}</h3>
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
                                  {exp.current ? t('detail.present') : exp.endDate}
                                </p>
                                {exp.achievements &&
                                  exp.achievements.length > 0 && (
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                                      {exp.achievements.map(
                                        (achievement: string, i: number) => (
                                          <li key={i}>{cleanMarkdown(achievement)}</li>
                                        )
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
                        <h3 className="mb-2 font-semibold">{t('detail.education')}</h3>
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
                  {t('detail.noCVData')}
                </p>
              )}
            </div>
          )}

          {activeTab === 'cover-letter' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">{t('detail.coverLetter')}</h2>
              {application.cover_letters ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                    {processSignatureCase(application.cover_letters.content)}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('detail.noCoverLetter')}
                </p>
              )}
            </div>
          )}

          {activeTab === 'job' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">{t('detail.jobDescription')}</h2>
              <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                {application.job_listings.description}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
