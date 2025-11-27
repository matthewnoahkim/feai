/**
 * Draft Analysis Tools
 * Analyzes faces for draft angles relative to a pull direction
 */

import { Vector3, Vec3 } from '../math/vector'
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
  averageNormal: { x: number; y: number; z: number }
}

export interface DraftAnalysisReport {
  pullDirection: { x: number; y: number; z: number }
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
  pullDirection: Vec3,
  sampleCount: number = 9
): DraftAnalysisResult {
  const normalizedPull = pullDirection.normalize()
  
  // Use face normal directly
  const faceNormal = new Vec3(face.normal.x, face.normal.y, face.normal.z)
  
  // Calculate angle from pull direction
  const dot = faceNormal.dot(normalizedPull)
  const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI
  const draftAngle = 90 - angle
  
  const PARALLEL_THRESHOLD = 5    // degrees
  const PERPENDICULAR_THRESHOLD = 5 // degrees
  
  return {
    faceId: face.id,
    draftAngle: draftAngle,
    isPositive: draftAngle > 0,
    isNegative: draftAngle < 0,
    isParallel: Math.abs(draftAngle) > 90 - PARALLEL_THRESHOLD,
    isPerpendicular: Math.abs(draftAngle) < PERPENDICULAR_THRESHOLD,
    minAngle: draftAngle,
    maxAngle: draftAngle,
    averageNormal: { x: faceNormal.x, y: faceNormal.y, z: faceNormal.z }
  }
}

/**
 * Perform draft analysis on a solid
 */
export function analyzeDraft(
  solid: Solid,
  pullDirection: { x: number; y: number; z: number },
  requiredDraftAngle: number = 1
): DraftAnalysisReport {
  const faces: DraftAnalysisResult[] = []
  const pullVec = new Vec3(pullDirection.x, pullDirection.y, pullDirection.z)
  
  // Iterate over faces Map
  for (const [faceId, face] of solid.faces) {
    faces.push(analyzeFace(face, pullVec))
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
  
  const normalizedPull = pullVec.normalize()
  
  return {
    pullDirection: { x: normalizedPull.x, y: normalizedPull.y, z: normalizedPull.z },
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
  if (result.isParallel) {
    return { r: 0.5, g: 0.5, b: 0.5 }
  }
  
  if (result.isPerpendicular) {
    return { r: 0.2, g: 0.4, b: 0.8 }
  }
  
  if (result.isNegative) {
    const intensity = Math.min(1, Math.abs(result.draftAngle) / 10)
    return { r: 0.8 + 0.2 * intensity, g: 0.2 * (1 - intensity), b: 0.2 * (1 - intensity) }
  }
  
  if (result.draftAngle < requiredDraftAngle) {
    const ratio = result.draftAngle / requiredDraftAngle
    return { r: 1, g: 0.8, b: 0.2 * ratio }
  }
  
  const greenIntensity = Math.min(1, result.draftAngle / 10)
  return { r: 0.2 * (1 - greenIntensity), g: 0.6 + 0.4 * greenIntensity, b: 0.2 }
}

/**
 * Calculate optimal pull direction for minimum undercuts
 */
export function findOptimalPullDirection(
  solid: Solid,
  candidateDirections?: Array<{ x: number; y: number; z: number }>
): { direction: { x: number; y: number; z: number }; score: number }[] {
  const candidates = candidateDirections || [
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 }
  ]
  
  const results: { direction: { x: number; y: number; z: number }; score: number }[] = []
  
  for (const direction of candidates) {
    const analysis = analyzeDraft(solid, direction)
    
    let score = 100
    score -= analysis.summary.negativeDraftFaces * 20
    score -= analysis.summary.insufficientDraftFaces * 5
    
    const avgDraft = analysis.faces.reduce((sum, f) => sum + f.draftAngle, 0) / (analysis.faces.length || 1)
    score += avgDraft * 2
    
    results.push({ direction, score })
  }
  
  results.sort((a, b) => b.score - a.score)
  
  return results
}
