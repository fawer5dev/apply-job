'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  User,
  Mail,
  Shield,
  Lock,
  CheckCircle,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import DashboardBackBar from '@/components/DashboardBackBar';

export default function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const t = useTranslations('Profile');

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await refreshSession();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(t('error'));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <DashboardBackBar label={t('backToDashboard')} />

      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t('subtitle')}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="space-y-8">
                <section className="rounded-xl border bg-card p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3 border-b pb-3">
                    <User className="h-5 w-5 shrink-0 text-primary" />
                    <h2 className="text-lg font-medium">{t('personalInfo')}</h2>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        {t('email')}
                      </label>
                      <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2.5 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium"
                      >
                        {t('name')}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('namePlaceholder')}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="flex items-center gap-2 rounded-md border border-emerald-500/50 bg-emerald-50 p-3 text-sm text-emerald-700">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {t('success')}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={saving || name === user.name}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('saving')}
                        </>
                      ) : (
                        t('saveChanges')
                      )}
                    </button>
                  </form>
                </section>

                <section className="rounded-xl border bg-card p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3 border-b pb-3">
                    <Shield className="h-5 w-5 shrink-0 text-primary" />
                    <h2 className="text-lg font-medium">{t('security')}</h2>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/dashboard/profile/change-password"
                      className="flex items-center justify-between rounded-md border p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {t('changePassword')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('changePasswordSubtitle')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {t('twoFactor')}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-2 w-2 shrink-0 rounded-full ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-destructive'}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              {user.twoFactorEnabled
                                ? t('enabled')
                                : t('disabled')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={
                          user.twoFactorEnabled
                            ? '/dashboard/profile/2fa/disable'
                            : '/dashboard/profile/2fa/setup'
                        }
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {user.twoFactorEnabled ? t('disable') : t('enable')}
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-destructive/30 bg-card p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3 border-b border-destructive/30 pb-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                    <h2 className="text-lg font-medium">{t('dangerZone')}</h2>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Trash2 className="h-5 w-5 shrink-0 text-destructive" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {t('deleteAccountTitle')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('deleteAccountDescription')}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/profile/delete-account"
                      className="shrink-0 rounded-md border border-destructive bg-transparent px-4 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {t('deleteAccountBtn')}
                    </Link>
                  </div>
                </section>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-xl border bg-muted/30 p-6">
                <h3 className="mb-4 text-lg font-medium">
                  {t('accountStatus')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('memberSince')}
                    </p>
                    <p className="text-sm">
                      {user.emailVerified
                        ? new Date(user.emailVerified).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('accountType')}
                    </p>
                    <p className="text-sm">
                      {user.accountType === 'PROFESSIONAL'
                        ? t('professionalPlan')
                        : t('freePlan')}
                    </p>
                    {user.accountType !== 'PROFESSIONAL' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('freePlanUsage', {
                          count: user.applicationsUsed ?? 0,
                          limit: 3,
                        })}
                      </p>
                    )}
                    {user.accountType !== 'PROFESSIONAL' && (
                      <p className="mt-1 text-xs font-medium text-primary">
                        {t('upgradeHint')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
