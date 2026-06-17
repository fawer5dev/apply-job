# Environment Variables Reference

This document lists all required environment variables for the Apply Job application authentication system.

## Required Variables

### Database
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/applyjob"
```

### Authentication & Sessions
```env
# Session secret for token signing (generate with: openssl rand -hex 32)
SESSION_SECRET="your-random-32-byte-hex-string-here"
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

### Application URLs
```env
# Base URL of your application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Or for production:
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Optional: OAuth Providers (Future Enhancement)
```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
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
```

---

## Generating Secure Secrets

### Session Secret
Generate a secure random 32-byte hex string:

```bash
# Using OpenSSL (Mac/Linux)
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Development vs Production

### Development (.env.local)
- Use Gmail SMTP for testing
- Use localhost URLs
- Enable console logging (automatically enabled in NODE_ENV=development)

### Production (.env.production)
- Use a professional SMTP service (SendGrid, AWS SES, Mailgun)
- Use your production domain URL
- Disable console logging
- Use secure, randomly generated secrets
- Enable SMTP_SECURE="true" if your provider supports SSL

---

## Environment Variable Loading

Next.js loads environment variables in this order:
1. `.env.local` (highest priority, git-ignored)
2. `.env.production` or `.env.development`
3. `.env`

**Important**: 
- Never commit `.env.local` to git
- Add `.env.local` to your `.gitignore`
- Use `.env.example` to document required variables

---

## Verification Checklist

After setting up environment variables:

- [ ] Database connection works (`npm run db:push`)
- [ ] SMTP sends emails (test registration flow)
- [ ] Session secret is 64 characters (32 bytes hex)
- [ ] EMAIL_FROM matches your domain/provider
- [ ] NEXT_PUBLIC_APP_URL matches your deployment URL
- [ ] All secrets are different between dev and production

---

## Troubleshooting

### SMTP Not Working
- Check SMTP credentials are correct
- Verify firewall/network allows SMTP ports (587/465)
- For Gmail: Ensure 2FA is enabled and you're using an App Password
- **`501 Bad sender address syntax`**: `EMAIL_FROM` is malformed or empty. Use a valid address like `Apply Job <your-email@gmail.com>`. For Gmail it must match `SMTP_USER`.
- Check spam folder for verification emails
- Review logs in development mode (emails log to console)

### Session Issues
- Verify SESSION_SECRET is set and 64 characters long
- Clear browser cookies
- Check cookie settings in browser dev tools

### Database Connection
- Verify DATABASE_URL format is correct
- Test connection: `npm run db:push`
- Check PostgreSQL is running
- Verify user permissions

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

1. Copy this template to `.env.local`
2. Fill in your actual values
3. Generate a secure SESSION_SECRET
4. Set up Gmail App Password or SMTP provider
5. Test the authentication flow
6. Update for production deployment

---

**Last Updated**: June 2026  
**Version**: 1.1
