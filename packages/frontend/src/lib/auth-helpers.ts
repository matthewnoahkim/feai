import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/**
 * Get the authenticated user from the session.
 * Returns the user if authenticated, null otherwise.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  };
}

/**
 * Require authentication for an API route.
 * Returns the user if authenticated, or a 401 response.
 */
export async function requireAuth(): Promise<
  { user: AuthenticatedUser; error: null } | 
  { user: null; error: NextResponse }
> {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      ),
    };
  }
  
  return { user, error: null };
}

/**
 * Standard error responses for API routes
 */
export const ApiErrors = {
  unauthorized: () => NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
    { status: 401 }
  ),
  
  forbidden: () => NextResponse.json(
    { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
    { status: 403 }
  ),
  
  notFound: (resource: string = 'Resource') => NextResponse.json(
    { success: false, error: { code: 'NOT_FOUND', message: `${resource} not found` } },
    { status: 404 }
  ),
  
  badRequest: (message: string) => NextResponse.json(
    { success: false, error: { code: 'BAD_REQUEST', message } },
    { status: 400 }
  ),
  
  internal: (message: string = 'Internal server error') => NextResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 }
  ),
};
