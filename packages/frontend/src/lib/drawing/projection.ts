/**
 * 2D drawing-view projection — the math behind the Drawings phase.
 *
 * This app's plane conventions are Z-up (createSketch's 'top-plane' normal is [0,0,1],
 * 'front-plane' is [0,1,0], 'right-plane' is [1,0,0] — see resolveMirrorPlane in
 * documentStore.ts), so views are defined the same way: Top looks down -Z, Front looks
 * down -Y, Right looks down -X. There's no claim these match a specific first-angle/
 * third-angle drafting standard — just that they're internally consistent with the rest
 * of the app's own plane choices.
 *
 * Deliberately NOT doing hidden-line removal: every edge (front-facing or occluded)
 * projects and draws the same way, the way a simple wireframe/"see-through" drawing
 * mode does. Real hidden-line removal needs visibility analysis against every face,
 * which is a substantially bigger feature than this pass — see DrawingSheetDialog's
 * own note to the same effect.
 */

export type ViewDirection = 'front' | 'top' | 'right' | 'iso'

export interface Point2 {
  x: number
  y: number
}

export interface ProjectedEdge {
  edgeId: string
  points: Point2[]
}

const SIN30 = Math.sin(Math.PI / 6)
const COS30 = Math.cos(Math.PI / 6)

/** Projects one 3D point (world space) into a view's own 2D drawing-space coordinates. */
export function projectPoint(x: number, y: number, z: number, direction: ViewDirection): Point2 {
  switch (direction) {
    case 'top':
      return { x, y }
    case 'front':
      return { x, y: z }
    case 'right':
      return { x: y, y: z }
    case 'iso':
      // Standard Z-up isometric: X/Y axes each appear at 30° from horizontal, Z vertical.
      return { x: (x - y) * COS30, y: z - (x + y) * SIN30 }
  }
}

/** Projects a set of real B-rep edge polylines (flat xyz triplets, world space — the
 * same shape as Part.edges) into one view's 2D drawing space. Point count per edge is
 * preserved 1:1 so a projected polyline can still be drawn as a simple SVG <polyline>. */
export function projectEdgesToView(
  edges: Array<{ edgeId: string; points: number[] }>,
  direction: ViewDirection
): ProjectedEdge[] {
  return edges.map(({ edgeId, points }) => {
    const projected: Point2[] = []
    for (let i = 0; i + 2 < points.length; i += 3) {
      projected.push(projectPoint(points[i], points[i + 1], points[i + 2], direction))
    }
    return { edgeId, points: projected }
  })
}

export interface ViewBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/** Bounding box of a projected view's own 2D points, for auto-fitting it on a sheet. */
export function computeViewBounds(edges: ProjectedEdge[]): ViewBounds | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const edge of edges) {
    for (const p of edge.points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null
  return { minX, minY, maxX, maxY }
}
