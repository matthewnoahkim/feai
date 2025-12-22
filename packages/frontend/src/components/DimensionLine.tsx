/**
 * DimensionLine - 3D visualization of measurements
 * Renders dimension lines with arrows, extension lines, and labels
 */

import React, { useMemo } from 'react'
import { Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Measurement } from '../store/uiStore'
import { formatMeasurement } from '../utils/measurement-utils'

interface DimensionLineProps {
  measurement: Measurement
  isPreview?: boolean
}

export function DimensionLine({ measurement, isPreview = false }: DimensionLineProps) {
  const { points, arrowStart, arrowEnd, extensionLine1, extensionLine2, midpoint } = useMemo(() => {
    // Get positions
    const pos1 = measurement.entity1.position
    const pos2 = measurement.entity2?.position
    
    if (!pos1 || !pos2) {
      return {
        points: [],
        arrowStart: null,
        arrowEnd: null,
        extensionLine1: null,
        extensionLine2: null,
        midpoint: null
      }
    }
    
    const p1 = new THREE.Vector3(...pos1)
    const p2 = new THREE.Vector3(...pos2)
    
    // Main dimension line points
    const points = [p1, p2]
    
    // Calculate direction and perpendicular for arrows
    const direction = new THREE.Vector3().subVectors(p2, p1).normalize()
    const arrowLength = Math.min(5, p1.distanceTo(p2) * 0.1)
    
    // Arrow at start (pointing away from end)
    const arrowStart = {
      base: p1.clone(),
      tip: p1.clone().add(direction.clone().multiplyScalar(arrowLength))
    }
    
    // Arrow at end (pointing away from start)
    const arrowEnd = {
      base: p2.clone(),
      tip: p2.clone().sub(direction.clone().multiplyScalar(arrowLength))
    }
    
    // Extension lines (perpendicular to dimension line)
    const perpendicular = new THREE.Vector3(0, 1, 0)
    if (Math.abs(direction.y) > 0.9) {
      perpendicular.set(1, 0, 0)
    }
    perpendicular.cross(direction).normalize()
    
    const extensionLength = 10
    
    const extensionLine1 = [
      p1.clone().add(perpendicular.clone().multiplyScalar(-extensionLength * 0.5)),
      p1.clone().add(perpendicular.clone().multiplyScalar(extensionLength * 0.5))
    ]
    
    const extensionLine2 = [
      p2.clone().add(perpendicular.clone().multiplyScalar(-extensionLength * 0.5)),
      p2.clone().add(perpendicular.clone().multiplyScalar(extensionLength * 0.5))
    ]
    
    // Midpoint for label
    const midpoint = new THREE.Vector3().lerpVectors(p1, p2, 0.5)
    
    return {
      points,
      arrowStart,
      arrowEnd,
      extensionLine1,
      extensionLine2,
      midpoint
    }
  }, [measurement])
  
  if (points.length === 0 || !midpoint) return null
  
  const color = isPreview ? '#3b82f6' : '#10b981'
  const opacity = isPreview ? 0.6 : 1.0
  
  return (
    <group>
      {/* Main dimension line */}
      <Line
        points={points}
        color={color}
        lineWidth={2}
        transparent
        opacity={opacity}
      />
      
      {/* Arrow at start */}
      {arrowStart && (
        <>
          <Line
            points={[
              arrowStart.base,
              arrowStart.tip.clone().add(new THREE.Vector3(0.5, 0.5, 0))
            ]}
            color={color}
            lineWidth={1.5}
            transparent
            opacity={opacity}
          />
          <Line
            points={[
              arrowStart.base,
              arrowStart.tip.clone().add(new THREE.Vector3(-0.5, 0.5, 0))
            ]}
            color={color}
            lineWidth={1.5}
            transparent
            opacity={opacity}
          />
        </>
      )}
      
      {/* Arrow at end */}
      {arrowEnd && (
        <>
          <Line
            points={[
              arrowEnd.base,
              arrowEnd.tip.clone().add(new THREE.Vector3(0.5, -0.5, 0))
            ]}
            color={color}
            lineWidth={1.5}
            transparent
            opacity={opacity}
          />
          <Line
            points={[
              arrowEnd.base,
              arrowEnd.tip.clone().add(new THREE.Vector3(-0.5, -0.5, 0))
            ]}
            color={color}
            lineWidth={1.5}
            transparent
            opacity={opacity}
          />
        </>
      )}
      
      {/* Extension lines */}
      {extensionLine1 && (
        <Line
          points={extensionLine1}
          color={color}
          lineWidth={1}
          transparent
          opacity={opacity * 0.5}
          dashed
          dashSize={2}
          gapSize={1}
        />
      )}
      
      {extensionLine2 && (
        <Line
          points={extensionLine2}
          color={color}
          lineWidth={1}
          transparent
          opacity={opacity * 0.5}
          dashed
          dashSize={2}
          gapSize={1}
        />
      )}
      
      {/* Dimension label */}
      <Html position={midpoint.toArray()} center>
        <div
          className={`
            px-2 py-1 rounded shadow-lg text-xs font-mono font-semibold
            ${isPreview 
              ? 'bg-blue-500/90 text-white' 
              : 'bg-emerald-500/90 text-white'
            }
          `}
          style={{
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap'
          }}
        >
          {formatMeasurement(measurement)}
          {isPreview && <span className="ml-1 opacity-75">(preview)</span>}
        </div>
      </Html>
    </group>
  )
}

/**
 * Angular dimension visualization for angles
 */
interface AngleDimensionProps {
  measurement: Measurement
  isPreview?: boolean
}

export function AngleDimension({ measurement, isPreview = false }: AngleDimensionProps) {
  const { arcPoints, labelPosition } = useMemo(() => {
    const pos1 = measurement.entity1.position
    const pos2 = measurement.entity2?.position
    const dir1 = measurement.entity1.direction
    const dir2 = measurement.entity2?.direction
    
    if (!pos1 || !pos2 || !dir1 || !dir2) {
      return { arcPoints: [], labelPosition: null }
    }
    
    // Use first position as center
    const center = new THREE.Vector3(...pos1)
    const v1 = new THREE.Vector3(...dir1).normalize()
    const v2 = new THREE.Vector3(...dir2).normalize()
    
    // Create arc between the two vectors
    const arcRadius = 15
    const segments = 16
    const arcPoints: THREE.Vector3[] = []
    
    // Calculate angle
    const angle = Math.acos(Math.max(-1, Math.min(1, v1.dot(v2))))
    
    // Create rotation axis
    const axis = new THREE.Vector3().crossVectors(v1, v2).normalize()
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const currentAngle = angle * t
      const rotated = v1.clone().applyAxisAngle(axis, currentAngle)
      const point = center.clone().add(rotated.multiplyScalar(arcRadius))
      arcPoints.push(point)
    }
    
    // Label at middle of arc
    const midAngle = angle / 2
    const midVector = v1.clone().applyAxisAngle(axis, midAngle)
    const labelPosition = center.clone().add(midVector.multiplyScalar(arcRadius * 1.2))
    
    return { arcPoints, labelPosition }
  }, [measurement])
  
  if (arcPoints.length === 0 || !labelPosition) return null
  
  const color = isPreview ? '#3b82f6' : '#f59e0b'
  const opacity = isPreview ? 0.6 : 1.0
  
  return (
    <group>
      {/* Arc */}
      <Line
        points={arcPoints}
        color={color}
        lineWidth={2}
        transparent
        opacity={opacity}
      />
      
      {/* Angle label */}
      <Html position={labelPosition.toArray()} center>
        <div
          className={`
            px-2 py-1 rounded shadow-lg text-xs font-mono font-semibold
            ${isPreview 
              ? 'bg-blue-500/90 text-white' 
              : 'bg-amber-500/90 text-white'
            }
          `}
          style={{
            backdropFilter: 'blur(4px)',
            whiteSpace: 'nowrap'
          }}
        >
          {formatMeasurement(measurement)}
          {isPreview && <span className="ml-1 opacity-75">(preview)</span>}
        </div>
      </Html>
    </group>
  )
}

