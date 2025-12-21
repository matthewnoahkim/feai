# 🚀 Deploy FeAI to Vercel - Quick Guide

## What I've Done

I've configured your application to automatically work on both:
- ✅ **Development**: `http://localhost:3001` 
- ✅ **Production**: `https://feai.vercel.app`

The app automatically detects which environment it's running in and uses the correct redirect URI.

---

## What YOU Need to Do (3 Simple Steps)

### Step 1: Add Production Redirect URI to Google Cloud Console ⭐

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID: `7156000764-29mt3qtlh82tbjt0n94dnvuvhjvvrscg`
3. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
4. Add this exact URI:
   ```
   https://feai.vercel.app/auth/google/callback
   ```
5. Now you should have **TWO** URIs:
   - ✅ `http://localhost:3001/auth/google/callback` (existing)
   - ✅ `https://feai.vercel.app/auth/google/callback` (new)
6. Click **"SAVE"** at the bottom

### Step 2: Add Environment Variables to Vercel ⭐

1. Go to: https://vercel.com/dashboard
2. Select your **feai** project
3. Go to: **Settings** → **Environment Variables**
4. Add these 4 variables (for all environments: Production, Preview, Development):

| Variable Name | Value |
|--------------|-------|
| `GOOGLE_CLIENT_ID` | `7156000764-29mt3qtlh82tbjt0n94dnvuvhjvvrscg.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |
| `SESSION_SECRET` | Generate a new one (see below) 👇 |
| `DATABASE_URL` | Your database connection string |

**Generate a new SESSION_SECRET for production:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

⚠️ **IMPORTANT**: Use a **DIFFERENT** `SESSION_SECRET` for production! Don't use your dev secret.

### Step 3: Deploy to Vercel ⭐

```bash
# Make sure you're in the project root
cd "C:\Users\matth\New folder (4)\feai"

# Build the frontend
npm run build:frontend

# Deploy to Vercel (if not already deployed)
vercel

# Or deploy to production
vercel --prod
```

---

## Test Your Production Deployment

After deploying:

1. Visit: https://feai.vercel.app
2. Click **"Sign In"** or go to `/login`
3. Click **"Sign in with Google"**
4. ✅ You should see Google's sign-in page
5. ✅ After signing in, you'll be redirected to your dashboard

---

## How It Works (Technical Details)

The application automatically detects the environment and uses the correct callback URL:

**In Development (localhost):**
```
Redirect URI: http://localhost:3001/auth/google/callback
```

**In Production (Vercel):**
```
Redirect URI: https://feai.vercel.app/auth/google/callback
```

This is handled automatically in `packages/backend/src/auth/googleOAuth.ts`:

```typescript
function getRedirectUri(): string {
  // Auto-detect based on environment
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL || 'http://localhost:3001';
    
  return `${baseUrl}/auth/google/callback`;
}
```

---

## Troubleshooting

### ❌ Error: "redirect_uri_mismatch"

**Cause**: The redirect URI isn't added to Google Cloud Console

**Fix**: 
1. Check which URI the error message shows
2. Add that exact URI to Google Cloud Console
3. Make sure you clicked "SAVE"

### ❌ Error: "Missing required parameter: client_id"

**Cause**: Environment variables aren't set in Vercel

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Redeploy your app

### ❌ Sessions Don't Persist After Server Restart

**Cause**: Using in-memory token storage (development only)

**Fix**: For production, you need a real database:
1. Set up Vercel Postgres or another database
2. Update `DATABASE_URL` in Vercel environment variables
3. The token store will automatically use the database

---

## Current Status

✅ Local development is working (you confirmed Google sign-in works on localhost)  
⏳ Production deployment needs the 3 steps above

---

## Need More Help?

See the detailed guide: `VERCEL_SETUP.md`

Or check the Google OAuth implementation: `GOOGLE_OAUTH_GUIDE.md`

