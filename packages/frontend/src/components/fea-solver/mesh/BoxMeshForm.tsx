/**
 * BoxMeshForm Component
 * Form for defining box mesh geometry
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/Input';
import type { BoxMesh, UnitSystemType } from '../../../lib/fea-solver/types';

interface BoxMeshFormProps {
  value?: BoxMesh;
  onChange: (mesh: BoxMesh) => void;
  units: UnitSystemType;
}

export function BoxMeshForm({ value, onChange, units }: BoxMeshFormProps) {
  const [dimensions, setDimensions] = useState({
    minX: value?.min[0] ?? 0,
    minY: value?.min[1] ?? 0,
    minZ: value?.min[2] ?? 0,
    maxX: value?.max[0] ?? 100,
    maxY: value?.max[1] ?? 10,
    maxZ: value?.max[2] ?? 10,
    subX: value?.subdivisions?.[0] ?? 10,
    subY: value?.subdivisions?.[1] ?? 2,
    subZ: value?.subdivisions?.[2] ?? 2
  });

  const updateMesh = useCallback(() => {
    const mesh: BoxMesh = {
      type: 'box',
      min: [dimensions.minX, dimensions.minY, dimensions.minZ],
      max: [dimensions.maxX, dimensions.maxY, dimensions.maxZ],
      subdivisions: [dimensions.subX, dimensions.subY, dimensions.subZ]
    };
    onChange(mesh);
  }, [dimensions, onChange]);

  useEffect(() => {
    updateMesh();
  }, [updateMesh]);

  const lengthUnit = units === 'SI' ? 'm' : units === 'SI_MM' ? 'mm' : 'in';
  
  const estimatedElements = dimensions.subX * dimensions.subY * dimensions.subZ;
  
  // Calculate physical dimensions
  const sizeX = Math.abs(dimensions.maxX - dimensions.minX);
  const sizeY = Math.abs(dimensions.maxY - dimensions.minY);
  const sizeZ = Math.abs(dimensions.maxZ - dimensions.minZ);

  return (
    <div className="space-y-6">
      {/* Minimum Corner */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-cad-text">
          Minimum Corner ({lengthUnit})
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="X"
            type="number"
            step="any"
            value={dimensions.minX}
            onChange={(e) => setDimensions(d => ({ ...d, minX: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Y"
            type="number"
            step="any"
            value={dimensions.minY}
            onChange={(e) => setDimensions(d => ({ ...d, minY: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Z"
            type="number"
            step="any"
            value={dimensions.minZ}
            onChange={(e) => setDimensions(d => ({ ...d, minZ: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      {/* Maximum Corner */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-cad-text">
          Maximum Corner ({lengthUnit})
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="X"
            type="number"
            step="any"
            value={dimensions.maxX}
            onChange={(e) => setDimensions(d => ({ ...d, maxX: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Y"
            type="number"
            step="any"
            value={dimensions.maxY}
            onChange={(e) => setDimensions(d => ({ ...d, maxY: parseFloat(e.target.value) || 0 }))}
          />
          <Input
            label="Z"
            type="number"
            step="any"
            value={dimensions.maxZ}
            onChange={(e) => setDimensions(d => ({ ...d, maxZ: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      {/* Mesh Subdivisions */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-cad-text">
          Mesh Subdivisions
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="X divisions"
            type="number"
            min={1}
            max={100}
            value={dimensions.subX}
            onChange={(e) => setDimensions(d => ({ ...d, subX: Math.max(1, parseInt(e.target.value) || 1) }))}
          />
          <Input
            label="Y divisions"
            type="number"
            min={1}
            max={100}
            value={dimensions.subY}
            onChange={(e) => setDimensions(d => ({ ...d, subY: Math.max(1, parseInt(e.target.value) || 1) }))}
          />
          <Input
            label="Z divisions"
            type="number"
            min={1}
            max={100}
            value={dimensions.subZ}
            onChange={(e) => setDimensions(d => ({ ...d, subZ: Math.max(1, parseInt(e.target.value) || 1) }))}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-3 border border-cad-border text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-cad-text-dim">Dimensions:</span>
          <span className="text-cad-text font-medium">
            {sizeX} × {sizeY} × {sizeZ} {lengthUnit}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cad-text-dim">Estimated elements:</span>
          <span className={`font-medium ${estimatedElements > 50000 ? 'text-yellow-600' : 'text-cad-text'}`}>
            {estimatedElements.toLocaleString()}
          </span>
        </div>
        {estimatedElements > 50000 && (
          <p className="text-xs text-yellow-600 mt-2">
            ⚠️ Large meshes may take longer to solve
          </p>
        )}
      </div>

      {/* Boundary ID Reference */}
      <div className="text-xs text-cad-text-dim bg-blue-50 p-3 border border-blue-200">
        <strong className="text-cad-text">Box Mesh Boundary IDs:</strong>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
          <span>0: X-min (left)</span>
          <span>1: X-max (right)</span>
          <span>2: Y-min (front)</span>
          <span>3: Y-max (back)</span>
          <span>4: Z-min (bottom)</span>
          <span>5: Z-max (top)</span>
        </div>
      </div>
    </div>
  );
}
