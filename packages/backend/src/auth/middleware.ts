/**
 * Authentication Middleware
 * 
 * Provides JWT-based authentication for serverless environments
 * Falls back to session-based auth for local development
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { tokenStore, getValidAccessToken } from './googleOAuth';

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'change-this-secret-in-production';

interface JWTPayload {
  userId: string;
  email: string;
  googleId: string;
  iat?: number;
  exp?: number;
}

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
 * 1. Checks for JWT token in Authorization header
 * 2. Falls back to session-based auth (for local development)
 * 3. Validates tokens are still valid
 * 4. Automatically refreshes expired Google OAuth tokens
 * 5. Attaches user info to req.user
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
    let userId: string | undefined;
    let userPayload: JWTPayload | undefined;

    // Method 1: JWT Token from Authorization header (Production/Serverless)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        userId = decoded.userId;
        userPayload = decoded;
      } catch (err) {
        res.status(401).json({
          error: 'INVALID_TOKEN',
          message: 'Authentication token is invalid or expired. Please sign in again.',
        });
        return;
      }
    }
    
    // Method 2: Session-based auth (Local Development fallback)
    if (!userId && req.session) {
      userId = (req.session as any)?.userId;
    }
    
    if (!userId) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in.',
      });
      return;
    }

    // Get user session with Google OAuth tokens
    const session = await tokenStore.getTokens(userId);
    
    if (!session) {
      // Session exists but no tokens found - invalid state
      if (req.session) {
        delete (req.session as any).userId;
      }
      res.status(401).json({
        error: 'INVALID_SESSION',
        message: 'Session invalid. Please sign in again.',
      });
      return;
    }

    // Ensure we have a valid Google access token (auto-refresh if expired)
    try {
      await getValidAccessToken(userId);
    } catch (error) {
      // Token refresh failed - user must re-authenticate
      if (req.session) {
        delete (req.session as any).userId;
      }
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
    let userId: string | undefined;

    // Method 1: JWT Token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        userId = decoded.userId;
      } catch (err) {
        // Invalid token, but don't fail the request
        console.warn('⚠️  Invalid JWT token in optionalAuth');
      }
    }
    
    // Method 2: Session-based auth (Local Development fallback)
    if (!userId && req.session) {
      userId = (req.session as any)?.userId;
    }
    
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
          if (req.session) {
            delete (req.session as any).userId;
          }
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

