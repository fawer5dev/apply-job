import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { routing } from '@/i18n/routing';

const publicPages = ['', '/login', '/register'];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const page of publicPages) {
      const path = `/${locale}${page}`;
      entries.push({
        url: `${siteConfig.url}${path}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteConfig.url}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
