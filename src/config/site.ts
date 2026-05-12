export const siteConfig = {
  name: 'Apply Job',
  description: 'Automate your job application process',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/yourusername/apply-job',
  },
};

export type SiteConfig = typeof siteConfig;
