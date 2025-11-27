import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen bg-cad-darker text-cad-text overflow-hidden">
      {children}
    </div>
  )
}

