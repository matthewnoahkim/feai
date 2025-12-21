/**
 * Authentication Middleware
 * 
 * Provides session-based authentication with automatic token refresh
 */

import { Request, Response, NextFunction } from 'express';
import { tokenStore, getValidAccessToken } from './googleOAuth';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        googleId: string;
        email: string;
        name: string;
        picture?: string;
      };
    }
  }
}

/**
 * Require authentication middleware
 * 
 * This middleware:
 * 1. Checks if user is logged in (session cookie)
 * 2. Validates tokens are still valid
 * 3. Automatically refreshes expired tokens
 * 4. Attaches user info to req.user
 * 
 * Usage:
 * ```ts
 * app.get('/api/protected', requireAuth, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * ```
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check session
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.',
      });
      return;
    }

    // Get user session with tokens
    const session = await tokenStore.getTokens(userId);
    
    if (!session) {
      // Session exists but no tokens found - invalid state
      delete (req.session as any).userId;
      res.status(401).json({
        error: 'INVALID_SESSION',
        message: 'Session invalid. Please sign in again.',
      });
      return;
    }

    // Ensure we have a valid access token (auto-refresh if expired)
    try {
      await getValidAccessToken(userId);
    } catch (error) {
      // Token refresh failed - user must re-authenticate
      delete (req.session as any).userId;
      await tokenStore.deleteTokens(userId);
      
      res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Session expired. Please sign in again.',
      });
      return;
    }

    // Attach user info to request
    req.user = {
      userId: session.userId,
      googleId: session.googleId,
      email: session.email,
      name: session.name,
      picture: session.picture,
    };

    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Authentication check failed',
    });
  }
}

/**
 * Optional authentication middleware
 * 
 * Attaches user if authenticated, but doesn't require it
 * Useful for routes that have different behavior for authenticated users
 * 
 * Usage:
 * ```ts
 * app.get('/api/data', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // User is authenticated
 *   } else {
 *     // Anonymous user
 *   }
 * });
 * ```
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req.session as any)?.userId;
    
    if (userId) {
      const session = await tokenStore.getTokens(userId);
      
      if (session) {
        try {
          await getValidAccessToken(userId);
          req.user = {
            userId: session.userId,
            googleId: session.googleId,
            email: session.email,
            name: session.name,
            picture: session.picture,
          };
        } catch (error) {
          // Token invalid, but don't fail the request
          delete (req.session as any).userId;
        }
      }
    }
    
    next();
  } catch (error) {
    // Don't fail the request, just continue without user
    console.error('⚠️  Optional auth error:', error);
    next();
  }
}

