/**
 * 3D Viewport - Interactive Three.js scene for CAD visualization
 */

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { 
  OrbitControls, 
  Grid, 
  GizmoHelper, 
  GizmoViewport,
  Line
} from '@react-three/drei'
import * as THREE from 'three'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'

// Grid component
function CADGrid() {
  const { viewSettings } = useUIStore()
  
  if (!viewSettings.showGrid) return null

  return (
    <Grid
      args={[200, 200]}
      cellSize={10}
      cellThickness={0.5}
      cellColor="#3a3f4b"
      sectionSize={50}
      sectionThickness={1}
      sectionColor="#4a5568"
      fadeDistance={500}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  )
}

// Origin axes
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

// Reference planes
function ReferencePlanes() {
  const { viewSettings, sketchMode } = useUIStore()
  
  if (!viewSettings.showPlanes) return null

  const planeSize = 80
  const opacity = sketchMode ? 0.05 : 0.1

  return (
    <group>
      {/* XY Plane (Top) - Blue */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      
      {/* XZ Plane (Front) - Green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      
      {/* YZ Plane (Right) - Red */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={opacity} side={THREE.DoubleSide} />
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
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(part.mesh.vertices, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(part.mesh.normals, 3))
    geo.setIndex(part.mesh.indices)
    geo.computeBoundingBox()
    
    return geo
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

// Scene content
function Scene() {
  const { viewSettings, selection, sketchMode } = useUIStore()
  const { document } = useDocumentStore()
  
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
      
      {/* Sketch visualization */}
      <SketchVisualization />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        rotateSpeed={0.5}
        panSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={10}
        maxDistance={1000}
        makeDefault
      />

      {/* View cube */}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewport 
          axisColors={['#ef4444', '#22c55e', '#3b82f6']} 
          labelColor="white"
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
          gl.setClearColor('#1a1d21')
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
