/**
 * Auth Callback Page
 * Handles OAuth redirect and completes authentication
 * Minimalistic design matching the navy/white theme
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore, setAuthToken } from '../store/authStore';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setError } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for errors from OAuth callback
        const error = searchParams.get('error');
        if (error) {
          const decodedError = decodeURIComponent(error);
          console.error('❌ OAuth callback error:', decodedError);
          setStatus('error');
          setMessage(decodedError);
          setError(decodedError);
          
          // Redirect to login after delay
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        // Extract authentication data from URL params
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const photoURL = searchParams.get('photoURL');

        // Validate required parameters
        if (!token) {
          throw new Error('No authentication token received');
        }

        if (!userId || !email || !name) {
          throw new Error('Incomplete user information received');
        }

        console.log('✅ Authentication successful for:', email);

        // Store authentication token
        setAuthToken(token);

        // Update user state
        setUser({
          id: userId,
          email: email,
          name: name,
          photoURL: photoURL || undefined,
        });

        setStatus('success');
        setMessage('Sign in successful! Redirecting...');

        // Clean up URL to remove sensitive data
        window.history.replaceState({}, '', '/auth/callback');

        // Redirect to dashboard with longer delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000); // Increased from 1000ms to 2000ms
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        console.error('❌ Auth callback error:', errorMessage);
        
        setStatus('error');
        setMessage(errorMessage);
        setError(errorMessage);

        // Redirect to login after delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, setUser, setError, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <div className="max-w-md w-full">
        <div className="border-2 border-cad-border p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center bg-cad-accent">
              <span className="text-white font-serif font-bold text-2xl">F</span>
            </div>
          </div>

          {/* Status Content */}
          {status === 'processing' && (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block w-8 h-8 border-2 border-cad-accent border-t-transparent animate-spin" />
              </div>
              <h2 className="font-serif text-xl text-cad-text mb-2">
                Processing Sign In
              </h2>
              <p className="font-sans text-sm text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="inline-block w-12 h-12 text-cad-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-serif text-xl text-cad-text mb-2">
                Welcome!
              </h2>
              <p className="font-sans text-sm text-gray-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="inline-block w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-serif text-xl text-cad-text mb-2">
                Authentication Failed
              </h2>
              <p className="font-sans text-sm text-gray-600 mb-3">{message}</p>
              <p className="font-sans text-xs text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
