/**
 * Measurement Utilities - Calculate distances and angles between entities
 */

import { MeasurementEntity, Measurement } from '../store/uiStore'
import * as THREE from 'three'

/**
 * Calculate distance between two 3D points
 */
export function calculatePointToPointDistance(
  p1: [number, number, number],
  p2: [number, number, number]
): { distance: number; delta: { x: number; y: number; z: number } } {
  const delta = {
    x: p2[0] - p1[0],
    y: p2[1] - p1[1],
    z: p2[2] - p1[2]
  }
  
  const distance = Math.sqrt(delta.x ** 2 + delta.y ** 2 + delta.z ** 2)
  
  return { distance, delta }
}

/**
 * Calculate angle between two direction vectors in degrees
 */
export function calculateAngleBetweenVectors(
  v1: [number, number, number],
  v2: [number, number, number]
): number {
  const vec1 = new THREE.Vector3(...v1).normalize()
  const vec2 = new THREE.Vector3(...v2).normalize()
  
  const dot = vec1.dot(vec2)
  const angleRad = Math.acos(Math.max(-1, Math.min(1, dot)))
  
  return (angleRad * 180) / Math.PI
}

/**
 * Calculate distance between a point and a plane
 */
export function calculatePointToPlaneDistance(
  point: [number, number, number],
  planeOrigin: [number, number, number],
  planeNormal: [number, number, number]
): number {
  const p = new THREE.Vector3(...point)
  const o = new THREE.Vector3(...planeOrigin)
  const n = new THREE.Vector3(...planeNormal).normalize()
  
  const v = new THREE.Vector3().subVectors(p, o)
  return Math.abs(v.dot(n))
}

/**
 * Calculate measurement between two entities
 */
export function calculateMeasurement(
  entity1: MeasurementEntity,
  entity2: MeasurementEntity,
  unit: string = 'mm'
): Measurement {
  const id = `measurement-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
  // Point to Point
  if (entity1.type === 'vertex' && entity2.type === 'vertex' && entity1.position && entity2.position) {
    const { distance, delta } = calculatePointToPointDistance(entity1.position, entity2.position)
    
    return {
      id,
      type: 'distance',
      entity1,
      entity2,
      value: distance,
      delta,
      unit,
      timestamp: new Date()
    }
  }
  
  // Point to Face (plane)
  if (entity1.type === 'vertex' && entity2.type === 'face' && 
      entity1.position && entity2.position && entity2.normal) {
    const distance = calculatePointToPlaneDistance(
      entity1.position,
      entity2.position,
      entity2.normal
    )
    
    return {
      id,
      type: 'distance',
      entity1,
      entity2,
      value: distance,
      unit,
      timestamp: new Date()
    }
  }
  
  // Face to Face (parallel planes)
  if (entity1.type === 'face' && entity2.type === 'face' &&
      entity1.position && entity2.position && entity1.normal && entity2.normal) {
    // Check if planes are parallel
    const normal1 = new THREE.Vector3(...entity1.normal)
    const normal2 = new THREE.Vector3(...entity2.normal)
    const dot = Math.abs(normal1.dot(normal2))
    
    if (dot > 0.999) {  // Planes are parallel
      const distance = calculatePointToPlaneDistance(
        entity2.position,
        entity1.position,
        entity1.normal
      )
      
      return {
        id,
        type: 'distance',
        entity1,
        entity2,
        value: distance,
        unit,
        timestamp: new Date()
      }
    } else {
      // Planes are not parallel - calculate angle
      const angle = calculateAngleBetweenVectors(entity1.normal, entity2.normal)
      
      return {
        id,
        type: 'angle',
        entity1,
        entity2,
        value: angle,
        unit: '°',
        timestamp: new Date()
      }
    }
  }
  
  // Edge to Edge angle
  if (entity1.type === 'edge' && entity2.type === 'edge' &&
      entity1.direction && entity2.direction) {
    const angle = calculateAngleBetweenVectors(entity1.direction, entity2.direction)
    
    return {
      id,
      type: 'angle',
      entity1,
      entity2,
      value: angle,
      unit: '°',
      timestamp: new Date()
    }
  }
  
  // Default: return zero distance
  return {
    id,
    type: 'distance',
    entity1,
    entity2,
    value: 0,
    unit,
    timestamp: new Date()
  }
}

/**
 * Format measurement value for display
 */
export function formatMeasurement(measurement: Measurement, precision: number = 2): string {
  if (measurement.type === 'angle') {
    return `${measurement.value.toFixed(precision)}${measurement.unit}`
  }
  
  return `${measurement.value.toFixed(precision)} ${measurement.unit}`
}

/**
 * Format delta components for display
 */
export function formatDelta(delta: { x: number; y: number; z: number }, unit: string, precision: number = 2): string {
  return `ΔX: ${delta.x.toFixed(precision)} ${unit}, ΔY: ${delta.y.toFixed(precision)} ${unit}, ΔZ: ${delta.z.toFixed(precision)} ${unit}`
}

