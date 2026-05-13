# 📋 Complete Project Context - Apply Job

> **Last updated**: May 13, 2026
>
> This document contains all necessary information to continue project development in any tool or environment.

---

## 🎯 Project Description

**Apply Job** is a full-stack web application that automates the job application process using artificial intelligence. It allows:

- Upload and parse base resumes
- Analyze job descriptions and extract requirements
- Generate customized resumes optimized for each job posting
- Calculate ATS (Applicant Tracking System) scoring
- Generate personalized cover letters
- Manage applications and track progress
- Multi-language support (English and Spanish)

---

## 🏗️ Complete Technology Stack

### Frontend

- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1 (React 19 RC features)
- **TypeScript**: Latest
- **Styling**:
  - Tailwind CSS 3.x
  - PostCSS
  - CSS Modules
- **UI Components**:
  - shadcn/ui (Radix UI components)
  - lucide-react (icons)
  - class-variance-authority
  - tailwind-merge
  - tailwindcss-animate
- **Internationalization**: next-intl 4.11.0 (English, Spanish)

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (Route Handlers)
- **Database**: PostgreSQL 15+ with Prisma ORM 5.19.0
- **AI/ML**:
  - Google Generative AI (Gemini 2.0 Flash) - Primary, cost-effective
  - OpenAI GPT-4o (API v4.56.0) - Optional, higher quality
  - ai SDK (Vercel AI SDK v3.3.0)
- **PDF Processing**:
  - Puppeteer 23.1.1 (PDF generation)
  - pdf-parse 1.1.1 (text extraction)
  - mammoth 1.8.0 (DOCX parsing)

### State Management & Data Fetching

- **State**: Zustand 4.5.4
- **Server State**: TanStack React Query 5.51.1
- **Forms**: React Hook Form 7.52.1 + Zod 3.23.8

### Utilities

- **Date Manipulation**: date-fns 3.6.0
- **Markdown**: react-markdown 9.0.1
- **Class Names**: clsx 2.1.1

---

## 🌍 Internationalization

### Implementation

- **Library**: next-intl 4.11.0
- **Supported Languages**: 
  - English (en) - Default
  - Spanish (es)
- **Translation Files**: `messages/en.json`, `messages/es.json`
- **Routing**: All user-facing pages under `[locale]` dynamic segment
- **Middleware**: Automatic locale detection and routing (`src/middleware.ts`)
- **Language Switcher**: `LanguageSwitcher` component for user selection

### Architecture

```
User Request
    ↓
Middleware detects/validates locale
    ↓
Routes to /[locale]/... (e.g., /en/dashboard or /es/dashboard)
    ↓
Pages load translations from messages/{locale}.json
    ↓
Render localized content
```

### File Structure

```
messages/
├── en.json    # English translations
└── es.json    # Spanish translations

src/
├── i18n/
│   ├── routing.ts    # Locale configuration
│   └── request.ts    # Server-side i18n
├── middleware.ts     # Locale detection
└── app/
    └── [locale]/     # Localized routes
```

---

## 📊 Database Architecture

### Prisma Models (Current State)

#### 1. **User** - System user

```prisma
- id: String (cuid)
- email: String (unique)
- name: String?
- passwordHash: String?
- emailVerified: DateTime?
- image: String?
- createdAt, updatedAt
```

**Relationships**:

- Has multiple `BaseCV`
- Has multiple `Application`
- Has multiple `CoverLetter`

#### 2. **BaseCV** - User's base resume

```prisma
- id: String (cuid)
- userId: String (FK)
- title: String
- isDefault: Boolean
- personalInfo: Json
- summary: String
- experience: Json (Array)
- education: Json (Array)
- skills: Json (Object)
- projects: Json? (Optional array)
- certifications: Json? (Optional array)
- rawText: String? (original text)
- fileUrl: String? (file URL)
- createdAt, updatedAt
```

**JSON field structure**:

```typescript
personalInfo: {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

experience: [{
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}]

education: [{
  institution: string;
  degree: string;
  dates: string;
  details?: string;
}]

skills: {
  technical: string[];
  soft: string[];
  languages: string[];
}
```

#### 3. **JobListing** - Analyzed job posting

```prisma
- id: String (cuid)
- title: String
- company: String
- location: String?
- workMode: String? ("remote"/"hybrid"/"onsite")
- salary: String?
- description: String (Text)
- requirements: Json (Array)
- keywords: Json (Object)
- url: String?
- source: String? ("LinkedIn"/"Indeed"/"Manual")
- createdAt, updatedAt
```

**JSON field structure**:

```typescript
requirements: string[]; // List of extracted requirements

keywords: {
  technical: string[];
  soft: string[];
  tools: string[];
}
```

#### 4. **Application** - Customized resume for a job posting

```prisma
- id: String (cuid)
- userId: String (FK)
- baseCVId: String (FK)
- jobListingId: String (FK)
- status: String (enum)
- customizedCV: Json
- atsScore: Int?
- suggestions: Json?
- notes: String?
- appliedAt: DateTime?
- createdAt, updatedAt
```

**Status enum**: "draft", "ready", "applied", "interviewing", "rejected", "accepted"

#### 5. **CoverLetter** - Cover letter

```prisma
- id: String (cuid)
- userId: String (FK)
- applicationId: String? (Optional FK)
- jobTitle: String
- companyName: String
- content: String (Text)
- tone: String? ("professional"/"enthusiastic"/"casual")
- createdAt, updatedAt
```

#### 6. **CVTemplate** - Design templates

```prisma
- id: String (cuid)
- name: String
- description: String?
- htmlTemplate: String (Text)
- cssStyles: String? (Text)
- isDefault: Boolean
- previewUrl: String?
- createdAt, updatedAt
```

### Relationship Diagram

```
User (1) ──┬──> (N) BaseCV
           ├──> (N) Application
           └──> (N) CoverLetter

BaseCV (1) ────> (N) Application

JobListing (1) ─> (N) Application

Application (1) ─> (1?) CoverLetter
```

---

## 📁 Detailed File Structure

```
apply-job/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Test data
│
├── public/                     # Static assets
│
├── messages/                   # 🌍 Translation files
│   ├── en.json                # English translations
│   └── es.json                # Spanish translations
│
├── files/                      # User uploaded files (CVs)
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   │
│   │   ├── [locale]/          # 🌍 Internationalized routes
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # Dashboard home
│   │   │   │   ├── cv/
│   │   │   │   │   ├── page.tsx       # CV list
│   │   │   │   │   ├── new/page.tsx   # Upload CV
│   │   │   │   │   └── [id]/page.tsx  # Edit CV
│   │   │   │   └── applications/
│   │   │   │       ├── page.tsx       # Applications list
│   │   │   │       ├── new/page.tsx   # New application
│   │   │   │       └── [id]/page.tsx  # View application
│   │   │   └── test-upload/
│   │   │       └── page.tsx   # Test upload page
│   │   │
│   │   └── api/               # API Routes (no locale prefix)
│   │       ├── application/
│   │       │   ├── create/
│   │       │   │   └── route.ts       # POST /api/application/create
│   │       │   └── [id]/
│   │       │       ├── route.ts       # GET/PUT/DELETE /api/application/[id]
│   │       │       ├── download-cv/
│   │       │       │   └── route.ts   # GET /api/application/[id]/download-cv
│   │       │       └── download-cover-letter/
│   │       │           └── route.ts   # GET /api/application/[id]/download-cover-letter
│   │       ├── cover-letter/
│   │       │   └── generate/
│   │       │       └── route.ts       # POST /api/cover-letter/generate
│   │       ├── cv/
│   │       │   ├── upload/
│   │       │   │   └── route.ts       # POST /api/cv/upload
│   │       │   ├── generate/
│   │       │   │   └── route.ts       # POST /api/cv/generate
│   │       │   └── [id]/
│   │       │       └── route.ts       # GET/PUT/DELETE /api/cv/[id]
│   │       ├── job/
│   │       │   └── analyze/
│   │       │       └── route.ts       # POST /api/job/analyze
│   │       └── pdf/
│   │           └── generate/
│   │               └── route.ts       # POST /api/pdf/generate
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   └── LanguageSwitcher.tsx  # 🌍 Language selector
│   │
│   ├── config/
│   │   ├── constants.ts       # Application constants
│   │   └── site.ts            # Site configuration
│   │
│   ├── i18n/                  # 🌍 Internationalization config
│   │   ├── routing.ts         # Locale routing configuration
│   │   └── request.ts         # Server-side i18n
│   │
│   ├── lib/
│   │   ├── ai/                # AI services
│   │   │   ├── google-ai.ts         # Google Gemini client
│   │   │   ├── openai.ts            # OpenAI client (optional)
│   │   │   ├── job-analyzer.ts      # Analyzes job descriptions
│   │   │   ├── cv-generator.ts      # Generates custom resumes
│   │   │   ├── cover-letter-generator.ts  # Generates cover letters
│   │   │   ├── ats-scorer.ts        # Calculates ATS score
│   │   │   └── prompts/
│   │   │       └── index.ts         # AI prompts
│   │   │
│   │   ├── cv/
│   │   │   └── parser.ts      # Parses resumes (PDF, DOCX, TXT)
│   │   │
│   │   ├── db/
│   │   │   └── prisma.ts      # Prisma singleton client
│   │   │
│   │   ├── pdf/
│   │   │   └── generator.ts   # Generates PDFs with Puppeteer
│   │   │
│   │   └── utils/
│   │       ├── formatting.ts  # Format helpers
│   │       └── validation.ts  # Validations with Zod
│   │
│   ├── types/
│   │   ├── index.ts           # General types + re-exports
│   │   ├── application.ts     # Application types
│   │   ├── cv.ts              # CV types
│   │   └── job.ts             # Job types
│   │
│   └── middleware.ts          # 🌍 Locale detection middleware
│
├── templates/
│   └── cv/
│       └── modern.html        # HTML template for resume PDF
│
├── tests/                     # Test files and documentation
│
├── docs/                      # 📚 Project documentation
│   ├── README.md              # Documentation index
│   ├── ARCHITECTURE.md        # Technical architecture
│   ├── SETUP.md               # Installation guide
│   ├── TROUBLESHOOTING.md     # Common issues
│   └── DOCUMENTATION-ORGANIZATION.md  # Documentation structure
│
├── .env.local                 # Environment variables (NOT in git)
├── .gitignore
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.mjs         # PostCSS configuration
├── package.json
│
├── README.md                  # General documentation
└── PROJECT_CONTEXT.md         # This file
```

---

## 🔌 Implemented API Endpoints

### 1. **POST /api/job/analyze**

Analyzes a job description and extracts structured information.

**Request**:

```json
{
  "description": "string", // Job description text
  "url": "string?" // Optional job URL
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "title": "string",
    "company": "string",
    "location": "string",
    "workMode": "remote|hybrid|onsite",
    "salary": "string",
    "requirements": ["string"],
    "keywords": {
      "technical": ["string"],
      "soft": ["string"],
      "tools": ["string"]
    }
  }
}
```

### 2. **POST /api/cv/generate**

Generates a customized resume based on a base resume and a job posting.

**Request**:

```json
{
  "baseCVId": "string",
  "jobListingId": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "customizedCV": {
      /* CV object */
    },
    "atsScore": 85,
    "suggestions": ["string"]
  }
}
```

### 3. **POST /api/cover-letter/generate**

Generates a personalized cover letter.

**Request**:

```json
{
  "applicationId": "string",
  "tone": "professional|enthusiastic|casual"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "content": "string", // Markdown formatted
    "wordCount": 300
  }
}
```

### 4. **POST /api/pdf/generate**

Generates a PDF from a resume or cover letter.

**Request**:

```json
{
  "type": "cv|cover-letter",
  "id": "string",
  "templateId": "string?"
}
```

**Response**:

```
Content-Type: application/pdf
Binary PDF data
```

### 5. **POST /api/cv/upload**

Uploads and parses a CV file (PDF, DOCX, TXT).

**Request**: `multipart/form-data` with file

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "personalInfo": { /* ... */ },
    "experience": [ /* ... */ ],
    "education": [ /* ... */ ],
    "skills": { /* ... */ }
  }
}
```

### 6. **POST /api/application/create**

Creates a new job application with customized CV.

**Request**:

```json
{
  "baseCVId": "string",
  "jobListingId": "string",
  "userId": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "customCV": { /* ... */ },
    "atsScore": 85,
    "atsAnalysis": { /* ... */ }
  }
}
```

### 7. **GET /api/application/[id]**

Retrieves application details.

### 8. **GET /api/application/[id]/download-cv**

Downloads the generated CV as PDF.

**Response**: PDF file download  
**Filename Format**: `User_Name_CV_[CompanyName].pdf`  
**Example**: `John_Doe_CV_Google.pdf`

### 9. **GET /api/application/[id]/download-cover-letter**

Downloads the generated cover letter as PDF.

**Response**: PDF file download  
**Filename Format**: `User_Name_CL_[CompanyName].pdf`  
**Example**: `John_Doe_CL_Meta_Platforms.pdf`

### 10. **GET/PUT/DELETE /api/cv/[id]**

Manage individual base CVs (get, update, delete).

---

## 🔑 Environment Variables

### `.env.local` file (required)

```bash
# ============================================
# DATABASE
# ============================================
# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
DATABASE_URL="postgresql://..."

# ============================================
# GOOGLE AI (Recommended - Cost-effective)
# ============================================
# Get your API key at: https://aistudio.google.com/apikey
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"

# ============================================
# OPENAI (Optional - Higher quality)
# ============================================
# Get your API key at: https://platform.openai.com/api-keys
# Note: At least one AI provider (Google AI or OpenAI) is required
# OPENAI_API_KEY="sk-..."

# ============================================
# APPLICATION
# ============================================
# Application base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================
# AUTHENTICATION (Future)
# ============================================
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="..."

# ============================================
# STORAGE (Future)
# ============================================
# For file uploads (Vercel Blob, S3, etc.)
# BLOB_READ_WRITE_TOKEN="..."
```

### Recommended Database Providers

**For Development**:

- Local PostgreSQL with Docker
- Neon (free tier, serverless)

**For Production**:

- Neon (https://neon.tech) - Recommended
- Supabase (https://supabase.com)
- Railway (https://railway.app)
- Vercel Postgres

---

## 🛠️ Available Commands

### Development

```bash
# Install dependencies
npm install

# Development mode (http://localhost:3000)
npm run dev

# Production build
npm run build

# Run production build
npm start

# Lint
npm run lint

# Type checking
npm run type-check
```

### Database

```bash
# Generate Prisma client (after schema changes)
npm run db:generate

# Push schema to DB (quick development, no migrations)
npm run db:push

# Create migration (production)
npm run db:migrate

# Open Prisma Studio (GUI to view data)
npm run db:studio

# Seed DB with sample data
npm run db:seed
```

### Prisma Workflow

1. **Change schema** → Edit `prisma/schema.prisma`
2. **Apply changes** → `npm run db:push` (dev) or `npm run db:migrate` (prod)
3. **Generate client** → `npm run db:generate` (if not done automatically)
4. **Verify** → `npm run db:studio` (view data)

---

## 🧠 Main Workflows

### Workflow 1: Base Resume Upload & Parsing

```
1. User uploads file (PDF/DOCX/TXT)
   ↓
2. lib/cv/parser.ts → parseCV()
   - Extracts text from file
   - Identifies sections
   ↓
3. lib/ai/openai.ts → structureCV()
   - OpenAI GPT-4o structures data
   - Returns JSON with BaseCV format
   ↓
4. Save to DB (base_cvs table)
   ↓
5. Display structured resume for review
```

### Workflow 2: Job Description Analysis

```
1. User pastes job description
   ↓
2. POST /api/job/analyze
   ↓
3. lib/ai/job-analyzer.ts → analyzeJob()
   - Extracts: title, company, requirements
   - Identifies technical and soft skills keywords
   - Classifies seniority level
   ↓
4. Save to DB (job_listings table)
   ↓
5. Display analysis + keywords
```

### Workflow 3: Custom Resume Generation

```
1. User selects BaseCV + JobListing
   ↓
2. POST /api/cv/generate
   ↓
3. lib/ai/cv-generator.ts → generateCustomCV()
   - Reads original BaseCV
   - Reads JobListing requirements
   - Adapts sections according to keywords
   - Optimizes bullets for ATS
   ↓
4. lib/ai/ats-scorer.ts → calculateScore()
   - Calculates matching score (0-100)
   - Generates improvement suggestions
   ↓
5. Save Application to DB
   ↓
6. Display resume + Score + Suggestions
```

### Workflow 4: Cover Letter Generation

```
1. User chooses existing Application
   ↓
2. POST /api/cover-letter/generate
   ↓
3. lib/ai/cover-letter-generator.ts → generateCoverLetter()
   - Reads customized resume
   - Reads job listing
   - Generates letter with selected tone
   ↓
4. Save to cover_letters table
   ↓
5. Display cover letter (Markdown)
```

### Workflow 5: PDF Generation

```
1. User downloads resume or Cover Letter
   ↓
2. POST /api/pdf/generate
   ↓
3. lib/pdf/generator.ts → generatePDF()
   - Loads HTML template (templates/cv/modern.html)
   - Injects resume data
   - Puppeteer renders HTML → PDF
   ↓
4. Return PDF as blob
   ↓
5. Browser downloads file
```

#### PDF Styling Details

**CV PDF:**
- Font: Arial/Helvetica (system fonts)
- Size: 9pt
- Layout: Single-column, minimalist black design
- Margins: 12mm top/bottom, 15mm left/right
- Filename: `User_Name_CV_[CompanyName].pdf`

**Cover Letter PDF:**
- Font: Libre Baskerville (Google Fonts) with fallbacks to Baskerville, Georgia, serif
- Size: 12pt
- Line Height: 1.7
- Text Alignment: Justified (text-justify: inter-word)
- Color: #1a1a1a (deep black)
- Paragraph Spacing: 18px
- Margins: 25mm top/bottom, 20mm left/right
- Max Width: 170mm
- Format Structure:
  - Greeting: "Hi [Company Name] team,"
  - Body: 2-3 paragraphs (200-300 words)
  - Closing: "I look forward to discussing how I can contribute to [company]'s success."
  - Signature: "Best regards,\nFawer Vargas"
- Filename: `User_Name_CL_[CompanyName].pdf`

---

## 🤖 AI System - Implementation Details

### OpenAI Configuration

```typescript
// src/lib/ai/openai.ts
const AI_CONFIG = {
  model: 'gpt-4o', // Main model
  temperature: 0.7, // Balance creativity/precision
  maxTokens: 4000, // Token limit per response
};
```

### Main Prompts

Prompts are in `src/lib/ai/prompts/index.ts`:

1. **CV_PARSER_PROMPT**: Structures resume text into JSON
2. **JOB_ANALYZER_PROMPT**: Analyzes job description
3. **CV_GENERATOR_PROMPT**: Customizes resume for job posting
4. **ATS_SCORER_PROMPT**: Calculates ATS score
5. **COVER_LETTER_PROMPT**: Generates personalized cover letter
   - Dynamic greeting: "Hi {companyName} team," (company name inserted from job listing)
   - Fixed signature: "Best regards,\nFawer Vargas"
   - Tone options: professional, creative, formal, friendly
   - Length: 200-300 words (3 paragraphs)
   - Output format: JSON with `content` (plain text) and `htmlContent` (formatted HTML)
   - Structure:
     - Paragraph 1: Introduction and motivation
     - Paragraph 2: Relevant experience and qualifications
     - Paragraph 3: Company-specific interest and enthusiasm

### Token Strategy

- **Input prompts**: ~500-1000 tokens
- **CV data**: ~1000-2000 tokens
- **Job description**: ~500-1500 tokens
- **Output**: ~2000-4000 tokens
- **Total per request**: ~4000-8500 tokens

**Estimated cost** (GPT-4o):

- Input: $5/1M tokens
- Output: $15/1M tokens
- ~$0.05-0.10 per generated resume

---

## 🎨 Template System

### Current Template: Minimalist Black (Single Column)

File: `src/lib/pdf/generator.ts`

**Features**:

- Single-column vertical layout (NOT two-column)
- Minimalist black text design (#000000)
- Professional and clean aesthetics
- ATS-optimized (plain text, no complex formatting)
- Fits on 1 page (A4 format)
- Dynamic subtitle generation from job titles
- Skills displayed inline with bullet separator (•)
- Experience limited to 3 bullets per job for space efficiency
- Responsive margins: 12-15mm

**Design Specifications**:

- **Font**: Arial, Helvetica (sans-serif)
- **Font Sizes**: 
  - Name: 26pt (bold, uppercase)
  - Section Headers: 11pt (bold, uppercase)
  - Subtitle: 9.5pt (black)
  - Body: 9pt
  - Skills/Bullets: 8.5pt
- **Line Height**: 1.3 (optimized for 1-page fit)
- **Colors**: 
  - All text: #000000 (black)
  - Section borders: 2px solid black
- **Layout**:
  - Header: Centered with name, subtitle, contact info
  - Sections: Summary → Skills → Experience → Education
  - Skills: Inline text with • separator (not badges)
  - Experience: 3 bullets max per position

**Dynamic Features**:

- `generateSubtitle()` function extracts job roles from experience
- Automatically formats: "IT Support | QA Automation | Software Development"
- Skills grouped by category (Technical Skills, Soft Skills)

### PDF Generation Settings

```typescript
format: 'A4',
printBackground: true,
margin: {
  top: '12mm',
  right: '15mm',
  bottom: '12mm',
  left: '15mm',
}
```

---

## 🚀 Implementation Status

### ✅ Completed

- [x] Initial project setup
- [x] Next.js 15 + TypeScript setup
- [x] Tailwind CSS + shadcn/ui configuration
- [x] Prisma + PostgreSQL setup
- [x] Complete database models
- [x] Google Generative AI (Gemini 2.0 Flash) integration - Primary AI provider
- [x] OpenAI GPT-4o integration - Optional alternative
- [x] Multi-language support (English/Spanish) with next-intl
- [x] Internationalization middleware and routing
- [x] Language switcher component
- [x] Resume parser (PDF, DOCX, TXT)
- [x] API: CV upload and parsing
- [x] API: Job description analysis
- [x] API: Custom resume generation
- [x] API: Cover letter generation
- [x] API: PDF generation and download
- [x] API: Application creation and management
- [x] ATS scoring system
- [x] Minimalist single-column PDF template (black text, 1-page)
- [x] Dynamic subtitle generation from experience
- [x] Optimized skills display (inline with bullets)
- [x] TypeScript types structure
- [x] Transaction timeout fixes for application creation
- [x] Skills section repositioned (after Summary, before Experience)

### 🚧 In Development / Pending

#### Frontend (UI/UX)

- [ ] Landing page (/)
- [ ] Main dashboard (/dashboard)
  - [ ] Applications list
  - [ ] Stats cards (total apps, response rate, etc.)
  - [ ] Progress charts
- [ ] Base resume upload form
- [ ] Base resume editor (review/edit extracted info)
- [ ] New application form
  - [ ] Job description input
  - [ ] Base resume selector
  - [ ] Analysis preview
- [ ] Generated resume view
  - [ ] Resume preview
  - [ ] ATS score with visualization
  - [ ] Suggestions list
  - [ ] PDF download button
- [ ] Cover letter generator
  - [ ] Editor with live preview
  - [ ] Tone selector
  - [ ] Download as PDF or text
- [ ] Application tracking
  - [ ] List with filters
  - [ ] States (draft, applied, interviewing, etc.)
  - [ ] Notes per application
  - [ ] Event timeline

#### Authentication and Users

- [ ] Authentication system (NextAuth.js)
- [ ] Login / Registration
- [ ] Session management
- [ ] User profile
- [ ] Route protection

#### Additional APIs

- [ ] BaseCVs CRUD
  - [ ] GET /api/cv/base (list)
  - [ ] GET /api/cv/base/[id]
  - [ ] POST /api/cv/base (create)
  - [ ] PATCH /api/cv/base/[id] (edit)
  - [ ] DELETE /api/cv/base/[id]
- [ ] Applications CRUD
  - [ ] GET /api/applications
  - [ ] GET /api/applications/[id]
  - [ ] PATCH /api/applications/[id]
  - [ ] DELETE /api/applications/[id]
- [ ] File upload
  - [ ] POST /api/upload (Vercel Blob or S3)

#### AI Improvements

- [ ] Response streaming (Vercel AI SDK)
- [ ] Cache similar job analysis (avoid reprocessing)
- [ ] Prompt fine-tuning
- [ ] Feedback system (thumbs up/down)
- [ ] Prompt A/B testing

#### Advanced Features

- [ ] Multiple resume templates
- [ ] Visual resume editor (drag & drop sections)
- [ ] Side-by-side comparison (base vs customized resume)
- [ ] Real-time improvement suggestions
- [ ] Extract keywords from base resume
- [ ] Detailed match score by section
- [ ] Export to LinkedIn profile
- [ ] Job board integrations (LinkedIn, Indeed)
- [ ] Auto-apply (fill forms)
- [ ] Notifications (email/push)
- [ ] Follow-up reminders

#### DevOps and Quality

- [ ] Unit tests (Vitest)
- [ ] Integration tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel Analytics / PostHog)
- [ ] OpenAI cost monitoring
- [ ] API rate limiting
- [ ] Caching strategy (Redis)

---

## 🐛 Known Issues and Considerations

### 1. **Resume Parsing**

- **Issue**: Resumes can have very varied formats
- **Current solution**: OpenAI structures extracted text
- **Improvement**: Implement validations and fallbacks

### 2. **OpenAI Token Limit**

- **Issue**: Long resumes may exceed limit
- **Solution**: Content chunking, summarize old sections

### 3. **AI API Costs**

- **Issue**: Each resume generation costs ~$0.05-0.10 (OpenAI) or minimal with Gemini
- **Solution**: Implement cache, rate limiting per user, use Gemini for cost-effective generation

### 4. **ATS Score Accuracy**

- **Issue**: Scoring is an estimate, not a guarantee
- **Solution**: Clear disclaimer, validate with real data

### 5. **PDF Generation Performance**

- **Issue**: Puppeteer is slow (~2-5 seconds per PDF)
- **Solution**: Move to queue/background job (BullMQ, Inngest)

### 6. **File Upload Security**

- **Issue**: File uploads can be attack vector
- **Solution**: Validate types, scan malware, limit size

### 7. **Database Migrations**

- **Issue**: Schema changes in production
- **Solution**: Use `prisma migrate` in prod, not `db:push`

### 8. **Transaction Timeouts** ✅ FIXED

- **Issue**: Prisma transaction timeout during application creation (5s default too short)
- **Solution**: Increased timeout to 15s in `/api/application/create` route
- **Implementation**: `prisma.$transaction([], { maxWait: 15000, timeout: 15000 })`

### 9. **Google AI Service Availability**

- **Issue**: 503 errors during high demand periods
- **Current status**: Temporary service unavailability
- **Solution**: Implement fallback to OpenAI, add retry logic, user-friendly error messages

---

## 📈 Recommended Next Steps

### High Priority (MVP)

1. **Implement authentication**
   - Setup NextAuth.js
   - Protect routes
   - Associate data with users

2. **Build Dashboard**
   - Applications list
   - Basic stats
   - Navigation

3. **Resume Upload Form**
   - Drag & drop
   - Extraction preview
   - Data editing

4. **Complete generation flow**
   - Job description input
   - Analysis + Preview
   - Resume generation
   - PDF download

5. **Deploy to production**
   - Vercel deployment
   - Configure DB in Neon
   - Environment variables

### Medium Priority

6. **Template system**
   - 2-3 additional designs
   - UI selector

7. **Cover Letter UI**
   - Editor + Preview
   - Download

8. **Application tracking**
   - States
   - Notes
   - Timeline

### Low Priority

9. **Analytics**
   - Event tracking
   - Internal dashboards

10. **Advanced features**
    - Streaming
    - Integrations
    - Automations

---

## 🔧 Important Technical Configurations

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 experimental features
  experimental: {
    serverActions: true,
  },

  // For Puppeteer on Vercel
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // shadcn/ui theme variables
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 📚 Resources and References

### Official Documentation

- **Next.js 15**: https://nextjs.org/docs
- **React 19**: https://react.dev
- **Prisma**: https://www.prisma.io/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Development Tools

- **Prisma Studio**: `npm run db:studio`
- **OpenAI Playground**: https://platform.openai.com/playground
- **Vercel Dashboard**: https://vercel.com/dashboard

### Community and Support

- **Next.js Discord**: https://nextjs.org/discord
- **Prisma Slack**: https://slack.prisma.io
- **OpenAI Forum**: https://community.openai.com

---

## 🔐 Security and Best Practices

### Environment Variables

- ✅ Never commit `.env.local`
- ✅ Use `NEXT_PUBLIC_` only for public vars
- ✅ Rotate API keys regularly

### API Routes

- ✅ Validate inputs with Zod
- ✅ Rate limiting (coming soon)
- ✅ Consistent error handling
- ✅ Don't expose internal details in errors

### Database

- ✅ Use connection pooling
- ✅ Indexes on frequently searched fields
- ✅ Soft deletes for important data
- ✅ Automatic backups

### AI and Costs

- ✅ Monitor token usage
- ✅ Implement limits per user
- ✅ Cache results when possible
- ✅ Validate AI outputs

---

## 🎯 Success Metrics

### Technical

- **Performance**: Time to First Byte < 200ms
- **SEO**: Lighthouse score > 90
- **Uptime**: > 99.9%
- **Error rate**: < 1%

### Business

- **Conversion**: % users who generate resume
- **Engagement**: Resumes generated per user
- **Retention**: Monthly active users
- **Satisfaction**: NPS score

---

## 📞 Contact and Maintenance

### Repository

- **GitHub**: (add URL when uploaded)
- **Issues**: For bugs and feature requests
- **PRs**: Welcome with tests

### Deploy

- **Production**: Vercel (configure domain)
- **Staging**: Branch preview on Vercel
- **Logs**: Vercel Dashboard + Sentry

---

## 📋 Continuation Checklist

When resuming the project, verify:

- [ ] `npm install` executed without errors
- [ ] `.env.local` configured correctly
- [ ] Database accessible (`npm run db:studio`)
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Valid AI API key (Google AI or OpenAI) configured
- [ ] `npm run dev` works at http://localhost:3000
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Review this document for complete context

---

## 🎉 Conclusion

This project is in a solid technical foundation phase. The architecture is scalable, the technology stack is modern, and the main components are implemented.

**What works**:

- ✅ Dual AI provider support (Google Gemini + OpenAI)
- ✅ Multi-language interface (English/Spanish)
- ✅ AI APIs (job analysis, resume generation, cover letters)
- ✅ Robust database system
- ✅ PDF generation and download
- ✅ Resume parsing

**What's missing**:

- 🚧 Complete frontend
- 🚧 Authentication
- 🚧 Polished UI/UX
- 🚧 Production deployment

**Recommended next milestone**: Build the MVP dashboard with resume upload and end-to-end customized resume generation.

---

**Last updated**: May 13, 2026  
**Version**: 0.2.0  
**Maintainer**: @fawer5dev

## 📝 Recent Updates (May 2026)

### Internationalization (May 13, 2026)
- Implemented next-intl for multi-language support
- Added English (default) and Spanish translations
- Created [locale] routing pattern for all user-facing pages
- Added middleware for automatic locale detection
- Language switcher component for user preference

### AI Provider Enhancement (May 13, 2026)
- Set Google Gemini 2.0 Flash as primary AI provider (cost-effective)
- OpenAI GPT-4o available as optional alternative (higher quality)
- Updated API endpoints with download functionality
- Added comprehensive application management endpoints

### PDF Template Redesign
- Implemented minimalist single-column layout (black text only)
- Optimized for 1-page A4 format with responsive spacing
- Dynamic subtitle generation from job experience
- Skills section moved before Experience with inline display
- Experience bullets limited to 3 per position for space optimization

### Bug Fixes
- Fixed Prisma transaction timeout in application creation (5s → 15s)
- Resolved Google AI 503 errors documentation

### UI/UX Improvements
- Skills section repositioned in both web view and PDF output
- Improved category grouping for Technical and Soft Skills
- Enhanced readability with optimized spacing and typography
