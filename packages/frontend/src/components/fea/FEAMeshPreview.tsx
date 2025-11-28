/**
 * FEAMeshPreview - 3D preview of generated mesh
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFEAStore } from '../../store/feaStore';

export function FEAMeshPreview() {
  const {
    isSimulationMode,
    mesh,
    showMeshPreview,
    results,
    activeFEAPanel,
  } = useFEAStore();

  // Only show mesh preview when not viewing results
  if (!isSimulationMode || !mesh || !showMeshPreview || results) {
    return null;
  }

  // Hide mesh preview when on results panel
  if (activeFEAPanel === 'results') {
    return null;
  }

  // Create wireframe geometry from mesh
  const edgeGeometry = useMemo(() => {
    const positions: number[] = [];
    const edgeSet = new Set<string>();

    // Extract edges from elements
    for (const element of mesh.elements) {
      if (element.type !== 'C3D4' && element.type !== 'C3D10') continue;

      const nodeIds = element.nodeIds.slice(0, 4);
      
      // All edges of a tetrahedron
      const edges = [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [1, 3], [2, 3],
      ];

      for (const [i, j] of edges) {
        const n1 = nodeIds[i];
        const n2 = nodeIds[j];
        const edgeKey = n1 < n2 ? `${n1}-${n2}` : `${n2}-${n1}`;
        
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          
          const node1 = mesh.nodes.find(n => n.id === n1);
          const node2 = mesh.nodes.find(n => n.id === n2);
          
          if (node1 && node2) {
            positions.push(node1.x, node1.y, node1.z);
            positions.push(node2.x, node2.y, node2.z);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [mesh]);

  // Create surface geometry for semi-transparent fill
  const surfaceGeometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    
    const tetFaces = [
      [0, 1, 2],
      [0, 3, 1],
      [1, 3, 2],
      [0, 2, 3],
    ];

    let vertexIndex = 0;

    for (const element of mesh.elements) {
      if (element.type !== 'C3D4' && element.type !== 'C3D10') continue;

      const nodeIds = element.nodeIds.slice(0, 4);

      for (const face of tetFaces) {
        for (const localIdx of face) {
          const nodeId = nodeIds[localIdx];
          const node = mesh.nodes.find(n => n.id === nodeId);
          
          if (node) {
            positions.push(node.x, node.y, node.z);
            indices.push(vertexIndex++);
          }
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [mesh]);

  return (
    <group>
      {/* Semi-transparent surface */}
      <mesh geometry={surfaceGeometry}>
        <meshStandardMaterial
          color="#60a5fa"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe edges */}
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.5} />
      </lineSegments>
    </group>
  );
}

