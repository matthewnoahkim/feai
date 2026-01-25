/**
 * TargetSelector Component
 * Select boundary targets (boundary_id, point, box, sphere)
 */

import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { BoundaryTarget, BoundaryIdTarget, PointTarget, BoxTarget, SphereTarget } from '../../../lib/fea-solver/types';

interface TargetSelectorProps {
  value: BoundaryTarget;
  onChange: (target: BoundaryTarget) => void;
}

const TARGET_TYPES = [
  { value: 'boundary_id', label: 'Boundary ID (Face)' },
  { value: 'point', label: 'Point Location' },
  { value: 'box', label: 'Box Region' },
  { value: 'sphere', label: 'Sphere Region' }
];

export function TargetSelector({ value, onChange }: TargetSelectorProps) {
  const handleTypeChange = (newType: string) => {
    switch (newType) {
      case 'boundary_id':
        onChange({ type: 'boundary_id', id: 0 });
        break;
      case 'point':
        onChange({ type: 'point', location: [0, 0, 0], tolerance: 1 });
        break;
      case 'box':
        onChange({ type: 'box', min: [0, 0, 0], max: [10, 10, 10] });
        break;
      case 'sphere':
        onChange({ type: 'sphere', center: [0, 0, 0], radius: 10 });
        break;
    }
  };

  return (
    <div className="space-y-3">
      <Select
        label="Target Type"
        value={value.type}
        onChange={(e) => handleTypeChange(e.target.value)}
        options={TARGET_TYPES}
      />

      {value.type === 'boundary_id' && (
        <BoundaryIdFields 
          value={value as BoundaryIdTarget} 
          onChange={(v) => onChange(v)} 
        />
      )}

      {value.type === 'point' && (
        <PointFields 
          value={value as PointTarget} 
          onChange={(v) => onChange(v)} 
        />
      )}

      {value.type === 'box' && (
        <BoxFields 
          value={value as BoxTarget} 
          onChange={(v) => onChange(v)} 
        />
      )}

      {value.type === 'sphere' && (
        <SphereFields 
          value={value as SphereTarget} 
          onChange={(v) => onChange(v)} 
        />
      )}
    </div>
  );
}

function BoundaryIdFields({ 
  value, 
  onChange 
}: { 
  value: BoundaryIdTarget; 
  onChange: (v: BoundaryIdTarget) => void;
}) {
  return (
    <div>
      <Input
        label="Boundary ID"
        type="number"
        min={0}
        max={10}
        value={value.id}
        onChange={(e) => onChange({ ...value, id: parseInt(e.target.value) || 0 })}
        helperText="0-5 for box faces, see boundary ID reference"
      />
    </div>
  );
}

function PointFields({ 
  value, 
  onChange 
}: { 
  value: PointTarget; 
  onChange: (v: PointTarget) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input
          label="X"
          type="number"
          step="any"
          value={value.location[0]}
          onChange={(e) => onChange({ 
            ...value, 
            location: [parseFloat(e.target.value) || 0, value.location[1], value.location[2]] 
          })}
        />
        <Input
          label="Y"
          type="number"
          step="any"
          value={value.location[1]}
          onChange={(e) => onChange({ 
            ...value, 
            location: [value.location[0], parseFloat(e.target.value) || 0, value.location[2]] 
          })}
        />
        <Input
          label="Z"
          type="number"
          step="any"
          value={value.location[2]}
          onChange={(e) => onChange({ 
            ...value, 
            location: [value.location[0], value.location[1], parseFloat(e.target.value) || 0] 
          })}
        />
      </div>
      <Input
        label="Tolerance"
        type="number"
        step="any"
        min={0.001}
        value={value.tolerance || 1}
        onChange={(e) => onChange({ ...value, tolerance: parseFloat(e.target.value) || 1 })}
        helperText="Search radius for point"
      />
    </div>
  );
}

function BoxFields({ 
  value, 
  onChange 
}: { 
  value: BoxTarget; 
  onChange: (v: BoxTarget) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-cad-text mb-1 block">Min Corner</label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="X"
            type="number"
            step="any"
            value={value.min[0]}
            onChange={(e) => onChange({ 
              ...value, 
              min: [parseFloat(e.target.value) || 0, value.min[1], value.min[2]] 
            })}
          />
          <Input
            label="Y"
            type="number"
            step="any"
            value={value.min[1]}
            onChange={(e) => onChange({ 
              ...value, 
              min: [value.min[0], parseFloat(e.target.value) || 0, value.min[2]] 
            })}
          />
          <Input
            label="Z"
            type="number"
            step="any"
            value={value.min[2]}
            onChange={(e) => onChange({ 
              ...value, 
              min: [value.min[0], value.min[1], parseFloat(e.target.value) || 0] 
            })}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-cad-text mb-1 block">Max Corner</label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="X"
            type="number"
            step="any"
            value={value.max[0]}
            onChange={(e) => onChange({ 
              ...value, 
              max: [parseFloat(e.target.value) || 0, value.max[1], value.max[2]] 
            })}
          />
          <Input
            label="Y"
            type="number"
            step="any"
            value={value.max[1]}
            onChange={(e) => onChange({ 
              ...value, 
              max: [value.max[0], parseFloat(e.target.value) || 0, value.max[2]] 
            })}
          />
          <Input
            label="Z"
            type="number"
            step="any"
            value={value.max[2]}
            onChange={(e) => onChange({ 
              ...value, 
              max: [value.max[0], value.max[1], parseFloat(e.target.value) || 0] 
            })}
          />
        </div>
      </div>
    </div>
  );
}

function SphereFields({ 
  value, 
  onChange 
}: { 
  value: SphereTarget; 
  onChange: (v: SphereTarget) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-cad-text mb-1 block">Center</label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="X"
            type="number"
            step="any"
            value={value.center[0]}
            onChange={(e) => onChange({ 
              ...value, 
              center: [parseFloat(e.target.value) || 0, value.center[1], value.center[2]] 
            })}
          />
          <Input
            label="Y"
            type="number"
            step="any"
            value={value.center[1]}
            onChange={(e) => onChange({ 
              ...value, 
              center: [value.center[0], parseFloat(e.target.value) || 0, value.center[2]] 
            })}
          />
          <Input
            label="Z"
            type="number"
            step="any"
            value={value.center[2]}
            onChange={(e) => onChange({ 
              ...value, 
              center: [value.center[0], value.center[1], parseFloat(e.target.value) || 0] 
            })}
          />
        </div>
      </div>
      <Input
        label="Radius"
        type="number"
        step="any"
        min={0.001}
        value={value.radius}
        onChange={(e) => onChange({ ...value, radius: parseFloat(e.target.value) || 1 })}
      />
    </div>
  );
}
