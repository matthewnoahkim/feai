// ============================================================================
// Sketch Region Detection
// ============================================================================

import { Sketch, SketchRegion, SketchLine, SketchArc, SketchCircle, Vector2 } from '@feai/shared';
import { Vec2 } from '../math/vector';
import { generateId } from '../geometry/brep';

// ============================================================================
// Region Detection
// ============================================================================

export class RegionDetector {
  /**
   * Find all closed regions in a sketch
   */
  static findRegions(sketch: Sketch): SketchRegion[] {
    const regions: SketchRegion[] = [];
    
    // Build graph of connected points
    const graph = this.buildGraph(sketch);
    
    // Find all simple cycles (closed loops)
    const cycles = this.findCycles(graph, sketch);
    
    // Convert cycles to regions
    for (const cycle of cycles) {
      const region = this.cycleToRegion(cycle, sketch);
      if (region) {
        regions.push(region);
      }
    }
    
    // Determine nesting (which regions are holes in which)
    this.determineNesting(regions, sketch);
    
    return regions;
  }

  /**
   * Build adjacency graph from sketch entities
   */
  private static buildGraph(sketch: Sketch): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    
    // Initialize nodes for all points
    for (const entity of Object.values(sketch.entities)) {
      if (entity.type === 'point') {
        graph.set(entity.id, new Set());
      }
    }
    
    // Add edges from lines and arcs
    for (const entity of Object.values(sketch.entities)) {
      if (entity.type === 'line') {
        const line = entity as SketchLine;
        graph.get(line.startPoint)?.add(line.endPoint);
        graph.get(line.endPoint)?.add(line.startPoint);
      } else if (entity.type === 'arc') {
        const arc = entity as SketchArc;
        graph.get(arc.startPoint)?.add(arc.endPoint);
        graph.get(arc.endPoint)?.add(arc.startPoint);
      }
    }
    
    return graph;
  }

  /**
   * Find all simple cycles in the graph using DFS
   */
  private static findCycles(
    graph: Map<string, Set<string>>,
    sketch: Sketch
  ): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack: string[] = [];
    const parent = new Map<string, string | null>();
    
    // Simplified cycle detection - find all minimal cycles
    for (const startNode of graph.keys()) {
      if (visited.has(startNode)) continue;
      
      this.dfs(startNode, graph, visited, stack, parent, cycles, sketch);
    }
    
    // Filter to unique cycles
    return this.filterUniqueCycles(cycles);
  }

  /**
   * DFS to find cycles
   */
  private static dfs(
    node: string,
    graph: Map<string, Set<string>>,
    visited: Set<string>,
    stack: string[],
    parent: Map<string, string | null>,
    cycles: string[][],
    sketch: Sketch
  ): void {
    visited.add(node);
    stack.push(node);
    
    const neighbors = graph.get(node) || new Set();
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        parent.set(neighbor, node);
        this.dfs(neighbor, graph, visited, stack, parent, cycles, sketch);
      } else if (stack.includes(neighbor) && parent.get(node) !== neighbor) {
        // Found a cycle
        const cycleStart = stack.indexOf(neighbor);
        if (cycleStart >= 0) {
          const cycle = stack.slice(cycleStart);
          if (cycle.length >= 3) {
            cycles.push([...cycle]);
          }
        }
      }
    }
    
    stack.pop();
  }

  /**
   * Filter to unique cycles (remove duplicates that are just different starting points)
   */
  private static filterUniqueCycles(cycles: string[][]): string[][] {
    const unique: string[][] = [];
    const seen = new Set<string>();
    
    for (const cycle of cycles) {
      // Normalize cycle: start from smallest ID, try both directions
      const normalized = this.normalizeCycle(cycle);
      const key = normalized.join(',');
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(cycle);
      }
    }
    
    return unique;
  }

  /**
   * Normalize a cycle to canonical form
   */
  private static normalizeCycle(cycle: string[]): string[] {
    if (cycle.length === 0) return cycle;
    
    // Find minimum element
    let minIdx = 0;
    for (let i = 1; i < cycle.length; i++) {
      if (cycle[i] < cycle[minIdx]) {
        minIdx = i;
      }
    }
    
    // Rotate to start from minimum
    const rotated = [...cycle.slice(minIdx), ...cycle.slice(0, minIdx)];
    
    // Try reverse and take lexicographically smaller
    const reversed = [rotated[0], ...rotated.slice(1).reverse()];
    
    return rotated.join('') < reversed.join('') ? rotated : reversed;
  }

  /**
   * Convert a cycle of point IDs to a SketchRegion
   */
  private static cycleToRegion(cycle: string[], sketch: Sketch): SketchRegion | null {
    if (cycle.length < 3) return null;
    
    // Find edges that connect the points in the cycle
    const edges: string[] = [];
    
    for (let i = 0; i < cycle.length; i++) {
      const p1 = cycle[i];
      const p2 = cycle[(i + 1) % cycle.length];
      
      // Find edge connecting p1 and p2
      const edgeId = this.findEdge(sketch, p1, p2);
      if (edgeId) {
        edges.push(edgeId);
      }
    }
    
    if (edges.length !== cycle.length) {
      return null; // Not all edges found
    }
    
    // Calculate area using shoelace formula
    const area = this.calculateArea(cycle, sketch);
    
    return {
      id: generateId('region'),
      outerLoop: edges,
      innerLoops: [],
      area: Math.abs(area)
    };
  }

  /**
   * Find edge connecting two points
   */
  private static findEdge(sketch: Sketch, p1: string, p2: string): string | null {
    for (const entity of Object.values(sketch.entities)) {
      if (entity.type === 'line') {
        const line = entity as SketchLine;
        if ((line.startPoint === p1 && line.endPoint === p2) ||
            (line.startPoint === p2 && line.endPoint === p1)) {
          return entity.id;
        }
      } else if (entity.type === 'arc') {
        const arc = entity as SketchArc;
        if ((arc.startPoint === p1 && arc.endPoint === p2) ||
            (arc.startPoint === p2 && arc.endPoint === p1)) {
          return entity.id;
        }
      }
    }
    return null;
  }

  /**
   * Calculate signed area of a polygon
   */
  private static calculateArea(pointIds: string[], sketch: Sketch): number {
    let area = 0;
    
    for (let i = 0; i < pointIds.length; i++) {
      const p1 = sketch.entities[pointIds[i]] as any;
      const p2 = sketch.entities[pointIds[(i + 1) % pointIds.length]] as any;
      
      if (p1 && p2 && p1.x !== undefined && p2.x !== undefined) {
        area += (p2.x - p1.x) * (p2.y + p1.y);
      }
    }
    
    return area / 2;
  }

  /**
   * Determine which regions are holes inside other regions
   */
  private static determineNesting(regions: SketchRegion[], sketch: Sketch): void {
    // Sort regions by area (largest first)
    regions.sort((a, b) => b.area - a.area);
    
    // Check containment
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        if (this.regionContains(regions[i], regions[j], sketch)) {
          // Region j is inside region i
          regions[i].innerLoops.push(regions[j].outerLoop);
        }
      }
    }
  }

  /**
   * Check if one region contains another
   */
  private static regionContains(outer: SketchRegion, inner: SketchRegion, sketch: Sketch): boolean {
    // Get a point from inner region
    if (inner.outerLoop.length === 0) return false;
    
    const firstEdge = sketch.entities[inner.outerLoop[0]];
    if (!firstEdge) return false;
    
    let testPoint: Vector2 | null = null;
    
    if (firstEdge.type === 'line') {
      const line = firstEdge as SketchLine;
      const start = sketch.entities[line.startPoint] as any;
      if (start && start.x !== undefined) {
        testPoint = { x: start.x, y: start.y };
      }
    }
    
    if (!testPoint) return false;
    
    // Use ray casting to check if point is inside outer region
    return this.pointInRegion(testPoint, outer, sketch);
  }

  /**
   * Check if a point is inside a region using ray casting
   */
  private static pointInRegion(point: Vector2, region: SketchRegion, sketch: Sketch): boolean {
    let intersections = 0;
    
    // Cast ray in +X direction
    for (const edgeId of region.outerLoop) {
      const entity = sketch.entities[edgeId];
      if (!entity) continue;
      
      if (entity.type === 'line') {
        const line = entity as SketchLine;
        const start = sketch.entities[line.startPoint] as any;
        const end = sketch.entities[line.endPoint] as any;
        
        if (start && end && this.rayIntersectsSegment(point, start, end)) {
          intersections++;
        }
      }
    }
    
    return intersections % 2 === 1;
  }

  /**
   * Check if a horizontal ray from point intersects a line segment
   */
  private static rayIntersectsSegment(point: Vector2, start: Vector2, end: Vector2): boolean {
    // Ray goes from point in +X direction
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    
    // Check if point's Y is within segment's Y range
    if (point.y < minY || point.y > maxY) {
      return false;
    }
    
    // Handle horizontal segments
    if (Math.abs(end.y - start.y) < 1e-10) {
      return false;
    }
    
    // Find X coordinate of intersection
    const t = (point.y - start.y) / (end.y - start.y);
    const intersectX = start.x + t * (end.x - start.x);
    
    return intersectX > point.x;
  }
}

// ============================================================================
// Region Utilities
// ============================================================================

export class RegionUtils {
  /**
   * Get the centroid of a region
   */
  static getCentroid(region: SketchRegion, sketch: Sketch): Vector2 | null {
    const points: Vector2[] = [];
    
    for (const edgeId of region.outerLoop) {
      const entity = sketch.entities[edgeId];
      if (!entity) continue;
      
      if (entity.type === 'line') {
        const line = entity as SketchLine;
        const start = sketch.entities[line.startPoint] as any;
        if (start && start.x !== undefined) {
          points.push({ x: start.x, y: start.y });
        }
      }
    }
    
    if (points.length === 0) return null;
    
    let cx = 0, cy = 0;
    for (const p of points) {
      cx += p.x;
      cy += p.y;
    }
    
    return { x: cx / points.length, y: cy / points.length };
  }

  /**
   * Get the perimeter of a region
   */
  static getPerimeter(region: SketchRegion, sketch: Sketch): number {
    let perimeter = 0;
    
    for (const edgeId of region.outerLoop) {
      const entity = sketch.entities[edgeId];
      if (!entity) continue;
      
      if (entity.type === 'line') {
        const line = entity as SketchLine;
        const start = sketch.entities[line.startPoint] as any;
        const end = sketch.entities[line.endPoint] as any;
        
        if (start && end) {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          perimeter += Math.sqrt(dx * dx + dy * dy);
        }
      } else if (entity.type === 'arc') {
        const arc = entity as SketchArc;
        const deltaAngle = Math.abs(arc.endAngle - arc.startAngle);
        perimeter += arc.radius * deltaAngle;
      } else if (entity.type === 'circle') {
        const circle = entity as SketchCircle;
        perimeter += 2 * Math.PI * circle.radius;
      }
    }
    
    return perimeter;
  }
}

