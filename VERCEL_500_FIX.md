# 🚨 Vercel 500 FUNCTION_INVOCATION_FAILED - FIXED

## What Went Wrong

The serverless function is crashing on Vercel with a **500 FUNCTION_INVOCATION_FAILED** error. This was caused by:

1. **❌ Trying to load `.env` file in production** - Vercel uses environment variables directly
2. **❌ Missing `DIRECT_URL` in Prisma schema** - Not needed for standard Postgres connections
3. **❌ Incorrect build configuration** - Vercel wasn't building dependencies properly

## ✅ What I Fixed

### 1. Fixed Environment Variable Loading
Changed `packages/backend/src/index.ts` to only load `.env` in development:

```typescript
// Only load .env file in development (Vercel injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}
```

### 2. Fixed Prisma Schema
Removed the `directUrl` requirement from `packages/backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  // Removed: directUrl = env("DIRECT_URL")
}
```

### 3. Fixed Vercel Build Configuration
Updated `vercel.json` with proper build commands and file inclusion.

## 🚀 How to Deploy

### Step 1: Set Up Database (REQUIRED)

You need a PostgreSQL database for production. Here are your options:

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on the **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Vercel will automatically set these environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

5. Add `DATABASE_URL` manually in Environment Variables:
   - Value: Copy from `POSTGRES_PRISMA_URL`

#### Option B: External Database (Supabase, Railway, Neon)

Set up a Postgres database and add the connection string to Vercel:

1. Get your Postgres connection string (format: `postgresql://user:password@host:5432/database`)
2. Add it to Vercel Environment Variables as `DATABASE_URL`

### Step 2: Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables for Production:**

| Variable Name | Value | Example |
|--------------|-------|---------|
| `DATABASE_URL` | Your Postgres connection string | `postgresql://...` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Secret | `GOCSPX-...` |
| `SESSION_SECRET` | Random 64-character string | Generate with crypto |
| `NODE_ENV` | `production` | `production` |

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Commit and Deploy

```bash
# Commit all fixes
git add .
git commit -m "Fix Vercel serverless function configuration"
git push

# Or manually deploy
vercel --prod
```

### Step 4: Run Database Migrations

After your first successful deployment, you need to set up the database schema:

**Option 1: Using Vercel CLI**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Set DATABASE_URL for local migration
export DATABASE_URL="your-vercel-postgres-url"

# Run migrations
cd packages/backend
npx prisma db push
```

**Option 2: Using Vercel Dashboard**

1. Go to your deployment on Vercel
2. Click **More** → **Redeploy**
3. Check **Use existing build cache**
4. After deployment, the Prisma schema will be automatically generated

## 🔍 Verify Deployment

After deploying, check:

1. **Visit**: https://feai.vercel.app
   - Should show your homepage (not 500 error)

2. **Check API Health**: https://feai.vercel.app/api/health
   - Should return `{"success":true,"status":"healthy",...}`

3. **Test Login**: https://feai.vercel.app/login
   - Should show login page
   - Google sign-in should work

## 🐛 Troubleshooting

### Still Getting 500 Error?

**Check Vercel Function Logs:**

1. Go to Vercel Dashboard → Your Project
2. Click on the deployment
3. Click **Functions** tab
4. Find your function and click **View Logs**
5. Look for the actual error message

### Common Errors:

**"Can't reach database server"**
- ❌ DATABASE_URL not set or incorrect
- ✅ Fix: Add correct DATABASE_URL in Vercel environment variables

**"prisma client is not generated"**
- ❌ Prisma client wasn't generated during build
- ✅ Fix: Make sure `npm run build` runs `prisma generate`

**"Session secret not set"**
- ❌ SESSION_SECRET missing
- ✅ Fix: Add SESSION_SECRET to Vercel environment variables

**"Google OAuth not configured"**
- ❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET
- ✅ Fix: Add both to Vercel environment variables

### Check Environment Variables

Run this in Vercel Functions logs to see what's loaded:
```javascript
console.log('Env check:', {
  hasDatabase: !!process.env.DATABASE_URL,
  hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasSession: !!process.env.SESSION_SECRET,
  nodeEnv: process.env.NODE_ENV
});
```

## ✅ Expected Result

After fixing and redeploying:

- ✅ Homepage loads at `https://feai.vercel.app`
- ✅ API responds (e.g., `/api/health`)
- ✅ Login page works
- ✅ Google OAuth redirects properly
- ✅ Database connections work
- ✅ No 500 errors

## 📋 Checklist

Before deployment:
- [ ] Database set up (Vercel Postgres or external)
- [ ] `DATABASE_URL` set in Vercel environment variables
- [ ] `GOOGLE_CLIENT_ID` set
- [ ] `GOOGLE_CLIENT_SECRET` set
- [ ] `SESSION_SECRET` generated and set
- [ ] `NODE_ENV=production` set
- [ ] Google OAuth redirect URI added: `https://feai.vercel.app/auth/google/callback`
- [ ] Code committed and pushed

After deployment:
- [ ] Function logs show no errors
- [ ] Homepage loads without 500 error
- [ ] API health check returns success
- [ ] Database tables created (run migrations if needed)

---

**Need Help?**

Check the Vercel Function Logs for the specific error message and debug from there. The logs will tell you exactly what's failing.

