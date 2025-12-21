/**
 * Login Page - Google OAuth authentication
 * Minimalistic design matching the theme
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, signInWithGoogle, error } = useAuthStore()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      console.error('Sign in failed:', err)
    }
  }

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
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl text-cad-text mb-3">
              Welcome
            </h1>
            <p className="font-sans text-sm text-gray-600">
              Sign in to access your projects and designs.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 border border-red-300 bg-red-50 text-red-700 text-sm font-sans">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-cad-border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-cad-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-sans text-sm text-cad-text">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Terms */}
          <p className="mt-8 text-center font-sans text-xs text-gray-500 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-cad-accent underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-cad-accent underline">Privacy Policy</a>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-cad-border">
        <div className="text-center">
          <p className="font-sans text-xs text-gray-500">
            © 2024 FeAI. Open source under MIT license.
          </p>
        </div>
      </footer>
    </div>
  )
}

