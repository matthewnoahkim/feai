/**
 * OAuth 2.0 Authentication Routes
 * 
 * Complete Google OAuth implementation with secure session handling
 */

import express, { Request, Response } from 'express';
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  generateState,
  revokeTokens,
  tokenStore,
  StoredUserSession,
} from '../auth/googleOAuth';
import { requireAuth } from '../auth/middleware';
import { db } from '../db';

const router = express.Router();

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
    // Generate and store CSRF state token
    const state = generateState();
    (req.session as any).oauthState = state;

    // Generate auth URL
    const authUrl = getGoogleAuthUrl(req);

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
    // Handle OAuth callback and get user + tokens
    const { user: googleUser, tokens } = await handleGoogleCallback(req);

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
    
    await tokenStore.saveTokens(dbUser.id, session);

    // Create secure session
    (req.session as any).userId = dbUser.id;
    
    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.redirect('/login?error=' + encodeURIComponent('Failed to create session'));
      }

      console.log(`✅ Authentication successful for: ${googleUser.email}`);
      
      // Redirect to dashboard
      res.redirect('/dashboard');
    });

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

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
      }
    });

    console.log(`👋 User signed out: ${userId}`);

    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Even if revocation fails, destroy the session
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

