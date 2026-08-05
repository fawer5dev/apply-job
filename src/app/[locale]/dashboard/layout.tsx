'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
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
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive(path)
        ? 'text-primary'
        : 'text-muted-foreground'
    }`;

  const mobileNavLinkClass = (path: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-accent'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center space-x-3"
          >
            <span className="truncate text-xl font-medium tracking-tight transition-colors hover:text-primary sm:text-2xl">
              Apply Job
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-end gap-6 md:flex">
            <Link
              href="/dashboard/cv"
              className={navLinkClass('/dashboard/cv')}
            >
              {t('nav.myCVs')}
            </Link>
            <Link
              href="/dashboard/applications"
              className={navLinkClass('/dashboard/applications')}
            >
              {t('nav.applications')}
            </Link>
            <LanguageSwitcher />
            <UserMenu />
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <UserMenu />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        {mobileMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <nav className="container flex flex-col gap-1 py-3">
              <Link
                href="/dashboard/cv"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass('/dashboard/cv')}
              >
                {t('nav.myCVs')}
              </Link>
              <Link
                href="/dashboard/applications"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass('/dashboard/applications')}
              >
                {t('nav.applications')}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
