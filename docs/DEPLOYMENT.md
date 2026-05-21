# 🚀 Deployment Guide

Complete guide for deploying Apply Job to Vercel or other platforms.

---

## Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with automatic builds and deployments.

### Prerequisites

- GitHub account with repository access
- Vercel account (free tier available)
- PostgreSQL database (Neon, Supabase, or Railway recommended for Vercel)

### Step 1: Prepare Your Repository

1. **Ensure all code is committed and pushed to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify package.json has postinstall script**
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate"
     }
   }
   ```
   ✅ This is already configured in your project

### Step 2: Set Up Database

Choose a PostgreSQL provider that works well with Vercel:

#### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/db?sslmode=require`)

#### Option B: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" under "Connection pooling"

#### Option C: Railway
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string

### Step 3: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `pnpm install` (auto-detected)

3. **Add Environment Variables**

   Click "Environment Variables" and add the following:

   **Required Variables:**
   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   SESSION_SECRET=your-64-character-hex-string
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   ```

   **Email Configuration (Required for Auth):**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your.email@gmail.com
   SMTP_PASS=your-gmail-app-password
   EMAIL_FROM=Apply Job <noreply@your-domain.com>
   ```

   **Optional (if using OpenAI):**
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (3-5 minutes)

### Step 4: Run Database Migrations

After first deployment:

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link your project**
   ```bash
   vercel link
   ```

4. **Run migrations**
   ```bash
   vercel env pull .env.production
   pnpm prisma db push
   ```

   Or use Vercel's deployment hook:
   ```bash
   vercel env add DATABASE_URL
   npx prisma db push
   ```

### Step 5: Verify Deployment

1. Visit your deployment URL (e.g., `https://your-app.vercel.app`)
2. Test the registration flow: `/en/register`
3. Check that emails are being sent
4. Test login and authentication
5. Upload a CV and create an application

---

## Environment Variables Reference

### How to Generate SESSION_SECRET

```bash
openssl rand -hex 32
```

Or using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gmail App Password Setup

For `SMTP_PASS`:
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password
6. Use this as `SMTP_PASS`

---

## Common Deployment Issues

### ❌ Build Error: "Prisma Client not generated"

**Cause:** `postinstall` script not running  
**Fix:** Ensure `package.json` has:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### ❌ Build Error: "GOOGLE_AI_API_KEY is not configured"

**Cause:** Environment variable validation at build time  
**Fix:** ✅ Already fixed in commit `7157dcd` - API keys are now validated at runtime

### ❌ Runtime Error: "Failed to connect to database"

**Cause:** Invalid `DATABASE_URL` or database not accessible  
**Fix:** 
- Verify connection string is correct
- Ensure database allows connections from Vercel IPs
- Check SSL mode is enabled (`?sslmode=require`)

### ❌ Emails Not Sending

**Cause:** Invalid SMTP configuration  
**Fix:**
- Verify SMTP credentials in Vercel env vars
- Use Gmail App Password, not regular password
- Check `SMTP_HOST` and `SMTP_PORT` are correct
- Test with SendGrid or AWS SES for production

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Test user registration and email verification
- [ ] Test login and logout
- [ ] Test password reset flow
- [ ] Upload a CV and verify parsing works
- [ ] Create a job application
- [ ] Generate a cover letter
- [ ] Check that PDFs download correctly
- [ ] Test internationalization (switch to Spanish `/es/`)
- [ ] Set up custom domain (optional)
- [ ] Configure production email service (SendGrid, AWS SES)
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Enable Vercel Analytics
- [ ] Set up database backups

---

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Deployment Workflow

1. Push code to GitHub
   ```bash
   git push origin main
   ```

2. Vercel automatically:
   - Detects the push
   - Runs `pnpm install`
   - Runs `postinstall` (prisma generate)
   - Runs `pnpm build`
   - Deploys to production

3. Monitor deployment at https://vercel.com/dashboard

---

## Custom Domain Setup

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `applyjob.com`)
4. Update DNS records as instructed by Vercel
5. Update `NEXT_PUBLIC_APP_URL` environment variable
6. Redeploy

---

## Performance Optimization

### Enable Vercel Edge Functions

Add to `vercel.json`:
```json
{
  "buildCommand": "pnpm build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Enable Caching

Vercel automatically caches:
- Static assets (images, fonts)
- API routes with proper headers
- Server components

### Database Connection Pooling

Use PgBouncer or connection pooling URL for better performance:
```env
DATABASE_URL=postgresql://user:pass@host/db?pgbouncer=true&connection_limit=1
```

---

## Monitoring & Debugging

### View Logs

```bash
vercel logs [deployment-url]
```

Or view in Vercel dashboard:
- Go to your project
- Click "Deployments"
- Click on a deployment
- View "Runtime Logs"

### Common Log Locations

- Build logs: Vercel dashboard > Deployment > Build logs
- Runtime logs: Vercel dashboard > Deployment > Runtime logs
- Error tracking: Set up Sentry or similar

---

## Scaling Considerations

### Database
- Use connection pooling (PgBouncer)
- Monitor query performance
- Add indexes for frequently queried fields
- Consider read replicas for high traffic

### API Rate Limiting
Already implemented in the application:
- Login attempts: 5 per 15 minutes
- Registration: 3 per hour
- Email sending: 5 per hour

### File Storage
For production, consider:
- AWS S3 for CV storage
- Cloudinary for image optimization
- Vercel Blob for simple file storage

---

## Security Checklist

- [ ] `SESSION_SECRET` is strong and unique
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] SMTP credentials use app passwords
- [ ] Rate limiting is enabled (✅ already configured)
- [ ] HTTPS is enforced (✅ automatic on Vercel)
- [ ] Environment variables are set in Vercel (not in code)
- [ ] Audit logging is enabled (✅ already configured)
- [ ] CORS is properly configured
- [ ] CSP headers are set (consider adding)

---

## Rollback Strategy

If deployment fails or has issues:

1. **Instant Rollback via Vercel UI**
   - Go to Vercel dashboard
   - Click "Deployments"
   - Find previous working deployment
   - Click "Promote to Production"

2. **Git Revert**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Re-deploy specific commit**
   ```bash
   vercel --prod --force
   ```

---

## Alternative Platforms

### Railway

1. Connect GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

### Render

1. Connect GitHub repository
2. Select "Web Service"
3. Build command: `pnpm build`
4. Start command: `pnpm start`
5. Add environment variables

### AWS/GCP/Azure

For enterprise deployments, consider:
- Docker containerization
- Kubernetes orchestration
- Managed PostgreSQL (RDS, Cloud SQL)
- Load balancers
- CDN (CloudFront, Cloud CDN)

---

## Cost Estimation

### Vercel (Free Tier)
- Hobby: $0/month
  - 100 GB bandwidth
  - Unlimited deployments
  - 100 GB-hours execution

### Database
- Neon (Free): $0/month (0.5 GB storage)
- Supabase (Free): $0/month (500 MB storage)
- Railway ($5/month for 5GB storage)

### Email
- Gmail: Free (for development)
- SendGrid: $15/month (40,000 emails)
- AWS SES: ~$0.10 per 1,000 emails

### AI APIs
- Google AI: ~$0.35 per 1M tokens (Gemini 2.5 Flash)
- OpenAI: ~$5 per 1M tokens (GPT-4o)

**Estimated Monthly Cost for Small App**: $0-20/month

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma with Vercel**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- **Troubleshooting**: See `docs/TROUBLESHOOTING.md`

---

**Last Updated**: May 2026  
**Deployment Platform**: Vercel (recommended), Railway, Render  
**Build Status**: ✅ All TypeScript/ESLint errors resolved  
**Database**: PostgreSQL 15+ with Prisma ORM
