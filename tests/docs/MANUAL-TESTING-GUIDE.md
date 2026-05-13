# 🧪 CV Upload Manual Testing Guide

## Problem Identified

The error you're experiencing occurs because **the user doesn't exist in the database**:

```
Foreign key constraint violated: `base_cvs_userId_fkey (index)`
```

This happens because the code tries to create a CV for a user that doesn't exist in the `users` table.

---

## ✅ Implemented Solutions

### 1. Automatic user creation

The `/api/cv/upload` endpoint has been updated to **automatically create the user** if it doesn't exist. The flow is now:

1. CV is received
2. File is parsed
3. **System checks if user exists**
4. **If not, user is created automatically**
5. CV is saved

### 2. Script to create test user

If you prefer to have the user created beforehand:

```bash
pnpm tsx scripts/create-test-user.ts
```

This script creates a user with:

- **ID:** `temp-user`
- **Email:** `test@example.com`
- **Name:** Test User

---

## 🚀 Manual Testing Methods

### Method 1: Using the HTML Form (Recommended)

1. **Make sure the server is running:**

   ```bash
   pnpm dev
   ```

2. **Open the test form in your browser:**

   ```
   http://localhost:3000/test-upload.html
   ```

3. **Fill out the form:**
   - **Title:** Descriptive name for your CV
   - **User ID:** Use `temp-user` (automatically created if doesn't exist)
   - **File:** Select your PDF file

4. **Click "Upload and Process CV"**

5. **Wait 10-30 seconds** while AI processes the CV

✅ You should see a success message with the extracted CV information.

---

### Method 2: Using cURL

```bash
# Run the bash script
./tests/scripts/test-upload-manual.sh
```

Or manually:

```bash
curl -X POST http://localhost:3000/api/cv/upload \
  -F "file=@files/FawerV-CV.pdf" \
  -F "title=My Professional CV" \
  -F "userId=temp-user"
```

---

### Method 3: Using Postman or Insomnia

1. **Method:** POST
2. **URL:** `http://localhost:3000/api/cv/upload`
3. **Body:** form-data with the following fields:
   - `file`: Your PDF file (type: File)
   - `title`: "My Professional CV" (type: Text)
   - `userId`: "temp-user" (type: Text)

---

### Method 4: Using the frontend code (if exists)

If you already have a page in your Next.js app, simply use the existing form.

---

## 🔍 Verify CV was Saved

After uploading the CV, you can verify it was saved correctly:

```bash
# List all CVs for the user
curl http://localhost:3000/api/cv/upload?userId=temp-user | jq
```

Or you can connect to your PostgreSQL database and run:

```sql
-- View all CVs
SELECT id, title, "createdAt" FROM base_cvs;

-- View details of a specific CV
SELECT * FROM base_cvs WHERE "userId" = 'temp-user';
```

---

## 🐛 Troubleshooting

### Error: "Foreign key constraint violated"

**Cause:** User doesn't exist in the database.

**Solution:** With the updated code, this should no longer occur because the user is created automatically. If it persists:

```bash
# Create user manually
pnpm tsx scripts/create-test-user.ts
```

---

### Error: "DeprecationWarning: Buffer() is deprecated"

**Cause:** Warning from the `pdf-parse` library that uses `Buffer()` instead of `Buffer.from()`.

**Solution:** This is just a warning and doesn't affect functionality. It can be ignored. To hide it:

```bash
# Run with flag to hide deprecation warnings
NODE_NO_WARNINGS=1 pnpm dev
```

Or update the `pdf-parse` library when a new version is available.

---

### Error: "GOOGLE_AI_API_KEY not configured"

**Cause:** Google AI API key is not configured in `.env.local`.

**Solution:** Make sure you have in `.env.local`:

```env
GOOGLE_AI_API_KEY="your-api-key-here"
```

---

### Process takes too long (more than 60 seconds)

**Cause:** Google AI API might be slow or there's a network issue.

**Solution:**

- Check your internet connection
- Verify the API key is valid
- Try again in a few minutes

---

## 📊 Expected Times

| Operation                      | Expected Time      |
| ------------------------------ | ------------------ |
| File upload                    | < 1 second         |
| PDF text extraction            | 1-2 seconds        |
| AI parsing (Google Gemini)     | 10-30 seconds      |
| Database save                  | < 1 second         |
| **TOTAL**                      | **15-35 seconds**  |

---

## ✨ Expected Result

When everything works correctly, you should receive a JSON response like this:

```json
{
  "success": true,
  "baseCV": {
    "id": "clxxx...",
    "title": "My Professional CV",
    "personalInfo": {
      "name": "FAWER VARGAS",
      "email": "fawer5@hotmail.com",
      "phone": "...",
      "location": "..."
    },
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": {
      "technical": [...],
      "soft": [...],
      "languages": [...]
    },
    "projects": [...],
    "certifications": [...]
  }
}
```

---

## 🎯 Next Step: Test Complete Flow

Once the CV has been successfully uploaded, you can test the complete application generation flow:

```bash
# This script loads a CV, creates a job listing, and generates an application
pnpm tsx tests/integration/test-complete-cv-flow.ts
```

---

## 📝 Important Notes

1. **Temporary user:** The `userId` "temp-user" is temporary. In production, this will be replaced with real authentication.

2. **Data cleanup:** If you do many tests, you can clean up test CVs:

   ```sql
   DELETE FROM base_cvs WHERE "userId" = 'temp-user';
   ```

3. **Supported files:** The system accepts PDF, DOCX and TXT. Best results are obtained with PDF.

4. **AI cost:** Each parsing consumes tokens from the Google Gemini API. Use moderately during testing.

---

## 🆘 Need Help?

If you continue having problems:

1. Check the server console logs (`pnpm dev`)
2. Review browser logs (F12 → Console)
3. Verify database connection:
   ```bash
   pnpm prisma studio
   ```
4. Run the complete test to see where it fails:
   ```bash
   pnpm tsx tests/integration/test-complete-cv-flow.ts
   ```

---

**Last updated:** May 1, 2026
