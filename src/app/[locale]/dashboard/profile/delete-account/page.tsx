'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
  Loader2,
  ArrowLeft,
  Lock,
  AlertCircle,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DeleteAccountPage() {
  const t = useTranslations('Profile.deleteAccount');
  const router = useRouter();
  const { user, refreshSession } = useAuth();

  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...(user?.twoFactorEnabled ? { totpCode } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error'));
      }

      // Account deleted + cookie cleared by the API. Refresh local state
      // (session is gone -> user becomes null) then redirect to login.
      await refreshSession();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setDeleting(false);
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

        {/* Warning banner */}
        <div className="mb-6 flex items-start gap-3 border-2 border-red-500/50 bg-red-50 p-4 dark:bg-red-950/30">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="space-y-1">
            <p className="font-body text-sm font-bold text-red-800 dark:text-red-200">
              {t('warning')}
            </p>
            <p className="font-body text-sm text-red-700 dark:text-red-300">
              {t('cannotBeUndone')}
            </p>
            <p className="font-body text-xs text-red-700 dark:text-red-300">
              {t('dataLossWarning')}
            </p>
          </div>
        </div>

        <section className="animate-fade-in-up border-2 border-red-500/30 bg-card p-8">
          <form onSubmit={handleDelete} className="space-y-6">
            <div className="space-y-3">
              <label className="block font-body text-xs font-bold uppercase tracking-wider">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-foreground/20 bg-background pl-12 pr-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                  required
                />
              </div>
            </div>

            {user?.twoFactorEnabled && (
              <div className="space-y-3">
                <label className="block font-body text-xs font-bold uppercase tracking-wider">
                  {t('totpCode')}
                </label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full border-2 border-foreground/20 bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                  required
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 border-2 border-red-500/50 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={deleting || (user?.twoFactorEnabled && totpCode.length !== 6)}
              className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-red-600 px-8 font-body text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t('confirm')}
                </>
              )}
            </button>
            <Link
              href="/dashboard/profile"
              className="block text-center font-body text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              {t('cancel')}
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
