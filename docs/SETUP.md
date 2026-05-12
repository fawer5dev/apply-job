# Quick Start Guide

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install
```

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
# Database (get this URL from Neon/Supabase)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# OpenAI API Key (get at https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Create tables in database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Run in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Getting Started

### 1. Create Your Base Resume

1. Go to **Dashboard** → **Create Base Resume**
2. Upload your current resume (PDF, DOCX or TXT)
3. Review and edit the extracted information
4. Save your base resume

### 2. Generate Custom Resume

1. Go to **New Application**
2. Select your base resume
3. Paste the job description
4. Click **Analyze and Generate**
5. Review the customized resume and ATS score
6. Download the PDF

### 3. Generate Cover Letter

1. From an existing application
2. Click **Generate Cover Letter**
3. Select desired tone
4. Review and download

---

## 🗂️ Project Structure

```
apply-job/
├── prisma/              # Database schema
├── public/              # Static files
├── src/
│   ├── app/            # Routes and pages (Next.js App Router)
│   │   ├── api/        # API endpoints
│   │   ├── dashboard/  # Dashboard pages
│   │   └── page.tsx    # Landing page
│   ├── components/     # Reusable React components
│   │   └── ui/         # Base UI components
│   ├── lib/            # Business logic
│   │   ├── ai/         # AI services (OpenAI)
│   │   ├── cv/         # Resume parsing
│   │   ├── pdf/        # PDF generation
│   │   └── db/         # Prisma client
│   ├── types/          # TypeScript types
│   └── config/         # Configuration
└── templates/          # HTML templates for PDFs
```

---

## 🔑 Environment Variables

### Required

- `DATABASE_URL`: PostgreSQL connection URL
- `OPENAI_API_KEY`: OpenAI API key

### Optional

- `NEXT_PUBLIC_APP_URL`: App URL (default: http://localhost:3000)

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Run in development
npm run build            # Build for production
npm run start            # Run in production

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Sync schema with DB (no migrations)
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio (GUI)

# Code
npm run lint             # Linter
npm run type-check       # Type checking
```

---

## 📊 OpenAI API Usage

### Estimated Costs

With GPT-4o:

- **Job Analysis**: ~500-1000 tokens → $0.01-0.02
- **Resume Generation**: ~2000-3000 tokens → $0.03-0.05
- **Cover Letter**: ~1000-1500 tokens → $0.02-0.03
- **ATS Scoring**: ~1500-2000 tokens → $0.02-0.04

**Total per complete application**: ~$0.08-0.14

For 50 applications per month: **$4-7/month**

### Cost Optimization

- Use result caching when possible
- Consider using GPT-4o-mini for simple analysis
- Implement rate limiting

---

## 🚢 Deploy to Production

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo at [vercel.com](https://vercel.com)
3. Configure environment variables
4. Automatic deployment on each push

### Environment variables in Vercel

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured"

→ Verify that `OPENAI_API_KEY` is in `.env.local`

### Error: Prisma client not generated

```bash
npm run db:generate
```

### Error: Database connection failed

→ Verify your `DATABASE_URL` in `.env.local`

### PDF generation fails

→ On Vercel, ensure your plan supports Puppeteer or use an alternative like @react-pdf/renderer

---

## 📝 Next Steps

1. **Implement Authentication**: NextAuth.js for multi-user
2. **Improve Templates**: More professional designs for PDFs
3. **Analytics**: Response rate tracking
4. **Integrations**: LinkedIn, Indeed, etc.
5. **Mobile App**: React Native or Progressive Web App

---

## 🤝 Contributing

This is your personal project, but if you want to share it:

1. Fork the repository
2. Create a branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT

---

## 🆘 Support

If you encounter problems or have questions:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Check the [Prisma documentation](https://www.prisma.io/docs)
3. Check the [OpenAI documentation](https://platform.openai.com/docs)
