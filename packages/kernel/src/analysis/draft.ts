/**
 * Draft Analysis Tools
 * Analyzes faces for draft angles relative to a pull direction
 */

import { Vector3 } from '../math/vector'
import { Face, Solid } from '../geometry/brep'

export interface DraftAnalysisResult {
  faceId: string
  draftAngle: number       // Degrees
  isPositive: boolean      // Positive draft (away from pull)
  isNegative: boolean      // Negative draft (undercut)
  isParallel: boolean      // Parallel to pull direction
  isPerpendicular: boolean // Perpendicular to pull direction
  minAngle: number
  maxAngle: number
  averageNormal: Vector3
}

export interface DraftAnalysisReport {
  pullDirection: Vector3
  requiredDraftAngle: number
  faces: DraftAnalysisResult[]
  summary: {
    totalFaces: number
    positiveDraftFaces: number
    negativeDraftFaces: number
    parallelFaces: number
    perpendicularFaces: number
    insufficientDraftFaces: number
  }
}

/**
 * Analyze draft angle of a single face
 */
function analyzeFace(
  face: Face,
  pullDirection: Vector3,
  sampleCount: number = 9
): DraftAnalysisResult {
  const normalizedPull = pullDirection.normalize()
  let minAngle = 180
  let maxAngle = -180
  let sumNormal = new Vector3(0, 0, 0)
  let samplesTaken = 0
  
  // Sample face at grid points
  const gridSize = Math.ceil(Math.sqrt(sampleCount))
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const u = (i + 0.5) / gridSize
      const v = (j + 0.5) / gridSize
      
      if (face.surface) {
        const normal = face.surface.normalAt(u, v)
        sumNormal = sumNormal.add(normal)
        samplesTaken++
        
        // Calculate angle from pull direction
        const dot = normal.dot(normalizedPull)
        const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI
        const draftAngle = 90 - angle
        
        minAngle = Math.min(minAngle, draftAngle)
        maxAngle = Math.max(maxAngle, draftAngle)
      }
    }
  }
  
  const averageNormal = samplesTaken > 0 
    ? sumNormal.scale(1 / samplesTaken).normalize()
    : new Vector3(0, 0, 1)
  
  const avgDot = averageNormal.dot(normalizedPull)
  const avgAngle = Math.acos(Math.max(-1, Math.min(1, avgDot))) * 180 / Math.PI
  const avgDraftAngle = 90 - avgAngle
  
  const PARALLEL_THRESHOLD = 5    // degrees
  const PERPENDICULAR_THRESHOLD = 5 // degrees
  
  return {
    faceId: face.id,
    draftAngle: avgDraftAngle,
    isPositive: avgDraftAngle > 0,
    isNegative: avgDraftAngle < 0,
    isParallel: Math.abs(avgDraftAngle) > 90 - PARALLEL_THRESHOLD,
    isPerpendicular: Math.abs(avgDraftAngle) < PERPENDICULAR_THRESHOLD,
    minAngle,
    maxAngle,
    averageNormal
  }
}

/**
 * Perform draft analysis on a solid
 */
export function analyzeDraft(
  solid: Solid,
  pullDirection: Vector3,
  requiredDraftAngle: number = 1
): DraftAnalysisReport {
  const faces: DraftAnalysisResult[] = []
  
  for (const face of solid.faces) {
    faces.push(analyzeFace(face, pullDirection))
  }
  
  // Calculate summary
  const summary = {
    totalFaces: faces.length,
    positiveDraftFaces: faces.filter(f => f.isPositive && !f.isParallel).length,
    negativeDraftFaces: faces.filter(f => f.isNegative && !f.isParallel).length,
    parallelFaces: faces.filter(f => f.isParallel).length,
    perpendicularFaces: faces.filter(f => f.isPerpendicular).length,
    insufficientDraftFaces: faces.filter(f => 
      !f.isParallel && !f.isPerpendicular && Math.abs(f.draftAngle) < requiredDraftAngle
    ).length
  }
  
  return {
    pullDirection: pullDirection.normalize(),
    requiredDraftAngle,
    faces,
    summary
  }
}

/**
 * Generate color map for draft visualization
 */
export function getDraftColorMap(
  result: DraftAnalysisResult,
  requiredDraftAngle: number
): { r: number; g: number; b: number } {
  // Color scheme:
  // - Green: sufficient positive draft
  // - Yellow: insufficient draft
  // - Red: negative draft (undercut)
  // - Blue: perpendicular to pull
  // - Gray: parallel to pull
  
  if (result.isParallel) {
    return { r: 0.5, g: 0.5, b: 0.5 }
  }
  
  if (result.isPerpendicular) {
    return { r: 0.2, g: 0.4, b: 0.8 }
  }
  
  if (result.isNegative) {
    // Red for undercuts - intensity based on angle
    const intensity = Math.min(1, Math.abs(result.draftAngle) / 10)
    return { r: 0.8 + 0.2 * intensity, g: 0.2 * (1 - intensity), b: 0.2 * (1 - intensity) }
  }
  
  if (result.draftAngle < requiredDraftAngle) {
    // Yellow for insufficient draft
    const ratio = result.draftAngle / requiredDraftAngle
    return { r: 1, g: 0.8, b: 0.2 * ratio }
  }
  
  // Green for good draft - darker for larger angles
  const greenIntensity = Math.min(1, result.draftAngle / 10)
  return { r: 0.2 * (1 - greenIntensity), g: 0.6 + 0.4 * greenIntensity, b: 0.2 }
}

/**
 * Calculate optimal pull direction for minimum undercuts
 */
export function findOptimalPullDirection(
  solid: Solid,
  candidateDirections?: Vector3[]
): { direction: Vector3; score: number }[] {
  // Default candidate directions (along principal axes)
  const candidates = candidateDirections || [
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0),
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0)
  ]
  
  const results: { direction: Vector3; score: number }[] = []
  
  for (const direction of candidates) {
    const analysis = analyzeDraft(solid, direction)
    
    // Score based on:
    // - Fewer undercuts is better (negative weight)
    // - More perpendicular faces is neutral
    // - Larger average draft is better
    
    let score = 100
    score -= analysis.summary.negativeDraftFaces * 20
    score -= analysis.summary.insufficientDraftFaces * 5
    
    // Average draft angle bonus
    const avgDraft = analysis.faces.reduce((sum, f) => sum + f.draftAngle, 0) / analysis.faces.length
    score += avgDraft * 2
    
    results.push({ direction, score })
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score)
  
  return results
}

