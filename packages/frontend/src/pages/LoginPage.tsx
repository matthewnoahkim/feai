/**
 * Login Page - Google OAuth authentication
 * Minimalistic design matching the navy/white theme
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-cad-border">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-cad-accent">
            <span className="text-white font-serif font-bold text-sm">F</span>
          </div>
          <span className="font-serif font-semibold text-cad-text text-lg">FeAI</span>
        </button>
        
        <a
          href="/"
          className="text-sm text-cad-text hover:text-cad-accent-hover font-sans no-underline"
        >
          Back to Home
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl text-cad-text mb-3">
              Sign In
            </h1>
            <p className="font-sans text-base text-gray-600">
              Continue to FeAI with your Google account
            </p>
          </div>

          {/* Sign In Box */}
          <div className="border-2 border-cad-border p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 border border-red-600 bg-red-50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-sans text-sm text-red-800 font-semibold mb-1">
                      Authentication Error
                    </p>
                    <p className="font-sans text-sm text-red-700">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800 ml-4"
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
              className="w-full flex items-center justify-center px-6 py-3 bg-white border-2 border-cad-border text-cad-text hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="font-sans text-sm">Connecting...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="font-sans text-sm">Sign in with Google</span>
                </>
              )}
            </button>

            <p className="font-sans text-xs text-gray-500 text-center mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="font-sans text-sm text-gray-600">
              Don't have an account? One will be created automatically when you sign in.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-cad-border">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-sans text-xs text-gray-500">
            © 2024 FeAI. Open source under MIT license.
          </p>
        </div>
      </footer>
    </div>
  );
}
