export const siteConfig = {
  name: 'Apply Job',
  description:
    'Generate personalized CVs optimized for ATS, create professional cover letters, and track your job applications — all powered by AI.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.svg',
  links: {
    github: 'https://github.com/yourusername/apply-job',
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
};

export type SiteConfig = typeof siteConfig;
