/**
 * Login Page - Google OAuth authentication
 * Simple white/navy blue theme
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PublicLayout } from '../components/PublicLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading, error, signInWithGoogle, setError, clearError } = useAuthStore();

  // Check for error in URL params (from OAuth callback)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Clean up URL
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, setError]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = () => {
    clearError();
    signInWithGoogle();
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col" style={{ background: 'white' }}>
        {/* Navigation */}
        <nav 
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: '1px solid #1a4d8f' }}
        >
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: '#1a4d8f' }}
            >
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FeAI</span>
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-8 py-20">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.75rem' }}>
                Sign In
              </h1>
              <p style={{ fontSize: '1rem', color: '#1a4d8f' }}>
                Continue to FeAI — AI finite element analysis for metamaterial design
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mb-6 p-4"
                style={{ border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1" style={{ color: '#ef4444' }}>
                      Authentication Error
                    </p>
                    <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'white',
                border: '1px solid #1a4d8f',
                color: '#1a4d8f',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#1a4d8f';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#1a4d8f';
                }
              }}
            >
              {isLoading ? (
                <span className="text-sm">Connecting...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium">Sign in with Google</span>
                </>
              )}
            </button>

            <p className="text-xs text-center mt-6" style={{ color: '#1a4d8f' }}>
              By signing in, you agree to our{' '}
              <button 
                onClick={() => navigate('/terms')} 
                style={{ color: '#1a4d8f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                onClick={() => navigate('/privacy')} 
                style={{ color: '#1a4d8f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Privacy Policy
              </button>
            </p>

            {/* Info */}
            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: '#1a4d8f' }}>
                Don't have an account? One will be created automatically when you sign in.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4" style={{ borderTop: '1px solid #1a4d8f' }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#1a4d8f' }}>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '1.125rem', color: '#1a4d8f' }}>FeAI</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/terms')}
                style={{ fontSize: '0.75rem', color: '#1a4d8f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms of Service
              </button>
              <button
                onClick={() => navigate('/privacy')}
                style={{ fontSize: '0.75rem', color: '#1a4d8f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Privacy Policy
              </button>
              <p style={{ fontSize: '0.75rem', color: '#1a4d8f' }}>
  © 2024 FeAI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
