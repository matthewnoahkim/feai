/**
 * Authentication Store
 * Manages user authentication state with Zustand
 * Rebuilt for better reliability and error handling
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      /**
       * Initiates Google OAuth sign-in flow
       * Redirects to backend OAuth endpoint
       */
      signInWithGoogle: () => {
        set({ isLoading: true, error: null });

        try {
          // Full page redirect to OAuth endpoint
          // This bypasses React Router and ensures proper OAuth flow
          const authUrl = `${window.location.origin}/auth/google`;
          console.log('🔐 Redirecting to:', authUrl);
          window.location.href = authUrl;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initiate sign in';
          console.error('❌ Sign in error:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      /**
       * Signs out the current user
       * Clears local storage and state
       */
      signOut: async () => {
        const token = getAuthToken();

        if (token) {
          try {
            // Notify backend of sign out
            await fetch('/auth/signout', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } catch (error) {
            console.warn('Failed to notify backend of sign out:', error);
            // Continue with local sign out even if backend call fails
          }
        }

        // Clear local storage and state
        localStorage.removeItem('auth_token');
        set({ user: null, error: null, isLoading: false });
        console.log('👋 Signed out successfully');
      },

      /**
       * Sets the current user
       */
      setUser: (user) => {
        set({ user, isLoading: false, error: null });
      },

      /**
       * Sets an error message
       */
      setError: (error) => {
        set({ error, isLoading: false });
      },

      /**
       * Clears the current error
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'feai-auth-storage',
      // Only persist user data, not loading/error states
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

/**
 * Get the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Set the authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove the authentication token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Make an authenticated API request
 * Automatically includes the auth token in headers
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Token is invalid or expired, clear auth state
    removeAuthToken();
    useAuthStore.getState().setUser(null);
    throw new Error('Session expired. Please sign in again.');
  }

  return response;
}

/**
 * Verify the current auth token is still valid
 * Returns user data if valid, null otherwise
 */
export async function verifyAuthToken(): Promise<User | null> {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetchWithAuth('/auth/me');

    if (!response.ok) {
      removeAuthToken();
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data as User;
    }

    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    removeAuthToken();
    return null;
  }
}
