/**
 * Utility script to clear rate limits for testing
 * Usage: npx tsx scripts/clear-rate-limits.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearRateLimits() {
  try {
    const result = await prisma.rateLimit.deleteMany({});
    console.log(`✅ Cleared ${result.count} rate limit entries`);
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearRateLimits();
