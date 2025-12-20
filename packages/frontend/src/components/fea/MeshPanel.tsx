/**
 * MeshPanel - Mesh generation controls and preview
 */

import React, { useState } from 'react';
import { useFEAStore } from '../../store/feaStore';
import { useDocumentStore } from '../../store/documentStore';
import { FEA_ELEMENT_TYPES, FEAElementType } from '@feai/shared';

export function MeshPanel() {
  const { document } = useDocumentStore();
  const {
    meshSettings,
    setMeshSettings,
    mesh,
    isMeshing,
    meshError,
    generateMesh,
    clearMesh,
    showMeshPreview,
  } = useFEAStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get the active part studio ID
  const partStudioId = document?.activeElementId || '';
  const hasDocument = !!document;
  const hasActiveElement = !!partStudioId && document?.activeElementType === 'partStudio';

  const handleGenerateMesh = () => {
    if (!hasDocument) {
      alert('Please create or open a document first');
      return;
    }
    if (!hasActiveElement) {
      alert('Please create a part studio with geometry first');
      return;
    }
    generateMesh(partStudioId);
  };

  const elementTypeOptions: { value: FEAElementType; label: string }[] = [
    { value: 'C3D4', label: 'Linear Tet (C3D4) - Fast' },
    { value: 'C3D10', label: 'Quadratic Tet (C3D10) - Accurate' },
    { value: 'C3D8', label: 'Linear Hex (C3D8)' },
    { value: 'C3D20', label: 'Quadratic Hex (C3D20)' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Element Size */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Element Size (mm)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="2"
            max="50"
            step="0.5"
            value={meshSettings.globalSize}
            onChange={(e) => setMeshSettings({ globalSize: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-cad-border appearance-none cursor-pointer accent-cad-accent"
          />
          <input
            type="number"
            min="2"
            value={meshSettings.globalSize}
            onChange={(e) => setMeshSettings({ globalSize: Math.max(2, parseFloat(e.target.value) || 5) })}
            className="w-16 px-2 py-1 bg-white border border-cad-border text-sm text-cad-text text-center"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-cad-text-dim">
            Smaller = more elements, higher accuracy
          </p>
          {meshSettings.globalSize < 3 && (
            <p className="text-xs text-yellow-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Warning: Small element size may create millions of elements and freeze your browser!
            </p>
          )}
        </div>
      </div>

      {/* Element Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Element Type
        </label>
        <select
          value={meshSettings.elementType}
          onChange={(e) => setMeshSettings({ elementType: e.target.value as FEAElementType })}
          className="w-full px-3 py-2 bg-white border border-cad-border text-sm text-cad-text focus:border-blue-500 focus:ring-1 focus:ring-cad-accent"
        >
          {elementTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs text-cad-text-dim hover:text-cad-text transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="pl-4 space-y-3 border-l-2 border-cad-border">
          {/* Min/Max Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-cad-text-dim">Min Size</label>
              <input
                type="number"
                value={meshSettings.minSize || ''}
                onChange={(e) => setMeshSettings({ minSize: parseFloat(e.target.value) || undefined })}
                placeholder="Auto"
                className="w-full px-2 py-1 bg-white border border-cad-border text-sm text-cad-text"
              />
            </div>
            <div>
              <label className="text-xs text-cad-text-dim">Max Size</label>
              <input
                type="number"
                value={meshSettings.maxSize || ''}
                onChange={(e) => setMeshSettings({ maxSize: parseFloat(e.target.value) || undefined })}
                placeholder="Auto"
                className="w-full px-2 py-1 bg-white border border-cad-border text-sm text-cad-text"
              />
            </div>
          </div>

          {/* Growth Rate */}
          <div>
            <label className="text-xs text-cad-text-dim">Growth Rate</label>
            <input
              type="number"
              min="1.1"
              max="2"
              step="0.1"
              value={meshSettings.growthRate || 1.5}
              onChange={(e) => setMeshSettings({ growthRate: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 bg-white border border-cad-border text-sm text-cad-text"
            />
          </div>

          {/* Curvature Sensitivity */}
          <div>
            <label className="text-xs text-cad-text-dim">Curvature Sensitivity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={meshSettings.curvatureSensitivity || 0.5}
              onChange={(e) => setMeshSettings({ curvatureSensitivity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-cad-border appearance-none cursor-pointer accent-cad-accent"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!hasDocument || !hasActiveElement ? (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
          {!hasDocument 
            ? 'Please create or open a document first'
            : 'Please create a part studio with geometry first'
          }
        </div>
      ) : null}

      <button
        onClick={handleGenerateMesh}
        disabled={isMeshing || !hasActiveElement}
        className={`
          w-full py-2 px-4 font-medium flex items-center justify-center gap-2 transition-all
          ${isMeshing
            ? 'bg-cad-accent/20 text-cad-accent'
            : !hasActiveElement
            ? 'bg-cad-border/50 text-cad-text-dim cursor-not-allowed'
            : 'bg-cad-accent/10 text-cad-accent hover:bg-cad-accent/20 border border-blue-500/30'
          }
        `}
      >
        {isMeshing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Generate Mesh</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {meshError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {meshError}
        </div>
      )}

      {/* Mesh Statistics */}
      {mesh && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 space-y-2">
          <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mesh Generated
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-cad-text-dim">Nodes:</div>
            <div className="text-cad-text font-medium">{mesh.nodeCount.toLocaleString()}</div>
            <div className="text-cad-text-dim">Elements:</div>
            <div className="text-cad-text font-medium">{mesh.elementCount.toLocaleString()}</div>
            <div className="text-cad-text-dim">Type:</div>
            <div className="text-cad-text font-medium">{mesh.elementType}</div>
          </div>
          
          {mesh.quality && (
            <div className="pt-2 border-t border-green-500/20">
              <div className="text-xs text-green-400 mb-1">Quality</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="text-cad-text-dim">Aspect Ratio:</div>
                <div className="text-cad-text">{mesh.quality.avgAspectRatio.toFixed(2)}</div>
                {mesh.quality.warningCount > 0 && (
                  <>
                    <div className="text-yellow-400">Warnings:</div>
                    <div className="text-yellow-400">{mesh.quality.warningCount}</div>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            onClick={clearMesh}
            className="w-full mt-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Clear Mesh
          </button>
        </div>
      )}

      {/* Preview Toggle (informational) */}
      <div className="flex items-center justify-between text-xs text-cad-text-dim">
        <span>Mesh preview in viewport</span>
        <div className={`w-8 h-4 ${showMeshPreview ? 'bg-cad-accent' : 'bg-cad-border'} relative`}>
          <div className={`absolute top-0.5 w-3 h-3 bg-white transition-all ${showMeshPreview ? 'left-4' : 'left-0.5'}`} />
        </div>
      </div>
    </div>
  );
}

