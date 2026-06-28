# Environment Variables Reference

This document lists all environment variables used by the Apply Job application.

## Required Variables

### Database

```env
# PostgreSQL connection string for Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/applyjob"
```

### Authentication & Sessions

```env
# Session secret for cookie signing (generate with: openssl rand -hex 32)
# This produces a 64-character hex string from 32 random bytes
SESSION_SECRET="your-random-32-byte-hex-string-here"
```

### Application URL

```env
# Base URL of your application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### AI Providers (at least one required)

```env
# Google Gemini (primary - recommended, cost-effective)
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"

# OpenAI GPT-4o (optional fallback/alternative)
OPENAI_API_KEY="your-openai-api-key-here"
```

### Email / SMTP Configuration

#### Option 1: Gmail (Development/Testing)

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="Apply Job <your-email@gmail.com>"
```

**Important notes:**

- `EMAIL_FROM` must be a valid email address in one of these formats:
  - `"your-email@gmail.com"` (plain)
  - `"Apply Job <your-email@gmail.com>"` (with display name)
- For Gmail, the address in `EMAIL_FROM` must match `SMTP_USER` (or a verified alias).
- A malformed `EMAIL_FROM` causes a `501 Bad sender address syntax` SMTP error.
- To use Gmail, enable 2FA and generate an App Password (see below).

#### Option 2: SendGrid (Production)

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
EMAIL_FROM="Apply Job <noreply@yourdomain.com>"
```

#### Option 3: AWS SES (Production)

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-aws-smtp-username"
SMTP_PASS="your-aws-smtp-password"
EMAIL_FROM="Apply Job <noreply@yourdomain.com>"
```

---

## Complete .env.local Example

Create a `.env.local` file in your project root with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/applyjob"

# Session Security
SESSION_SECRET="generate-this-with-openssl-rand-hex-32"

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="Apply Job <your-email@gmail.com>"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Providers (at least one required)
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"
# OPENAI_API_KEY="your-openai-api-key-here"

# Optional: OAuth Providers (Future Enhancement)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GITHUB_CLIENT_ID="your-github-client-id"
# GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## Generating Secure Secrets

### Session Secret

Generate a secure random 32-byte hex string:

```bash
# Using OpenSSL (macOS/Linux)
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Development vs Production

### Development (.env.local)

- Use Gmail SMTP for testing (with App Password)
- Use localhost URLs
- Enable console logging (automatically enabled in `NODE_ENV=development`)
- Emails are logged to the console if `SMTP_USER` is not set

### Production (.env.production)

- Use a professional SMTP service (SendGrid, AWS SES, Mailgun)
- Use your production domain URL
- Use secure, randomly generated secrets
- Enable `SMTP_SECURE="true"` if your provider supports SSL on port 465

---

## Environment Variable Loading

Next.js loads environment variables in this order:

1. `.env.local` (highest priority, git-ignored)
2. `.env.production` or `.env.development`
3. `.env`

**Important:**

- Never commit `.env.local` to git
- Add `.env.local` to your `.gitignore`
- Use `.env.example` to document required variables

---

## Verification Checklist

After setting up environment variables:

- [ ] Database connection works (`pnpm db:push`)
- [ ] Prisma client is generated (`pnpm db:generate`)
- [ ] SMTP sends emails (test registration flow)
- [ ] Session secret is 64 characters (32 bytes hex)
- [ ] `EMAIL_FROM` matches your domain/provider
- [ ] `NEXT_PUBLIC_APP_URL` matches your deployment URL
- [ ] At least one AI provider key is configured
- [ ] All secrets are different between dev and production

---

## Troubleshooting

### SMTP Not Working

- Check SMTP credentials are correct
- Verify firewall/network allows SMTP ports (587/465)
- For Gmail: Ensure 2FA is enabled and you're using an App Password
- **`501 Bad sender address syntax`**: `EMAIL_FROM` is malformed or empty. Use a valid address like `Apply Job <your-email@gmail.com>`. For Gmail it must match `SMTP_USER`.
- Check spam folder for verification emails
- Review logs in development mode (emails log to console when SMTP is not configured)

### Session Issues

- Verify `SESSION_SECRET` is set and 64 characters long
- Clear browser cookies
- Check cookie settings in browser dev tools
- Cookie name is `session-token`

### Database Connection

- Verify `DATABASE_URL` format is correct
- Test connection: `pnpm db:push`
- Check PostgreSQL is running
- Verify user permissions

### AI API Errors

- Verify `GOOGLE_AI_API_KEY` or `OPENAI_API_KEY` is set
- The application can fall back from Google Gemini to OpenAI when both are configured
- During high demand, Google Gemini may return 503 errors

---

## Security Best Practices

1. **Never commit secrets to git**
2. **Use different secrets for dev/staging/production**
3. **Rotate secrets periodically (every 90 days)**
4. **Use environment variable managers in production** (AWS Secrets Manager, HashiCorp Vault, etc.)
5. **Restrict SMTP credentials to sending only**
6. **Use SPF, DKIM, and DMARC records for email authentication**

---

## Next Steps

1. Copy `.env.example` to `.env.local`
2. Fill in your actual values
3. Generate a secure `SESSION_SECRET`
4. Set up Gmail App Password or SMTP provider
5. Configure at least one AI provider
6. Test the authentication flow
7. Update for production deployment

---

**Last Updated**: June 2026
**Version**: 1.2
