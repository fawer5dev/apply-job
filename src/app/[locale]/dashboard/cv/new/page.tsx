'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Upload, FileText, Loader2, CheckCircle } from '@/lib/icons';
import CVForm from '@/components/cv/cv-form';
import type { CV } from '@/types';

type Tab = 'upload' | 'manual';

export default function NewCVPage() {
  const t = useTranslations('NewCV');
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsedCV, setParsedCV] = useState<CV | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      // Auto-generate title from filename
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileName);
      }
    }
  };

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError(t('errors.missingFields'));
      return;
    }

    setParsing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cv/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.parseFailed'));
      }

      setParsedCV(data.cv);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.parseFailed'));
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async (cv: CV) => {
    if (!title) {
      setError(t('errors.missingFields'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/cv/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ...cv }),
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

  const resetUpload = () => {
    setParsedCV(null);
    setFile(null);
    setError('');
  };

  const TabButton = ({
    tab,
    label,
  }: {
    tab: Tab;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => {
        setActiveTab(tab);
        setError('');
      }}
      className={`relative px-4 py-3 font-body text-xs font-bold uppercase tracking-wider transition-colors ${
        activeTab === tab
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
      {activeTab === tab && (
        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
      )}
    </button>
  );

  if (success) {
    return (
      <div className="flex flex-col">
        <div className="sticky top-16 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
          <div className="container flex h-16 items-center">
            <Link
              href="/dashboard/cv"
              className="group flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <span className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
                ← {t('backToDashboard')}
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
            className="group flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <span className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
              ← {t('backToDashboard')}
            </span>
          </Link>
        </div>
      </div>

      <main className="container flex-1 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <div className="mb-8 animate-fade-in-up">
            <span className="mb-4 inline-block border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
              New CV
            </span>
            <h1 className="mb-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b-2 border-foreground/10">
            <TabButton tab="upload" label={t('tabs.upload')} />
            <TabButton tab="manual" label={t('tabs.manual')} />
          </div>

          {activeTab === 'upload' && !parsedCV && (
            <form
              onSubmit={handleParse}
              className="animate-fade-in-up space-y-8"
              style={{ animationDelay: '0.1s' }}
            >
              {/* Title Input */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className="block font-body text-xs font-bold uppercase tracking-wider"
                >
                  {t('form.title')}
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('form.titlePlaceholder')}
                  className="w-full border-2 border-foreground/20 bg-background px-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <label
                  htmlFor="file"
                  className="block font-body text-xs font-bold uppercase tracking-wider"
                >
                  {t('form.file')}
                </label>
                <div className="flex flex-col gap-4">
                  <label
                    htmlFor="file"
                    className="group relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-foreground/20 bg-background p-12 transition-all hover:border-primary hover:bg-primary/5"
                  >
                    {file ? (
                      <div className="text-center">
                        <FileText
                          className="mx-auto mb-4 h-16 w-16 text-primary"
                          strokeWidth={1.5}
                        />
                        <p className="mb-1 font-display text-xl font-bold">
                          {file.name}
                        </p>
                        <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload
                          className="mx-auto mb-4 h-16 w-16 text-muted-foreground transition-colors group-hover:text-primary"
                          strokeWidth={1.5}
                        />
                        <p className="mb-2 font-display text-xl font-bold">
                          {t('form.uploadPrompt')}
                        </p>
                        <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                          {t('form.uploadHint')}
                        </p>
                      </div>
                    )}
                    {/* Decorative corners */}
                    <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </label>
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="relative animate-scale-in overflow-hidden border-2 border-red-500/50 bg-red-50 p-6 dark:bg-red-950/30">
                  <div className="absolute left-0 top-0 h-full w-2 bg-red-500" />
                  <p className="pl-4 font-body text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <button
                  type="submit"
                  disabled={parsing || !file || !title}
                  className="group relative inline-flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden bg-primary px-8 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('form.parsing')}
                    </>
                  ) : (
                    t('form.parse')
                  )}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-foreground/50 transition-all duration-500 group-hover:w-full" />
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex h-14 items-center justify-center border-2 border-foreground/20 bg-background px-8 font-body text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary/5"
                >
                  {t('form.cancel')}
                </Link>
              </div>
            </form>
          )}

          {activeTab === 'upload' && parsedCV && (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex items-start justify-between border-2 border-primary/20 bg-primary/5 p-4">
                <div>
                  <h2 className="font-display text-xl font-bold">
                    {t('review.title')}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground">
                    {t('review.subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetUpload}
                  className="font-body text-xs font-bold uppercase tracking-wider text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {t('review.uploadAnother')}
                </button>
              </div>

              <CVForm
                initialData={parsedCV}
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

          {activeTab === 'manual' && (
            <div className="animate-fade-in-up">
              <CVForm
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

          {/* Info Box */}
          <div
            className="relative mt-12 animate-fade-in-up border-2 border-foreground/10 bg-muted/30 p-8"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-primary/30" />
            <h3 className="mb-4 pl-4 font-display text-xl font-bold">
              {t('info.title')}
            </h3>
            <ul className="space-y-3 pl-4">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 font-display font-bold text-primary">
                  01
                </span>
                <span className="font-body text-sm leading-relaxed text-muted-foreground">
                  {t('info.point1')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 font-display font-bold text-primary">
                  02
                </span>
                <span className="font-body text-sm leading-relaxed text-muted-foreground">
                  {t('info.point2')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 font-display font-bold text-primary">
                  03
                </span>
                <span className="font-body text-sm leading-relaxed text-muted-foreground">
                  {t('info.point3')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 font-display font-bold text-primary">
                  04
                </span>
                <span className="font-body text-sm leading-relaxed text-muted-foreground">
                  {t('info.point4')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
