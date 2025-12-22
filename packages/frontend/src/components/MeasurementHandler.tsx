/**
 * MeasurementHandler - Handles entity selection and measurement interaction in 3D view
 */

import { useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { useUIStore, MeasurementEntity } from '../store/uiStore'
import { useDocumentStore } from '../store/documentStore'
import { calculateMeasurement } from '../utils/measurement-utils'
import * as THREE from 'three'

export function MeasurementHandler() {
  const { camera, raycaster, scene, gl } = useThree()
  const { 
    measurementMode, 
    setMeasurementFirstEntity,
    setMeasurementHoverEntity,
    completeMeasurement,
    exitMeasurementMode,
    addNotification
  } = useUIStore()
  const { document } = useDocumentStore()
  
  /**
   * Extract entity information from a mesh hit
   */
  const extractEntityFromIntersection = useCallback((intersection: THREE.Intersection): MeasurementEntity | null => {
    const { object, point, face } = intersection
    
    if (!face) return null
    
    const mesh = object as THREE.Mesh
    
    // Get face normal in world space
    const normal = face.normal.clone()
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
    normal.applyMatrix3(normalMatrix).normalize()
    
    // For now, treat the hit as a face measurement
    // In a more sophisticated implementation, we would:
    // - Detect edge clicks based on proximity to edges
    // - Detect vertex clicks based on proximity to vertices
    
    const entity: MeasurementEntity = {
      type: 'face',
      id: `face-${Date.now()}`,
      position: [point.x, point.y, point.z],
      normal: [normal.x, normal.y, normal.z]
    }
    
    return entity
  }, [])
  
  /**
   * Handle click in measurement mode
   */
  const handleClick = useCallback((event: MouseEvent) => {
    if (!measurementMode.isActive) return
    
    // Prevent default context menu on right click
    if (event.button === 2) {
      event.preventDefault()
      return
    }
    
    // Only handle left click
    if (event.button !== 0) return
    
    // Calculate mouse position in normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera)
    
    // Find intersections with all meshes in the scene
    const meshes: THREE.Mesh[] = []
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.visible) {
        meshes.push(child)
      }
    })
    
    const intersects = raycaster.intersectObjects(meshes, false)
    
    if (intersects.length === 0) return
    
    const entity = extractEntityFromIntersection(intersects[0])
    if (!entity) return
    
    if (measurementMode.step === 'select-first') {
      // First entity selected
      setMeasurementFirstEntity(entity)
      addNotification('info', 'First entity selected. Select second entity...')
    } else if (measurementMode.step === 'select-second' && measurementMode.firstEntity) {
      // Second entity selected - complete measurement
      const measurement = calculateMeasurement(measurementMode.firstEntity, entity)
      completeMeasurement(measurement)
      addNotification('success', `Measured: ${measurement.value.toFixed(2)} ${measurement.unit}`)
    }
  }, [
    measurementMode,
    camera,
    raycaster,
    scene,
    gl,
    setMeasurementFirstEntity,
    completeMeasurement,
    extractEntityFromIntersection,
    addNotification
  ])
  
  /**
   * Handle mouse move for live preview
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!measurementMode.isActive || measurementMode.step !== 'select-second') return
    if (!measurementMode.firstEntity) return
    
    // Calculate mouse position
    const rect = gl.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera)
    
    // Find intersections
    const meshes: THREE.Mesh[] = []
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.visible) {
        meshes.push(child)
      }
    })
    
    const intersects = raycaster.intersectObjects(meshes, false)
    
    if (intersects.length === 0) {
      setMeasurementHoverEntity(null)
      return
    }
    
    const entity = extractEntityFromIntersection(intersects[0])
    if (!entity) {
      setMeasurementHoverEntity(null)
      return
    }
    
    // Calculate preview measurement
    const previewMeasurement = calculateMeasurement(measurementMode.firstEntity, entity)
    
    // Update hover entity with the preview measurement
    setMeasurementHoverEntity(entity)
    
    // Update the preview measurement in the state
    // This is a bit of a hack - we're using the state update to trigger the preview
    useUIStore.setState((state) => ({
      measurementMode: {
        ...state.measurementMode,
        previewMeasurement
      }
    }))
  }, [
    measurementMode,
    camera,
    raycaster,
    scene,
    gl,
    setMeasurementHoverEntity,
    extractEntityFromIntersection
  ])
  
  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!measurementMode.isActive) return
    
    if (event.key === 'Escape') {
      exitMeasurementMode()
      addNotification('info', 'Measurement mode exited')
    }
  }, [measurementMode.isActive, exitMeasurementMode, addNotification])
  
  // Set up event listeners
  useEffect(() => {
    if (!measurementMode.isActive) return
    
    const canvas = gl.domElement
    
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    
    // Change cursor style
    canvas.style.cursor = 'crosshair'
    
    return () => {
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      canvas.style.cursor = 'default'
    }
  }, [measurementMode.isActive, handleClick, handleMouseMove, handleKeyDown, gl])
  
  // This component doesn't render anything
  return null
}

