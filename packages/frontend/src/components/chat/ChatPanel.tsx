/**
 * ChatPanel Component - AI-Assisted Chat Panel for CAD
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bot,
  Send,
  X,
  Trash2,
  Undo2,
  Loader2,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { useChatAssistant } from '../../hooks/useChatAssistant'
import { ChatMessage } from './ChatMessage'
import { useChatStore } from '../../store/chatStore'

interface QuickActionsProps {
  onSelect: (text: string) => void
  disabled: boolean
}

function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  const suggestions = [
    { label: '📦 Create cube', text: 'Create a 50mm cube' },
    { label: '⬡ Add cylinder', text: 'Add a cylinder 30mm diameter and 40mm tall' },
    { label: '🔘 Fillet edges', text: 'Fillet all edges with 5mm radius' },
    { label: '↩️ Undo', text: 'Undo the last action' }
  ]
  
  return (
    <div className="flex flex-wrap gap-1 p-2 border-t border-cad-border/50">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.text)}
          disabled={disabled}
          className="px-2 py-1 text-[10px] bg-cad-panel/50 hover:bg-cad-panel border border-cad-border/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
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
  
  const handleQuickAction = useCallback((text: string) => {
    if (text.toLowerCase().includes('undo')) {
      undoLastAction()
    } else {
      sendMessage(text)
    }
  }, [sendMessage, undoLastAction])
  
  if (!isOpen) return null
  
  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-panel-header">
        <div className="flex items-center gap-2">
          <div className="chat-panel-icon">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold text-sm">CAD Assistant</span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-[10px] text-cad-accent">
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
              className="p-1.5 hover:bg-cad-panel rounded transition-colors disabled:opacity-50"
              title="Undo last action"
            >
              <Undo2 size={14} />
            </button>
          )}
          <button
            onClick={() => clearMessages()}
            className="p-1.5 hover:bg-cad-panel rounded transition-colors"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={toggleOpen}
            className="p-1.5 hover:bg-cad-panel rounded transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cad-accent to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-cad-accent/20">
              <Bot size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">CAD Assistant</h3>
            <p className="text-sm text-cad-text-dim">
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
              <Bot size={16} />
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
      
      {/* Quick Actions */}
      <QuickActions
        onSelect={handleQuickAction}
        disabled={isTyping || isExecuting}
      />
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to create..."
          disabled={!hasApiKey || isTyping || isExecuting}
          rows={1}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || !hasApiKey || isTyping || isExecuting}
          className="chat-send-btn"
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

/**
 * Chat Toggle Button - Floating button to open chat panel
 */
export function ChatToggleButton() {
  const { isOpen, toggleOpen } = useChatAssistant()
  const { messages } = useChatStore()
  
  if (isOpen) return null
  
  return (
    <button
      onClick={toggleOpen}
      className="chat-toggle-btn"
      title="Open CAD Assistant"
    >
      <div className="relative">
        <MessageSquare size={22} />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-cad-accent rounded-full" />
        )}
      </div>
      <span className="chat-toggle-label">AI Assistant</span>
    </button>
  )
}
