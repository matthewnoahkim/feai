/**
 * BCEditor Component
 * Boundary conditions editor with add/remove/update functionality
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { TargetSelector } from './TargetSelector';
import type { 
  BoundaryCondition, 
  BoundaryTarget,
  FixedBC,
  DisplacementBC,
  SymmetryBC
} from '../../../lib/fea-solver/types';

interface BCEditorProps {
  boundaryConditions: BoundaryCondition[];
  onAdd: (bc: BoundaryCondition) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, bc: BoundaryCondition) => void;
}

const BC_TYPES = [
  { value: 'fixed', label: 'Fixed (All DOFs constrained)' },
  { value: 'displacement', label: 'Prescribed Displacement' },
  { value: 'symmetry', label: 'Symmetry Plane' }
];

// Icons
const FixedIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const DisplacementIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const SymmetryIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M12 4v16m-8-8h16" />
  </svg>
);

export function BCEditor({ boundaryConditions, onAdd, onRemove, onUpdate }: BCEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBCType, setNewBCType] = useState<string>('fixed');
  const [newTarget, setNewTarget] = useState<BoundaryTarget>({ type: 'boundary_id', id: 0 });
  const [newDescription, setNewDescription] = useState('');
  const [displacementValues, setDisplacementValues] = useState<[number | null, number | null, number | null]>([null, null, null]);
  const [symmetryNormal, setSymmetryNormal] = useState<[number, number, number]>([1, 0, 0]);

  const handleAddBC = () => {
    let bc: BoundaryCondition;
    
    switch (newBCType) {
      case 'fixed':
        bc = {
          type: 'fixed',
          target: newTarget,
          description: newDescription || undefined
        } as FixedBC;
        break;
      case 'displacement':
        bc = {
          type: 'displacement',
          target: newTarget,
          values: displacementValues,
          description: newDescription || undefined
        } as DisplacementBC;
        break;
      case 'symmetry':
        bc = {
          type: 'symmetry',
          target: newTarget,
          plane_normal: symmetryNormal,
          description: newDescription || undefined
        } as SymmetryBC;
        break;
      default:
        return;
    }
    
    onAdd(bc);
    resetForm();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setNewBCType('fixed');
    setNewTarget({ type: 'boundary_id', id: 0 });
    setNewDescription('');
    setDisplacementValues([null, null, null]);
    setSymmetryNormal([1, 0, 0]);
  };

  const getBCIcon = (type: string) => {
    switch (type) {
      case 'fixed': return <FixedIcon />;
      case 'displacement': return <DisplacementIcon />;
      case 'symmetry': return <SymmetryIcon />;
      default: return null;
    }
  };

  const getBCLabel = (bc: BoundaryCondition) => {
    const targetLabel = bc.target.type === 'boundary_id' 
      ? `Face ${(bc.target as { id: number }).id}`
      : bc.target.type;
    
    switch (bc.type) {
      case 'fixed':
        return `Fixed - ${targetLabel}`;
      case 'displacement':
        return `Displacement - ${targetLabel}`;
      case 'symmetry':
        return `Symmetry - ${targetLabel}`;
      default:
        return `BC - ${targetLabel}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-cad-text">Boundary Conditions</h2>
            <p className="text-sm text-cad-text-dim mt-1">
              Define constraints and supports
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            + Add BC
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing BCs */}
        <div className="space-y-2">
          {boundaryConditions.map((bc, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 border border-cad-border bg-gray-50/50"
            >
              <div className="flex items-center gap-3">
                <div className="text-cad-accent">
                  {getBCIcon(bc.type)}
                </div>
                <div>
                  <span className="font-medium text-sm text-cad-text">{getBCLabel(bc)}</span>
                  {bc.description && (
                    <p className="text-xs text-cad-text-dim">{bc.description}</p>
                  )}
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

          {boundaryConditions.length === 0 && (
            <p className="text-cad-text-dim text-center py-6 bg-gray-50 border border-dashed border-cad-border">
              No boundary conditions defined.<br />
              <span className="text-sm">Add at least one fixed or displacement BC.</span>
            </p>
          )}
        </div>

        {/* Add BC Form */}
        {showAddForm && (
          <div className="p-4 border-2 border-cad-accent bg-blue-50/30 space-y-4">
            <h4 className="font-medium text-cad-text">Add Boundary Condition</h4>
            
            <Select
              label="BC Type"
              value={newBCType}
              onChange={(e) => setNewBCType(e.target.value)}
              options={BC_TYPES}
            />

            <TargetSelector
              value={newTarget}
              onChange={setNewTarget}
            />

            {/* Type-specific fields */}
            {newBCType === 'displacement' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-cad-text">Displacement Values (null = free)</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="X"
                    type="number"
                    step="any"
                    placeholder="null"
                    value={displacementValues[0] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      setDisplacementValues([val, displacementValues[1], displacementValues[2]]);
                    }}
                  />
                  <Input
                    label="Y"
                    type="number"
                    step="any"
                    placeholder="null"
                    value={displacementValues[1] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      setDisplacementValues([displacementValues[0], val, displacementValues[2]]);
                    }}
                  />
                  <Input
                    label="Z"
                    type="number"
                    step="any"
                    placeholder="null"
                    value={displacementValues[2] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : parseFloat(e.target.value);
                      setDisplacementValues([displacementValues[0], displacementValues[1], val]);
                    }}
                  />
                </div>
              </div>
            )}

            {newBCType === 'symmetry' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-cad-text">Plane Normal</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="X"
                    type="number"
                    step="any"
                    value={symmetryNormal[0]}
                    onChange={(e) => setSymmetryNormal([parseFloat(e.target.value) || 0, symmetryNormal[1], symmetryNormal[2]])}
                  />
                  <Input
                    label="Y"
                    type="number"
                    step="any"
                    value={symmetryNormal[1]}
                    onChange={(e) => setSymmetryNormal([symmetryNormal[0], parseFloat(e.target.value) || 0, symmetryNormal[2]])}
                  />
                  <Input
                    label="Z"
                    type="number"
                    step="any"
                    value={symmetryNormal[2]}
                    onChange={(e) => setSymmetryNormal([symmetryNormal[0], symmetryNormal[1], parseFloat(e.target.value) || 0])}
                  />
                </div>
              </div>
            )}

            <Input
              label="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g., Fixed support at base"
            />

            <div className="flex gap-2">
              <Button onClick={handleAddBC}>
                Add
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Boundary ID Reference */}
        <div className="text-xs text-cad-text-dim bg-gray-50 p-3 border border-cad-border">
          <strong className="text-cad-text">Box Mesh Boundary IDs:</strong>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <span>0: X-min (left)</span>
            <span>1: X-max (right)</span>
            <span>2: Y-min (front)</span>
            <span>3: Y-max (back)</span>
            <span>4: Z-min (bottom)</span>
            <span>5: Z-max (top)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
