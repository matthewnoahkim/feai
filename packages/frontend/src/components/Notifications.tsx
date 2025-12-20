/**
 * Notifications - Enhanced toast notifications and message panel
 * Academic/scholarly theme styling
 * 
 * Features:
 * - Toast notifications for quick feedback
 * - Expandable message panel for detailed errors
 * - Click to highlight problematic geometry
 * - Auto-dismiss with manual close option
 */

import React, { useEffect, useState, useCallback } from 'react'
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCcw
} from 'lucide-react'
import { useUIStore } from '../store/uiStore'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: {
    bg: 'bg-cad-success',
    border: 'border-cad-success',
    text: 'text-cad-success',
    iconBg: 'bg-white/20'
  },
  error: {
    bg: 'bg-cad-error',
    border: 'border-cad-error',
    text: 'text-cad-error',
    iconBg: 'bg-white/20'
  },
  warning: {
    bg: 'bg-cad-warning',
    border: 'border-cad-warning',
    text: 'text-cad-warning',
    iconBg: 'bg-white/20'
  },
  info: {
    bg: 'bg-cad-accent',
    border: 'border-cad-accent',
    text: 'text-cad-accent',
    iconBg: 'bg-white/20'
  }
}

// Single notification toast
interface ToastProps {
  notification: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    details?: string
    featureId?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  onRemove: (id: string) => void
}

function Toast({ notification, onRemove }: ToastProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = icons[notification.type]
  const color = colors[notification.type]
  
  // Auto-dismiss after 5 seconds for non-errors
  useEffect(() => {
    if (notification.type !== 'error') {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.type, onRemove])
  
  return (
    <div
      className={`
        flex flex-col border shadow-lg overflow-hidden font-sans
        ${color.bg} ${color.border} text-white
        animate-slide-in max-w-sm
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className={`p-1 ${color.iconBg}`}>
          <Icon size={16} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.message}</p>
          
          {notification.details && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs opacity-80 hover:opacity-100 flex items-center gap-1 mt-1"
            >
              Show details <ChevronDown size={12} />
            </button>
          )}
        </div>
        
        <button
          onClick={() => onRemove(notification.id)}
          className="p-1 hover:bg-white/20 flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
      
      {/* Expanded details */}
      {expanded && notification.details && (
        <div className="px-4 py-2 bg-black/20 border-t border-white/10">
          <p className="text-xs opacity-90 whitespace-pre-wrap">{notification.details}</p>
          <button
            onClick={() => setExpanded(false)}
            className="text-xs opacity-80 hover:opacity-100 flex items-center gap-1 mt-2"
          >
            Hide details <ChevronUp size={12} />
          </button>
        </div>
      )}
      
      {/* Action button */}
      {notification.action && (
        <button
          onClick={notification.action.onClick}
          className="px-4 py-2 bg-black/20 border-t border-white/10 text-xs font-medium hover:bg-black/30 flex items-center justify-center gap-1"
        >
          {notification.action.label}
          <ExternalLink size={12} />
        </button>
      )}
    </div>
  )
}

// Main notifications component
export function Notifications() {
  const { notifications, removeNotification } = useUIStore()
  
  if (notifications.length === 0) return null
  
  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}

// Message panel for detailed error display (optional collapsible panel)
interface MessagePanelProps {
  messages: Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    featureId?: string
    timestamp: Date
  }>
  onClear: () => void
  onMessageClick?: (featureId: string) => void
}

export function MessagePanel({ messages, onClear, onMessageClick }: MessagePanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  
  const errorCount = messages.filter(m => m.type === 'error').length
  const warningCount = messages.filter(m => m.type === 'warning').length
  
  if (messages.length === 0) return null
  
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 font-sans">
      <div className="bg-cad-panel border border-cad-border shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-cad-text">Messages</span>
            
            {errorCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-cad-error/10 text-xs text-cad-error">
                <AlertCircle size={12} />
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-cad-warning/10 text-xs text-cad-warning">
                <AlertTriangle size={12} />
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="text-xs text-cad-text-dim hover:text-cad-text"
            >
              Clear all
            </button>
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </div>
        
        {/* Messages list */}
        {isOpen && (
          <div className="max-h-48 overflow-y-auto">
            {messages.map(message => {
              const color = colors[message.type]
              const Icon = icons[message.type]
              
              return (
                <div
                  key={message.id}
                  className={`
                    flex items-start gap-3 px-4 py-3 border-b border-cad-border last:border-b-0
                    ${message.featureId ? 'cursor-pointer hover:bg-gray-50' : ''}
                  `}
                  onClick={() => message.featureId && onMessageClick?.(message.featureId)}
                >
                  <span className={color.text}>
                    <Icon size={16} />
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cad-text">{message.title}</p>
                    <p className="text-xs text-cad-text-dim mt-0.5">{message.description}</p>
                  </div>
                  
                  <span className="text-[10px] text-cad-text-dim">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Inline error indicator for dialogs/inputs
interface InlineErrorProps {
  message: string
  type?: 'error' | 'warning'
}

export function InlineError({ message, type = 'error' }: InlineErrorProps) {
  const color = type === 'error' ? 'text-cad-error' : 'text-cad-warning'
  const Icon = type === 'error' ? AlertCircle : AlertTriangle
  
  return (
    <div className={`flex items-center gap-2 ${color} text-xs mt-1 font-sans`}>
      <Icon size={12} />
      <span>{message}</span>
    </div>
  )
}

// Constraint status indicator
interface ConstraintStatusProps {
  status: 'under-constrained' | 'fully-constrained' | 'over-constrained'
  details?: string
}

export function ConstraintStatus({ status, details }: ConstraintStatusProps) {
  const statusConfig = {
    'under-constrained': {
      color: 'text-cad-accent',
      bg: 'bg-cad-accent/10',
      border: 'border-cad-accent/30',
      label: 'Under-Defined',
      description: 'Sketch needs more constraints or dimensions'
    },
    'fully-constrained': {
      color: 'text-cad-success',
      bg: 'bg-cad-success/10',
      border: 'border-cad-success/30',
      label: 'Fully Defined',
      description: 'All geometry is fully constrained'
    },
    'over-constrained': {
      color: 'text-cad-error',
      bg: 'bg-cad-error/10',
      border: 'border-cad-error/30',
      label: 'Over-Constrained',
      description: 'Conflicting constraints detected'
    }
  }
  
  const config = statusConfig[status]
  
  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 border ${config.bg} ${config.border} font-sans`}
      title={details || config.description}
    >
      <span className={`w-2 h-2 ${config.bg} ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  )
}

export default Notifications
