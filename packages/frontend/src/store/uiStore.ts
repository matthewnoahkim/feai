/**
 * UI Store - Manages UI state (tools, selection, view settings)
 */

import { create } from 'zustand'

export type ActiveMode = 'model' | 'sketch' | 'assembly' | 'drawing'
export type SelectionType = 'none' | 'face' | 'edge' | 'vertex' | 'body' | 'feature' | 'sketch-entity'
export type DisplayMode = 'shaded' | 'shadedEdges' | 'wireframe' | 'hidden'

export type SketchTool = 'select' | 'line' | 'rectangle' | 'circle' | 'arc' | 'spline' | 'point' | 'dimension' | 'constraint'
export type ModelTool = 'select' | 'extrude' | 'revolve' | 'sweep' | 'loft' | 'fillet' | 'chamfer' | 'shell' | 'pattern' | 'mirror' | 'boolean'

export interface Selection {
  type: SelectionType
  ids: string[]
  data?: any
}

export interface ViewSettings {
  showGrid: boolean
  showOrigin: boolean
  showPlanes: boolean
  displayMode: DisplayMode
  showEdges: boolean
}

export interface CameraState {
  position: [number, number, number]
  target: [number, number, number]
  up: [number, number, number]
  fov: number
}

export interface SketchModeState {
  sketchId: string | null
  partStudioId: string | null
  planeNormal: [number, number, number]
  planeOrigin: [number, number, number]
}

interface UIState {
  // Mode and tools
  activeMode: ActiveMode
  activeTool: string | null
  
  // Selection
  selection: Selection
  hovered: string | null
  preselection: string | null
  
  // View settings
  viewSettings: ViewSettings
  camera: CameraState
  
  // Sketch mode
  sketchMode: SketchModeState | null
  
  // Drawing state for tools
  isDrawing: boolean
  drawingPoints: Array<{ x: number; y: number; z: number }>
  
  // UI panels
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  bottomPanelOpen: boolean
  
  // Dialogs
  activeDialog: string | null
  dialogData: any
  
  // Notifications
  notifications: Array<{ id: string; type: 'info' | 'success' | 'warning' | 'error'; message: string }>
  
  // Actions
  setActiveMode: (mode: ActiveMode) => void
  setActiveTool: (tool: string | null) => void
  
  setSelection: (selection: Selection) => void
  clearSelection: () => void
  addToSelection: (type: SelectionType, id: string) => void
  removeFromSelection: (id: string) => void
  setHovered: (id: string | null) => void
  setPreselection: (id: string | null) => void
  
  setViewSetting: <K extends keyof ViewSettings>(key: K, value: ViewSettings[K]) => void
  toggleViewSetting: (key: 'showGrid' | 'showOrigin' | 'showPlanes' | 'showEdges') => void
  setDisplayMode: (mode: DisplayMode) => void
  setCamera: (camera: Partial<CameraState>) => void
  resetCamera: () => void
  
  enterSketchMode: (partStudioId: string, sketchId: string, plane: { normal: [number, number, number]; origin: [number, number, number] }) => void
  exitSketchMode: () => void
  
  startDrawing: () => void
  addDrawingPoint: (point: { x: number; y: number; z: number }) => void
  finishDrawing: () => Array<{ x: number; y: number; z: number }>
  cancelDrawing: () => void
  
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleBottomPanel: () => void
  
  openDialog: (dialogId: string, data?: any) => void
  closeDialog: () => void
  
  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void
  removeNotification: (id: string) => void
}

const DEFAULT_CAMERA: CameraState = {
  position: [100, 80, 100],
  target: [0, 0, 0],
  up: [0, 1, 0],
  fov: 45
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  activeMode: 'model',
  activeTool: null,
  
  selection: { type: 'none', ids: [] },
  hovered: null,
  preselection: null,
  
  viewSettings: {
    showGrid: true,
    showOrigin: true,
    showPlanes: true,
    displayMode: 'shadedEdges',
    showEdges: true
  },
  camera: DEFAULT_CAMERA,
  
  sketchMode: null,
  
  isDrawing: false,
  drawingPoints: [],
  
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: false,
  
  activeDialog: null,
  dialogData: null,
  
  notifications: [],
  
  // Actions
  setActiveMode: (mode) => set({ activeMode: mode, activeTool: null }),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setSelection: (selection) => set({ selection }),
  
  clearSelection: () => set({ selection: { type: 'none', ids: [] } }),
  
  addToSelection: (type, id) => set((state) => ({
    selection: {
      type,
      ids: [...state.selection.ids, id]
    }
  })),
  
  removeFromSelection: (id) => set((state) => ({
    selection: {
      ...state.selection,
      ids: state.selection.ids.filter(i => i !== id)
    }
  })),
  
  setHovered: (id) => set({ hovered: id }),
  
  setPreselection: (id) => set({ preselection: id }),
  
  setViewSetting: (key, value) => set((state) => ({
    viewSettings: { ...state.viewSettings, [key]: value }
  })),
  
  toggleViewSetting: (key) => set((state) => ({
    viewSettings: { ...state.viewSettings, [key]: !state.viewSettings[key] }
  })),
  
  setDisplayMode: (mode) => set((state) => ({
    viewSettings: { ...state.viewSettings, displayMode: mode }
  })),
  
  setCamera: (camera) => set((state) => ({
    camera: { ...state.camera, ...camera }
  })),
  
  resetCamera: () => set({ camera: DEFAULT_CAMERA }),
  
  enterSketchMode: (partStudioId, sketchId, plane) => set({
    activeMode: 'sketch',
    sketchMode: {
      partStudioId,
      sketchId,
      planeNormal: plane.normal,
      planeOrigin: plane.origin
    },
    activeTool: 'line'
  }),
  
  exitSketchMode: () => set({
    activeMode: 'model',
    sketchMode: null,
    activeTool: null,
    isDrawing: false,
    drawingPoints: []
  }),
  
  startDrawing: () => set({ isDrawing: true, drawingPoints: [] }),
  
  addDrawingPoint: (point) => set((state) => ({
    drawingPoints: [...state.drawingPoints, point]
  })),
  
  finishDrawing: () => {
    const points = get().drawingPoints
    set({ isDrawing: false, drawingPoints: [] })
    return points
  },
  
  cancelDrawing: () => set({ isDrawing: false, drawingPoints: [] }),
  
  toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
  
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  
  toggleBottomPanel: () => set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen })),
  
  openDialog: (dialogId, data) => set({ activeDialog: dialogId, dialogData: data }),
  
  closeDialog: () => set({ activeDialog: null, dialogData: null }),
  
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }]
    }))
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}))

