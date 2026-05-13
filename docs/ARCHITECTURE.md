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
- **Internationalization**: next-intl (English, Spanish)

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **AI**: Google Gemini 2.0 Flash (primary), OpenAI GPT-4o (optional)
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

## 🌍 Internationalization Architecture

### Overview

The application uses **next-intl** for comprehensive internationalization support with server-side and client-side rendering.

### Supported Languages

- **English (en)** - Default
- **Spanish (es)**

### Implementation

#### 1. Middleware Layer

```typescript
// src/middleware.ts
- Detects user's locale from:
  1. URL path segment ([locale])
  2. Cookie preference
  3. Accept-Language header
  4. Default fallback (en)
- Redirects to appropriate locale route
- Sets locale cookie for persistence
```

#### 2. Routing Pattern

All user-facing pages use the `[locale]` dynamic segment:

```
/[locale]/dashboard          → /en/dashboard or /es/dashboard
/[locale]/dashboard/cv       → /en/dashboard/cv or /es/dashboard/cv
/[locale]/dashboard/applications → Localized route
```

**Note**: API routes (`/api/*`) are NOT localized - they remain universal.

#### 3. Translation Files

```
messages/
├── en.json    # English translations (~5.7 KB)
└── es.json    # Spanish translations (~6.0 KB)
```

Translations organized by feature/page:
- Common UI elements
- Dashboard content
- Form labels and validation messages
- Error messages

#### 4. Configuration

```typescript
// src/i18n/routing.ts
export const locales = ['en', 'es'];
export const defaultLocale = 'en';
```

#### 5. Language Switcher

`LanguageSwitcher` component allows users to toggle between languages with instant UI update.

### Data Flow

```
User Request → Middleware detects locale → Route to /[locale]/... 
→ Load translations from messages/{locale}.json → Render localized UI
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
                  User Request
                       ↓
┌──────────────────────────────────────┐
│     Middleware Layer (i18n)          │
│  Locale detection & routing          │
└───────────────┬──────────────────────┘
                ↓
┌───────────────────────────────────────┐
│         Presentation Layer            │
│  (Next.js Pages + React Components)   │
└─────────────────┬─────────────────────┘
                  │
┌─────────────────▼─────────────────────┐
│          API Layer (Routes)           │
│  /api/cv/*, /api/job/*, etc.          │
└─────────────────┬─────────────────────┘
                  │
┌─────────────────▼─────────────────────┐
│         Service Layer (lib/)          │
│  AI Services, CV Parser, PDF Gen      │
└─────────────────┬─────────────────────┘
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
┌─────────────┐      ┌─────────────────┐
│  Prisma ORM │      │ AI APIs         │
│             │      │ (Gemini/OpenAI) │
└─────┬───────┘      └─────────────────┘
      │
┌─────▼───────┐
│ PostgreSQL  │
└─────────────┘
```

---

## 🔌 API Endpoints

### CV Management

- `POST /api/cv/upload` - Upload and parse resume file
- `POST /api/cv/generate` - Generate customized resume
- `GET /api/cv/[id]` - Get specific base CV
- `PUT /api/cv/[id]` - Update base CV
- `DELETE /api/cv/[id]` - Delete base CV

### Job Management

- `POST /api/job/analyze` - Analyze job description

### Application Management

- `POST /api/application/create` - Create new application with custom CV
- `GET /api/application/[id]` - Get application details
- `PUT /api/application/[id]` - Update application status
- `DELETE /api/application/[id]` - Delete application
- `GET /api/application/[id]/download-cv` - Download CV as PDF
  - Filename format: `User_Name_CV_[CompanyName].pdf`
  - Example: `John_Doe_CV_Google.pdf`
- `GET /api/application/[id]/download-cover-letter` - Download cover letter as PDF
  - Filename format: `User_Name_CL_[CompanyName].pdf`
  - Example: `John_Doe_CL_Meta_Platforms.pdf`

### Cover Letter

- `POST /api/cover-letter/generate` - Generate personalized cover letter

### PDF Generation

- `POST /api/pdf/generate` - Generate PDF from HTML template

---

## 🤖 AI Services

### Primary Provider: Google Gemini 2.0 Flash

**Cost-effective solution for high-volume processing**

- Model: `gemini-2.0-flash-exp`
- Significantly lower cost compared to OpenAI
- Fast response times
- Suitable for all generation tasks

### Optional Provider: OpenAI GPT-4o

**Higher quality alternative when configured**

- Model: `gpt-4o`
- Superior output quality
- Higher cost per request
- Recommended for premium users

### Service Functions

#### 1. CV Generator

**Prompt**: Adapts base resume to job description
**Input**: BaseCV + JobListing
**Output**: CustomCV with optimizations

#### 2. Job Analyzer

**Prompt**: Extracts keywords and requirements
**Input**: Job description text
**Output**: Keywords, requirements, seniority level

#### 3. ATS Scorer

**Prompt**: Evaluates resume according to ATS criteria
**Input**: CV + JobListing
**Output**: Score (0-100), strengths, weaknesses, suggestions

#### 4. Cover Letter Generator

**Prompt**: Generates personalized cover letter  
**Input**: CV + JobListing + tone  
**Output**: Cover letter text + HTML

**Format Details:**
- **Greeting**: "Hi {companyName} team," (dynamically inserted from job listing)
- **Signature**: "Best regards,\nFawer Vargas" (fixed for all cover letters)
- **Tone Options**: professional, creative, formal, friendly
- **Length**: 200-300 words (3 paragraphs)
- **Structure**:
  - Paragraph 1: Introduction and reason for applying
  - Paragraph 2: Relevant experience matching job requirements
  - Paragraph 3: Company-specific interest and enthusiasm
  - Closing: "I look forward to discussing how I can contribute to {company}'s success."

**PDF Styling:**
- Font: Libre Baskerville 12pt (Google Fonts with fallbacks)
- Text alignment: Justified
- Line height: 1.7
- Color: #1a1a1a (deep black)
- Paragraph spacing: 18px
- Download filename: `User_Name_CL_[CompanyName].pdf`

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

2. **Provider Selection**
   - Google Gemini 2.0 Flash (primary) - Minimal cost
   - OpenAI GPT-4o (optional) - ~$0.08-0.14 per application
   - Users can configure preferred provider

3. **Result Caching**
   - Cache similar job analyses
   - Reuse extracted keywords

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
