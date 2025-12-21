# Google OAuth 2.0 Implementation Guide

## Overview

This is a production-ready Google OAuth 2.0 implementation with:
- ✅ Authorization code flow (NOT implicit flow - deprecated)
- ✅ Offline access (refresh tokens)
- ✅ Secure session management
- ✅ CSRF protection (state parameter)
- ✅ Automatic token refresh
- ✅ Clean architecture (swappable token store)

## Architecture

```
┌─────────────┐     1. GET /auth/google      ┌──────────────┐
│   Browser   │─────────────────────────────>│    Server    │
│             │                               │              │
│             │<─────────────────────────────│   Generate   │
│             │     2. Redirect to Google     │   auth URL   │
│             │                               └──────────────┘
│             │
│             │     3. User consents
│             │
│             │     4. GET /auth/google/callback?code=xxx&state=yyy
│             │────────────────────────────────────────────────>
│             │                               ┌──────────────┐
│             │                               │   Validate   │
│             │                               │    state     │
│             │                               │              │
│             │                               │   Exchange   │
│             │                               │    code      │
│             │                               │              │
│             │                               │   Fetch      │
│             │                               │   profile    │
│             │                               │              │
│             │                               │   Create     │
│             │                               │   session    │
│             │<─────────────────────────────│              │
│             │   5. Redirect to /dashboard   └──────────────┘
└─────────────┘
```

## Files Created

### 1. `src/auth/googleOAuth.ts`
Core OAuth logic:
- `getGoogleAuthUrl(req)` - Generate authorization URL
- `handleGoogleCallback(req)` - Handle OAuth callback
- `refreshGoogleAccessToken(userId)` - Refresh expired tokens
- `getValidAccessToken(userId)` - Get valid token (auto-refresh)
- `revokeTokens(userId)` - Sign out
- `TokenStore` interface - Swappable storage (in-memory or database)

### 2. `src/auth/middleware.ts`
Authentication middleware:
- `requireAuth` - Protect routes (401 if not authenticated)
- `optionalAuth` - Attach user if authenticated (doesn't fail)

### 3. `src/routes/auth-oauth.ts`
Express routes:
- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - Handle callback
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Sign out
- `POST /auth/refresh` - Manually refresh token

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd packages/backend
npm install googleapis express-session cookie-parser @types/express-session @types/cookie-parser
```

### Step 2: Configure Environment Variables

Add to your `.env` file:

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-change-this

# Base URL (for production)
BASE_URL=http://localhost:3001

# Node Environment
NODE_ENV=development
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Google Cloud Console Setup

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Create OAuth 2.0 Client ID:**
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "FeAI Local Development"
   
3. **Configure Authorized URLs:**
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3001
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3001/auth/google/callback
   ```

4. **Copy credentials** to `.env`:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### Step 4: Update Server Configuration

Update `src/index.ts` to include session middleware:

```typescript
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { authRouter as authOAuthRouter } from './routes/auth-oauth';

// Add after other middleware
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,  // Prevent XSS attacks
    sameSite: 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Use OAuth routes
app.use('/auth', authOAuthRouter);
```

### Step 5: Run the Server

```bash
npm run dev
```

## Usage Examples

### Protected Route

```typescript
import { requireAuth } from './auth/middleware';

app.get('/api/protected', requireAuth, (req, res) => {
  res.json({
    message: 'Hello authenticated user!',
    user: req.user
  });
});
```

### Optional Authentication

```typescript
import { optionalAuth } from './auth/middleware';

app.get('/api/data', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated - return personalized data
    res.json({ message: `Hello ${req.user.name}` });
  } else {
    // Anonymous user - return public data
    res.json({ message: 'Hello guest' });
  }
});
```

### Make Google API Calls

```typescript
import { getValidAccessToken } from './auth/googleOAuth';
import { google } from 'googleapis';

app.get('/api/drive-files', requireAuth, async (req, res) => {
  try {
    // Get valid access token (auto-refreshes if expired)
    const accessToken = await getValidAccessToken(req.user!.userId);
    
    // Create OAuth2 client with token
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Make API call
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({ pageSize: 10 });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Drive files' });
  }
});
```

## Important Concepts

### 1. Refresh Tokens

**When you get a refresh token:**
- First time user authenticates
- When using `prompt=consent` (forces consent screen)

**When you DON'T get a refresh token:**
- Subsequent logins (Google remembers the consent)
- Use `prompt=select_account` for normal logins

**Why refresh tokens are important:**
- Access tokens expire after ~1 hour
- Refresh tokens allow you to get new access tokens
- Refresh tokens can last indefinitely (until revoked)

**Change prompt in `src/auth/googleOAuth.ts`:**
```typescript
// First time login or when you need a NEW refresh token
prompt: 'consent'

// Subsequent logins (recommended)
prompt: 'select_account'
```

### 2. Token Expiration

The system automatically handles token expiration:
- `requireAuth` middleware checks token validity
- `getValidAccessToken()` refreshes if expired
- If refresh fails, user must re-authenticate

### 3. CSRF Protection

State parameter protects against CSRF attacks:
1. Generate random state, store in session
2. Include in OAuth URL
3. Google returns state in callback
4. Validate state matches session

### 4. Session vs JWT

This implementation uses **sessions** (not JWTs) because:
- ✅ Server can revoke sessions immediately
- ✅ Easier to manage refresh tokens
- ✅ No token size limits
- ✅ More secure (tokens never leave server)

For API-only (no browser), consider JWTs.

### 5. Token Storage

**Current:** In-memory Map (development only)

**Production:** Implement `TokenStore` interface with your database:

```typescript
import { TokenStore, StoredUserSession, setTokenStore } from './auth/googleOAuth';
import { db } from './db'; // Your Prisma client

class PrismaTokenStore implements TokenStore {
  async saveTokens(userId: string, session: StoredUserSession): Promise<void> {
    await db.tokenStore.upsert({
      where: { userId },
      update: { 
        tokens: session.tokens,
        lastRefreshed: new Date(),
      },
      create: {
        userId,
        googleId: session.googleId,
        tokens: session.tokens,
        createdAt: new Date(),
      },
    });
  }

  async getTokens(userId: string): Promise<StoredUserSession | null> {
    const stored = await db.tokenStore.findUnique({ where: { userId } });
    return stored ? {
      userId: stored.userId,
      googleId: stored.googleId,
      email: stored.email,
      name: stored.name,
      picture: stored.picture,
      tokens: stored.tokens as any,
      createdAt: stored.createdAt,
      lastRefreshed: stored.lastRefreshed || undefined,
    } : null;
  }

  async deleteTokens(userId: string): Promise<void> {
    await db.tokenStore.delete({ where: { userId } });
  }

  async getByGoogleId(googleId: string): Promise<StoredUserSession | null> {
    const stored = await db.tokenStore.findUnique({ where: { googleId } });
    return stored ? /* map to StoredUserSession */ : null;
  }
}

// Set the token store
setTokenStore(new PrismaTokenStore());
```

## Security Best Practices

✅ **Use HTTPS in production** - Set `cookie.secure = true`
✅ **Use secure SESSION_SECRET** - Generate random, keep secret
✅ **Validate state parameter** - CSRF protection
✅ **Use httpOnly cookies** - Prevent XSS attacks
✅ **Use sameSite=lax** - Additional CSRF protection
✅ **Refresh tokens securely** - Never expose to client
✅ **Revoke tokens on logout** - Call Google's revoke endpoint
✅ **Store tokens encrypted** - Consider encryption at rest

## Testing

### 1. Test OAuth Flow

```bash
# 1. Start server
npm run dev

# 2. Open browser
http://localhost:3001/login

# 3. Click "Sign in with Google"

# 4. Should redirect to Google

# 5. After consent, should redirect to /dashboard
```

### 2. Test Protected Route

```bash
# Without authentication (should fail)
curl http://localhost:3001/auth/me

# With session cookie (should succeed)
curl http://localhost:3001/auth/me -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

### 3. Test Token Refresh

```typescript
// Manually expire token in your token store
// Then make a request - should auto-refresh

curl http://localhost:3001/auth/refresh -X POST \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

## Troubleshooting

### "No refresh token"
- **Solution:** Use `prompt=consent` in `getGoogleAuthUrl()`
- **Why:** Google only returns refresh_token on first consent or forced consent

### "Redirect URI mismatch"
- **Solution:** Add exact URI to Google Cloud Console
- **Must match:** Protocol, domain, port, path
- **Example:** `http://localhost:3001/auth/google/callback`

### "Invalid state parameter"
- **Solution:** Check session middleware is configured
- **Why:** State is stored in session, must persist across requests

### "Token expired"
- **Solution:** Call `refreshGoogleAccessToken(userId)`
- **Note:** `requireAuth` middleware does this automatically

### "Session not persisting"
- **Solution:** Check `SESSION_SECRET` is set
- **Check:** Cookies are enabled in browser
- **Check:** `cors({ credentials: true })` is set

## Additional Scopes

To request additional Google API access, add scopes in `src/auth/googleOAuth.ts`:

```typescript
const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  
  // Add more scopes:
  'https://www.googleapis.com/auth/drive.readonly',       // Drive
  'https://www.googleapis.com/auth/calendar.readonly',    // Calendar
  'https://www.googleapis.com/auth/gmail.readonly',       // Gmail
  // See: https://developers.google.com/identity/protocols/oauth2/scopes
];
```

**Note:** New scopes require new consent. Use `prompt=consent` to re-request consent.

## Production Deployment

### 1. Environment Variables

```env
NODE_ENV=production
BASE_URL=https://yourdomain.com
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
SESSION_SECRET=<your-production-secret>
```

### 2. Google Cloud Console

Add production URLs:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/auth/google/callback`

### 3. Session Store

Replace in-memory sessions with Redis or database:

```typescript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,  // HTTPS only
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}));
```

### 4. Token Store

Implement database-backed `TokenStore` (see "Token Storage" section above).

## Next Steps

1. ✅ Configure `.env` with Google credentials
2. ✅ Update `src/index.ts` to use session middleware
3. ✅ Test OAuth flow
4. ✅ Implement database-backed `TokenStore`
5. ✅ Add session store for production (Redis)
6. ✅ Add additional scopes if needed
7. ✅ Deploy to production

## Support

For issues:
- Google OAuth docs: https://developers.google.com/identity/protocols/oauth2
- googleapis library: https://github.com/googleapis/google-api-nodejs-client
- express-session: https://github.com/expressjs/session

**Happy coding! 🚀**

