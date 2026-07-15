'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle } from '@/lib/icons';
import CVForm from '@/components/cv/cv-form';
import type { CV } from '@/types';

interface BaseCV {
  id: string;
  title: string;
  personalInfo: CV['personalInfo'];
  summary?: string;
  experience: CV['experience'];
  education: CV['education'];
  skills: CV['skills'];
  projects?: CV['projects'];
  certifications?: CV['certifications'];
}

export default function EditCVPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('EditCV');
  const router = useRouter();

  const [cv, setCV] = useState<BaseCV | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchCV = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cv/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch CV');
      }

      const fetchedCV = data.cv as BaseCV;
      setCV(fetchedCV);
      setTitle(fetchedCV.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading CV');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCV();
    }
  }, [id, fetchCV]);

  const handleSave = async (cvData: CV) => {
    if (!title) {
      setError(t('errors.missingTitle'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ...cvData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.saveFailed'));
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/cv');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col">
        <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <Link
              href="/dashboard/cv"
              className="group flex min-w-0 items-center gap-2 transition-transform hover:scale-105"
            >
              <span className="shrink-0">←</span>
              <span className="truncate font-display text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
                {t('backToCVs')}
              </span>
            </Link>
          </div>
        </div>

        <main className="container flex-1 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="relative animate-scale-in overflow-hidden border-2 border-green-500/50 bg-green-50 p-8 dark:bg-green-950/30">
              <div className="absolute left-0 top-0 h-full w-2 bg-green-500" />
              <div className="flex items-start gap-4 pl-4">
                <CheckCircle
                  className="mt-1 h-8 w-8 flex-shrink-0 text-green-600"
                  strokeWidth={2}
                />
                <div>
                  <h3 className="mb-2 font-display text-2xl font-bold text-green-900 dark:text-green-100">
                    {t('success.title')}
                  </h3>
                  <p className="font-body text-sm text-green-700 dark:text-green-300">
                    {t('success.message')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <Link
            href="/dashboard/cv"
            className="group flex min-w-0 items-center gap-2 transition-transform hover:scale-105"
          >
            <span className="shrink-0">←</span>
            <span className="truncate font-display text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
              {t('backToCVs')}
            </span>
          </Link>
        </div>
      </div>

      <main className="container flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <div className="mb-8 animate-fade-in-up">
            <span className="mb-4 inline-block border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
              {t('badge')}
            </span>
            <h1 className="mb-4 break-words font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl break-words font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
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
          ) : error || !cv ? (
            <div className="relative animate-scale-in overflow-hidden border-2 border-red-500/50 bg-red-50 p-8 dark:bg-red-950/30">
              <div className="absolute left-0 top-0 h-full w-2 bg-red-500" />
              <p className="pl-4 font-body text-sm text-red-800 dark:text-red-200">
                {error || t('notFound')}
              </p>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <CVForm
                initialData={cv}
                title={title}
                onTitleChange={setTitle}
                onSubmit={handleSave}
                onCancel={() => router.push('/dashboard/cv')}
                isSubmitting={saving}
                submitLabel={t('form.save')}
                cancelLabel={t('form.cancel')}
                error={error}
                t={t}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
