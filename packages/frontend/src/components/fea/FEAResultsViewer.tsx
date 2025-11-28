/**
 * FEAResultsViewer - 3D visualization of FEA results
 * Renders stress/displacement contours on the deformed mesh
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFEAStore } from '../../store/feaStore';
import { COLORMAPS, interpolateColor } from '@feai/shared';

export function FEAResultsViewer() {
  const {
    isSimulationMode,
    results,
    mesh,
    resultsViewSettings,
  } = useFEAStore();

  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  // Don't render if not in simulation mode or no results
  if (!isSimulationMode || !results || !mesh) {
    return null;
  }

  const staticResults = results.staticResults;
  if (!staticResults) return null;

  const { 
    activeField, 
    showDeformed, 
    deformationScale, 
    colormap, 
    showMesh,
    showEdges,
  } = resultsViewSettings;

  // Create geometry with deformation and coloring
  const { geometry, edgeGeometry } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Get displacement data
    const dispMap = new Map<number, number[]>();
    for (const d of staticResults.displacements.nodeValues as any[]) {
      dispMap.set(d.nodeId, d.values);
    }

    // Get stress data
    const stressMap = new Map<number, number>();
    for (const s of staticResults.vonMisesStress.nodeValues as any[]) {
      stressMap.set(s.nodeId, s.values[0]);
    }

    // Get field range for normalization
    const fieldMin = activeField === 'vonMises' || activeField.startsWith('s')
      ? staticResults.vonMisesStress.min
      : staticResults.displacements.min;
    const fieldMax = activeField === 'vonMises' || activeField.startsWith('s')
      ? staticResults.vonMisesStress.max
      : staticResults.displacements.max;
    const fieldRange = fieldMax - fieldMin || 1;

    // Build vertex arrays from tetrahedra
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const nodePositions = new Map<number, { x: number; y: number; z: number }>();

    // First, calculate deformed positions for all nodes
    for (const node of mesh.nodes) {
      const disp = dispMap.get(node.id);
      const scale = showDeformed ? deformationScale : 0;
      
      nodePositions.set(node.id, {
        x: node.x + (disp ? disp[0] * scale : 0),
        y: node.y + (disp ? disp[1] * scale : 0),
        z: node.z + (disp ? disp[2] * scale : 0),
      });
    }

    // Create triangular faces from tetrahedral elements
    // Each tet has 4 triangular faces
    const tetFaces = [
      [0, 1, 2],
      [0, 3, 1],
      [1, 3, 2],
      [0, 2, 3],
    ];

    let vertexIndex = 0;
    const edgeSet = new Set<string>();

    for (const element of mesh.elements) {
      if (element.type !== 'C3D4' && element.type !== 'C3D10') continue;

      const nodeIds = element.nodeIds.slice(0, 4); // Use corner nodes

      for (const face of tetFaces) {
        for (const localIdx of face) {
          const nodeId = nodeIds[localIdx];
          const pos = nodePositions.get(nodeId);
          
          if (!pos) continue;

          positions.push(pos.x, pos.y, pos.z);

          // Get field value for coloring
          let fieldValue: number;
          if (activeField === 'vonMises' || activeField.startsWith('s')) {
            fieldValue = stressMap.get(nodeId) || 0;
          } else {
            const disp = dispMap.get(nodeId);
            if (activeField === 'displacement') {
              fieldValue = disp ? disp[3] : 0; // Magnitude
            } else if (activeField === 'ux') {
              fieldValue = disp ? Math.abs(disp[0]) : 0;
            } else if (activeField === 'uy') {
              fieldValue = disp ? Math.abs(disp[1]) : 0;
            } else if (activeField === 'uz') {
              fieldValue = disp ? Math.abs(disp[2]) : 0;
            } else {
              fieldValue = 0;
            }
          }

          // Normalize and get color
          const normalized = (fieldValue - fieldMin) / fieldRange;
          const [r, g, b] = interpolateColor(COLORMAPS[colormap], normalized);
          colors.push(r / 255, g / 255, b / 255);

          indices.push(vertexIndex++);
        }

        // Track edges for wireframe
        for (let i = 0; i < 3; i++) {
          const n1 = nodeIds[face[i]];
          const n2 = nodeIds[face[(i + 1) % 3]];
          const edgeKey = n1 < n2 ? `${n1}-${n2}` : `${n2}-${n1}`;
          edgeSet.add(edgeKey);
        }
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    // Create edge geometry
    const edgePositions: number[] = [];
    for (const edgeKey of edgeSet) {
      const [n1str, n2str] = edgeKey.split('-');
      const n1 = parseInt(n1str);
      const n2 = parseInt(n2str);
      const p1 = nodePositions.get(n1);
      const p2 = nodePositions.get(n2);
      
      if (p1 && p2) {
        edgePositions.push(p1.x, p1.y, p1.z);
        edgePositions.push(p2.x, p2.y, p2.z);
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));

    return { geometry: geo, edgeGeometry: edgeGeo };
  }, [mesh, staticResults, activeField, showDeformed, deformationScale, colormap]);

  return (
    <group>
      {/* Colored mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Mesh edges */}
      {showEdges && (
        <lineSegments ref={edgesRef} geometry={edgeGeometry}>
          <lineBasicMaterial color="#1f2937" transparent opacity={0.3} />
        </lineSegments>
      )}
    </group>
  );
}

