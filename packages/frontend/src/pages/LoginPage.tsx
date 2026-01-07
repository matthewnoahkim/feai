/**
 * Login Page - Google OAuth authentication
 * Dark-first modern developer tool theme
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
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--public-bg)' }}>
      {/* Navigation */}
      <nav 
        className="flex items-center justify-between px-8 py-6"
        style={{ 
          borderBottom: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
          style={{ 
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity var(--public-transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <div 
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: 'var(--public-accent)' }}
          >
            <span style={{ color: 'var(--public-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--public-text-primary)' }}>FeAI</span>
        </button>
        
        {/* Invisible spacer to match HomePage nav height */}
        <button 
          className="px-4 py-2 text-sm font-sans bg-transparent opacity-0 cursor-default border border-transparent leading-none"
          style={{ color: 'var(--public-text-primary)' }}
        >
          Spacer
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              style={{ 
                fontSize: '3rem', 
                fontWeight: 700, 
                color: 'var(--public-text-primary)', 
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em'
              }}
            >
              Sign In
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--public-text-secondary)' }}>
              Continue to FeAI with your Google account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4"
              style={{ 
                border: '1px solid #ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--public-radius-md)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p 
                    className="font-sans text-sm font-semibold mb-1"
                    style={{ color: '#fca5a5' }}
                  >
                    Authentication Error
                  </p>
                  <p className="font-sans text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
                <button
                  onClick={clearError}
                  style={{
                    color: '#fca5a5',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                    transition: 'color var(--public-transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#fca5a5'}
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
            className="w-full flex items-center justify-center gap-3 px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--public-surface)',
              border: '1px solid var(--public-border)',
              color: 'var(--public-text-primary)',
              borderRadius: 'var(--public-radius-md)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all var(--public-transition-fast)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--public-bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--public-accent)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--public-surface)';
                e.currentTarget.style.borderColor = 'var(--public-border)';
              }
            }}
          >
            {isLoading ? (
              <span className="font-sans text-sm" style={{ color: 'var(--public-text-primary)' }}>Connecting...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="font-sans text-sm font-medium" style={{ color: 'var(--public-text-primary)' }}>Sign in with Google</span>
              </>
            )}
          </button>

          <p className="font-sans text-xs text-center mt-6" style={{ color: 'var(--public-text-tertiary)' }}>
            By signing in, you agree to our{' '}
            <button 
              onClick={() => navigate('/terms')} 
              style={{
                color: 'var(--public-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button 
              onClick={() => navigate('/privacy')} 
              style={{
                color: 'var(--public-accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Privacy Policy
            </button>
          </p>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="font-sans text-sm" style={{ color: 'var(--public-text-secondary)' }}>
              Don't have an account? One will be created automatically when you sign in.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="px-8 py-4"
        style={{ 
          borderTop: '1px solid var(--public-border)',
          background: 'var(--public-bg)'
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 flex items-center justify-center"
              style={{ background: 'var(--public-accent)' }}
            >
              <span style={{ color: 'var(--public-text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>F</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--public-text-primary)' }}>FeAI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/terms')}
              style={{
                fontSize: '0.75rem',
                color: 'var(--public-text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--public-transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-tertiary)'}
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              style={{
                fontSize: '0.75rem',
                color: 'var(--public-text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--public-transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--public-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--public-text-tertiary)'}
            >
              Privacy Policy
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--public-text-tertiary)' }}>
              © 2024 FeAI. Open source under MIT license.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </PublicLayout>
  );
}
