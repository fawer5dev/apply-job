'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { 
  Shield, 
  Loader2, 
  ArrowLeft, 
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

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
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/profile"
          className="group mb-8 inline-flex items-center gap-2 font-body text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {useTranslations('Profile.setup')('done')}
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
          <form onSubmit={handleDisable} className="space-y-6">
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

            {error && (
              <div className="flex items-center gap-2 border-2 border-red-500/50 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={disabling}
              className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-red-600 px-8 font-body text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
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
            <Link
              href="/dashboard/profile"
              className="block text-center font-body text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Cancel
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
