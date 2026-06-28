# Setup Guide

Complete installation and local setup guide for Apply Job.

---

## 🚀 Installation

### 1. Install Dependencies

This project uses **pnpm** as the package manager.

```bash
pnpm install
```

`postinstall` automatically runs `prisma generate`.

### 2. Configure Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb apply_job
```

#### Option B: Cloud PostgreSQL (Recommended)

Free options:

- **Neon** (https://neon.tech) - Recommended
- **Supabase** (https://supabase.com)
- **Railway** (https://railway.app)

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database (get this URL from Neon/Supabase or use local PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Session Security (generate with: openssl rand -hex 32)
SESSION_SECRET="your-random-32-byte-hex-string-here"

# SMTP Email Configuration (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="Apply Job <your-email@gmail.com>"

# Google AI API Key (Recommended - cost-effective)
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"

# OpenAI API Key (Optional - higher quality, higher cost)
# OPENAI_API_KEY="sk-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Note:** At least one AI provider is required.

### 4. Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Create tables in database
pnpm db:push

# (Optional) Seed with sample data
pnpm db:seed
```

### 5. Run in Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The default locale is Spanish (`/es`); you can switch to English at `/en`.

---

## 📖 Getting Started

### 1. Create Your Base Resume

1. Go to **Dashboard** → **CVs**
2. Upload your current resume (PDF, DOCX or TXT) or create one manually
3. Review and edit the extracted information
4. Save your base resume

### 2. Generate Custom Resume

1. Go to **Dashboard** → **Applications** → **New Application**
2. Select your base resume
3. Paste the job description
4. Click **Analyze and Generate**
5. Review the customized resume and ATS score
6. Download the PDF
7. Switch language (EN/ES) using the language switcher if needed

### 3. Generate Cover Letter

1. From an existing application
2. Click **Generate Cover Letter**
3. Select desired tone
4. Review and download

---

## 🗂️ Project Structure

```
apply-job/
├── prisma/              # Database schema and seed
├── public/              # Static files
├── messages/            # Translation files (en.json, es.json); default locale is es
├── files/               # User uploaded CVs
├── scripts/             # Build and utility scripts
├── templates/           # HTML templates for PDFs
├── src/
│   ├── app/
│   │   ├── [locale]/   # Internationalized routes
│   │   │   ├── dashboard/  # Dashboard pages
│   │   │   └── page.tsx    # Landing page
│   │   └── api/        # API endpoints
│   ├── components/     # Reusable React components
│   │   └── ui/         # Base UI components
│   ├── lib/            # Business logic
│   │   ├── ai/         # AI services (Google Gemini, OpenAI)
│   │   ├── auth/       # Authentication services
│   │   ├── cv/         # Resume parsing
│   │   ├── db/         # Prisma client
│   │   ├── email/      # SMTP email service
│   │   ├── pdf/        # PDF generation
│   │   └── utils/      # Formatting and validation helpers
│   ├── i18n/           # next-intl config
│   ├── types/          # TypeScript types
│   └── middleware.ts   # Locale detection + auth protection
└── docs/               # Project documentation
```

---

## 🔑 Environment Variables

### Required

- `DATABASE_URL`: PostgreSQL connection URL
- `SESSION_SECRET`: 64-character hex string (`openssl rand -hex 32`)
- `NEXT_PUBLIC_APP_URL`: App URL (default: `http://localhost:3000`)
- `GOOGLE_AI_API_KEY` or `OPENAI_API_KEY`: At least one AI provider key

### Optional

- `SMTP_*` + `EMAIL_FROM`: Required for email verification and password reset
- `OPENAI_API_KEY`: Optional AI fallback/alternative

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for the complete reference.

---

## 🛠️ Useful Commands

```bash
# Development
pnpm dev              # Run in development
pnpm build            # Build for production
pnpm start            # Run production build

# Code quality
pnpm lint             # Linter
pnpm type-check       # TypeScript check

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Sync schema with DB (dev only)
pnpm db:migrate       # Create/run migrations
pnpm db:studio        # Open Prisma Studio (GUI)
pnpm db:seed          # Seed DB with sample data

# Testing
pnpm test             # Run Jest tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
```

---

## 📊 AI API Usage

### Estimated Costs

#### Google Gemini (Recommended)

- **Job Analysis**: Minimal cost (~$0.001)
- **Resume Generation**: Minimal cost (~$0.002)
- **Cover Letter**: Minimal cost (~$0.001)
- **ATS Scoring**: Minimal cost (~$0.001)

**Total per complete application**: ~$0.005

For 100 applications per month: **<$1/month**

#### OpenAI GPT-4o (Optional)

- **Job Analysis**: ~$0.01-0.02
- **Resume Generation**: ~$0.03-0.05
- **Cover Letter**: ~$0.02-0.03
- **ATS Scoring**: ~$0.02-0.04

**Total per complete application**: ~$0.08-0.14

For 50 applications per month: **$4-7/month**

### Cost Optimization

- Use Google Gemini for cost-effective processing
- Enable OpenAI only when higher quality is critical or Gemini is unavailable
- Use result caching when possible
- Rate limiting is already implemented

---

## 🚢 Deploy to Production

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo at [vercel.com](https://vercel.com)
3. Configure environment variables
4. `pnpm build` automatically runs migrations when `DATABASE_URL` is set
5. Automatic deployment on each push

### Required Vercel Environment Variables

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-64-character-hex-string
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
GOOGLE_AI_API_KEY=your-google-ai-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=Apply Job <your-email@gmail.com>
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide.

---

## 🐛 Troubleshooting

### Error: "AI API key not configured"

→ Verify that either `GOOGLE_AI_API_KEY` or `OPENAI_API_KEY` is set in `.env.local`

### Error: Prisma client not generated

```bash
pnpm db:generate
```

### Error: Database connection failed

→ Verify your `DATABASE_URL` in `.env.local`

### PDF generation fails

→ On Vercel, Puppeteer-core + `@sparticuz/chromium-min` downloads Chromium at runtime into `/tmp/`. Ensure `serverExternalPackages` is configured in `next.config.js`.

### Language not switching

→ Clear browser cache and cookies, check `src/i18n/routing.ts` configuration

### Emails not sending

→ Verify SMTP credentials and `EMAIL_FROM` format. In development, emails are logged to the console when SMTP is not configured.

---

## 📝 Next Steps

1. Upload and parse your base resume
2. Analyze a job description
3. Generate a tailored CV and cover letter
4. Download PDFs
5. Track your applications

---

## 🤝 Contributing

This is a personal project, but if you want to share it:

1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT
