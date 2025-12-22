/**
 * ChatMessage Component - Displays a single chat message with optional actions
 * Clean design (no bubbles)
 */

import React from 'react'
import {
  User,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Play
} from 'lucide-react'
import { ChatMessage as ChatMessageType, CadAction } from '../../store/chatStore'

interface ChatMessageProps {
  message: ChatMessageType
  onRetry?: () => void
}

function ActionItem({ action, index }: { action: CadAction; index: number }) {
  const getStatusIcon = () => {
    switch (action.status) {
      case 'success':
        return <CheckCircle size={14} className="text-cad-success" />
      case 'error':
        return <XCircle size={14} className="text-cad-error" />
      case 'executing':
        return <Loader2 size={14} className="text-cad-accent animate-spin" />
      default:
        return <Play size={14} className="text-cad-text-dim" />
    }
  }
  
  const getStatusClass = () => {
    switch (action.status) {
      case 'success':
        return 'border-cad-success/30 bg-cad-success/5'
      case 'error':
        return 'border-cad-error/30 bg-cad-error/5'
      case 'executing':
        return 'border-cad-accent/30 bg-cad-accent/5'
      default:
        return 'border-cad-border bg-gray-50'
    }
  }
  
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 border ${getStatusClass()} text-xs font-sans`}>
      {getStatusIcon()}
      <span className="flex-1 truncate">{action.description}</span>
      <span className="text-cad-text-dim font-mono text-[10px]">{action.method}</span>
    </div>
  )
}

function ActionsDisplay({ actions }: { actions: CadAction[] }) {
  const [expanded, setExpanded] = React.useState(true)
  
  if (actions.length === 0) return null
  
  const successCount = actions.filter(a => a.status === 'success').length
  const errorCount = actions.filter(a => a.status === 'error').length
  
  return (
    <div className="mt-2 pt-2 border-t border-cad-border/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-cad-text-dim hover:text-cad-text transition-colors font-sans"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span>
          {actions.length} action{actions.length > 1 ? 's' : ''}
          {successCount > 0 && <span className="text-cad-success ml-1">({successCount} ✓)</span>}
          {errorCount > 0 && <span className="text-cad-error ml-1">({errorCount} ✗)</span>}
        </span>
      </button>
      
      {expanded && (
        <div className="mt-2 space-y-1">
          {actions.map((action, i) => (
            <ActionItem key={action.id} action={action} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function formatMessageContent(content: string): React.ReactNode {
  // Simple markdown-like formatting
  const parts = content.split(/(\*\*[^*]+\*\*|\n)/g)
  
  return parts.map((part, i) => {
    // Bold text
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    // Line breaks
    if (part === '\n') {
      return <br key={i} />
    }
    // Bullet points
    if (part.startsWith('• ')) {
      return <span key={i} className="block pl-2">{part}</span>
    }
    return part
  })
}

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  
  const formatTime = (date: Date) => {
    const d = new Date(date)
    let hours = d.getHours()
    const minutes = d.getMinutes()
    const ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12 // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    return `${hours}:${minutesStr}${ampm}`
  }
  
  return (
    <div className={`message ${isAssistant ? 'message-assistant' : ''}`}>
      {/* Time stamp only */}
      <div className="flex items-center gap-2 px-4 py-1.5 font-sans">
        <span className="text-[10px] text-cad-text-dim">
          {formatTime(message.timestamp)}
        </span>
        {message.status === 'error' && (
          <span className="text-[10px] text-cad-error ml-auto">Failed</span>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 pb-3">
        {isUser ? (
          <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 inline-block max-w-full">
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-cad-text">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {formatMessageContent(message.content)}
          </div>
        )}
        
        {/* Actions */}
        {isAssistant && message.actions && (
          <ActionsDisplay actions={message.actions} />
        )}
        
        {/* Retry button for errors */}
        {message.status === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-cad-accent hover:text-cad-accent-hover underline transition-colors font-sans"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
