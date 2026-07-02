# Apply Job - Job Application Automator

Web app to automate the job application process by generating personalized CVs and Cover Letters optimized for ATS.

## Features

- **Authentication** — Custom session-based auth with email/password, email verification, TOTP 2FA, multi-device session management, password reset, account lockout, rate limiting, and audit logging.
- **Account Management** — Profile editing, change password, account deletion, 2FA setup/disable.
- **Base CV Upload** — Upload your main CV (PDF, DOCX, TXT) and automatically extract information.
- **CV Management** — Create, edit, and manage multiple base CVs.
- **Job Description Analysis** — Analyze job postings and extract key requirements.
- **Personalized CV Generation** — Generate CVs tailored to each job posting using AI.
- **ATS Optimization** — Scoring and suggestions to pass applicant tracking systems.
- **Cover Letters** — Generate personalized cover letters with dynamic company-specific greeting, professional formatting (Libre Baskerville font, justified text), multiple tone options (professional, enthusiastic, casual), and automatic PDF generation.
- **Application Tracking** — Manage all your applications through their lifecycle (Draft → Ready → Applied → Interviewing → Offered → Accepted/Rejected).
- **CV Templates** — Reusable CV HTML templates stored in the database.
- **Multi-language** — Full English and Spanish interface. **Spanish is the default locale.**
- **SEO** — Sitemap, robots.txt, JSON-LD structured data, and Open Graph image for search engine visibility.
- **Design System** — Documented in [DESIGN.md](DESIGN.md) with blue-themed flat modern SaaS styling (Inter font).

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript 5, Tailwind CSS 3, shadcn/ui, next-intl
- **Backend**: Next.js API Routes, Node.js 20+
- **Database**: PostgreSQL with Prisma ORM (plural table names)
- **Authentication**: Custom session-based with Argon2id hashing, TOTP 2FA, secure cookies
- **AI**: Google Gemini (primary), OpenAI (fallback)
- **PDF Generation**: puppeteer-core + `@sparticuz/chromium-min`
- **State Management**: Zustand + TanStack React Query
- **Forms**: React Hook Form + Zod
- **Email**: Nodemailer with SMTP

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Set up database
pnpm db:push

# 4. Run in development
pnpm dev
```

## Database

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Create migration
pnpm db:studio      # View data in Prisma Studio
pnpm db:seed        # Seed demo data
```

## Project Structure

```
apply-job/
├── prisma/                  # DB schema, migrations & seed
├── public/                  # Static files (favicon, og-image, etc.)
├── messages/                # Translation files (en.json, es.json)
├── files/                   # User uploaded CVs (gitignored)
├── scripts/                 # Build & utility scripts
├── templates/
│   └── cv/                  # HTML templates for CV PDF generation
├── DESIGN.md                # Design system specification
├── src/
│   ├── app/
│   │   ├── [locale]/        # Internationalized routes (default: es)
│   │   │   ├── login/          # Login page (with layout)
│   │   │   ├── register/       # Register page (with layout)
│   │   │   ├── verify-email/
│   │   │   ├── forgot-password/, reset-password/
│   │   │   ├── not-found.tsx   # Custom 404 page
│   │   │   └── dashboard/
│   │   │       ├── cv/            # CV listing, new, edit
│   │   │       ├── applications/  # Applications listing, new, detail
│   │   │       └── profile/       # Profile, change password, delete account, 2FA
│   │   └── api/               # API endpoints (no locale prefix)
│   │       ├── auth/           # Register, login, session, 2FA, profile, etc.
│   │       ├── cv/             # CV upload, parse, create, generate
│   │       ├── application/    # Application CRUD
│   │       ├── job/            # Job posting analysis
│   │       ├── cover-letter/   # Cover letter generation
│   │       └── pdf/            # PDF generation
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   └── robots.ts           # Robots.txt rules
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (button, card, input, etc.)
│   │   ├── cv/               # CV form component
│   │   ├── LanguageSwitcher.tsx
│   │   ├── UserMenu.tsx
│   │   └── JsonLd.tsx        # JSON-LD structured data (SEO)
│   ├── hooks/                # Custom React hooks (use-auth)
│   ├── config/               # App configuration (site, constants)
│   ├── lib/
│   │   ├── ai/               # Google Gemini & OpenAI services, prompts
│   │   ├── auth/             # Sessions, passwords, 2FA, rate limiting, audit
│   │   ├── cv/               # CV parsing (PDF, DOCX, TXT)
│   │   ├── db/               # Prisma client
│   │   ├── email/            # SMTP email service
│   │   ├── pdf/              # Puppeteer PDF generation
│   │   └── utils/            # Formatting & validation helpers
│   ├── i18n/                 # next-intl config (routing.ts, request.ts)
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # i18n routing + auth protection
├── docs/                     # Project documentation (gitignored)
└── tests/                    # Test files & scripts (gitignored)
```

## Required Environment Variables

### Core

- `DATABASE_URL` — PostgreSQL connection URL
- `SESSION_SECRET` — 64-character hex string (`openssl rand -hex 32`)
- `NEXT_PUBLIC_APP_URL` — Application URL (`http://localhost:3000` for dev)

### AI Providers (at least one required)

- `GOOGLE_AI_API_KEY` — Google AI API key (recommended)
- `OPENAI_API_KEY` — OpenAI API key (optional fallback)

### Email (for authentication)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `EMAIL_FROM` — Must be valid and accepted by the SMTP provider

## Testing & Quality

```bash
pnpm lint                          # ESLint
pnpm type-check                    # TypeScript check
pnpm test                          # Jest unit/integration tests
pnpm test:watch                    # Jest watch mode
pnpm test:coverage                 # Coverage report
pnpm test:integration              # CV flow integration test
pnpm test:integration:new-app      # New application integration test
```

## Deployment

`pnpm build` runs `scripts/vercel-build.js`, which runs `prisma migrate deploy` (when `DATABASE_URL` is set) before `next build`.

**Quick Deploy to Vercel:** Push to GitHub → Import to Vercel → Add env vars → Deploy.

## Documentation

- [Documentation Index](docs/README.md) — Central index of all docs
- [Quick Start](docs/QUICK_START.md) — Setup guide
- [Setup Guide](docs/SETUP.md) — Detailed installation & configuration
- [Deployment Guide](docs/DEPLOYMENT.md) — Deploy to Vercel, Railway, or Render
- [Environment Variables](docs/ENV_VARIABLES.md) — Complete env configuration
- [Architecture](docs/ARCHITECTURE.md) — Technical architecture & design
- [Authentication](docs/AUTH_FINAL_COMPLETE.md) — Auth system documentation
- [Project Context](docs/PROJECT_CONTEXT.md) — Complete project information
- [File Inventory](files.md) — Current file & folder map

## License

MIT
