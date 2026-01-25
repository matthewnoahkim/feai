/**
 * LoadEditor Component
 * Loads editor with support for multiple load types
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { TargetSelector } from '../boundary-conditions/TargetSelector';
import type { 
  Load, 
  BoundaryTarget,
  GravityLoad,
  PressureLoad,
  SurfaceForceLoad,
  PointForceLoad,
  ThermalLoad,
  UnitSystemType
} from '../../../lib/fea-solver/types';

interface LoadEditorProps {
  loads: Load[];
  onAdd: (load: Load) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, load: Load) => void;
  units: UnitSystemType;
}

const LOAD_TYPES = [
  { value: 'gravity', label: 'Gravity / Acceleration' },
  { value: 'pressure', label: 'Pressure (Normal)' },
  { value: 'surface_force', label: 'Surface Force (Traction)' },
  { value: 'point_force', label: 'Point Force' },
  { value: 'thermal', label: 'Thermal Load' }
];

// Icons
const GravityIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const PressureIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ForceIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ThermalIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export function LoadEditor({ loads, onAdd, onRemove, units }: LoadEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoadType, setNewLoadType] = useState<string>('gravity');
  const [newDescription, setNewDescription] = useState('');
  
  // Load-specific state
  const [gravityAccel, setGravityAccel] = useState<[number, number, number]>([0, 0, -9.81]);
  const [pressureTarget, setPressureTarget] = useState<BoundaryTarget>({ type: 'boundary_id', id: 5 });
  const [pressureValue, setPressureValue] = useState(1e6);
  const [surfaceTarget, setSurfaceTarget] = useState<BoundaryTarget>({ type: 'boundary_id', id: 1 });
  const [surfaceForce, setSurfaceForce] = useState<[number, number, number]>([1000, 0, 0]);
  const [pointLocation, setPointLocation] = useState<[number, number, number]>([50, 5, 5]);
  const [pointForce, setPointForce] = useState<[number, number, number]>([0, 0, -1000]);
  const [thermalRef, setThermalRef] = useState(20);
  const [thermalApplied, setThermalApplied] = useState(100);

  const handleAddLoad = () => {
    let load: Load;
    
    switch (newLoadType) {
      case 'gravity':
        load = {
          type: 'gravity',
          acceleration: gravityAccel,
          description: newDescription || undefined
        } as GravityLoad;
        break;
      case 'pressure':
        load = {
          type: 'pressure',
          target: pressureTarget,
          value: pressureValue,
          description: newDescription || undefined
        } as PressureLoad;
        break;
      case 'surface_force':
        load = {
          type: 'surface_force',
          target: surfaceTarget,
          force_per_area: surfaceForce,
          description: newDescription || undefined
        } as SurfaceForceLoad;
        break;
      case 'point_force':
        load = {
          type: 'point_force',
          location: pointLocation,
          force: pointForce,
          description: newDescription || undefined
        } as PointForceLoad;
        break;
      case 'thermal':
        load = {
          type: 'thermal',
          reference_temperature: thermalRef,
          applied_temperature: thermalApplied,
          description: newDescription || undefined
        } as ThermalLoad;
        break;
      default:
        return;
    }
    
    onAdd(load);
    resetForm();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setNewLoadType('gravity');
    setNewDescription('');
  };

  const getLoadIcon = (type: string) => {
    switch (type) {
      case 'gravity': return <GravityIcon />;
      case 'pressure': return <PressureIcon />;
      case 'surface_force': return <ForceIcon />;
      case 'point_force': return <ForceIcon />;
      case 'thermal': return <ThermalIcon />;
      default: return null;
    }
  };

  const getLoadLabel = (load: Load) => {
    switch (load.type) {
      case 'gravity':
        return `Gravity: [${load.acceleration.map(v => v.toFixed(2)).join(', ')}] m/s²`;
      case 'pressure':
        return `Pressure: ${(load.value / 1e6).toFixed(2)} MPa`;
      case 'surface_force':
        return `Surface Force: [${load.force_per_area.join(', ')}] N/m²`;
      case 'point_force':
        return `Point Force: [${load.force.join(', ')}] N`;
      case 'thermal':
        return `Thermal: ${load.reference_temperature}° → ${load.applied_temperature}°`;
      default:
        return 'Load';
    }
  };

  const pressureUnit = units === 'SI' ? 'Pa' : units === 'SI_MM' ? 'MPa' : 'psi';
  const forceUnit = units === 'SI' ? 'N' : units === 'SI_MM' ? 'N' : 'lbf';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-cad-text">Loads</h2>
            <p className="text-sm text-cad-text-dim mt-1">
              Define forces, pressures, and other loads
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            + Add Load
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Loads */}
        <div className="space-y-2">
          {loads.map((load, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 border border-cad-border bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-green-600">
                  {getLoadIcon(load.type)}
                </div>
                <div>
                  <span className="font-medium text-sm text-cad-text capitalize">{load.type.replace('_', ' ')}</span>
                  <p className="text-xs text-cad-text-dim">{getLoadLabel(load)}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Remove
              </Button>
            </div>
          ))}

          {loads.length === 0 && (
            <p className="text-cad-text-dim text-center py-6 bg-gray-50 border border-dashed border-cad-border">
              No loads defined.<br />
              <span className="text-sm">Analysis will compute only BC effects.</span>
            </p>
          )}
        </div>

        {/* Add Load Form */}
        {showAddForm && (
          <div className="p-4 border-2 border-green-500 bg-green-50/30 space-y-4">
            <h4 className="font-medium text-cad-text">Add Load</h4>
            
            <Select
              label="Load Type"
              value={newLoadType}
              onChange={(e) => setNewLoadType(e.target.value)}
              options={LOAD_TYPES}
            />

            {/* Gravity Load */}
            {newLoadType === 'gravity' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-cad-text">Acceleration (m/s²)</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="X"
                    type="number"
                    step="any"
                    value={gravityAccel[0]}
                    onChange={(e) => setGravityAccel([parseFloat(e.target.value) || 0, gravityAccel[1], gravityAccel[2]])}
                  />
                  <Input
                    label="Y"
                    type="number"
                    step="any"
                    value={gravityAccel[1]}
                    onChange={(e) => setGravityAccel([gravityAccel[0], parseFloat(e.target.value) || 0, gravityAccel[2]])}
                  />
                  <Input
                    label="Z"
                    type="number"
                    step="any"
                    value={gravityAccel[2]}
                    onChange={(e) => setGravityAccel([gravityAccel[0], gravityAccel[1], parseFloat(e.target.value) || 0])}
                  />
                </div>
                <p className="text-xs text-cad-text-dim">Tip: Use [0, 0, -9.81] for Earth gravity in -Z direction</p>
              </div>
            )}

            {/* Pressure Load */}
            {newLoadType === 'pressure' && (
              <div className="space-y-3">
                <TargetSelector
                  value={pressureTarget}
                  onChange={setPressureTarget}
                />
                <Input
                  label={`Pressure (${pressureUnit})`}
                  type="number"
                  step="any"
                  value={pressureValue}
                  onChange={(e) => setPressureValue(parseFloat(e.target.value) || 0)}
                  helperText="Positive = into surface"
                />
              </div>
            )}

            {/* Surface Force Load */}
            {newLoadType === 'surface_force' && (
              <div className="space-y-3">
                <TargetSelector
                  value={surfaceTarget}
                  onChange={setSurfaceTarget}
                />
                <div>
                  <label className="text-xs font-medium text-cad-text">Force per Area ({forceUnit}/m²)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input
                      label="X"
                      type="number"
                      step="any"
                      value={surfaceForce[0]}
                      onChange={(e) => setSurfaceForce([parseFloat(e.target.value) || 0, surfaceForce[1], surfaceForce[2]])}
                    />
                    <Input
                      label="Y"
                      type="number"
                      step="any"
                      value={surfaceForce[1]}
                      onChange={(e) => setSurfaceForce([surfaceForce[0], parseFloat(e.target.value) || 0, surfaceForce[2]])}
                    />
                    <Input
                      label="Z"
                      type="number"
                      step="any"
                      value={surfaceForce[2]}
                      onChange={(e) => setSurfaceForce([surfaceForce[0], surfaceForce[1], parseFloat(e.target.value) || 0])}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Point Force Load */}
            {newLoadType === 'point_force' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-cad-text">Location</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input
                      label="X"
                      type="number"
                      step="any"
                      value={pointLocation[0]}
                      onChange={(e) => setPointLocation([parseFloat(e.target.value) || 0, pointLocation[1], pointLocation[2]])}
                    />
                    <Input
                      label="Y"
                      type="number"
                      step="any"
                      value={pointLocation[1]}
                      onChange={(e) => setPointLocation([pointLocation[0], parseFloat(e.target.value) || 0, pointLocation[2]])}
                    />
                    <Input
                      label="Z"
                      type="number"
                      step="any"
                      value={pointLocation[2]}
                      onChange={(e) => setPointLocation([pointLocation[0], pointLocation[1], parseFloat(e.target.value) || 0])}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-cad-text">Force ({forceUnit})</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input
                      label="X"
                      type="number"
                      step="any"
                      value={pointForce[0]}
                      onChange={(e) => setPointForce([parseFloat(e.target.value) || 0, pointForce[1], pointForce[2]])}
                    />
                    <Input
                      label="Y"
                      type="number"
                      step="any"
                      value={pointForce[1]}
                      onChange={(e) => setPointForce([pointForce[0], parseFloat(e.target.value) || 0, pointForce[2]])}
                    />
                    <Input
                      label="Z"
                      type="number"
                      step="any"
                      value={pointForce[2]}
                      onChange={(e) => setPointForce([pointForce[0], pointForce[1], parseFloat(e.target.value) || 0])}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Thermal Load */}
            {newLoadType === 'thermal' && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Reference Temperature (°C)"
                  type="number"
                  step="any"
                  value={thermalRef}
                  onChange={(e) => setThermalRef(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Applied Temperature (°C)"
                  type="number"
                  step="any"
                  value={thermalApplied}
                  onChange={(e) => setThermalApplied(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}

            <Input
              label="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g., Applied pressure on top face"
            />

            <div className="flex gap-2">
              <Button onClick={handleAddLoad}>
                Add
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
