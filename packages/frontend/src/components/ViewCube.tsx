/**
 * ViewCube - Interactive 3D orientation widget for camera control
 * 
 * Features:
 * - Click faces to snap to standard views (Front, Back, Top, Bottom, Left, Right)
 * - Click corners for isometric views
 * - Drag to orbit view
 * - Shows current orientation
 * - Home button to reset view
 */

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { Home, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface ViewCubeProps {
  size?: number
  position?: [number, number, number]
  onViewChange?: (view: string) => void
}

// Standard view orientations
const VIEWS = {
  front: { position: [0, 0, 100], target: [0, 0, 0], up: [0, 1, 0] },
  back: { position: [0, 0, -100], target: [0, 0, 0], up: [0, 1, 0] },
  top: { position: [0, 100, 0], target: [0, 0, 0], up: [0, 0, -1] },
  bottom: { position: [0, -100, 0], target: [0, 0, 0], up: [0, 0, 1] },
  left: { position: [-100, 0, 0], target: [0, 0, 0], up: [0, 1, 0] },
  right: { position: [100, 0, 0], target: [0, 0, 0], up: [0, 1, 0] },
  iso: { position: [70, 70, 70], target: [0, 0, 0], up: [0, 1, 0] },
  isoFrontRight: { position: [70, 50, 70], target: [0, 0, 0], up: [0, 1, 0] },
  isoFrontLeft: { position: [-70, 50, 70], target: [0, 0, 0], up: [0, 1, 0] },
  isoBackRight: { position: [70, 50, -70], target: [0, 0, 0], up: [0, 1, 0] },
  isoBackLeft: { position: [-70, 50, -70], target: [0, 0, 0], up: [0, 1, 0] },
}

// View cube face component
function CubeFace({ 
  position, 
  rotation, 
  label, 
  view,
  onClick,
  isHovered,
  onHover
}: { 
  position: [number, number, number]
  rotation: [number, number, number]
  label: string
  view: string
  onClick: (view: string) => void
  isHovered: boolean
  onHover: (view: string | null) => void
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation()
        onClick(view)
      }}
      onPointerEnter={() => onHover(view)}
      onPointerLeave={() => onHover(null)}
    >
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial 
        color={isHovered ? '#3b82f6' : '#374151'} 
        transparent 
        opacity={0.9}
        side={THREE.DoubleSide}
      />
      <Html
        center
        style={{
          fontSize: '8px',
          fontWeight: 'bold',
          color: isHovered ? '#ffffff' : '#9ca3af',
          userSelect: 'none',
          pointerEvents: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {label}
      </Html>
    </mesh>
  )
}

// Main ViewCube 3D component (renders in its own scene)
export function ViewCube3D({ onViewChange }: { onViewChange?: (view: string) => void }) {
  const { camera } = useThree()
  const [hoveredFace, setHoveredFace] = useState<string | null>(null)
  const cubeRef = useRef<THREE.Group>(null)
  
  // Sync cube rotation with main camera
  useFrame(() => {
    if (cubeRef.current && camera) {
      // Get camera's rotation and apply inverse to cube
      const quaternion = camera.quaternion.clone().invert()
      cubeRef.current.setRotationFromQuaternion(quaternion)
    }
  })
  
  const handleClick = useCallback((view: string) => {
    if (onViewChange) {
      onViewChange(view)
    }
  }, [onViewChange])
  
  return (
    <group ref={cubeRef}>
      {/* Cube frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial color="#6b7280" />
      </lineSegments>
      
      {/* Faces */}
      <CubeFace 
        position={[0, 0, 0.51]} 
        rotation={[0, 0, 0]} 
        label="Front" 
        view="front"
        onClick={handleClick}
        isHovered={hoveredFace === 'front'}
        onHover={setHoveredFace}
      />
      <CubeFace 
        position={[0, 0, -0.51]} 
        rotation={[0, Math.PI, 0]} 
        label="Back" 
        view="back"
        onClick={handleClick}
        isHovered={hoveredFace === 'back'}
        onHover={setHoveredFace}
      />
      <CubeFace 
        position={[0, 0.51, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        label="Top" 
        view="top"
        onClick={handleClick}
        isHovered={hoveredFace === 'top'}
        onHover={setHoveredFace}
      />
      <CubeFace 
        position={[0, -0.51, 0]} 
        rotation={[Math.PI / 2, 0, 0]} 
        label="Bottom" 
        view="bottom"
        onClick={handleClick}
        isHovered={hoveredFace === 'bottom'}
        onHover={setHoveredFace}
      />
      <CubeFace 
        position={[0.51, 0, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        label="Right" 
        view="right"
        onClick={handleClick}
        isHovered={hoveredFace === 'right'}
        onHover={setHoveredFace}
      />
      <CubeFace 
        position={[-0.51, 0, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        label="Left" 
        view="left"
        onClick={handleClick}
        isHovered={hoveredFace === 'left'}
        onHover={setHoveredFace}
      />
      
      {/* Corner indicators */}
      <mesh position={[0.5, 0.5, 0.5]} onClick={() => handleClick('isoFrontRight')}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={hoveredFace === 'isoFrontRight' ? '#3b82f6' : '#6b7280'} />
      </mesh>
      <mesh position={[-0.5, 0.5, 0.5]} onClick={() => handleClick('isoFrontLeft')}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={hoveredFace === 'isoFrontLeft' ? '#3b82f6' : '#6b7280'} />
      </mesh>
      
      {/* Axis indicators */}
      <mesh position={[0.7, 0, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0, 0.7]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </group>
  )
}

// View control buttons component (HTML overlay)
interface ViewControlsProps {
  onViewChange: (view: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
  onResetView: () => void
}

export function ViewControls({ onViewChange, onZoomIn, onZoomOut, onZoomFit, onResetView }: ViewControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {/* View buttons */}
      <div className="bg-gray-50/90 border border-cad-border p-1 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-0.5">
          {/* Top row */}
          <div />
          <button
            onClick={() => onViewChange('top')}
            className="w-8 h-8 flex items-center justify-center text-[10px] font-medium text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
            title="Top View"
          >
            T
          </button>
          <div />
          
          {/* Middle row */}
          <button
            onClick={() => onViewChange('left')}
            className="w-8 h-8 flex items-center justify-center text-[10px] font-medium text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
            title="Left View"
          >
            L
          </button>
          <button
            onClick={() => onViewChange('front')}
            className="w-8 h-8 flex items-center justify-center text-[10px] font-bold text-cad-text bg-cad-panel hover:bg-cad-border transition-colors"
            title="Front View"
          >
            F
          </button>
          <button
            onClick={() => onViewChange('right')}
            className="w-8 h-8 flex items-center justify-center text-[10px] font-medium text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
            title="Right View"
          >
            R
          </button>
          
          {/* Bottom row */}
          <div />
          <button
            onClick={() => onViewChange('bottom')}
            className="w-8 h-8 flex items-center justify-center text-[10px] font-medium text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
            title="Bottom View"
          >
            B
          </button>
          <div />
        </div>
        
        {/* Additional views */}
        <div className="flex gap-0.5 mt-1 pt-1 border-t border-cad-border">
          <button
            onClick={() => onViewChange('back')}
            className="flex-1 h-6 flex items-center justify-center text-[9px] font-medium text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
            title="Back View"
          >
            Back
          </button>
          <button
            onClick={() => onViewChange('iso')}
            className="flex-1 h-6 flex items-center justify-center text-[9px] font-medium text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
            title="Isometric View"
          >
            Iso
          </button>
        </div>
      </div>
      
      {/* Zoom controls */}
      <div className="bg-gray-50/90 border border-cad-border p-1 flex flex-col gap-0.5 backdrop-blur-sm">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 flex items-center justify-center text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 flex items-center justify-center text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={onZoomFit}
          className="w-8 h-8 flex items-center justify-center text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
          title="Zoom to Fit"
        >
          <Maximize2 size={16} />
        </button>
      </div>
      
      {/* Home/Reset button */}
      <div className="bg-gray-50/90 border border-cad-border p-1 backdrop-blur-sm">
        <button
          onClick={onResetView}
          className="w-8 h-8 flex items-center justify-center text-cad-text-dim hover:text-cad-text hover:bg-cad-panel transition-colors"
          title="Reset View (Home)"
        >
          <Home size={16} />
        </button>
      </div>
    </div>
  )
}

// Hook for camera view control
export function useCameraControl() {
  const { camera, controls } = useThree()
  
  const setView = useCallback((view: keyof typeof VIEWS) => {
    const viewConfig = VIEWS[view]
    if (!viewConfig) return
    
    // Animate camera to new position
    if (controls) {
      const ctrl = controls as any
      if (ctrl.target) {
        // OrbitControls - set target and position
        camera.position.set(viewConfig.position[0], viewConfig.position[1], viewConfig.position[2])
        camera.up.set(viewConfig.up[0], viewConfig.up[1], viewConfig.up[2])
        ctrl.target.set(viewConfig.target[0], viewConfig.target[1], viewConfig.target[2])
        ctrl.update()
      }
    } else {
      camera.position.set(viewConfig.position[0], viewConfig.position[1], viewConfig.position[2])
      camera.up.set(viewConfig.up[0], viewConfig.up[1], viewConfig.up[2])
      camera.lookAt(viewConfig.target[0], viewConfig.target[1], viewConfig.target[2])
    }
  }, [camera, controls])
  
  const zoomIn = useCallback(() => {
    camera.position.multiplyScalar(0.8)
    if (controls) (controls as any).update?.()
  }, [camera, controls])
  
  const zoomOut = useCallback(() => {
    camera.position.multiplyScalar(1.25)
    if (controls) (controls as any).update?.()
  }, [camera, controls])
  
  const zoomFit = useCallback(() => {
    setView('iso')
  }, [setView])
  
  const resetView = useCallback(() => {
    setView('iso')
  }, [setView])
  
  return { setView, zoomIn, zoomOut, zoomFit, resetView }
}

// Export views for external use
export { VIEWS }

