/**
 * Chat Store - Manages AI Chat Assistant state
 */

import { create } from 'zustand'

export interface ChatSession {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  actions?: CadAction[]
  status?: 'pending' | 'success' | 'error'
  error?: string
}

export interface CadAction {
  id: string
  type: 'sketch' | 'extrude' | 'revolve' | 'fillet' | 'chamfer' | 'shell' | 'pattern' | 'mirror' | 'delete' | 'undo' | 'loft' | 'sweep' | 'primitive' | 'linear-pattern' | 'linearPattern' | 'circular-pattern' | 'circularPattern' | 'mirror-feature' | 'import' | 'feature' | 'document' | 'analysis' | 'export'
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, any>
  description: string
  status: 'pending' | 'executing' | 'success' | 'error'
  result?: any
  error?: string
}

export interface ChatContext {
  documentId: string | null
  partStudioId: string | null
  selectedFaceId: string | null
  selectedEdgeIds: string[]
  units: 'mm' | 'inch' | 'm'
  modelDescription: string
}

interface ChatState {
  // Current project ID (for scoping chats)
  currentProjectId: string | null
  
  // Chat sessions
  sessions: ChatSession[]
  activeSessionId: string | null
  isOpen: boolean
  isTyping: boolean
  isExecuting: boolean
  context: ChatContext
  
  // Settings
  apiKey: string | null
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  
  // Undo stack
  lastActionIds: string[]
  
  // Project management
  loadProjectChats: (projectId: string) => void
  
  // Session actions
  createSession: (name?: string) => string
  deleteSession: (sessionId: string) => void
  renameSession: (sessionId: string, name: string) => void
  setActiveSession: (sessionId: string) => void
  
  // Message actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  
  // Helper to get current messages
  getMessages: () => ChatMessage[]
  
  setIsOpen: (isOpen: boolean) => void
  toggleOpen: () => void
  setIsTyping: (isTyping: boolean) => void
  setIsExecuting: (isExecuting: boolean) => void
  
  updateContext: (context: Partial<ChatContext>) => void
  setApiKey: (key: string) => void
  setModel: (model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo') => void
  
  addToUndoStack: (actionId: string) => void
  popUndoStack: () => string | undefined
  clearUndoStack: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// OpenAI API Key - loaded from environment variable
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

const DEFAULT_CONTEXT: ChatContext = {
  documentId: null,
  partStudioId: null,
  selectedFaceId: null,
  selectedEdgeIds: [],
  units: 'mm',
  modelDescription: 'Empty model'
}

// Create a new session
function createNewSession(name?: string): ChatSession {
  const now = new Date()
  const defaultName = name || now.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  
  return {
    id: generateId(),
    name: defaultName,
    createdAt: now,
    updatedAt: now,
    messages: []
  }
}

// Load sessions from localStorage for a specific project
function loadSessions(projectId?: string): ChatSession[] {
  try {
    const key = projectId ? `chat-sessions-${projectId}` : 'chat-sessions'
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }))
    }
  } catch (error) {
    console.error('Failed to load chat sessions:', error)
  }
  return [createNewSession()]
}

// Save sessions to localStorage for a specific project
function saveSessions(sessions: ChatSession[], projectId?: string) {
  try {
    const key = projectId ? `chat-sessions-${projectId}` : 'chat-sessions'
    localStorage.setItem(key, JSON.stringify(sessions))
  } catch (error) {
    console.error('Failed to save chat sessions:', error)
  }
}

export const useChatStore = create<ChatState>((set, get) => {
  // Load initial sessions (will be empty until project is loaded)
  const initialSessions = [createNewSession()]
  const initialSessionId = initialSessions[0]?.id || null
  
  return {
    // Initial state
    currentProjectId: null,
    sessions: initialSessions,
    activeSessionId: initialSessionId,
    isOpen: true, // Open by default (like Cursor)
    isTyping: false,
    isExecuting: false,
    context: DEFAULT_CONTEXT,
    apiKey: OPENAI_API_KEY,
    model: 'gpt-4',
    lastActionIds: [],
    
    // Load chats for a specific project
    loadProjectChats: (projectId) => {
      const sessions = loadSessions(projectId)
      set({
        currentProjectId: projectId,
        sessions,
        activeSessionId: sessions[0]?.id || null
      })
    },
    
    // Helper to get current messages
    getMessages: () => {
      const { sessions, activeSessionId } = get()
      const activeSession = sessions.find(s => s.id === activeSessionId)
      return activeSession?.messages || []
    },
    
    // Session actions
    createSession: (name) => {
      const newSession = createNewSession(name)
      set((state) => {
        const newSessions = [...state.sessions, newSession]
        saveSessions(newSessions, state.currentProjectId || undefined)
        return {
          sessions: newSessions,
          activeSessionId: newSession.id
        }
      })
      return newSession.id
    },
    
    deleteSession: (sessionId) => {
      set((state) => {
        const newSessions = state.sessions.filter(s => s.id !== sessionId)
        // If deleting active session, switch to first available
        const newActiveId = state.activeSessionId === sessionId 
          ? (newSessions[0]?.id || null)
          : state.activeSessionId
        
        // If no sessions left, create a new one
        if (newSessions.length === 0) {
          const defaultSession = createNewSession()
          newSessions.push(defaultSession)
          saveSessions(newSessions, state.currentProjectId || undefined)
          return {
            sessions: newSessions,
            activeSessionId: defaultSession.id
          }
        }
        
        saveSessions(newSessions, state.currentProjectId || undefined)
        return {
          sessions: newSessions,
          activeSessionId: newActiveId
        }
      })
    },
    
    renameSession: (sessionId, name) => {
      set((state) => {
        const newSessions = state.sessions.map(s => 
          s.id === sessionId 
            ? { ...s, name, updatedAt: new Date() }
            : s
        )
        saveSessions(newSessions, state.currentProjectId || undefined)
        return { sessions: newSessions }
      })
    },
    
    setActiveSession: (sessionId) => {
      set({ activeSessionId: sessionId })
    },
    
    // Message actions
    addMessage: (message) => {
      const newMessage: ChatMessage = {
        ...message,
        id: generateId(),
        timestamp: new Date()
      }
      
      set((state) => {
        const activeSession = state.sessions.find(s => s.id === state.activeSessionId)
        if (!activeSession) return state
        
        const newSessions = state.sessions.map(s => 
          s.id === state.activeSessionId 
            ? { 
                ...s, 
                messages: [...s.messages, newMessage],
                updatedAt: new Date()
              }
            : s
        )
        
        saveSessions(newSessions, state.currentProjectId || undefined)
        return { sessions: newSessions }
      })
      
      return newMessage
    },
    
    updateMessage: (id, updates) => {
      set((state) => {
        const activeSession = state.sessions.find(s => s.id === state.activeSessionId)
        if (!activeSession) return state
        
        const newSessions = state.sessions.map(s => 
          s.id === state.activeSessionId 
            ? { 
                ...s,
                messages: s.messages.map((msg) =>
                  msg.id === id ? { ...msg, ...updates } : msg
                ),
                updatedAt: new Date()
              }
            : s
        )
        
        saveSessions(newSessions, state.currentProjectId || undefined)
        return { sessions: newSessions }
      })
    },
    
    clearMessages: () => {
      set((state) => {
        const activeSession = state.sessions.find(s => s.id === state.activeSessionId)
        if (!activeSession) return state
        
        const newSessions = state.sessions.map(s => 
          s.id === state.activeSessionId 
            ? { ...s, messages: [], updatedAt: new Date() }
            : s
        )
        
        saveSessions(newSessions, state.currentProjectId || undefined)
        return {
          sessions: newSessions,
          lastActionIds: []
        }
      })
    },
    
    setIsOpen: (isOpen) => {
      set({ isOpen })
    },
    
    toggleOpen: () => {
      set((state) => ({ isOpen: !state.isOpen }))
    },
    
    setIsTyping: (isTyping) => set({ isTyping }),
    
    setIsExecuting: (isExecuting) => set({ isExecuting }),
    
    updateContext: (context) => {
      set((state) => ({
        context: { ...state.context, ...context }
      }))
    },
    
    setApiKey: (apiKey) => set({ apiKey }),
    
    setModel: (model) => set({ model }),
    
    addToUndoStack: (actionId) => {
      set((state) => ({
        lastActionIds: [...state.lastActionIds, actionId].slice(-10) // Keep last 10
      }))
    },
    
    popUndoStack: () => {
      const stack = get().lastActionIds
      if (stack.length === 0) return undefined
      const lastId = stack[stack.length - 1]
      set({ lastActionIds: stack.slice(0, -1) })
      return lastId
    },
    
    clearUndoStack: () => set({ lastActionIds: [] })
  }
})

