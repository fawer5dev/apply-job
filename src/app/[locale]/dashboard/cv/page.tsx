'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { FileText, Plus, Loader2, Trash2, Calendar } from '@/lib/icons';

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
        // Show the specific error message from the server
        if (data.applicationsCount && data.applicationsCount > 0) {
          throw new Error(
            `Cannot delete this CV. It is being used in ${data.applicationsCount} application(s). Please delete those applications first.`
          );
        }
        throw new Error(data.error || 'Failed to delete CV');
      }

      // Refresh the list
      await fetchCVs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting CV');
      alert(err instanceof Error ? err.message : 'Error deleting CV');
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            className="group flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <span className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
              ← {t('backToDashboard')}
            </span>
          </Link>
          <Link
            href="/dashboard/cv/new"
            className="group flex items-center gap-2 bg-primary px-6 py-3 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t('uploadNew')}
          </Link>
        </div>
      </header>

      <main className="container flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Page header */}
          <div className="mb-12 animate-fade-in-up">
            <span className="mb-4 inline-block border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
              {t('section')}
            </span>
            <h1 className="mb-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="font-body text-sm uppercase tracking-wider text-muted-foreground">
                  {t('loading')}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="relative animate-scale-in overflow-hidden border-2 border-red-500/50 bg-red-50 p-8 dark:bg-red-950/30">
              <div className="absolute left-0 top-0 h-full w-2 bg-red-500" />
              <p className="pl-4 font-body text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          ) : cvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <FileText
                className="mb-6 h-24 w-24 text-muted-foreground/30"
                strokeWidth={1}
              />
              <h3 className="mb-3 font-display text-2xl font-bold">
                {t('noCVs.title')}
              </h3>
              <p className="mb-8 font-body text-sm text-muted-foreground">
                {t('noCVs.message')}
              </p>
              <Link
                href="/dashboard/cv/new"
                className="group inline-flex items-center gap-2 bg-primary px-8 py-4 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                {t('uploadFirst')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cvs.map((cv, index) => (
                <div
                  key={cv.id}
                  className="group relative animate-fade-in-up overflow-hidden border-2 border-foreground/10 bg-background p-6 transition-all duration-300 hover:border-primary hover:shadow-xl"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Decorative corner accent */}
                  <div className="absolute left-0 top-0 h-1 w-12 bg-primary transition-all duration-300 group-hover:w-full" />

                  {/* CV Icon */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center border-2 border-primary/20 bg-primary/5">
                      <FileText
                        className="h-6 w-6 text-primary"
                        strokeWidth={2}
                      />
                    </div>
                    {cv.isDefault && (
                      <span className="border border-primary/30 bg-primary/10 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-primary">
                        {t('default')}
                      </span>
                    )}
                  </div>

                  {/* CV Info */}
                  <h3 className="mb-2 line-clamp-2 font-display text-xl font-bold">
                    {cv.title}
                  </h3>

                  {cv.personalInfo?.name && (
                    <p className="mb-1 font-body text-sm text-muted-foreground">
                      {cv.personalInfo.name}
                    </p>
                  )}

                  {cv.personalInfo?.email && (
                    <p className="mb-3 line-clamp-1 font-body text-xs text-muted-foreground">
                      {cv.personalInfo.email}
                    </p>
                  )}

                  {cv.summary && (
                    <p className="mb-4 line-clamp-3 font-body text-xs leading-relaxed text-muted-foreground">
                      {cv.summary}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="mb-4 flex items-center gap-2 border-t border-foreground/10 pt-4 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span className="font-body uppercase tracking-wider">
                      {formatDate(cv.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/cv/${cv.id}`}
                      className="flex-1 border-2 border-foreground/20 bg-background px-4 py-2 text-center font-body text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    >
                      {t('view')}
                    </Link>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      disabled={deletingId === cv.id}
                      className="group/btn flex items-center justify-center border-2 border-red-500/20 bg-red-50 px-4 py-2 transition-all duration-300 hover:border-red-500 hover:bg-red-500 disabled:opacity-50 dark:bg-red-950/30"
                      title={t('delete')}
                    >
                      {deletingId === cv.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500 transition-colors group-hover/btn:text-white" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
