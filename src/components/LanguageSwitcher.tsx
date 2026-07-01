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
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={`Switch to ${nextLocale === 'es' ? 'Spanish' : 'English'}`}
    >
      <span className="text-sm leading-none">{flag}</span>
      <span>{nextLocale.toUpperCase()}</span>
    </button>
  );
}

export default memo(LanguageSwitcher);
