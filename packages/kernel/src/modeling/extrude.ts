// ============================================================================
// Extrude Operation
// ============================================================================

import { 
  Sketch, SketchRegion, SolidData, Vector3, Plane, 
  PlaneSurface, BooleanOperation 
} from '@webcad/shared';
import { Vec3 } from '../math/vector';
import { BRepBuilder, generateId, SolidPrimitives } from '../geometry/brep';
import { PlaneUtils } from '../geometry/surface';
import { SketchUtils } from '../sketch/entities';

export interface ExtrudeOptions {
  depth: number;
  direction?: Vector3;
  draftAngle?: number;
  draftInward?: boolean;
  symmetric?: boolean;
  operation?: BooleanOperation;
}

export class ExtrudeOperation {
  /**
   * Extrude a sketch region to create a solid
   */
  static extrude(
    sketch: Sketch,
    region: SketchRegion,
    options: ExtrudeOptions
  ): SolidData {
    const { depth, direction, draftAngle = 0, symmetric = false } = options;
    
    // Get extrusion direction (default to sketch normal)
    const extrudeDir = direction 
      ? new Vec3(direction.x, direction.y, direction.z).normalize()
      : new Vec3(sketch.plane.normal.x, sketch.plane.normal.y, sketch.plane.normal.z);
    
    // Get profile points from the region
    const profilePoints = this.getRegionPoints(sketch, region);
    if (profilePoints.length < 3) {
      throw new Error('Region must have at least 3 points');
    }
    
    const actualDepth = symmetric ? depth / 2 : depth;
    const startOffset = symmetric ? -actualDepth : 0;
    
    // Build the extruded solid
    const builder = new BRepBuilder();
    
    // Transform 2D profile points to 3D
    const bottomPoints: Vector3[] = [];
    const topPoints: Vector3[] = [];
    
    for (const p2d of profilePoints) {
      // Convert 2D sketch point to 3D
      const p3d = PlaneUtils.to3D(sketch.plane, p2d.x, p2d.y);
      
      // Apply start offset
      const bottom = p3d.add(extrudeDir.mul(startOffset));
      bottomPoints.push({ x: bottom.x, y: bottom.y, z: bottom.z });
      
      // Apply draft angle if specified
      let top: Vec3;
      if (draftAngle !== 0) {
        // Calculate draft offset
        const center = this.getRegionCenter(profilePoints);
        const toPoint = new Vec3(p2d.x - center.x, p2d.y - center.y, 0);
        const draftOffset = Math.tan(draftAngle) * actualDepth;
        const offsetDir = options.draftInward ? toPoint.negate() : toPoint;
        const offset2d = offsetDir.normalize().mul(draftOffset);
        
        const topP2d = { x: p2d.x + offset2d.x, y: p2d.y + offset2d.y };
        const topP3d = PlaneUtils.to3D(sketch.plane, topP2d.x, topP2d.y);
        top = topP3d.add(extrudeDir.mul(startOffset + actualDepth));
      } else {
        top = p3d.add(extrudeDir.mul(startOffset + actualDepth));
      }
      topPoints.push({ x: top.x, y: top.y, z: top.z });
    }
    
    // Create vertices
    const bottomVertexIds: string[] = [];
    const topVertexIds: string[] = [];
    
    for (let i = 0; i < bottomPoints.length; i++) {
      bottomVertexIds.push(builder.addVertex(bottomPoints[i]));
      topVertexIds.push(builder.addVertex(topPoints[i]));
    }
    
    // Create edges
    const bottomEdgeIds: string[] = [];
    const topEdgeIds: string[] = [];
    const sideEdgeIds: string[] = [];
    
    for (let i = 0; i < profilePoints.length; i++) {
      const next = (i + 1) % profilePoints.length;
      bottomEdgeIds.push(builder.addEdge(bottomVertexIds[i], bottomVertexIds[next]));
      topEdgeIds.push(builder.addEdge(topVertexIds[i], topVertexIds[next]));
      sideEdgeIds.push(builder.addEdge(bottomVertexIds[i], topVertexIds[i]));
    }
    
    // Create faces
    const faceIds: string[] = [];
    
    // Bottom face
    const bottomNormal = extrudeDir.negate();
    const bottomSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: bottomPoints[0],
      normal: { x: bottomNormal.x, y: bottomNormal.y, z: bottomNormal.z }
    };
    const bottomLoop = builder.createLoop(
      bottomEdgeIds,
      bottomEdgeIds.map(() => false)
    );
    faceIds.push(builder.addFace(bottomSurface, [bottomLoop]));
    
    // Top face
    const topSurface: PlaneSurface = {
      id: generateId('surf'),
      type: 'plane',
      origin: topPoints[0],
      normal: { x: extrudeDir.x, y: extrudeDir.y, z: extrudeDir.z }
    };
    const topLoop = builder.createLoop(
      topEdgeIds,
      topEdgeIds.map(() => true)
    );
    faceIds.push(builder.addFace(topSurface, [topLoop]));
    
    // Side faces
    for (let i = 0; i < profilePoints.length; i++) {
      const next = (i + 1) % profilePoints.length;
      
      // Calculate face normal (cross product of edges)
      const b1 = bottomPoints[i];
      const b2 = bottomPoints[next];
      const t1 = topPoints[i];
      
      const edge1 = new Vec3(b2.x - b1.x, b2.y - b1.y, b2.z - b1.z);
      const edge2 = new Vec3(t1.x - b1.x, t1.y - b1.y, t1.z - b1.z);
      const normal = edge1.cross(edge2).normalize();
      
      const sideSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: b1,
        normal: { x: normal.x, y: normal.y, z: normal.z }
      };
      
      const sideLoop = builder.createLoop(
        [bottomEdgeIds[i], sideEdgeIds[next], topEdgeIds[i], sideEdgeIds[i]],
        [true, true, false, false]
      );
      faceIds.push(builder.addFace(sideSurface, [sideLoop]));
    }
    
    // Create shell
    builder.addShell(faceIds);
    
    return builder.toSolidData();
  }

  /**
   * Get 2D points from a sketch region
   */
  private static getRegionPoints(sketch: Sketch, region: SketchRegion): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const visitedPoints = new Set<string>();
    
    for (const edgeId of region.outerLoop) {
      const entity = sketch.entities[edgeId];
      if (!entity) continue;
      
      if (entity.type === 'line') {
        const line = entity as any;
        const startPoint = sketch.entities[line.startPoint] as any;
        
        if (startPoint && !visitedPoints.has(line.startPoint)) {
          visitedPoints.add(line.startPoint);
          points.push({ x: startPoint.x, y: startPoint.y });
        }
      }
    }
    
    return points;
  }

  /**
   * Get center of region points
   */
  private static getRegionCenter(points: { x: number; y: number }[]): { x: number; y: number } {
    let cx = 0, cy = 0;
    for (const p of points) {
      cx += p.x;
      cy += p.y;
    }
    return { x: cx / points.length, y: cy / points.length };
  }

  /**
   * Create a simple extruded box from parameters (convenience method)
   */
  static createExtrudedRectangle(
    width: number,
    height: number,
    depth: number,
    center?: Vector3
  ): SolidData {
    return SolidPrimitives.createBox(width, height, depth, center);
  }

  /**
   * Create an extruded circle (cylinder)
   */
  static createExtrudedCircle(
    radius: number,
    depth: number,
    center?: Vector3,
    segments: number = 32
  ): SolidData {
    return SolidPrimitives.createCylinder(radius, depth, center, segments);
  }
}

