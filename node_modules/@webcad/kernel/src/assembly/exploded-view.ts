/**
 * Exploded View Generator
 * Creates exploded views of assemblies for visualization
 */

import { Vector3, Vec3 } from '../math/vector'
import { Mat4 } from '../math/matrix'

export interface ExplodedComponent {
  componentId: string
  originalPosition: { x: number; y: number; z: number }
  explodedPosition: { x: number; y: number; z: number }
  explosionVector: { x: number; y: number; z: number }
  explosionDistance: number
  stepIndex: number
}

export interface ExplosionStep {
  stepIndex: number
  componentIds: string[]
  direction: { x: number; y: number; z: number }
  distance: number
}

export interface ExplodedViewConfig {
  method: 'radial' | 'linear' | 'hierarchical' | 'custom'
  scaleFactor: number
  center: { x: number; y: number; z: number }
  primaryAxis?: { x: number; y: number; z: number }
  steps?: ExplosionStep[]
}

/**
 * Component bounding info for explosion calculations
 */
interface ComponentBounds {
  componentId: string
  center: Vec3
  min: Vec3
  max: Vec3
  size: Vec3
}

/**
 * Generate radial explosion - components move outward from center
 */
function generateRadialExplosion(
  components: ComponentBounds[],
  center: Vec3,
  scaleFactor: number
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  
  const sorted = [...components].sort((a, b) => {
    const distA = a.center.sub(center).length()
    const distB = b.center.sub(center).length()
    return distA - distB
  })
  
  sorted.forEach((comp, index) => {
    const direction = comp.center.sub(center)
    const distance = direction.length()
    
    if (distance < 1e-10) {
      results.push({
        componentId: comp.componentId,
        originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explodedPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explosionVector: { x: 0, y: 0, z: 0 },
        explosionDistance: 0,
        stepIndex: 0
      })
    } else {
      const normalizedDir = direction.normalize()
      const explosionDistance = distance * scaleFactor + (index * comp.size.length() * 0.5)
      const explodedPos = center.add(normalizedDir.mul(distance + explosionDistance))
      
      results.push({
        componentId: comp.componentId,
        originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explodedPosition: { x: explodedPos.x, y: explodedPos.y, z: explodedPos.z },
        explosionVector: { x: normalizedDir.x, y: normalizedDir.y, z: normalizedDir.z },
        explosionDistance,
        stepIndex: index
      })
    }
  })
  
  return results
}

/**
 * Generate linear explosion - components move along a single axis
 */
function generateLinearExplosion(
  components: ComponentBounds[],
  axis: Vec3,
  scaleFactor: number
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  const normalizedAxis = axis.normalize()
  
  const sorted = [...components].sort((a, b) => {
    const projA = a.center.dot(normalizedAxis)
    const projB = b.center.dot(normalizedAxis)
    return projA - projB
  })
  
  let currentOffset = 0
  sorted.forEach((comp, index) => {
    const sizeAlongAxis = Math.abs(comp.size.dot(normalizedAxis))
    const gap = sizeAlongAxis * scaleFactor
    
    const explosionDistance = currentOffset
    const explodedPos = comp.center.add(normalizedAxis.mul(explosionDistance))
    
    results.push({
      componentId: comp.componentId,
      originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
      explodedPosition: { x: explodedPos.x, y: explodedPos.y, z: explodedPos.z },
      explosionVector: { x: normalizedAxis.x, y: normalizedAxis.y, z: normalizedAxis.z },
      explosionDistance,
      stepIndex: index
    })
    
    currentOffset += gap
  })
  
  return results
}

/**
 * Generate hierarchical explosion - follows assembly tree structure
 */
function generateHierarchicalExplosion(
  components: ComponentBounds[],
  center: Vec3,
  scaleFactor: number,
  hierarchy: Map<string, string | null>
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  
  const levels = new Map<string, number>()
  
  for (const comp of components) {
    let level = 0
    let current = comp.componentId
    
    while (hierarchy.get(current)) {
      level++
      current = hierarchy.get(current)!
    }
    
    levels.set(comp.componentId, level)
  }
  
  for (const comp of components) {
    const level = levels.get(comp.componentId) || 0
    const direction = comp.center.sub(center)
    const baseDistance = direction.length()
    
    if (baseDistance < 1e-10) {
      results.push({
        componentId: comp.componentId,
        originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explodedPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explosionVector: { x: 0, y: 0, z: 0 },
        explosionDistance: 0,
        stepIndex: level
      })
    } else {
      const normalizedDir = direction.normalize()
      const explosionDistance = level * comp.size.length() * scaleFactor
      const explodedPos = comp.center.add(normalizedDir.mul(explosionDistance))
      
      results.push({
        componentId: comp.componentId,
        originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explodedPosition: { x: explodedPos.x, y: explodedPos.y, z: explodedPos.z },
        explosionVector: { x: normalizedDir.x, y: normalizedDir.y, z: normalizedDir.z },
        explosionDistance,
        stepIndex: level
      })
    }
  }
  
  return results
}

/**
 * Generate custom explosion from predefined steps
 */
function generateCustomExplosion(
  components: ComponentBounds[],
  steps: ExplosionStep[]
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  const processed = new Set<string>()
  
  for (const step of steps) {
    for (const compId of step.componentIds) {
      const comp = components.find(c => c.componentId === compId)
      if (!comp) continue
      
      const normalizedDir = new Vec3(step.direction.x, step.direction.y, step.direction.z).normalize()
      const explodedPos = comp.center.add(normalizedDir.mul(step.distance))
      
      results.push({
        componentId: comp.componentId,
        originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explodedPosition: { x: explodedPos.x, y: explodedPos.y, z: explodedPos.z },
        explosionVector: { x: normalizedDir.x, y: normalizedDir.y, z: normalizedDir.z },
        explosionDistance: step.distance,
        stepIndex: step.stepIndex
      })
      
      processed.add(compId)
    }
  }
  
  for (const comp of components) {
    if (!processed.has(comp.componentId)) {
      results.push({
        componentId: comp.componentId,
        originalPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explodedPosition: { x: comp.center.x, y: comp.center.y, z: comp.center.z },
        explosionVector: { x: 0, y: 0, z: 0 },
        explosionDistance: 0,
        stepIndex: 0
      })
    }
  }
  
  return results
}

/**
 * Main exploded view generator
 */
export class ExplodedViewGenerator {
  /**
   * Generate an exploded view configuration
   */
  static generate(
    components: ComponentBounds[],
    config: ExplodedViewConfig,
    hierarchy?: Map<string, string | null>
  ): ExplodedComponent[] {
    const center = new Vec3(config.center.x, config.center.y, config.center.z)
    
    switch (config.method) {
      case 'radial':
        return generateRadialExplosion(components, center, config.scaleFactor)
      
      case 'linear':
        const axis = config.primaryAxis 
          ? new Vec3(config.primaryAxis.x, config.primaryAxis.y, config.primaryAxis.z)
          : new Vec3(0, 0, 1)
        return generateLinearExplosion(components, axis, config.scaleFactor)
      
      case 'hierarchical':
        return generateHierarchicalExplosion(
          components,
          center,
          config.scaleFactor,
          hierarchy || new Map()
        )
      
      case 'custom':
        return generateCustomExplosion(components, config.steps || [])
      
      default:
        return generateRadialExplosion(components, center, config.scaleFactor)
    }
  }
  
  /**
   * Interpolate between assembled and exploded positions
   */
  static interpolate(
    exploded: ExplodedComponent[],
    t: number
  ): Map<string, { x: number; y: number; z: number }> {
    const positions = new Map<string, { x: number; y: number; z: number }>()
    
    for (const comp of exploded) {
      const orig = new Vec3(comp.originalPosition.x, comp.originalPosition.y, comp.originalPosition.z)
      const expl = new Vec3(comp.explodedPosition.x, comp.explodedPosition.y, comp.explodedPosition.z)
      const pos = orig.lerp(expl, t)
      positions.set(comp.componentId, { x: pos.x, y: pos.y, z: pos.z })
    }
    
    return positions
  }
  
  /**
   * Get transformation matrices for a given explosion state
   */
  static getTransforms(
    exploded: ExplodedComponent[],
    t: number
  ): Map<string, Mat4> {
    const transforms = new Map<string, Mat4>()
    
    for (const comp of exploded) {
      const orig = new Vec3(comp.originalPosition.x, comp.originalPosition.y, comp.originalPosition.z)
      const expl = new Vec3(comp.explodedPosition.x, comp.explodedPosition.y, comp.explodedPosition.z)
      const pos = orig.lerp(expl, t)
      const offset = pos.sub(orig)
      
      transforms.set(comp.componentId, Mat4.translation(offset.x, offset.y, offset.z))
    }
    
    return transforms
  }
  
  /**
   * Generate explosion animation keyframes
   */
  static generateKeyframes(
    exploded: ExplodedComponent[],
    frameCount: number = 60,
    easing: 'linear' | 'easeInOut' | 'easeOut' = 'easeInOut'
  ): Array<Map<string, { x: number; y: number; z: number }>> {
    const keyframes: Array<Map<string, { x: number; y: number; z: number }>> = []
    
    for (let i = 0; i <= frameCount; i++) {
      let t = i / frameCount
      
      switch (easing) {
        case 'easeInOut':
          t = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2
          break
        case 'easeOut':
          t = 1 - Math.pow(1 - t, 3)
          break
      }
      
      keyframes.push(this.interpolate(exploded, t))
    }
    
    return keyframes
  }
}
