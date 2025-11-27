/**
 * Technical Drawing Projection System
 * Generates 2D projections from 3D models
 */

import { Vector3 } from '../math/vector'
import { Mat4, Matrix4 } from '../math/matrix'
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
    origin: { x: number; y: number; z: number }
    normal: { x: number; y: number; z: number }
  }
  depth?: number
  hatchPattern?: string
  hatchAngle?: number
  hatchSpacing?: number
}

/**
 * Create view matrices for standard views
 */
function createViewMatrix(viewType: ViewType): Mat4 {
  switch (viewType) {
    case 'front':
      return Mat4.identity()
    case 'back':
      return Mat4.rotationY(Math.PI)
    case 'top':
      return Mat4.rotationX(-Math.PI / 2)
    case 'bottom':
      return Mat4.rotationX(Math.PI / 2)
    case 'left':
      return Mat4.rotationY(-Math.PI / 2)
    case 'right':
      return Mat4.rotationY(Math.PI / 2)
    case 'isometric': {
      const rotY = Mat4.rotationY(Math.PI / 4)
      const rotX = Mat4.rotationX(Math.atan(1 / Math.sqrt(2)))
      return rotX.multiply(rotY)
    }
    case 'dimetric': {
      const rotY = Mat4.rotationY(Math.PI / 6)
      const rotX = Mat4.rotationX(Math.PI / 6)
      return rotX.multiply(rotY)
    }
    case 'trimetric': {
      const rotY = Mat4.rotationY(Math.PI / 5)
      const rotX = Mat4.rotationX(Math.PI / 7)
      return rotX.multiply(rotY)
    }
    default:
      return Mat4.identity()
  }
}

/**
 * Project a 3D point to 2D using orthographic projection
 */
function projectPoint(point: { x: number; y: number; z: number }, viewMatrix: Mat4): { x: number; y: number; z: number } {
  const transformed = viewMatrix.transformPoint(point)
  return {
    x: transformed.x,
    y: transformed.y,
    z: transformed.z
  }
}

/**
 * Main projection class
 */
export class DrawingProjector {
  private viewMatrix: Mat4
  private scale: number
  private viewDirection: Vector3
  
  constructor(viewType: ViewType = 'front', scale: number = 1, customMatrix?: Mat4) {
    this.viewMatrix = viewType === 'custom' && customMatrix 
      ? customMatrix 
      : createViewMatrix(viewType)
    this.scale = scale
    
    // Extract view direction from matrix (negative Z in view space)
    const elements = this.viewMatrix.elements
    this.viewDirection = new Vector3(
      -elements[8],
      -elements[9],
      -elements[10]
    ).normalize()
  }
  
  /**
   * Project a solid to 2D
   */
  projectSolid(solid: Solid): ProjectedView {
    const projectedEdges: ProjectedEdge[] = []
    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity
    
    // Iterate over edges Map
    for (const [edgeId, edge] of solid.edges) {
      // Get vertices
      const startVertex = solid.vertices.get(edge.startVertex)
      const endVertex = solid.vertices.get(edge.endVertex)
      
      if (!startVertex || !endVertex) continue
      
      const start = startVertex.point
      const end = endVertex.point
      
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
        id: `edge_${edgeId}`,
        startPoint: scaledStart,
        endPoint: scaledEnd,
        type: 'visible',
        originalEdgeId: edgeId
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
    const baseView = this.projectSolid(solid)
    
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
    const zAxis = lookDirection.normalize().negate()
    const xAxis = new Vector3(upDirection.x, upDirection.y, upDirection.z).cross(zAxis).normalize()
    const yAxis = zAxis.cross(xAxis)
    
    const viewMatrix = new Mat4([
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      0, 0, 0, 1
    ])
    
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
  
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity
  
  for (const p of boundaryPoints) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  
  const radians = angle * Math.PI / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  
  const diagonal = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2))
  const numLines = Math.ceil(diagonal / spacing) * 2
  
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  
  for (let i = -numLines / 2; i <= numLines / 2; i++) {
    const offset = i * spacing
    
    const startX = centerX - diagonal * cos + offset * sin
    const startY = centerY - diagonal * sin - offset * cos
    const endX = centerX + diagonal * cos + offset * sin
    const endY = centerY + diagonal * sin - offset * cos
    
    lines.push({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    })
  }
  
  return lines
}
