// ============================================================================
// Shell Operation
// ============================================================================

import { SolidData, Vector3, Face, PlaneSurface } from '@webcad/shared';
import { Vec3 } from '../math/vector';
import { BRepBuilder, BRepOperations, generateId } from '../geometry/brep';

export interface ShellOptions {
  thickness: number;
  facesToRemove?: string[];  // Face IDs to open
  inward?: boolean;  // Shell inward (default) or outward
}

/**
 * Shell operation - hollows out a solid
 */
export class ShellOperation {
  /**
   * Create a shelled (hollow) version of a solid
   */
  static shell(solid: SolidData, options: ShellOptions): SolidData {
    const { thickness, facesToRemove = [], inward = true } = options;
    const offsetDistance = inward ? -thickness : thickness;
    
    // Clone the original solid
    const result = BRepOperations.clone(solid);
    
    // Offset all vertices inward/outward
    const offsetVertices: Record<string, Vector3> = {};
    
    for (const [id, vertex] of Object.entries(result.vertices)) {
      // Calculate average normal at this vertex from adjacent faces
      const normal = this.calculateVertexNormal(result, id);
      
      // Offset vertex along normal
      const offset = normal.mul(offsetDistance);
      offsetVertices[id] = {
        x: vertex.point.x + offset.x,
        y: vertex.point.y + offset.y,
        z: vertex.point.z + offset.z
      };
    }
    
    // Create inner shell
    const innerBuilder = new BRepBuilder();
    const vertexMapping: Record<string, string> = {};
    
    // Add offset vertices
    for (const [id, point] of Object.entries(offsetVertices)) {
      vertexMapping[id] = innerBuilder.addVertex(point);
    }
    
    // Create inner faces (with reversed normals)
    const innerFaceIds: string[] = [];
    
    for (const [faceId, face] of Object.entries(result.faces)) {
      // Skip faces that should be removed (openings)
      if (facesToRemove.includes(faceId)) {
        continue;
      }
      
      // Create offset face with reversed orientation
      const newLoops = face.loops.map(loop => {
        const newEdges: string[] = [];
        const newOrientations: boolean[] = [];
        
        for (let i = loop.edges.length - 1; i >= 0; i--) {
          const edge = result.edges[loop.edges[i]];
          if (!edge) continue;
          
          const newStartVertex = vertexMapping[edge.endVertex];
          const newEndVertex = vertexMapping[edge.startVertex];
          
          if (newStartVertex && newEndVertex) {
            newEdges.push(innerBuilder.addEdge(newStartVertex, newEndVertex));
            newOrientations.push(!loop.orientations[i]);
          }
        }
        
        return innerBuilder.createLoop(newEdges, newOrientations, loop.isOuter);
      });
      
      // Flip the normal for inner surface
      const flippedNormal: Vector3 = {
        x: -face.normal.x,
        y: -face.normal.y,
        z: -face.normal.z
      };
      
      const newSurface: PlaneSurface = {
        id: generateId('surf'),
        type: 'plane',
        origin: face.surface.type === 'plane' ? (face.surface as PlaneSurface).origin : { x: 0, y: 0, z: 0 },
        normal: flippedNormal
      };
      
      innerFaceIds.push(innerBuilder.addFace(newSurface, newLoops));
    }
    
    // Create connecting walls for removed faces (openings)
    for (const faceId of facesToRemove) {
      const face = result.faces[faceId];
      if (!face) continue;
      
      for (const loop of face.loops) {
        if (!loop.isOuter) continue; // Only process outer loops
        
        // Create wall faces connecting outer edge to inner edge
        for (let i = 0; i < loop.edges.length; i++) {
          const edgeId = loop.edges[i];
          const edge = result.edges[edgeId];
          if (!edge) continue;
          
          // Get outer vertices
          const outerStart = result.vertices[edge.startVertex]?.point;
          const outerEnd = result.vertices[edge.endVertex]?.point;
          
          // Get inner vertices
          const innerStart = offsetVertices[edge.startVertex];
          const innerEnd = offsetVertices[edge.endVertex];
          
          if (!outerStart || !outerEnd || !innerStart || !innerEnd) continue;
          
          // Create wall quad
          const v1 = innerBuilder.addVertex(outerStart);
          const v2 = innerBuilder.addVertex(outerEnd);
          const v3 = innerBuilder.addVertex(innerEnd);
          const v4 = innerBuilder.addVertex(innerStart);
          
          const e1 = innerBuilder.addEdge(v1, v2);
          const e2 = innerBuilder.addEdge(v2, v3);
          const e3 = innerBuilder.addEdge(v3, v4);
          const e4 = innerBuilder.addEdge(v4, v1);
          
          // Calculate wall normal
          const wallDir1 = new Vec3(outerEnd.x - outerStart.x, outerEnd.y - outerStart.y, outerEnd.z - outerStart.z);
          const wallDir2 = new Vec3(innerStart.x - outerStart.x, innerStart.y - outerStart.y, innerStart.z - outerStart.z);
          const wallNormal = wallDir1.cross(wallDir2).normalize();
          
          const wallSurface: PlaneSurface = {
            id: generateId('surf'),
            type: 'plane',
            origin: outerStart,
            normal: { x: wallNormal.x, y: wallNormal.y, z: wallNormal.z }
          };
          
          const wallLoop = innerBuilder.createLoop([e1, e2, e3, e4], [true, true, true, true]);
          innerFaceIds.push(innerBuilder.addFace(wallSurface, [wallLoop]));
        }
      }
    }
    
    innerBuilder.addShell(innerFaceIds);
    const innerSolid = innerBuilder.toSolidData();
    
    // Combine outer shell (minus removed faces) with inner shell and walls
    // For simplicity, return the combined structure
    return {
      id: generateId('solid'),
      shells: [...result.shells, ...innerSolid.shells],
      vertices: { ...result.vertices, ...innerSolid.vertices },
      edges: { ...result.edges, ...innerSolid.edges },
      faces: { 
        ...Object.fromEntries(
          Object.entries(result.faces).filter(([id]) => !facesToRemove.includes(id))
        ),
        ...innerSolid.faces 
      }
    };
  }

  /**
   * Calculate the average normal at a vertex from adjacent faces
   */
  private static calculateVertexNormal(solid: SolidData, vertexId: string): Vec3 {
    const vertex = solid.vertices[vertexId];
    if (!vertex) return Vec3.unitZ();
    
    const normals: Vec3[] = [];
    
    // Find all faces that contain this vertex
    for (const face of Object.values(solid.faces)) {
      for (const loop of face.loops) {
        for (const edgeId of loop.edges) {
          const edge = solid.edges[edgeId];
          if (edge && (edge.startVertex === vertexId || edge.endVertex === vertexId)) {
            normals.push(new Vec3(face.normal.x, face.normal.y, face.normal.z));
            break;
          }
        }
      }
    }
    
    if (normals.length === 0) return Vec3.unitZ();
    
    // Average the normals
    let avg = Vec3.zero();
    for (const n of normals) {
      avg = avg.add(n);
    }
    
    return avg.normalize();
  }
}

