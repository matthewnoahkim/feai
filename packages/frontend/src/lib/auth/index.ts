/**
 * Auth: NextAuth config and API auth helpers.
 * Use: import { authOptions, requireAuth, ApiErrors } from '@/lib/auth'
 */

export { authOptions } from './config';
export {
  getAuthenticatedUser,
  requireAuth,
  ApiErrors,
  type AuthenticatedUser,
} from './helpers';
