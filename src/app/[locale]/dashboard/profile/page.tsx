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
  ChevronRight 
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
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-4 inline-block border-b-2 border-primary pb-1 font-body text-xs font-bold uppercase tracking-widest text-primary">
            Settings
          </span>
          <h1 className="mb-4 font-display text-5xl font-bold tracking-tight md:text-6xl">
            {t('title')}
          </h1>
          <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="space-y-8">
              {/* Personal Info Section */}
              <section className="animate-fade-in-up border-2 border-foreground/10 bg-card p-8">
                <div className="mb-8 flex items-center gap-3 border-b-2 border-primary pb-2">
                  <User className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">
                    {t('personalInfo')}
                  </h2>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block font-body text-xs font-bold uppercase tracking-wider">
                      {t('email')}
                    </label>
                    <div className="flex items-center gap-3 border-2 border-foreground/5 bg-muted/30 px-4 py-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="font-body text-sm">{user.email}</span>
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
              <section className="animate-fade-in-up border-2 border-foreground/10 bg-card p-8" style={{ animationDelay: '0.1s' }}>
                <div className="mb-8 flex items-center gap-3 border-b-2 border-primary pb-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="font-display text-2xl font-bold">
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
                        <p className="font-body text-xs text-muted-foreground">Update your account password</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <div className="flex items-center justify-between border-2 border-foreground/10 bg-background p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-body text-sm font-bold">{t('twoFactor')}</p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${user.twoFactorEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                          <p className="font-body text-xs text-muted-foreground">
                            {user.twoFactorEnabled ? t('enabled') : t('disabled')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={user.twoFactorEnabled ? "/dashboard/profile/2fa/disable" : "/dashboard/profile/2fa/setup"}
                      className="font-body text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      {user.twoFactorEnabled ? t('disable') : t('enable')}
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar / Stats */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="border-2 border-foreground/10 bg-muted/30 p-8">
                <h3 className="mb-4 font-display text-xl font-bold">
                  Account Status
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Member Since</p>
                    <p className="font-body text-sm">
                      {user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="h-px bg-foreground/10" />
                  <div>
                    <p className="font-body text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Type</p>
                    <p className="font-body text-sm">Professional Plan</p>
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
