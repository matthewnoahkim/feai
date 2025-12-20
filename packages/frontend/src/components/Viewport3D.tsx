/**
 * 3D Viewport - Interactive Three.js scene for CAD visualization
 */

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { 
  OrbitControls, 
  GizmoHelper, 
  GizmoViewport,
  Line
} from '@react-three/drei'
import * as THREE from 'three'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { useFEAStore } from '../store/feaStore'
import { FEAResultsViewer, FEAMeshPreview, FEABCIcons } from './fea'

// Grid component - efficient grid using single geometry
function CADGrid() {
  const { viewSettings } = useUIStore()

  const gridSize = 400
  const cellSize = 10
  const majorCellSize = 50
  
  // Generate grid points for a single LineSegments geometry
  const { minorPoints, majorPoints } = useMemo(() => {
    const minor: number[] = []
    const major: number[] = []
    const half = gridSize / 2
    
    // Lines parallel to X axis (running along Z)
    for (let z = -half; z <= half; z += cellSize) {
      const isMajor = z % majorCellSize === 0
      const target = isMajor ? major : minor
      target.push(-half, 0, z, half, 0, z)
    }
    
    // Lines parallel to Z axis (running along X)
    for (let x = -half; x <= half; x += cellSize) {
      const isMajor = x % majorCellSize === 0
      const target = isMajor ? major : minor
      target.push(x, 0, -half, x, 0, half)
    }
    
    return { minorPoints: new Float32Array(minor), majorPoints: new Float32Array(major) }
  }, [])

  // Early return AFTER all hooks
  if (!viewSettings.showGrid) return null

  return (
    <group position={[0, 0.01, 0]}>
      {/* Minor grid lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={minorPoints.length / 3}
            array={minorPoints}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
      </lineSegments>
      {/* Major grid lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={majorPoints.length / 3}
            array={majorPoints}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

// Origin axes - RGB colored (X=Red, Y=Green, Z=Blue)
function OriginAxes() {
  const { viewSettings } = useUIStore()
  
  if (!viewSettings.showOrigin) return null

  const length = 50
  
  return (
    <group>
      {/* X axis - Red */}
      <Line points={[[0, 0, 0], [length, 0, 0]]} color="#ef4444" lineWidth={2} />
      {/* Y axis - Green */}
      <Line points={[[0, 0, 0], [0, length, 0]]} color="#22c55e" lineWidth={2} />
      {/* Z axis - Blue */}
      <Line points={[[0, 0, 0], [0, 0, length]]} color="#3b82f6" lineWidth={2} />
    </group>
  )
}

// Reference planes - RGB colored (XY=Blue, XZ=Green, YZ=Red)
function ReferencePlanes() {
  const { viewSettings, sketchMode } = useUIStore()
  
  if (!viewSettings.showPlanes) return null

  const planeSize = 80
  const opacity = sketchMode ? 0.03 : 0.06

  return (
    <group>
      {/* XY Plane (Top) - Blue, offset slightly below grid */}
      <mesh rotation={[0, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      
      {/* XZ Plane (Front) - Green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      
      {/* YZ Plane (Right) - Red */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// Part mesh component
function PartMesh({ part, isSelected }: { part: any; isSelected: boolean }) {
  const { viewSettings, setSelection, setHovered, hovered } = useUIStore()
  const meshRef = useRef<THREE.Mesh>(null)
  
  const isHovered = hovered === part.id
  
  // Create geometry from mesh data
  const geometry = useMemo(() => {
    if (!part.mesh) return null
    
    try {
      const { vertices, normals, indices } = part.mesh
      
      if (!vertices || vertices.length === 0) return null
      
      const geo = new THREE.BufferGeometry()
      
      // Set positions
      const positionArray = new Float32Array(vertices)
      geo.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
      
      // Set indices
      if (indices && indices.length > 0) {
        geo.setIndex(Array.from(indices))
      }
      
      // Set or compute normals
      if (normals && normals.length === vertices.length) {
        // Check if normals are valid (not all zeros)
        const hasValidNormals = normals.some((n: number) => n !== 0)
        if (hasValidNormals) {
          const normalArray = new Float32Array(normals)
          geo.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3))
        } else {
          geo.computeVertexNormals()
        }
      } else {
        geo.computeVertexNormals()
      }
      
      geo.computeBoundingBox()
      geo.computeBoundingSphere()
      
      return geo
    } catch (error) {
      console.error('Error creating geometry:', error)
      return null
    }
  }, [part.mesh])
  
  // Handle click
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setSelection({ type: 'body', ids: [part.id] })
  }, [part.id, setSelection])
  
  // Handle hover
  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(part.id)
  }, [part.id, setHovered])
  
  const handlePointerOut = useCallback(() => {
    setHovered(null)
  }, [setHovered])
  
  if (!geometry) return null
  
  // Determine color
  let color = part.color || '#6b7280'
  if (isSelected) color = '#3b82f6'
  else if (isHovered) color = '#60a5fa'
  
  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        {viewSettings.displayMode === 'wireframe' ? (
          <meshBasicMaterial color={color} wireframe />
        ) : (
          <meshStandardMaterial 
            color={color}
            metalness={0.3}
            roughness={0.7}
          />
        )}
      </mesh>
      
      {/* Edge lines */}
      {viewSettings.displayMode === 'shadedEdges' && (
        <lineSegments geometry={new THREE.EdgesGeometry(geometry)}>
          <lineBasicMaterial color={isSelected ? '#1d4ed8' : '#1f2937'} />
        </lineSegments>
      )}
    </group>
  )
}

// Sketch visualization
function SketchVisualization() {
  const { sketchMode, isDrawing, drawingPoints } = useUIStore()
  const { document } = useDocumentStore()
  
  if (!sketchMode) return null
  
  const partStudio = document?.partStudios.find(ps => ps.id === sketchMode.partStudioId)
  const sketch = partStudio?.sketches.get(sketchMode.sketchId!)
  
  if (!sketch) return null
  
  // Render sketch entities
  const entities = sketch.entities.map((entity, index) => {
    switch (entity.type) {
      case 'line':
        if (entity.data.start && entity.data.end) {
          return (
            <Line
              key={entity.id}
              points={[
                [entity.data.start.x, entity.data.start.y, entity.data.start.z || 0],
                [entity.data.end.x, entity.data.end.y, entity.data.end.z || 0]
              ]}
              color={entity.construction ? '#f59e0b' : '#3b82f6'}
              lineWidth={2}
            />
          )
        }
        return null
        
      case 'circle':
        if (entity.data.center && entity.data.radius) {
          const points: [number, number, number][] = []
          const segments = 64
          for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            points.push([
              entity.data.center.x + Math.cos(angle) * entity.data.radius,
              entity.data.center.y + Math.sin(angle) * entity.data.radius,
              entity.data.center.z || 0
            ])
          }
          return (
            <Line
              key={entity.id}
              points={points}
              color={entity.construction ? '#f59e0b' : '#3b82f6'}
              lineWidth={2}
            />
          )
        }
        return null
        
      case 'rectangle':
        if (entity.data.corner1 && entity.data.corner2) {
          const c1 = entity.data.corner1
          const c2 = entity.data.corner2
          return (
            <Line
              key={entity.id}
              points={[
                [c1.x, c1.y, 0],
                [c2.x, c1.y, 0],
                [c2.x, c2.y, 0],
                [c1.x, c2.y, 0],
                [c1.x, c1.y, 0]
              ]}
              color={entity.construction ? '#f59e0b' : '#3b82f6'}
              lineWidth={2}
            />
          )
        }
        return null
        
      default:
        return null
    }
  })
  
  // Render drawing preview
  const drawingPreview = isDrawing && drawingPoints.length > 0 && (
    <Line
      points={drawingPoints.map(p => [p.x, p.y, p.z] as [number, number, number])}
      color="#22c55e"
      lineWidth={2}
      dashed
    />
  )
  
  return (
    <group>
      {entities}
      {drawingPreview}
    </group>
  )
}

// Helper function to create extrude preview geometry (no hooks - pure function)
function createExtrudePreviewGeometry(
  entity: any,
  zBottom: number,
  zTop: number,
  useDraft: boolean,
  draftAngle: number,
  draftOutward: boolean
): THREE.BufferGeometry | null {
  if (!entity) return null
  
  try {
    const geo = new THREE.BufferGeometry()
    
    if (entity.type === 'rectangle') {
      const data = entity.data
      let cx = 0, cy = 0, hw = 15, hh = 15
      
      if (data.start && data.end) {
        const x1 = data.start.x, y1 = data.start.y
        const x2 = data.end.x, y2 = data.end.y
        hw = Math.abs(x2 - x1) / 2
        hh = Math.abs(y2 - y1) / 2
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
      } else if (data.corner1 && data.corner2) {
        const c1 = data.corner1, c2 = data.corner2
        hw = Math.abs(c2.x - c1.x) / 2
        hh = Math.abs(c2.y - c1.y) / 2
        cx = (c1.x + c2.x) / 2
        cy = (c1.y + c2.y) / 2
      }
      
      if (hw <= 0 || hh <= 0) return null
      
      let topHW = hw, topHH = hh
      if (useDraft && draftAngle > 0) {
        const draftRad = (draftAngle * Math.PI) / 180
        const totalDepth = Math.abs(zTop - zBottom)
        const taper = Math.tan(draftRad) * totalDepth
        topHW = draftOutward ? hw + taper / 2 : Math.max(0.1, hw - taper / 2)
        topHH = draftOutward ? hh + taper / 2 : Math.max(0.1, hh - taper / 2)
      }
      
      const vertices = new Float32Array([
        cx - hw, cy - hh, zBottom,  cx + hw, cy - hh, zBottom,  cx + topHW, cy - topHH, zTop,  cx - topHW, cy - topHH, zTop,
        cx + hw, cy + hh, zBottom,  cx - hw, cy + hh, zBottom,  cx - topHW, cy + topHH, zTop,  cx + topHW, cy + topHH, zTop,
        cx - topHW, cy - topHH, zTop,  cx + topHW, cy - topHH, zTop,  cx + topHW, cy + topHH, zTop,  cx - topHW, cy + topHH, zTop,
        cx - hw, cy + hh, zBottom,  cx + hw, cy + hh, zBottom,  cx + hw, cy - hh, zBottom,  cx - hw, cy - hh, zBottom,
        cx + hw, cy - hh, zBottom,  cx + hw, cy + hh, zBottom,  cx + topHW, cy + topHH, zTop,  cx + topHW, cy - topHH, zTop,
        cx - hw, cy + hh, zBottom,  cx - hw, cy - hh, zBottom,  cx - topHW, cy - topHH, zTop,  cx - topHW, cy + topHH, zTop,
      ])
      
      const normals = new Float32Array([
        0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
      ])
      
      geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
      geo.setIndex([0,1,2,0,2,3, 4,5,6,4,6,7, 8,9,10,8,10,11, 12,13,14,12,14,15, 16,17,18,16,18,19, 20,21,22,20,22,23])
      
    } else if (entity.type === 'circle') {
      const cx = entity.data.center?.x || 0
      const cy = entity.data.center?.y || 0
      const radius = entity.data.radius || 15
      if (radius <= 0) return null
      
      const segments = 32
      let topRadius = radius
      if (useDraft && draftAngle > 0) {
        const draftRad = (draftAngle * Math.PI) / 180
        const taper = Math.tan(draftRad) * Math.abs(zTop - zBottom)
        topRadius = draftOutward ? radius + taper : Math.max(0.1, radius - taper)
      }
      
      const vertices: number[] = []
      const normals: number[] = []
      const indices: number[] = []
      
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2
        const cosT = Math.cos(theta), sinT = Math.sin(theta)
        vertices.push(cx + cosT * radius, cy + sinT * radius, zBottom)
        normals.push(cosT, sinT, 0)
        vertices.push(cx + cosT * topRadius, cy + sinT * topRadius, zTop)
        normals.push(cosT, sinT, 0)
      }
      
      for (let i = 0; i < segments; i++) {
        const i0 = i * 2, i1 = i * 2 + 1, i2 = (i + 1) * 2, i3 = (i + 1) * 2 + 1
        indices.push(i0, i2, i1, i1, i2, i3)
      }
      
      // Top cap
      const topCenterIdx = vertices.length / 3
      vertices.push(cx, cy, zTop)
      normals.push(0, 0, 1)
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2
        vertices.push(cx + Math.cos(theta) * topRadius, cy + Math.sin(theta) * topRadius, zTop)
        normals.push(0, 0, 1)
      }
      for (let i = 0; i < segments; i++) {
        indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 2 + i)
      }
      
      // Bottom cap
      const bottomCenterIdx = vertices.length / 3
      vertices.push(cx, cy, zBottom)
      normals.push(0, 0, -1)
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2
        vertices.push(cx + Math.cos(theta) * radius, cy + Math.sin(theta) * radius, zBottom)
        normals.push(0, 0, -1)
      }
      for (let i = 0; i < segments; i++) {
        indices.push(bottomCenterIdx, bottomCenterIdx + 2 + i, bottomCenterIdx + 1 + i)
      }
      
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geo.setIndex(indices)
      
    } else if (entity.type === 'polygon') {
      const cx = entity.data.center?.x || 0
      const cy = entity.data.center?.y || 0
      const radius = entity.data.radius || 15
      const sides = entity.data.sides || 6
      if (radius <= 0 || sides < 3) return null
      
      let topRadius = radius
      if (useDraft && draftAngle > 0) {
        const draftRad = (draftAngle * Math.PI) / 180
        const taper = Math.tan(draftRad) * Math.abs(zTop - zBottom)
        topRadius = draftOutward ? radius + taper : Math.max(0.1, radius - taper)
      }
      
      const vertices: number[] = []
      const normals: number[] = []
      const indices: number[] = []
      
      const bottomVerts: [number, number][] = []
      const topVerts: [number, number][] = []
      
      for (let i = 0; i < sides; i++) {
        const theta = (i / sides) * Math.PI * 2 - Math.PI / 2
        bottomVerts.push([cx + Math.cos(theta) * radius, cy + Math.sin(theta) * radius])
        topVerts.push([cx + Math.cos(theta) * topRadius, cy + Math.sin(theta) * topRadius])
      }
      
      for (let i = 0; i < sides; i++) {
        const nextI = (i + 1) % sides
        const baseIdx = vertices.length / 3
        const dx = bottomVerts[nextI][0] - bottomVerts[i][0]
        const dy = bottomVerts[nextI][1] - bottomVerts[i][1]
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = dy / len, ny = -dx / len
        
        vertices.push(bottomVerts[i][0], bottomVerts[i][1], zBottom)
        vertices.push(bottomVerts[nextI][0], bottomVerts[nextI][1], zBottom)
        vertices.push(topVerts[nextI][0], topVerts[nextI][1], zTop)
        vertices.push(topVerts[i][0], topVerts[i][1], zTop)
        for (let j = 0; j < 4; j++) normals.push(nx, ny, 0)
        indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3)
      }
      
      // Top cap
      const topCenterIdx = vertices.length / 3
      vertices.push(cx, cy, zTop)
      normals.push(0, 0, 1)
      for (let i = 0; i < sides; i++) {
        vertices.push(topVerts[i][0], topVerts[i][1], zTop)
        normals.push(0, 0, 1)
      }
      for (let i = 0; i < sides; i++) {
        indices.push(topCenterIdx, topCenterIdx + 1 + i, topCenterIdx + 1 + ((i + 1) % sides))
      }
      
      // Bottom cap
      const bottomCenterIdx = vertices.length / 3
      vertices.push(cx, cy, zBottom)
      normals.push(0, 0, -1)
      for (let i = 0; i < sides; i++) {
        vertices.push(bottomVerts[i][0], bottomVerts[i][1], zBottom)
        normals.push(0, 0, -1)
      }
      for (let i = 0; i < sides; i++) {
        indices.push(bottomCenterIdx, bottomCenterIdx + 1 + ((i + 1) % sides), bottomCenterIdx + 1 + i)
      }
      
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geo.setIndex(indices)
    } else {
      return null
    }
    
    return geo
  } catch (error) {
    console.error('Error creating extrude preview geometry:', error)
    return null
  }
}

// Extrude preview component - shows preview while dialog is open
function ExtrudePreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  // Calculate all preview data using useMemo at the top level (proper hooks usage)
  const previewData = useMemo(() => {
    if (activeDialog !== 'extrude' || !dialogData) return null
    
    const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
    if (!activePartStudio) return null
    
    const profileIds = dialogData.profileIds || []
    if (profileIds.length === 0) return null
    
    const depth1 = dialogData.depth1 || 25
    const flipDirection = dialogData.flipDirection1 || false
    const endCondition = dialogData.endCondition1 || 'blind'
    const useSecondDirection = dialogData.useSecondDirection || false
    const depth2 = dialogData.depth2 || 0
    const useDraft = dialogData.useDraft || false
    const draftAngle = dialogData.draftAngle || 0
    const draftOutward = dialogData.draftOutward || false
    const operation = dialogData.operation || 'new'
    
    // Calculate z positions
    let zBottom = 0, zTop = depth1
    
    if (endCondition === 'symmetric') {
      zBottom = -depth1 / 2
      zTop = depth1 / 2
    } else if (flipDirection) {
      zBottom = -depth1
      zTop = 0
    }
    
    if (useSecondDirection && endCondition !== 'symmetric') {
      if (flipDirection) {
        zTop = depth2
      } else {
        zBottom = -depth2
      }
    }
    
    // Get color based on operation
    let color = '#3b82f6'
    if (operation === 'add') color = '#22c55e'
    else if (operation === 'remove') color = '#ef4444'
    else if (operation === 'intersect') color = '#a855f7'
    
    // Find entities and create geometries
    const meshes: { id: string; geometry: THREE.BufferGeometry }[] = []
    
    for (const profileId of profileIds) {
      let entity: any = null
      activePartStudio.sketches.forEach((sketch) => {
        const found = sketch.entities.find(e => e.id === profileId)
        if (found) entity = found
      })
      
      if (entity) {
        const geo = createExtrudePreviewGeometry(entity, zBottom, zTop, useDraft, draftAngle, draftOutward)
        if (geo) {
          meshes.push({ id: profileId, geometry: geo })
        }
      }
    }
    
    return { meshes, color }
  }, [activeDialog, dialogData, document])
  
  if (!previewData || previewData.meshes.length === 0) return null
  
  return (
    <group>
      {previewData.meshes.map(({ id, geometry }) => (
        <mesh key={id} geometry={geometry}>
          <meshStandardMaterial 
            color={previewData.color}
            transparent
            opacity={0.6}
            metalness={0.2}
            roughness={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// Revolve preview component - shows preview while dialog is open
function RevolvePreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'revolve' || !dialogData) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const profileId = dialogData.profileId
  if (!profileId) return null
  
  const angle = dialogData.angle || 360
  const axisId = dialogData.axisId || 'y-axis'
  const directionType = dialogData.directionType || 'full'
  const angle2 = dialogData.angle2 || 0
  const operation = dialogData.operation || 'new'
  
  // Calculate actual angle
  let startAngle = 0
  let endAngle = (angle * Math.PI) / 180
  
  if (directionType === 'symmetric') {
    startAngle = -((angle * Math.PI) / 180)
    endAngle = (angle * Math.PI) / 180
  } else if (directionType === 'full') {
    endAngle = Math.PI * 2
  } else if (angle2 > 0) {
    startAngle = -((angle2 * Math.PI) / 180)
  }
  
  // Get preview color based on operation
  const getPreviewColor = () => {
    switch (operation) {
      case 'add': return '#22c55e'
      case 'remove': return '#ef4444'
      case 'intersect': return '#a855f7'
      default: return '#8b5cf6' // Purple for revolve
    }
  }
  
  // Find the entity
  let entity: any = null
  activePartStudio.sketches.forEach((sketch) => {
    const found = sketch.entities.find(e => e.id === profileId)
    if (found) entity = found
  })
  
  if (!entity) return null
  
  // Create preview geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    
    // Get axis direction
    const getAxisDir = () => {
      switch (axisId) {
        case 'x-axis': return [1, 0, 0]
        case 'y-axis': return [0, 1, 0]
        case 'z-axis': return [0, 0, 1]
        default: return [0, 1, 0]
      }
    }
    const axisDir = getAxisDir()
    
    if (entity.type === 'circle') {
      // Create torus preview
      const cx = entity.data.center?.x || 20
      const cy = entity.data.center?.y || 0
      const radius = entity.data.radius || 10
      
      const tubeRadius = radius
      const torusRadius = Math.max(cx, radius + 5)
      
      const profileSegments = 16
      const revolveSegments = Math.max(8, Math.ceil(32 * Math.abs(endAngle - startAngle) / (2 * Math.PI)))
      
      const vertices: number[] = []
      const normals: number[] = []
      const indices: number[] = []
      
      for (let i = 0; i <= revolveSegments; i++) {
        const u = i / revolveSegments
        const theta = startAngle + u * (endAngle - startAngle)
        const cosTheta = Math.cos(theta)
        const sinTheta = Math.sin(theta)
        
        for (let j = 0; j <= profileSegments; j++) {
          const v = j / profileSegments
          const phi = v * Math.PI * 2
          const cosPhi = Math.cos(phi)
          const sinPhi = Math.sin(phi)
          
          const r = torusRadius + tubeRadius * cosPhi
          
          if (axisDir[1] === 1) {
            vertices.push(r * cosTheta, cy + tubeRadius * sinPhi, r * sinTheta)
            normals.push(cosPhi * cosTheta, sinPhi, cosPhi * sinTheta)
          } else if (axisDir[0] === 1) {
            vertices.push(cy + tubeRadius * sinPhi, r * cosTheta, r * sinTheta)
            normals.push(sinPhi, cosPhi * cosTheta, cosPhi * sinTheta)
          } else {
            vertices.push(r * cosTheta, r * sinTheta, cy + tubeRadius * sinPhi)
            normals.push(cosPhi * cosTheta, cosPhi * sinTheta, sinPhi)
          }
        }
      }
      
      for (let i = 0; i < revolveSegments; i++) {
        for (let j = 0; j < profileSegments; j++) {
          const i0 = i * (profileSegments + 1) + j
          const i1 = i0 + 1
          const i2 = i0 + (profileSegments + 1)
          const i3 = i2 + 1
          
          indices.push(i0, i2, i1, i1, i2, i3)
        }
      }
      
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geo.setIndex(indices)
      
    } else if (entity.type === 'rectangle') {
      // Create revolved rectangle preview
      let cx = 0, cy = 0, hw = 15, hh = 10
      
      if (entity.data.start && entity.data.end) {
        const x1 = entity.data.start.x, y1 = entity.data.start.y
        const x2 = entity.data.end.x, y2 = entity.data.end.y
        const width = Math.abs(x2 - x1)
        const height = Math.abs(y2 - y1)
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        hw = width / 2
        hh = height / 2
      } else if (entity.data.corner1 && entity.data.corner2) {
        const c1 = entity.data.corner1, c2 = entity.data.corner2
        const width = Math.abs(c2.x - c1.x)
        const height = Math.abs(c2.y - c1.y)
        cx = (c1.x + c2.x) / 2
        cy = (c1.y + c2.y) / 2
        hw = width / 2
        hh = height / 2
      }
      
      const minRadius = Math.max(cx - hw, 5)
      const profilePoints: [number, number][] = [
        [minRadius, cy - hh],
        [minRadius + hw * 2, cy - hh],
        [minRadius + hw * 2, cy + hh],
        [minRadius, cy + hh]
      ]
      
      const revolveSegments = Math.max(8, Math.ceil(32 * Math.abs(endAngle - startAngle) / (2 * Math.PI)))
      
      const vertices: number[] = []
      const normals: number[] = []
      const indices: number[] = []
      
      for (let i = 0; i <= revolveSegments; i++) {
        const t = i / revolveSegments
        const theta = startAngle + t * (endAngle - startAngle)
        const cosTheta = Math.cos(theta)
        const sinTheta = Math.sin(theta)
        
        for (const [r, y] of profilePoints) {
          if (axisDir[1] === 1) {
            vertices.push(r * cosTheta, y, r * sinTheta)
          } else if (axisDir[0] === 1) {
            vertices.push(y, r * cosTheta, r * sinTheta)
          } else {
            vertices.push(r * cosTheta, r * sinTheta, y)
          }
          normals.push(cosTheta, 0, sinTheta)
        }
      }
      
      const numProfilePoints = profilePoints.length
      for (let i = 0; i < revolveSegments; i++) {
        for (let j = 0; j < numProfilePoints; j++) {
          const nextJ = (j + 1) % numProfilePoints
          const i0 = i * numProfilePoints + j
          const i1 = i * numProfilePoints + nextJ
          const i2 = (i + 1) * numProfilePoints + j
          const i3 = (i + 1) * numProfilePoints + nextJ
          
          indices.push(i0, i2, i1, i1, i2, i3)
        }
      }
      
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geo.setIndex(indices)
    }
    
    return geo
  }, [entity, startAngle, endAngle, axisId])
  
  if (!geometry || geometry.attributes.position?.count === 0) return null
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={getPreviewColor()}
        transparent
        opacity={0.6}
        metalness={0.2}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Sweep preview component - shows preview while dialog is open
function SweepPreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'sweep' || !dialogData) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const profileId = dialogData.profileId
  const pathId = dialogData.pathId
  if (!profileId || !pathId) return null
  
  const twistAngle = dialogData.twistAngle || 0
  const endScale = dialogData.endScale || 1.0
  const operation = dialogData.operation || 'new'
  
  // Get preview color based on operation
  const getPreviewColor = () => {
    switch (operation) {
      case 'add': return '#22c55e'
      case 'remove': return '#ef4444'
      case 'intersect': return '#a855f7'
      default: return '#22c55e' // Green for sweep
    }
  }
  
  // Find the profile and path entities
  let profileEntity: any = null
  let pathEntity: any = null
  
  activePartStudio.sketches.forEach((sketch) => {
    const foundProfile = sketch.entities.find(e => e.id === profileId)
    if (foundProfile) profileEntity = foundProfile
    
    // Handle chain paths
    if (pathId.endsWith('-chain')) {
      const foundPath = sketch.entities.find(e => e.type === 'line')
      if (foundPath) pathEntity = foundPath
    } else {
      const foundPath = sketch.entities.find(e => e.id === pathId)
      if (foundPath) pathEntity = foundPath
    }
  })
  
  if (!profileEntity || !pathEntity) return null
  
  // Create preview geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    
    // Get path points
    let pathPoints: [number, number, number][] = []
    const pathData = pathEntity.data
    const segments = 20
    
    if (pathEntity.type === 'line' && pathData.start && pathData.end) {
      const x1 = pathData.start.x, y1 = pathData.start.y, z1 = pathData.start.z || 0
      const x2 = pathData.end.x, y2 = pathData.end.y, z2 = pathData.end.z || 0
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        pathPoints.push([
          x1 + (x2 - x1) * t,
          y1 + (y2 - y1) * t,
          z1 + (z2 - z1) * t
        ])
      }
    } else if (pathEntity.type === 'arc' && pathData.center && pathData.radius) {
      const cx = pathData.center.x, cy = pathData.center.y, cz = pathData.center.z || 0
      const r = pathData.radius
      const startAngle = pathData.startAngle || 0
      const endAngle = pathData.endAngle || Math.PI
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const angle = startAngle + (endAngle - startAngle) * t
        pathPoints.push([
          cx + Math.cos(angle) * r,
          cy + Math.sin(angle) * r,
          cz
        ])
      }
    } else {
      // Default path
      pathPoints = Array.from({ length: segments + 1 }, (_, i) => {
        const t = i / segments
        return [0, 0, t * 50] as [number, number, number]
      })
    }
    
    // Get profile points
    let profilePoints: [number, number][] = []
    const profileData = profileEntity.data
    
    if (profileEntity.type === 'circle') {
      const r = profileData.radius || 10
      const numPoints = 16
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        profilePoints.push([Math.cos(angle) * r, Math.sin(angle) * r])
      }
    } else if (profileEntity.type === 'rectangle') {
      let hw = 10, hh = 10
      if (profileData.start && profileData.end) {
        hw = Math.abs(profileData.end.x - profileData.start.x) / 2
        hh = Math.abs(profileData.end.y - profileData.start.y) / 2
      } else if (profileData.corner1 && profileData.corner2) {
        hw = Math.abs(profileData.corner2.x - profileData.corner1.x) / 2
        hh = Math.abs(profileData.corner2.y - profileData.corner1.y) / 2
      }
      profilePoints = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]
    } else if (profileEntity.type === 'polygon') {
      const r = profileData.radius || 10
      const sides = profileData.sides || 6
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
        profilePoints.push([Math.cos(angle) * r, Math.sin(angle) * r])
      }
    }
    
    if (pathPoints.length < 2 || profilePoints.length < 3) return geo
    
    const numPathPoints = pathPoints.length
    const numProfilePoints = profilePoints.length
    const twistRadians = (twistAngle * Math.PI) / 180
    
    const vertices: number[] = []
    const normals: number[] = []
    const indices: number[] = []
    
    // Generate vertices
    for (let i = 0; i < numPathPoints; i++) {
      const t = i / (numPathPoints - 1)
      const pathPoint = pathPoints[i]
      
      // Calculate tangent
      let tangent: [number, number, number]
      if (i === 0) {
        tangent = [
          pathPoints[1][0] - pathPoints[0][0],
          pathPoints[1][1] - pathPoints[0][1],
          pathPoints[1][2] - pathPoints[0][2]
        ]
      } else if (i >= numPathPoints - 1) {
        tangent = [
          pathPoints[numPathPoints - 1][0] - pathPoints[numPathPoints - 2][0],
          pathPoints[numPathPoints - 1][1] - pathPoints[numPathPoints - 2][1],
          pathPoints[numPathPoints - 1][2] - pathPoints[numPathPoints - 2][2]
        ]
      } else {
        tangent = [
          pathPoints[i + 1][0] - pathPoints[i - 1][0],
          pathPoints[i + 1][1] - pathPoints[i - 1][1],
          pathPoints[i + 1][2] - pathPoints[i - 1][2]
        ]
      }
      
      const tlen = Math.sqrt(tangent[0] * tangent[0] + tangent[1] * tangent[1] + tangent[2] * tangent[2])
      if (tlen > 0.0001) {
        tangent = [tangent[0] / tlen, tangent[1] / tlen, tangent[2] / tlen]
      }
      
      // Calculate Frenet frame
      let ref: [number, number, number] = [0, 1, 0]
      if (Math.abs(tangent[1]) > 0.9) ref = [1, 0, 0]
      
      const nx = tangent[1] * ref[2] - tangent[2] * ref[1]
      const ny = tangent[2] * ref[0] - tangent[0] * ref[2]
      const nz = tangent[0] * ref[1] - tangent[1] * ref[0]
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz)
      
      const normal: [number, number, number] = nlen > 0.0001
        ? [nx / nlen, ny / nlen, nz / nlen]
        : [1, 0, 0]
      
      const binormal: [number, number, number] = [
        tangent[1] * normal[2] - tangent[2] * normal[1],
        tangent[2] * normal[0] - tangent[0] * normal[2],
        tangent[0] * normal[1] - tangent[1] * normal[0]
      ]
      
      // Apply twist
      const twist = twistRadians * t
      const cosTwist = Math.cos(twist)
      const sinTwist = Math.sin(twist)
      
      const rotatedNormal: [number, number, number] = [
        normal[0] * cosTwist + binormal[0] * sinTwist,
        normal[1] * cosTwist + binormal[1] * sinTwist,
        normal[2] * cosTwist + binormal[2] * sinTwist
      ]
      const rotatedBinormal: [number, number, number] = [
        -normal[0] * sinTwist + binormal[0] * cosTwist,
        -normal[1] * sinTwist + binormal[1] * cosTwist,
        -normal[2] * sinTwist + binormal[2] * cosTwist
      ]
      
      // Apply scale
      const scale = 1 + (endScale - 1) * t
      
      for (const [px, py] of profilePoints) {
        const scaledPx = px * scale
        const scaledPy = py * scale
        
        const x = pathPoint[0] + scaledPx * rotatedNormal[0] + scaledPy * rotatedBinormal[0]
        const y = pathPoint[1] + scaledPx * rotatedNormal[1] + scaledPy * rotatedBinormal[1]
        const z = pathPoint[2] + scaledPx * rotatedNormal[2] + scaledPy * rotatedBinormal[2]
        
        vertices.push(x, y, z)
        
        const vx = scaledPx * rotatedNormal[0] + scaledPy * rotatedBinormal[0]
        const vy = scaledPx * rotatedNormal[1] + scaledPy * rotatedBinormal[1]
        const vz = scaledPx * rotatedNormal[2] + scaledPy * rotatedBinormal[2]
        const vlen = Math.sqrt(vx * vx + vy * vy + vz * vz)
        
        if (vlen > 0.0001) {
          normals.push(vx / vlen, vy / vlen, vz / vlen)
        } else {
          normals.push(0, 0, 1)
        }
      }
    }
    
    // Generate indices
    for (let i = 0; i < numPathPoints - 1; i++) {
      for (let j = 0; j < numProfilePoints; j++) {
        const nextJ = (j + 1) % numProfilePoints
        
        const i0 = i * numProfilePoints + j
        const i1 = i * numProfilePoints + nextJ
        const i2 = (i + 1) * numProfilePoints + j
        const i3 = (i + 1) * numProfilePoints + nextJ
        
        indices.push(i0, i2, i1, i1, i2, i3)
      }
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setIndex(indices)
    
    return geo
  }, [profileEntity, pathEntity, twistAngle, endScale])
  
  if (!geometry || geometry.attributes.position?.count === 0) return null
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={getPreviewColor()}
        transparent
        opacity={0.6}
        metalness={0.2}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Loft preview component - shows preview while dialog is open
function LoftPreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'loft' || !dialogData) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const profileOrder = dialogData.profileOrder || []
  if (profileOrder.length < 2) return null
  
  const operation = dialogData.operation || 'new'
  const closedLoft = dialogData.closedLoft || false
  
  // Get preview color based on operation
  const getPreviewColor = () => {
    switch (operation) {
      case 'add': return '#22c55e'
      case 'remove': return '#ef4444'
      case 'intersect': return '#a855f7'
      default: return '#f59e0b' // Amber for loft
    }
  }
  
  // Gather profile entities
  const profileEntities: { entity: any, zOffset: number }[] = []
  
  for (let i = 0; i < profileOrder.length; i++) {
    const config = profileOrder[i]
    let foundEntity = null
    
    activePartStudio.sketches.forEach((sketch) => {
      const entity = sketch.entities.find(e => e.id === config.entityId)
      if (entity) foundEntity = entity
    })
    
    if (foundEntity) {
      profileEntities.push({ entity: foundEntity, zOffset: i * 30 })
    }
  }
  
  if (profileEntities.length < 2) return null
  
  // Create preview geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    
    // Get profile points for each entity
    const profiles: { points: [number, number, number][], center: [number, number, number] }[] = []
    
    for (const { entity, zOffset } of profileEntities) {
      const data = entity.data
      const points: [number, number, number][] = []
      let centerX = 0, centerY = 0
      
      if (entity.type === 'circle') {
        const cx = data.center?.x || 0
        const cy = data.center?.y || 0
        const r = data.radius || 10
        centerX = cx
        centerY = cy
        
        const segments = 24
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2
          points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, zOffset])
        }
      } else if (entity.type === 'rectangle') {
        let x1 = 0, y1 = 0, x2 = 20, y2 = 20
        if (data.start && data.end) {
          x1 = data.start.x; y1 = data.start.y
          x2 = data.end.x; y2 = data.end.y
        } else if (data.corner1 && data.corner2) {
          x1 = data.corner1.x; y1 = data.corner1.y
          x2 = data.corner2.x; y2 = data.corner2.y
        }
        centerX = (x1 + x2) / 2
        centerY = (y1 + y2) / 2
        
        const hw = Math.abs(x2 - x1) / 2
        const hh = Math.abs(y2 - y1) / 2
        const subdivs = 6
        
        for (let i = 0; i <= subdivs; i++) {
          points.push([centerX - hw + (2 * hw) * (i / subdivs), centerY - hh, zOffset])
        }
        for (let i = 1; i <= subdivs; i++) {
          points.push([centerX + hw, centerY - hh + (2 * hh) * (i / subdivs), zOffset])
        }
        for (let i = 1; i <= subdivs; i++) {
          points.push([centerX + hw - (2 * hw) * (i / subdivs), centerY + hh, zOffset])
        }
        for (let i = 1; i < subdivs; i++) {
          points.push([centerX - hw, centerY + hh - (2 * hh) * (i / subdivs), zOffset])
        }
      } else if (entity.type === 'polygon') {
        const cx = data.center?.x || 0
        const cy = data.center?.y || 0
        const r = data.radius || 10
        const sides = data.sides || 6
        centerX = cx
        centerY = cy
        
        const subdivs = Math.max(1, Math.floor(24 / sides))
        for (let i = 0; i < sides; i++) {
          const angle1 = (i / sides) * Math.PI * 2 - Math.PI / 2
          const angle2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 2
          
          for (let j = 0; j < subdivs; j++) {
            const t = j / subdivs
            points.push([
              cx + Math.cos(angle1) * r + (Math.cos(angle2) - Math.cos(angle1)) * r * t,
              cy + Math.sin(angle1) * r + (Math.sin(angle2) - Math.sin(angle1)) * r * t,
              zOffset
            ])
          }
        }
      }
      
      if (points.length > 0) {
        profiles.push({ points, center: [centerX, centerY, zOffset] })
      }
    }
    
    if (profiles.length < 2) return geo
    
    // Normalize and create mesh
    const targetPointCount = profiles[0].points.length
    const normalizedProfiles = profiles.map(profile => {
      if (profile.points.length === targetPointCount) return profile.points
      
      const resampled: [number, number, number][] = []
      for (let i = 0; i < targetPointCount; i++) {
        const srcIdx = (i / targetPointCount) * profile.points.length
        const idx0 = Math.floor(srcIdx) % profile.points.length
        const idx1 = (idx0 + 1) % profile.points.length
        const t = srcIdx - Math.floor(srcIdx)
        
        const p0 = profile.points[idx0]
        const p1 = profile.points[idx1]
        resampled.push([
          p0[0] + (p1[0] - p0[0]) * t,
          p0[1] + (p1[1] - p0[1]) * t,
          p0[2] + (p1[2] - p0[2]) * t
        ])
      }
      return resampled
    })
    
    // Generate intermediate sections
    const sectionsPerSegment = 8
    const allSections: [number, number, number][][] = []
    
    for (let i = 0; i < normalizedProfiles.length - 1; i++) {
      const profile1 = normalizedProfiles[i]
      const profile2 = normalizedProfiles[i + 1]
      
      for (let j = 0; j <= sectionsPerSegment; j++) {
        if (i > 0 && j === 0) continue
        const t = j / sectionsPerSegment
        
        const section: [number, number, number][] = []
        for (let k = 0; k < targetPointCount; k++) {
          const p1 = profile1[k % profile1.length]
          const p2 = profile2[k % profile2.length]
          section.push([
            p1[0] + (p2[0] - p1[0]) * t,
            p1[1] + (p2[1] - p1[1]) * t,
            p1[2] + (p2[2] - p1[2]) * t
          ])
        }
        allSections.push(section)
      }
    }
    
    if (closedLoft && normalizedProfiles.length >= 2) {
      const lastProfile = normalizedProfiles[normalizedProfiles.length - 1]
      const firstProfile = normalizedProfiles[0]
      
      for (let j = 1; j <= sectionsPerSegment; j++) {
        const t = j / sectionsPerSegment
        const section: [number, number, number][] = []
        for (let k = 0; k < targetPointCount; k++) {
          const p1 = lastProfile[k]
          const p2 = firstProfile[k]
          section.push([
            p1[0] + (p2[0] - p1[0]) * t,
            p1[1] + (p2[1] - p1[1]) * t,
            p1[2] + (p2[2] - p1[2]) * t
          ])
        }
        allSections.push(section)
      }
    }
    
    const vertices: number[] = []
    const normals: number[] = []
    const indices: number[] = []
    
    const numSections = allSections.length
    const numPointsPerSection = targetPointCount
    
    for (let i = 0; i < numSections; i++) {
      const section = allSections[i]
      for (let j = 0; j < numPointsPerSection; j++) {
        const p = section[j]
        vertices.push(p[0], p[1], p[2])
        
        const prevJ = (j - 1 + numPointsPerSection) % numPointsPerSection
        const nextJ = (j + 1) % numPointsPerSection
        const prevP = section[prevJ]
        const nextP = section[nextJ]
        
        const tx = nextP[0] - prevP[0]
        const ty = nextP[1] - prevP[1]
        const tz = nextP[2] - prevP[2]
        
        let dx = 0, dy = 0, dz = 1
        if (i < numSections - 1) {
          const np = allSections[i + 1][j]
          dx = np[0] - p[0]; dy = np[1] - p[1]; dz = np[2] - p[2]
        }
        
        const nx = ty * dz - tz * dy
        const ny = tz * dx - tx * dz
        const nz = tx * dy - ty * dx
        const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz)
        
        if (nlen > 0.0001) {
          normals.push(nx / nlen, ny / nlen, nz / nlen)
        } else {
          normals.push(0, 0, 1)
        }
      }
    }
    
    for (let i = 0; i < numSections - 1; i++) {
      for (let j = 0; j < numPointsPerSection; j++) {
        const nextJ = (j + 1) % numPointsPerSection
        const i0 = i * numPointsPerSection + j
        const i1 = i * numPointsPerSection + nextJ
        const i2 = (i + 1) * numPointsPerSection + j
        const i3 = (i + 1) * numPointsPerSection + nextJ
        indices.push(i0, i2, i1, i1, i2, i3)
      }
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geo.setIndex(indices)
    
    return geo
  }, [profileEntities, closedLoft])
  
  if (!geometry || geometry.attributes.position?.count === 0) return null
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={getPreviewColor()}
        transparent
        opacity={0.6}
        metalness={0.2}
        roughness={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Fillet preview component - shows edge highlighting and preview
function FilletPreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'fillet' || !dialogData) return null
  if (!dialogData.showPreview) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const radius = dialogData.radius || 2
  const selectedEdges = dialogData.selectedEdges || []
  const selectedFaces = dialogData.selectedFaces || []
  
  // If no selections, nothing to preview
  if (selectedEdges.length === 0 && selectedFaces.length === 0) return null
  
  // Create preview geometry - show edge indicators
  const previewElements: JSX.Element[] = []
  
  // For each selected edge, create a small torus-like indicator
  selectedEdges.forEach((edgeId, index) => {
    // Parse edge position from ID (simplified demo)
    const parts = edgeId.split('-edge-')
    if (parts.length < 2) return
    
    const edgeIndex = parseInt(parts[1]) || 0
    
    // Calculate approximate edge position based on index
    // This is a simplified visualization - real CAD would use actual geometry
    const edgePositions = [
      [0, 15, 15], [0, 15, -15], [-15, 15, 0], [15, 15, 0],  // Top edges
      [0, -15, 15], [0, -15, -15], [-15, -15, 0], [15, -15, 0],  // Bottom edges
      [-15, 0, 15], [15, 0, 15], [-15, 0, -15], [15, 0, -15]  // Vertical edges
    ]
    
    const pos = edgePositions[edgeIndex % edgePositions.length] || [0, 0, 0]
    
    // Determine edge orientation
    const isHorizontalX = edgeIndex < 4 || (edgeIndex >= 4 && edgeIndex < 8)
    const isVertical = edgeIndex >= 8
    
    previewElements.push(
      <group key={`edge-${edgeId}`} position={[pos[0], pos[1], pos[2]]}>
        {/* Edge highlight line */}
        <mesh rotation={isVertical ? [0, 0, 0] : isHorizontalX ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 30, 8]} />
          <meshStandardMaterial color="#22d3ee" transparent opacity={0.8} />
        </mesh>
        
        {/* Fillet radius indicator */}
        <mesh>
          <torusGeometry args={[radius, radius * 0.3, 8, 16]} />
          <meshStandardMaterial 
            color="#22d3ee" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  })
  
  // For face selections, highlight the face
  selectedFaces.forEach((faceId, index) => {
    const parts = faceId.split('-face-')
    if (parts.length < 2) return
    
    const faceIndex = parseInt(parts[1]) || 0
    
    // Face positions (center of each face of a cube)
    const facePositions = [
      { pos: [0, 15, 0], rot: [0, 0, 0] },      // Top
      { pos: [0, -15, 0], rot: [Math.PI, 0, 0] }, // Bottom
      { pos: [0, 0, 15], rot: [Math.PI / 2, 0, 0] },  // Front
      { pos: [0, 0, -15], rot: [-Math.PI / 2, 0, 0] }, // Back
      { pos: [-15, 0, 0], rot: [0, 0, Math.PI / 2] },  // Left
      { pos: [15, 0, 0], rot: [0, 0, -Math.PI / 2] }   // Right
    ]
    
    const faceData = facePositions[faceIndex % facePositions.length]
    
    previewElements.push(
      <mesh 
        key={`face-${faceId}`} 
        position={[faceData.pos[0], faceData.pos[1], faceData.pos[2]]}
        rotation={[faceData.rot[0], faceData.rot[1], faceData.rot[2]]}
      >
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial 
          color="#22d3ee" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    )
  })
  
  return <group>{previewElements}</group>
}

// Chamfer preview component - shows edge highlighting and bevel preview
function ChamferPreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'chamfer' || !dialogData) return null
  if (!dialogData.showPreview) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const distance1 = dialogData.distance1 || 2
  const distance2 = dialogData.distance2 || 2
  const selectedEdges = dialogData.selectedEdges || []
  const selectedFaces = dialogData.selectedFaces || []
  
  if (selectedEdges.length === 0 && selectedFaces.length === 0) return null
  
  const previewElements: JSX.Element[] = []
  
  // For each selected edge, create a beveled indicator
  selectedEdges.forEach((edgeId, index) => {
    const parts = edgeId.split('-edge-')
    if (parts.length < 2) return
    
    const edgeIndex = parseInt(parts[1]) || 0
    
    const edgePositions = [
      [0, 15, 15], [0, 15, -15], [-15, 15, 0], [15, 15, 0],
      [0, -15, 15], [0, -15, -15], [-15, -15, 0], [15, -15, 0],
      [-15, 0, 15], [15, 0, 15], [-15, 0, -15], [15, 0, -15]
    ]
    
    const pos = edgePositions[edgeIndex % edgePositions.length] || [0, 0, 0]
    const isVertical = edgeIndex >= 8
    
    previewElements.push(
      <group key={`chamfer-edge-${edgeId}`} position={[pos[0], pos[1], pos[2]]}>
        {/* Edge highlight line */}
        <mesh rotation={isVertical ? [0, 0, 0] : [0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.5, 30, 8]} />
          <meshStandardMaterial color="#f97316" transparent opacity={0.8} />
        </mesh>
        
        {/* Chamfer bevel indicator - triangular prism shape */}
        <mesh rotation={isVertical ? [0, Math.PI / 4, 0] : [Math.PI / 4, 0, 0]}>
          <boxGeometry args={[distance1, distance2, 30]} />
          <meshStandardMaterial 
            color="#f97316" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  })
  
  // For face selections, highlight the face
  selectedFaces.forEach((faceId) => {
    const parts = faceId.split('-face-')
    if (parts.length < 2) return
    
    const faceIndex = parseInt(parts[1]) || 0
    
    const facePositions = [
      { pos: [0, 15, 0], rot: [0, 0, 0] },
      { pos: [0, -15, 0], rot: [Math.PI, 0, 0] },
      { pos: [0, 0, 15], rot: [Math.PI / 2, 0, 0] },
      { pos: [0, 0, -15], rot: [-Math.PI / 2, 0, 0] },
      { pos: [-15, 0, 0], rot: [0, 0, Math.PI / 2] },
      { pos: [15, 0, 0], rot: [0, 0, -Math.PI / 2] }
    ]
    
    const faceData = facePositions[faceIndex % facePositions.length]
    
    previewElements.push(
      <mesh 
        key={`chamfer-face-${faceId}`} 
        position={[faceData.pos[0], faceData.pos[1], faceData.pos[2]]}
        rotation={[faceData.rot[0], faceData.rot[1], faceData.rot[2]]}
      >
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial 
          color="#f97316" 
          transparent 
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
    )
  })
  
  return <group>{previewElements}</group>
}

// Shell preview component - shows face highlighting and hollowing preview
function ShellPreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'shell' || !dialogData) return null
  if (!dialogData.showPreview) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const thickness = dialogData.thickness || 2
  const facesToRemove = dialogData.facesToRemove || []
  const direction = dialogData.direction || 'inward'
  
  if (facesToRemove.length === 0) return null
  
  const previewElements: JSX.Element[] = []
  
  // Face positions for a box-like shape (center of each face)
  const facePositions = [
    { pos: [0, 15, 0], rot: [0, 0, 0], normal: [0, 1, 0] },      // Top
    { pos: [0, -15, 0], rot: [Math.PI, 0, 0], normal: [0, -1, 0] }, // Bottom
    { pos: [0, 0, 15], rot: [Math.PI / 2, 0, 0], normal: [0, 0, 1] },  // Front
    { pos: [0, 0, -15], rot: [-Math.PI / 2, 0, 0], normal: [0, 0, -1] }, // Back
    { pos: [-15, 0, 0], rot: [0, 0, Math.PI / 2], normal: [-1, 0, 0] },  // Left
    { pos: [15, 0, 0], rot: [0, 0, -Math.PI / 2], normal: [1, 0, 0] }   // Right
  ]
  
  // Show faces to be removed with X pattern
  facesToRemove.forEach((faceId) => {
    const parts = faceId.split('-face-')
    if (parts.length < 2) return
    
    const faceIndex = parseInt(parts[1]) || 0
    const faceData = facePositions[faceIndex % facePositions.length]
    
    previewElements.push(
      <group key={`shell-remove-${faceId}`}>
        {/* Face highlight */}
        <mesh 
          position={[faceData.pos[0], faceData.pos[1], faceData.pos[2]]}
          rotation={[faceData.rot[0], faceData.rot[1], faceData.rot[2]]}
        >
          <planeGeometry args={[28, 28]} />
          <meshStandardMaterial 
            color="#ec4899" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* X pattern to indicate removal */}
        <group position={[faceData.pos[0], faceData.pos[1], faceData.pos[2]]}>
          <mesh rotation={[faceData.rot[0], faceData.rot[1], faceData.rot[2] + Math.PI / 4]}>
            <boxGeometry args={[2, 35, 0.5]} />
            <meshStandardMaterial color="#ec4899" transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[faceData.rot[0], faceData.rot[1], faceData.rot[2] - Math.PI / 4]}>
            <boxGeometry args={[2, 35, 0.5]} />
            <meshStandardMaterial color="#ec4899" transparent opacity={0.8} />
          </mesh>
        </group>
      </group>
    )
  })
  
  // Show inner shell wall indicator
  const offset = direction === 'inward' ? thickness : -thickness
  
  previewElements.push(
    <mesh key="shell-inner" position={[0, 0, 0]}>
      <boxGeometry args={[30 - offset * 2, 30 - offset * 2, 30 - offset * 2]} />
      <meshStandardMaterial 
        color="#ec4899" 
        transparent 
        opacity={0.15}
        side={THREE.BackSide}
        wireframe
      />
    </mesh>
  )
  
  return <group>{previewElements}</group>
}

// Mirror feature preview component - shows mirror plane and mirrored geometry
function MirrorFeaturePreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  if (activeDialog !== 'mirror-feature' || !dialogData) return null
  if (!dialogData.showPreview) return null
  
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  const planeId = dialogData.planeId
  const mirrorType = dialogData.mirrorType || 'part'
  const selectedEntities = dialogData.entities || []
  const operation = dialogData.operation || 'add'
  
  if (!planeId || selectedEntities.length === 0) return null
  
  const previewElements: JSX.Element[] = []
  
  // Determine mirror plane position and normal
  let planePosition: [number, number, number] = [0, 0, 0]
  let planeRotation: [number, number, number] = [0, 0, 0]
  let planeNormal: [number, number, number] = [1, 0, 0]
  
  if (planeId === 'front-plane') {
    planeNormal = [0, 0, 1]
    planeRotation = [0, 0, 0]
  } else if (planeId === 'top-plane') {
    planeNormal = [0, 1, 0]
    planeRotation = [Math.PI / 2, 0, 0]
  } else if (planeId === 'right-plane') {
    planeNormal = [1, 0, 0]
    planeRotation = [0, Math.PI / 2, 0]
  }
  
  // Draw mirror plane
  previewElements.push(
    <mesh 
      key="mirror-plane" 
      position={planePosition}
      rotation={planeRotation}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#6366f1" 
        transparent 
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
  
  // Draw plane outline
  previewElements.push(
    <lineSegments key="mirror-plane-outline" position={planePosition} rotation={planeRotation}>
      <edgesGeometry args={[new THREE.PlaneGeometry(100, 100)]} />
      <lineBasicMaterial color="#6366f1" linewidth={2} />
    </lineSegments>
  )
  
  // Draw mirror axis indicator
  previewElements.push(
    <group key="mirror-axis" position={planePosition}>
      <mesh rotation={planeRotation}>
        <ringGeometry args={[8, 10, 32]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
  
  // Show mirrored geometry preview for each selected entity
  const mirrorColor = operation === 'add' ? '#22c55e' : 
                      operation === 'remove' ? '#ef4444' : 
                      operation === 'intersect' ? '#f59e0b' : '#6366f1'
  
  selectedEntities.forEach((entityId: string, index: number) => {
    // For parts, show a mirrored box as placeholder
    if (mirrorType === 'part') {
      const part = activePartStudio.parts?.find(p => p.id === entityId)
      if (part) {
        // Original position (placeholder)
        const originalPos: [number, number, number] = [-20, 0, 0]
        // Mirrored position
        const mirroredPos: [number, number, number] = [
          planeNormal[0] === 1 ? -originalPos[0] : originalPos[0],
          planeNormal[1] === 1 ? -originalPos[1] : originalPos[1],
          planeNormal[2] === 1 ? -originalPos[2] : originalPos[2]
        ]
        
        previewElements.push(
          <mesh key={`mirror-preview-${entityId}`} position={mirroredPos}>
            <boxGeometry args={[20, 20, 20]} />
            <meshStandardMaterial 
              color={mirrorColor} 
              transparent 
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
        
        // Mirrored outline
        previewElements.push(
          <lineSegments key={`mirror-outline-${entityId}`} position={mirroredPos}>
            <edgesGeometry args={[new THREE.BoxGeometry(20, 20, 20)]} />
            <lineBasicMaterial color={mirrorColor} />
          </lineSegments>
        )
      }
    }
    
    // For features, show indicator at mirrored position
    if (mirrorType === 'feature') {
      const mirroredPos: [number, number, number] = [
        planeNormal[0] === 1 ? 20 : 0,
        planeNormal[1] === 1 ? 20 : 0,
        planeNormal[2] === 1 ? 20 : 0
      ]
      
      previewElements.push(
        <mesh key={`mirror-feature-${entityId}`} position={mirroredPos}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshStandardMaterial 
            color={mirrorColor} 
            transparent 
            opacity={0.5}
          />
        </mesh>
      )
    }
    
    // For faces, show face indicator
    if (mirrorType === 'face') {
      previewElements.push(
        <mesh key={`mirror-face-${entityId}`} position={[20, 0, 0]}>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial 
            color={mirrorColor} 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )
    }
  })
  
  // Draw arrows indicating mirror direction
  const arrowLength = 15
  previewElements.push(
    <group key="mirror-arrows">
      {/* Arrow pointing to original */}
      <mesh position={[-30, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[3, 6, 8]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      {/* Arrow pointing to mirror */}
      <mesh position={[30, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[3, 6, 8]} />
        <meshStandardMaterial color={mirrorColor} />
      </mesh>
    </group>
  )
  
  return <group>{previewElements}</group>
}

// Linear pattern preview component - shows pattern instances in a row/grid
function LinearPatternPreview() {
  const { activeDialog, dialogData } = useUIStore()
  
  if (activeDialog !== 'linear-pattern' || !dialogData) return null
  if (!dialogData.showPreview) return null
  
  const { direction1, spacing1, count1, flip1, useDirection2, direction2, spacing2, count2, flip2, centered, skippedInstances = [] } = dialogData
  
  if (!direction1 || count1 < 2) return null
  
  const previewElements: JSX.Element[] = []
  
  // Get direction vectors
  const getDirectionVector = (dirId: string, flip: boolean): [number, number, number] => {
    let vec: [number, number, number] = [1, 0, 0]
    if (dirId === 'x-axis' || dirId?.includes('edge-x')) vec = [1, 0, 0]
    else if (dirId === 'y-axis' || dirId?.includes('edge-y')) vec = [0, 1, 0]
    else if (dirId === 'z-axis' || dirId?.includes('edge-z')) vec = [0, 0, 1]
    
    if (flip) vec = [-vec[0], -vec[1], -vec[2]]
    return vec
  }
  
  const dir1Vec = getDirectionVector(direction1, flip1)
  const dir2Vec = useDirection2 && direction2 ? getDirectionVector(direction2, flip2) : [0, 0, 0]
  
  const rows = useDirection2 ? count2 : 1
  
  // Draw instances
  for (let i = 0; i < count1; i++) {
    for (let j = 0; j < rows; j++) {
      const instanceIndex = i + j * count1
      const isSkipped = skippedInstances.includes(instanceIndex)
      const isSeed = i === 0 && j === 0
      
      // Calculate position
      let offsetI = centered ? (i - (count1 - 1) / 2) : i
      let offsetJ = centered && useDirection2 ? (j - (rows - 1) / 2) : j
      
      const x = offsetI * spacing1 * dir1Vec[0] + offsetJ * spacing2 * dir2Vec[0]
      const y = offsetI * spacing1 * dir1Vec[1] + offsetJ * spacing2 * dir2Vec[1]
      const z = offsetI * spacing1 * dir1Vec[2] + offsetJ * spacing2 * dir2Vec[2]
      
      if (!isSkipped) {
        previewElements.push(
          <mesh key={`linear-instance-${i}-${j}`} position={[x, y, z]}>
            <boxGeometry args={[10, 10, 10]} />
            <meshStandardMaterial 
              color={isSeed ? '#22d3ee' : '#22d3ee'}
              transparent
              opacity={isSeed ? 0.6 : 0.3}
            />
          </mesh>
        )
        
        // Outline
        previewElements.push(
          <lineSegments key={`linear-outline-${i}-${j}`} position={[x, y, z]}>
            <edgesGeometry args={[new THREE.BoxGeometry(10, 10, 10)]} />
            <lineBasicMaterial color={isSeed ? '#22d3ee' : '#67e8f9'} />
          </lineSegments>
        )
      }
    }
  }
  
  // Draw direction arrows
  const arrowLength = spacing1 * 0.8
  previewElements.push(
    <group key="linear-dir1-arrow">
      <mesh position={[arrowLength * dir1Vec[0], arrowLength * dir1Vec[1], arrowLength * dir1Vec[2]]}>
        <coneGeometry args={[2, 5, 8]} />
        <meshStandardMaterial color="#22d3ee" />
      </mesh>
    </group>
  )
  
  return <group>{previewElements}</group>
}

// Circular pattern preview component - shows pattern instances around an axis
function CircularPatternPreview() {
  const { activeDialog, dialogData } = useUIStore()
  
  if (activeDialog !== 'circular-pattern' || !dialogData) return null
  if (!dialogData.showPreview) return null
  
  const { axis, totalAngle, instanceCount, startAngle, skippedInstances = [] } = dialogData
  
  if (!axis || instanceCount < 2) return null
  
  const previewElements: JSX.Element[] = []
  
  // Get axis rotation
  let axisRotation: [number, number, number] = [0, 0, 0]
  if (axis === 'x-axis') axisRotation = [0, 0, Math.PI / 2]
  else if (axis === 'y-axis') axisRotation = [0, 0, 0]
  else if (axis === 'z-axis') axisRotation = [Math.PI / 2, 0, 0]
  
  const radius = 40
  const angularSpacing = totalAngle / instanceCount
  
  // Draw axis indicator
  previewElements.push(
    <mesh key="circular-axis" rotation={axisRotation}>
      <cylinderGeometry args={[1, 1, 100, 16]} />
      <meshStandardMaterial color="#8b5cf6" transparent opacity={0.5} />
    </mesh>
  )
  
  // Draw instances
  for (let i = 0; i < instanceCount; i++) {
    const isSkipped = skippedInstances.includes(i)
    const isSeed = i === 0
    
    if (!isSkipped) {
      const angle = ((startAngle + angularSpacing * i) * Math.PI) / 180
      
      let x = 0, y = 0, z = 0
      
      // Position based on axis
      if (axis === 'z-axis') {
        x = Math.cos(angle) * radius
        y = Math.sin(angle) * radius
        z = 0
      } else if (axis === 'y-axis') {
        x = Math.cos(angle) * radius
        y = 0
        z = Math.sin(angle) * radius
      } else if (axis === 'x-axis') {
        x = 0
        y = Math.cos(angle) * radius
        z = Math.sin(angle) * radius
      }
      
      previewElements.push(
        <mesh key={`circular-instance-${i}`} position={[x, y, z]}>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial 
            color={isSeed ? '#8b5cf6' : '#8b5cf6'}
            transparent
            opacity={isSeed ? 0.6 : 0.3}
          />
        </mesh>
      )
      
      // Outline
      previewElements.push(
        <lineSegments key={`circular-outline-${i}`} position={[x, y, z]}>
          <edgesGeometry args={[new THREE.BoxGeometry(10, 10, 10)]} />
          <lineBasicMaterial color={isSeed ? '#8b5cf6' : '#a78bfa'} />
        </lineSegments>
      )
    }
  }
  
  // Draw circular guide
  const circlePoints: THREE.Vector3[] = []
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2
    if (axis === 'z-axis') {
      circlePoints.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
    } else if (axis === 'y-axis') {
      circlePoints.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    } else if (axis === 'x-axis') {
      circlePoints.push(new THREE.Vector3(0, Math.cos(angle) * radius, Math.sin(angle) * radius))
    }
  }
  
  const circleGeometry = new THREE.BufferGeometry().setFromPoints(circlePoints)
  previewElements.push(
    <line key="circular-guide">
      <bufferGeometry attach="geometry" {...circleGeometry} />
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
    </line>
  )
  
  return <group>{previewElements}</group>
}

// Completed sketches visualization - shows all sketches in 3D view when not in sketch mode
function CompletedSketchesVisualization() {
  const { sketchMode, viewSettings } = useUIStore()
  const { document } = useDocumentStore()
  
  // Don't show if we're actively editing a sketch (SketchVisualization handles that)
  // But DO show completed sketches
  const activePartStudio = document?.partStudios.find(ps => ps.id === document?.activeElementId)
  if (!activePartStudio) return null
  
  // Get all sketches
  const sketches = Array.from(activePartStudio.sketches.entries())
  if (sketches.length === 0) return null
  
  return (
    <group>
      {sketches.map(([sketchId, sketch]) => {
        // Skip the sketch being edited
        if (sketchMode?.sketchId === sketchId) return null
        
        // Determine sketch plane transform
        const planeNormal = sketch.plane?.normal || [0, 0, 1]
        const planeOrigin = sketch.plane?.origin || [0, 0, 0]
        
        // Create rotation based on plane normal
        let rotation: [number, number, number] = [0, 0, 0]
        if (planeNormal[1] === 1 || planeNormal[1] === -1) {
          // XZ plane (front)
          rotation = [-Math.PI / 2, 0, 0]
        } else if (planeNormal[0] === 1 || planeNormal[0] === -1) {
          // YZ plane (right)
          rotation = [0, Math.PI / 2, 0]
        }
        // XY plane (top) - default, no rotation needed
        
        return (
          <group 
            key={sketchId}
            position={[planeOrigin[0], planeOrigin[1], planeOrigin[2]]}
            rotation={rotation}
          >
            {sketch.entities.map((entity) => {
              const color = entity.construction ? '#f59e0b' : '#22c55e'
              const opacity = 0.7
              
              switch (entity.type) {
                case 'line':
                  if (entity.data.start && entity.data.end) {
                    return (
                      <Line
                        key={entity.id}
                        points={[
                          [entity.data.start.x, entity.data.start.y, 0],
                          [entity.data.end.x, entity.data.end.y, 0]
                        ]}
                        color={color}
                        lineWidth={1.5}
                        transparent
                        opacity={opacity}
                      />
                    )
                  }
                  return null
                  
                case 'circle':
                  if (entity.data.center && entity.data.radius) {
                    const points: [number, number, number][] = []
                    const segments = 64
                    for (let i = 0; i <= segments; i++) {
                      const angle = (i / segments) * Math.PI * 2
                      points.push([
                        entity.data.center.x + Math.cos(angle) * entity.data.radius,
                        entity.data.center.y + Math.sin(angle) * entity.data.radius,
                        0
                      ])
                    }
                    return (
                      <Line
                        key={entity.id}
                        points={points}
                        color={color}
                        lineWidth={1.5}
                        transparent
                        opacity={opacity}
                      />
                    )
                  }
                  return null
                  
                case 'rectangle':
                  if (entity.data.corner1 && entity.data.corner2) {
                    const c1 = entity.data.corner1
                    const c2 = entity.data.corner2
                    return (
                      <Line
                        key={entity.id}
                        points={[
                          [c1.x, c1.y, 0],
                          [c2.x, c1.y, 0],
                          [c2.x, c2.y, 0],
                          [c1.x, c2.y, 0],
                          [c1.x, c1.y, 0]
                        ]}
                        color={color}
                        lineWidth={1.5}
                        transparent
                        opacity={opacity}
                      />
                    )
                  }
                  return null
                  
                case 'polygon':
                  if (entity.data.center && entity.data.radius && entity.data.sides) {
                    const points: [number, number, number][] = []
                    const sides = entity.data.sides
                    for (let i = 0; i <= sides; i++) {
                      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
                      points.push([
                        entity.data.center.x + Math.cos(angle) * entity.data.radius,
                        entity.data.center.y + Math.sin(angle) * entity.data.radius,
                        0
                      ])
                    }
                    return (
                      <Line
                        key={entity.id}
                        points={points}
                        color={color}
                        lineWidth={1.5}
                        transparent
                        opacity={opacity}
                      />
                    )
                  }
                  return null
                  
                case 'arc':
                  if (entity.data.center && entity.data.radius) {
                    const points: [number, number, number][] = []
                    const startAngle = entity.data.startAngle || 0
                    const endAngle = entity.data.endAngle || Math.PI
                    const segments = 32
                    for (let i = 0; i <= segments; i++) {
                      const angle = startAngle + (i / segments) * (endAngle - startAngle)
                      points.push([
                        entity.data.center.x + Math.cos(angle) * entity.data.radius,
                        entity.data.center.y + Math.sin(angle) * entity.data.radius,
                        0
                      ])
                    }
                    return (
                      <Line
                        key={entity.id}
                        points={points}
                        color={color}
                        lineWidth={1.5}
                        transparent
                        opacity={opacity}
                      />
                    )
                  }
                  return null
                  
                default:
                  return null
              }
            })}
          </group>
        )
      })}
    </group>
  )
}

// Scene content
function Scene() {
  const { viewSettings, selection, sketchMode } = useUIStore()
  const { document } = useDocumentStore()
  const { isSimulationMode, results } = useFEAStore()
  
  // Get parts from active part studio
  const activePartStudio = document?.partStudios.find(ps => ps.id === document.activeElementId)
  const parts = activePartStudio?.parts || []
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-50, 50, -50]} intensity={0.3} />
      <directionalLight position={[0, -50, 0]} intensity={0.2} />

      {/* Reference geometry */}
      <CADGrid />
      <OriginAxes />
      <ReferencePlanes />

      {/* Part geometry */}
      {parts.map(part => (
        <PartMesh 
          key={part.id} 
          part={part} 
          isSelected={selection.ids.includes(part.id)}
        />
      ))}
      
      {/* Completed sketches visualization - always visible */}
      <CompletedSketchesVisualization />
      
      {/* Active sketch visualization - only when editing */}
      <SketchVisualization />
      
      {/* Extrude preview */}
      <ExtrudePreview />
      
      {/* Revolve preview */}
      <RevolvePreview />
      
      {/* Sweep preview */}
      <SweepPreview />
      
      {/* Loft preview */}
      <LoftPreview />
      
      {/* Fillet preview */}
      <FilletPreview />
      
      {/* Chamfer preview */}
      <ChamferPreview />
      
      {/* Shell preview */}
      <ShellPreview />
      
      {/* Mirror preview */}
      <MirrorFeaturePreview />
      
      {/* Linear pattern preview */}
      <LinearPatternPreview />
      
      {/* Circular pattern preview */}
      <CircularPatternPreview />

      {/* FEA Visualizations */}
      {isSimulationMode && !results && <FEAMeshPreview />}
      {isSimulationMode && results && <FEAResultsViewer />}
      {isSimulationMode && <FEABCIcons />}

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.5}
        panSpeed={0.8}
        zoomSpeed={0.8}
        minDistance={10}
        maxDistance={2000}
        makeDefault
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.DOLLY
        }}
      />

      {/* View cube with XYZ labels */}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewport 
          axisColors={['#ef4444', '#22c55e', '#3b82f6']} 
          labelColor="black"
          labels={['X', 'Y', 'Z']}
        />
      </GizmoHelper>
    </>
  )
}

// Sketch mode interaction handler
function SketchInteraction() {
  const { 
    sketchMode, 
    activeTool, 
    isDrawing, 
    startDrawing, 
    addDrawingPoint, 
    finishDrawing,
    addNotification
  } = useUIStore()
  const { addSketchEntity } = useDocumentStore()
  const { camera, raycaster, pointer } = useThree()
  
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const intersectionPoint = useRef(new THREE.Vector3())
  
  useEffect(() => {
    if (sketchMode) {
      // Set sketch plane
      const normal = new THREE.Vector3(...sketchMode.planeNormal)
      const origin = new THREE.Vector3(...sketchMode.planeOrigin)
      planeRef.current.setFromNormalAndCoplanarPoint(normal, origin)
    }
  }, [sketchMode])
  
  const getPlaneIntersection = useCallback(() => {
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(planeRef.current, intersectionPoint.current)
    return intersectionPoint.current.clone()
  }, [camera, raycaster, pointer])
  
  // Handle canvas click for sketch drawing
  useFrame(() => {
    // This is where real-time preview would update
  })
  
  if (!sketchMode) return null
  
  return null
}

// Canvas click handler for sketch mode
function CanvasEventHandler() {
  const { 
    sketchMode, 
    activeTool, 
    isDrawing, 
    drawingPoints,
    startDrawing, 
    addDrawingPoint, 
    finishDrawing,
    cancelDrawing,
    addNotification
  } = useUIStore()
  const { addSketchEntity } = useDocumentStore()
  const { camera, raycaster, pointer, gl } = useThree()
  
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const intersectionPoint = useRef(new THREE.Vector3())
  
  useEffect(() => {
    if (sketchMode) {
      const normal = new THREE.Vector3(...sketchMode.planeNormal)
      const origin = new THREE.Vector3(...sketchMode.planeOrigin)
      planeRef.current.setFromNormalAndCoplanarPoint(normal, origin)
    }
  }, [sketchMode])
  
  const getPlaneIntersection = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    raycaster.ray.intersectPlane(planeRef.current, intersectionPoint.current)
    
    return {
      x: Math.round(intersectionPoint.current.x * 10) / 10,
      y: Math.round(intersectionPoint.current.y * 10) / 10,
      z: Math.round(intersectionPoint.current.z * 10) / 10
    }
  }, [camera, raycaster, gl])
  
  useEffect(() => {
    if (!sketchMode || !activeTool) return
    
    const canvas = gl.domElement
    
    const handleClick = (e: MouseEvent) => {
      if (!sketchMode || !activeTool || activeTool === 'select') return
      
      const point = getPlaneIntersection(e.clientX, e.clientY)
      
      if (activeTool === 'line') {
        if (!isDrawing) {
          startDrawing()
          addDrawingPoint(point)
        } else {
          addDrawingPoint(point)
          
          // Create line entity
          if (drawingPoints.length >= 1) {
            const start = drawingPoints[drawingPoints.length - 1]
            addSketchEntity(sketchMode.sketchId!, {
              type: 'line',
              construction: false,
              data: { start, end: point }
            })
          }
        }
      } else if (activeTool === 'circle') {
        if (!isDrawing) {
          startDrawing()
          addDrawingPoint(point)
          addNotification('info', 'Click to set radius')
        } else {
          const center = drawingPoints[0]
          const radius = Math.sqrt(
            Math.pow(point.x - center.x, 2) + 
            Math.pow(point.y - center.y, 2)
          )
          
          addSketchEntity(sketchMode.sketchId!, {
            type: 'circle',
            construction: false,
            data: { center, radius }
          })
          
          finishDrawing()
        }
      } else if (activeTool === 'rectangle') {
        if (!isDrawing) {
          startDrawing()
          addDrawingPoint(point)
          addNotification('info', 'Click opposite corner')
        } else {
          const corner1 = drawingPoints[0]
          
          addSketchEntity(sketchMode.sketchId!, {
            type: 'rectangle',
            construction: false,
            data: { corner1, corner2: point }
          })
          
          finishDrawing()
        }
      }
    }
    
    const handleDoubleClick = () => {
      if (isDrawing && activeTool === 'line') {
        finishDrawing()
      }
    }
    
    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault()
      if (isDrawing) {
        cancelDrawing()
      }
    }
    
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('contextmenu', handleRightClick)
    
    return () => {
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('dblclick', handleDoubleClick)
      canvas.removeEventListener('contextmenu', handleRightClick)
    }
  }, [sketchMode, activeTool, isDrawing, drawingPoints, getPlaneIntersection, startDrawing, addDrawingPoint, finishDrawing, cancelDrawing, addSketchEntity, addNotification])
  
  return null
}

export function Viewport3D() {
  const { clearSelection } = useUIStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  
  // Handle resize using ResizeObserver for responsive canvas
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const updateSize = () => {
      setSize({
        width: container.clientWidth,
        height: container.clientHeight
      })
    }
    
    // Initial size
    updateSize()
    
    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)
    
    // Also listen for window resize as fallback
    window.addEventListener('resize', updateSize)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full absolute inset-0"
      style={{ minHeight: '100%', minWidth: '100%' }}
    >
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        camera={{ position: [100, 80, 100], fov: 45, near: 0.1, far: 5000 }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#ffffff')
        }}
        onPointerMissed={() => clearSelection()}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      >
        <Scene />
        <CanvasEventHandler />
      </Canvas>
    </div>
  )
}
