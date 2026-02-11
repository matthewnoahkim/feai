/**
 * Property Panel - Context-sensitive properties display
 * Academic/scholarly theme styling
 */

import React, { useState } from 'react'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { useChatStore } from '../store/chatStore'
import {
  Box,
  Palette,
  Ruler,
  Layers,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface PropertySectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function PropertySection({ title, icon, children, defaultOpen = true }: PropertySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-cad-border">
      <button
        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 font-sans"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-cad-text-dim">{icon}</span>
        <span className="flex-1 text-sm font-medium">{title}</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

interface PropertyRowProps {
  label: string
  children: React.ReactNode
}

function PropertyRow({ label, children }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-cad-text-dim font-sans">{label}</span>
      {children}
    </div>
  )
}

function PropertyInput({ 
  value, 
  onChange, 
  type = 'text',
  unit,
  min,
  max,
  step,
  className = ''
}: { 
  value: string | number
  onChange?: (value: string) => void
  type?: 'text' | 'number'
  unit?: string
  min?: number
  max?: number
  step?: number
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-20 px-2 py-1 text-xs bg-cad-panel border border-cad-border focus:border-cad-accent font-sans"
      />
      {unit && <span className="text-xs text-cad-text-dim font-sans">{unit}</span>}
    </div>
  )
}

function PropertySelect({
  value,
  options,
  onChange
}: {
  value: string
  options: { value: string; label: string }[]
  onChange?: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-24 px-2 py-1 text-xs bg-cad-panel border border-cad-border focus:border-cad-accent font-sans"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange?: (color: string) => void }) {
  const colors = ['#5c5c5c', '#9e2a2b', '#b86914', '#a08600', '#2d6a4f', '#1a4d8f', '#5a5096', '#8b4d6e']
  
  return (
    <div className="flex gap-1">
      {colors.map(color => (
        <button
          key={color}
          className={`w-5 h-5 border ${value === color ? 'border-cad-text ring-1 ring-cad-accent' : 'border-cad-border'}`}
          style={{ backgroundColor: color }}
          onClick={() => onChange?.(color)}
        />
      ))}
    </div>
  )
}

export function PropertyPanel() {
  const { selection, viewSettings, setDisplayMode, toggleViewSetting, leftPanelOpen, leftPanelWidth, chatPanelWidth } = useUIStore()
  const { document, updatePartColor, updatePartMaterial, updateFeature, updateDocumentName, updateDocumentUnits, renameFeature } = useDocumentStore()
  const { isOpen: isChatOpen } = useChatStore()
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  
  // Get selected feature
  const selectedFeature = selection.type === 'feature' && selection.ids.length > 0
    ? activePartStudio?.features.find(f => f.id === selection.ids[0])
    : null
    
  // Get selected part
  const selectedPart = selection.type === 'body' && selection.ids.length > 0
    ? activePartStudio?.parts.find(p => p.id === selection.ids[0])
    : null
  
  const leftOffset = leftPanelOpen ? leftPanelWidth : 0
  const rightOffset = isChatOpen ? chatPanelWidth : 0

  return (
    <div 
      className="fixed h-96 bg-cad-panel border-t border-cad-border flex flex-col z-20"
      style={{ 
        left: `${leftOffset}px`,
        right: `${rightOffset}px`,
        bottom: '28px' // Height of status bar
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cad-border bg-gray-50">
        <span className="font-semibold text-sm font-serif">Properties</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Feature properties */}
        {selectedFeature && (
          <>
            <PropertySection title={`${selectedFeature.type.charAt(0).toUpperCase() + selectedFeature.type.slice(1)} Properties`} icon={<Box size={16} />}>
              <PropertyRow label="Name">
                <PropertyInput 
                  value={selectedFeature.name} 
                  onChange={(val) => {
                    if (activePartStudio && val.trim()) {
                      renameFeature(activePartStudio.id, selectedFeature.id, val.trim())
                    }
                  }}
                />
              </PropertyRow>
              <PropertyRow label="Type">
                <span className="text-xs capitalize font-sans">{selectedFeature.type}</span>
              </PropertyRow>
              <PropertyRow label="Suppressed">
                <span className="text-xs font-sans">{selectedFeature.suppressed ? 'Yes' : 'No'}</span>
              </PropertyRow>
              
              {/* Feature-specific parameters */}
              {selectedFeature.type === 'extrude' && (
                <>
                  <div className="h-px bg-cad-border my-2" />
                  <PropertyRow label="Depth">
                    <PropertyInput 
                      value={selectedFeature.parameters.depth || 25} 
                      type="number"
                      unit="mm"
                      onChange={(val) => {
                        if (activePartStudio) {
                          updateFeature(activePartStudio.id, selectedFeature.id, {
                            depth: parseFloat(val) || 25
                          })
                        }
                      }}
                    />
                  </PropertyRow>
                  <PropertyRow label="Direction">
                    <PropertySelect
                      value={selectedFeature.parameters.direction || 'one'}
                      options={[
                        { value: 'one', label: 'One' },
                        { value: 'symmetric', label: 'Symmetric' },
                        { value: 'two', label: 'Two' }
                      ]}
                      onChange={(val) => {
                        if (activePartStudio) {
                          updateFeature(activePartStudio.id, selectedFeature.id, {
                            direction: val
                          })
                        }
                      }}
                    />
                  </PropertyRow>
                </>
              )}
              
              {selectedFeature.type === 'fillet' && (
                <>
                  <div className="h-px bg-cad-border my-2" />
                  <PropertyRow label="Radius">
                    <PropertyInput 
                      value={selectedFeature.parameters.radius || 5} 
                      type="number"
                      unit="mm"
                      min={0.1}
                      step={0.5}
                      onChange={(val) => {
                        if (activePartStudio) {
                          updateFeature(activePartStudio.id, selectedFeature.id, {
                            radius: parseFloat(val) || 5
                          })
                        }
                      }}
                    />
                  </PropertyRow>
                </>
              )}
              
              {selectedFeature.type === 'revolve' && (
                <>
                  <div className="h-px bg-cad-border my-2" />
                  <PropertyRow label="Angle">
                    <PropertyInput 
                      value={selectedFeature.parameters.angle || 360} 
                      type="number"
                      unit="°"
                      min={0}
                      max={360}
                      onChange={(val) => {
                        if (activePartStudio) {
                          updateFeature(activePartStudio.id, selectedFeature.id, {
                            angle: parseFloat(val) || 360
                          })
                        }
                      }}
                    />
                  </PropertyRow>
                </>
              )}
            </PropertySection>
          </>
        )}
        
        {/* Part properties */}
        {selectedPart && (
          <>
            <PropertySection title="Part Properties" icon={<Box size={16} />}>
              <PropertyRow label="Name">
                <span className="text-xs font-sans">{selectedPart.name}</span>
              </PropertyRow>
              <PropertyRow label="Material">
                <PropertySelect
                  value={selectedPart.material || 'steel'}
                  options={[
                    { value: 'steel', label: 'Steel' },
                    { value: 'aluminum', label: 'Aluminum' },
                    { value: 'brass', label: 'Brass' },
                    { value: 'plastic-abs', label: 'ABS Plastic' },
                    { value: 'plastic-pla', label: 'PLA' }
                  ]}
                  onChange={(val) => updatePartMaterial(selectedPart.id, val)}
                />
              </PropertyRow>
              <div className="mt-2">
                <span className="text-xs text-cad-text-dim block mb-1 font-sans">Color</span>
                <ColorPicker 
                  value={selectedPart.color} 
                  onChange={(color) => updatePartColor(selectedPart.id, color)}
                />
              </div>
            </PropertySection>
            
            <PropertySection title="Mass Properties" icon={<Ruler size={16} />} defaultOpen={false}>
              <div className="space-y-1 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-cad-text-dim">Volume:</span>
                  <span>27,000 mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cad-text-dim">Surface Area:</span>
                  <span>5,400 mm²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cad-text-dim">Mass:</span>
                  <span>0.212 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cad-text-dim">Density:</span>
                  <span>7.85 g/cm³</span>
                </div>
              </div>
            </PropertySection>
          </>
        )}
        
        {/* No selection or document selected - show general properties */}
        {(selection.ids.length === 0 || selection.type === 'document') && (
          <>
            <PropertySection title="Document" icon={<Layers size={16} />}>
              <PropertyRow label="Name">
                <PropertyInput 
                  value={document?.name || 'New Part'} 
                  onChange={(val) => {
                    if (val.trim()) {
                      updateDocumentName(val.trim())
                    }
                  }}
                />
              </PropertyRow>
              <PropertyRow label="Units">
                <PropertySelect
                  value={document?.units || 'mm'}
                  options={[
                    { value: 'mm', label: 'mm' },
                    { value: 'inch', label: 'inch' },
                    { value: 'm', label: 'm' }
                  ]}
                  onChange={(val) => {
                    updateDocumentUnits(val as 'mm' | 'inch' | 'm')
                  }}
                />
              </PropertyRow>
            </PropertySection>

            <PropertySection title="Display" icon={<Palette size={16} />}>
              <PropertyRow label="Mode">
                <PropertySelect
                  value={viewSettings.displayMode}
                  options={[
                    { value: 'shadedEdges', label: 'Shaded + Edges' },
                    { value: 'shaded', label: 'Shaded' },
                    { value: 'wireframe', label: 'Wireframe' },
                    { value: 'hidden', label: 'Hidden Lines' }
                  ]}
                  onChange={(val) => setDisplayMode(val as any)}
                />
              </PropertyRow>
              <div className="space-y-1 mt-2 font-sans">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={viewSettings.showGrid}
                    onChange={() => toggleViewSetting('showGrid')}
                    className="rounded accent-cad-accent"
                  />
                  Show Grid
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={viewSettings.showOrigin}
                    onChange={() => toggleViewSetting('showOrigin')}
                    className="rounded accent-cad-accent"
                  />
                  Show Origin
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={viewSettings.showPlanes}
                    onChange={() => toggleViewSetting('showPlanes')}
                    className="rounded accent-cad-accent"
                  />
                  Show Planes
                </label>
              </div>
            </PropertySection>
            
            <PropertySection title="Info" icon={<Info size={16} />} defaultOpen={false}>
              <div className="text-xs text-cad-text-dim space-y-1 font-sans">
                <p className="font-serif">FEAI v1.0.0</p>
                <p>Select features or parts to view and edit their properties.</p>
                <p className="mt-2">
                  <strong>Shortcuts:</strong><br />
                  ESC — Cancel/Exit<br />
                  Delete — Remove selected<br />
                  Double-click — Edit feature
                </p>
              </div>
            </PropertySection>
          </>
        )}
      </div>

      {/* Quick actions */}
      {(selectedFeature || selectedPart) && (
        <div className="p-3 border-t border-cad-border bg-gray-50">
          <div className="flex gap-2 font-sans">
            <button 
              className="flex-1 px-3 py-1.5 text-xs bg-cad-panel border border-cad-border hover:bg-gray-50 transition-colors"
              onClick={() => {
                // Duplicate feature/part
              }}
            >
              Duplicate
            </button>
            <button 
              className="flex-1 px-3 py-1.5 text-xs bg-cad-error/10 border border-cad-error/30 hover:bg-cad-error/20 text-cad-error transition-colors"
              onClick={() => {
                if (selectedFeature && activePartStudio) {
                  useDocumentStore.getState().deleteFeature(activePartStudio.id, selectedFeature.id)
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
