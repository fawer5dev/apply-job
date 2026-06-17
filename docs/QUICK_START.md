# 🚀 Authentication System - Quick Start Guide

Get your authentication system up and running in 5 minutes!

---

## Step 1: Generate Session Secret

Run this command to generate a secure session secret:

```bash
openssl rand -hex 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it in the next step.

---

## Step 2: Create .env.local File

Create a `.env.local` file in your project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your values:

```env
# Database (you should already have this)
DATABASE_URL="postgresql://user:password@localhost:5432/applyjob"

# Session Secret (paste the value from Step 1)
SESSION_SECRET="paste-your-generated-secret-here"

# Gmail SMTP (for development/testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your.email@gmail.com"
SMTP_PASS="your-gmail-app-password"
# Must be a valid address — for Gmail use your actual Gmail address here
EMAIL_FROM="Apply Job <your.email@gmail.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google AI (primary AI provider)
GOOGLE_AI_API_KEY="your-google-ai-api-key"
```

### How to Get Gmail App Password:

1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Generate a new App Password for "Mail"
5. Copy the 16-character password (remove spaces)
6. Paste it as `SMTP_PASS` in your `.env.local`

---

## Step 3: Run Database Migration

Apply the authentication schema to your database:

```bash
npm run db:push
```

This creates 5 new tables:
- Session
- Account  
- VerificationToken
- AuditLog
- RateLimit

---

## Step 4: Start Development Server

```bash
npm run dev
```

---

## Step 5: Test It Out!

### Test Registration Flow

1. Open http://localhost:3000/en/register
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!
3. Click "Create Account"
4. You should see "Check Your Email" message

### Check Console for Verification Email

In development mode (when `SMTP_USER` is not set), emails are logged to the console. Look for:

```
📧 Email would be sent to: test@example.com
📧 Subject: Verify your email - Apply Job
📧 Content: <!DOCTYPE html>...
```

If `SMTP_USER` is configured, the app will attempt to send a real email and log:
```
ℹ️ SMTP transporter verified.
✅ Email sent successfully to test@example.com
```

Or on failure:
```
❌ SMTP transporter verification failed: ...
❌ Error sending email: ...
```

### Verify Email

1. Copy the verification link from the console
2. Open it in your browser
3. You should see "Email Verification" page
4. Wait for success message
5. You'll be redirected to login

### Test Login

1. Go to http://localhost:3000/en/login
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to the dashboard!

---

## 🎉 You're Done!

Your authentication system is now running!

---

## Common Issues & Fixes

### Issue: "Session secret is required"
**Fix**: Make sure `SESSION_SECRET` is set in `.env.local` and is 64 characters long (32 bytes in hex)

### Issue: "SMTP connection failed" or "Bad sender address syntax"
**Fix**: 
- Check Gmail credentials and make sure you're using an App Password
- `Bad sender address syntax` means `EMAIL_FROM` is malformed or empty — use `Apply Job <your.email@gmail.com>` and ensure it matches `SMTP_USER` for Gmail
- Enable "2FA + App Password" — regular passwords are blocked by Gmail

### Issue: "Database connection failed"
**Fix**: 
- Check `DATABASE_URL` is correct
- Make sure PostgreSQL is running
- Run `npm run db:push` to ensure tables exist

### Issue: "Emails not sending"
**Fix**: 
- Check console logs in development mode
- Verify SMTP credentials
- Check spam folder for test emails

### Issue: "Middleware redirecting to login constantly"
**Fix**: 
- Clear browser cookies
- Check session cookie is being set
- Verify `SESSION_SECRET` is set correctly

---

## Testing Different Flows

### Test Password Reset

1. Go to http://localhost:3000/en/forgot-password
2. Enter your email
3. Check console for reset link
4. Click the link
5. Enter new password
6. Try logging in with new password

### Test 2FA (Optional)

1. Login to your account
2. Go to Settings (you'll need to create this page)
3. Enable 2FA
4. Scan QR code with Google Authenticator or Authy
5. Enter 6-digit code
6. Save backup codes
7. Logout
8. Login again - you'll need the 6-digit code

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change `SESSION_SECRET` to a new random value
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Switch SMTP to a production service (SendGrid, AWS SES, etc.)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set `NODE_ENV=production` (automatic on Vercel)
- [ ] Test email delivery in production
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure CORS if needed
- [ ] Set up database backups
- [ ] Test all authentication flows in production

**Ready to deploy?** See [docs/DEPLOYMENT.md](../DEPLOYMENT.md) for complete deployment guide.

---

## Need Help?

### Documentation
- Full docs: `docs/AUTH_FINAL_COMPLETE.md`
- Environment guide: `docs/ENV_VARIABLES.md`
- API reference: Check individual route files in `src/app/api/auth/`

### Troubleshooting
1. Check console logs for errors
2. Verify all environment variables are set
3. Test database connection
4. Check SMTP credentials
5. Clear browser cookies and try again

---

## What's Next?

Now that authentication is working, you can:

1. **Wrap your app with AuthProvider**
   ```tsx
   // src/app/[locale]/layout.tsx
   import { AuthProvider } from '@/hooks/use-auth';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>
             {children}
           </AuthProvider>
         </body>
       </html>
     );
   }
   ```

2. **Protect your dashboard**
   ```tsx
   // src/app/[locale]/dashboard/page.tsx
   import { requireAuth } from '@/lib/auth/server-session';
   
   export default async function DashboardPage() {
     const { user } = await requireAuth();
     return <div>Welcome, {user.name}!</div>;
   }
   ```

3. **Use auth in components**
   ```tsx
   'use client';
   import { useAuth } from '@/hooks/use-auth';
   
   export function MyComponent() {
     const { user, logout } = useAuth();
     return <button onClick={logout}>Logout</button>;
   }
   ```

4. **Build user settings page** for:
   - Password change
   - 2FA setup
   - Session management
   - Profile updates

---

**Time to Complete**: 5-10 minutes  
**Difficulty**: ⭐⭐☆☆☆ Easy  
**Prerequisites**: PostgreSQL running, Node.js installed

🎉 **Enjoy your new authentication system!**
