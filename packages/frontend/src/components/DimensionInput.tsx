/**
 * DimensionInput - Inline dimension value editor
 * Appears when placing/editing dimensions in sketch mode
 */

import React, { useState, useEffect, useRef } from 'react'
import { Check, X, Lock, LockOpen } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

interface DimensionInputProps {
  initialValue?: number
  position: { x: number; y: number }
  isDriving: boolean
  onSubmit: (value: number, isDriving: boolean) => void
  onCancel: () => void
}

export function DimensionInput({ 
  initialValue = 0, 
  position, 
  isDriving,
  onSubmit, 
  onCancel 
}: DimensionInputProps) {
  const [value, setValue] = useState(initialValue.toString())
  const [localIsDriving, setLocalIsDriving] = useState(isDriving)
  const inputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    // Focus input when mounted
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])
  
  const handleSubmit = () => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      onSubmit(numValue, localIsDriving)
    } else {
      onCancel()
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }
  
  return (
    <div
      className="absolute z-50 bg-white border-2 border-cad-accent shadow-lg"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        marginTop: -8
      }}
    >
      <div className="flex items-center gap-1 p-2">
        {/* Driving/Reference toggle */}
        <button
          onClick={() => setLocalIsDriving(!localIsDriving)}
          className={`p-1 rounded transition-colors ${
            localIsDriving 
              ? 'bg-cad-accent text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}
          title={localIsDriving ? 'Driving (controls geometry)' : 'Reference (reports value)'}
        >
          {localIsDriving ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>
        
        {/* Value input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1 text-sm font-mono border border-cad-border focus:outline-none focus:border-cad-accent"
          placeholder="0.0"
        />
        
        <span className="text-xs text-cad-text-dim">mm</span>
        
        {/* Confirm button */}
        <button
          onClick={handleSubmit}
          className="p-1 bg-green-500 text-white hover:bg-green-600 transition-colors rounded"
          title="Apply (Enter)"
        >
          <Check size={14} />
        </button>
        
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="p-1 bg-red-500 text-white hover:bg-red-600 transition-colors rounded"
          title="Cancel (Esc)"
        >
          <X size={14} />
        </button>
      </div>
      
      {/* Help text */}
      <div className="px-2 pb-2 pt-0 text-[10px] text-cad-text-dim border-t border-gray-200">
        {localIsDriving ? (
          <span className="text-green-700">
            <Lock size={10} className="inline" /> Driving: Will adjust geometry
          </span>
        ) : (
          <span className="text-gray-600">
            <LockOpen size={10} className="inline" /> Reference: Reports current value
          </span>
        )}
      </div>
    </div>
  )
}

