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

import React, { useEffect, useState } from 'react'
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
