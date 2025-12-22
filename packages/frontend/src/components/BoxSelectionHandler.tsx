/**
 * Box Selection Handler - Manages drag-select interaction for 3D viewport
 * 
 * Handles:
 * - Mouse down/move/up events for box selection
 * - Window vs Crossing selection mode detection
 * - Real-time preview of selectable entities
 * - Projection of 3D entities to screen space for selection testing
 */

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useUIStore } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'

const DRAG_THRESHOLD = 5 // pixels - minimum movement to activate box selection

export function BoxSelectionHandler() {
  const { camera, gl, scene } = useThree()
  const { 
    boxSelection, 
    startBoxSelection, 
    updateBoxSelection, 
    finishBoxSelection, 
    cancelBoxSelection,
    activeMode 
  } = useUIStore()
  const { document } = useDocumentStore()
  
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)
  
  useEffect(() => {
    const canvas = gl.domElement
    
    const handleMouseDown = (e: MouseEvent) => {
      // Only handle left mouse button in model mode (not sketch mode)
      if (e.button !== 0 || activeMode !== 'model') return
      
      // Check if clicking on empty space (not on an object)
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2(
        (e.clientX / canvas.clientWidth) * 2 - 1,
        -(e.clientY / canvas.clientHeight) * 2 + 1
      )
      raycaster.setFromCamera(mouse, camera)
      
      // Get all meshes in scene
      const meshes: THREE.Mesh[] = []
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.visible) {
          meshes.push(obj)
        }
      })
      
      const intersects = raycaster.intersectObjects(meshes, false)
      
      // Only start box selection if clicking on empty space
      if (intersects.length === 0) {
        isDraggingRef.current = true
        hasMovedRef.current = false
        startPosRef.current = { x: e.clientX, y: e.clientY }
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      
      const deltaX = e.clientX - startPosRef.current.x
      const deltaY = e.clientY - startPosRef.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // Check if moved beyond threshold
      if (!hasMovedRef.current && distance > DRAG_THRESHOLD) {
        hasMovedRef.current = true
        // Start box selection
        startBoxSelection(startPosRef.current.x, startPosRef.current.y)
      }
      
      // Update box selection if active
      if (hasMovedRef.current && boxSelection.isActive) {
        // Calculate preview of selected entities
        const previewIds = calculateSelectedEntities(
          startPosRef.current.x,
          startPosRef.current.y,
          e.clientX,
          e.clientY,
          canvas,
          camera,
          scene,
          document
        )
        
        updateBoxSelection(e.clientX, e.clientY, previewIds)
      }
    }
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      
      isDraggingRef.current = false
      
      if (hasMovedRef.current && boxSelection.isActive) {
        // Finish box selection
        const addToSelection = e.ctrlKey || e.metaKey
        finishBoxSelection(addToSelection)
      }
      
      hasMovedRef.current = false
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cancel box selection on ESC
      if (e.key === 'Escape' && boxSelection.isActive) {
        cancelBoxSelection()
        isDraggingRef.current = false
        hasMovedRef.current = false
      }
    }
    
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [camera, gl, scene, boxSelection, activeMode, document, startBoxSelection, updateBoxSelection, finishBoxSelection, cancelBoxSelection])
  
  return null
}

// Helper function to calculate which entities are within the selection box
function calculateSelectedEntities(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  scene: THREE.Scene,
  document: any
): string[] {
  const selectedIds: string[] = []
  
  // Determine selection mode
  const isWindow = endX >= startX // Left-to-right = window, right-to-left = crossing
  
  // Calculate normalized box coordinates
  const boxLeft = Math.min(startX, endX)
  const boxRight = Math.max(startX, endX)
  const boxTop = Math.min(startY, endY)
  const boxBottom = Math.max(startY, endY)
  
  // Get active part studio and parts
  const activePartStudio = document?.partStudios.find((ps: any) => ps.id === document.activeElementId)
  const parts = activePartStudio?.parts || []
  
  // Check each part
  for (const part of parts) {
    if (part.visible === false || !part.mesh) continue
    
    // Get the part's mesh from the scene
    let partMesh: THREE.Mesh | null = null
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.partId === part.id) {
        partMesh = obj
      }
    })
    
    if (!partMesh || !partMesh.geometry.boundingBox) continue
    
    // Compute bounding box in world space
    if (!partMesh.geometry.boundingBox) {
      partMesh.geometry.computeBoundingBox()
    }
    
    const boundingBox = partMesh.geometry.boundingBox!.clone()
    boundingBox.applyMatrix4(partMesh.matrixWorld)
    
    // Get 8 corners of bounding box
    const corners = [
      new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
      new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
      new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
      new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
    ]
    
    // Project corners to screen space
    const screenCorners = corners.map(corner => {
      const projected = corner.clone().project(camera)
      return {
        x: (projected.x + 1) / 2 * canvas.clientWidth,
        y: (-projected.y + 1) / 2 * canvas.clientHeight
      }
    })
    
    // Check selection based on mode
    if (isWindow) {
      // Window selection: ALL corners must be inside box
      const allInside = screenCorners.every(corner =>
        corner.x >= boxLeft && corner.x <= boxRight &&
        corner.y >= boxTop && corner.y <= boxBottom
      )
      if (allInside) {
        selectedIds.push(part.id)
      }
    } else {
      // Crossing selection: ANY corner inside box OR box intersects bounding rect
      const anyInside = screenCorners.some(corner =>
        corner.x >= boxLeft && corner.x <= boxRight &&
        corner.y >= boxTop && corner.y <= boxBottom
      )
      
      // Also check if selection box intersects the screen-space bounding rect
      const minX = Math.min(...screenCorners.map(c => c.x))
      const maxX = Math.max(...screenCorners.map(c => c.x))
      const minY = Math.min(...screenCorners.map(c => c.y))
      const maxY = Math.max(...screenCorners.map(c => c.y))
      
      const intersects = !(
        maxX < boxLeft ||
        minX > boxRight ||
        maxY < boxTop ||
        minY > boxBottom
      )
      
      if (anyInside || intersects) {
        selectedIds.push(part.id)
      }
    }
  }
  
  return selectedIds
}

