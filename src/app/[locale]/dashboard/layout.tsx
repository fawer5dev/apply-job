'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Shared Dashboard Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground/10 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/dashboard" className="group flex min-w-0 items-center space-x-3">
            <span className="truncate font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary sm:text-2xl">
              Apply Job
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center justify-end gap-4 md:flex lg:gap-6">
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
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <UserMenu />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-foreground/20 bg-background text-foreground transition-colors hover:bg-accent"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-foreground/10 bg-background md:hidden">
            <nav className="container flex flex-col gap-1 py-3">
              <Link
                href="/dashboard/cv"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 font-body text-sm font-bold uppercase tracking-wider transition-colors hover:bg-accent"
              >
                {t('nav.myCVs')}
              </Link>
              <Link
                href="/dashboard/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 font-body text-sm font-bold uppercase tracking-wider transition-colors hover:bg-accent"
              >
                {t('nav.applications')}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
