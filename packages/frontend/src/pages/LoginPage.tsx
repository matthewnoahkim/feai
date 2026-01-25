/**
 * Login Page - Google OAuth authentication
 * Minimalist design matching the app aesthetic
 */

import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Google "G" logo SVG
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore()
  
  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])
  
  // Get error from URL params (set by backend callback)
  const error = searchParams.get('error')
  
  const getErrorMessage = (errorCode: string | null): string | null => {
    switch (errorCode) {
      case 'oauth_denied':
        return 'You cancelled the sign-in process.'
      case 'invalid_state':
        return 'Security validation failed. Please try again.'
      case 'auth_failed':
        return 'Authentication failed. Please try again.'
      case 'missing_code':
        return 'Invalid response from Google. Please try again.'
      default:
        return errorCode ? 'An error occurred. Please try again.' : null
    }
  }
  
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = '/api/auth/google'
  }
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cad-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  const errorMessage = getErrorMessage(error)
  
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
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-cad-accent">
              <span className="text-white font-serif font-bold text-2xl">F</span>
            </div>
            <h1 className="font-serif text-2xl text-cad-text mb-2">
              Welcome to FeAI
            </h1>
            <p className="font-sans text-sm text-gray-600">
              Sign in to access your projects and start designing
            </p>
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 px-4 py-3 border border-red-300 bg-red-50 text-red-700 text-sm font-sans">
              {errorMessage}
            </div>
          )}
          
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-cad-border bg-white hover:bg-gray-50 transition-colors font-sans text-sm text-cad-text"
          >
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>
          
          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-cad-border" />
            <span className="text-xs text-gray-500 font-sans">or</span>
            <div className="flex-1 h-px bg-cad-border" />
          </div>
          
          {/* Guest Access */}
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 text-sm font-sans text-cad-text border border-cad-border hover:bg-gray-50 transition-colors"
          >
            Explore without signing in
          </button>
          
          {/* Terms */}
          <p className="mt-8 text-center text-xs text-gray-500 font-sans">
            By signing in, you agree to our{' '}
            <button 
              onClick={() => navigate('/terms')}
              className="underline hover:text-cad-accent"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button 
              onClick={() => navigate('/privacy')}
              className="underline hover:text-cad-accent"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-500 font-sans">
          © 2026 FeAI. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
