import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

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

export const ApiErrors = {
  unauthorized: () =>
    NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    ),

  forbidden: () =>
    NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
      { status: 403 }
    ),

  notFound: (resource: string = 'Resource') =>
    NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: `${resource} not found` } },
      { status: 404 }
    ),

  badRequest: (message: string) =>
    NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message } },
      { status: 400 }
    ),

  internal: (message: string = 'Internal server error') =>
    NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    ),
};
