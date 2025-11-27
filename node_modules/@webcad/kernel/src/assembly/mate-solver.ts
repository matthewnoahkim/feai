/**
 * Assembly Mate Solver
 * Solves assembly constraints to position components
 */

import { Vector3, Matrix4, Quaternion } from '../math/vector'
import { MateType } from '@webcad/shared'

export interface MateConnector {
  id: string
  position: Vector3
  normal: Vector3
  xAxis: Vector3
}

export interface AssemblyMate {
  id: string
  type: MateType
  connector1: MateConnector
  connector2: MateConnector
  component1Id: string
  component2Id: string
  offset?: number
  angle?: number
  flip?: boolean
  limits?: {
    min?: number
    max?: number
  }
}

export interface ComponentTransform {
  componentId: string
  position: Vector3
  rotation: Quaternion
  matrix: Matrix4
}

/**
 * Calculates the transformation matrix for a mate connector
 */
function mateConnectorMatrix(connector: MateConnector): Matrix4 {
  const zAxis = connector.normal.normalize()
  const xAxis = connector.xAxis.normalize()
  const yAxis = zAxis.cross(xAxis).normalize()
  
  return new Matrix4(
    xAxis.x, yAxis.x, zAxis.x, connector.position.x,
    xAxis.y, yAxis.y, zAxis.y, connector.position.y,
    xAxis.z, yAxis.z, zAxis.z, connector.position.z,
    0, 0, 0, 1
  )
}

/**
 * Solve a fastened mate (fully constrained - removes all DOF)
 */
function solveFastenedMate(mate: AssemblyMate): Matrix4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  // Component 2 is positioned so connector2 aligns with connector1
  const m2Inv = m2.inverse()
  return m1.multiply(m2Inv)
}

/**
 * Solve a revolute mate (allows rotation about one axis)
 */
function solveRevoluteMate(mate: AssemblyMate): Matrix4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  // Align z-axes (rotation axis), apply angle offset
  const angle = mate.angle || 0
  const rotation = Matrix4.rotationZ(angle)
  
  const m2Inv = m2.inverse()
  return m1.multiply(rotation).multiply(m2Inv)
}

/**
 * Solve a slider mate (allows translation along one axis)
 */
function solveSliderMate(mate: AssemblyMate): Matrix4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  // Align orientations, apply offset along z-axis
  const offset = mate.offset || 0
  const translation = Matrix4.translation(0, 0, offset)
  
  const m2Inv = m2.inverse()
  return m1.multiply(translation).multiply(m2Inv)
}

/**
 * Solve a cylindrical mate (rotation + translation along one axis)
 */
function solveCylindricalMate(mate: AssemblyMate): Matrix4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  const offset = mate.offset || 0
  const angle = mate.angle || 0
  
  const translation = Matrix4.translation(0, 0, offset)
  const rotation = Matrix4.rotationZ(angle)
  
  const m2Inv = m2.inverse()
  return m1.multiply(rotation).multiply(translation).multiply(m2Inv)
}

/**
 * Solve a planar mate (allows motion in a plane)
 */
function solvePlanarMate(mate: AssemblyMate): Matrix4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  // Align z-axes (normals), allow x-y translation
  const flip = mate.flip ? Matrix4.rotationX(Math.PI) : Matrix4.identity()
  
  const m2Inv = m2.inverse()
  return m1.multiply(flip).multiply(m2Inv)
}

/**
 * Solve a ball mate (spherical joint - rotation about a point)
 */
function solveBallMate(mate: AssemblyMate): Matrix4 {
  // Position constraint only - all rotations free
  const pos1 = mate.connector1.position
  const pos2 = mate.connector2.position
  
  // Translate so connector2 is at connector1 position
  return Matrix4.translation(
    pos1.x - pos2.x,
    pos1.y - pos2.y,
    pos1.z - pos2.z
  )
}

/**
 * Solve a parallel mate (parallel faces/axes)
 */
function solveParallelMate(mate: AssemblyMate): Matrix4 {
  const n1 = mate.connector1.normal.normalize()
  const n2 = mate.connector2.normal.normalize()
  
  // Calculate rotation to align normals
  const axis = n2.cross(n1)
  const angle = Math.acos(Math.min(1, Math.max(-1, n2.dot(n1))))
  
  if (axis.length() > 1e-10) {
    return Matrix4.rotation(axis.normalize(), angle)
  }
  
  return Matrix4.identity()
}

/**
 * Solve a tangent mate (surfaces tangent to each other)
 */
function solveTangentMate(mate: AssemblyMate): Matrix4 {
  // Similar to planar but allows sliding along tangent surface
  return solvePlanarMate(mate)
}

/**
 * Main mate solver - solves individual mate constraint
 */
export function solveMate(mate: AssemblyMate): Matrix4 {
  switch (mate.type) {
    case 'fastened':
      return solveFastenedMate(mate)
    case 'revolute':
      return solveRevoluteMate(mate)
    case 'slider':
      return solveSliderMate(mate)
    case 'cylindrical':
      return solveCylindricalMate(mate)
    case 'planar':
      return solvePlanarMate(mate)
    case 'ball':
      return solveBallMate(mate)
    case 'parallel':
      return solveParallelMate(mate)
    case 'tangent':
      return solveTangentMate(mate)
    default:
      return Matrix4.identity()
  }
}

/**
 * Assembly Solver
 * Iteratively solves all mates to find component positions
 */
export class AssemblySolver {
  private components: Map<string, ComponentTransform> = new Map()
  private mates: AssemblyMate[] = []
  private groundedComponentId: string | null = null
  
  constructor() {}
  
  /**
   * Set the grounded (fixed) component
   */
  setGroundedComponent(componentId: string): void {
    this.groundedComponentId = componentId
    this.components.set(componentId, {
      componentId,
      position: new Vector3(0, 0, 0),
      rotation: Quaternion.identity(),
      matrix: Matrix4.identity()
    })
  }
  
  /**
   * Add a component to the assembly
   */
  addComponent(componentId: string, initialTransform?: Matrix4): void {
    const transform = initialTransform || Matrix4.identity()
    const position = new Vector3(
      transform.m03,
      transform.m13,
      transform.m23
    )
    
    this.components.set(componentId, {
      componentId,
      position,
      rotation: Quaternion.identity(), // TODO: extract from matrix
      matrix: transform
    })
  }
  
  /**
   * Add a mate constraint
   */
  addMate(mate: AssemblyMate): void {
    this.mates.push(mate)
  }
  
  /**
   * Remove a mate constraint
   */
  removeMate(mateId: string): void {
    this.mates = this.mates.filter(m => m.id !== mateId)
  }
  
  /**
   * Solve all mates iteratively
   */
  solve(maxIterations: number = 100, tolerance: number = 1e-6): boolean {
    // Build dependency graph
    const solved = new Set<string>()
    
    if (this.groundedComponentId) {
      solved.add(this.groundedComponentId)
    }
    
    let iterations = 0
    let changed = true
    
    while (changed && iterations < maxIterations) {
      changed = false
      iterations++
      
      for (const mate of this.mates) {
        const comp1Solved = solved.has(mate.component1Id)
        const comp2Solved = solved.has(mate.component2Id)
        
        // Can solve if exactly one component is already positioned
        if (comp1Solved && !comp2Solved) {
          const transform = solveMate(mate)
          const comp1Transform = this.components.get(mate.component1Id)
          
          if (comp1Transform) {
            const newMatrix = comp1Transform.matrix.multiply(transform)
            this.components.set(mate.component2Id, {
              componentId: mate.component2Id,
              position: new Vector3(newMatrix.m03, newMatrix.m13, newMatrix.m23),
              rotation: Quaternion.identity(),
              matrix: newMatrix
            })
            solved.add(mate.component2Id)
            changed = true
          }
        } else if (!comp1Solved && comp2Solved) {
          // Reverse - solve for component 1
          const transform = solveMate(mate)
          const comp2Transform = this.components.get(mate.component2Id)
          
          if (comp2Transform) {
            const newMatrix = comp2Transform.matrix.multiply(transform.inverse())
            this.components.set(mate.component1Id, {
              componentId: mate.component1Id,
              position: new Vector3(newMatrix.m03, newMatrix.m13, newMatrix.m23),
              rotation: Quaternion.identity(),
              matrix: newMatrix
            })
            solved.add(mate.component1Id)
            changed = true
          }
        }
      }
    }
    
    // Check if all components are solved
    for (const [id] of this.components) {
      if (!solved.has(id)) {
        console.warn(`Component ${id} could not be solved`)
        return false
      }
    }
    
    return true
  }
  
  /**
   * Get the solved transform for a component
   */
  getComponentTransform(componentId: string): ComponentTransform | undefined {
    return this.components.get(componentId)
  }
  
  /**
   * Get all component transforms
   */
  getAllTransforms(): ComponentTransform[] {
    return Array.from(this.components.values())
  }
  
  /**
   * Calculate degrees of freedom for the assembly
   */
  calculateDOF(): { total: number; perComponent: Map<string, number> } {
    const dofMap = new Map<string, number>()
    
    // Each component has 6 DOF (3 translation + 3 rotation)
    for (const [id] of this.components) {
      dofMap.set(id, 6)
    }
    
    // Grounded component has 0 DOF
    if (this.groundedComponentId) {
      dofMap.set(this.groundedComponentId, 0)
    }
    
    // Subtract DOF based on mate types
    for (const mate of this.mates) {
      const removedDOF = getMateRemovedDOF(mate.type)
      
      // Distribute DOF removal (simplified)
      const current = dofMap.get(mate.component2Id) || 6
      dofMap.set(mate.component2Id, Math.max(0, current - removedDOF))
    }
    
    // Calculate total
    let total = 0
    for (const [, dof] of dofMap) {
      total += dof
    }
    
    return { total, perComponent: dofMap }
  }
}

/**
 * Get the number of DOF removed by a mate type
 */
function getMateRemovedDOF(type: MateType): number {
  switch (type) {
    case 'fastened': return 6
    case 'revolute': return 5
    case 'slider': return 5
    case 'cylindrical': return 4
    case 'planar': return 3
    case 'ball': return 3
    case 'parallel': return 2
    case 'tangent': return 1
    default: return 0
  }
}

/**
 * Gear relationship solver
 */
export function solveGearRelation(
  gear1Angle: number,
  teeth1: number,
  teeth2: number,
  reverse: boolean = false
): number {
  const ratio = teeth1 / teeth2
  const direction = reverse ? -1 : 1
  return gear1Angle * ratio * direction
}

/**
 * Rack and pinion solver
 */
export function solveRackAndPinion(
  pinionAngle: number,
  pitchRadius: number
): number {
  // Linear displacement = angle * radius
  return pinionAngle * pitchRadius
}

/**
 * Lead screw solver
 */
export function solveLeadScrew(
  screwAngle: number,
  lead: number
): number {
  // Linear displacement = (angle / 2π) * lead
  return (screwAngle / (2 * Math.PI)) * lead
}

