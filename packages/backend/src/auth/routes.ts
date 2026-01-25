/**
 * Authentication Routes
 * Handles Google OAuth flow endpoints
 */

import { Router, Request, Response } from 'express';
import { getAuthConfig } from './config';
import {
  generateStateToken,
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  verifyIdToken,
  extractUserProfile,
  findOrCreateUser,
  generateSessionToken,
} from './service';
import {
  SESSION_COOKIE_NAME,
  STATE_COOKIE_NAME,
  requireAuth,
  validateOAuthState,
} from './middleware';

const router = Router();

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow by redirecting to Google's consent screen
 */
router.get('/google', (req: Request, res: Response) => {
  try {
    const config = getAuthConfig();
    
    // SECURITY: Generate cryptographically secure state token for CSRF protection
    const state = generateStateToken();
    
    // SECURITY: Store state in httpOnly cookie to validate on callback
    // This prevents CSRF attacks where an attacker tries to complete OAuth with their account
    res.cookie(STATE_COOKIE_NAME, state, {
      httpOnly: true, // SECURITY: Not accessible via JavaScript
      secure: config.cookie.secure, // SECURITY: HTTPS only in production
      sameSite: 'lax', // SECURITY: Allow redirect from Google
      maxAge: 10 * 60 * 1000, // 10 minutes - state should be short-lived
      path: '/',
    });
    
    const authUrl = getGoogleAuthUrl(state);
    res.redirect(authUrl);
    
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Failed to initiate authentication',
      },
    });
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google's OAuth callback after user grants consent
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const config = getAuthConfig();
  
  try {
    const { code, state, error: oauthError } = req.query;
    
    // Handle OAuth errors (user denied access, etc.)
    if (oauthError) {
      console.error('OAuth error from Google:', oauthError);
      return res.redirect(`${config.clientUrl}/login?error=oauth_denied`);
    }
    
    // Validate required parameters
    if (!code || typeof code !== 'string') {
      return res.redirect(`${config.clientUrl}/login?error=missing_code`);
    }
    
    // SECURITY: Validate state parameter to prevent CSRF attacks
    const storedState = req.cookies?.[STATE_COOKIE_NAME];
    if (!validateOAuthState(state as string, storedState)) {
      console.error('OAuth state mismatch - possible CSRF attack');
      // Clear the state cookie
      res.clearCookie(STATE_COOKIE_NAME);
      return res.redirect(`${config.clientUrl}/login?error=invalid_state`);
    }
    
    // Clear the state cookie - it's single-use
    res.clearCookie(STATE_COOKIE_NAME);
    
    // SECURITY: Exchange code for tokens (server-side, never exposed to client)
    const tokens = await exchangeCodeForTokens(code);
    
    if (!tokens.idToken) {
      throw new Error('No ID token received from Google');
    }
    
    // SECURITY: Verify ID token signature, expiration, and audience
    const tokenPayload = await verifyIdToken(tokens.idToken);
    
    // Extract user profile from verified token
    const profile = extractUserProfile(tokenPayload);
    
    // Find or create user in database
    const user = await findOrCreateUser(profile);
    
    // Generate session token
    const sessionToken = generateSessionToken(user);
    
    // SECURITY: Set session token in httpOnly cookie
    // This prevents XSS attacks from stealing the session
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true, // SECURITY: Not accessible via JavaScript
      secure: config.cookie.secure, // SECURITY: HTTPS only in production
      sameSite: config.cookie.sameSite, // SECURITY: CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      ...(config.cookie.domain && { domain: config.cookie.domain }),
    });
    
    // Redirect to frontend with success
    res.redirect(`${config.clientUrl}/dashboard`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Clear any cookies on error
    res.clearCookie(STATE_COOKIE_NAME);
    res.clearCookie(SESSION_COOKIE_NAME);
    
    // Redirect to login with error
    res.redirect(`${config.clientUrl}/login?error=auth_failed`);
  }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile
 * Protected route - requires valid session
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  // User is guaranteed to exist due to requireAuth middleware
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

/**
 * POST /api/auth/logout
 * Clears the session cookie and logs out the user
 */
router.post('/logout', (req: Request, res: Response) => {
  const config = getAuthConfig();
  
  // Clear session cookie with all the same options used when setting it
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
    ...(config.cookie.domain && { domain: config.cookie.domain }),
  });
  
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/auth/status
 * Check authentication status without requiring auth
 * Useful for frontend to check if user is logged in
 */
router.get('/status', (req: Request, res: Response) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (!token) {
    return res.json({
      success: true,
      data: {
        authenticated: false,
      },
    });
  }
  
  try {
    // Import inline to avoid circular dependency
    const { verifySessionToken } = require('./service');
    const user = verifySessionToken(token);
    
    res.json({
      success: true,
      data: {
        authenticated: true,
        user,
      },
    });
  } catch (error) {
    // Invalid token - clear it and return unauthenticated
    res.clearCookie(SESSION_COOKIE_NAME);
    
    res.json({
      success: true,
      data: {
        authenticated: false,
      },
    });
  }
});

export const authRouter = router;
