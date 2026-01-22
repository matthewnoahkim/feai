/**
 * OAuth 2.0 Authentication Routes
 * 
 * Complete Google OAuth implementation with secure session handling
 */

import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  generateState,
  generatePKCE,
  revokeTokens,
  tokenStore,
  StoredUserSession,
} from '../auth/googleOAuth';
import { requireAuth } from '../auth/middleware';
import { db } from '../db';

const router = express.Router();

// JWT Secret from environment - fail fast in production
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: JWT_SECRET must be set in production');
  }
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using insecure default for development only.');
  console.warn('⚠️  Set JWT_SECRET environment variable before deploying to production!');
}

// Use default only in development
const JWT_SECRET_FINAL = JWT_SECRET || 'change-this-secret-in-production';

// Allowed redirect origins for security
const ALLOWED_REDIRECT_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.CLIENT_URL || 'http://localhost:3001',
  'https://feai.vercel.app',
  // Add other production domains here
].filter(Boolean);

/**
 * Validate redirect URI against allowlist
 * Prevents open redirect attacks
 */
function validateRedirectUri(url: string): boolean {
  try {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    return ALLOWED_REDIRECT_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

/**
 * GET /auth/google
 * 
 * Initiates OAuth flow by redirecting to Google's consent screen
 * 
 * Flow:
 * 1. Generate CSRF state token and store in session
 * 2. Generate Google auth URL with state
 * 3. Redirect user to Google
 */
router.get('/google', (req: Request, res: Response) => {
  try {
    // Generate CSRF state token
    const state = generateState();
    
    // Generate PKCE code verifier and challenge
    const { codeVerifier, codeChallenge } = generatePKCE();
    
    // Generate nonce for OIDC replay protection
    const nonce = randomBytes(16).toString('hex');
    
    // Store state, code verifier, and nonce in signed cookies
    res.cookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      signed: true,
    });
    
    res.cookie('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      signed: true,
    });
    
    res.cookie('oauth_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      signed: true,
    });
    
    // Also store in session if available (for local development)
    if (req.session) {
      (req.session as any).oauthState = state;
      (req.session as any).oauthCodeVerifier = codeVerifier;
      (req.session as any).oauthNonce = nonce;
    }

    // Generate auth URL with PKCE and nonce
    const authUrl = getGoogleAuthUrl(state, codeChallenge, nonce);

    console.log('🔐 Redirecting to Google OAuth...');
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error initiating OAuth:', error);
    const message = error instanceof Error ? error.message : 'Failed to initiate sign in';
    res.redirect(`/login?error=${encodeURIComponent(message)}`);
  }
});

/**
 * GET /auth/google/callback
 * 
 * Handles OAuth callback from Google
 * 
 * Flow:
 * 1. Validate state parameter (CSRF protection)
 * 2. Exchange authorization code for tokens
 * 3. Fetch user profile from Google
 * 4. Find or create user in database
 * 5. Store tokens in token store
 * 6. Create secure session
 * 7. Redirect to dashboard
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    // Validate state parameter (CSRF protection)
    const { code, state, error } = req.query;

    if (error) {
      throw new Error(`OAuth error from Google: ${error}`);
    }

    if (!code || typeof code !== 'string') {
      throw new Error('No authorization code provided');
    }

    if (!state || typeof state !== 'string') {
      throw new Error('No state parameter provided');
    }

    // Get state, code verifier, and nonce from signed cookies or session
    const cookieState = req.signedCookies?.oauth_state;
    const cookieCodeVerifier = req.signedCookies?.oauth_code_verifier;
    const cookieNonce = req.signedCookies?.oauth_nonce;
    const sessionState = (req.session as any)?.oauthState;
    const sessionCodeVerifier = (req.session as any)?.oauthCodeVerifier;
    const sessionNonce = (req.session as any)?.oauthNonce;
    
    const storedState = cookieState || sessionState;
    const storedCodeVerifier = cookieCodeVerifier || sessionCodeVerifier;
    const storedNonce = cookieNonce || sessionNonce;

    if (!storedState) {
      throw new Error('No stored state found - session may have expired');
    }

    if (!storedCodeVerifier) {
      throw new Error('No code verifier found - PKCE validation failed');
    }

    // Clear cookies
    res.clearCookie('oauth_state');
    res.clearCookie('oauth_code_verifier');
    res.clearCookie('oauth_nonce');
    if (req.session) {
      delete (req.session as any).oauthState;
      delete (req.session as any).oauthCodeVerifier;
      delete (req.session as any).oauthNonce;
    }

    // Handle OAuth callback with PKCE and nonce validation
    const { user: googleUser, tokens } = await handleGoogleCallback(
      code,
      storedState,
      state,
      storedCodeVerifier,
      storedNonce
    );

    // Find or create user in database
    let dbUser = await db.user.findUnique({
      where: { googleId: googleUser.sub },
    });

    if (!dbUser) {
      // Check if user with this email already exists
      const existingUser = await db.user.findUnique({
        where: { email: googleUser.email },
      });

      if (existingUser) {
        // Link Google account to existing user
        console.log('🔗 Linking Google account to existing user...');
        dbUser = await db.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.sub,
            name: googleUser.name,
            photoURL: googleUser.picture,
          },
        });
      } else {
        // Create new user
        console.log('✨ Creating new user...');
        dbUser = await db.user.create({
          data: {
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            photoURL: googleUser.picture,
          },
        });
      }
    } else {
      // Update existing user info
      console.log('🔄 Updating existing user...');
      dbUser = await db.user.update({
        where: { id: dbUser.id },
        data: {
          name: googleUser.name,
          photoURL: googleUser.picture,
        },
      });
    }

    // Store tokens in token store
    const session: StoredUserSession = {
      userId: dbUser.id,
      googleId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      tokens: tokens,
      createdAt: new Date(),
    };
    
    // Regenerate session ID to prevent session fixation
    if (req.session) {
      await new Promise<void>((resolve, reject) => {
        req.session!.regenerate((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    await tokenStore.saveTokens(dbUser.id, session);

    // Create JWT token with proper claims
    const jwtToken = jwt.sign(
      {
        userId: dbUser.id,
        email: dbUser.email,
        googleId: googleUser.sub,
      },
      JWT_SECRET_FINAL,
      {
        expiresIn: '7d', // 7 days
        issuer: 'feai-backend',
        audience: 'feai-frontend',
        algorithm: 'HS256', // Explicit algorithm
      }
    );

    // Set JWT in httpOnly cookie (secure, not exposed in URL)
    res.cookie('auth_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    console.log(`✅ Authentication successful for: ${googleUser.email}`);
    
    // Validate redirect URI before redirecting
    const callbackUrl = new URL('/auth/callback', `${req.protocol}://${req.get('host')}`);
    
    if (!validateRedirectUri(callbackUrl.toString())) {
      throw new Error('Invalid redirect URI');
    }
    
    // Redirect to callback with only non-sensitive data (token is in cookie)
    callbackUrl.searchParams.set('userId', dbUser.id);
    callbackUrl.searchParams.set('email', dbUser.email);
    callbackUrl.searchParams.set('name', dbUser.name);
    if (dbUser.photoURL) {
      callbackUrl.searchParams.set('photoURL', dbUser.photoURL);
    }
    
    res.redirect(callbackUrl.toString());

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.redirect(`/login?error=${encodeURIComponent(message)}`);
  }
});

/**
 * GET /auth/me
 * 
 * Returns current user's profile
 * Requires authentication
 * 
 * Response:
 * {
 *   user: {
 *     userId: string,
 *     googleId: string,
 *     email: string,
 *     name: string,
 *     picture?: string
 *   }
 * }
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    // Get full user info from database
    const user = await db.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        googleId: true,
        email: true,
        name: true,
        photoURL: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.photoURL,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user information',
    });
  }
});

/**
 * POST /auth/logout
 * 
 * Signs out the current user
 * 
 * Flow:
 * 1. Revoke tokens with Google
 * 2. Delete tokens from token store
 * 3. Destroy session
 * 4. Return success
 */
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Revoke tokens
    await revokeTokens(userId);

    // Clear auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
      }
    });

    // Sanitize logging - don't expose full user IDs
    console.log(`👋 User signed out: ${userId.substring(0, 8)}...`);

    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Even if revocation fails, clear cookie and destroy session
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    req.session.destroy(() => {});
    
    res.status(500).json({
      error: 'LOGOUT_ERROR',
      message: 'Logout completed with errors',
    });
  }
});

/**
 * POST /auth/refresh
 * 
 * Manually refresh access token (usually done automatically)
 * Useful for testing or forcing a refresh
 * 
 * Response:
 * {
 *   success: true,
 *   message: "Token refreshed successfully"
 * }
 */
router.post('/refresh', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // This will trigger a refresh if needed
    const { refreshGoogleAccessToken } = await import('../auth/googleOAuth');
    await refreshGoogleAccessToken(userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(500).json({
      error: 'REFRESH_ERROR',
      message: 'Failed to refresh token',
    });
  }
});

export const authRouter = router;

