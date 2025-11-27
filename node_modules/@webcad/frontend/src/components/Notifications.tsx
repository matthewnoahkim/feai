/**
 * Notifications - Toast notifications display
 */

import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: 'bg-green-600 border-green-500',
  error: 'bg-red-600 border-red-500',
  warning: 'bg-yellow-600 border-yellow-500',
  info: 'bg-blue-600 border-blue-500'
}

export function Notifications() {
  const { notifications, removeNotification } = useUIStore()
  
  if (notifications.length === 0) return null
  
  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2">
      {notifications.map(notification => {
        const Icon = icons[notification.type]
        return (
          <div
            key={notification.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
              ${colors[notification.type]} text-white
              animate-slide-in
            `}
            style={{
              animation: 'slideIn 0.2s ease-out'
            }}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 p-1 hover:bg-white/20 rounded"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
      
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
      `}</style>
    </div>
  )
}

