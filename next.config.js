const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Keep puppeteer-core and chromium-min as native Node.js modules.
  // chromium-min has no binary files — it downloads Chromium from a URL into
  // /tmp/ at runtime, so there is nothing for nft/webpack to trace or bundle.
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
};

module.exports = withNextIntl(nextConfig);
