/**
 * App - Main application with routing
 */

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage, LoginPage, AuthCallbackPage, DashboardPage, EditorPage } from './pages'
import { useAuthStore } from './store/authStore'

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Editor - can be accessed without auth for demo, with auth for saved projects */}
        <Route path="/editor" element={<EditorPage />} />
        <Route 
          path="/editor/:projectId" 
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
