'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-react';

type AICode =
  | 'AI_SERVICE_BUSY'
  | 'AI_RATE_LIMITED'
  | 'AI_API_KEY_MISSING'
  | 'AI_INVALID_RESPONSE'
  | 'AI_NETWORK_ERROR'
  | 'AI_UNKNOWN';

interface AIErrorState {
  message: string;
  code?: AICode;
  isRetryable?: boolean;
}

export default function NewApplicationPage() {
  const t = useTranslations('NewApplication');
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [base_cvs, setBaseCVs] = useState<any[]>([]);
  const [selectedCVId, setSelectedCVId] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingJob, setAnalyzingJob] = useState(false);
  const [generatingApplication, setGeneratingApplication] = useState(false);
  const [error, setError] = useState<AIErrorState | null>(null);

  // Job form data
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    workMode: '',
    salary: '',
    url: '',
  });

  const [jobListingId, setJobListingId] = useState('');
  const [applicationId, setApplicationId] = useState('');

  useEffect(() => {
    fetchBaseCVs();
  }, []);

  const fetchBaseCVs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cv/upload?userId=temp-user');
      const data = await response.json();
      setBaseCVs(data.base_cvs || []);
    } catch (err) {
      console.error('Error cargando CVs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeJob = async () => {
    if (!jobData.title || !jobData.company || !jobData.description) {
      setError({ message: t('errors.missingJobFields') });
      return;
    }

    setAnalyzingJob(true);
    setError(null);

    let data: any = null;
    try {
      const response = await fetch('/api/job/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.analysisFailed'));
      }

      setJobListingId(data.job_listings.id);
      setStep(2);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('errors.analysisFailed');
      setError({
        message,
        code: data?.errorCode,
        isRetryable: data?.isRetryable === true,
      });
    } finally {
      setAnalyzingJob(false);
    }
  };

  const handleGenerateApplication = async () => {
    if (!selectedCVId || !jobListingId) {
      setError({ message: t('errors.selectCV') });
      return;
    }

    setGeneratingApplication(true);
    setError(null);

    let data: any = null;
    try {
      const response = await fetch('/api/application/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseCVId: selectedCVId,
          jobListingId,
          userId: 'temp-user',
          tone: 'professional',
        }),
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.generationFailed'));
      }

      setApplicationId(data.application.id);
      router.push(`/dashboard/applications/${data.application.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('errors.generationFailed');
      setError({
        message,
        code: data?.errorCode,
        isRetryable: data?.isRetryable === true,
      });
    } finally {
      setGeneratingApplication(false);
    }
  };

  const renderError = (onRetry: () => void, isRetrying: boolean) => {
    if (!error) return null;

    // Classified AI error: show localized title + description (+ retry).
    if (error.code) {
      const title = t(`aiErrors.${error.code}.title` as any);
      const description = t(`aiErrors.${error.code}.description` as any);
      return (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              {title}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {description}
            </p>
            {error.isRetryable && (
              <button
                onClick={onRetry}
                disabled={isRetrying}
                className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-400 bg-red-50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:pointer-events-none disabled:opacity-50 dark:border-red-500 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
              >
                <RotateCcw
                  className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
                />
                {t('retry')}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Non-classified error (e.g. validation): plain message.
    return (
      <div
        role="alert"
        className="mt-4 rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950"
      >
        <p className="text-sm text-red-800 dark:text-red-200">{error.message}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <Link href="/dashboard" className="group mr-6 flex min-w-0 items-center gap-2 transition-transform hover:scale-105">
            <span className="shrink-0">←</span>
            <span className="truncate font-display text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
              {t('backToDashboard')}
            </span>
          </Link>
        </div>
      </div>

      <main className="container flex-1 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-2 break-words text-sm text-muted-foreground sm:text-base">
              {t('subtitle')}
            </p>
          </div>

          {/* Steps Indicator */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <div
              className={`flex min-w-0 items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                1
              </div>
              <span className="truncate text-sm font-medium">{t('steps.jobInfo')}</span>
            </div>
            <ArrowRight className="hidden shrink-0 text-muted-foreground sm:block" />
            <div
              className={`flex min-w-0 items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                2
              </div>
              <span className="truncate text-sm font-medium">{t('steps.selectCV')}</span>
            </div>
          </div>

          {/* Step 1: Job Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                  {t('jobForm.title')}
                </h2>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="jobTitle" className="text-sm font-medium">
                        {t('jobForm.jobTitle')} *
                      </label>
                      <input
                        id="jobTitle"
                        type="text"
                        value={jobData.title}
                        onChange={(e) =>
                          setJobData({ ...jobData, title: e.target.value })
                        }
                        placeholder="Senior Software Engineer"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium">
                        {t('jobForm.company')} *
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={jobData.company}
                        onChange={(e) =>
                          setJobData({ ...jobData, company: e.target.value })
                        }
                        placeholder="Google"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      {t('jobForm.description')} *
                    </label>
                    <textarea
                      id="description"
                      value={jobData.description}
                      onChange={(e) =>
                        setJobData({ ...jobData, description: e.target.value })
                      }
                      placeholder={t('jobForm.descriptionPlaceholder')}
                      className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        {t('jobForm.location')}
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={jobData.location}
                        onChange={(e) =>
                          setJobData({ ...jobData, location: e.target.value })
                        }
                        placeholder="Remote"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="workMode" className="text-sm font-medium">
                        {t('jobForm.workMode')}
                      </label>
                      <select
                        id="workMode"
                        value={jobData.workMode}
                        onChange={(e) =>
                          setJobData({ ...jobData, workMode: e.target.value })
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">-</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="salary" className="text-sm font-medium">
                        {t('jobForm.salary')}
                      </label>
                      <input
                        id="salary"
                        type="text"
                        value={jobData.salary}
                        onChange={(e) =>
                          setJobData({ ...jobData, salary: e.target.value })
                        }
                        placeholder="$100k - $150k"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">
                      {t('jobForm.url')}
                    </label>
                    <input
                      id="url"
                      type="url"
                      value={jobData.url}
                      onChange={(e) =>
                        setJobData({ ...jobData, url: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {renderError(handleAnalyzeJob, analyzingJob)}

                <button
                  onClick={handleAnalyzeJob}
                  disabled={analyzingJob}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {analyzingJob ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('analyzing')}
                    </>
                  ) : (
                    <>
                      {t('analyzeJob')}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Base CV */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                  {t('selectCVForm.title')}
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : base_cvs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      {t('selectCVForm.noCV')}
                    </p>
                    <Link
                      href="/dashboard/cv/new"
                      className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground"
                    >
                      {t('selectCVForm.uploadCV')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {base_cvs.map((cv) => (
                      <label
                        key={cv.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors sm:gap-4 sm:p-4 ${
                          selectedCVId === cv.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <input
                          type="radio"
                          name="baseCV"
                          value={cv.id}
                          checked={selectedCVId === cv.id}
                          onChange={(e) => setSelectedCVId(e.target.value)}
                          className="h-4 w-4 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-medium">{cv.title}</h3>
                          <p className="break-words text-sm text-muted-foreground">
                            {(cv.personalInfo as any)?.name || 'Sin nombre'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {renderError(handleGenerateApplication, generatingApplication)}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium"
                  >
                    {t('back')}
                  </button>
                  <button
                    onClick={handleGenerateApplication}
                    disabled={!selectedCVId || generatingApplication}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    {generatingApplication ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        {t('generateApplication')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
