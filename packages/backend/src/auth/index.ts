/**
 * Authentication Module
 * Exports all auth-related functionality
 */

export { getAuthConfig, loadAuthConfig } from './config';
export { authRouter } from './routes';
export { requireAuth, optionalAuth, SESSION_COOKIE_NAME, STATE_COOKIE_NAME } from './middleware';
export {
  generateStateToken,
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  verifyIdToken,
  extractUserProfile,
  findOrCreateUser,
  generateSessionToken,
  verifySessionToken,
  type GoogleUserProfile,
  type AuthTokens,
  type SessionUser,
} from './service';
