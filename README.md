# Apply Job - Job Application Automator

Web app to automate the job application process by generating personalized CVs and Cover Letters optimized for ATS.

## 🚀 Features

- **Base CV Upload**: Upload your main CV and automatically extract information
- **Job Description Analysis**: Analyze job postings and extract key requirements
- **Personalized CV Generation**: Generate CVs tailored to each job posting using AI
- **ATS Optimization**: Scoring and suggestions to pass tracking systems
- **Cover Letters**: Generate personalized cover letters
- **Application Tracking**: Manage all your applications in one place
- **Multi-language Support**: Full English and Spanish interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui, next-intl (i18n)
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini 2.0 Flash (primary), OpenAI GPT-4o (optional)
- **PDF Generation**: Puppeteer (minimalist single-column design)

## 📦 Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Set up database
npm run db:push

# 4. Run in development
npm run dev
```

## 🗄️ Database

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# View data in Prisma Studio
npm run db:studio
```

## 📁 Project Structure

```
apply-job/
├── prisma/              # DB schema and migrations
├── public/              # Static files
├── messages/            # Translation files (en, es)
├── files/               # User uploaded CVs
├── src/
│   ├── app/
│   │   ├── [locale]/   # Internationalized routes
│   │   └── api/        # API endpoints
│   ├── components/     # React components
│   ├── lib/            # Business logic, AI services
│   ├── types/          # TypeScript types
│   ├── i18n/           # Internationalization config
│   ├── config/         # Configuration
│   └── middleware.ts   # Locale detection
├── templates/          # HTML templates for PDFs
├── tests/              # Test files and documentation
└── docs/               # Project documentation
```

## 🔑 Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection URL
- `GOOGLE_AI_API_KEY`: Google AI API key (recommended, cost-effective)
- `OPENAI_API_KEY`: OpenAI API key (optional, higher quality)

**Note**: At least one AI provider (Google AI or OpenAI) must be configured.

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture and design
- **[Project Context](PROJECT_CONTEXT.md)** - Complete project information
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Testing Guide](tests/README.md)** - How to write and run tests

## 📄 License

MIT
