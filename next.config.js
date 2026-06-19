const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Next.js file tracing (nft) only follows JS imports, so it never discovers
    // @sparticuz/chromium's binary files in bin/. This tells nft to explicitly
    // include those files for every route that generates a PDF.
    outputFileTracingIncludes: {
      '/api/application/[id]/download-cv': [
        './node_modules/@sparticuz/chromium/bin/**',
      ],
      '/api/application/[id]/download-cover-letter': [
        './node_modules/@sparticuz/chromium/bin/**',
      ],
      '/api/pdf/generate': [
        './node_modules/@sparticuz/chromium/bin/**',
      ],
      '/api/cv/generate': [
        './node_modules/@sparticuz/chromium/bin/**',
      ],
      '/api/cover-letter/generate': [
        './node_modules/@sparticuz/chromium/bin/**',
      ],
      '/api/application/create': [
        './node_modules/@sparticuz/chromium/bin/**',
      ],
    },
  },
  // Prevent webpack from bundling these packages — they must run as native
  // Node.js modules in the Lambda runtime so @sparticuz/chromium can locate
  // its bin/ directory via __dirname at runtime.
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
};

module.exports = withNextIntl(nextConfig);
