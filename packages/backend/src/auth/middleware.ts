/**
 * Authentication Middleware
 * Handles session validation and route protection
 */

import { Request, Response, NextFunction } from 'express';
import { verifySessionToken, SessionUser } from './service';

// Cookie name for session token
export const SESSION_COOKIE_NAME = 'feai_session';

// Cookie name for OAuth state (CSRF protection)
export const STATE_COOKIE_NAME = 'feai_oauth_state';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

/**
 * Authentication middleware - requires valid session
 * Use this to protect routes that require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }
  
  try {
    const user = verifySessionToken(token);
    req.user = user;
    next();
  } catch (error) {
    // SECURITY: Don't expose token validation details
    console.error('Session validation failed:', error instanceof Error ? error.message : 'Unknown error');
    
    // Clear invalid session cookie
    res.clearCookie(SESSION_COOKIE_NAME);
    
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SESSION',
        message: 'Session expired or invalid',
      },
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if valid session exists, but doesn't require it
 * Use this for routes that work for both authenticated and anonymous users
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (!token) {
    next();
    return;
  }
  
  try {
    const user = verifySessionToken(token);
    req.user = user;
  } catch (error) {
    // Invalid session, clear cookie but continue
    res.clearCookie(SESSION_COOKIE_NAME);
  }
  
  next();
}

/**
 * Validate OAuth state parameter against stored cookie
 * SECURITY: Prevents CSRF attacks during OAuth flow
 * @param receivedState - State parameter from Google callback
 * @param storedState - State from secure cookie
 */
export function validateOAuthState(receivedState: string | undefined, storedState: string | undefined): boolean {
  if (!receivedState || !storedState) {
    return false;
  }
  
  // SECURITY: Use timing-safe comparison to prevent timing attacks
  if (receivedState.length !== storedState.length) {
    return false;
  }
  
  // Simple constant-time comparison
  let result = 0;
  for (let i = 0; i < receivedState.length; i++) {
    result |= receivedState.charCodeAt(i) ^ storedState.charCodeAt(i);
  }
  
  return result === 0;
}
