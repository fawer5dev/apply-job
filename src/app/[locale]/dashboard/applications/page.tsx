'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  Plus,
  Briefcase,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import DashboardBackBar from '@/components/DashboardBackBar';

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
      DRAFT: 'bg-muted text-muted-foreground',
      READY: 'bg-primary/10 text-primary',
      APPLIED: 'bg-emerald-50 text-emerald-700',
      INTERVIEWING: 'bg-purple-50 text-purple-700',
      OFFERED: 'bg-amber-50 text-amber-700',
      REJECTED: 'bg-destructive/10 text-destructive',
      ACCEPTED: 'bg-emerald-50 text-emerald-700',
      WITHDRAWN: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-destructive';
  };

  return (
    <>
      <DashboardBackBar label={t('backToDashboard')} />

      <main className="container flex-1 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t('description')}
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">
              {t('emptyState.title')}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {t('emptyState.description')}
            </p>
            <Link
              href="/dashboard/applications/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                className="block rounded-xl border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-lg font-medium sm:text-xl">
                        {application.job_listings.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {t(`status.${application.status}`)}
                      </span>
                    </div>

                    <p className="mb-3 text-sm text-muted-foreground">
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
                          className={`font-medium ${getScoreColor(application.atsScore)}`}
                        >
                          {application.atsScore?.toFixed(0) || 'N/A'}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {t('matchScore')}:{' '}
                        </span>
                        <span
                          className={`font-medium ${getScoreColor(application.matchScore)}`}
                        >
                          {application.matchScore?.toFixed(0) || 'N/A'}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">
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
    </>
  );
}
