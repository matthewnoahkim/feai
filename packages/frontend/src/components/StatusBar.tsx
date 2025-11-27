/**
 * Status Bar - Mode, selection, tool prompts, and system status display
 */

import React from 'react'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { 
  Activity, 
  Cpu, 
  Save, 
  AlertCircle, 
  MousePointer,
  Move,
  ZoomIn,
  Command
} from 'lucide-react'

export function StatusBar() {
  const { 
    activeMode, 
    activeTool, 
    selection, 
    sketchMode, 
    drawing,
    toolPrompt
  } = useUIStore()
  const { document, isLoading, isDirty, error } = useDocumentStore()

  const modeColors = {
    model: 'bg-cad-panel',
    sketch: 'bg-blue-600',
    assembly: 'bg-green-600',
    drawing: 'bg-purple-600'
  }

  // Get current sketch info
  const currentSketch = sketchMode && document?.partStudios
    .find(ps => ps.id === sketchMode.partStudioId)
    ?.sketches.get(sketchMode.sketchId!)
  const sketchEntityCount = currentSketch?.entities.length || 0
  const sketchConstraintCount = currentSketch?.constraints.length || 0
  const sketchStatus = currentSketch?.status || 'under-constrained'

  return (
    <div className="flex items-center h-7 px-3 bg-gradient-to-r from-cad-darker to-cad-dark border-t border-cad-border text-xs select-none">
      {/* Mode indicator */}
      <div className="flex items-center gap-2">
        <span className={`
          px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide
          ${modeColors[activeMode]} text-white
        `}>
          {activeMode}
        </span>
        
        {activeTool && (
          <span className="text-cad-text-dim flex items-center gap-1.5">
            <MousePointer size={11} />
            <span className="text-cad-text font-medium capitalize">{activeTool.replace('-', ' ')}</span>
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-cad-border mx-3" />

      {/* Tool prompt - main guidance */}
      {toolPrompt && (
        <>
          <div className="flex items-center gap-2 text-cad-text">
            <span className="text-blue-400 font-medium">{toolPrompt.primary}</span>
            {toolPrompt.secondary && (
              <span className="text-cad-text-dim">• {toolPrompt.secondary}</span>
            )}
          </div>
          <div className="w-px h-4 bg-cad-border mx-3" />
        </>
      )}

      {/* Drawing state indicator */}
      {drawing.isActive && (
        <>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Drawing
            </span>
            <span className="text-cad-text-dim">
              {drawing.points.length} point{drawing.points.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="w-px h-4 bg-cad-border mx-3" />
        </>
      )}

      {/* Active constraints while drawing */}
      {drawing.constraints.length > 0 && (
        <>
          <div className="flex items-center gap-1">
            {drawing.constraints.includes('horizontal') && (
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-medium">H</span>
            )}
            {drawing.constraints.includes('vertical') && (
              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-medium">V</span>
            )}
          </div>
          <div className="w-px h-4 bg-cad-border mx-3" />
        </>
      )}

      {/* Selection info */}
      <div className="text-cad-text-dim">
        {selection.ids.length === 0 ? (
          sketchMode ? (
            <span className="flex items-center gap-2">
              <span>{sketchEntityCount} entities in sketch</span>
              {sketchConstraintCount > 0 && (
                <span className="text-cad-text-dim">• {sketchConstraintCount} constraints</span>
              )}
            </span>
          ) : (
            'No selection'
          )
        ) : (
          <>
            <span className="text-cad-text font-medium">{selection.ids.length}</span>
            {' '}{selection.type}{selection.ids.length !== 1 ? 's' : ''} selected
          </>
        )}
      </div>

      {/* Sketch constraint status indicator */}
      {sketchMode && (
        <>
          <div className="w-px h-4 bg-cad-border mx-3" />
          <div className={`
            flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium
            ${sketchStatus === 'fully-constrained' ? 'bg-green-500/20 text-green-400' :
              sketchStatus === 'over-constrained' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'}
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              sketchStatus === 'fully-constrained' ? 'bg-green-400' :
              sketchStatus === 'over-constrained' ? 'bg-red-400' :
              'bg-blue-400'
            }`} />
            {sketchStatus === 'fully-constrained' ? 'Fully Defined' :
             sketchStatus === 'over-constrained' ? 'Over-Constrained' :
             'Under-Defined'}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard shortcuts hint */}
      {sketchMode && (
        <div className="flex items-center gap-3 mr-3 text-cad-text-dim">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-cad-panel rounded text-[10px] font-mono">L</kbd>
            Line
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-cad-panel rounded text-[10px] font-mono">C</kbd>
            Circle
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-cad-panel rounded text-[10px] font-mono">R</kbd>
            Rect
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-cad-panel rounded text-[10px] font-mono">Esc</kbd>
            Cancel
          </span>
        </div>
      )}

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
      <div className="px-2 py-0.5 bg-cad-panel rounded text-cad-text-dim font-medium">
        mm
      </div>

      {/* Coordinate display when in sketch mode */}
      {sketchMode && drawing.previewPoint && (
        <>
          <div className="w-px h-4 bg-cad-border mx-3" />
          <div className="font-mono text-[11px]">
            <span className="text-red-400">X</span>
            <span className="text-cad-text ml-1">{drawing.previewPoint.x.toFixed(2)}</span>
            <span className="text-green-400 ml-2">Y</span>
            <span className="text-cad-text ml-1">{drawing.previewPoint.y.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  )
}
