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
  Trash2
} from 'lucide-react';

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
    <div className="container py-12 md:py-16">
      <Link
        href="/dashboard"
        className="group mb-6 flex min-w-0 items-center gap-2 transition-transform hover:scale-105"
      >
        <span className="truncate font-display text-base font-bold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
          {t('backToDashboard')}
        </span>
      </Link>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-4 inline-block border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
            {t('settingsBadge')}
          </span>
          <h1 className="mb-4 break-words font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl break-words font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="space-y-8">
              {/* Personal Info Section */}
              <section className="animate-fade-in-up border-2 border-foreground/10 bg-card p-6 sm:p-8">
                <div className="mb-8 flex flex-wrap items-center gap-3 border-b-2 border-primary pb-2">
                  <User className="h-6 w-6 shrink-0 text-primary" />
                  <h2 className="break-words font-display text-2xl font-bold">
                    {t('personalInfo')}
                  </h2>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block break-words font-body text-xs font-bold uppercase tracking-wider">
                      {t('email')}
                    </label>
                    <div className="flex items-center gap-3 border-2 border-foreground/5 bg-muted/30 px-4 py-3 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="break-all font-body text-sm">{user.email}</span>
                    </div>
                    <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t('emailVerified') || 'Email is verified'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="name" className="block font-body text-xs font-bold uppercase tracking-wider">
                      {t('name')}
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className="w-full border-2 border-foreground/20 bg-background px-4 py-3 font-body text-sm transition-all focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10"
                    />
                  </div>

                  {error && (
                    <div className="border-2 border-red-500/50 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 border-2 border-green-500/50 bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-200">
                      <CheckCircle className="h-4 w-4" />
                      {t('success')}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving || name === user.name}
                    className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden bg-primary px-8 font-body text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
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

              {/* Security Section */}
              <section className="animate-fade-in-up border-2 border-foreground/10 bg-card p-6 sm:p-8" style={{ animationDelay: '0.1s' }}>
                <div className="mb-8 flex flex-wrap items-center gap-3 border-b-2 border-primary pb-2">
                  <Shield className="h-6 w-6 shrink-0 text-primary" />
                  <h2 className="break-words font-display text-2xl font-bold">
                    {t('security')}
                  </h2>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/dashboard/profile/change-password"
                    className="flex items-center justify-between border-2 border-foreground/10 bg-background p-4 transition-all hover:border-primary/50"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-body text-sm font-bold">{t('changePassword')}</p>
                        <p className="font-body text-xs text-muted-foreground">{t('changePasswordSubtitle')}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground/10 bg-background p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="break-words font-body text-sm font-bold">{t('twoFactor')}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${user.twoFactorEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className="break-words font-body text-xs text-muted-foreground">
                            {user.twoFactorEnabled ? t('enabled') : t('disabled')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={user.twoFactorEnabled ? "/dashboard/profile/2fa/disable" : "/dashboard/profile/2fa/setup"}
                      className="break-words font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      {user.twoFactorEnabled ? t('disable') : t('enable')}
                    </Link>
                  </div>
                </div>
              </section>

              {/* Danger Zone Section */}
              <section className="animate-fade-in-up border-2 border-red-500/30 bg-card p-6 sm:p-8" style={{ animationDelay: '0.2s' }}>
                <div className="mb-8 flex flex-wrap items-center gap-3 border-b-2 border-red-500/50 pb-2">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
                  <h2 className="break-words font-display text-2xl font-bold">
                    {t('dangerZone')}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-red-500/20 bg-red-50/50 p-4 dark:bg-red-950/10">
                  <div className="flex min-w-0 items-center gap-3">
                    <Trash2 className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                    <div className="min-w-0">
                      <p className="break-words font-body text-sm font-bold">{t('deleteAccountTitle')}</p>
                      <p className="break-words font-body text-xs text-muted-foreground">
                        {t('deleteAccountDescription')}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/profile/delete-account"
                    className="shrink-0 border-2 border-red-600 bg-transparent px-5 py-2.5 font-body text-xs font-bold uppercase tracking-wider text-red-600 transition-all hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                  >
                    {t('deleteAccountBtn')}
                  </Link>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="border-2 border-foreground/10 bg-muted/30 p-6 sm:p-8">
                <h3 className="mb-4 break-words font-display text-xl font-bold">
                  {t('accountStatus')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="break-words font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('memberSince')}</p>
                    <p className="break-words font-body text-sm">
                      {user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="h-px bg-foreground/10" />
                  <div>
                    <p className="break-words font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('accountType')}</p>
                    <p className="break-words font-body text-sm">{t('professionalPlan')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
