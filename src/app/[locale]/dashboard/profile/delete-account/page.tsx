'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import {
  Loader2,
  Lock,
  AlertCircle,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import DashboardBackBar from '@/components/DashboardBackBar';

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

      await refreshSession();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DashboardBackBar label={t('back')} />

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12">
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t('subtitle')}
            </p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                {t('warning')}
              </p>
              <p className="text-sm text-destructive/80">
                {t('cannotBeUndone')}
              </p>
              <p className="text-xs text-destructive/80">
                {t('dataLossWarning')}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-destructive/30 bg-card p-8">
            <form onSubmit={handleDelete} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  />
                </div>
              </div>

              {user?.twoFactorEnabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t('totpCode')}
                  </label>
                  <input
                    type="text"
                    value={totpCode}
                    onChange={(e) =>
                      setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full rounded-md border border-input bg-background px-4 py-2 text-center font-mono text-2xl tracking-[0.5em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                    autoComplete="one-time-code"
                    inputMode="numeric"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  deleting || (user?.twoFactorEnabled && totpCode.length !== 6)
                }
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-destructive px-5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
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
                className="block text-center text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {t('cancel')}
              </Link>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
