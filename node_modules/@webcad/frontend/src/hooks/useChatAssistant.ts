/**
 * useChatAssistant Hook - Combines chat store and services for easy component integration
 */

import { useCallback } from 'react'
import { useChatStore, CadAction } from '../store/chatStore'
import { useDocumentStore } from '../store/documentStore'
import { useUIStore } from '../store/uiStore'
import { callChatGPT, validateAction, checkRateLimit } from '../services/chatService'
import { executeActions, undoActions } from '../services/cadExecutor'

export function useChatAssistant() {
  const {
    messages,
    isOpen,
    isTyping,
    isExecuting,
    context,
    apiKey,
    model,
    lastActionIds,
    addMessage,
    updateMessage,
    clearMessages,
    setIsOpen,
    toggleOpen,
    setIsTyping,
    setIsExecuting,
    updateContext,
    setApiKey,
    addToUndoStack,
    popUndoStack
  } = useChatStore()
  
  const { document, regenerateModel } = useDocumentStore()
  const { selection, addNotification } = useUIStore()
  
  /**
   * Update the chat context with current document state
   */
  const syncContext = useCallback(() => {
    if (!document) return
    
    const activePartStudio = document.partStudios.find(
      ps => ps.id === document.activeElementId
    )
    
    const featureCount = activePartStudio?.features.length || 0
    const partCount = activePartStudio?.parts.length || 0
    
    let modelDescription = 'Empty model'
    if (featureCount > 0) {
      modelDescription = `Model with ${featureCount} feature${featureCount > 1 ? 's' : ''}`
      if (partCount > 0) {
        modelDescription += ` and ${partCount} part${partCount > 1 ? 's' : ''}`
      }
    }
    
    updateContext({
      documentId: document.id,
      partStudioId: document.activeElementId || activePartStudio?.id || null,
      selectedFaceId: selection.type === 'face' ? selection.ids[0] : null,
      selectedEdgeIds: selection.type === 'edge' ? selection.ids : [],
      modelDescription
    })
  }, [document, selection, updateContext])
  
  /**
   * Send a message to the AI assistant
   */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return
    
    // Sync context before sending
    syncContext()
    
    // Add user message
    addMessage({
      role: 'user',
      content: text.trim(),
      status: 'success'
    })
    
    // Check for API key
    if (!apiKey) {
      addMessage({
        role: 'assistant',
        content: '⚠️ **API Key Required**\n\nPlease set your OpenAI API key in the settings to use the AI assistant. Click the ⚙️ icon in the chat panel header.',
        status: 'error'
      })
      return
    }
    
    setIsTyping(true)
    
    try {
      // Call ChatGPT API
      const response = await callChatGPT(
        text,
        messages,
        useChatStore.getState().context,
        apiKey,
        model
      )
      
      setIsTyping(false)
      
      // Check if there's a clarification needed
      if (response.clarification && response.actions.length === 0) {
        addMessage({
          role: 'assistant',
          content: response.message + (response.clarification ? `\n\n❓ ${response.clarification}` : ''),
          status: 'success'
        })
        return
      }
      
      // Validate actions
      const invalidActions = response.actions.filter(a => !validateAction(a))
      if (invalidActions.length > 0) {
        addMessage({
          role: 'assistant',
          content: `⚠️ Some requested operations are not allowed for safety reasons. Please try a different approach.`,
          status: 'error'
        })
        return
      }
      
      // Check rate limit
      if (!checkRateLimit(response.actions)) {
        addMessage({
          role: 'assistant',
          content: `⚠️ This request involves too many operations (${response.actions.length}). Please break it into smaller steps.`,
          status: 'error'
        })
        return
      }
      
      // Add assistant message with actions
      const assistantMessage = addMessage({
        role: 'assistant',
        content: response.message,
        actions: response.actions,
        status: response.actions.length > 0 ? 'pending' : 'success'
      })
      
      // Execute actions if any
      if (response.actions.length > 0) {
        await executeActionsFromMessage(assistantMessage.id, response.actions)
      }
      
    } catch (error) {
      setIsTyping(false)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      addMessage({
        role: 'assistant',
        content: `❌ **Error:** ${errorMessage}\n\nPlease try again or rephrase your request.`,
        status: 'error'
      })
      
      addNotification('error', `Chat error: ${errorMessage}`)
    }
  }, [messages, apiKey, model, syncContext, addMessage, setIsTyping, addNotification])
  
  /**
   * Execute actions from an assistant message
   */
  const executeActionsFromMessage = useCallback(async (
    messageId: string,
    actions: CadAction[]
  ) => {
    if (!context.documentId || !context.partStudioId) {
      updateMessage(messageId, {
        content: '❌ No active document. Please create or open a document first.',
        status: 'error'
      })
      return
    }
    
    setIsExecuting(true)
    
    try {
      const summary = await executeActions(
        actions,
        context.documentId,
        context.partStudioId,
        (action, index) => {
          // Update action status in the message
          const currentMessage = useChatStore.getState().messages.find(m => m.id === messageId)
          if (currentMessage?.actions) {
            const updatedActions = [...currentMessage.actions]
            updatedActions[index] = action
            updateMessage(messageId, { actions: updatedActions })
          }
        }
      )
      
      // Update message with final status
      updateMessage(messageId, {
        status: summary.success ? 'success' : 'error',
        content: useChatStore.getState().messages.find(m => m.id === messageId)?.content + `\n\n${summary.message}`
      })
      
      // Add created feature IDs to undo stack
      summary.createdFeatureIds.forEach(id => addToUndoStack(id))
      
      // Regenerate the 3D model to show changes
      if (summary.success && context.partStudioId) {
        await regenerateModel(context.partStudioId)
        addNotification('success', 'Model updated')
      }
      
    } catch (error) {
      updateMessage(messageId, {
        status: 'error',
        content: `❌ Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      
      addNotification('error', 'Failed to execute CAD actions')
    } finally {
      setIsExecuting(false)
    }
  }, [context, updateMessage, setIsExecuting, addToUndoStack, regenerateModel, addNotification])
  
  /**
   * Undo the last action
   */
  const undoLastAction = useCallback(async () => {
    const featureId = popUndoStack()
    if (!featureId) {
      addNotification('info', 'Nothing to undo')
      return
    }
    
    if (!context.documentId || !context.partStudioId) {
      addNotification('error', 'No active document')
      return
    }
    
    setIsExecuting(true)
    
    try {
      const result = await undoActions(
        [featureId],
        context.documentId,
        context.partStudioId
      )
      
      addMessage({
        role: 'assistant',
        content: result.message,
        status: result.success ? 'success' : 'error'
      })
      
      if (result.success) {
        await regenerateModel(context.partStudioId)
        addNotification('success', 'Undone')
      }
      
    } catch (error) {
      addNotification('error', 'Failed to undo')
    } finally {
      setIsExecuting(false)
    }
  }, [context, popUndoStack, setIsExecuting, addMessage, regenerateModel, addNotification])
  
  return {
    // State
    messages,
    isOpen,
    isTyping,
    isExecuting,
    hasApiKey: !!apiKey,
    canUndo: lastActionIds.length > 0,
    
    // Actions
    sendMessage,
    clearMessages,
    setIsOpen,
    toggleOpen,
    setApiKey,
    undoLastAction,
    syncContext
  }
}

