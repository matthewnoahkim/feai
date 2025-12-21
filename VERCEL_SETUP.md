# Vercel Deployment Setup for FeAI

## 🚀 Deploy to Vercel

Your application is configured to work on both:
- **Development**: `http://localhost:3001`
- **Production**: `https://feai.vercel.app`

## Step 1: Add Authorized Redirect URI to Google Cloud Console

You need to add the production redirect URI to your Google OAuth credentials:

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, click **"ADD URI"**
4. Add this URI:
   ```
   https://feai.vercel.app/auth/google/callback
   ```
5. You should now have TWO redirect URIs configured:
   - `http://localhost:3001/auth/google/callback` (for local development)
   - `https://feai.vercel.app/auth/google/callback` (for production)
6. Click **"SAVE"**

## Step 2: Configure Environment Variables in Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project on Vercel: https://vercel.com/dashboard
2. Click on your **feai** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `GOOGLE_CLIENT_ID` | `7156000764-29mt3qtlh82tbjt0n94dnvuvhjvvrscg.apps.googleusercontent.com` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `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` | Production, Preview, Development |
| `SESSION_SECRET` | (generate a new one, see below) | Production, Preview, Development |
| `DATABASE_URL` | Your production database URL | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

⚠️ **Important**: Generate a **NEW** `SESSION_SECRET` for production! Don't reuse your dev secret.

**Generate a new SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SESSION_SECRET
vercel env add DATABASE_URL
```

## Step 3: Update Your `.env` File (Optional)

If you want to test Vercel preview deployments locally, add these to your root `.env`:

```env
# Existing configuration...
GOOGLE_CLIENT_ID=7156000764-29mt3qtlh82tbjt0n94dnvuvhjvvrscg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=your-super-secret-random-string-here

# Production URL (auto-detected by Vercel, but can be set explicitly)
# VERCEL_URL will be automatically set by Vercel
BASE_URL=http://localhost:3001
```

## Step 4: Deploy to Vercel

### First Time Deployment

```bash
# From project root
npm run build:frontend

# Deploy to Vercel
vercel
```

### Subsequent Deployments

```bash
# Build frontend
npm run build:frontend

# Deploy to production
vercel --prod
```

## Step 5: Test Your Production Deployment

1. Go to: https://feai.vercel.app
2. Click "Sign In" or navigate to login
3. Click "Sign in with Google"
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to your dashboard

## How It Works

The application automatically detects the environment:

- **Local Development**: Uses `http://localhost:3001/auth/google/callback`
- **Vercel Production**: Uses `https://feai.vercel.app/auth/google/callback`
- **Vercel Preview**: Uses `https://[preview-url].vercel.app/auth/google/callback`

The redirect URI is dynamically determined in `packages/backend/src/auth/googleOAuth.ts`:

```typescript
function getRedirectUri(): string {
  // If explicitly set in env, use that
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  
  // Auto-detect based on environment
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL || 'http://localhost:3001';
    
  return `${baseUrl}/auth/google/callback`;
}
```

## Troubleshooting

### Error: "redirect_uri_mismatch"

This means the redirect URI in your Google Cloud Console doesn't match what your app is using.

**Solution:**
1. Check the error message - it will show you the redirect URI being used
2. Add that exact URI to your Google Cloud Console under "Authorized redirect URIs"
3. Common URIs to add:
   - `https://feai.vercel.app/auth/google/callback`
   - `https://[your-preview-url].vercel.app/auth/google/callback` (for preview deployments)

### Error: "Missing required parameter: client_id"

This means your environment variables aren't set in Vercel.

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
3. Redeploy your application

### Preview Deployments Not Working

For Vercel preview deployments (PR branches), you have two options:

**Option 1: Add wildcard to Google Cloud Console (Not Recommended)**
- Google doesn't support wildcards in redirect URIs

**Option 2: Use Production Credentials for Previews**
- Your preview deployments will redirect to the production callback URL
- Or add specific preview URLs as needed

**Option 3: Use a Different OAuth App for Development**
- Create a separate Google OAuth Client ID for development/staging
- Configure it with wildcard or specific preview URLs

## Database Considerations

⚠️ **Important**: The in-memory token store used in development won't work in production!

For production, you need to:
1. Set up a Postgres database (Vercel Postgres, Supabase, Railway, etc.)
2. Update your `DATABASE_URL` environment variable in Vercel
3. Run migrations:
   ```bash
   npm run db:push
   ```

The user sessions and OAuth tokens should be persisted in your database, not in memory.

## Security Checklist

Before going live:

- [ ] Generated a new, secure `SESSION_SECRET` for production (64+ character random string)
- [ ] `GOOGLE_CLIENT_SECRET` is only stored in Vercel environment variables (not in code)
- [ ] Database URL is secured and not publicly accessible
- [ ] `NODE_ENV=production` is set in Vercel
- [ ] All redirect URIs are added to Google Cloud Console
- [ ] Sessions are stored in a persistent database (not in-memory)
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Cookie settings are secure (httpOnly, sameSite=lax, secure=true in production)

## Next Steps

1. Set up a production database
2. Configure database migrations
3. Update the token store to use Prisma instead of in-memory storage
4. Set up error monitoring (Sentry, LogRocket, etc.)
5. Configure custom domain (if desired)

---

Need help? Check out:
- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- `GOOGLE_OAUTH_GUIDE.md` for implementation details

