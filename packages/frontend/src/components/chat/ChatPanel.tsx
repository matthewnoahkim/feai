/**
 * ChatPanel Component - AI-Assisted Chat Panel for CAD
 * Clean design with multiple chat sessions
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Trash2,
  Undo2,
  Loader2,
  Plus,
  ChevronDown,
  MoreVertical,
  Edit2,
  Check,
  X
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
  
  const { 
    sessions, 
    activeSessionId, 
    createSession, 
    deleteSession, 
    renameSession, 
    setActiveSession,
    getMessages
  } = useChatStore()
  
  const { chatPanelWidth, setChatPanelWidth } = useUIStore()
  
  const [input, setInput] = useState('')
  const [isResizing, setIsResizing] = useState(false)
  const [showSessionMenu, setShowSessionMenu] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
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
  
  const handleNewChat = () => {
    createSession()
    setShowSessionMenu(false)
  }
  
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }
  
  const handleStartRename = (sessionId: string, currentName: string) => {
    setEditingSessionId(sessionId)
    setEditingName(currentName)
  }
  
  const handleSaveRename = () => {
    if (editingSessionId && editingName.trim()) {
      renameSession(editingSessionId, editingName.trim())
    }
    setEditingSessionId(null)
    setEditingName('')
  }
  
  const handleCancelRename = () => {
    setEditingSessionId(null)
    setEditingName('')
  }
  
  const activeSession = sessions.find(s => s.id === activeSessionId)
  
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
      
      {/* Header with Session Selector */}
      <div className="chat-panel-header">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setShowSessionMenu(!showSessionMenu)}
            className="flex items-center gap-2 flex-1 min-w-0 hover:bg-gray-50 px-2 py-1 transition-colors"
          >
            <span className="font-serif font-semibold text-sm truncate">
              {activeSession?.name || 'AI Assistant'}
            </span>
            <ChevronDown size={14} className="flex-shrink-0" />
          </button>
          
          {isExecuting && (
            <span className="flex items-center gap-1 text-[10px] text-cad-accent font-sans flex-shrink-0">
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
        </div>
      </div>
      
      {/* Session Menu Dropdown */}
      {showSessionMenu && (
        <div className="absolute top-14 left-4 right-4 bg-white border border-cad-border z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <Plus size={14} />
              <span>New Chat</span>
            </button>
          </div>
          <div className="border-t border-cad-border">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                  session.id === activeSessionId ? 'bg-cad-accent/10' : ''
                }`}
              >
                {editingSessionId === session.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename()
                        if (e.key === 'Escape') handleCancelRename()
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-cad-accent focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleSaveRename} className="p-1 hover:bg-gray-100">
                      <Check size={12} />
                    </button>
                    <button onClick={handleCancelRename} className="p-1 hover:bg-gray-100">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      onClick={() => {
                        setActiveSession(session.id)
                        setShowSessionMenu(false)
                      }}
                      className="flex-1 text-xs truncate"
                    >
                      {session.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRename(session.id, session.name)
                      }}
                      className="p-1 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Rename chat"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteSession(session.id)
                      }}
                      className="p-1 hover:bg-red-100 text-cad-text hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete chat"
                    >
                      <X size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages - Clean style */}
      <div className="chat-messages-linear">
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
          <div className="px-4 py-3 border-b border-cad-border/30">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
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
          placeholder={hasApiKey ? "Describe what you want to create..." : "Add NEXT_PUBLIC_OPENAI_API_KEY to .env file"}
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
