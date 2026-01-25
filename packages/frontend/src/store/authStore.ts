/**
 * Auth Store - Manages authentication state
 * Uses Zustand for state management
 */

import { create } from 'zustand'

export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  
  // Actions
  checkAuthStatus: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true, // Start as loading to check auth on mount
  isAuthenticated: false,
  error: null,
  
  /**
   * Check current authentication status
   * Called on app mount to restore session
   */
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch('/api/auth/status', {
        credentials: 'include', // Include cookies
      })
      
      const result = await response.json()
      
      if (result.success && result.data.authenticated) {
        set({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status',
      })
    }
  },
  
  /**
   * Logout the user
   */
  logout: async () => {
    try {
      set({ isLoading: true })
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear local state even if server request fails
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
  
  clearError: () => set({ error: null }),
}))
