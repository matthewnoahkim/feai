/**
 * WorkflowMeshPreview - 3D preview of mesh from workflow store (mesh page)
 * Displays the mesh as line segments (wireframe) so it is clearly visible.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useWorkflowStore } from '@/store/workflowStore';

interface MeshNode {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface MeshElement {
  id?: number;
  type: string;
  nodeIds: number[];
}

export function WorkflowMeshPreview() {
  const meshData = useWorkflowStore((s) => s.meshData);

  const edgeGeometry = useMemo(() => {
    const nodes = meshData?.nodes as MeshNode[] | undefined;
    const elements = meshData?.elements as MeshElement[] | undefined;
    if (!nodes?.length || !elements?.length) return new THREE.BufferGeometry();
    if (nodes.length > 3000) {
      return new THREE.BufferGeometry();
    }

    const positions: number[] = [];
    const edgeSet = new Set<string>();
    const nodeMap = new Map<number, { x: number; y: number; z: number }>();
    for (const node of nodes) {
      nodeMap.set(node.id, { x: node.x, y: node.y, z: node.z });
    }

    for (const element of elements) {
      if (element.type !== 'C3D4' && element.type !== 'C3D10') continue;
      const nodeIds = element.nodeIds.slice(0, 4);
      const edges = [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [1, 3], [2, 3],
      ];
      for (const [i, j] of edges) {
        const n1 = nodeIds[i];
        const n2 = nodeIds[j];
        const edgeKey = n1 < n2 ? `${n1}-${n2}` : `${n2}-${n1}`;
        if (edgeSet.has(edgeKey)) continue;
        edgeSet.add(edgeKey);
        const node1 = nodeMap.get(n1);
        const node2 = nodeMap.get(n2);
        if (node1 && node2) {
          positions.push(node1.x, node1.y, node1.z);
          positions.push(node2.x, node2.y, node2.z);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [meshData]);

  if (!meshData?.nodes?.length || !meshData?.elements?.length) return null;

  const hasEdges = edgeGeometry.getAttribute('position')?.count > 0;
  if (!hasEdges) return null;

  return (
    <group>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color="#2563eb" />
      </lineSegments>
    </group>
  );
}
