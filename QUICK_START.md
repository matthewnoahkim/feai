# 🚀 Quick Start - Setting Up Google OAuth

## The Error You're Seeing

The error **"Missing required parameter: client_id"** means you need to set up Google OAuth credentials.

## Follow These Steps

### Step 1: Create `.env` File

In the `packages/backend` folder, create a file named `.env` (copy from `.env.example`):

```bash
cd packages/backend
cp .env.example .env
```

Or manually create `packages/backend/.env` with this content:

```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
SESSION_SECRET=your-super-secret-session-key-change-this
BASE_URL=http://localhost:3001
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
```

### Step 2: Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials

2. **Select or Create a Project**:
   - Click the project dropdown at the top
   - Click "New Project" if you don't have one
   - Name it (e.g., "FeAI")

3. **Enable Google+ API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen:
     - User Type: **External** (for testing)
     - App name: **FeAI**
     - User support email: your email
     - Developer contact: your email
     - Click "Save and Continue" through all steps
   
5. **Configure OAuth Client**:
   - Application type: **Web application**
   - Name: **FeAI Local Dev**
   - **Authorized redirect URIs**: Click "Add URI" and enter:
     ```
     http://localhost:3001/auth/google/callback
     ```
   - Click "Create"

6. **Copy Your Credentials**:
   - You'll see a popup with:
     - **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-...`)
   - Copy these values!

### Step 3: Update Your `.env` File

Replace the placeholder values in `packages/backend/.env`:

```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here
```

### Step 4: Generate Session Secret

Run this command to generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and update `SESSION_SECRET` in your `.env` file.

### Step 5: Restart Your Server

```bash
cd ../..  # Go back to project root
npx kill-port 3001
npm run dev
```

### Step 6: Test Sign In

1. Go to: http://localhost:3001/login
2. Click "Sign in with Google"
3. You should now see the Google sign-in page
4. After signing in, you'll be redirected to the dashboard

---

## Troubleshooting

### "Missing required parameter: client_id"
- Make sure your `.env` file is in `packages/backend/.env`
- Make sure you replaced `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID
- Restart the server after updating `.env`

### "redirect_uri_mismatch"
- Make sure you added `http://localhost:3001/auth/google/callback` to your Google Cloud Console
- The URI must match exactly (check for trailing slashes, http vs https)

### "Access blocked: This app's request is invalid"
- Make sure you configured the OAuth consent screen
- Make sure Google+ API is enabled

---

## Need More Help?

See the full guide: `GOOGLE_OAUTH_GUIDE.md`
