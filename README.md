# Apply Job - Job Application Automator

Web app to automate the job application process by generating personalized CVs and Cover Letters optimized for ATS.

## 🚀 Features

### Core Features

- **User Authentication**: Complete custom session-based authentication system with:
  - Email/password authentication with verification
  - Two-Factor Authentication (2FA) with TOTP
  - Multi-device session management
  - Password reset and account recovery
  - Rate limiting, account lockout and brute force protection
  - Comprehensive audit logging
- **Base CV Upload**: Upload your main CV (PDF, DOCX, TXT) and automatically extract information
- **Job Description Analysis**: Analyze job postings and extract key requirements
- **Personalized CV Generation**: Generate CVs tailored to each job posting using AI
- **ATS Optimization**: Scoring and suggestions to pass tracking systems
- **Cover Letters**: Generate personalized cover letters with:
  - Dynamic company-specific greeting
  - Professional formatting with Libre Baskerville font
  - Justified text alignment for formal appearance
  - Multiple tone options (professional, enthusiastic, casual)
  - Automatic PDF generation with elegant styling
- **Application Tracking**: Manage all your applications in one place
- **Multi-language Support**: Full English and Spanish interface, **Spanish is the default locale**

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.0.7, React 18.3.1, TypeScript 5, Tailwind CSS 3.4, shadcn/ui, next-intl 4.11.0
- **Backend**: Next.js API Routes, Node.js 20+
- **Database**: PostgreSQL 15+ with Prisma ORM 5.19.0 (plural table names)
- **Authentication**: Custom session-based implementation with Argon2id hashing, TOTP 2FA, secure cookies
- **AI**: Google Gemini (primary, cost-effective), OpenAI GPT-4o (optional fallback)
- **PDF Generation**: Puppeteer-core 25.1.0 + `@sparticuz/chromium-min`
- **State Management**: Zustand 4.5.4 + TanStack React Query 5.51.1
- **Forms**: React Hook Form 7.52.1 + Zod 3.23.8
- **Email**: Nodemailer 8.0.7 with SMTP support

## 📦 Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see docs/ENV_VARIABLES.md)

# 3. Set up database
pnpm db:push

# 4. Run in development
pnpm dev
```

For detailed setup instructions see [docs/SETUP.md](docs/SETUP.md) or [docs/QUICK_START.md](docs/QUICK_START.md) for a quick guide.

## 🗄️ Database

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate

# View data in Prisma Studio
pnpm db:studio
```

## 📁 Project Structure

```
apply-job/
├── prisma/              # DB schema and seed (plural table names)
├── public/              # Static files
├── messages/            # Translation files (en.json, es.json); default locale is es
├── files/               # User uploaded CVs (gitignored)
├── scripts/             # Build and utility scripts
├── templates/           # HTML templates for PDF generation
├── src/
│   ├── app/
│   │   ├── [locale]/   # Internationalized routes (default: es)
│   │   │   ├── login/, register/, verify-email/  # Auth pages
│   │   │   ├── forgot-password/, reset-password/
│   │   │   └── dashboard/  # Protected user area (cv, applications, profile, 2fa)
│   │   └── api/        # API endpoints (30+)
│   │       ├── auth/   # Authentication endpoints
│   │       ├── cv/     # CV management (upload, parse, create, generate)
│   │       ├── job/    # Job analysis
│   │       ├── application/  # Application tracking
│   │       ├── cover-letter/ # Cover letter generation
│   │       └── pdf/    # PDF generation
│   ├── components/     # React components
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # Business logic & services
│   │   ├── ai/         # Google Gemini & OpenAI services
│   │   ├── auth/       # Session, password, 2FA, rate limiting, audit
│   │   ├── cv/         # CV parsing (PDF, DOCX, TXT)
│   │   ├── db/         # Prisma client
│   │   ├── email/      # SMTP email service
│   │   ├── pdf/        # Puppeteer PDF generation
│   │   └── utils/      # Formatting and validation helpers
│   ├── i18n/           # next-intl config (routing.ts, request.ts)
│   ├── types/          # TypeScript types
│   └── middleware.ts   # i18n routing + auth protection
├── docs/               # Project documentation
└── tests/              # Test files and scripts (gitignored)
```

## 🔑 Required Environment Variables

### Core Configuration

- `DATABASE_URL`: PostgreSQL connection URL
- `SESSION_SECRET`: 64-character hex string for session encryption (`openssl rand -hex 32`)
- `NEXT_PUBLIC_APP_URL`: Application URL (`http://localhost:3000` for dev)

### AI Providers (at least one required)

- `GOOGLE_AI_API_KEY`: Google AI API key (recommended, cost-effective)
- `OPENAI_API_KEY`: OpenAI API key (optional, higher quality)

### Email Configuration (for authentication)

- `SMTP_HOST`: SMTP server host (e.g., `smtp.gmail.com`)
- `SMTP_PORT`: SMTP port (`587` for TLS)
- `SMTP_SECURE`: `false` for TLS/587, `true` for SSL/465
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password (use app password for Gmail)
- `EMAIL_FROM`: Sender email address — must be valid and accepted by the SMTP provider

For complete environment variable documentation, see [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md)

## 🧪 Testing & Quality

```bash
pnpm lint         # ESLint
pnpm type-check   # TypeScript check
pnpm test         # Jest unit/integration tests
```

## 🚀 Deployment

Ready to deploy? See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy to Vercel:**

1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables
4. Deploy!

`pnpm build` runs `scripts/vercel-build.js`, which automatically runs `prisma migrate deploy` when `DATABASE_URL` is set.

## 📚 Documentation

- **[Documentation Index](docs/README.md)** - Central index of all technical docs
- **[Quick Start](docs/QUICK_START.md)** - Setup guide
- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to Vercel, Railway, or Render
- **[Environment Variables](docs/ENV_VARIABLES.md)** - Complete environment configuration
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture and design
- **[Authentication](docs/AUTH_FINAL_COMPLETE.md)** - Authentication system documentation
- **[Project Context](docs/PROJECT_CONTEXT.md)** - Complete project information
- **[Repository File Inventory](files.md)** - Current file and folder map

## 📄 License

MIT
