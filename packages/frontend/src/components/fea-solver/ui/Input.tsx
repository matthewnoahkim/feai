/**
 * Input Component
 * Form input with label and validation support
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  ...props 
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-medium text-cad-text"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 text-sm
          bg-white border border-cad-border
          text-cad-text placeholder:text-cad-text-dim/50
          focus:outline-none focus:ring-2 focus:ring-cad-accent/50 focus:border-cad-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-xs text-cad-text-dim">{helperText}</span>
      )}
    </div>
  );
}
