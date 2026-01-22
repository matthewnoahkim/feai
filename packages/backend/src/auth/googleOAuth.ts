/**
 * Google OAuth 2.0 Implementation
 * 
 * Complete authorization-code flow with offline access (refresh tokens)
 * Uses the official googleapis library with secure defaults
 * 
 * Features:
 * - Authorization code flow (NOT implicit flow)
 * - Offline access for refresh tokens
 * - CSRF protection via state parameter
 * - Token storage interface (swappable for Prisma/Postgres)
 * - Automatic token refresh
 * - User profile fetching
 */

import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes, createHash } from 'crypto';
import { Request } from 'express';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Google User Profile returned from userinfo endpoint
 */
export interface GoogleUserProfile {
  sub: string;           // Google user ID (unique identifier)
  email: string;         // User's email
  email_verified: boolean;
  name: string;          // Full name
  given_name?: string;   // First name
  family_name?: string;  // Last name
  picture?: string;      // Profile picture URL
  locale?: string;       // User's locale
}

/**
 * OAuth tokens from Google
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;  // Only provided on first auth or with prompt=consent
  expiry_date?: number;    // Timestamp when access_token expires
  scope: string;
  token_type: string;
  id_token?: string;
}

/**
 * Stored user session data
 */
export interface StoredUserSession {
  userId: string;          // Our internal user ID
  googleId: string;        // Google sub (unique identifier)
  email: string;
  name: string;
  picture?: string;
  tokens: GoogleTokens;
  createdAt: Date;
  lastRefreshed?: Date;
}

/**
 * Token storage interface
 * Implement this with your database (Prisma, Postgres, Redis, etc.)
 */
export interface TokenStore {
  saveTokens(userId: string, session: StoredUserSession): Promise<void>;
  getTokens(userId: string): Promise<StoredUserSession | null>;
  deleteTokens(userId: string): Promise<void>;
  getByGoogleId(googleId: string): Promise<StoredUserSession | null>;
}

// ============================================================================
// In-Memory Token Store (Development Only)
// ============================================================================

/**
 * Simple in-memory token store
 * ⚠️  Replace with Prisma/Postgres in production!
 * This is lost on server restart
 */
class InMemoryTokenStore implements TokenStore {
  private store = new Map<string, StoredUserSession>();
  private googleIdIndex = new Map<string, string>(); // googleId -> userId mapping

  async saveTokens(userId: string, session: StoredUserSession): Promise<void> {
    this.store.set(userId, session);
    this.googleIdIndex.set(session.googleId, userId);
    // Sanitize logging - don't expose full user IDs
    console.log(`💾 Saved tokens for user ${userId.substring(0, 8)}...`);
  }

  async getTokens(userId: string): Promise<StoredUserSession | null> {
    return this.store.get(userId) || null;
  }

  async deleteTokens(userId: string): Promise<void> {
    const session = this.store.get(userId);
    if (session) {
      this.googleIdIndex.delete(session.googleId);
    }
    this.store.delete(userId);
  }

  async getByGoogleId(googleId: string): Promise<StoredUserSession | null> {
    const userId = this.googleIdIndex.get(googleId);
    return userId ? this.getTokens(userId) : null;
  }
}

// ============================================================================
// OAuth Configuration
// ============================================================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Dynamically determine the redirect URI based on environment
 * - Production (Vercel): https://feai.vercel.app/auth/google/callback
 * - Development (Local): http://localhost:3001/auth/google/callback
 */
function getRedirectUri(): string {
  // If explicitly set in env, use that
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  
  // Auto-detect based on environment
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL || 'http://localhost:3001';
    
  return `${baseUrl}/auth/google/callback`;
}

const GOOGLE_REDIRECT_URI = getRedirectUri();

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set');
  console.warn('⚠️  OAuth will not work until these are configured');
} else {
  console.log('✅ Google OAuth configured with redirect URI:', GOOGLE_REDIRECT_URI);
}

/**
 * OAuth 2.0 Scopes
 * 
 * - openid: Required for OpenID Connect
 * - email: User's email address
 * - profile: User's basic profile info (name, picture)
 * 
 * Add additional scopes as needed:
 * - 'https://www.googleapis.com/auth/drive.readonly' for Drive access
 * - 'https://www.googleapis.com/auth/calendar.readonly' for Calendar access
 */
const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  // Add more scopes here as needed
];

// Global token store instance (replace with your DB implementation)
let tokenStore: TokenStore = new InMemoryTokenStore();

/**
 * Set a custom token store implementation
 * Use this to inject your Prisma/Postgres implementation
 */
export function setTokenStore(store: TokenStore): void {
  tokenStore = store;
}

// ============================================================================
// OAuth Client Management
// ============================================================================

/**
 * Create a new OAuth2 client instance
 */
function createOAuth2Client(): Auth.OAuth2Client {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate a secure random state parameter
 * Used for CSRF protection
 */
export function generateState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge
 * Returns { codeVerifier, codeChallenge }
 * 
 * PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // Generate 43-128 character code verifier (base64url encoded)
  const codeVerifier = randomBytes(32).toString('base64url');
  
  // Generate code challenge (SHA256 hash, base64url encoded)
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

/**
 * Validate ID token from Google
 * Verifies signature, issuer, audience, expiration, and nonce
 */
async function validateIdToken(
  idToken: string,
  expectedNonce?: string
): Promise<GoogleUserProfile> {
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID, // Must match our client ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid ID token payload');
    }

    // Validate required claims
    if (!payload.sub) {
      throw new Error('Missing sub claim in ID token');
    }
    if (!payload.email) {
      throw new Error('Missing email claim in ID token');
    }
    if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
      throw new Error(`Invalid issuer: ${payload.iss}`);
    }
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      throw new Error(`Invalid audience: ${payload.aud}`);
    }

    // Validate nonce if provided
    if (expectedNonce && payload.nonce !== expectedNonce) {
      throw new Error('Nonce mismatch - possible replay attack');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name || '',
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      locale: payload.locale,
    };
  } catch (error) {
    console.error('ID token validation failed:', error);
    throw new Error('Invalid ID token');
  }
}

// ============================================================================
// OAuth Flow Functions
// ============================================================================

/**
 * Generate Google OAuth authorization URL
 * 
 * This creates the URL to redirect users to Google's consent screen
 * 
 * @param stateOrReq - Either a state string or Express request with session
 * @param codeChallenge - PKCE code challenge (optional but recommended)
 * @param nonce - OIDC nonce for replay protection (optional)
 * @returns Authorization URL
 * 
 * Usage:
 * ```ts
 * // With state string and PKCE (recommended)
 * const { codeVerifier, codeChallenge } = generatePKCE();
 * const authUrl = getGoogleAuthUrl(state, codeChallenge, nonce);
 * res.redirect(authUrl);
 * ```
 * 
 * Important parameters:
 * - access_type=offline: Request refresh token for offline access
 * - prompt=consent: Force consent screen (required for refresh tokens)
 *   - Only use this on first login or when you need a NEW refresh token
 *   - Otherwise, use prompt=select_account or omit it
 * - state: CSRF protection token (must be validated on callback)
 * - code_challenge: PKCE challenge for code exchange security
 * - nonce: OIDC nonce for replay protection
 */
export function getGoogleAuthUrl(
  stateOrReq: string | Request,
  codeChallenge?: string,
  nonce?: string
): string {
  const oauth2Client = createOAuth2Client();
  
  // Get state from either string parameter or request session
  let state: string;
  if (typeof stateOrReq === 'string') {
    state = stateOrReq;
  } else {
    state = (stateOrReq.session as any)?.oauthState;
    if (!state) {
      throw new Error('OAuth state not found in session. Call generateState() first.');
    }
  }

  const authUrlOptions: any = {
    access_type: 'offline',  // Request refresh token
    prompt: 'select_account',  // Change to 'consent' if you need a NEW refresh token
    scope: SCOPES,
    state: state,
    include_granted_scopes: true,  // Enable incremental authorization
  };

  // Add PKCE if code challenge provided
  if (codeChallenge) {
    authUrlOptions.code_challenge = codeChallenge;
    authUrlOptions.code_challenge_method = 'S256';
  }

  // Add nonce for OIDC if provided
  if (nonce) {
    authUrlOptions.nonce = nonce;
  }

  const authUrl = oauth2Client.generateAuthUrl(authUrlOptions);
  console.log(`🔐 Generated auth URL with state: ${state.substring(0, 10)}...`);
  return authUrl;
}

/**
 * Handle OAuth callback from Google
 * 
 * This exchanges the authorization code for access/refresh tokens
 * and fetches the user's profile information
 * 
 * @param code - Authorization code from Google
 * @param storedState - State stored in cookie/session
 * @param receivedState - State received from Google callback
 * @param codeVerifier - PKCE code verifier (optional but recommended)
 * @param expectedNonce - Expected nonce value for OIDC (optional)
 * @returns User profile and tokens
 * 
 * Usage:
 * ```ts
 * const { user, tokens } = await handleGoogleCallback(code, storedState, receivedState, codeVerifier, nonce);
 * ```
 * 
 * Error handling:
 * - Throws if state validation fails (CSRF attack)
 * - Throws if code exchange fails
 * - Throws if user profile fetch fails
 * - Throws if ID token validation fails
 */
export async function handleGoogleCallback(
  code: string,
  storedState: string,
  receivedState: string,
  codeVerifier?: string,
  expectedNonce?: string
): Promise<{
  user: GoogleUserProfile;
  tokens: GoogleTokens;
}>;

/**
 * Handle OAuth callback from Google (Request-based, for backward compatibility)
 * 
 * @param req - Express request with query params (code, state)
 * @returns User profile and tokens
 */
export async function handleGoogleCallback(req: Request): Promise<{
  user: GoogleUserProfile;
  tokens: GoogleTokens;
}>;

// Implementation
export async function handleGoogleCallback(
  codeOrReq: string | Request,
  storedState?: string,
  receivedState?: string,
  codeVerifier?: string,
  expectedNonce?: string
): Promise<{
  user: GoogleUserProfile;
  tokens: GoogleTokens;
}> {
  let code: string;
  let state: string;
  let sessionState: string;
  let verifier: string | undefined;
  let nonce: string | undefined;

  // Handle both function signatures
  if (typeof codeOrReq === 'string') {
    // New signature: (code, storedState, receivedState, codeVerifier?, expectedNonce?)
    code = codeOrReq;
    sessionState = storedState!;
    state = receivedState!;
    verifier = codeVerifier;
    nonce = expectedNonce;
  } else {
    // Old signature: (req) - for backward compatibility
    const req = codeOrReq;
    const { code: queryCode, state: queryState, error } = req.query;

    // Handle OAuth errors from Google
    if (error) {
      throw new Error(`OAuth error from Google: ${error}`);
    }

    // Validate authorization code
    if (!queryCode || typeof queryCode !== 'string') {
      throw new Error('No authorization code provided');
    }

    code = queryCode;
    state = typeof queryState === 'string' ? queryState : '';
    sessionState = (req.session as any)?.oauthState || '';
    verifier = (req.session as any)?.oauthCodeVerifier;
    nonce = (req.session as any)?.oauthNonce;

    // Clear the state from session (one-time use)
    if (req.session) {
      delete (req.session as any).oauthState;
      delete (req.session as any).oauthCodeVerifier;
      delete (req.session as any).oauthNonce;
    }
  }

  // Validate state parameter (CSRF protection)
  if (!sessionState || sessionState !== state) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  const oauth2Client = createOAuth2Client();

  try {
    // Exchange authorization code for tokens (with PKCE if verifier provided)
    console.log('🔄 Exchanging authorization code for tokens...');
    const tokenOptions: any = { code };
    if (verifier) {
      tokenOptions.codeVerifier = verifier;
    }
    
    const { tokens } = await oauth2Client.getToken(tokenOptions);
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    console.log(`✅ Received tokens (has refresh: ${!!tokens.refresh_token})`);

    // Validate ID token if present (preferred over userinfo endpoint)
    let user: GoogleUserProfile;
    if (tokens.id_token) {
      // Prefer ID token for user info (more secure, cryptographically signed)
      user = await validateIdToken(tokens.id_token, nonce);
    } else {
      // Fallback to userinfo endpoint if no ID token
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      user = {
        sub: userInfo.id!,
        email: userInfo.email!,
        email_verified: userInfo.verified_email || false,
        name: userInfo.name!,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        picture: userInfo.picture,
        locale: userInfo.locale,
      };
    }

    console.log(`✅ Authenticated user: ${user.email}`);

    return {
      user,
      tokens: tokens as GoogleTokens,
    };

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * 
 * This should be called when the access token expires
 * Google access tokens typically expire after 1 hour
 * 
 * @param userId - Internal user ID
 * @returns New tokens (access_token will be refreshed)
 * 
 * Usage:
 * ```ts
 * try {
 *   const newTokens = await refreshGoogleAccessToken(userId);
 * } catch (error) {
 *   // Refresh token invalid/expired - user must re-authenticate
 *   redirectToLogin();
 * }
 * ```
 * 
 * Note: If refresh token is invalid/expired, user must re-authenticate
 * Refresh tokens can expire if:
 * - Not used for 6 months
 * - User revokes access
 * - User changes password
 * - Max limit of refresh tokens reached (50 per user per client)
 */
export async function refreshGoogleAccessToken(userId: string): Promise<GoogleTokens> {
  // Sanitize logging - don't expose full user IDs
  console.log(`🔄 Refreshing access token for user ${userId.substring(0, 8)}...`);

  // Get stored tokens
  const session = await tokenStore.getTokens(userId);
  if (!session) {
    throw new Error('No tokens found for user');
  }

  if (!session.tokens.refresh_token) {
    throw new Error('No refresh token available - user must re-authenticate with prompt=consent');
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: session.tokens.refresh_token,
  });

  try {
    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    const newTokens: GoogleTokens = {
      ...session.tokens,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date || undefined,
      // Note: Google doesn't return a new refresh_token on refresh
      // We keep the existing one
    };

    // Update stored tokens
    session.tokens = newTokens;
    session.lastRefreshed = new Date();
    await tokenStore.saveTokens(userId, session);

    // Sanitize logging - don't expose full user IDs
    console.log(`✅ Access token refreshed for user ${userId.substring(0, 8)}...`);
    return newTokens;

  } catch (error) {
    // Sanitize logging - don't expose full user IDs
    console.error(`❌ Failed to refresh token for user ${userId.substring(0, 8)}...:`, error);
    throw new Error('Failed to refresh access token - user must re-authenticate');
  }
}

/**
 * Check if access token is expired or about to expire
 * 
 * @param tokens - Google tokens
 * @param bufferSeconds - Consider token expired this many seconds before actual expiry (default: 300 = 5 minutes)
 * @returns true if token is expired or about to expire
 */
export function isTokenExpired(tokens: GoogleTokens, bufferSeconds: number = 300): boolean {
  if (!tokens.expiry_date) {
    return false; // No expiry info, assume valid
  }

  const expiryTime = tokens.expiry_date;
  const currentTime = Date.now();
  const bufferMs = bufferSeconds * 1000;

  return currentTime >= (expiryTime - bufferMs);
}

/**
 * Get valid access token for user (with automatic refresh if needed)
 * 
 * @param userId - Internal user ID
 * @returns Valid access token
 * 
 * Usage:
 * ```ts
 * const accessToken = await getValidAccessToken(userId);
 * // Use accessToken to make Google API calls
 * ```
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const session = await tokenStore.getTokens(userId);
  if (!session) {
    throw new Error('No session found for user');
  }

  // Check if token is expired or about to expire
  if (isTokenExpired(session.tokens)) {
    console.log(`⏰ Access token expired for user ${userId}, refreshing...`);
    const newTokens = await refreshGoogleAccessToken(userId);
    return newTokens.access_token;
  }

  return session.tokens.access_token;
}

/**
 * Revoke user's tokens (sign out)
 * 
 * This revokes the token with Google AND deletes from local storage
 * 
 * @param userId - Internal user ID
 */
export async function revokeTokens(userId: string): Promise<void> {
  // Sanitize logging - don't expose full user IDs
  console.log(`🔓 Revoking tokens for user ${userId.substring(0, 8)}...`);

  const session = await tokenStore.getTokens(userId);
  if (session && session.tokens.access_token) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(session.tokens);

    try {
      await oauth2Client.revokeCredentials();
      // Sanitize logging - don't expose full user IDs
      console.log(`✅ Revoked tokens with Google for user ${userId.substring(0, 8)}...`);
    } catch (error) {
      console.warn(`⚠️  Failed to revoke tokens with Google:`, error);
      // Continue to delete locally even if Google revocation fails
    }
  }

  // Delete tokens from local storage
  await tokenStore.deleteTokens(userId);
  // Sanitize logging - don't expose full user IDs
  console.log(`✅ Deleted local tokens for user ${userId.substring(0, 8)}...`);
}

// Export token store for external use
export { tokenStore };

