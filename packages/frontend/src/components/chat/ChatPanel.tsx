/**
 * ChatPanel Component - AI-Assisted Chat Panel for CAD
 * Academic/scholarly theme styling
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Trash2,
  Undo2,
  Loader2,
  GripVertical
} from 'lucide-react'
import { useChatAssistant } from '../../hooks/useChatAssistant'
import { ChatMessage } from './ChatMessage'
import { useChatStore } from '../../store/chatStore'
import { useUIStore } from '../../store/uiStore'

interface QuickActionsProps {
  onSelect: (text: string) => void
  disabled: boolean
}

function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const suggestions = [
    { label: 'Create cube', text: 'Create a 50mm cube' },
    { label: 'Add cylinder', text: 'Add a cylinder 30mm diameter and 40mm tall' },
    { label: 'Fillet edges', text: 'Fillet all edges with 5mm radius' },
    { label: 'Undo', text: 'Undo the last action' }
  ]
  
  return (
    <div className="flex flex-wrap gap-1 p-2 border-t border-cad-border">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.text)}
          disabled={disabled}
          className="px-2 py-1 text-[10px] bg-cad-panel hover:bg-gray-50 border border-cad-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export function ChatPanel() {
  const {
    messages,
    isOpen,
    isTyping,
    isExecuting,
    hasApiKey,
    canUndo,
    sendMessage,
    clearMessages,
    toggleOpen,
    undoLastAction
  } = useChatAssistant()
  
  const { chatPanelWidth, setChatPanelWidth } = useUIStore()
  
  const [input, setInput] = useState('')
  const [isResizing, setIsResizing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])
  
  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])
  
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isTyping || isExecuting) return
    
    sendMessage(input)
    setInput('')
  }, [input, isTyping, isExecuting, sendMessage])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])
  
  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = chatPanelWidth
  }, [chatPanelWidth])
  
  useEffect(() => {
    if (!isResizing) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = startXRef.current - e.clientX
      const newWidth = Math.max(300, Math.min(800, startWidthRef.current + delta))
      setChatPanelWidth(newWidth)
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setChatPanelWidth])
  
  if (!isOpen) return null
  
  return (
    <div 
      className="chat-panel"
      style={{ width: `${chatPanelWidth}px` }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className={`
          absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-50
          hover:bg-cad-accent/30 transition-colors
          ${isResizing ? 'bg-cad-accent/50' : ''}
        `}
        style={{ left: '-2px' }}
      />
      
      {/* Header */}
      <div className="chat-panel-header">
        <div className="flex items-center gap-2">
          <span className="font-serif font-semibold text-sm">AI Assistant</span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-[10px] text-cad-accent font-sans">
              <Loader2 size={10} className="animate-spin" />
              Working...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {canUndo && (
            <button
              onClick={undoLastAction}
              disabled={isExecuting}
              className="p-1.5 hover:bg-cad-panel border border-transparent hover:border-cad-border transition-colors disabled:opacity-50"
              title="Undo last action"
            >
              <Undo2 size={14} />
            </button>
          )}
          <button
            onClick={() => clearMessages()}
            className="p-1.5 hover:bg-cad-panel border border-transparent hover:border-cad-border transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <h3 className="text-lg font-serif font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm text-cad-text-dim font-sans">
              Describe what you want to create and I'll help you build it.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onRetry={message.status === 'error' ? () => sendMessage(message.content) : undefined}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-avatar chat-avatar-assistant">
              <span className="text-xs font-bold">AI</span>
            </div>
            <div className="flex-1">
              <div className="chat-bubble chat-bubble-assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasApiKey ? "Describe what you want to create..." : "Add VITE_OPENAI_API_KEY to .env file"}
          disabled={!hasApiKey || isTyping || isExecuting}
          rows={1}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || !hasApiKey || isTyping || isExecuting}
          className="chat-send-btn"
          title={!hasApiKey ? "API key required" : "Send message"}
        >
          {isTyping ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  )
}
