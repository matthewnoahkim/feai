/**
 * BoundaryConditionsPanel - Supports, constraints, and loads interface
 */

import React, { useState } from 'react';
import { useFEAStore } from '../../store/feaStore';
import { 
  BoundaryCondition, 
  BoundaryConditionType,
  FixedConstraint,
  ForceLoad,
  PressureLoad,
  GravityLoad,
} from '@feai/shared';

const BCTypeIcons: Record<BoundaryConditionType, React.ReactNode> = {
  fixed: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  displacement: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  force: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  pressure: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  gravity: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  ),
  temperature: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  convection: null,
  heatFlux: null,
};

const BCTypeColors: Record<BoundaryConditionType, string> = {
  fixed: 'bg-blue-500',
  displacement: 'bg-purple-500',
  force: 'bg-red-500',
  pressure: 'bg-orange-500',
  gravity: 'bg-green-500',
  temperature: 'bg-yellow-500',
  convection: 'bg-cyan-500',
  heatFlux: 'bg-pink-500',
};

export function BoundaryConditionsPanel() {
  const {
    boundaryConditions,
    selectedBCId,
    addBoundaryCondition,
    updateBoundaryCondition,
    removeBoundaryCondition,
    toggleBoundaryCondition,
    selectBoundaryCondition,
    mesh,
  } = useFEAStore();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addingType, setAddingType] = useState<BoundaryConditionType | null>(null);

  // Form state for adding new BCs
  const [newBC, setNewBC] = useState({
    name: '',
    faceName: 'ZMin',
    forceX: 0,
    forceY: 0,
    forceZ: -1000,
    pressure: 1e6,
    gravityAccel: 9.81,
    gravityDir: { x: 0, y: 0, z: -1 },
  });

  const availableFaces = mesh?.nodeSets?.filter(ns => 
    ['XMin', 'XMax', 'YMin', 'YMax', 'ZMin', 'ZMax'].includes(ns.name)
  ) || [];

  const handleAddBC = (type: BoundaryConditionType) => {
    setAddingType(type);
    setNewBC(prev => ({
      ...prev,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${boundaryConditions.length + 1}`,
    }));
    setShowAddMenu(false);
  };

  const handleConfirmAdd = () => {
    if (!addingType) return;

    let bc: Omit<BoundaryCondition, 'id'>;

    switch (addingType) {
      case 'fixed':
        bc = {
          type: 'fixed',
          name: newBC.name || 'Fixed Support',
          enabled: true,
          geometry: { type: 'face', id: newBC.faceName, name: newBC.faceName },
        } as Omit<FixedConstraint, 'id'>;
        break;

      case 'force':
        const forceMag = Math.sqrt(newBC.forceX ** 2 + newBC.forceY ** 2 + newBC.forceZ ** 2);
        bc = {
          type: 'force',
          name: newBC.name || 'Force Load',
          enabled: true,
          geometry: { type: 'face', id: newBC.faceName, name: newBC.faceName },
          force: {
            magnitude: forceMag,
            direction: {
              x: forceMag > 0 ? newBC.forceX / forceMag : 0,
              y: forceMag > 0 ? newBC.forceY / forceMag : 0,
              z: forceMag > 0 ? newBC.forceZ / forceMag : -1,
            },
          },
          distributed: true,
        } as Omit<ForceLoad, 'id'>;
        break;

      case 'pressure':
        bc = {
          type: 'pressure',
          name: newBC.name || 'Pressure Load',
          enabled: true,
          geometry: { type: 'face', id: newBC.faceName, name: newBC.faceName },
          pressure: newBC.pressure,
        } as Omit<PressureLoad, 'id'>;
        break;

      case 'gravity':
        bc = {
          type: 'gravity',
          name: newBC.name || 'Gravity Load',
          enabled: true,
          acceleration: newBC.gravityAccel,
          direction: newBC.gravityDir,
        } as Omit<GravityLoad, 'id'>;
        break;

      default:
        return;
    }

    addBoundaryCondition(bc);
    setAddingType(null);
  };

  const selectedBC = boundaryConditions.find(bc => bc.id === selectedBCId);

  const getBCDescription = (bc: BoundaryCondition): string => {
    switch (bc.type) {
      case 'fixed':
        return `Fixed on ${(bc as FixedConstraint).geometry?.name || 'face'}`;
      case 'force':
        const force = bc as ForceLoad;
        return `${force.force.magnitude.toFixed(0)} N on ${force.geometry?.name || 'face'}`;
      case 'pressure':
        const pressure = bc as PressureLoad;
        return `${(pressure.pressure / 1e6).toFixed(2)} MPa on ${pressure.geometry?.name || 'face'}`;
      case 'gravity':
        const gravity = bc as GravityLoad;
        return `${gravity.acceleration} m/s² in ${gravity.direction.z < 0 ? '-Z' : '+Z'}`;
      default:
        return '';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Add BC Button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-2 px-4 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Boundary Condition
        </button>

        {/* Add Menu Dropdown */}
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-cad-darker border border-cad-border rounded-lg shadow-lg z-10 overflow-hidden">
            <div className="p-2 text-xs text-cad-text-dim border-b border-cad-border">
              Constraints
            </div>
            <button
              onClick={() => handleAddBC('fixed')}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-cad-border text-sm text-cad-text"
            >
              {BCTypeIcons.fixed}
              <span>Fixed Support</span>
            </button>
            <button
              onClick={() => handleAddBC('displacement')}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-cad-border text-sm text-cad-text"
            >
              {BCTypeIcons.displacement}
              <span>Prescribed Displacement</span>
            </button>
            
            <div className="p-2 text-xs text-cad-text-dim border-b border-t border-cad-border">
              Loads
            </div>
            <button
              onClick={() => handleAddBC('force')}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-cad-border text-sm text-cad-text"
            >
              {BCTypeIcons.force}
              <span>Force</span>
            </button>
            <button
              onClick={() => handleAddBC('pressure')}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-cad-border text-sm text-cad-text"
            >
              {BCTypeIcons.pressure}
              <span>Pressure</span>
            </button>
            <button
              onClick={() => handleAddBC('gravity')}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-cad-border text-sm text-cad-text"
            >
              {BCTypeIcons.gravity}
              <span>Gravity</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Form */}
      {addingType && (
        <div className="p-3 bg-cad-darker border border-blue-500/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded ${BCTypeColors[addingType]}`}>
              {BCTypeIcons[addingType]}
            </div>
            <span className="text-sm font-medium text-cad-text">Add {addingType}</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Name"
              value={newBC.name}
              onChange={(e) => setNewBC({ ...newBC, name: e.target.value })}
              className="w-full px-2 py-1.5 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
            />

            {/* Face selector (for fixed, force, pressure) */}
            {['fixed', 'force', 'pressure'].includes(addingType) && (
              <div>
                <label className="text-xs text-cad-text-dim">Apply to Face</label>
                <select
                  value={newBC.faceName}
                  onChange={(e) => setNewBC({ ...newBC, faceName: e.target.value })}
                  className="w-full px-2 py-1.5 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                >
                  {availableFaces.length > 0 ? (
                    availableFaces.map(face => (
                      <option key={face.name} value={face.name}>{face.name} ({face.nodeIds.length} nodes)</option>
                    ))
                  ) : (
                    <>
                      <option value="ZMin">Z Min Face</option>
                      <option value="ZMax">Z Max Face</option>
                      <option value="XMin">X Min Face</option>
                      <option value="XMax">X Max Face</option>
                      <option value="YMin">Y Min Face</option>
                      <option value="YMax">Y Max Face</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Force components */}
            {addingType === 'force' && (
              <div>
                <label className="text-xs text-cad-text-dim">Force Components (N)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-red-400">X</span>
                    <input
                      type="number"
                      value={newBC.forceX}
                      onChange={(e) => setNewBC({ ...newBC, forceX: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-green-400">Y</span>
                    <input
                      type="number"
                      value={newBC.forceY}
                      onChange={(e) => setNewBC({ ...newBC, forceY: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-blue-400">Z</span>
                    <input
                      type="number"
                      value={newBC.forceZ}
                      onChange={(e) => setNewBC({ ...newBC, forceZ: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pressure value */}
            {addingType === 'pressure' && (
              <div>
                <label className="text-xs text-cad-text-dim">Pressure (Pa)</label>
                <input
                  type="number"
                  value={newBC.pressure}
                  onChange={(e) => setNewBC({ ...newBC, pressure: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                />
                <p className="text-xs text-cad-text-dim mt-1">
                  = {(newBC.pressure / 1e6).toFixed(2)} MPa
                </p>
              </div>
            )}

            {/* Gravity */}
            {addingType === 'gravity' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-cad-text-dim">Acceleration (m/s²)</label>
                  <input
                    type="number"
                    value={newBC.gravityAccel}
                    onChange={(e) => setNewBC({ ...newBC, gravityAccel: parseFloat(e.target.value) || 9.81 })}
                    className="w-full px-2 py-1.5 bg-cad-dark border border-cad-border rounded text-sm text-cad-text"
                  />
                </div>
                <div>
                  <label className="text-xs text-cad-text-dim">Direction</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewBC({ ...newBC, gravityDir: { x: 0, y: 0, z: -1 } })}
                      className={`flex-1 py-1.5 rounded text-xs ${newBC.gravityDir.z === -1 ? 'bg-green-500/20 text-green-400' : 'bg-cad-border text-cad-text'}`}
                    >
                      -Z (Down)
                    </button>
                    <button
                      onClick={() => setNewBC({ ...newBC, gravityDir: { x: 0, y: -1, z: 0 } })}
                      className={`flex-1 py-1.5 rounded text-xs ${newBC.gravityDir.y === -1 ? 'bg-green-500/20 text-green-400' : 'bg-cad-border text-cad-text'}`}
                    >
                      -Y
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirmAdd}
              className="flex-1 py-1.5 bg-green-500/20 text-green-400 rounded text-xs font-medium hover:bg-green-500/30"
            >
              Add
            </button>
            <button
              onClick={() => setAddingType(null)}
              className="py-1.5 px-3 text-cad-text-dim rounded text-xs hover:bg-cad-border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* BC List */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-cad-text-dim uppercase tracking-wide">
          Applied Conditions ({boundaryConditions.length})
        </label>

        {boundaryConditions.length === 0 ? (
          <p className="text-xs text-cad-text-dim text-center py-4">
            No boundary conditions defined
          </p>
        ) : (
          <div className="space-y-1">
            {boundaryConditions.map((bc) => (
              <div
                key={bc.id}
                onClick={() => selectBoundaryCondition(bc.id)}
                className={`
                  p-2 rounded-lg cursor-pointer transition-all
                  ${selectedBCId === bc.id
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-cad-darker hover:bg-cad-border'
                  }
                  ${!bc.enabled ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${BCTypeColors[bc.type]} ${!bc.enabled ? 'opacity-50' : ''}`}>
                    {BCTypeIcons[bc.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-cad-text font-medium truncate">{bc.name}</div>
                    <div className="text-xs text-cad-text-dim truncate">{getBCDescription(bc)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBoundaryCondition(bc.id); }}
                      className={`p-1 rounded transition-colors ${bc.enabled ? 'text-green-400 hover:bg-green-500/20' : 'text-cad-text-dim hover:bg-cad-border'}`}
                      title={bc.enabled ? 'Disable' : 'Enable'}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {bc.enabled ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeBoundaryCondition(bc.id); }}
                      className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper info */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          💡 Add at least one fixed support to prevent rigid body motion
        </p>
      </div>
    </div>
  );
}

