# Apply Job - Job Application Automator

Web app to automate the job application process by generating personalized CVs and Cover Letters optimized for ATS.

## 🚀 Features

### Core Features

- **User Authentication**: Complete authentication system with:
  - Email/password authentication with verification
  - Two-Factor Authentication (2FA) with TOTP
  - Session management with multi-device support
  - Password reset and account recovery
  - Rate limiting and brute force protection
  - Comprehensive audit logging
- **Base CV Upload**: Upload your main CV and automatically extract information
- **Job Description Analysis**: Analyze job postings and extract key requirements
- **Personalized CV Generation**: Generate CVs tailored to each job posting using AI
- **ATS Optimization**: Scoring and suggestions to pass tracking systems
- **Cover Letters**: Generate personalized cover letters with:
  - Dynamic company-specific greeting ("Hi [Company] team,")
  - Professional formatting with Libre Baskerville font
  - Justified text alignment for formal appearance
  - Multiple tone options (professional, creative, formal, friendly)
  - Automatic PDF generation with elegant styling
- **Application Tracking**: Manage all your applications in one place
- **Multi-language Support**: Full English and Spanish interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18.3.1, TypeScript, Tailwind CSS, shadcn/ui, next-intl (i18n)
- **Backend**: Next.js API Routes, Node.js 20+
- **Database**: PostgreSQL 15+ with Prisma ORM 5.19.0
- **Authentication**: Custom implementation with Argon2id hashing, TOTP 2FA, session management
- **AI**: Google Gemini 2.5 Flash (primary, cost-effective), OpenAI GPT-4o (optional)
- **PDF Generation**: Puppeteer 23.1.1 (minimalist single-column design)
- **State Management**: Zustand 4.5.4 + React Query 5.51.1
- **Email**: Nodemailer with SMTP support

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

For detailed setup instructions including authentication configuration, see [docs/SETUP.md](docs/SETUP.md) or [docs/QUICK_START.md](docs/QUICK_START.md) for a quick 5-minute guide.

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
├── prisma/              # DB schema and migrations (10 models)
├── public/              # Static files
├── messages/            # Translation files (en, es)
├── files/               # User uploaded CVs (gitignored)
├── src/
│   ├── app/
│   │   ├── [locale]/   # Internationalized routes
│   │   │   ├── login/, register/, verify-email/  # Auth pages
│   │   │   ├── forgot-password/, reset-password/
│   │   │   └── dashboard/  # Protected user area
│   │   └── api/        # API endpoints (27 total)
│   │       ├── auth/   # 17 authentication endpoints
│   │       ├── cv/     # CV management
│   │       ├── job/    # Job analysis
│   │       └── application/  # Application tracking
│   ├── components/     # React components
│   │   └── ui/        # shadcn/ui components
│   ├── lib/            # Business logic & services
│   │   ├── ai/        # Google Gemini & OpenAI services
│   │   ├── auth/      # Session, password, 2FA, rate limiting
│   │   ├── cv/        # CV parsing (PDF, DOCX, TXT)
│   │   ├── pdf/       # Puppeteer PDF generation
│   │   └── email/     # SMTP email service
│   ├── types/          # TypeScript types
│   ├── i18n/           # Internationalization config
│   ├── hooks/          # React hooks (useAuth)
│   ├── config/         # Configuration
│   └── middleware.ts   # Auth & i18n middleware
├── templates/          # HTML templates for PDFs
├── tests/              # Test files and scripts
└── docs/               # Project documentation
```

## 🔑 Required Environment Variables

### Core Configuration

- `DATABASE_URL`: PostgreSQL connection URL
- `SESSION_SECRET`: 64-character hex string for session encryption
- `NEXT_PUBLIC_APP_URL`: Application URL (http://localhost:3000 for dev)

### AI Providers (at least one required)

- `GOOGLE_AI_API_KEY`: Google AI API key (recommended, cost-effective)
- `OPENAI_API_KEY`: OpenAI API key (optional, higher quality)

### Email Configuration (for authentication)

- `SMTP_HOST`: SMTP server host (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP port (587 for TLS)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password (use app password for Gmail)
- `EMAIL_FROM`: Sender email address

For complete environment variable documentation, see [docs/ENV_VARIABLES.md](docs/ENV_VARIABLES.md)

## 🚀 Deployment

Ready to deploy? See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy to Vercel:**

1. Push code to GitHub
2. Import repository to Vercel
3. Add environment variables
4. Deploy!

Build status: ✅ All errors resolved and production-ready

## 📚 Documentation

- **[Documentation Index](docs/README.md)** - Central index of all technical docs
- **[Quick Start](docs/QUICK_START.md)** - 5-minute setup guide
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to Vercel, Railway, or Render
- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Environment Variables](docs/ENV_VARIABLES.md)** - Complete environment configuration
- **[Authentication](docs/AUTH_FINAL_COMPLETE.md)** - Authentication system documentation
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture and design
- **[Project Context](docs/PROJECT_CONTEXT.md)** - Complete project information
- **[Repository File Inventory](files.md)** - Current file and folder map

## 📄 License

MIT
