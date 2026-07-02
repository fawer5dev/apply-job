import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { siteConfig } from '@/config/site';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { WebAppJsonLd, OrganizationJsonLd } from '@/components/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const getCachedMessages = cache(async () => {
  return await getMessages();
});

const localeMeta: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Apply Job — AI-Powered CV & Cover Letter Generator',
    description: siteConfig.description,
  },
  es: {
    title: 'Apply Job — Generador de CV y Cartas de Presentación con IA',
    description:
      'Genera CVs personalizados optimizados para ATS, crea cartas de presentación profesionales y haz seguimiento de tus postulaciones — todo con inteligencia artificial.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMeta[locale] ?? localeMeta.en;
  const canonicalPath = `/${locale}`;

  return {
    metadataBase: siteConfig.metadataBase,
    title: {
      default: meta.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: meta.description,
    keywords: [
      'CV',
      'resume',
      'ATS',
      'job application',
      'cover letter',
      'AI',
      'automation',
      'career',
      'personalized CV',
      'job tracker',
    ],
    authors: [{ name: 'Apply Job' }],
    creator: 'Apply Job',
    icons: {
      icon: '/favicon.ico',
    },
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `/${l}`])
        ),
        'x-default': `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      url: canonicalPath,
      siteName: siteConfig.name,
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

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

  if (!routing.locales.includes(locale as 'en' | 'es')) {
    notFound();
  }

  const messages = await getCachedMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <WebAppJsonLd locale={locale} />
        <OrganizationJsonLd />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
