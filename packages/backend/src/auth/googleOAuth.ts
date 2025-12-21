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
import { randomBytes } from 'crypto';
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
    console.log(`💾 Saved tokens for user ${userId} (Google ID: ${session.googleId})`);
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
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 
  `${process.env.BASE_URL || 'http://localhost:3001'}/auth/google/callback`;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set');
  console.warn('⚠️  OAuth will not work until these are configured');
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

// ============================================================================
// OAuth Flow Functions
// ============================================================================

/**
 * Generate Google OAuth authorization URL
 * 
 * This creates the URL to redirect users to Google's consent screen
 * 
 * @param req - Express request (must have session with state)
 * @returns Authorization URL
 * 
 * Usage:
 * ```ts
 * const authUrl = getGoogleAuthUrl(req);
 * res.redirect(authUrl);
 * ```
 * 
 * Important parameters:
 * - access_type=offline: Request refresh token for offline access
 * - prompt=consent: Force consent screen (required for refresh tokens)
 *   - Only use this on first login or when you need a NEW refresh token
 *   - Otherwise, use prompt=select_account or omit it
 * - state: CSRF protection token (must be validated on callback)
 */
export function getGoogleAuthUrl(req: Request): string {
  const oauth2Client = createOAuth2Client();
  
  // Get state from session (should be set by the route handler)
  const state = (req.session as any)?.oauthState;
  
  if (!state) {
    throw new Error('OAuth state not found in session. Call generateState() first.');
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',  // Request refresh token
    
    /**
     * prompt parameter controls the consent screen behavior:
     * 
     * - 'consent': ALWAYS show consent screen
     *   Use this: First time login, or when you need a NEW refresh token
     *   Note: Google only returns refresh_token when user consents
     * 
     * - 'select_account': Let user select which Google account to use
     *   Use this: For subsequent logins when you already have a refresh token
     * 
     * - 'none': Don't show any UI, fail if not already authorized
     *   Use this: When you want silent auth (rarely needed)
     * 
     * Best practice: Use 'consent' only when needed, otherwise use 'select_account'
     */
    prompt: 'select_account',  // Change to 'consent' if you need a NEW refresh token
    
    scope: SCOPES,
    state: state,
    
    // Additional recommended parameters
    include_granted_scopes: true,  // Enable incremental authorization
  });

  console.log(`🔐 Generated auth URL with state: ${state.substring(0, 10)}...`);
  return authUrl;
}

/**
 * Handle OAuth callback from Google
 * 
 * This exchanges the authorization code for access/refresh tokens
 * and fetches the user's profile information
 * 
 * @param req - Express request with query params (code, state)
 * @returns User profile and tokens
 * 
 * Usage:
 * ```ts
 * const { user, tokens } = await handleGoogleCallback(req);
 * ```
 * 
 * Error handling:
 * - Throws if state validation fails (CSRF attack)
 * - Throws if code exchange fails
 * - Throws if user profile fetch fails
 */
export async function handleGoogleCallback(req: Request): Promise<{
  user: GoogleUserProfile;
  tokens: GoogleTokens;
}> {
  const { code, state, error } = req.query;

  // Handle OAuth errors from Google
  if (error) {
    throw new Error(`OAuth error from Google: ${error}`);
  }

  // Validate authorization code
  if (!code || typeof code !== 'string') {
    throw new Error('No authorization code provided');
  }

  // Validate state parameter (CSRF protection)
  const sessionState = (req.session as any)?.oauthState;
  if (!sessionState || sessionState !== state) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  // Clear the state from session (one-time use)
  delete (req.session as any).oauthState;

  const oauth2Client = createOAuth2Client();

  try {
    // Exchange authorization code for tokens
    console.log('🔄 Exchanging authorization code for tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No access token received from Google');
    }

    console.log(`✅ Received tokens (has refresh: ${!!tokens.refresh_token})`);

    // Set credentials on client for API calls
    oauth2Client.setCredentials(tokens);

    // Fetch user profile using the access token
    console.log('👤 Fetching user profile...');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    const user: GoogleUserProfile = {
      sub: userInfo.id!,
      email: userInfo.email!,
      email_verified: userInfo.verified_email || false,
      name: userInfo.name!,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      picture: userInfo.picture,
      locale: userInfo.locale,
    };

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
  console.log(`🔄 Refreshing access token for user: ${userId}`);

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

    console.log(`✅ Access token refreshed for user: ${userId}`);
    return newTokens;

  } catch (error) {
    console.error(`❌ Failed to refresh token for user ${userId}:`, error);
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
  console.log(`🔓 Revoking tokens for user: ${userId}`);

  const session = await tokenStore.getTokens(userId);
  if (session && session.tokens.access_token) {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(session.tokens);

    try {
      await oauth2Client.revokeCredentials();
      console.log(`✅ Revoked tokens with Google for user: ${userId}`);
    } catch (error) {
      console.warn(`⚠️  Failed to revoke tokens with Google:`, error);
      // Continue to delete locally even if Google revocation fails
    }
  }

  // Delete tokens from local storage
  await tokenStore.deleteTokens(userId);
  console.log(`✅ Deleted local tokens for user: ${userId}`);
}

// Export token store for external use
export { tokenStore };

