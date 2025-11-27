/**
 * Assembly Mate Solver
 * Solves assembly constraints to position components
 */

import { Vector3, Vec3 } from '../math/vector'
import { Mat4, Matrix4 } from '../math/matrix'
import { Quat, Quaternion } from '../math/quaternion'
import { MateType } from '@webcad/shared'

export interface MateConnector {
  id: string
  position: { x: number; y: number; z: number }
  normal: { x: number; y: number; z: number }
  xAxis: { x: number; y: number; z: number }
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
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number; w: number }
  matrix: Mat4
}

/**
 * Calculates the transformation matrix for a mate connector
 */
function mateConnectorMatrix(connector: MateConnector): Mat4 {
  const zAxis = new Vec3(connector.normal.x, connector.normal.y, connector.normal.z).normalize()
  const xAxis = new Vec3(connector.xAxis.x, connector.xAxis.y, connector.xAxis.z).normalize()
  const yAxis = zAxis.cross(xAxis).normalize()
  
  const m = new Mat4()
  const e = m.elements
  
  e[0] = xAxis.x; e[4] = yAxis.x; e[8] = zAxis.x; e[12] = connector.position.x
  e[1] = xAxis.y; e[5] = yAxis.y; e[9] = zAxis.y; e[13] = connector.position.y
  e[2] = xAxis.z; e[6] = yAxis.z; e[10] = zAxis.z; e[14] = connector.position.z
  e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1
  
  return m
}

/**
 * Solve a fastened mate (fully constrained - removes all DOF)
 */
function solveFastenedMate(mate: AssemblyMate): Mat4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  const m2Inv = m2.inverse()
  if (!m2Inv) return Mat4.identity()
  return m1.multiply(m2Inv)
}

/**
 * Solve a revolute mate (allows rotation about one axis)
 */
function solveRevoluteMate(mate: AssemblyMate): Mat4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  const angle = mate.angle || 0
  const rotation = Mat4.rotationZ(angle)
  
  const m2Inv = m2.inverse()
  if (!m2Inv) return Mat4.identity()
  return m1.multiply(rotation).multiply(m2Inv)
}

/**
 * Solve a slider mate (allows translation along one axis)
 */
function solveSliderMate(mate: AssemblyMate): Mat4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  const offset = mate.offset || 0
  const translation = Mat4.translation(0, 0, offset)
  
  const m2Inv = m2.inverse()
  if (!m2Inv) return Mat4.identity()
  return m1.multiply(translation).multiply(m2Inv)
}

/**
 * Solve a cylindrical mate (rotation + translation along one axis)
 */
function solveCylindricalMate(mate: AssemblyMate): Mat4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  const offset = mate.offset || 0
  const angle = mate.angle || 0
  
  const translation = Mat4.translation(0, 0, offset)
  const rotation = Mat4.rotationZ(angle)
  
  const m2Inv = m2.inverse()
  if (!m2Inv) return Mat4.identity()
  return m1.multiply(rotation).multiply(translation).multiply(m2Inv)
}

/**
 * Solve a planar mate (allows motion in a plane)
 */
function solvePlanarMate(mate: AssemblyMate): Mat4 {
  const m1 = mateConnectorMatrix(mate.connector1)
  const m2 = mateConnectorMatrix(mate.connector2)
  
  const flip = mate.flip ? Mat4.rotationX(Math.PI) : Mat4.identity()
  
  const m2Inv = m2.inverse()
  if (!m2Inv) return Mat4.identity()
  return m1.multiply(flip).multiply(m2Inv)
}

/**
 * Solve a ball mate (spherical joint - rotation about a point)
 */
function solveBallMate(mate: AssemblyMate): Mat4 {
  const pos1 = mate.connector1.position
  const pos2 = mate.connector2.position
  
  return Mat4.translation(
    pos1.x - pos2.x,
    pos1.y - pos2.y,
    pos1.z - pos2.z
  )
}

/**
 * Solve a parallel mate (parallel faces/axes)
 */
function solveParallelMate(mate: AssemblyMate): Mat4 {
  const n1 = new Vec3(mate.connector1.normal.x, mate.connector1.normal.y, mate.connector1.normal.z).normalize()
  const n2 = new Vec3(mate.connector2.normal.x, mate.connector2.normal.y, mate.connector2.normal.z).normalize()
  
  const axis = n2.cross(n1)
  const angle = Math.acos(Math.min(1, Math.max(-1, n2.dot(n1))))
  
  if (axis.length() > 1e-10) {
    return Mat4.rotationAxis(axis.normalize(), angle)
  }
  
  return Mat4.identity()
}

/**
 * Solve a tangent mate (surfaces tangent to each other)
 */
function solveTangentMate(mate: AssemblyMate): Mat4 {
  return solvePlanarMate(mate)
}

/**
 * Main mate solver - solves individual mate constraint
 */
export function solveMate(mate: AssemblyMate): Mat4 {
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
      return Mat4.identity()
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
      position: { x: 0, y: 0, z: 0 },
      rotation: Quat.identity(),
      matrix: Mat4.identity()
    })
  }
  
  /**
   * Add a component to the assembly
   */
  addComponent(componentId: string, initialTransform?: Mat4): void {
    const transform = initialTransform || Mat4.identity()
    const e = transform.elements
    
    this.components.set(componentId, {
      componentId,
      position: { x: e[12], y: e[13], z: e[14] },
      rotation: Quat.identity(),
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
        
        if (comp1Solved && !comp2Solved) {
          const transform = solveMate(mate)
          const comp1Transform = this.components.get(mate.component1Id)
          
          if (comp1Transform) {
            const newMatrix = comp1Transform.matrix.multiply(transform)
            const e = newMatrix.elements
            this.components.set(mate.component2Id, {
              componentId: mate.component2Id,
              position: { x: e[12], y: e[13], z: e[14] },
              rotation: Quat.identity(),
              matrix: newMatrix
            })
            solved.add(mate.component2Id)
            changed = true
          }
        } else if (!comp1Solved && comp2Solved) {
          const transform = solveMate(mate)
          const comp2Transform = this.components.get(mate.component2Id)
          
          if (comp2Transform) {
            const inv = transform.inverse()
            if (inv) {
              const newMatrix = comp2Transform.matrix.multiply(inv)
              const e = newMatrix.elements
              this.components.set(mate.component1Id, {
                componentId: mate.component1Id,
                position: { x: e[12], y: e[13], z: e[14] },
                rotation: Quat.identity(),
                matrix: newMatrix
              })
              solved.add(mate.component1Id)
              changed = true
            }
          }
        }
      }
    }
    
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
    
    for (const [id] of this.components) {
      dofMap.set(id, 6)
    }
    
    if (this.groundedComponentId) {
      dofMap.set(this.groundedComponentId, 0)
    }
    
    for (const mate of this.mates) {
      const removedDOF = getMateRemovedDOF(mate.type)
      const current = dofMap.get(mate.component2Id) || 6
      dofMap.set(mate.component2Id, Math.max(0, current - removedDOF))
    }
    
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
  return pinionAngle * pitchRadius
}

/**
 * Lead screw solver
 */
export function solveLeadScrew(
  screwAngle: number,
  lead: number
): number {
  return (screwAngle / (2 * Math.PI)) * lead
}
