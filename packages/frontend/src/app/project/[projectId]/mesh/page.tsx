'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Grid3X3, 
  RefreshCw, 
  Trash2,
  AlertCircle,
  Check,
  Settings
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useWorkflowStore } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';
import { useDocumentStore } from '@/store/documentStore';
import { useSchematicStore } from '@/store/schematicStore';
import { apiClient } from '@/api/client';

// Dynamically import 3D viewport for mesh preview
const Viewport3D = dynamic(() => import('@/components/Viewport3D').then(m => ({ default: m.Viewport3D })), { ssr: false });

type ElementType = 'C3D4' | 'C3D10' | 'C3D8' | 'C3D20';

const ELEMENT_TYPE_OPTIONS: { value: ElementType; label: string; description: string }[] = [
  { value: 'C3D4', label: 'Linear Tetrahedron (C3D4)', description: 'Fast, less accurate' },
  { value: 'C3D10', label: 'Quadratic Tetrahedron (C3D10)', description: 'Accurate, more elements' },
  { value: 'C3D8', label: 'Linear Hexahedron (C3D8)', description: 'For structured meshes' },
  { value: 'C3D20', label: 'Quadratic Hexahedron (C3D20)', description: 'Most accurate' },
];

export default function MeshPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const {
    meshSettings,
    setMeshSettings,
    meshData,
    setMeshData,
    isMeshing,
    setMeshing,
    meshError,
    setMeshError,
    setGeometryReady,
    updateStepStatus,
    setCurrentStep,
  } = useWorkflowStore();

  const { fetchProject, currentProject } = useProjectStore();
  const { document, loadDocumentFromData } = useDocumentStore();
  const { getNodesByType, markNodeComplete } = useSchematicStore();
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setCurrentStep('mesh');
    updateStepStatus('mesh', 'in-progress');
    fetchProject(projectId).then((project) => {
      if (project?.data) {
        loadDocumentFromData(project.data);
      }
    });
  }, [projectId]);

  const hasGeometry =
    !!document &&
    (() => {
      const activePartStudio = document.partStudios.find((ps) => ps.id === document.activeElementId);
      return !!(activePartStudio?.parts && activePartStudio.parts.length > 0);
    })();

  useEffect(() => {
    setGeometryReady(hasGeometry);
  }, [hasGeometry, setGeometryReady]);

  const generateMesh = useCallback(async () => {
    if (!document) {
      setMeshError('No geometry loaded');
      return;
    }

    const activePartStudio = document.partStudios.find(ps => ps.id === document.activeElementId);
    if (!activePartStudio?.parts || activePartStudio.parts.length === 0) {
      setMeshError('No parts found in geometry. Please create geometry first.');
      return;
    }

    setMeshing(true);
    setMeshError(null);

    try {
      // Validate mesh settings
      if (meshSettings.globalSize < 2) {
        throw new Error('Element size too small! Minimum is 2mm.');
      }

      // Check geometry complexity
      let totalVertices = 0;
      for (const part of activePartStudio.parts) {
        if (part.mesh?.vertices) {
          totalVertices += part.mesh.vertices.length;
        }
      }

      if (totalVertices > 30000) {
        throw new Error(
          `Geometry too complex (${(totalVertices / 3).toLocaleString()} vertices)! ` +
          `Simplify the model or increase element size.`
        );
      }

      // Prepare parts data
      const partsWithMesh = activePartStudio.parts.map((part: any) => ({
        id: part.id,
        name: part.name,
        meshData: part.mesh
      }));

      // Generate mesh via API
      const response = await apiClient.generateMesh(activePartStudio.id, {
        ...meshSettings,
        parts: partsWithMesh
      });

      setMeshData({
        nodeCount: response.mesh.nodeCount,
        elementCount: response.mesh.elementCount,
        elementType: response.mesh.elementType,
        quality: response.mesh.quality,
        nodes: response.mesh.nodes,
        elements: response.mesh.elements,
      });
      updateStepStatus('mesh', 'complete');
      getNodesByType('mesh').forEach((n) => markNodeComplete(n.id));

    } catch (error: any) {
      console.error('[Mesh] Generation failed:', error);
      setMeshError(error.message || 'Mesh generation failed');
    } finally {
      setMeshing(false);
    }
  }, [document, meshSettings, setMeshData, setMeshing, setMeshError, updateStepStatus, getNodesByType, markNodeComplete]);

  const clearMesh = () => {
    setMeshData(null);
    setMeshError(null);
  };

  const canGenerateMesh = hasGeometry && !isMeshing;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="logo-link flex items-center gap-2 no-underline">
            <Logo size="md" />
          </Link>
          <div className="w-px h-6 bg-cad-border" />
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-cad-accent" />
            <h1 className="font-serif text-lg text-cad-text">Mesh Generation</h1>
          </div>
          <span className="text-xs text-cad-text-dim font-sans">
            {currentProject?.name || 'Project'}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mesh Controls */}
            <div className="space-y-6">
              {/* Geometry Status */}
              <div className={`p-4 border ${hasGeometry ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2">
                  {hasGeometry ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-sans text-sm">Geometry ready for meshing</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-700 font-sans text-sm">No geometry found</span>
                    </>
                  )}
                </div>
              </div>

              {/* Mesh Settings */}
              <div className="bg-white border border-cad-border">
                <div className="p-4 border-b border-cad-border">
                  <h2 className="font-serif text-lg text-cad-text">Mesh Settings</h2>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Element Size */}
                  <div>
                    <label className="block text-xs text-cad-text-dim font-sans mb-2">
                      Element Size (mm)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="2"
                        max="50"
                        step="0.5"
                        value={meshSettings.globalSize}
                        onChange={(e) => setMeshSettings({ globalSize: parseFloat(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-cad-accent"
                      />
                      <input
                        type="number"
                        min="2"
                        value={meshSettings.globalSize}
                        onChange={(e) => setMeshSettings({ globalSize: Math.max(2, parseFloat(e.target.value) || 10) })}
                        className="w-20 px-3 py-2 border border-cad-border text-sm font-sans text-center focus:outline-none focus:border-cad-accent"
                      />
                    </div>
                    <p className="text-xs text-cad-text-dim font-sans mt-1">
                      Smaller = more elements, higher accuracy
                    </p>
                    {meshSettings.globalSize < 5 && (
                      <p className="text-xs text-yellow-600 font-sans mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Small element size may create many elements
                      </p>
                    )}
                  </div>

                  {/* Element Type */}
                  <div>
                    <label className="block text-xs text-cad-text-dim font-sans mb-2">
                      Element Type
                    </label>
                    <select
                      value={meshSettings.elementType}
                      onChange={(e) => setMeshSettings({ elementType: e.target.value as ElementType })}
                      className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                    >
                      {ELEMENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-cad-text-dim font-sans mt-1">
                      {ELEMENT_TYPE_OPTIONS.find(o => o.value === meshSettings.elementType)?.description}
                    </p>
                  </div>

                  {/* Advanced Options Toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-cad-text-dim hover:text-cad-text font-sans transition-colors"
                  >
                    <Settings className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                    Advanced Options
                  </button>

                  {/* Advanced Options */}
                  {showAdvanced && (
                    <div className="pl-4 space-y-4 border-l-2 border-cad-border">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-cad-text-dim font-sans mb-1">
                            Min Size (mm)
                          </label>
                          <input
                            type="number"
                            value={meshSettings.minSize || ''}
                            onChange={(e) => setMeshSettings({ minSize: parseFloat(e.target.value) || undefined })}
                            placeholder="Auto"
                            className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-cad-text-dim font-sans mb-1">
                            Max Size (mm)
                          </label>
                          <input
                            type="number"
                            value={meshSettings.maxSize || ''}
                            onChange={(e) => setMeshSettings({ maxSize: parseFloat(e.target.value) || undefined })}
                            placeholder="Auto"
                            className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Growth Rate
                        </label>
                        <input
                          type="number"
                          min="1.1"
                          max="2"
                          step="0.1"
                          value={meshSettings.growthRate}
                          onChange={(e) => setMeshSettings({ growthRate: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">
                          Curvature Sensitivity: {(meshSettings.curvatureSensitivity * 100).toFixed(0)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={meshSettings.curvatureSensitivity}
                          onChange={(e) => setMeshSettings({ curvatureSensitivity: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-cad-accent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={generateMesh}
                    disabled={!canGenerateMesh}
                    className={`
                      w-full py-3 font-sans text-sm font-medium flex items-center justify-center gap-2 transition-all
                      ${isMeshing
                        ? 'bg-cad-accent/20 text-cad-accent'
                        : !canGenerateMesh
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-cad-accent text-white hover:bg-cad-accent-hover'
                      }
                    `}
                  >
                    {isMeshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Mesh...
                      </>
                    ) : (
                      <>
                        <Grid3X3 className="w-4 h-4" />
                        Generate Mesh
                      </>
                    )}
                  </button>

                  {/* Error Message */}
                  {meshError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {meshError}
                    </div>
                  )}
                </div>
              </div>

              {/* Mesh Statistics */}
              {meshData && (
                <div className="bg-white border border-green-200">
                  <div className="p-4 border-b border-green-200 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <h3 className="font-serif text-base text-green-700">Mesh Generated</h3>
                      </div>
                      <button
                        onClick={clearMesh}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear mesh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-cad-text-dim font-sans">Nodes</span>
                        <p className="text-lg font-sans font-semibold text-cad-text">
                          {meshData.nodeCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-cad-text-dim font-sans">Elements</span>
                        <p className="text-lg font-sans font-semibold text-cad-text">
                          {meshData.elementCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-cad-text-dim font-sans">
                      Element Type: <span className="text-cad-text font-medium">{meshData.elementType}</span>
                    </div>
                    
                    {meshData.quality && (
                      <div className="pt-3 border-t border-cad-border space-y-2">
                        <span className="text-xs text-cad-text-dim font-sans">Quality Metrics</span>
                        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                          <div>
                            <span className="text-cad-text-dim">Avg Aspect Ratio:</span>
                            <span className="ml-1 text-cad-text font-medium">
                              {meshData.quality.avgAspectRatio.toFixed(2)}
                            </span>
                          </div>
                          {meshData.quality.warningCount > 0 && (
                            <div className="text-yellow-600">
                              Warnings: {meshData.quality.warningCount}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mesh Preview */}
            <div className="lg:col-span-2 bg-white border border-cad-border">
              <div className="p-4 border-b border-cad-border">
                <h2 className="font-serif text-lg text-cad-text">Mesh Preview</h2>
              </div>
              
              <div className="h-[600px] relative">
                <Viewport3D />
                
                {!hasGeometry && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-cad-text-dim font-sans">No geometry loaded</p>
                      <p className="mt-2 text-sm text-cad-accent font-sans">
                        Create geometry first
                      </p>
                    </div>
                  </div>
                )}
                
                {isMeshing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 text-cad-accent mx-auto mb-4 animate-spin" />
                      <p className="text-cad-text font-sans">Generating mesh...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
