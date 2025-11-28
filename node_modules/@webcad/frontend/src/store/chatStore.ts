/**
 * Chat Store - Manages AI Chat Assistant state
 */

import { create } from 'zustand'

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
  type: 'sketch' | 'extrude' | 'revolve' | 'fillet' | 'chamfer' | 'shell' | 'pattern' | 'mirror' | 'delete' | 'undo' | 'loft' | 'sweep' | 'primitive'
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
  // Chat state
  messages: ChatMessage[]
  isOpen: boolean
  isTyping: boolean
  isExecuting: boolean
  context: ChatContext
  
  // Settings
  apiKey: string | null
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  
  // Undo stack
  lastActionIds: string[]
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  
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

const DEFAULT_CONTEXT: ChatContext = {
  documentId: null,
  partStudioId: null,
  selectedFaceId: null,
  selectedEdgeIds: [],
  units: 'mm',
  modelDescription: 'Empty model'
}

// Initial welcome message
const WELCOME_MESSAGE: Omit<ChatMessage, 'id' | 'timestamp'> = {
  role: 'assistant',
  content: `👋 **Welcome to CAD Assistant!**

I can help you create and modify 3D geometry using natural language commands. Try things like:

• "Create a 50mm cube"
• "Add a cylinder 30mm diameter and 40mm tall"
• "Fillet all edges with 3mm radius"
• "Extrude a circle 25mm on the top face"

**Tips:**
- Be specific about dimensions and positions
- Reference faces by name (top, front, right) or by selection
- Ask me to undo if you don't like a result

What would you like to create today?`,
  status: 'success'
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  isOpen: false,
  isTyping: false,
  isExecuting: false,
  context: DEFAULT_CONTEXT,
  apiKey: null,
  model: 'gpt-4',
  lastActionIds: [],
  
  // Actions
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date()
    }
    set((state) => ({
      messages: [...state.messages, newMessage]
    }))
    return newMessage
  },
  
  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    }))
  },
  
  clearMessages: () => {
    // Keep welcome message
    const welcome = {
      ...WELCOME_MESSAGE,
      id: generateId(),
      timestamp: new Date()
    }
    set({ messages: [welcome], lastActionIds: [] })
  },
  
  setIsOpen: (isOpen) => {
    set({ isOpen })
    // Add welcome message if opening for first time
    if (isOpen && get().messages.length === 0) {
      get().addMessage(WELCOME_MESSAGE)
    }
  },
  
  toggleOpen: () => {
    const newIsOpen = !get().isOpen
    get().setIsOpen(newIsOpen)
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
}))

