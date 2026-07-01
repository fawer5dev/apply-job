'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { memo, useCallback } from 'react';

function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const switchLocale = useCallback(() => {
    const newLocale = currentLocale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: newLocale });
  }, [currentLocale, pathname, router]);

  const flag = currentLocale === 'es' ? '🇺🇸' : '🇪🇸';
  const nextLocale = currentLocale === 'es' ? 'en' : 'es';

  return (
    <button
      onClick={switchLocale}
      className="group inline-flex items-center gap-2 border-2 border-foreground/20 bg-background px-3 py-2 font-body text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
      aria-label={`Switch to ${nextLocale === 'es' ? 'Spanish' : 'English'}`}
    >
      <span className="text-lg leading-none">{flag}</span>
      <span>{nextLocale}</span>
    </button>
  );
}

export default memo(LanguageSwitcher);
