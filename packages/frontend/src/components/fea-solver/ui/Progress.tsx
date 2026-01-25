/**
 * Progress Component
 * Progress bar with percentage display
 */

import React from 'react';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({ 
  value, 
  className = '', 
  variant = 'default',
  showLabel = false,
  size = 'md'
}: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  const variantStyles = {
    default: 'bg-cad-accent',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };
  
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 overflow-hidden ${sizeStyles[size]}`}>
        <div 
          className={`h-full transition-all duration-300 ease-out ${variantStyles[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-cad-text-dim mt-1">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
    </div>
  );
}
