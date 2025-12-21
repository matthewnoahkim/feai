/**
 * Auth Store - Google OAuth authentication state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Actions
  signInWithGoogle: () => Promise<void>
  signOut: () => void
  setUser: (user: User | null) => void
  setError: (error: string | null) => void
}

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null })
        
        try {
          // Open Google OAuth popup
          const width = 500
          const height = 600
          const left = window.screenX + (window.outerWidth - width) / 2
          const top = window.screenY + (window.outerHeight - height) / 2
          
          const popup = window.open(
            `${API_URL}/auth/google`,
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top}`
          )
          
          if (!popup) {
            throw new Error('Popup blocked. Please allow popups for this site.')
          }
          
          // Listen for auth callback message
          const handleMessage = (event: MessageEvent) => {
            if (event.origin !== API_URL) return
            
            if (event.data.type === 'AUTH_SUCCESS') {
              const { user, token } = event.data
              
              // Store token for API requests
              localStorage.setItem('auth_token', token)
              
              set({ user, isLoading: false })
              window.removeEventListener('message', handleMessage)
            } else if (event.data.type === 'AUTH_ERROR') {
              set({ error: event.data.error, isLoading: false })
              window.removeEventListener('message', handleMessage)
            }
          }
          
          window.addEventListener('message', handleMessage)
          
          // Check if popup was closed without completing auth
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              if (get().isLoading) {
                set({ isLoading: false })
                window.removeEventListener('message', handleMessage)
              }
            }
          }, 500)
          
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Sign in failed', 
            isLoading: false 
          })
        }
      },

      signOut: () => {
        localStorage.removeItem('auth_token')
        set({ user: null, error: null })
      },

      setUser: (user) => set({ user }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'feai-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Helper to get auth token for API requests
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

// Helper to make authenticated API requests
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken()
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  })
}

