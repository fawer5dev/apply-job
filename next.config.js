const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Prevent webpack from bundling these packages — they must run as native
  // Node.js modules in the Lambda runtime (puppeteer-core needs fs access to
  // locate the Chromium binary supplied by @sparticuz/chromium).
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
};

module.exports = withNextIntl(nextConfig);
