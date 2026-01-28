'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  Plus, 
  Trash2,
  Lock,
  Move,
  ArrowDown,
  Thermometer,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useWorkflowStore, BoundaryConditionDef, LoadDef } from '@/store/workflowStore';
import { useProjectStore } from '@/store/projectStore';
import { useDocumentStore } from '@/store/documentStore';

// Dynamically import 3D viewport
const Viewport3D = dynamic(() => import('@/components/Viewport3D').then(m => ({ default: m.Viewport3D })), { ssr: false });

const BC_TYPES = [
  { value: 'fixed', label: 'Fixed Support', icon: Lock, description: 'Constrains all degrees of freedom' },
  { value: 'displacement', label: 'Displacement', icon: Move, description: 'Prescribed displacement values' },
  { value: 'symmetry', label: 'Symmetry', icon: () => <span>⟷</span>, description: 'Symmetry boundary condition' },
];

const LOAD_TYPES = [
  { value: 'gravity', label: 'Gravity', icon: ArrowDown, description: 'Body force due to gravity' },
  { value: 'pressure', label: 'Pressure', icon: () => <span>⊗</span>, description: 'Surface pressure load' },
  { value: 'point_force', label: 'Point Force', icon: () => <span>→</span>, description: 'Concentrated force at a point' },
  { value: 'surface_force', label: 'Surface Force', icon: () => <span>⇒</span>, description: 'Distributed surface force' },
  { value: 'thermal', label: 'Thermal', icon: Thermometer, description: 'Temperature change' },
  { value: 'centrifugal', label: 'Centrifugal', icon: RotateCcw, description: 'Rotational body force' },
];

export default function SetupPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const {
    meshData,
    boundaryConditions,
    loads,
    addBoundaryCondition,
    updateBoundaryCondition,
    removeBoundaryCondition,
    toggleBoundaryCondition,
    addLoad,
    updateLoad,
    removeLoad,
    toggleLoad,
    updateStepStatus,
    setCurrentStep,
  } = useWorkflowStore();

  const { fetchProject } = useProjectStore();
  const { document, loadDocumentFromData } = useDocumentStore();

  const [activeTab, setActiveTab] = useState<'bc' | 'loads'>('bc');
  const [showAddBC, setShowAddBC] = useState(false);
  const [showAddLoad, setShowAddLoad] = useState(false);
  const [selectedBCType, setSelectedBCType] = useState<string>('fixed');
  const [selectedLoadType, setSelectedLoadType] = useState<string>('gravity');
  const [expandedBC, setExpandedBC] = useState<string | null>(null);
  const [expandedLoad, setExpandedLoad] = useState<string | null>(null);

  // Form state for new BC
  const [bcForm, setBcForm] = useState({
    name: '',
    targetType: 'box' as 'point' | 'box' | 'sphere',
    location: [0, 0, 0] as [number, number, number],
    min: [-10, -10, -10] as [number, number, number],
    max: [10, 10, 10] as [number, number, number],
    radius: 5,
    displacementX: 0,
    displacementY: 0,
    displacementZ: 0,
    planeNormal: [1, 0, 0] as [number, number, number],
  });

  // Form state for new Load
  const [loadForm, setLoadForm] = useState({
    name: '',
    targetType: 'point' as 'point' | 'box' | 'sphere',
    location: [0, 0, 0] as [number, number, number],
    min: [-10, -10, -10] as [number, number, number],
    max: [10, 10, 10] as [number, number, number],
    radius: 5,
    accelerationX: 0,
    accelerationY: -9.81,
    accelerationZ: 0,
    pressure: 1e6,
    forceX: 0,
    forceY: 0,
    forceZ: -1000,
    refTemp: 20,
    appliedTemp: 100,
    angularVelocity: 100,
    axisDirection: [0, 1, 0] as [number, number, number],
  });

  useEffect(() => {
    setCurrentStep('setup');
    updateStepStatus('setup', 'in-progress');
    
    fetchProject(projectId).then((project) => {
      if (project?.data) {
        loadDocumentFromData(project.data);
      }
    });
  }, [projectId]);

  const handleAddBC = () => {
    const bc: Omit<BoundaryConditionDef, 'id'> = {
      type: selectedBCType as any,
      name: bcForm.name || `${BC_TYPES.find(t => t.value === selectedBCType)?.label} ${boundaryConditions.length + 1}`,
      target: {
        type: bcForm.targetType,
        ...(bcForm.targetType === 'point' && { location: bcForm.location }),
        ...(bcForm.targetType === 'box' && { min: bcForm.min, max: bcForm.max }),
        ...(bcForm.targetType === 'sphere' && { center: bcForm.location, radius: bcForm.radius }),
      },
      enabled: true,
    };

    if (selectedBCType === 'displacement') {
      bc.values = [bcForm.displacementX, bcForm.displacementY, bcForm.displacementZ];
    }
    if (selectedBCType === 'symmetry') {
      bc.planeNormal = bcForm.planeNormal;
    }

    addBoundaryCondition(bc);
    setShowAddBC(false);
    setBcForm({ ...bcForm, name: '' });
  };

  const handleAddLoad = () => {
    const load: Omit<LoadDef, 'id'> = {
      type: selectedLoadType as any,
      name: loadForm.name || `${LOAD_TYPES.find(t => t.value === selectedLoadType)?.label} ${loads.length + 1}`,
      enabled: true,
    };

    if (selectedLoadType === 'gravity') {
      load.acceleration = [loadForm.accelerationX, loadForm.accelerationY, loadForm.accelerationZ];
    } else if (selectedLoadType === 'pressure') {
      load.target = {
        type: loadForm.targetType,
        ...(loadForm.targetType === 'box' && { min: loadForm.min, max: loadForm.max }),
        ...(loadForm.targetType === 'sphere' && { center: loadForm.location, radius: loadForm.radius }),
      };
      load.value = loadForm.pressure;
    } else if (selectedLoadType === 'point_force') {
      load.location = loadForm.location;
      load.force = [loadForm.forceX, loadForm.forceY, loadForm.forceZ];
    } else if (selectedLoadType === 'surface_force') {
      load.target = {
        type: loadForm.targetType,
        ...(loadForm.targetType === 'box' && { min: loadForm.min, max: loadForm.max }),
      };
      load.forcePerArea = [loadForm.forceX, loadForm.forceY, loadForm.forceZ];
    } else if (selectedLoadType === 'thermal') {
      load.referenceTemperature = loadForm.refTemp;
      load.appliedTemperature = loadForm.appliedTemp;
    } else if (selectedLoadType === 'centrifugal') {
      load.axisPoint = [0, 0, 0];
      load.axisDirection = loadForm.axisDirection;
      load.angularVelocity = loadForm.angularVelocity;
    }

    addLoad(load);
    setShowAddLoad(false);
    setLoadForm({ ...loadForm, name: '' });
  };

  const handleContinue = () => {
    updateStepStatus('setup', 'complete');
    router.push(`/project/${projectId}/results`);
  };

  const activeBCs = boundaryConditions.filter(bc => bc.enabled);
  const activeLoads = loads.filter(l => l.enabled);
  const canContinue = activeBCs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-cad-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}/schematic`}
              className="flex items-center gap-2 text-cad-text-dim hover:text-cad-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-sans">Schematic</span>
            </Link>
            <div className="w-px h-6 bg-cad-border" />
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-cad-accent" />
              <h1 className="font-serif text-lg text-cad-text">Analysis Setup</h1>
            </div>
          </div>
          
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 px-4 py-2 bg-cad-accent text-white text-sm font-sans hover:bg-cad-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Results
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Setup Controls */}
            <div className="space-y-6">
              {/* Mesh Status */}
              {!meshData && (
                <div className="p-4 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-sans text-sm">No mesh generated</span>
                  </div>
                  <Link
                    href={`/project/${projectId}/mesh`}
                    className="mt-2 inline-block text-sm text-cad-accent hover:underline font-sans"
                  >
                    Go to Mesh →
                  </Link>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b border-cad-border">
                <button
                  onClick={() => setActiveTab('bc')}
                  className={`flex-1 py-3 text-sm font-sans font-medium border-b-2 transition-colors ${
                    activeTab === 'bc'
                      ? 'text-cad-accent border-cad-accent'
                      : 'text-cad-text-dim border-transparent hover:text-cad-text'
                  }`}
                >
                  Boundary Conditions ({activeBCs.length})
                </button>
                <button
                  onClick={() => setActiveTab('loads')}
                  className={`flex-1 py-3 text-sm font-sans font-medium border-b-2 transition-colors ${
                    activeTab === 'loads'
                      ? 'text-cad-accent border-cad-accent'
                      : 'text-cad-text-dim border-transparent hover:text-cad-text'
                  }`}
                >
                  Loads ({activeLoads.length})
                </button>
              </div>

              {/* Boundary Conditions Panel */}
              {activeTab === 'bc' && (
                <div className="bg-white border border-cad-border">
                  <div className="p-4 border-b border-cad-border flex items-center justify-between">
                    <h2 className="font-serif text-base text-cad-text">Supports & Constraints</h2>
                    <button
                      onClick={() => setShowAddBC(!showAddBC)}
                      className="flex items-center gap-1 px-2 py-1 text-cad-accent text-sm font-sans hover:bg-cad-accent/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Add BC Form */}
                  {showAddBC && (
                    <div className="p-4 border-b border-cad-border bg-gray-50 space-y-4">
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">Type</label>
                        <select
                          value={selectedBCType}
                          onChange={(e) => setSelectedBCType(e.target.value)}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        >
                          {BC_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">Name (optional)</label>
                        <input
                          type="text"
                          value={bcForm.name}
                          onChange={(e) => setBcForm({ ...bcForm, name: e.target.value })}
                          placeholder="Auto-generated"
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">Target Region</label>
                        <select
                          value={bcForm.targetType}
                          onChange={(e) => setBcForm({ ...bcForm, targetType: e.target.value as any })}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        >
                          <option value="box">Box Region</option>
                          <option value="point">Point</option>
                          <option value="sphere">Sphere Region</option>
                        </select>
                      </div>

                      {bcForm.targetType === 'box' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-cad-text-dim font-sans mb-1">Min (X, Y, Z)</label>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <input
                                  key={i}
                                  type="number"
                                  value={bcForm.min[i]}
                                  onChange={(e) => {
                                    const newMin = [...bcForm.min] as [number, number, number];
                                    newMin[i] = parseFloat(e.target.value) || 0;
                                    setBcForm({ ...bcForm, min: newMin });
                                  }}
                                  className="w-full px-2 py-1 border border-cad-border text-xs font-sans"
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-cad-text-dim font-sans mb-1">Max (X, Y, Z)</label>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <input
                                  key={i}
                                  type="number"
                                  value={bcForm.max[i]}
                                  onChange={(e) => {
                                    const newMax = [...bcForm.max] as [number, number, number];
                                    newMax[i] = parseFloat(e.target.value) || 0;
                                    setBcForm({ ...bcForm, max: newMax });
                                  }}
                                  className="w-full px-2 py-1 border border-cad-border text-xs font-sans"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBCType === 'displacement' && (
                        <div>
                          <label className="block text-xs text-cad-text-dim font-sans mb-1">Displacement (X, Y, Z) mm</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={bcForm.displacementX}
                              onChange={(e) => setBcForm({ ...bcForm, displacementX: parseFloat(e.target.value) || 0 })}
                              placeholder="X"
                              className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                            />
                            <input
                              type="number"
                              value={bcForm.displacementY}
                              onChange={(e) => setBcForm({ ...bcForm, displacementY: parseFloat(e.target.value) || 0 })}
                              placeholder="Y"
                              className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                            />
                            <input
                              type="number"
                              value={bcForm.displacementZ}
                              onChange={(e) => setBcForm({ ...bcForm, displacementZ: parseFloat(e.target.value) || 0 })}
                              placeholder="Z"
                              className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleAddBC}
                        className="w-full py-2 bg-cad-accent text-white text-sm font-sans hover:bg-cad-accent-hover transition-colors"
                      >
                        Add Boundary Condition
                      </button>
                    </div>
                  )}

                  {/* BC List */}
                  <div className="divide-y divide-cad-border max-h-[400px] overflow-y-auto">
                    {boundaryConditions.length === 0 ? (
                      <div className="p-8 text-center text-cad-text-dim text-sm font-sans">
                        No boundary conditions defined
                      </div>
                    ) : (
                      boundaryConditions.map((bc) => {
                        const typeInfo = BC_TYPES.find(t => t.value === bc.type);
                        const Icon = typeInfo?.icon || Lock;
                        
                        return (
                          <div key={bc.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleBoundaryCondition(bc.id)}
                                  className={`p-1 ${bc.enabled ? 'text-cad-accent' : 'text-gray-300'}`}
                                >
                                  {bc.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <Icon className={`w-4 h-4 ${bc.enabled ? 'text-cad-accent' : 'text-gray-400'}`} />
                                <span className={`text-sm font-sans ${bc.enabled ? 'text-cad-text' : 'text-gray-400'}`}>
                                  {bc.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setExpandedBC(expandedBC === bc.id ? null : bc.id)}
                                  className="p-1 text-gray-400 hover:text-cad-text"
                                >
                                  {expandedBC === bc.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => removeBoundaryCondition(bc.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {expandedBC === bc.id && (
                              <div className="mt-2 pl-8 text-xs text-cad-text-dim font-sans space-y-1">
                                <div>Type: {typeInfo?.label}</div>
                                <div>Target: {bc.target.type}</div>
                                {bc.values && <div>Values: [{bc.values.join(', ')}]</div>}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Loads Panel */}
              {activeTab === 'loads' && (
                <div className="bg-white border border-cad-border">
                  <div className="p-4 border-b border-cad-border flex items-center justify-between">
                    <h2 className="font-serif text-base text-cad-text">Applied Loads</h2>
                    <button
                      onClick={() => setShowAddLoad(!showAddLoad)}
                      className="flex items-center gap-1 px-2 py-1 text-cad-accent text-sm font-sans hover:bg-cad-accent/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Add Load Form */}
                  {showAddLoad && (
                    <div className="p-4 border-b border-cad-border bg-gray-50 space-y-4">
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">Type</label>
                        <select
                          value={selectedLoadType}
                          onChange={(e) => setSelectedLoadType(e.target.value)}
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        >
                          {LOAD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-cad-text-dim font-sans mb-1">Name (optional)</label>
                        <input
                          type="text"
                          value={loadForm.name}
                          onChange={(e) => setLoadForm({ ...loadForm, name: e.target.value })}
                          placeholder="Auto-generated"
                          className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                        />
                      </div>

                      {selectedLoadType === 'gravity' && (
                        <div>
                          <label className="block text-xs text-cad-text-dim font-sans mb-1">Acceleration (m/s²)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={loadForm.accelerationX}
                              onChange={(e) => setLoadForm({ ...loadForm, accelerationX: parseFloat(e.target.value) || 0 })}
                              placeholder="X"
                              className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                            />
                            <input
                              type="number"
                              value={loadForm.accelerationY}
                              onChange={(e) => setLoadForm({ ...loadForm, accelerationY: parseFloat(e.target.value) || 0 })}
                              placeholder="Y"
                              className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                            />
                            <input
                              type="number"
                              value={loadForm.accelerationZ}
                              onChange={(e) => setLoadForm({ ...loadForm, accelerationZ: parseFloat(e.target.value) || 0 })}
                              placeholder="Z"
                              className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                            />
                          </div>
                        </div>
                      )}

                      {selectedLoadType === 'point_force' && (
                        <>
                          <div>
                            <label className="block text-xs text-cad-text-dim font-sans mb-1">Location (mm)</label>
                            <div className="flex gap-2">
                              {[0, 1, 2].map((i) => (
                                <input
                                  key={i}
                                  type="number"
                                  value={loadForm.location[i]}
                                  onChange={(e) => {
                                    const newLoc = [...loadForm.location] as [number, number, number];
                                    newLoc[i] = parseFloat(e.target.value) || 0;
                                    setLoadForm({ ...loadForm, location: newLoc });
                                  }}
                                  className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-cad-text-dim font-sans mb-1">Force (N)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={loadForm.forceX}
                                onChange={(e) => setLoadForm({ ...loadForm, forceX: parseFloat(e.target.value) || 0 })}
                                placeholder="Fx"
                                className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                              />
                              <input
                                type="number"
                                value={loadForm.forceY}
                                onChange={(e) => setLoadForm({ ...loadForm, forceY: parseFloat(e.target.value) || 0 })}
                                placeholder="Fy"
                                className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                              />
                              <input
                                type="number"
                                value={loadForm.forceZ}
                                onChange={(e) => setLoadForm({ ...loadForm, forceZ: parseFloat(e.target.value) || 0 })}
                                placeholder="Fz"
                                className="flex-1 px-2 py-1 border border-cad-border text-xs font-sans"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {selectedLoadType === 'pressure' && (
                        <div>
                          <label className="block text-xs text-cad-text-dim font-sans mb-1">Pressure (Pa)</label>
                          <input
                            type="number"
                            value={loadForm.pressure}
                            onChange={(e) => setLoadForm({ ...loadForm, pressure: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-cad-border text-sm font-sans focus:outline-none focus:border-cad-accent"
                          />
                        </div>
                      )}

                      {selectedLoadType === 'thermal' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-cad-text-dim font-sans mb-1">Reference Temp (°C)</label>
                            <input
                              type="number"
                              value={loadForm.refTemp}
                              onChange={(e) => setLoadForm({ ...loadForm, refTemp: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-cad-border text-sm font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-cad-text-dim font-sans mb-1">Applied Temp (°C)</label>
                            <input
                              type="number"
                              value={loadForm.appliedTemp}
                              onChange={(e) => setLoadForm({ ...loadForm, appliedTemp: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-cad-border text-sm font-sans"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleAddLoad}
                        className="w-full py-2 bg-cad-accent text-white text-sm font-sans hover:bg-cad-accent-hover transition-colors"
                      >
                        Add Load
                      </button>
                    </div>
                  )}

                  {/* Load List */}
                  <div className="divide-y divide-cad-border max-h-[400px] overflow-y-auto">
                    {loads.length === 0 ? (
                      <div className="p-8 text-center text-cad-text-dim text-sm font-sans">
                        No loads defined
                      </div>
                    ) : (
                      loads.map((load) => {
                        const typeInfo = LOAD_TYPES.find(t => t.value === load.type);
                        const Icon = typeInfo?.icon || ArrowDown;
                        
                        return (
                          <div key={load.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleLoad(load.id)}
                                  className={`p-1 ${load.enabled ? 'text-orange-500' : 'text-gray-300'}`}
                                >
                                  {load.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <span className="w-4 h-4">
                                  {typeof Icon === 'function' ? <Icon /> : <Icon className={`w-4 h-4 ${load.enabled ? 'text-orange-500' : 'text-gray-400'}`} />}
                                </span>
                                <span className={`text-sm font-sans ${load.enabled ? 'text-cad-text' : 'text-gray-400'}`}>
                                  {load.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setExpandedLoad(expandedLoad === load.id ? null : load.id)}
                                  className="p-1 text-gray-400 hover:text-cad-text"
                                >
                                  {expandedLoad === load.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => removeLoad(load.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {expandedLoad === load.id && (
                              <div className="mt-2 pl-8 text-xs text-cad-text-dim font-sans space-y-1">
                                <div>Type: {typeInfo?.label}</div>
                                {load.acceleration && <div>Acceleration: [{load.acceleration.join(', ')}] m/s²</div>}
                                {load.force && <div>Force: [{load.force.join(', ')}] N</div>}
                                {load.value && <div>Pressure: {load.value} Pa</div>}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Validation Warning */}
              {!canContinue && (
                <div className="p-4 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-700 font-sans text-sm">
                      Add at least one boundary condition to continue
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3D Preview */}
            <div className="lg:col-span-2 bg-white border border-cad-border">
              <div className="p-4 border-b border-cad-border">
                <h2 className="font-serif text-lg text-cad-text">Setup Preview</h2>
              </div>
              
              <div className="h-[600px] relative">
                <Viewport3D />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
