# Technical Architecture - Apply Job

## 📐 Overview

Apply Job is a full-stack web application built with Next.js 15 that automates the job application process using AI.

## 🏗️ Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **AI**: OpenAI GPT-4o
- **PDF**: Puppeteer

### Infrastructure

- **Hosting**: Vercel
- **Database**: Neon / Supabase
- **Storage**: Vercel Blob (future)
- **Monitoring**: Sentry + Vercel Analytics

---

## 📊 Data Model

### Main Entities

1. **User**: Application user
2. **BaseCV**: User's base resume
3. **JobListing**: Analyzed job posting
4. **Application**: Customized resume for a specific job
5. **CoverLetter**: Generated cover letter
6. **CVTemplate**: Resume design template

### Relationships

```
User
├── BaseCV[] (1:N)
├── Application[] (1:N)
└── CoverLetter[] (1:N)

BaseCV
└── Application[] (1:N)

JobListing
└── Application[] (1:N)

Application
├── BaseCV (N:1)
├── JobListing (N:1)
└── CoverLetter (1:1 optional)
```

---

## 🔄 Data Flow

### 1. Base Resume Upload & Parsing

```
User uploads file
    ↓
parseCV() extracts text
    ↓
OpenAI structures data
    ↓
Save to BaseCV table
```

### 2. Job Description Analysis

```
User pastes job description
    ↓
analyzeJobDescription()
    ↓
OpenAI extracts:
  - Keywords
  - Requirements
  - Seniority level
    ↓
Save to JobListing table
```

### 3. Custom Resume Generation

```
Select BaseCV + JobListing
    ↓
generateCustomCV()
    ↓
OpenAI adapts resume:
  - Reorders sections
  - Optimizes bullets
  - Adds keywords
    ↓
scoreCV() evaluates ATS
    ↓
Save to Application table
```

### 4. PDF Generation

```
Existing Application
    ↓
Select template
    ↓
Render HTML with data
    ↓
Puppeteer generates PDF
    ↓
Return/Upload file
```

---

## 🧩 Layer Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Next.js Pages + React Components) │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          API Layer (Routes)         │
│  /api/cv/*, /api/job/*, etc.        │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Service Layer (lib/)        │
│  AI Services, CV Parser, PDF Gen    │
└─────────────────┬───────────────────┘
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
┌─────────────┐      ┌─────────────┐
│  Prisma ORM │      │  OpenAI API │
└─────┬───────┘      └─────────────┘
      │
┌─────▼───────┐
│ PostgreSQL  │
└─────────────┘
```

---

## 🔌 API Endpoints

### CV Management

- `POST /api/cv/parse` - Parse uploaded resume
- `POST /api/cv/generate` - Generate custom resume
- `GET /api/cv/[id]` - Get specific resume

### Job Management

- `POST /api/job/analyze` - Analyze job description
- `GET /api/job` - List analyzed jobs

### Application Management

- `POST /api/application` - Create application
- `GET /api/application` - List applications
- `PATCH /api/application/[id]` - Update status

### Cover Letter

- `POST /api/cover-letter/generate` - Generate cover letter

### PDF Generation

- `POST /api/pdf/generate` - Generate resume PDF

---

## 🤖 AI Services

### 1. CV Generator

**Prompt**: Adapts base resume to job description
**Input**: BaseCV + JobListing
**Output**: CustomCV with optimizations

### 2. Job Analyzer

**Prompt**: Extracts keywords and requirements
**Input**: Job description text
**Output**: Keywords, requirements, seniority level

### 3. ATS Scorer

**Prompt**: Evaluates resume according to ATS criteria
**Input**: CV + JobListing
**Output**: Score (0-100), strengths, weaknesses, suggestions

### 4. Cover Letter Generator

**Prompt**: Generates personalized cover letter
**Input**: CV + JobListing + tone
**Output**: Cover letter text + HTML

---

## 🔒 Security Considerations

### Current Phase (Single User)

- No authentication implemented
- Use only in local/private environment

### Future Phase (Multi-User)

- Implement NextAuth.js
- Row Level Security with Prisma
- API rate limiting
- Input validation with Zod
- Data sanitization

---

## ⚡ Optimizations

### Performance

1. **Caching**
   - React Query for API data
   - Prisma query caching
   - Next.js static generation when possible

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Lazy loading of PDFs

3. **Database**
   - Indexes on frequently queried fields
   - Connection pooling with Prisma

### AI Costs

1. **Prompt Optimization**
   - Concise but effective prompts
   - Appropriate max_tokens limits

2. **Result Caching**
   - Cache similar job analyses
   - Reuse extracted keywords

3. **Model Selection**
   - GPT-4o for resume generation (critical quality)
   - GPT-4o-mini for simple analysis (when available)

---

## 🚀 Scalability

### Phase 1: MVP (Current)

- Single user
- Vercel Free hosting
- PostgreSQL free tier
- ~$5-10/month on OpenAI

### Phase 2: Multi-User

- NextAuth.js authentication
- User subscriptions (Stripe)
- Increased database tier
- CDN for generated PDFs

### Phase 3: SaaS

- Public API
- Webhooks
- Analytics dashboard
- Team collaboration features

---

## 📱 Mobile Strategy

### Option 1: Progressive Web App

- Use Next.js PWA
- Responsive design with Tailwind
- Offline support with Service Workers

### Option 2: React Native

- Share business logic
- Native UI for better UX
- Expo for rapid development

---

## 🧪 Testing Strategy

### Unit Tests

- AI services (mocks)
- Utilities (formatting, validation)
- CV parser

### Integration Tests

- API routes
- Complete flows (CV generation)

### E2E Tests

- Playwright for user flows
- Critical test: Upload CV → Generate → Download PDF

---

## 📈 Metrics and Monitoring

### Business Metrics

- CVs generated per user
- Complete application rate
- Average generation time

### Technical Metrics

- API response time
- OpenAI API latency
- PDF generation time
- Error rates

### Tools

- Vercel Analytics (web vitals)
- Sentry (error tracking)
- Custom logging with Prisma

---

## 🔄 CI/CD

### GitHub Actions Workflow

```yaml
1. Lint & Type Check
2. Run Tests
3. Build
4. Deploy to Vercel (auto)
```

### Environments

- **Development**: Local
- **Preview**: Vercel preview deployments
- **Production**: Vercel production

---

## 📚 Additional Documentation

- `../README.md`: General project overview
- `SETUP.md`: Installation guide
- `TROUBLESHOOTING.md`: Common issues and solutions
- `../PROJECT_CONTEXT.md`: Complete project context
- `../tests/README.md`: Testing guide

---

## 🎯 Technical Roadmap

### Q2 2026

- [x] MVP with CV generation
- [x] ATS scoring
- [x] Cover letter generation
- [ ] Improve PDF templates
- [ ] Automated tests

### Q3 2026

- [ ] Multi-user authentication
- [ ] File storage (S3/Vercel Blob)
- [ ] Analytics dashboard
- [ ] Email notifications

### Q4 2026

- [ ] Public API
- [ ] Integrations (LinkedIn, Indeed)
- [ ] Mobile app (PWA or React Native)
- [ ] Webhooks

---

## 🤝 Technical Contribution

If you decide to make this open source:

### Contribution Areas

1. New resume templates
2. AI prompt improvements
3. Performance optimizations
4. Tests and documentation
5. Job board integrations

### Guidelines

- TypeScript strict mode
- Prettier + ESLint
- Conventional commit messages
- Pull requests with tests
