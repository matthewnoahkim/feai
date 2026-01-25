/**
 * Google OAuth Service
 * Handles OAuth flow, token validation, and user profile extraction
 */

import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getAuthConfig } from './config';
import { db } from '../db';

// Lazy-initialized OAuth client
let _oauthClient: OAuth2Client | null = null;

function getOAuthClient(): OAuth2Client {
  if (!_oauthClient) {
    const config = getAuthConfig();
    _oauthClient = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
  }
  return _oauthClient;
}

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  photoURL?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

/**
 * Generate a cryptographically secure state token for CSRF protection
 * This token is stored in a cookie and validated when Google redirects back
 */
export function generateStateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate the Google OAuth consent URL
 * @param state - CSRF protection token (must be stored and validated on callback)
 */
export function getGoogleAuthUrl(state: string): string {
  const config = getAuthConfig();
  const client = getOAuthClient();
  
  return client.generateAuthUrl({
    access_type: 'offline', // Request refresh token for long-lived sessions
    scope: config.google.scopes,
    state, // SECURITY: Include state for CSRF protection
    prompt: 'consent', // Force consent screen to get refresh token
    include_granted_scopes: true,
  });
}

/**
 * Exchange authorization code for tokens
 * SECURITY: This happens server-side, tokens never exposed to frontend
 * @param code - Authorization code from Google callback
 */
export async function exchangeCodeForTokens(code: string): Promise<AuthTokens> {
  const client = getOAuthClient();
  
  const { tokens } = await client.getToken(code);
  
  return {
    accessToken: tokens.access_token || '',
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
  };
}

/**
 * Verify and decode the Google ID token
 * SECURITY: Validates signature, expiration, audience, and issuer
 * @param idToken - JWT ID token from Google
 */
export async function verifyIdToken(idToken: string): Promise<TokenPayload> {
  const config = getAuthConfig();
  const client = getOAuthClient();
  
  // SECURITY: Verify the ID token signature and claims
  // This checks:
  // - Token signature is valid (signed by Google)
  // - Token is not expired
  // - Token audience matches our client ID
  // - Token issuer is Google
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.google.clientId, // SECURITY: Verify audience matches our app
  });
  
  const payload = ticket.getPayload();
  
  if (!payload) {
    throw new Error('Invalid ID token: no payload');
  }
  
  // SECURITY: Verify email is verified by Google
  if (!payload.email_verified) {
    throw new Error('Email not verified by Google');
  }
  
  return payload;
}

/**
 * Extract user profile from verified Google token payload
 */
export function extractUserProfile(payload: TokenPayload): GoogleUserProfile {
  if (!payload.sub || !payload.email) {
    throw new Error('Invalid token payload: missing required fields');
  }
  
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    photoURL: payload.picture,
  };
}

/**
 * Find or create user in database based on Google profile
 * Links Google account to existing user by email if found
 */
export async function findOrCreateUser(profile: GoogleUserProfile): Promise<SessionUser> {
  // First, try to find user by Google ID
  let user = await db.user.findUnique({
    where: { googleId: profile.googleId },
  });
  
  if (user) {
    // Update user info in case it changed on Google side
    user = await db.user.update({
      where: { id: user.id },
      data: {
        name: profile.name,
        photoURL: profile.photoURL,
      },
    });
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL ?? undefined,
    };
  }
  
  // Try to find by email (link existing account to Google)
  user = await db.user.findUnique({
    where: { email: profile.email },
  });
  
  if (user) {
    // Link Google account to existing user
    user = await db.user.update({
      where: { id: user.id },
      data: {
        googleId: profile.googleId,
        name: profile.name,
        photoURL: profile.photoURL,
      },
    });
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL ?? undefined,
    };
  }
  
  // Create new user
  user = await db.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
      photoURL: profile.photoURL,
    },
  });
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoURL: user.photoURL ?? undefined,
  };
}

/**
 * Generate a JWT session token for the authenticated user
 * SECURITY: This token is stored in httpOnly cookie, not exposed to JS
 */
export function generateSessionToken(user: SessionUser): string {
  const config = getAuthConfig();
  
  // Parse expiresIn: if it's a numeric string, convert to number (seconds)
  // Otherwise use as string (e.g., "7d", "1h")
  const expiresIn = /^\d+$/.test(config.jwt.expiresIn)
    ? parseInt(config.jwt.expiresIn, 10)
    : config.jwt.expiresIn;
  
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
    },
    config.jwt.secret,
    {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
      issuer: 'feai',
      audience: 'feai-client',
    }
  );
}

/**
 * Verify and decode a session JWT token
 * @param token - JWT session token
 */
export function verifySessionToken(token: string): SessionUser {
  const config = getAuthConfig();
  
  const payload = jwt.verify(token, config.jwt.secret, {
    issuer: 'feai',
    audience: 'feai-client',
  }) as jwt.JwtPayload;
  
  return {
    id: payload.sub as string,
    email: payload.email,
    name: payload.name,
    photoURL: payload.photoURL,
  };
}
