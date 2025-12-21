# FeAI Environment Variables Guide

## 📋 **Required Environment Variables**

### **For Local Development**

Create a `.env` file in the **root directory** with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/feai"

# Authentication Secrets
JWT_SECRET="generate-64-char-random-string"
SESSION_SECRET="generate-64-char-random-string"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"

# OpenAI API Key (for AI Chat Assistant)
VITE_OPENAI_API_KEY="sk-..."

# Server
PORT=3001
NODE_ENV=development
```

### **For Vercel Production**

Set these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable Name | Required | Description |
|--------------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 64-character random string for JWT tokens |
| `GOOGLE_CLIENT_ID` | ✅ | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ | From Google Cloud Console |
| `NODE_ENV` | ✅ | Set to `production` |
| `SESSION_SECRET` | ⚠️  Optional | Only if using sessions |
| `VITE_OPENAI_API_KEY` | ⚠️  Optional | OpenAI API key for AI Chat Assistant |

---

## 🔐 **How to Generate Secrets**

### **JWT_SECRET and SESSION_SECRET**

```bash
# Method 1: Node.js (Recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: OpenSSL
openssl rand -hex 64

# Method 3: Python
python -c "import secrets; print(secrets.token_hex(64))"
```

**Example output:**
```
8f7d6e5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7
```

---

## 🗄️ **Database Setup**

### **Option A: Local Postgres**

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Windows: Download from postgresql.org
# Linux: sudo apt-get install postgresql

# Create database
createdb feai

# Set DATABASE_URL
DATABASE_URL="postgresql://localhost:5432/feai"
```

### **Option B: Neon.tech (Recommended for Production)**

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add to Vercel environment variables

### **Option C: Vercel Postgres**

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Storage** tab
4. Create **Postgres** database
5. Vercel automatically sets `POSTGRES_PRISMA_URL`
6. Add `DATABASE_URL` manually:
   - Name: `DATABASE_URL`
   - Value: Copy from `POSTGRES_PRISMA_URL`

---

## 🔑 **Google OAuth Setup**

### **Step 1: Create OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**

### **Step 2: Configure Authorized URIs**

**Authorized JavaScript origins:**
```
http://localhost:3001
https://your-app.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3001/auth/google/callback
https://your-app.vercel.app/auth/google/callback
https://your-app-*.vercel.app/auth/google/callback
```

### **Step 3: Copy Credentials**

- Copy **Client ID** → Set as `GOOGLE_CLIENT_ID`
- Copy **Client Secret** → Set as `GOOGLE_CLIENT_SECRET`

---

## 🚀 **Deployment Checklist**

### **Before Deploying to Vercel**

- [ ] Database set up (Vercel Postgres, Neon, or other)
- [ ] All environment variables set in Vercel Dashboard
- [ ] Google OAuth redirect URIs include Vercel URLs
- [ ] Code committed and pushed to Git

### **Environment Variables in Vercel**

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable for **Production**, **Preview**, and **Development**

**Screenshot locations:** Settings → Environment Variables → Add

### **After First Deployment**

```bash
# Push database schema
cd packages/backend
npx prisma db push

# Or using Vercel CLI
vercel env pull .env.local
npx prisma db push
```

---

## 🐛 **Troubleshooting**

### **"JWT_SECRET not set" Warning**

**Problem:** JWT_SECRET environment variable is missing

**Solution:**
```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env (local)
JWT_SECRET="generated-secret-here"

# Or add to Vercel (production)
# Dashboard → Settings → Environment Variables
```

### **"Can't reach database server"**

**Problem:** DATABASE_URL is incorrect or database is unreachable

**Solution:**
1. Check DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`
2. Test connection:
   ```bash
   npx prisma db push
   ```
3. Verify database is accessible from Vercel's region

### **"Invalid state parameter - possible CSRF attack"**

**Problem:** OAuth state mismatch (common in serverless with sessions)

**Solution:** This is now fixed with JWT tokens! The state is stored in signed cookies instead of sessions.

### **"Token is invalid or expired"**

**Problem:** JWT token has expired (after 7 days)

**Solution:** User needs to sign in again. This is expected behavior.

---

## 📝 **Variable Reference**

### **DATABASE_URL**
- **Format:** `postgresql://user:password@host:port/database`
- **Example:** `postgresql://user:pass@ep-example-123456.us-east-1.aws.neon.tech/feai?sslmode=require`
- **Where:** Root `.env` file (local), Vercel Dashboard (production)

### **JWT_SECRET**
- **Format:** 64+ character random string
- **Generate:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **Purpose:** Sign JWT authentication tokens
- **Security:** NEVER commit to Git, NEVER share publicly

### **GOOGLE_CLIENT_ID**
- **Format:** `123456789.apps.googleusercontent.com`
- **Get from:** Google Cloud Console → APIs & Services → Credentials
- **Purpose:** Identify your app to Google OAuth

### **GOOGLE_CLIENT_SECRET**
- **Format:** `GOCSPX-abc123xyz789`
- **Get from:** Google Cloud Console → APIs & Services → Credentials
- **Purpose:** Authenticate your app with Google
- **Security:** NEVER commit to Git, NEVER share publicly

### **NODE_ENV**
- **Values:** `development`, `production`, `test`
- **Default:** `development`
- **Effect:** Changes logging, security headers, session behavior

### **VITE_OPENAI_API_KEY**
- **Format:** `sk-...` (starts with "sk-")
- **Get from:** [OpenAI Platform](https://platform.openai.com/api-keys)
- **Purpose:** Enable AI Chat Assistant for natural language CAD commands
- **Optional:** The app works without it, but AI chat will not function
- **Important:** Must be prefixed with `VITE_` for Vite to expose it to the frontend
- **Security:** This key is exposed to the frontend, so use a restricted key with spending limits

---

## 🔗 **Useful Links**

- [Google Cloud Console](https://console.cloud.google.com/)
- [Neon.tech (Database)](https://neon.tech/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Need help?** Check the main [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for more details.

