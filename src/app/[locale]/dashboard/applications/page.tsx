'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Briefcase, Calendar, TrendingUp } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  atsScore: number | null;
  matchScore: number | null;
  createdAt: string;
  job_listings: {
    title: string;
    company: string;
    location: string | null;
  };
  base_cvs: {
    title: string;
  };
}

export default function ApplicationsPage() {
  const t = useTranslations('Applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/application/create?userId=temp-user');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error loading applications');
      }

      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(
        err instanceof Error ? err.message : 'Error loading applications'
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

  return (
    <div className="flex flex-col">
      <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <Link
            href="/dashboard"
            className="group flex min-w-0 items-center gap-2 transition-transform hover:scale-105"
          >
            <span className="shrink-0">←</span>
            <span className="truncate font-display text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
              {t('backToDashboard')}
            </span>
          </Link>
        </div>
      </div>

      <main className="container flex-1 py-8">
        <div className="mb-8">
          <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-2 break-words text-sm text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500 bg-red-50 p-6 dark:bg-red-950">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {t('emptyState.title')}
            </h3>
            <p className="mb-6 text-muted-foreground">
              {t('emptyState.description')}
            </p>
            <Link
              href="/dashboard/applications/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              {t('emptyState.action')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Link
                key={application.id}
                href={`/dashboard/applications/${application.id}`}
                className="block rounded-lg border bg-card p-6 transition-colors hover:bg-blue-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="break-words text-lg font-semibold sm:text-xl">
                        {application.job_listings.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {t(`status.${application.status}`)}
                      </span>
                    </div>

                    <p className="mb-3 break-words text-sm text-muted-foreground">
                      {application.job_listings.company}
                      {application.job_listings.location && (
                        <> · {application.job_listings.location}</>
                      )}
                    </p>

                    <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {t('atsScore')}:{' '}
                        </span>
                        <span
                          className={`font-semibold ${getScoreColor(application.atsScore)}`}
                        >
                          {application.atsScore?.toFixed(0) || 'N/A'}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('matchScore')}: </span>
                        <span
                          className={`font-semibold ${getScoreColor(application.matchScore)}`}
                        >
                          {application.matchScore?.toFixed(0) || 'N/A'}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="break-words text-muted-foreground">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
