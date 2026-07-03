# AGENTS.md

## Setup & commands

- Use **pnpm** (not npm/yarn). Package manager pinned to `pnpm@11.1.1`.
- Node >= 20.0.0.
- `pnpm install` triggers `prisma generate` via `postinstall`.
- Environment file is `.env.local` (`.env.example` exists but is gitignored).

```bash
pnpm dev              # next dev
pnpm build            # runs scripts/vercel-build.js (migrates + builds)
pnpm lint             # next lint (ESLint)
pnpm type-check       # tsc --noEmit
pnpm test             # jest
pnpm db:push          # prisma db push (dev only)
pnpm db:migrate       # prisma migrate dev (for production schema changes)
pnpm db:generate      # prisma generate
pnpm db:studio        # prisma studio (GUI)
```

## Architecture

- **Next.js 15** App Router, TypeScript, Tailwind CSS, shadcn/ui.
- **i18n**: next-intl with `[locale]` dynamic segment on all user-facing pages.
  - Locales: `en`, `es` (**default is `en` — English**).
  - API routes live at `/api/*` — **no locale prefix**.
  - Use `@/` path alias for `src/`.
- **Database**: PostgreSQL + Prisma ORM. Models use **plural table names** (`accounts`, `users`, `sessions`, `base_cvs`, `job_listings`, `applications`, `cover_letters`, `audit_logs`, `rate_limits`, `verification_tokens`, `cv_templates`).
- **Auth**: Custom session-based (not NextAuth). Session cookie name is `session-token`. Password hashing via `@node-rs/argon2` (Argon2id). TOTP 2FA via `otpauth`.
- **Middleware** (`src/middleware.ts`): Handles both i18n routing and auth protection. Public auth routes are listed explicitly. For API auth: middleware checks presence of `session-token` cookie and returns 401 if missing for protected API prefixes; session validation is done inside the route handler.
- **PDF generation**: Uses `puppeteer-core` + `@sparticuz/chromium-min`. Marked as `serverExternalPackages` in next.config so they are NOT bundled. `chromium-min` downloads Chromium into `/tmp/` at runtime (no binary in node_modules).

## Critical gotchas

- **Prisma client is exported as `any`** (`src/lib/db/prisma.ts`). This is intentional — type mismatches between CI/generated client and runtime cause build failures otherwise. Do not rewrite it to a strict type without ensuring CI consistency first.
- **`pnpm build` runs a custom script** (`scripts/vercel-build.js`) that runs `prisma migrate deploy` only when `DATABASE_URL` is set. If you change the build pipeline, preserve this behavior.
- **`.env.example` is gitignored** — changes to it won't appear in the repo. `.env.local` is the active env file.
- **`EMAIL_FROM` must be a valid sender address** accepted by the SMTP provider (e.g., for Gmail it must match `SMTP_USER`). Malformed addresses get `501 Bad sender address syntax`.
- **Transaction timeout for application creation** is extended to 15s (`maxWait: 15000, timeout: 15000` in the create route). Don't reduce it.
- **Google Gemini may return 503** during high demand. There is a fallback to OpenAI in some flows.

## Testing

- **Jest** with `next/jest` wrapper. Config in `jest.config.js`.
- Test file patterns: `tests/unit/**/*.test.{js,jsx,ts,tsx}`, `tests/integration/**/*.test.{js,jsx,ts,tsx}`, `tests/e2e/**/*.test.{js,jsx,ts,tsx}`.
- Setup file referenced: `tests/jest.setup.js`. Because `tests/` is gitignored, this file may be missing locally; create it or remove the `setupFilesAfterEnv` entry in `jest.config.js` before running tests.
- **The `tests/` directory is gitignored** — tests are not shipped to the repository.
- Integration test scripts exist in package.json (`test:integration`, `test:integration:new-app`, etc.) using `tsx` runner — these are for manual/integration testing, not Jest.

## Lint & format

- ESLint: `next/core-web-vitals` + `next/typescript` presets.
- Prettier with `prettier-plugin-tailwindcss`. Config: single quotes, trailing commas (es5), semicolons, 2-space tabs.
- Unused vars with `_` prefix are allowed (`argsIgnorePattern`, `varsIgnorePattern`).

## Key directories

| Path | Purpose |
|------|---------|
| `src/app/[locale]/` | User-facing pages (i18n) |
| `src/app/api/` | API routes (no locale prefix) |
| `src/lib/` | Business logic (auth, ai, cv, pdf, email, db) |
| `src/components/ui/` | shadcn/ui components |
| `src/i18n/` | i18n config (routing, request) |
| `prisma/` | Schema + seed |
| `templates/` | HTML templates for PDF generation |
| `messages/` | Translation JSON (en.json, es.json) |
| `DESIGN.md` | Visual design tokens and component styling (DESIGN.md format) |

## Design system

See **`DESIGN.md`** for the full design specification — colors, typography, spacing, component tokens, and usage guidelines. That file follows the [DESIGN.md format](https://github.com/google-labs-code/design.md) and is the single source of truth for all visual decisions.
