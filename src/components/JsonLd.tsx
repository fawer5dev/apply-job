import { siteConfig } from '@/config/site';

interface JsonLdProps {
  locale: string;
}

export function WebAppJsonLd({ locale }: JsonLdProps) {
  const isSpanish = locale === 'es';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    description: isSpanish
      ? 'Genera CVs personalizados optimizados para ATS, crea cartas de presentación profesionales y haz seguimiento de tus postulaciones — todo con inteligencia artificial.'
      : siteConfig.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: ['en', 'es'],
    featureList: isSpanish
      ? [
          'Generación de CVs personalizados con IA',
          'Optimización ATS para CVs',
          'Generación de cartas de presentación',
          'Análisis de ofertas de trabajo',
          'Seguimiento de postulaciones',
        ]
      : [
          'AI-powered personalized CV generation',
          'ATS optimization for CVs',
          'Cover letter generation',
          'Job posting analysis',
          'Application tracking',
        ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.ico`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
