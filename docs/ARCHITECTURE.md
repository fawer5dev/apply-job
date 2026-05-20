# Technical Architecture - Apply Job

## 📐 Overview

Apply Job is a full-stack web application built with Next.js 15 that automates the job application process using AI.

## 🏗️ Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18.3.1
- **TypeScript**: 5.x (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI components)
- **State Management**: Zustand 4.5.4 + React Query 5.51.1
- **Forms**: React Hook Form 7.52.1 + Zod 3.23.8
- **Internationalization**: next-intl 4.11.0 (English, Spanish)

### Backend

- **Runtime**: Node.js 20+
- **API**: Next.js API Routes (Route Handlers)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.19.0
- **Authentication**: 
  - Custom implementation with session-based auth
  - Argon2id password hashing (@node-rs/argon2)
  - TOTP 2FA (otpauth with QR codes)
  - Multi-device session management
  - Rate limiting and account lockout
- **Email**: Nodemailer 8.0.7 (SMTP)
- **AI**: Google Gemini 2.5 Flash (primary), OpenAI GPT-4o (optional)
- **PDF**: Puppeteer 23.1.1
- **Document Parsing**: pdf-parse 1.1.1, mammoth 1.8.0

### Infrastructure

- **Hosting**: Vercel
- **Database**: Neon / Supabase
- **Storage**: Vercel Blob (future)
- **Monitoring**: Sentry + Vercel Analytics

---

## 📊 Data Model

### Main Entities

1. **User**: Application user with authentication details
2. **Session**: User sessions with device/IP tracking
3. **Account**: OAuth provider accounts (future use)
4. **VerificationToken**: Email verification and password reset tokens
5. **AuditLog**: Security event logging
6. **RateLimit**: API rate limiting tracking
7. **BaseCV**: User's base resume
8. **JobListing**: Analyzed job posting
9. **Application**: Customized resume for a specific job
10. **CoverLetter**: Generated cover letter
11. **CVTemplate**: Resume design template

### Relationships

```
User
├── Session[] (1:N) - User sessions
├── Account[] (1:N) - OAuth accounts
├── AuditLog[] (1:N) - Security events
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

## 🔐 Authentication Architecture

### Overview

The application implements a production-ready authentication system with session-based auth, 2FA, and comprehensive security features.

### Core Components

#### 1. Session Management (`src/lib/auth/session.ts`)

- **Database-backed sessions** (not JWT)
- 7-day session duration with automatic refresh (24h threshold)
- Multi-device support (max 5 sessions per user)
- Session rotation on security-sensitive actions
- Device and IP tracking for security
- Secure cookie handling (httpOnly, sameSite, secure in prod)

#### 2. Password Security (`src/lib/auth/password.ts`)

- **Argon2id hashing** (industry best practice)
- Memory cost: 19456 KB
- Time cost: 2 iterations
- Parallelism: 1
- Password strength validation (min 8 chars, uppercase, lowercase, number, special char)

#### 3. Two-Factor Authentication (`src/lib/auth/totp.ts`)

- **TOTP-based 2FA** (RFC 6238)
- Compatible with Google Authenticator, Authy, 1Password
- QR code generation for easy setup
- 10 backup codes (single-use, securely hashed)
- Optional but recommended

#### 4. Rate Limiting (`src/lib/auth/rate-limit.ts`)

- Configurable per-endpoint rate limits
- Tracked by IP + identifier (email/userId)
- Automatic cleanup of old records
- Prevents brute force attacks

#### 5. Account Lockout (`src/lib/auth/account-lockout.ts`)

- Configurable failed attempt threshold (default: 5)
- Progressive lockout duration (5 min → 15 min → 1 hour)
- Automatic unlock after lockout expiry
- Audit trail of lockout events

#### 6. Email Verification (`src/lib/auth/email-verification.ts`)

- Required for new accounts
- Secure token generation
- 24-hour token expiration
- Resend capability with rate limiting

#### 7. Audit Logging (`src/lib/auth/audit-log.ts`)

- Comprehensive security event tracking
- Logs: IP address, user agent, action, success/failure
- Events tracked:
  - Login, logout, registration
  - Password changes, resets
  - 2FA setup, disable, verification
  - Failed login attempts
  - Session actions

### Authentication Flow

#### Registration Flow
```
1. User submits registration form
   ↓
2. Validate input (Zod schema)
   ↓
3. Check if email already exists
   ↓
4. Hash password (Argon2id)
   ↓
5. Create user in database
   ↓
6. Generate verification token
   ↓
7. Send verification email
   ↓
8. Return success (user cannot login until verified)
```

#### Login Flow
```
1. User submits credentials
   ↓
2. Rate limit check
   ↓
3. Account lockout check
   ↓
4. Find user by email
   ↓
5. Verify password (Argon2id)
   ↓
6. Check email verification status
   ↓
7. If 2FA enabled → request TOTP code
   ↓
8. Create session
   ↓
9. Set session cookie
   ↓
10. Log successful login
```

#### 2FA Setup Flow
```
1. User must be logged in
   ↓
2. Generate TOTP secret
   ↓
3. Create QR code
   ↓
4. User scans QR code in authenticator app
   ↓
5. User enters verification code
   ↓
6. Verify code is correct
   ↓
7. Enable 2FA in database
   ↓
8. Generate 10 backup codes
   ↓
9. Return backup codes (user must save these)
```

#### Password Reset Flow
```
1. User requests password reset
   ↓
2. Verify email exists
   ↓
3. Generate secure reset token
   ↓
4. Send reset email (token expires in 1 hour)
   ↓
5. User clicks link, submits new password
   ↓
6. Verify token is valid and not expired
   ↓
7. Hash new password
   ↓
8. Update user password
   ↓
9. Invalidate all existing sessions
   ↓
10. Delete reset token
```

### API Endpoints

#### Authentication (17 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout all devices
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (logged in)

#### Two-Factor Authentication
- `POST /api/auth/2fa/enable` - Generate 2FA secret and QR code
- `POST /api/auth/2fa/verify-setup` - Verify and enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code during login
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/2fa/backup-codes` - Regenerate backup codes

#### Session Management
- `GET /api/auth/session` - Get current session
- `GET /api/auth/sessions` - List all user sessions
- `DELETE /api/auth/sessions/[id]` - Revoke specific session

### Protected Routes

The middleware (`src/middleware.ts`) protects routes requiring authentication:

**Protected Routes:**
- `/[locale]/dashboard` - Main user dashboard
- `/[locale]/dashboard/cv` - CV management
- `/[locale]/dashboard/applications` - Application tracking

**Public Routes:**
- `/[locale]` - Landing page
- `/[locale]/login` - Login page
- `/[locale]/register` - Registration page
- `/[locale]/verify-email` - Email verification
- `/[locale]/forgot-password` - Password reset request
- `/[locale]/reset-password` - Password reset form

### Security Features

1. **Password Security**
   - Argon2id hashing (winner of Password Hashing Competition)
   - Strong password requirements
   - No plain text passwords stored

2. **Session Security**
   - HttpOnly cookies (XSS protection)
   - SameSite=Lax (CSRF protection)
   - Secure flag in production (HTTPS only)
   - Session rotation on privilege changes

3. **Brute Force Protection**
   - Rate limiting per endpoint
   - Account lockout after failed attempts
   - Progressive lockout duration

4. **Audit Trail**
   - All security events logged
   - IP and user agent tracking
   - Success/failure tracking

5. **Email Security**
   - Email verification required
   - Secure token generation (crypto.randomBytes)
   - Token expiration (1 hour for reset, 24 hours for verification)

### Frontend Components

- **`useAuth` hook** (`src/hooks/use-auth.tsx`) - Authentication context and hooks
- **`UserMenu` component** (`src/components/UserMenu.tsx`) - User dropdown menu
- **Auth pages** (`src/app/[locale]/login`, `/register`, etc.) - Authentication UI

### Environment Variables

```env
# Session
SESSION_SECRET="64-character-hex-string"  # Generate with: openssl rand -hex 32

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use app password for Gmail
EMAIL_FROM="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Used for email links
```

For complete documentation, see [AUTH_FINAL_COMPLETE.md](AUTH_FINAL_COMPLETE.md).

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

### Authentication (17 endpoints)

See [Authentication Architecture](#-authentication-architecture) section above for complete details.

- `POST /api/auth/register`, `/login`, `/logout`, `/logout-all`
- `POST /api/auth/verify-email`, `/resend-verification`
- `POST /api/auth/forgot-password`, `/reset-password`, `/change-password`
- `POST /api/auth/2fa/enable`, `/2fa/verify-setup`, `/2fa/verify`, `/2fa/disable`, `/2fa/backup-codes`
- `GET /api/auth/session`, `/sessions`
- `DELETE /api/auth/sessions/[id]`

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

### Primary Provider: Google Gemini 2.5 Flash

**Cost-effective solution for high-volume processing**

- Model: `gemini-2.0-flash-exp`
- Significantly lower cost compared to OpenAI (10x reduction)
- Fast response times
- 8000 token output limit
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
- **Signature**: "Best regards,\n{candidateName}" (dynamically populated from CV)
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
- Download filename: `[Candidate_Name]_CL_[CompanyName].pdf` (e.g., John_Doe_CL_Google.pdf)

---

## 🔒 Security Considerations

### Production-Ready Authentication

The application now includes enterprise-grade authentication:

- **Session-based authentication** with secure cookie handling
- **Argon2id password hashing** (industry standard)
- **Two-Factor Authentication (2FA)** with TOTP
- **Rate limiting** to prevent abuse
- **Account lockout** protection against brute force
- **Comprehensive audit logging** for security events
- **Email verification** required for new accounts
- **Multi-device session management** (max 5 devices)

### Data Security

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: React automatic escaping + httpOnly cookies
- **CSRF Prevention**: SameSite cookies + token validation
- **Environment Variables**: Sensitive data in .env (never committed)

### Future Enhancements

- **OAuth Providers**: GitHub, Google login
- **API Rate Limiting**: Per-user API quotas
- **Data Encryption**: At-rest encryption for sensitive data
- **Security Headers**: Helmet.js for additional headers
- **CAPTCHA**: Bot protection on registration/login

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

---

## 🎯 Technical Roadmap

### Q2 2026

- [x] MVP with CV generation
- [x] ATS scoring
- [x] Cover letter generation
- [x] Multi-user authentication system
- [x] Email verification and password reset
- [x] Two-Factor Authentication (2FA)
- [x] Session management
- [ ] Complete frontend UI/UX
- [ ] Automated tests

### Q3 2026

- [ ] Complete dashboard statistics and analytics
- [ ] File storage (S3/Vercel Blob)
- [ ] Email notifications for application updates
- [ ] Multiple CV templates
- [ ] OAuth providers (GitHub, Google)

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
