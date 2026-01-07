/**
 * PublicLayout - Wrapper component for public pages with scoped dark theme
 * This ensures the dark theme only applies to public pages and doesn't affect private/auth areas
 */

import React from 'react'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-theme">
      {children}
    </div>
  )
}

