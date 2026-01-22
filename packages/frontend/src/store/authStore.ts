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
        try {
          // Notify backend of sign out (cookie will be cleared server-side)
          await fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include', // Include auth cookie
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Failed to notify backend of sign out:', error);
          // Continue with local sign out even if backend call fails
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
 * NOTE: Token is now stored in httpOnly cookie, not accessible from JS
 * This function is kept for backward compatibility but returns null
 */
export function getAuthToken(): string | null {
  // Token is in httpOnly cookie, not accessible from JavaScript
  // This is intentional for security (prevents XSS attacks)
  return null;
}

/**
 * Set the authentication token in localStorage
 * NOTE: Token is now set server-side in httpOnly cookie
 * This function is kept for backward compatibility but does nothing
 */
export function setAuthToken(token: string): void {
  // No-op: token is set server-side in httpOnly cookie
  // This function kept for backward compatibility
}

/**
 * Remove the authentication token from localStorage
 * NOTE: Token is cleared server-side via /auth/logout endpoint
 */
export function removeAuthToken(): void {
  // Token is in httpOnly cookie, cleared server-side
  // This function kept for backward compatibility
}

/**
 * Make an authenticated API request
 * Automatically includes the auth token from httpOnly cookie
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include httpOnly auth cookie
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      // Note: Token is in cookie, not Authorization header
      // Backend middleware will read from cookie first, then fall back to Authorization header
    },
  });

  // Handle authentication errors
  if (response.status === 401) {
    // Token is invalid or expired, clear auth state
    useAuthStore.getState().setUser(null);
    throw new Error('Session expired. Please sign in again.');
  }

  return response;
}

/**
 * Verify the current auth token is still valid
 * Returns user data if valid, null otherwise
 * Token is read from httpOnly cookie automatically
 */
export async function verifyAuthToken(): Promise<User | null> {
  try {
    const response = await fetchWithAuth('/auth/me');

    if (!response.ok) {
      useAuthStore.getState().setUser(null);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.user) {
      return data.user as User;
    }

    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    useAuthStore.getState().setUser(null);
    return null;
  }
}
