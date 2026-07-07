# 📋 Complete Project Context - Apply Job

> **Last updated**: July 7, 2026
>
> This document contains all necessary information to continue project development in any tool or environment.

---

## 🎯 Project Description

**Apply Job** is a full-stack web application that automates the job application process using artificial intelligence. It features:

- **Complete custom authentication system** with 2FA, session management, and security features
- Upload and parse base resumes (PDF, DOCX, TXT)
- Analyze job descriptions and extract requirements
- Generate customized resumes optimized for each job posting
- Calculate ATS (Applicant Tracking System) scoring
- Generate personalized cover letters with multiple tone options
- Manage applications and track progress
- Multi-language support (English and Spanish, **Spanish default**)
- Professional PDF generation with custom templates

---

## 🏗️ Complete Technology Stack

### Frontend

- **Framework**: Next.js 15.0.7 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Styling**:
  - Tailwind CSS 3.4.1
  - PostCSS
  - CSS Modules
- **UI Components**:
  - shadcn/ui (Radix UI components)
  - lucide-react (icons)
  - class-variance-authority
  - tailwind-merge
  - tailwindcss-animate
- **Internationalization**: next-intl 4.11.0 (English, Spanish; default: English)

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (Route Handlers) - 30+ endpoints
- **Database**: PostgreSQL 15+ with Prisma ORM 5.19.0
- **Table Naming**: Prisma models use **plural table names** (`users`, `sessions`, `base_cvs`, etc.)
- **Authentication**:
  - Custom session-based authentication (cookie name: `session-token`)
  - @node-rs/argon2 2.0.2 (Argon2id password hashing)
  - otpauth 9.5.1 (TOTP 2FA with QR codes via qrcode 1.5.4)
  - Multi-device session management
  - Rate limiting and account lockout
  - Comprehensive audit logging
- **Email**: nodemailer 8.0.7 (SMTP)
- **AI/ML**:
  - Google Generative AI (`@google/generative-ai`) - Primary, cost-effective
  - OpenAI GPT-4o (API v4.56.0) - Optional, higher quality fallback
  - ai SDK (Vercel AI SDK v3.3.0)
- **PDF Processing**:
  - puppeteer-core 25.1.0 (PDF generation)
  - @sparticuz/chromium-min 149.0.0 (Chromium downloader for serverless)
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
- **User Agent Parsing**: ua-parser-js 2.0.9
- **OAuth Client**: arctic 3.7.0 (future use)

---

## 🌍 Internationalization

### Implementation

- **Library**: next-intl 4.11.0
- **Supported Languages**:
  - English (en)
  - Spanish (es) - **Default**
- **Translation Files**: `messages/en.json`, `messages/es.json`
- **Routing**: All user-facing pages under `[locale]` dynamic segment
- **Middleware**: Automatic locale detection and auth protection (`src/middleware.ts`)
- **Language Switcher**: `LanguageSwitcher` component for user selection

### Architecture

```
User Request
    ↓
Middleware detects/validates locale + auth
    ↓
Routes to /[locale]/... (e.g., /es/dashboard or /en/dashboard)
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
│   ├── routing.ts    # Locale configuration (default: en)
│   └── request.ts    # Server-side i18n
├── middleware.ts     # Locale detection + auth protection
└── app/
    └── [locale]/     # Localized routes
```

---

## 📊 Database Architecture

### Prisma Models (11 Total)

Models use **plural table names** as configured in `prisma/schema.prisma`.

#### Authentication Models (5)

##### 1. **users**

```prisma
- id: String @id
- email: String @unique
- name: String?
- passwordHash: String?
- emailVerified: DateTime?
- image: String?
- createdAt: DateTime @default(now())
- updatedAt: DateTime
- backupCodes: Json?
- failedLoginAttempts: Int @default(0)
- isActive: Boolean @default(true)
- isSuspended: Boolean @default(false)
- lastLoginAt: DateTime?
- lastLoginIp: String?
- lockedUntil: DateTime?
- twoFactorEnabled: Boolean @default(false)
- twoFactorSecret: String?
- accountType: AccountType @default(FREE)
```

**Relationships**: Has many `sessions`, `accounts`, `audit_logs`, `base_cvs`, `applications`, `cover_letters`, `verification_tokens`.

##### 2. **sessions**

```prisma
- id: String @id
- userId: String
- sessionToken: String @unique
- expires: DateTime
- createdAt: DateTime @default(now())
- lastActive: DateTime @default(now())
- userAgent: String?
- ipAddress: String?
- deviceId: String?
- isValid: Boolean @default(true)
- revokedAt: DateTime?
- revokedReason: String?
```

##### 3. **accounts**

```prisma
- id: String @id
- userId: String
- provider: String
- providerAccountId: String
- type: String
- accessToken: String?
- refreshToken: String?
- expiresAt: Int?
- tokenType: String?
- scope: String?
- idToken: String?
- createdAt: DateTime @default(now())
- updatedAt: DateTime
```

##### 4. **verification_tokens**

```prisma
- id: String @id
- userId: String?
- token: String @unique
- type: TokenType (EMAIL_VERIFY | PASSWORD_RESET | TWO_FACTOR | MAGIC_LINK)
- email: String?
- expires: DateTime
- usedAt: DateTime?
- ipAddress: String?
- attempts: Int @default(0)
- createdAt: DateTime @default(now())
```

##### 5. **audit_logs**

```prisma
- id: String @id
- userId: String?
- action: String
- details: Json?
- ipAddress: String?
- userAgent: String?
- location: String?
- success: Boolean
- errorMessage: String?
- createdAt: DateTime @default(now())
```

#### Application Models (4)

##### 6. **base_cvs**

```prisma
- id: String @id
- userId: String
- title: String
- isDefault: Boolean @default(false)
- personalInfo: Json
- summary: String?
- experience: Json
- education: Json
- skills: Json
- projects: Json?
- certifications: Json?
- rawText: String?
- fileUrl: String?
- createdAt: DateTime @default(now())
- updatedAt: DateTime
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

##### 7. **job_listings**

```prisma
- id: String @id
- title: String
- company: String
- location: String?
- workMode: String?
- salary: String?
- description: String
- requirements: Json
- keywords: Json
- url: String?
- source: String?
- createdAt: DateTime @default(now())
- updatedAt: DateTime
```

**JSON field structure**:

```typescript
requirements: string[];

keywords: {
  technical: string[];
  soft: string[];
  tools: string[];
}
```

##### 8. **applications**

```prisma
- id: String @id
- userId: String
- baseCVId: String
- jobListingId: String
- customCV: Json
- atsScore: Float?
- atsAnalysis: Json?
- matchScore: Float?
- status: ApplicationStatus @default(DRAFT)
- appliedAt: DateTime?
- cvPdfUrl: String?
- coverLetterId: String? @unique
- notes: String?
- createdAt: DateTime @default(now())
- updatedAt: DateTime
```

**Status enum**: `DRAFT`, `READY`, `APPLIED`, `INTERVIEWING`, `OFFERED`, `REJECTED`, `ACCEPTED`, `WITHDRAWN`

**Account plan enforcement**: Free tier users are limited to 3 applications (configurable in `src/lib/plans.ts`). Professional accounts have unlimited applications.

##### 9. **cover_letters**

```prisma
- id: String @id
- userId: String
- content: String
- htmlContent: String?
- pdfUrl: String?
- tone: String?
- template: String?
- createdAt: DateTime @default(now())
- updatedAt: DateTime
```

#### Template Model (1)

##### 10. **cv_templates**

```prisma
- id: String @id
- name: String
- description: String?
- htmlContent: String
- thumbnail: String?
- isPublic: Boolean @default(true)
- createdAt: DateTime @default(now())
- updatedAt: DateTime
```

#### Utility Model (1)

##### 11. **rate_limits**

```prisma
- id: String @id
- identifier: String
- endpoint: String
- attempts: Int @default(1)
- windowStart: DateTime @default(now())
- blockedUntil: DateTime?
```

**Composite unique constraint**: `[identifier, endpoint]`

### Relationship Diagram

```
users (1) ──┬──> (N) sessions
            ├──> (N) accounts
            ├──> (N) audit_logs
            ├──> (N) base_cvs
            ├──> (N) applications
            ├──> (N) cover_letters
            └──> (N) verification_tokens

base_cvs (1) ────> (N) applications

job_listings (1) ─> (N) applications

applications (1) ─> (1?) cover_letters
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
├── scripts/
│   └── vercel-build.js         # Vercel build entry point
│
├── templates/                  # HTML templates for PDFs
│   └── cv/
│       └── modern.html
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   │
│   │   ├── [locale]/          # 🌍 Internationalized routes (default: en)
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx           # Registration page
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx           # Email verification
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx           # Password reset request
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx           # Password reset form
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx         # Dashboard layout
│   │   │       ├── page.tsx           # Dashboard home
│   │   │       ├── cv/
│   │   │       │   ├── page.tsx       # CV list
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx   # Create new CV
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx   # Edit CV
│   │   │       ├── applications/
│   │   │       │   ├── page.tsx       # Applications list
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx   # Create new application
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx   # View application
│   │   │       └── profile/
│   │   │           ├── page.tsx       # User profile / 2FA settings
│   │   │           ├── change-password/
│   │   │           │   └── page.tsx   # Change password
│   │   │           └── 2fa/
│   │   │               ├── setup/
│   │   │               │   └── page.tsx # Set up 2FA
│   │   │               └── disable/
│   │   │                   └── page.tsx # Disable 2FA
│   │   │
│   │   └── api/               # API Routes (no locale prefix)
│   │       ├── auth/          # 🔐 Authentication (19 endpoints)
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── logout-all/route.ts
│   │       │   ├── verify-email/route.ts
│   │       │   ├── resend-verification/route.ts
│   │       │   ├── forgot-password/route.ts
│   │       │   ├── reset-password/route.ts
│   │       │   ├── change-password/route.ts
│   │       │   ├── session/route.ts
│   │       │   ├── profile/route.ts
│   │       │   ├── sessions/route.ts
│   │       │   ├── sessions/[sessionId]/route.ts
│   │       │   └── 2fa/
│   │       │       ├── enable/route.ts
│   │       │       ├── verify-setup/route.ts
│   │       │       ├── verify/route.ts
│   │       │       ├── disable/route.ts
│   │       │       └── backup-codes/route.ts
│   │       │
│   │       ├── application/   # Application management
│   │       │   ├── create/route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── download-cv/route.ts
│   │       │       └── download-cover-letter/route.ts
│   │       │
│   │       ├── cover-letter/
│   │       │   └── generate/route.ts
│   │       │
│   │       ├── cv/            # CV management
│   │       │   ├── upload/route.ts
│   │       │   ├── create/route.ts
│   │       │   ├── parse/route.ts
│   │       │   ├── generate/route.ts
│   │       │   └── [id]/route.ts
│   │       │
│   │       ├── job/
│   │       │   └── analyze/route.ts
│   │       │
│   │       └── pdf/
│   │           └── generate/route.ts
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   └── label.tsx
│   │   ├── cv/
│   │   │   └── cv-form.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── UserMenu.tsx
│   │
│   ├── hooks/
│   │   └── use-auth.tsx       # Authentication context & hooks
│   │
│   ├── i18n/                  # 🌍 next-intl config
│   │   ├── routing.ts         # Locale routing (default: en)
│   │   └── request.ts         # Server-side i18n
│   │
│   ├── lib/                   # Business logic
│   │   ├── ai/                # AI services
│   │   │   ├── service.ts
│   │   │   ├── errors.ts
│   │   │   ├── google-ai.ts
│   │   │   ├── openai.ts
│   │   │   ├── job-analyzer.ts
│   │   │   ├── cv-generator.ts
│   │   │   ├── cover-letter-generator.ts
│   │   │   ├── ats-scorer.ts
│   │   │   └── prompts/
│   │   │       └── index.ts
│   │   │
│   │   ├── auth/              # Authentication services
│   │   │   ├── session.ts
│   │   │   ├── password.ts
│   │   │   ├── totp.ts
│   │   │   ├── rate-limit.ts
│   │   │   ├── account-lockout.ts
│   │   │   ├── audit-log.ts
│   │   │   ├── email-verification.ts
│   │   │   ├── server-session.ts
│   │   │   ├── edge-session.ts
│   │   │   └── edge-crypto.ts
│   │   │
│   │   ├── plans.ts            # Account plan types & limits
│   │   ├── cv/
│   │   │   └── parser.ts
│   │   │
│   │   ├── db/
│   │   │   └── prisma.ts      # Prisma singleton client (exported as any)
│   │   │
│   │   ├── email/
│   │   │   └── sender.ts      # SMTP email service
│   │   │
│   │   ├── pdf/
│   │   │   └── generator.ts   # Puppeteer PDF generation
│   │   │
│   │   ├── utils/
│   │   │   ├── formatting.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── icons.ts
│   │
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # 🌍 Locale detection + 🔐 Auth protection
│
├── docs/                      # 📚 Project documentation
├── tests/                     # Test files (gitignored)
├── .env.local                 # Environment variables (NOT in git)
├── .env.example
├── .gitignore
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── postcss.config.mjs         # PostCSS configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest configuration
├── vercel.json                # Vercel configuration
├── package.json
└── pnpm-lock.yaml
```

---

## 🔌 Implemented API Endpoints

### Authentication Endpoints (19 total)

#### User Registration & Login

##### POST /api/auth/register

Register new user with email/password.

**Request**:

```json
{
  "email": "string",
  "password": "string",
  "name": "string?"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account."
}
```

##### POST /api/auth/login

Login with credentials.

**Request**:

```json
{
  "email": "string",
  "password": "string",
  "totpCode": "string?"
}
```

**Response** (without 2FA):

```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Response** (with 2FA):

```json
{
  "success": true,
  "requires2FA": true,
  "tempToken": "string",
  "expiresIn": 300
}
```

##### POST /api/auth/logout

Logout current session.

##### POST /api/auth/logout-all

Logout from all devices.

#### Email Verification

##### POST /api/auth/verify-email

Verify email with token.

**Request**:

```json
{
  "token": "string"
}
```

##### POST /api/auth/resend-verification

Resend verification email.

#### Password Management

##### POST /api/auth/forgot-password

Request password reset email.

**Request**:

```json
{
  "email": "string"
}
```

##### POST /api/auth/reset-password

Reset password with token.

**Request**:

```json
{
  "token": "string",
  "password": "string"
}
```

##### POST /api/auth/change-password

Change password for logged-in user.

**Request**:

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### Two-Factor Authentication

##### POST /api/auth/2fa/enable

Generate 2FA secret and QR code.

**Response**:

```json
{
  "secret": "string",
  "qrCode": "string"
}
```

##### POST /api/auth/2fa/verify-setup

Verify and enable 2FA.

**Request**:

```json
{
  "code": "string"
}
```

**Response**:

```json
{
  "success": true,
  "backupCodes": ["string"]
}
```

##### POST /api/auth/2fa/verify

Verify 2FA code during login.

**Request**:

```json
{
  "tempToken": "string",
  "code": "string",
  "useBackupCode": false
}
```

##### POST /api/auth/2fa/disable

Disable 2FA for user.

##### POST /api/auth/2fa/backup-codes

Regenerate backup codes.

#### Session Management

##### GET /api/auth/session

Get current session information.

##### GET /api/auth/profile

Get current user profile.

##### GET /api/auth/sessions

List all user sessions.

##### DELETE /api/auth/sessions/[id]

Revoke specific session.

### Core Application Endpoints

##### POST /api/job/analyze

Analyzes a job description and extracts structured information.

**Request**:

```json
{
  "description": "string",
  "url": "string?"
}
```

##### POST /api/cv/generate

Generates a customized resume based on a base resume and a job posting.

**Request**:

```json
{
  "baseCVId": "string",
  "jobListingId": "string"
}
```

##### POST /api/cover-letter/generate

Generates a personalized cover letter.

**Request**:

```json
{
  "applicationId": "string",
  "tone": "professional|enthusiastic|casual"
}
```

##### POST /api/pdf/generate

Generates a PDF from a resume or cover letter.

**Request**:

```json
{
  "type": "cv|cover-letter",
  "id": "string",
  "templateId": "string?"
}
```

##### POST /api/cv/upload

Uploads and parses a CV file (PDF, DOCX, TXT).

**Request**: `multipart/form-data` with file

##### POST /api/cv/create

Creates a base CV manually from structured data.

##### POST /api/cv/parse

Parses raw CV text without saving to database.

##### GET/PUT/DELETE /api/cv/[id]

Manage individual base CVs.

##### POST /api/application/create

Creates a new job application with customized CV.

**Request**:

```json
{
  "baseCVId": "string",
  "jobListingId": "string"
}
```

**Note**: Transaction timeout is extended to 15s (`maxWait: 15000, timeout: 15000`).

##### GET/PUT/DELETE /api/application/[id]

Manage applications.

##### GET /api/application/[id]/download-cv

Downloads the generated CV as PDF.

**Filename Format**: `User_Name_CV_[CompanyName].pdf`

##### GET /api/application/[id]/download-cover-letter

Downloads the generated cover letter as PDF.

**Filename Format**: `User_Name_CL_[CompanyName].pdf`

---

## 🔑 Environment Variables

### `.env.local` file (required)

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://..."

# ============================================
# AUTHENTICATION & SESSIONS
# ============================================
# Generate with: openssl rand -hex 32
SESSION_SECRET="your-64-character-hex-string"

# ============================================
# EMAIL / SMTP
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
# Must be a valid address — for Gmail, match SMTP_USER
EMAIL_FROM="Apply Job <your-email@gmail.com>"

# ============================================
# APPLICATION URL
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================
# GOOGLE AI (Recommended - Cost-effective)
# ============================================
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"

# ============================================
# OPENAI (Optional - Higher quality fallback)
# ============================================
# OPENAI_API_KEY="sk-..."

# ============================================
# OPTIONAL: OAUTH (Future)
# ============================================
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
# GITHUB_CLIENT_ID="..."
# GITHUB_CLIENT_SECRET="..."
```

### Recommended Database Providers

**For Development**:

- Local PostgreSQL with Docker
- Neon (free tier, serverless)

**For Production**:

- Neon (https://neon.tech) - Recommended
- Supabase (https://supabase.com)
- Railway (https://railway.app)

---

## 🛠️ Available Commands

### Development

```bash
# Install dependencies
pnpm install

# Development mode (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Run production build
pnpm start

# Lint
pnpm lint

# Type checking
pnpm type-check
```

### Database

```bash
# Generate Prisma client (after schema changes)
pnpm db:generate

# Push schema to DB (quick development, no migrations)
pnpm db:push

# Create migration (production)
pnpm db:migrate

# Open Prisma Studio (GUI to view data)
pnpm db:studio

# Seed DB with sample data
pnpm db:seed
```

### Testing

```bash
# Run Jest tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Prisma Workflow

1. **Change schema** → Edit `prisma/schema.prisma`
2. **Apply changes** → `pnpm db:push` (dev) or `pnpm db:migrate` (prod)
3. **Generate client** → `pnpm db:generate` (if not done automatically)
4. **Verify** → `pnpm db:studio` (view data)

---

## 🧠 Main Workflows

### Workflow 1: Base Resume Upload & Parsing

```
1. User uploads file (PDF/DOCX/TXT)
   ↓
2. src/lib/cv/parser.ts → parseCV()
   - Extracts text from file
   ↓
3. src/lib/ai/service.ts / google-ai.ts
   - AI structures data into BaseCV format
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
3. src/lib/ai/job-analyzer.ts → analyzeJob()
   - Extracts: title, company, requirements
   - Identifies technical and soft skills keywords
   ↓
4. Save to DB (job_listings table)
   ↓
5. Display analysis + keywords
```

### Workflow 3: Custom Resume Generation

```
1. User selects BaseCV + JobListing
   ↓
2. POST /api/application/create (or POST /api/cv/generate)
   ↓
3. src/lib/ai/cv-generator.ts → generateCustomCV()
   - Reads original BaseCV
   - Reads JobListing requirements
   - Adapts sections according to keywords
   - Optimizes bullets for ATS
   ↓
4. src/lib/ai/ats-scorer.ts → calculateScore()
   - Calculates matching score (0-100)
   - Generates improvement suggestions
   ↓
5. Save Application to DB (applications table)
   ↓
6. Display resume + Score + Suggestions
```

### Workflow 4: Cover Letter Generation

```
1. User chooses existing Application
   ↓
2. POST /api/cover-letter/generate
   ↓
3. src/lib/ai/cover-letter-generator.ts → generateCoverLetter()
   - Reads customized resume
   - Reads job listing
   - Generates letter with selected tone
   ↓
4. Save to cover_letters table
   ↓
5. Display cover letter (Markdown/HTML)
```

### Workflow 5: PDF Generation

```
1. User downloads resume or Cover Letter
   ↓
2. GET /api/application/[id]/download-cv
   or GET /api/application/[id]/download-cover-letter
   or POST /api/pdf/generate
   ↓
3. src/lib/pdf/generator.ts → generatePDF()
   - Loads HTML template (templates/cv/modern.html)
   - Injects resume data
   - Puppeteer-core + chromium-min renders HTML → PDF
   ↓
4. Return PDF as download
```

#### PDF Styling Details

**CV PDF:**

- Font: Arial/Helvetica (system fonts)
- Layout: Single-column, minimalist black design
- Margins: 12mm top/bottom, 15mm left/right
- Filename: `User_Name_CV_[CompanyName].pdf`

**Cover Letter PDF:**

- Font: Libre Baskerville (Google Fonts) with fallbacks
- Size: 12pt
- Line Height: 1.7
- Text Alignment: Justified
- Color: #1a1a1a
- Paragraph Spacing: 18px
- Margins: 25mm top/bottom, 20mm left/right
- Greeting: "Hi [Company Name] team,"
- Closing: "Best regards,\n[Candidate Name]"
- Filename: `[Candidate_Name]_CL_[CompanyName].pdf`

---

## 🤖 AI System - Implementation Details

### Providers

**Primary: Google Gemini**

- Package: `@google/generative-ai`
- Cost-effective, fast
- Used for all generation tasks

**Optional/Fallback: OpenAI GPT-4o**

- Package: `openai`
- Model: `gpt-4o`
- Used when Google Gemini returns errors (503) or when configured

### Main Prompts

Prompts are in `src/lib/ai/prompts/index.ts`:

1. **CV_PARSER_PROMPT**: Structures resume text into JSON
2. **JOB_ANALYZER_PROMPT**: Analyzes job description
3. **CV_GENERATOR_PROMPT**: Customizes resume for job posting
4. **ATS_SCORER_PROMPT**: Calculates ATS score
5. **COVER_LETTER_PROMPT**: Generates personalized cover letter

### Fallback Strategy

- The application attempts Google Gemini first
- If Gemini returns a 503 or other error, it falls back to OpenAI if configured
- User-friendly error messages are returned if both providers fail

---

## 🎨 Template System

### Current Template: Minimalist Black (Single Column)

File: `templates/cv/modern.html` and `src/lib/pdf/generator.ts`

**Features**:

- Single-column vertical layout
- Minimalist black text design
- Professional and clean aesthetics
- ATS-optimized (plain text, no complex formatting)
- Fits on 1 page (A4 format)
- Dynamic subtitle generation from job titles
- Skills displayed inline with bullet separator (•)
- Experience limited to bullets per job for space efficiency

**PDF Generation Settings**:

```typescript
{
  format: 'A4',
  printBackground: true,
  margin: {
    top: '12mm',
    right: '15mm',
    bottom: '12mm',
    left: '15mm',
  }
}
```

---

## 🚀 Implementation Status

### ✅ Completed

- [x] Initial project setup
- [x] Next.js 15 + TypeScript setup
- [x] Tailwind CSS + shadcn/ui configuration
- [x] Prisma + PostgreSQL setup
- [x] Complete database models (11 models, plural table names)
- [x] Google Generative AI integration (primary)
- [x] OpenAI GPT-4o integration (optional fallback)
- [x] Multi-language support (English/Spanish) with next-intl; default is English
- [x] Internationalization middleware and routing
- [x] Language switcher component
- [x] Resume parser (PDF, DOCX, TXT)
- [x] API: CV upload, create, parse, generate
- [x] API: Job description analysis
- [x] API: Custom resume generation
- [x] API: Cover letter generation
- [x] API: PDF generation and download
- [x] API: Application creation and management
- [x] ATS scoring system
- [x] Minimalist single-column PDF template
- [x] TypeScript types structure
- [x] Transaction timeout fixes for application creation (15s)
- [x] **Complete custom authentication system** (session-based — no NextAuth)
  - [x] Email/password registration with email verification
  - [x] Login with session cookie management
  - [x] Logout (single session and all sessions)
  - [x] Password reset via email
  - [x] Two-Factor Authentication (TOTP via `otpauth`)
  - [x] Rate limiting and account lockout
  - [x] Comprehensive audit logging
  - [x] Multi-device session management
- [x] **SMTP email delivery** working in production (nodemailer)
  - [x] Email verification on registration
  - [x] Password reset email
- [x] **Dashboard UI** with CV, Applications, and Profile pages
- [x] **Vercel production deployment**
  - [x] `scripts/vercel-build.js` — auto-runs migrations when `DATABASE_URL` is set
  - [x] Neon PostgreSQL database connected
- [x] **Account plans** (FREE / PROFESSIONAL)
  - [x] Free plan: 3 application limit (configurable in `src/lib/plans.ts`)
  - [x] Professional plan: unlimited applications
  - [x] Limit enforced server-side with audit logging
  - [x] Plan badge in UserMenu and plan display on profile page
  - [x] Manual upgrade via database (`UPDATE users SET "accountType" = 'PROFESSIONAL'`)

### 🚧 In Development / Pending

#### Frontend (UI/UX)

- [ ] Landing page polish
- [ ] Dashboard stats cards (total apps, response rate, etc.)
- [ ] Progress charts
- [ ] Base resume editor with full section editing
- [ ] Generated resume view with ATS score visualization
- [ ] Cover letter editor with live preview
- [ ] Application tracking: filters, states, notes, event timeline
- [ ] Advanced user settings

#### Additional APIs

- [ ] GET /api/applications (list all user applications)
- [ ] File upload to cloud storage (S3/Vercel Blob)

#### AI Improvements

- [ ] Response streaming
- [ ] Cache similar job analysis
- [ ] Prompt fine-tuning
- [ ] Feedback system

#### Advanced Features

- [ ] Multiple resume templates
- [ ] Visual resume editor
- [ ] Side-by-side comparison
- [ ] Job board integrations (LinkedIn, Indeed)
- [ ] Notifications and follow-up reminders

#### DevOps and Quality

- [ ] More unit tests (Jest)
- [ ] Integration/E2E tests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Vercel Analytics / PostHog)

---

## 🐛 Known Issues and Considerations

### 1. Resume Parsing

- **Issue**: Resumes can have very varied formats
- **Current solution**: AI structures extracted text
- **Improvement**: Implement validations and fallbacks

### 2. AI API Costs

- **Issue**: Each resume generation costs money
- **Solution**: Use Gemini for cost-effective generation, cache results, rate limit per user

### 3. ATS Score Accuracy

- **Issue**: Scoring is an estimate, not a guarantee
- **Solution**: Clear disclaimer, validate with real data

### 4. PDF Generation Performance

- **Issue**: Puppeteer is slow (~2-5 seconds per PDF)
- **Solution**: Move to queue/background job (BullMQ, Inngest)

### 5. File Upload Security

- **Issue**: File uploads can be attack vector
- **Solution**: Validate types, scan malware, limit size

### 6. Transaction Timeouts ✅ FIXED

- **Issue**: Prisma transaction timeout during application creation (5s default too short)
- **Solution**: Increased timeout to 15s in `/api/application/create` route
- **Implementation**: `prisma.$transaction([], { maxWait: 15000, timeout: 15000 })`

### 7. Google AI Service Availability

- **Issue**: 503 errors during high demand periods
- **Solution**: Fallback to OpenAI when configured, retry logic, user-friendly error messages

---

## 📈 Recommended Next Steps

### High Priority (MVP polish)

1. **Build Dashboard UI**
   - Applications list with filters and status
   - Stats cards (total apps, response rate, ATS average)
   - Navigation and user menu

2. **Resume Upload Form**
   - Drag & drop
   - Extraction preview and data editing

3. **Complete generation flow UI**
   - Job description input
   - Analysis + Preview
   - Resume generation and PDF download

4. **User Settings Page**
   - Password change
   - 2FA setup and backup codes
   - Active sessions list with revoke option

### Medium Priority

5. **Template system** — additional PDF designs
6. **Cover Letter UI** — Editor + Preview + Download
7. **Application tracking** — States, Notes, Timeline

---

## 🔧 Important Technical Configurations

### next.config.js

```javascript
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
};

module.exports = withNextIntl(nextConfig);
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

export default config;
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
- **React**: https://react.dev
- **Prisma**: https://www.prisma.io/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Google AI SDK**: https://ai.google.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **next-intl**: https://next-intl-docs.vercel.app/

### Development Tools

- **Prisma Studio**: `pnpm db:studio`
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🔐 Security and Best Practices

### Environment Variables

- ✅ Never commit `.env.local`
- ✅ Use `NEXT_PUBLIC_` only for public vars
- ✅ Rotate API keys regularly

### API Routes

- ✅ Validate inputs with Zod
- ✅ Rate limiting implemented
- ✅ Consistent error handling
- ✅ Don't expose internal details in errors

### Database

- ✅ Use connection pooling
- ✅ Indexes on frequently searched fields
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

## 📋 Continuation Checklist

When resuming the project, verify:

- [ ] `pnpm install` executed without errors
- [ ] `.env.local` configured correctly (DATABASE_URL, SESSION_SECRET, SMTP_*, NEXT_PUBLIC_APP_URL, GOOGLE_AI_API_KEY)
- [ ] Database accessible (`pnpm db:studio`)
- [ ] Prisma client generated (`pnpm db:generate`)
- [ ] Valid AI API key (Google AI or OpenAI) configured
- [ ] `pnpm dev` works at http://localhost:3000
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] Review this document for complete context

---

## 🎉 Conclusion

This project is in a solid technical foundation phase. The architecture is scalable, the technology stack is modern, and the main components are implemented.

**What works**:

- ✅ Dual AI provider support (Google Gemini + OpenAI)
- ✅ Multi-language interface (English/Spanish, default English)
- ✅ AI APIs (job analysis, resume generation, cover letters, ATS scoring)
- ✅ Robust database system (PostgreSQL with Prisma)
- ✅ PDF generation and download
- ✅ Resume parsing
- ✅ Complete custom authentication system
- ✅ SMTP email delivery
- ✅ Dashboard UI
- ✅ Vercel production deployment
- ✅ Account plans (FREE/PROFESSIONAL) with application limits

**What's missing**:

- 🚧 Dashboard analytics and stats
- 🚧 More PDF templates
- 🚧 Cloud file storage
- 🚧 More automated tests

---

**Last updated**: July 7, 2026
**Version**: 0.1.0 (matches package.json)
**Maintainer**: @fawer5dev
