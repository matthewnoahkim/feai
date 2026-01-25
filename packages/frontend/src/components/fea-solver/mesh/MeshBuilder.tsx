/**
 * MeshBuilder Component
 * Main mesh building interface with tabs for different geometry types
 */

import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { BoxMeshForm } from './BoxMeshForm';
import { CylinderMeshForm } from './CylinderMeshForm';
import { MeshFileUpload } from './MeshFileUpload';
import type { Mesh, BoxMesh, CylinderMesh, FileMesh, UnitSystemType } from '../../../lib/fea-solver/types';

interface MeshBuilderProps {
  value: Mesh | null;
  onChange: (mesh: Mesh) => void;
  units: UnitSystemType;
}

// Icons
const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const CylinderIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <ellipse cx="12" cy="6" rx="8" ry="3" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
      d="M4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export function MeshBuilder({ value, onChange, units }: MeshBuilderProps) {
  const getMeshType = (): 'box' | 'cylinder' | 'file' => {
    if (!value) return 'box';
    return value.type;
  };
  
  const [meshType, setMeshType] = useState<'box' | 'cylinder' | 'file'>(getMeshType());

  const handleBoxMeshChange = useCallback((mesh: BoxMesh) => {
    onChange(mesh);
  }, [onChange]);

  const handleCylinderMeshChange = useCallback((mesh: CylinderMesh) => {
    onChange(mesh);
  }, [onChange]);

  const handleFileMeshChange = useCallback((mesh: FileMesh) => {
    onChange(mesh);
  }, [onChange]);

  const handleTypeChange = (type: string) => {
    setMeshType(type as 'box' | 'cylinder' | 'file');
    
    // Initialize with default values based on type
    if (type === 'box' && (!value || value.type !== 'box')) {
      handleBoxMeshChange({
        type: 'box',
        min: [0, 0, 0],
        max: [100, 10, 10],
        subdivisions: [10, 2, 2]
      });
    } else if (type === 'cylinder' && (!value || value.type !== 'cylinder')) {
      handleCylinderMeshChange({
        type: 'cylinder',
        center: [0, 0, 0],
        radius: 25,
        height: 100,
        n_radial: 16,
        n_axial: 10
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-cad-text">Geometry</h2>
        <p className="text-sm text-cad-text-dim mt-1">
          Define the geometry for analysis
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={meshType} onValueChange={handleTypeChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="box" className="flex items-center gap-2">
              <BoxIcon />
              <span>Box</span>
            </TabsTrigger>
            <TabsTrigger value="cylinder" className="flex items-center gap-2">
              <CylinderIcon />
              <span>Cylinder</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <UploadIcon />
              <span>Upload</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="box" className="mt-4">
            <BoxMeshForm 
              value={value?.type === 'box' ? value : undefined}
              onChange={handleBoxMeshChange}
              units={units}
            />
          </TabsContent>
          
          <TabsContent value="cylinder" className="mt-4">
            <CylinderMeshForm
              value={value?.type === 'cylinder' ? value : undefined}
              onChange={handleCylinderMeshChange}
              units={units}
            />
          </TabsContent>
          
          <TabsContent value="file" className="mt-4">
            <MeshFileUpload
              value={value?.type === 'file' ? value : undefined}
              onChange={handleFileMeshChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
