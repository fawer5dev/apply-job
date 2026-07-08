#!/usr/bin/env node
/*
 * Vercel build helper
 * If DATABASE_URL is present, run migrations then build. Otherwise skip migrations
 * to avoid failing builds in environments without a database configured.
 * This is a pragmatic, reversible change to make CI builds resilient.
 */
const { execSync } = require('child_process');

const hasDb = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());

try {
  if (hasDb) {
    console.log('DATABASE_URL detected — generating Prisma client, running migrations and building...');
    execSync('pnpm prisma generate && pnpm prisma migrate deploy && pnpm next build', { stdio: 'inherit' });
  } else {
    console.log('No DATABASE_URL — skipping prisma migrate deploy and running next build only.');
    execSync('pnpm next build', { stdio: 'inherit' });
  }
  process.exit(0);
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
