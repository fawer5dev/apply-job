# 🔧 Troubleshooting Guide

Common issues and solutions for the Apply Job application.

---

## 📋 Table of Contents

- [Google AI API Issues](#google-ai-api-issues)
- [OpenAI API Issues](#openai-api-issues)
- [Database Issues](#database-issues)
- [Application Errors](#application-errors)
- [PDF Generation Issues](#pdf-generation-issues)
- [Internationalization Issues](#internationalization-issues)
- [File Upload Issues](#file-upload-issues)
- [Testing Issues](#testing-issues)

---

## 🤖 Google AI API Issues

### Error: "Google AI API key not configured"

**Cause:** Missing or invalid `GOOGLE_AI_API_KEY` in environment variables.

**Solution:**

1. Verify the key exists in `.env.local`:
   ```bash
   grep GOOGLE_AI_API_KEY .env.local
   ```

2. Get your API key at: https://aistudio.google.com/apikey

3. Restart the development server:
   ```bash
   npm run dev
   ```

### Error: "503 Service Unavailable" from Google AI

**Cause:** Temporary Google AI service outage or rate limiting.

**Solution:**

1. **Wait and retry** - Service usually recovers within minutes

2. **Configure OpenAI as fallback** (optional):
   ```env
   # Add to .env.local
   OPENAI_API_KEY="sk-..."
   ```

3. **Check Google AI Studio status**: https://aistudio.google.com/

### Error: "Rate limit exceeded"

**Cause:** Too many requests to Google AI API.

**Solution:**

1. Implement request delays between operations
2. Consider upgrading your Google AI API quota
3. Use OpenAI as an alternative for high-volume usage

---

## 🔑 OpenAI API Issues

### Error: "OpenAI API key not configured"

**Cause:** Missing `OPENAI_API_KEY` when Google AI is not configured.

**Solution:**

1. At least one AI provider is required
2. Get your OpenAI API key at: https://platform.openai.com/api-keys
3. Add to `.env.local`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```

### Error: "Insufficient quota" from OpenAI

**Cause:** OpenAI account has no credits or exceeded usage limits.

**Solution:**

1. Check your OpenAI account balance
2. Add payment method at: https://platform.openai.com/account/billing
3. Use Google Gemini as cost-effective alternative

### Error: "Rate limit reached"

**Cause:** Too many requests to OpenAI API.

**Solution:**

1. Implement exponential backoff and retry logic
2. Upgrade your OpenAI tier
3. Switch to Google Gemini for high-volume operations

---

## 🗄️ Database Issues

### Error: "Can't reach database server"

**Cause:** Database connection string is incorrect or database is offline.

**Solution:**

1. Verify `DATABASE_URL` in `.env.local`:
   ```bash
   grep DATABASE_URL .env.local
   ```

2. Test connection:
   ```bash
   npm run db:studio
   ```

3. Check database provider status (Neon, Supabase, etc.)

### Error: "Prisma Client not generated"

**Cause:** Prisma client needs to be regenerated after schema changes.

**Solution:**

```bash
npm run db:generate
```

### Error: "Foreign key constraint failed"

**Cause:** Attempting to create a record with invalid relationship references.

**Solution:**

1. Ensure referenced records exist (e.g., User, BaseCV, JobListing)
2. Check data integrity in Prisma Studio:
   ```bash
   npm run db:studio
   ```

### Error: "Transaction timeout"

**Cause:** Long-running operations exceed default timeout (5 seconds).

**Solution:**

This has been fixed in the codebase by increasing timeout to 15 seconds. If you still encounter this:

1. Check database performance
2. Optimize AI API response times
3. Consider increasing timeout further in affected routes

---

## 🚀 Application Errors

### Error: "No base CVs found"

**Cause:** User hasn't uploaded a base CV yet.

**Solution:**

1. Upload a CV first:
   ```
   http://localhost:3000/en/dashboard/cv/new
   ```

2. Or use the test upload page:
   ```
   http://localhost:3000/en/test-upload
   ```

### Error: "Failed to parse JSON response"

**Cause:** AI returned invalid or truncated JSON.

**Solution:**

1. Already improved with better JSON parsing in `google-ai.ts`
2. Increased token limits to prevent truncation
3. If still occurring, check server logs for the raw AI response

### Error: "Error generating application"

**Cause:** Multiple possible causes during application creation.

**Solution:**

1. **Check server logs** for specific error
2. **Verify AI API keys** are configured
3. **Test database connection**:
   ```bash
   npm run db:studio
   ```
4. **Ensure base CV and job listing exist**

### Error: Page shows "404 Not Found"

**Cause:** Route doesn't exist or server needs restart.

**Solution:**

1. Restart Next.js dev server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. Verify the route pattern includes `[locale]`:
   ```
   /en/dashboard/applications  ✅
   /dashboard/applications     ❌
   ```

---

## 📄 PDF Generation Issues

### Error: "PDF generation failed"

**Cause:** Puppeteer error or template rendering issue.

**Solution:**

1. **Check Puppeteer installation**:
   ```bash
   npm install puppeteer
   ```

2. **On Vercel/production**, ensure Puppeteer is supported or use alternative like `@react-pdf/renderer`

3. **Check template syntax** in `templates/cv/modern.html`

### Error: PDF is blank or incomplete

**Cause:** Missing data or template rendering issue.

**Solution:**

1. Verify application data exists in database
2. Check server logs for template errors
3. Test with a simple CV first

---

## 🌍 Internationalization Issues

### Issue: Language not switching

**Cause:** Cookie or middleware configuration issue.

**Solution:**

1. **Clear browser cookies and cache**

2. **Verify middleware is active**:
   ```bash
   # Check src/middleware.ts exists
   ls -la src/middleware.ts
   ```

3. **Test URL directly**:
   ```
   http://localhost:3000/en/dashboard
   http://localhost:3000/es/dashboard
   ```

### Issue: Missing translations

**Cause:** Translation key not found in language files.

**Solution:**

1. **Check translation files**:
   ```bash
   cat messages/en.json | grep "key"
   cat messages/es.json | grep "key"
   ```

2. **Add missing translations** to both `en.json` and `es.json`

3. **Restart dev server** to reload translations

### Issue: Wrong locale detected

**Cause:** Browser settings or cookie conflict.

**Solution:**

1. **Manually specify locale in URL**:
   ```
   /en/dashboard  (English)
   /es/dashboard  (Spanish)
   ```

2. **Check middleware configuration** in `src/i18n/routing.ts`

3. **Clear locale cookie** in browser DevTools

---

## 📁 File Upload Issues

### Error: "File upload failed"

**Cause:** File size, permissions, or unsupported format.

**Solution:**

1. **Check supported formats**: PDF, DOCX, TXT only

2. **Verify file size**: Should be under 10MB

3. **Check `files/` directory permissions**:
   ```bash
   ls -la files/
   mkdir -p files/
   chmod 755 files/
   ```

### Error: "Failed to extract text from PDF"

**Cause:** PDF is scanned image or encrypted.

**Solution:**

1. Ensure PDF contains actual text (not just images)
2. Remove password protection from PDF
3. Try converting PDF to DOCX first

### Error: "Unsupported file type"

**Cause:** File extension not supported.

**Solution:**

Supported formats:
- `.pdf` - PDF documents
- `.docx` - Microsoft Word documents
- `.txt` - Plain text files

---

## 🧪 Testing Issues

### Error: "Test scripts fail"

**Cause:** Environment not configured or database empty.

**Solution:**

1. **Ensure environment is set up**:
   ```bash
   npm install
   npm run db:generate
   npm run db:push
   ```

2. **Create test user**:
   ```bash
   npx tsx scripts/create-test-user.ts
   ```

3. **Run tests one by one**:
   ```bash
   npm run test:integration:cv
   npm run test:integration:new-app
   ```

### Error: "Port 3000 already in use"

**Cause:** Another process is using port 3000.

**Solution:**

1. **Kill existing process**:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Or use different port**:
   ```bash
   PORT=3001 npm run dev
   ```

---

## 🛠️ General Debugging Tips

### View Server Logs

Server logs appear in the terminal where you ran `npm run dev`.

Look for:
- ✅ `Analyzing job description with AI...`
- ✅ `Parsing CV...`
- ❌ `Error analyzing job:`
- ❌ `Error processing CV:`

### Check Browser Console

Open DevTools (F12) and check Console tab for:
- Network errors
- JavaScript errors
- API response details

### Verify Database State

```bash
# Open Prisma Studio
npm run db:studio

# Check tables:
# - users
# - base_cvs
# - job_listings
# - applications
# - cover_letters
```

### Test API Endpoints Directly

Use tools like:
- **Postman**
- **Insomnia**
- **curl**

Example:
```bash
curl -X POST http://localhost:3000/api/job/analyze \
  -H "Content-Type: application/json" \
  -d '{"description": "Senior React Developer..."}'
```

---

## 📞 Getting More Help

If you can't resolve your issue:

1. **Check the logs** - Most errors provide helpful details
2. **Review documentation**:
   - [Setup Guide](SETUP.md)
   - [Architecture](ARCHITECTURE.md)
   - [Project Context](../PROJECT_CONTEXT.md)
3. **Search for error messages** in GitHub issues
4. **Check official documentation**:
   - [Next.js](https://nextjs.org/docs)
   - [Prisma](https://www.prisma.io/docs)
   - [Google AI](https://ai.google.dev/docs)
   - [OpenAI](https://platform.openai.com/docs)

---

**Last updated:** May 13, 2026
