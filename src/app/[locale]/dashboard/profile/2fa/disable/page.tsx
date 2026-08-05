'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import DashboardBackBar from '@/components/DashboardBackBar';

export default function TwoFactorDisablePage() {
  const t = useTranslations('Profile.disable2fa');
  const router = useRouter();
  const { refreshSession } = useAuth();

  const [password, setPassword] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState('');

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error'));
      }

      await refreshSession();
      router.push('/dashboard/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setDisabling(false);
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

          <section className="rounded-xl border bg-card p-8">
            <form onSubmit={handleDisable} className="space-y-6">
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

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={disabling}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-destructive px-5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {disabling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('disabling')}
                  </>
                ) : (
                  t('confirm')
                )}
              </button>
              <Link href="/dashboard/profile" className="block text-center text-sm font-medium text-muted-foreground hover:text-primary">
                Cancel
              </Link>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
