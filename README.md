# Apply Job - Job Application Automator

Web app to automate the job application process by generating personalized CVs and Cover Letters optimized for ATS using AI.

## Features

- **Authentication** — Custom session-based auth with email/password, email verification, TOTP 2FA, multi-device session management, password reset, account lockout, rate limiting, and audit logging.
- **Base CV Upload** — Upload your main CV (PDF, DOCX, TXT) and automatically extract structured information.
- **CV Management** — Create, edit, and manage multiple base CVs.
- **Job Description Analysis** — Analyze job postings and extract key requirements, keywords, and seniority level.
- **Personalized CV Generation** — Generate CVs tailored to each job posting using AI (Google Gemini or OpenAI).
- **ATS Scoring** — Calculate match score (0-100) with strengths, weaknesses, and improvement suggestions.
- **Cover Letters** — Generate personalized cover letters with multiple tone options (professional, enthusiastic, casual) and automatic PDF generation.
- **Application Tracking** — Manage all your applications through their lifecycle (Draft → Ready → Applied → Interviewing → Offered → Accepted/Rejected).
- **CV Templates** — Reusable CV HTML templates stored in the database.
- **Multi-language** — Full English and Spanish interface. **Spanish is the default locale.**
- **PDF Generation** — Professional PDF output via Puppeteer with custom templates.
- **SEO** — Sitemap, robots.txt, JSON-LD structured data, and Open Graph image.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 (strict mode) |
| **UI** | React 18, Tailwind CSS 3, shadcn/ui |
| **i18n** | next-intl (en, es — default: en) |
| **Database** | PostgreSQL 15+ with Prisma ORM |
| **Auth** | Custom session-based (Argon2id, TOTP 2FA) |
| **AI** | Google Gemini (primary), OpenAI GPT-4o (fallback) |
| **PDF** | puppeteer-core + `@sparticuz/chromium-min` |
| **State** | Zustand + TanStack React Query |
| **Forms** | React Hook Form + Zod |
| **Email** | Nodemailer (SMTP) |

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm (package manager)
- PostgreSQL database (local or cloud: Neon, Supabase, Railway)

### Setup

```bash
# 1. Install dependencies (auto-runs prisma generate)
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 3. Generate session secret
openssl rand -hex 32

# 4. Set up database
pnpm db:push

# 5. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Default locale is Spanish (`/es`); switch to English at `/en`.

## Environment Variables

Create a `.env.local` file with these variables:

```env
# Database (required)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Session (required) — generate with: openssl rand -hex 32
SESSION_SECRET="your-64-character-hex-string"

# App URL (required)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Provider (at least one required)
GOOGLE_AI_API_KEY="your-google-ai-api-key"
# OPENAI_API_KEY="sk-..."  # optional fallback

# Email / SMTP (required for auth flows)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="Apply Job <your-email@gmail.com>"
```

**Gmail App Password**: Enable 2FA → Go to https://myaccount.google.com/apppasswords → Generate password for "Mail". `EMAIL_FROM` must match `SMTP_USER` for Gmail.

See [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md) for the complete reference.

## Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build (runs migrations + next build)
pnpm start            # Run production build

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Sync schema to DB (development only)
pnpm db:migrate       # Create and run migrations (production)
pnpm db:studio        # Open Prisma Studio (GUI)
pnpm db:seed          # Seed database with sample data

# Code Quality
pnpm lint             # ESLint
pnpm type-check       # TypeScript check
pnpm test             # Jest tests
pnpm test:watch       # Jest watch mode
pnpm test:coverage    # Coverage report
```

## Project Structure

```
apply-job/
├── prisma/                  # DB schema, seed
├── public/                  # Static assets (favicon, og-image)
├── messages/                # i18n translations (en.json, es.json)
├── files/                   # User uploaded CVs (gitignored)
├── scripts/                 # Build scripts (vercel-build.js)
├── templates/cv/            # HTML templates for PDF generation
├── DESIGN.md                # Design system specification
├── src/
│   ├── app/
│   │   ├── [locale]/        # Internationalized routes (default: en)
│   │   │   ├── login/       # Login page
│   │   │   ├── register/    # Registration page
│   │   │   ├── verify-email/, forgot-password/, reset-password/
│   │   │   └── dashboard/
│   │   │       ├── cv/            # CV list, new, edit
│   │   │       ├── applications/  # Applications list, new, detail
│   │   │       └── profile/       # Profile, password, 2FA
│   │   └── api/               # API routes (no locale prefix)
│   │       ├── auth/           # 19 auth endpoints
│   │       ├── cv/             # CV upload, parse, create, generate
│   │       ├── application/    # Application CRUD + PDF download
│   │       ├── job/            # Job analysis
│   │       ├── cover-letter/   # Cover letter generation
│   │       └── pdf/            # PDF generation
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── LanguageSwitcher.tsx
│   │   └── UserMenu.tsx
│   ├── hooks/                # use-auth.tsx
│   ├── lib/
│   │   ├── ai/               # Gemini, OpenAI, job analyzer, CV generator, ATS scorer
│   │   ├── auth/             # Session, password, 2FA, rate limit, audit
│   │   ├── cv/               # CV parser (PDF, DOCX, TXT)
│   │   ├── db/               # Prisma client
│   │   ├── email/            # SMTP email service
│   │   ├── pdf/              # Puppeteer PDF generator
│   │   └── utils/            # Formatting & validation
│   ├── i18n/                 # next-intl config
│   └── middleware.ts         # i18n routing + auth protection
├── docs/                     # Technical documentation
└── tests/                    # Test files (gitignored)
```

## How It Works

### 1. Upload Base Resume
Upload PDF/DOCX/TXT → AI extracts and structures data → Saved to `base_cvs` table.

### 2. Analyze Job Description
Paste job posting → AI extracts keywords, requirements, seniority → Saved to `job_listings` table.

### 3. Generate Customized CV
Select base CV + job listing → AI adapts resume for ATS optimization → Score calculated → Saved to `applications` table.

### 4. Generate Cover Letter
Select application + tone → AI generates personalized letter → Saved to `cover_letters` table.

### 5. Download PDF
Puppeteer renders HTML template → Returns PDF download with professional formatting.

## AI Costs

| Provider | Per Application | 100 Apps/Month |
|----------|----------------|----------------|
| **Google Gemini** | ~$0.005 | **<$1** |
| **OpenAI GPT-4o** | ~$0.08-0.14 | **$4-7** |

Gemini is the recommended primary provider for cost-effectiveness. OpenAI serves as a fallback.

## Deployment

`pnpm build` runs `scripts/vercel-build.js`, which executes `prisma migrate deploy` (when `DATABASE_URL` is set) before `next build`.

**Vercel (Recommended):**
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy — migrations run automatically on each build

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full deployment guide including Railway and Render.

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/QUICK_START.md](docs/QUICK_START.md) | Step-by-step setup with auth testing |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture, API reference, data flows |
| [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) | Complete project context, DB models, workflows |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guides for Vercel, Railway, Render |
| [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md) | Complete environment variable reference |

## License

MIT
