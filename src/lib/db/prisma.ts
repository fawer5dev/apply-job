import { PrismaClient } from '@prisma/client';

// Exporting as `any` is a pragmatic workaround for mismatches between the
// generated @prisma/client types in CI/build environments and the runtime
// Prisma client shape. This keeps the build from failing when the client
// contains singular vs plural model names that TypeScript may not expect.
// Remove this and restore proper typings once the generated client is
// consistent in CI (or if you prefer a stricter fix).
const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined;
};

export const prisma: any =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
