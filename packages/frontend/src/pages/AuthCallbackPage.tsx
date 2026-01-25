/**
 * Auth Callback Page
 * Handles OAuth redirect and completes authentication
 * Simple white/navy blue theme
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PublicLayout } from '../components/PublicLayout';

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

        // Extract user data from URL params (token is now in httpOnly cookie)
        const userId = searchParams.get('userId');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const photoURL = searchParams.get('photoURL');

        // Validate required parameters
        if (!userId || !email || !name) {
          throw new Error('Incomplete user information received');
        }

        console.log('✅ Authentication successful for:', email);

        // Token is now in httpOnly cookie, automatically sent with requests
        // No need to store in localStorage

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
        }, 2000);
        
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
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: 'white' }}>
        <div className="max-w-md w-full">
          <div 
            className="p-12"
            style={{ 
              border: '1px solid #1a4d8f',
              background: 'white'
            }}
          >
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div 
                className="w-16 h-16 flex items-center justify-center"
                style={{ background: '#1a4d8f' }}
              >
                <span style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>F</span>
              </div>
            </div>

            {/* Status Content */}
            {status === 'processing' && (
              <div className="text-center">
                <div className="mb-4">
                  <div 
                    className="inline-block w-8 h-8 border-2 border-t-transparent animate-spin"
                    style={{ 
                      borderColor: '#1a4d8f',
                      borderTopColor: 'transparent',
                      borderRadius: '50%'
                    }}
                  />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.5rem' }}>
                  Processing Sign In
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#1a4d8f' }}>{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="inline-block w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="#1a4d8f">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.5rem' }}>
                  Welcome!
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#1a4d8f' }}>{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="mb-4">
                  <svg className="inline-block w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a4d8f', marginBottom: '0.5rem' }}>
                  Authentication Failed
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#1a4d8f', marginBottom: '0.75rem' }}>{message}</p>
                <p style={{ fontSize: '0.75rem', color: '#1a4d8f' }}>
                  Redirecting to login page...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
