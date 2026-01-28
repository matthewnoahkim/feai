import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AuthCallbackPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Not authenticated, redirect to login
    redirect('/login');
  }

  // Authenticated, redirect to dashboard
  redirect('/dashboard');
}
