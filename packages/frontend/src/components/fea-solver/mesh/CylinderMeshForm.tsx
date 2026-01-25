/**
 * CylinderMeshForm Component
 * Form for defining cylinder mesh geometry
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/Input';
import type { CylinderMesh, UnitSystemType } from '../../../lib/fea-solver/types';

interface CylinderMeshFormProps {
  value?: CylinderMesh;
  onChange: (mesh: CylinderMesh) => void;
  units: UnitSystemType;
}

export function CylinderMeshForm({ value, onChange, units }: CylinderMeshFormProps) {
  const [dimensions, setDimensions] = useState({
    centerX: value?.center?.[0] ?? 0,
    centerY: value?.center?.[1] ?? 0,
    centerZ: value?.center?.[2] ?? 0,
    radius: value?.radius ?? 25,
    height: value?.height ?? 100,
    nRadial: value?.n_radial ?? 16,
    nAxial: value?.n_axial ?? 10
  });

  const updateMesh = useCallback(() => {
    const mesh: CylinderMesh = {
      type: 'cylinder',
      center: [dimensions.centerX, dimensions.centerY, dimensions.centerZ],
      radius: dimensions.radius,
      height: dimensions.height,
      n_radial: dimensions.nRadial,
      n_axial: dimensions.nAxial
    };
    onChange(mesh);
  }, [dimensions, onChange]);

  useEffect(() => {
    updateMesh();
  }, [updateMesh]);

  const lengthUnit = units === 'SI' ? 'm' : units === 'SI_MM' ? 'mm' : 'in';
  
  // Estimate elements (rough approximation for cylinder)
  const estimatedElements = dimensions.nRadial * dimensions.nAxial * 6; // Rough estimate

  return (
    <div className="space-y-6">
      {/* Center Position */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-cad-text">
          Center Position ({lengthUnit})
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="X"
            type="number"
            step="any"
            value={dimensions.centerX}
            onChange={(e) => setDimensions(d => ({ ...d, centerX: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Y"
            type="number"
            step="any"
            value={dimensions.centerY}
            onChange={(e) => setDimensions(d => ({ ...d, centerY: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Z"
            type="number"
            step="any"
            value={dimensions.centerZ}
            onChange={(e) => setDimensions(d => ({ ...d, centerZ: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-cad-text">
          Cylinder Dimensions ({lengthUnit})
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Radius"
            type="number"
            step="any"
            min={0.001}
            value={dimensions.radius}
            onChange={(e) => setDimensions(d => ({ ...d, radius: Math.max(0.001, parseFloat(e.target.value) || 0) }))}
          />
          <Input
            label="Height"
            type="number"
            step="any"
            min={0.001}
            value={dimensions.height}
            onChange={(e) => setDimensions(d => ({ ...d, height: Math.max(0.001, parseFloat(e.target.value) || 0) }))}
          />
        </div>
      </div>

      {/* Mesh Subdivisions */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-cad-text">
          Mesh Subdivisions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Radial divisions"
            type="number"
            min={4}
            max={64}
            value={dimensions.nRadial}
            onChange={(e) => setDimensions(d => ({ ...d, nRadial: Math.max(4, parseInt(e.target.value) || 4) }))}
            helperText="Around circumference"
          />
          <Input
            label="Axial divisions"
            type="number"
            min={1}
            max={100}
            value={dimensions.nAxial}
            onChange={(e) => setDimensions(d => ({ ...d, nAxial: Math.max(1, parseInt(e.target.value) || 1) }))}
            helperText="Along height"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-3 border border-cad-border text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-cad-text-dim">Diameter:</span>
          <span className="text-cad-text font-medium">
            {(dimensions.radius * 2).toFixed(2)} {lengthUnit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cad-text-dim">Height:</span>
          <span className="text-cad-text font-medium">
            {dimensions.height} {lengthUnit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cad-text-dim">Estimated elements:</span>
          <span className={`font-medium ${estimatedElements > 50000 ? 'text-yellow-600' : 'text-cad-text'}`}>
            ~{estimatedElements.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Boundary ID Reference */}
      <div className="text-xs text-cad-text-dim bg-blue-50 p-3 border border-blue-200">
        <strong className="text-cad-text">Cylinder Mesh Boundary IDs:</strong>
        <div className="grid grid-cols-1 gap-y-1 mt-2">
          <span>0: Bottom face (Z-min)</span>
          <span>1: Top face (Z-max)</span>
          <span>2: Cylindrical surface (outer)</span>
        </div>
      </div>
    </div>
  );
}
