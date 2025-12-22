/**
 * TransformGizmo - Interactive 3D gizmo for moving and rotating bodies
 * Similar to gumball widget in Rhino or transform gizmo in Blender
 */

import React, { useRef, useState, useCallback } from 'react'
import { useThree, ThreeEvent } from '@react-three/fiber'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import * as THREE from 'three'
import { Line } from '@react-three/drei'

interface ArrowProps {
  direction: [number, number, number]
  color: string
  axis: 'x' | 'y' | 'z'
  onDrag: (delta: number) => void
}

function TranslationArrow({ direction, color, axis, onDrag }: ArrowProps) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<THREE.Vector3 | null>(null)
  const { camera, raycaster, gl } = useThree()
  
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(true)
    dragStart.current = e.point.clone()
    gl.domElement.style.cursor = 'grabbing'
  }, [gl])
  
  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!dragging || !dragStart.current) return
    e.stopPropagation()
    
    const currentPoint = e.point
    const dir = new THREE.Vector3(...direction).normalize()
    const delta = currentPoint.clone().sub(dragStart.current)
    const projectedDelta = delta.dot(dir)
    
    onDrag(projectedDelta)
    dragStart.current = currentPoint
  }, [dragging, direction, onDrag])
  
  const handlePointerUp = useCallback(() => {
    setDragging(false)
    dragStart.current = null
    gl.domElement.style.cursor = hovered ? 'grab' : 'default'
  }, [gl, hovered])
  
  const dir = new THREE.Vector3(...direction)
  const arrowLength = 30
  const end = dir.clone().multiplyScalar(arrowLength)
  
  return (
    <group>
      {/* Arrow shaft */}
      <mesh
        position={dir.clone().multiplyScalar(arrowLength / 2).toArray()}
        rotation={[
          direction[0] !== 0 ? 0 : Math.PI / 2,
          direction[1] !== 0 ? 0 : Math.PI / 2,
          direction[2] !== 0 ? Math.PI / 2 : 0
        ]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={() => {
          setHovered(true)
          gl.domElement.style.cursor = 'grab'
        }}
        onPointerLeave={() => {
          setHovered(false)
          if (!dragging) gl.domElement.style.cursor = 'default'
        }}
      >
        <cylinderGeometry args={[hovered || dragging ? 0.8 : 0.5, hovered || dragging ? 0.8 : 0.5, arrowLength * 0.8, 8]} />
        <meshStandardMaterial color={color} transparent opacity={hovered || dragging ? 1 : 0.8} />
      </mesh>
      
      {/* Arrow head */}
      <mesh
        position={end.toArray()}
        rotation={[
          direction[0] !== 0 ? Math.PI / 2 : 0,
          direction[1] !== 0 ? -Math.PI / 2 : 0,
          direction[2] !== 0 ? 0 : 0
        ]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={() => {
          setHovered(true)
          gl.domElement.style.cursor = 'grab'
        }}
        onPointerLeave={() => {
          setHovered(false)
          if (!dragging) gl.domElement.style.cursor = 'default'
        }}
      >
        <coneGeometry args={[2, 5, 8]} />
        <meshStandardMaterial color={color} transparent opacity={hovered || dragging ? 1 : 0.8} />
      </mesh>
    </group>
  )
}

interface RotationArcProps {
  axis: 'x' | 'y' | 'z'
  color: string
  onRotate: (angle: number) => void
}

function RotationArc({ axis, color, onRotate }: RotationArcProps) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { gl } = useThree()
  
  // Create arc geometry
  const arcPoints = React.useMemo(() => {
    const points: THREE.Vector3[] = []
    const radius = 25
    const segments = 32
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = axis === 'x' ? 0 : Math.cos(angle) * radius
      const y = axis === 'y' ? 0 : Math.cos(angle) * radius
      const z = axis === 'z' ? 0 : Math.sin(angle) * radius
      
      if (axis === 'x') {
        points.push(new THREE.Vector3(0, Math.cos(angle) * radius, Math.sin(angle) * radius))
      } else if (axis === 'y') {
        points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
      } else {
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
      }
    }
    
    return points
  }, [axis])
  
  return (
    <group>
      <Line
        points={arcPoints}
        color={color}
        lineWidth={hovered || dragging ? 3 : 2}
        transparent
        opacity={hovered || dragging ? 1 : 0.6}
        onPointerEnter={() => {
          setHovered(true)
          gl.domElement.style.cursor = 'grab'
        }}
        onPointerLeave={() => {
          setHovered(false)
          if (!dragging) gl.domElement.style.cursor = 'default'
        }}
      />
    </group>
  )
}

export function TransformGizmo() {
  const { transformState, setTransformTranslation, updatePreviewTransform } = useUIStore()
  const { document } = useDocumentStore()
  
  if (!transformState.isActive || !transformState.bodyId) return null
  
  // Find the body to transform
  const body = React.useMemo(() => {
    if (!document) return null
    for (const ps of document.partStudios) {
      const part = ps.parts.find(p => p.id === transformState.bodyId)
      if (part) return part
    }
    return null
  }, [document, transformState.bodyId])
  
  if (!body) return null
  
  // Calculate gizmo position (center of body or use transform preview)
  const gizmoPosition: [number, number, number] = transformState.previewTransform?.position || [0, 0, 0]
  
  const handleTranslate = useCallback((axis: 'x' | 'y' | 'z', delta: number) => {
    const newTranslation = { ...transformState.translation }
    newTranslation[axis] += delta
    setTransformTranslation(newTranslation)
    
    // Update preview
    const newPosition: [number, number, number] = [
      gizmoPosition[0] + (axis === 'x' ? delta : 0),
      gizmoPosition[1] + (axis === 'y' ? delta : 0),
      gizmoPosition[2] + (axis === 'z' ? delta : 0)
    ]
    updatePreviewTransform(newPosition, [0, 0, 0])
  }, [transformState.translation, gizmoPosition, setTransformTranslation, updatePreviewTransform])
  
  const handleRotate = useCallback((axis: 'x' | 'y' | 'z', angle: number) => {
    // Rotation handling would go here
  }, [])
  
  return (
    <group position={gizmoPosition}>
      {transformState.gizmoMode === 'translate' && (
        <>
          {/* X axis - Red */}
          <TranslationArrow
            direction={[1, 0, 0]}
            color="#ef4444"
            axis="x"
            onDrag={(delta) => handleTranslate('x', delta)}
          />
          
          {/* Y axis - Green */}
          <TranslationArrow
            direction={[0, 1, 0]}
            color="#22c55e"
            axis="y"
            onDrag={(delta) => handleTranslate('y', delta)}
          />
          
          {/* Z axis - Blue */}
          <TranslationArrow
            direction={[0, 0, 1]}
            color="#3b82f6"
            axis="z"
            onDrag={(delta) => handleTranslate('z', delta)}
          />
        </>
      )}
      
      {transformState.gizmoMode === 'rotate' && (
        <>
          {/* Rotation arcs */}
          <RotationArc axis="x" color="#ef4444" onRotate={(angle) => handleRotate('x', angle)} />
          <RotationArc axis="y" color="#22c55e" onRotate={(angle) => handleRotate('y', angle)} />
          <RotationArc axis="z" color="#3b82f6" onRotate={(angle) => handleRotate('z', angle)} />
        </>
      )}
      
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
    </group>
  )
}

