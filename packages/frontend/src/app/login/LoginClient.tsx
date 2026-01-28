'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#1a4d8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ color: '#1a4d8f' }}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%231a4d8f' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          opacity: 0.03,
          zIndex: 0,
        }}
      />

      {/* Header */}
      <nav 
        className="flex items-center justify-between px-8 py-6 relative z-10"
        style={{ borderBottom: '1px solid #1a4d8f', background: 'white' }}
      >
        <a href="/" className="flex items-center gap-2 no-underline">
          <div 
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: '#1a4d8f' }}
          >
            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FeAI</span>
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div 
            className="p-8"
            style={{ border: '1px solid #1a4d8f', background: 'white' }}
          >
            <div className="text-center mb-8">
              <h1 
                className="mb-2"
                style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 300,
                  fontFamily: 'Georgia, serif',
                }}
              >
                Welcome to <span style={{ fontWeight: 600 }}>FeAI</span>
              </h1>
              <p style={{ fontSize: '0.95rem', opacity: 0.8 }}>
                Sign in to access your projects
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mb-6 p-4 text-center"
                style={{ 
                  background: '#fef2f2', 
                  border: '1px solid #ef4444',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                }}
              >
                {error === 'OAuthSignin' && 'Error starting sign in process.'}
                {error === 'OAuthCallback' && 'Error during authentication callback.'}
                {error === 'OAuthCreateAccount' && 'Error creating account.'}
                {error === 'Callback' && 'Error during callback.'}
                {error === 'Default' && 'An error occurred. Please try again.'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback', 'Default'].includes(error) && 
                  'An error occurred. Please try again.'}
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 transition-all"
              style={{
                border: '1px solid #1a4d8f',
                background: 'white',
                color: '#1a4d8f',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1a4d8f';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#1a4d8f';
              }}
            >
              {/* Google Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div style={{ flex: 1, height: '1px', background: '#1a4d8f', opacity: 0.2 }} />
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#1a4d8f', opacity: 0.2 }} />
            </div>

            {/* Continue without account */}
            <a
              href="/dashboard"
              className="block w-full text-center py-3 no-underline transition-all"
              style={{
                color: '#1a4d8f',
                fontSize: '0.875rem',
                opacity: 0.7,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              Continue without an account →
            </a>
          </div>

          {/* Terms */}
          <p 
            className="mt-6 text-center"
            style={{ fontSize: '0.75rem', opacity: 0.6 }}
          >
            By signing in, you agree to our{' '}
            <a href="/terms" style={{ color: '#1a4d8f' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: '#1a4d8f' }}>Privacy Policy</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="px-8 py-4 text-center relative z-10"
        style={{ borderTop: '1px solid #1a4d8f', background: 'white' }}
      >
        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>© 2024 FeAI</span>
      </footer>
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#1a4d8f] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
