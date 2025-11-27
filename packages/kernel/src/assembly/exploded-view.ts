/**
 * Exploded View Generator
 * Creates exploded views of assemblies for visualization
 */

import { Vector3, Matrix4 } from '../math/vector'

export interface ExplodedComponent {
  componentId: string
  originalPosition: Vector3
  explodedPosition: Vector3
  explosionVector: Vector3
  explosionDistance: number
  stepIndex: number
}

export interface ExplosionStep {
  stepIndex: number
  componentIds: string[]
  direction: Vector3
  distance: number
}

export interface ExplodedViewConfig {
  method: 'radial' | 'linear' | 'hierarchical' | 'custom'
  scaleFactor: number
  center: Vector3
  primaryAxis?: Vector3
  steps?: ExplosionStep[]
}

/**
 * Component bounding info for explosion calculations
 */
interface ComponentBounds {
  componentId: string
  center: Vector3
  min: Vector3
  max: Vector3
  size: Vector3
}

/**
 * Generate radial explosion - components move outward from center
 */
function generateRadialExplosion(
  components: ComponentBounds[],
  center: Vector3,
  scaleFactor: number
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  
  // Sort by distance from center
  const sorted = [...components].sort((a, b) => {
    const distA = a.center.subtract(center).length()
    const distB = b.center.subtract(center).length()
    return distA - distB
  })
  
  sorted.forEach((comp, index) => {
    const direction = comp.center.subtract(center)
    const distance = direction.length()
    
    if (distance < 1e-10) {
      // Component at center - don't move
      results.push({
        componentId: comp.componentId,
        originalPosition: comp.center,
        explodedPosition: comp.center,
        explosionVector: new Vector3(0, 0, 0),
        explosionDistance: 0,
        stepIndex: 0
      })
    } else {
      const normalizedDir = direction.normalize()
      const explosionDistance = distance * scaleFactor + (index * comp.size.length() * 0.5)
      const explodedPosition = center.add(normalizedDir.scale(distance + explosionDistance))
      
      results.push({
        componentId: comp.componentId,
        originalPosition: comp.center,
        explodedPosition,
        explosionVector: normalizedDir,
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
  axis: Vector3,
  scaleFactor: number
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  const normalizedAxis = axis.normalize()
  
  // Sort by position along axis
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
    const explodedPosition = comp.center.add(normalizedAxis.scale(explosionDistance))
    
    results.push({
      componentId: comp.componentId,
      originalPosition: comp.center,
      explodedPosition,
      explosionVector: normalizedAxis,
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
  center: Vector3,
  scaleFactor: number,
  hierarchy: Map<string, string | null> // componentId -> parentId
): ExplodedComponent[] {
  const results: ExplodedComponent[] = []
  
  // Build level map
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
  
  // Generate explosions based on level
  for (const comp of components) {
    const level = levels.get(comp.componentId) || 0
    const direction = comp.center.subtract(center)
    const baseDistance = direction.length()
    
    if (baseDistance < 1e-10) {
      results.push({
        componentId: comp.componentId,
        originalPosition: comp.center,
        explodedPosition: comp.center,
        explosionVector: new Vector3(0, 0, 0),
        explosionDistance: 0,
        stepIndex: level
      })
    } else {
      const normalizedDir = direction.normalize()
      const explosionDistance = level * comp.size.length() * scaleFactor
      const explodedPosition = comp.center.add(normalizedDir.scale(explosionDistance))
      
      results.push({
        componentId: comp.componentId,
        originalPosition: comp.center,
        explodedPosition,
        explosionVector: normalizedDir,
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
  
  // Apply steps in order
  for (const step of steps) {
    for (const compId of step.componentIds) {
      const comp = components.find(c => c.componentId === compId)
      if (!comp) continue
      
      const normalizedDir = step.direction.normalize()
      const explodedPosition = comp.center.add(normalizedDir.scale(step.distance))
      
      results.push({
        componentId: comp.componentId,
        originalPosition: comp.center,
        explodedPosition,
        explosionVector: normalizedDir,
        explosionDistance: step.distance,
        stepIndex: step.stepIndex
      })
      
      processed.add(compId)
    }
  }
  
  // Add remaining components with no explosion
  for (const comp of components) {
    if (!processed.has(comp.componentId)) {
      results.push({
        componentId: comp.componentId,
        originalPosition: comp.center,
        explodedPosition: comp.center,
        explosionVector: new Vector3(0, 0, 0),
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
    switch (config.method) {
      case 'radial':
        return generateRadialExplosion(components, config.center, config.scaleFactor)
      
      case 'linear':
        return generateLinearExplosion(
          components,
          config.primaryAxis || new Vector3(0, 0, 1),
          config.scaleFactor
        )
      
      case 'hierarchical':
        return generateHierarchicalExplosion(
          components,
          config.center,
          config.scaleFactor,
          hierarchy || new Map()
        )
      
      case 'custom':
        return generateCustomExplosion(components, config.steps || [])
      
      default:
        return generateRadialExplosion(components, config.center, config.scaleFactor)
    }
  }
  
  /**
   * Interpolate between assembled and exploded positions
   */
  static interpolate(
    exploded: ExplodedComponent[],
    t: number // 0 = assembled, 1 = fully exploded
  ): Map<string, Vector3> {
    const positions = new Map<string, Vector3>()
    
    for (const comp of exploded) {
      const position = comp.originalPosition.lerp(comp.explodedPosition, t)
      positions.set(comp.componentId, position)
    }
    
    return positions
  }
  
  /**
   * Get transformation matrices for a given explosion state
   */
  static getTransforms(
    exploded: ExplodedComponent[],
    t: number
  ): Map<string, Matrix4> {
    const transforms = new Map<string, Matrix4>()
    
    for (const comp of exploded) {
      const position = comp.originalPosition.lerp(comp.explodedPosition, t)
      const offset = position.subtract(comp.originalPosition)
      
      transforms.set(comp.componentId, Matrix4.translation(offset.x, offset.y, offset.z))
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
  ): Array<Map<string, Vector3>> {
    const keyframes: Array<Map<string, Vector3>> = []
    
    for (let i = 0; i <= frameCount; i++) {
      let t = i / frameCount
      
      // Apply easing
      switch (easing) {
        case 'easeInOut':
          t = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2
          break
        case 'easeOut':
          t = 1 - Math.pow(1 - t, 3)
          break
        // linear is default (no change)
      }
      
      keyframes.push(this.interpolate(exploded, t))
    }
    
    return keyframes
  }
}

