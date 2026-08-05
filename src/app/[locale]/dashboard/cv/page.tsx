'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import DashboardBackBar from '@/components/DashboardBackBar';

interface BaseCV {
  id: string;
  title: string;
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export default function ManageCVPage() {
  const t = useTranslations('ManageCV');
  const [cvs, setCvs] = useState<BaseCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cv/upload?userId=temp-user');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch CVs');
      }

      setCvs(data.base_cvs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/cv/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.applicationsCount && data.applicationsCount > 0) {
          throw new Error(
            `Cannot delete this CV. It is being used in ${data.applicationsCount} application(s). Please delete those applications first.`
          );
        }
        throw new Error(data.error || 'Failed to delete CV');
      }

      await fetchCVs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting CV');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <DashboardBackBar label={t('backToDashboard')} />

      <main className="container flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {t('subtitle')}
              </p>
            </div>
            <Link
              href="/dashboard/cv/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              {t('createNew')}
            </Link>
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('loading')}</p>
              </div>
            </div>
          ) : cvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FileText
                className="mb-6 h-20 w-20 text-muted-foreground/30"
                strokeWidth={1}
              />
              <h3 className="mb-3 text-lg font-medium">
                {t('noCVs.title')}
              </h3>
              <p className="mb-8 text-sm text-muted-foreground">
                {t('noCVs.message')}
              </p>
              <Link
                href="/dashboard/cv/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                {t('uploadFirst')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className="group rounded-xl border bg-card p-6 transition-colors hover:border-primary/30"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText
                        className="h-5 w-5 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    {cv.isDefault && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {t('default')}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-medium">
                    {cv.title}
                  </h3>

                  {cv.personalInfo?.name && (
                    <p className="mb-1 text-sm text-muted-foreground">
                      {cv.personalInfo.name}
                    </p>
                  )}

                  {cv.personalInfo?.email && (
                    <p className="mb-3 line-clamp-1 text-xs text-muted-foreground">
                      {cv.personalInfo.email}
                    </p>
                  )}

                  {cv.summary && (
                    <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {cv.summary}
                    </p>
                  )}

                  <div className="mb-4 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(cv.createdAt)}</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/dashboard/cv/${cv.id}`}
                      className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-center text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {t('view')}
                    </Link>
                    <Link
                      href={`/dashboard/cv/${cv.id}/edit`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      title={t('edit')}
                    >
                      <Pencil className="h-4 w-4" />
                      {t('edit')}
                    </Link>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      disabled={deletingId === cv.id}
                      className="inline-flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                      title={t('delete')}
                    >
                      {deletingId === cv.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive transition-colors group-hover/btn:text-destructive-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
