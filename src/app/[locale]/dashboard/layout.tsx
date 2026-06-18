'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Shared Dashboard Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <div className="mr-8 flex">
            <Link href="/dashboard" className="group flex items-center space-x-3">
              <span className="font-display text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">
                Apply Job
              </span>
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard/cv"
                className="font-body text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:text-primary"
              >
                {t('nav.myCVs')}
              </Link>
              <Link
                href="/dashboard/applications"
                className="font-body text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:text-primary"
              >
                {t('nav.applications')}
              </Link>
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
