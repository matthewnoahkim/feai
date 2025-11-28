/**
 * FEABCIcons - 3D icons for boundary conditions
 * Displays visual indicators for supports and loads in the viewport
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFEAStore } from '../../store/feaStore';
import { 
  BoundaryCondition,
  FixedConstraint,
  ForceLoad,
  GravityLoad,
} from '@feai/shared';

export function FEABCIcons() {
  const {
    isSimulationMode,
    boundaryConditions,
    mesh,
    showBCIcons,
    selectedBCId,
  } = useFEAStore();

  if (!isSimulationMode || !showBCIcons || boundaryConditions.length === 0) {
    return null;
  }

  return (
    <group>
      {boundaryConditions.filter(bc => bc.enabled).map((bc) => (
        <BCIcon
          key={bc.id}
          bc={bc}
          mesh={mesh}
          isSelected={bc.id === selectedBCId}
        />
      ))}
    </group>
  );
}

function BCIcon({ 
  bc, 
  mesh, 
  isSelected 
}: { 
  bc: BoundaryCondition; 
  mesh: any; 
  isSelected: boolean;
}) {
  // Get position for the icon based on BC type
  const position = useMemo(() => {
    if (!mesh) return { x: 0, y: 0, z: 0 };

    if (bc.type === 'gravity') {
      // Place gravity icon at model center
      const bbox = mesh.boundingBox;
      return {
        x: (bbox.min.x + bbox.max.x) / 2,
        y: (bbox.min.y + bbox.max.y) / 2,
        z: bbox.max.z + 20,
      };
    }

    // For face-based BCs, find face center
    const geom = (bc as FixedConstraint).geometry;
    if (!geom) return { x: 0, y: 0, z: 0 };

    const nodeSet = mesh.nodeSets?.find((ns: any) => ns.name === geom.name);
    if (!nodeSet || nodeSet.nodeIds.length === 0) {
      // Fall back to bounding box face
      const bbox = mesh.boundingBox;
      switch (geom.name) {
        case 'ZMin': return { x: (bbox.min.x + bbox.max.x) / 2, y: (bbox.min.y + bbox.max.y) / 2, z: bbox.min.z };
        case 'ZMax': return { x: (bbox.min.x + bbox.max.x) / 2, y: (bbox.min.y + bbox.max.y) / 2, z: bbox.max.z };
        case 'XMin': return { x: bbox.min.x, y: (bbox.min.y + bbox.max.y) / 2, z: (bbox.min.z + bbox.max.z) / 2 };
        case 'XMax': return { x: bbox.max.x, y: (bbox.min.y + bbox.max.y) / 2, z: (bbox.min.z + bbox.max.z) / 2 };
        case 'YMin': return { x: (bbox.min.x + bbox.max.x) / 2, y: bbox.min.y, z: (bbox.min.z + bbox.max.z) / 2 };
        case 'YMax': return { x: (bbox.min.x + bbox.max.x) / 2, y: bbox.max.y, z: (bbox.min.z + bbox.max.z) / 2 };
        default: return { x: 0, y: 0, z: 0 };
      }
    }

    // Calculate center from nodes
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;
    for (const nodeId of nodeSet.nodeIds) {
      const node = mesh.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        sumX += node.x;
        sumY += node.y;
        sumZ += node.z;
        count++;
      }
    }
    return count > 0
      ? { x: sumX / count, y: sumY / count, z: sumZ / count }
      : { x: 0, y: 0, z: 0 };
  }, [bc, mesh]);

  const scale = isSelected ? 1.3 : 1;

  switch (bc.type) {
    case 'fixed':
      return <FixedIcon position={position} scale={scale} />;
    case 'force':
      return <ForceIcon position={position} bc={bc as ForceLoad} scale={scale} />;
    case 'gravity':
      return <GravityIcon position={position} bc={bc as GravityLoad} scale={scale} />;
    case 'pressure':
      return <PressureIcon position={position} scale={scale} />;
    default:
      return null;
  }
}

function FixedIcon({ position, scale }: { position: { x: number; y: number; z: number }; scale: number }) {
  const size = 8 * scale;
  
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Ground symbol */}
      <Line
        points={[
          [-size, 0, 0],
          [size, 0, 0],
        ]}
        color="#3b82f6"
        lineWidth={3}
      />
      <Line
        points={[
          [-size * 0.7, -size * 0.3, 0],
          [size * 0.7, -size * 0.3, 0],
        ]}
        color="#3b82f6"
        lineWidth={2}
      />
      <Line
        points={[
          [-size * 0.4, -size * 0.6, 0],
          [size * 0.4, -size * 0.6, 0],
        ]}
        color="#3b82f6"
        lineWidth={1.5}
      />
      
      {/* Lock icon */}
      <mesh position={[0, size * 0.5, 0]}>
        <boxGeometry args={[size * 0.8, size * 0.6, 2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  );
}

function ForceIcon({ position, bc, scale }: { 
  position: { x: number; y: number; z: number }; 
  bc: ForceLoad;
  scale: number;
}) {
  const length = 20 * scale;
  const dir = bc.force.direction;
  
  // Arrow pointing in force direction
  const endPoint: [number, number, number] = [
    position.x + dir.x * length,
    position.y + dir.y * length,
    position.z + dir.z * length,
  ];

  return (
    <group>
      {/* Arrow shaft */}
      <Line
        points={[
          [position.x, position.y, position.z],
          endPoint,
        ]}
        color="#ef4444"
        lineWidth={3}
      />
      
      {/* Arrow head */}
      <mesh position={endPoint} rotation={[
        dir.y !== 0 ? Math.atan2(dir.x, dir.z) : 0,
        dir.x !== 0 ? -Math.atan2(dir.y, Math.sqrt(dir.x * dir.x + dir.z * dir.z)) : 0,
        0,
      ]}>
        <coneGeometry args={[3 * scale, 6 * scale, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

function GravityIcon({ position, bc, scale }: { 
  position: { x: number; y: number; z: number }; 
  bc: GravityLoad;
  scale: number;
}) {
  const size = 10 * scale;
  
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* "g" symbol */}
      <mesh>
        <sphereGeometry args={[size * 0.5, 16, 16]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
      
      {/* Down arrow */}
      <Line
        points={[
          [0, 0, 0],
          [0, 0, -size * 2],
        ]}
        color="#22c55e"
        lineWidth={2}
      />
      <mesh position={[0, 0, -size * 2]}>
        <coneGeometry args={[3 * scale, 5 * scale, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

function PressureIcon({ position, scale }: { position: { x: number; y: number; z: number }; scale: number }) {
  const size = 6 * scale;
  
  // Multiple arrows representing distributed pressure
  const offsets = [
    [-size, -size, 0],
    [size, -size, 0],
    [-size, size, 0],
    [size, size, 0],
    [0, 0, 0],
  ];

  return (
    <group position={[position.x, position.y, position.z]}>
      {offsets.map((offset, i) => (
        <group key={i} position={[offset[0], offset[1], offset[2]]}>
          <Line
            points={[
              [0, 0, 10 * scale],
              [0, 0, 0],
            ]}
            color="#f97316"
            lineWidth={2}
          />
          <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[2 * scale, 4 * scale, 6]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

