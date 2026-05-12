import type { Metadata } from 'next';
import { Crimson_Pro, Space_Mono } from 'next/font/google';
import '../globals.css';
import { siteConfig } from '@/config/site';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { cache } from 'react';

// Bold serif for headlines and emphasis
const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

// Clean monospace for body text and UI
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Cache getMessages to avoid duplicate calls during SSR
// This deduplicates calls across the component tree in a single request
const getCachedMessages = cache(async () => {
  return await getMessages();
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'CV',
    'resume',
    'ATS',
    'job application',
    'cover letter',
    'AI',
    'automation',
  ],
  authors: [
    {
      name: 'Your Name',
    },
  ],
  creator: 'Your Name',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'es')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  // Using cached version to avoid duplicate fetches
  const messages = await getCachedMessages();

  return (
    <html
      lang={locale}
      className={`${crimsonPro.variable} ${spaceMono.variable}`}
    >
      <body className="font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
