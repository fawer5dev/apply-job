'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Lock, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const t = useTranslations('ChangePassword');
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/profile"
          className="group mb-8 inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        <div className="mb-12 animate-fade-in-up">
          <h1 className="mb-4 font-display text-5xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="font-body text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <section className="animate-fade-in-up border-2 border-foreground/10 bg-card p-8">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 font-display text-2xl font-bold">{t('success')}</h3>
              <p className="font-body text-sm text-muted-foreground">Redirecting back to profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block font-body text-xs font-bold uppercase tracking-wider">
                  {t('currentPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border-2 border-foreground/20 bg-background pl-12 pr-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block font-body text-xs font-bold uppercase tracking-wider">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-2 border-foreground/20 bg-background pl-12 pr-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block font-body text-xs font-bold uppercase tracking-wider">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-foreground/20 bg-background pl-12 pr-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="border-2 border-red-500/50 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={updating}
                className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-primary px-8 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('updating')}
                  </>
                ) : (
                  t('saveChanges')
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
