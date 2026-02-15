import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * NextAuth catch-all route. Handles:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/callback/google (OAuth callback — must exist in production)
 * - /api/auth/signout, /api/auth/session, /api/auth/csrf, etc.
 * Production callback URL: https://feai.app/api/auth/callback/google
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
