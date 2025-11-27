/**
 * Technical Drawing Projection System
 * Generates 2D projections from 3D models
 */

import { Vector3, Matrix4 } from '../math/vector'
import { Solid, Edge, Face } from '../geometry/brep'

export type ViewType = 
  | 'front' 
  | 'back' 
  | 'top' 
  | 'bottom' 
  | 'left' 
  | 'right' 
  | 'isometric'
  | 'dimetric'
  | 'trimetric'
  | 'custom'

export interface ProjectedEdge {
  id: string
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
  type: 'visible' | 'hidden' | 'silhouette' | 'section'
  originalEdgeId?: string
}

export interface ProjectedView {
  viewType: ViewType
  edges: ProjectedEdge[]
  boundingBox: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  scale: number
  origin: { x: number; y: number }
}

export interface SectionCut {
  plane: {
    origin: Vector3
    normal: Vector3
  }
  depth?: number
  hatchPattern?: string
  hatchAngle?: number
  hatchSpacing?: number
}

/**
 * Standard view direction matrices
 */
const VIEW_MATRICES: Record<ViewType, Matrix4> = {
  front: Matrix4.identity(),
  back: Matrix4.rotationY(Math.PI),
  top: Matrix4.rotationX(-Math.PI / 2),
  bottom: Matrix4.rotationX(Math.PI / 2),
  left: Matrix4.rotationY(-Math.PI / 2),
  right: Matrix4.rotationY(Math.PI / 2),
  isometric: createIsometricMatrix(),
  dimetric: createDimetricMatrix(),
  trimetric: createTrimetricMatrix(),
  custom: Matrix4.identity()
}

function createIsometricMatrix(): Matrix4 {
  // Standard isometric: 30° from horizontal
  const rotY = Matrix4.rotationY(Math.PI / 4) // 45°
  const rotX = Matrix4.rotationX(Math.atan(1 / Math.sqrt(2))) // ~35.264°
  return rotX.multiply(rotY)
}

function createDimetricMatrix(): Matrix4 {
  // Dimetric: two axes have equal foreshortening
  const rotY = Matrix4.rotationY(Math.PI / 6) // 30°
  const rotX = Matrix4.rotationX(Math.PI / 6) // 30°
  return rotX.multiply(rotY)
}

function createTrimetricMatrix(): Matrix4 {
  // Trimetric: all axes have different foreshortening
  const rotY = Matrix4.rotationY(Math.PI / 5) // 36°
  const rotX = Matrix4.rotationX(Math.PI / 7) // ~25.7°
  return rotX.multiply(rotY)
}

/**
 * Project a 3D point to 2D using orthographic projection
 */
function projectPoint(point: Vector3, viewMatrix: Matrix4): { x: number; y: number; z: number } {
  const transformed = viewMatrix.transformPoint(point)
  return {
    x: transformed.x,
    y: transformed.y,
    z: transformed.z // Keep z for depth sorting
  }
}

/**
 * Determine if an edge is visible from the view direction
 */
function isEdgeVisible(
  edge: Edge,
  viewDirection: Vector3,
  adjacentFaces: Face[]
): boolean {
  // An edge is visible if at least one adjacent face is front-facing
  for (const face of adjacentFaces) {
    if (face.surface) {
      // Get face normal at edge midpoint
      const normal = face.surface.normalAt(0.5, 0.5)
      const dot = normal.dot(viewDirection)
      
      if (dot < 0) {
        return true
      }
    }
  }
  return false
}

/**
 * Generate silhouette edges (edges where visibility changes)
 */
function findSilhouetteEdges(
  solid: Solid,
  viewDirection: Vector3
): Edge[] {
  const silhouettes: Edge[] = []
  
  for (const edge of solid.edges) {
    // Find adjacent faces
    const adjacentFaces = solid.faces.filter(face => 
      face.outerLoop.some(e => e === edge) ||
      face.innerLoops?.some(loop => loop.some(e => e === edge))
    )
    
    if (adjacentFaces.length === 2) {
      // Check if faces have opposite visibility
      const normals = adjacentFaces.map(face => {
        if (face.surface) {
          return face.surface.normalAt(0.5, 0.5)
        }
        return new Vector3(0, 0, 1)
      })
      
      const dots = normals.map(n => n.dot(viewDirection))
      
      // Silhouette if one face is front-facing and one is back-facing
      if ((dots[0] < 0 && dots[1] >= 0) || (dots[0] >= 0 && dots[1] < 0)) {
        silhouettes.push(edge)
      }
    }
  }
  
  return silhouettes
}

/**
 * Main projection class
 */
export class DrawingProjector {
  private viewMatrix: Matrix4
  private scale: number
  private viewDirection: Vector3
  
  constructor(viewType: ViewType = 'front', scale: number = 1, customMatrix?: Matrix4) {
    this.viewMatrix = viewType === 'custom' && customMatrix 
      ? customMatrix 
      : VIEW_MATRICES[viewType]
    this.scale = scale
    
    // Extract view direction from matrix (negative Z in view space)
    this.viewDirection = new Vector3(
      -this.viewMatrix.m20,
      -this.viewMatrix.m21,
      -this.viewMatrix.m22
    ).normalize()
  }
  
  /**
   * Project a solid to 2D
   */
  projectSolid(solid: Solid): ProjectedView {
    const projectedEdges: ProjectedEdge[] = []
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    
    // Project visible edges
    for (const edge of solid.edges) {
      // Find adjacent faces for visibility check
      const adjacentFaces = solid.faces.filter(face =>
        face.outerLoop.includes(edge) ||
        face.innerLoops?.some(loop => loop.includes(edge))
      )
      
      const visible = isEdgeVisible(edge, this.viewDirection, adjacentFaces)
      
      // Get edge endpoints
      const start = edge.startVertex.point
      const end = edge.endVertex.point
      
      const projStart = projectPoint(start, this.viewMatrix)
      const projEnd = projectPoint(end, this.viewMatrix)
      
      // Apply scale
      const scaledStart = { x: projStart.x * this.scale, y: projStart.y * this.scale }
      const scaledEnd = { x: projEnd.x * this.scale, y: projEnd.y * this.scale }
      
      // Update bounding box
      minX = Math.min(minX, scaledStart.x, scaledEnd.x)
      minY = Math.min(minY, scaledStart.y, scaledEnd.y)
      maxX = Math.max(maxX, scaledStart.x, scaledEnd.x)
      maxY = Math.max(maxY, scaledStart.y, scaledEnd.y)
      
      projectedEdges.push({
        id: `edge_${edge.id}`,
        startPoint: scaledStart,
        endPoint: scaledEnd,
        type: visible ? 'visible' : 'hidden',
        originalEdgeId: edge.id
      })
    }
    
    // Find and project silhouette edges
    const silhouettes = findSilhouetteEdges(solid, this.viewDirection)
    for (const edge of silhouettes) {
      const start = edge.startVertex.point
      const end = edge.endVertex.point
      
      const projStart = projectPoint(start, this.viewMatrix)
      const projEnd = projectPoint(end, this.viewMatrix)
      
      const scaledStart = { x: projStart.x * this.scale, y: projStart.y * this.scale }
      const scaledEnd = { x: projEnd.x * this.scale, y: projEnd.y * this.scale }
      
      projectedEdges.push({
        id: `silhouette_${edge.id}`,
        startPoint: scaledStart,
        endPoint: scaledEnd,
        type: 'silhouette',
        originalEdgeId: edge.id
      })
    }
    
    return {
      viewType: 'custom',
      edges: projectedEdges,
      boundingBox: { minX, minY, maxX, maxY },
      scale: this.scale,
      origin: { x: 0, y: 0 }
    }
  }
  
  /**
   * Generate a section view
   */
  generateSectionView(solid: Solid, section: SectionCut): ProjectedView {
    // This is a simplified section view - full implementation would
    // compute the actual intersection curves
    
    const baseView = this.projectSolid(solid)
    
    // Mark section edges
    const sectionEdges: ProjectedEdge[] = baseView.edges.map(edge => ({
      ...edge,
      type: edge.type === 'visible' ? 'section' : edge.type
    }))
    
    return {
      ...baseView,
      edges: sectionEdges
    }
  }
  
  /**
   * Generate auxiliary view from a custom direction
   */
  static createAuxiliaryView(
    lookDirection: Vector3,
    upDirection: Vector3,
    scale: number = 1
  ): DrawingProjector {
    // Create view matrix from look and up vectors
    const zAxis = lookDirection.normalize().negate()
    const xAxis = upDirection.cross(zAxis).normalize()
    const yAxis = zAxis.cross(xAxis)
    
    const viewMatrix = new Matrix4(
      xAxis.x, xAxis.y, xAxis.z, 0,
      yAxis.x, yAxis.y, yAxis.z, 0,
      zAxis.x, zAxis.y, zAxis.z, 0,
      0, 0, 0, 1
    )
    
    return new DrawingProjector('custom', scale, viewMatrix)
  }
  
  /**
   * Generate standard orthographic views
   */
  static generateStandardViews(solid: Solid, scale: number = 1): Map<ViewType, ProjectedView> {
    const views = new Map<ViewType, ProjectedView>()
    const standardViews: ViewType[] = ['front', 'top', 'right', 'isometric']
    
    for (const viewType of standardViews) {
      const projector = new DrawingProjector(viewType, scale)
      views.set(viewType, projector.projectSolid(solid))
    }
    
    return views
  }
}

/**
 * Generate hatch pattern for section views
 */
export function generateHatchLines(
  boundaryPoints: Array<{ x: number; y: number }>,
  angle: number = 45,
  spacing: number = 2
): Array<{ start: { x: number; y: number }; end: { x: number; y: number } }> {
  const lines: Array<{ start: { x: number; y: number }; end: { x: number; y: number } }> = []
  
  // Find bounding box
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity
  
  for (const p of boundaryPoints) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  
  // Generate parallel lines at angle
  const radians = angle * Math.PI / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  
  const diagonal = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2))
  const numLines = Math.ceil(diagonal / spacing) * 2
  
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  
  for (let i = -numLines / 2; i <= numLines / 2; i++) {
    const offset = i * spacing
    
    // Line perpendicular to hatch direction, offset by spacing
    const startX = centerX - diagonal * cos + offset * sin
    const startY = centerY - diagonal * sin - offset * cos
    const endX = centerX + diagonal * cos + offset * sin
    const endY = centerY + diagonal * sin - offset * cos
    
    // TODO: Clip line to boundary polygon
    lines.push({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    })
  }
  
  return lines
}

