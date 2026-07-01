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
  - Locales: `en`, `es` (**default is `es` — Spanish**).
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
- **The `tests/` directory and `docs/README.md` are gitignored** — tests are not shipped to the repository.
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

## Design tokens

### Typography
- Page headings: `text-xl font-medium` (22px)
- Section headings: `text-lg font-medium` (18px)
- Body / labels: `text-sm font-normal` (14px)
- Hints / captions: `text-xs text-gray-400` (12px)
- Never use `font-bold` or `font-semibold` for headings — use `font-medium` only

### Color palette
- Primary actions: `bg-blue-700` (#185FA5) background, white text
- Success state: `bg-green-50 text-green-700` / `border-green-200`
- Warning state: `bg-amber-50 text-amber-700` / `border-amber-200`
- Error state: `bg-red-50 text-red-700` / `border-red-200`
- Neutral text: `text-gray-900` primary, `text-gray-500` secondary, `text-gray-400` muted

### Buttons (shadcn/ui Button component)
- **Primary**: `bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg`
- **Secondary (outline)**: `bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg`
- **Ghost**: `border border-blue-700 text-blue-700 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg`
- **Danger (destructive)**: `bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-sm font-medium px-4 py-2 rounded-lg`
- Small variant: add `px-3 py-1.5 text-xs` instead of `px-4 py-2 text-sm`
- Icon + label: always use a Lucide icon on the left, e.g. `<Plus className="w-4 h-4 mr-1.5" />`

### Form inputs (shadcn/ui Input + Label components)
- Label: `text-sm font-medium text-gray-800 mb-1 block`
- Input: `rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full`
- Error state: replace `border-gray-200` with `border-red-400`
- Error message: `text-xs text-red-700 mt-1`
- Hint text: `text-xs text-gray-400 mt-1`

### Status badges
- Applied/success: `inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-800 px-2.5 py-0.5 rounded-full`
- Pending/info: `bg-blue-50 text-blue-800`
- Review/warning: `bg-amber-50 text-amber-800`
- Rejected/error: `bg-red-50 text-red-800`
- Archived/neutral: `bg-gray-100 text-gray-600`
- Always include a Lucide icon inside: Applied → `CheckCircle`, Pending → `Clock`, Rejected → `XCircle`

### Cards (shadcn/ui Card component)
- `rounded-xl border border-gray-100 bg-white p-4`
- No heavy shadows. For subtle depth: `shadow-sm` only
- Inner sections separated by: `border-t border-gray-100 pt-3 mt-3`

### Navigation (top bar)
- Height: `h-14`, sticky, `border-b border-gray-100 bg-white/90 backdrop-blur-sm`
- Logo: icon + app name in `font-medium text-gray-900`
- Nav links: `text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50`
- Active link: `text-blue-700 bg-blue-50`
- User avatar: initials circle `w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-xs font-medium flex items-center justify-center`

### Sidebar (dashboard)
- Width: `w-48` on desktop, hidden on mobile (`hidden md:block`, toggle via hamburger)
- Background: `bg-gray-50 border-r border-gray-100`
- Nav items: same pattern as top nav links but `w-full justify-start`
- Active: `bg-blue-50 text-blue-700 font-medium`
- Section labels: `text-xs font-medium text-gray-400 uppercase tracking-wide px-3 mb-1 mt-4`

### Mobile rules (apply to every component)
- Sidebar: hidden by default on mobile, shown via hamburger menu that opens a drawer overlay
- All grids: start as `grid-cols-1`, expand with `sm:grid-cols-2 lg:grid-cols-3`
- All fixed widths: change to `w-full sm:w-auto`
- Padding: `p-4 sm:p-6 lg:p-8`
- Font sizes: never smaller than `text-xs` (12px) on mobile
- Buttons in forms: always `w-full sm:w-auto`
