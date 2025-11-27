/**
 * Status Bar - Mode, selection, and system status display
 */

import React from 'react'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { Activity, Cpu, Save, AlertCircle } from 'lucide-react'

export function StatusBar() {
  const { activeMode, activeTool, selection, sketchMode, isDrawing } = useUIStore()
  const { document, isLoading, isDirty, error } = useDocumentStore()

  const modeColors = {
    model: 'bg-cad-panel',
    sketch: 'bg-blue-600',
    assembly: 'bg-green-600',
    drawing: 'bg-purple-600'
  }

  return (
    <div className="flex items-center h-6 px-3 bg-cad-darker border-t border-cad-border text-xs select-none">
      {/* Mode indicator */}
      <div className="flex items-center gap-2">
        <span className={`
          px-2 py-0.5 rounded text-[10px] font-medium uppercase
          ${modeColors[activeMode]} text-white
        `}>
          {activeMode}
        </span>
        
        {activeTool && (
          <span className="text-cad-text-dim">
            Tool: <span className="text-cad-text capitalize">{activeTool}</span>
          </span>
        )}
        
        {isDrawing && (
          <span className="text-green-400 animate-pulse">Drawing...</span>
        )}
      </div>

      <div className="w-px h-4 bg-cad-border mx-3" />

      {/* Selection info */}
      <div className="text-cad-text-dim">
        {selection.ids.length === 0 ? (
          'No selection'
        ) : (
          <>
            <span className="text-cad-text">{selection.ids.length}</span>
            {' '}{selection.type}{selection.ids.length !== 1 ? 's' : ''} selected
          </>
        )}
      </div>

      <div className="w-px h-4 bg-cad-border mx-3" />

      {/* Sketch mode info */}
      {sketchMode && (
        <>
          <div className="text-cad-text-dim">
            Editing: <span className="text-blue-400">{sketchMode.sketchId}</span>
          </div>
          <div className="w-px h-4 bg-cad-border mx-3" />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Error indicator */}
      {error && (
        <div className="flex items-center gap-1 text-red-400 mr-3">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-1 text-cad-accent mr-3">
          <Activity size={12} className="animate-spin" />
          <span>Processing...</span>
        </div>
      )}

      {/* Dirty indicator */}
      {isDirty && (
        <div className="flex items-center gap-1 text-yellow-400 mr-3" title="Unsaved changes">
          <Save size={12} />
          <span>Modified</span>
        </div>
      )}

      {/* System status */}
      <div className="flex items-center gap-1 text-cad-text-dim">
        <Cpu size={12} />
        <span>Ready</span>
      </div>

      <div className="w-px h-4 bg-cad-border mx-3" />

      {/* Units */}
      <div className="px-2 py-0.5 bg-cad-panel rounded text-cad-text-dim">
        mm
      </div>
    </div>
  )
}
