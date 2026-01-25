/**
 * Card Component
 * Container with border and padding
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-cad-border',
    elevated: 'bg-white border border-cad-border shadow-lg',
    bordered: 'bg-gray-50/50 border-2 border-cad-border'
  };
  
  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 border-b border-cad-border bg-gray-50/50 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 border-t border-cad-border bg-gray-50/50 ${className}`}>
      {children}
    </div>
  );
}
