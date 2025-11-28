/**
 * FEA Mesh Generator
 * Generates tetrahedral meshes from CAD geometry
 */

import {
  FEAMesh,
  FEANode,
  FEAElement,
  FEANodeSet,
  FEAElementSet,
  FEASurface,
  MeshSettings,
  MeshQuality,
  FEAElementType,
} from '@feai/shared';
import { Vector3 } from '../math/vector';

interface MeshBoundingBox {
  min: Vector3;
  max: Vector3;
}

interface TriangleFace {
  vertices: [Vector3, Vector3, Vector3];
  normal: Vector3;
}

/**
 * Simple tetrahedral mesh generator
 * For MVP, we'll generate a regular tetrahedral mesh that fills the bounding box
 * A production implementation would use Gmsh, Netgen, or TetGen
 */
export class MeshGenerator {
  private nodes: FEANode[] = [];
  private elements: FEAElement[] = [];
  private nodeSets: Map<string, Set<number>> = new Map();
  private elementSets: Map<string, Set<number>> = new Map();
  private surfaces: Map<string, { elementId: number; faceNumber: number }[]> = new Map();
  private nodeIdCounter = 1;
  private elementIdCounter = 1;
  private nodeIndexMap: Map<string, number> = new Map();

  /**
   * Generate a tetrahedral mesh for the given geometry
   * @param vertices - Array of vertex positions [x, y, z, x, y, z, ...]
   * @param indices - Triangle indices
   * @param settings - Mesh generation settings
   */
  generateMesh(
    vertices: number[],
    indices: number[],
    settings: MeshSettings
  ): FEAMesh {
    this.reset();

    // Calculate bounding box
    const bbox = this.calculateBoundingBox(vertices);

    // Expand bbox slightly for margin
    const margin = settings.globalSize * 0.5;
    bbox.min = new Vector3(
      bbox.min.x - margin,
      bbox.min.y - margin,
      bbox.min.z - margin
    );
    bbox.max = new Vector3(
      bbox.max.x + margin,
      bbox.max.y + margin,
      bbox.max.z + margin
    );

    // Generate regular grid of nodes
    const size = settings.globalSize;
    const nx = Math.max(2, Math.ceil((bbox.max.x - bbox.min.x) / size) + 1);
    const ny = Math.max(2, Math.ceil((bbox.max.y - bbox.min.y) / size) + 1);
    const nz = Math.max(2, Math.ceil((bbox.max.z - bbox.min.z) / size) + 1);

    const dx = (bbox.max.x - bbox.min.x) / (nx - 1);
    const dy = (bbox.max.y - bbox.min.y) / (ny - 1);
    const dz = (bbox.max.z - bbox.min.z) / (nz - 1);

    // Create node grid
    const nodeGrid: number[][][] = [];
    for (let k = 0; k < nz; k++) {
      nodeGrid[k] = [];
      for (let j = 0; j < ny; j++) {
        nodeGrid[k][j] = [];
        for (let i = 0; i < nx; i++) {
          const x = bbox.min.x + i * dx;
          const y = bbox.min.y + j * dy;
          const z = bbox.min.z + k * dz;

          // Check if node is inside the geometry
          const inside = this.isInsideMesh(
            new Vector3(x, y, z),
            vertices,
            indices
          );

          if (inside) {
            const nodeId = this.addNode(x, y, z);
            nodeGrid[k][j][i] = nodeId;
          } else {
            nodeGrid[k][j][i] = -1;
          }
        }
      }
    }

    // Generate tetrahedral elements from hex cells
    // Each hex cell is split into 6 tetrahedra
    for (let k = 0; k < nz - 1; k++) {
      for (let j = 0; j < ny - 1; j++) {
        for (let i = 0; i < nx - 1; i++) {
          // Get 8 corner nodes of hex cell
          const n000 = nodeGrid[k][j][i];
          const n100 = nodeGrid[k][j][i + 1];
          const n010 = nodeGrid[k][j + 1][i];
          const n110 = nodeGrid[k][j + 1][i + 1];
          const n001 = nodeGrid[k + 1][j][i];
          const n101 = nodeGrid[k + 1][j][i + 1];
          const n011 = nodeGrid[k + 1][j + 1][i];
          const n111 = nodeGrid[k + 1][j + 1][i + 1];

          // Only create tets if all 8 nodes exist
          if (
            n000 > 0 && n100 > 0 && n010 > 0 && n110 > 0 &&
            n001 > 0 && n101 > 0 && n011 > 0 && n111 > 0
          ) {
            // Split hex into 6 tetrahedra (Kuhn triangulation)
            this.addTetrahedron(settings.elementType, n000, n100, n010, n001);
            this.addTetrahedron(settings.elementType, n100, n110, n010, n111);
            this.addTetrahedron(settings.elementType, n010, n111, n011, n001);
            this.addTetrahedron(settings.elementType, n100, n101, n001, n111);
            this.addTetrahedron(settings.elementType, n001, n111, n011, n010);
            this.addTetrahedron(settings.elementType, n001, n100, n111, n010);
          }
        }
      }
    }

    // If no elements were created, fall back to a simple box mesh
    if (this.elements.length === 0) {
      this.generateSimpleBoxMesh(vertices, indices, settings);
    }

    // Create boundary node sets
    this.createBoundaryNodeSets(bbox);

    // Create default element set for all elements
    const allElements = new Set(this.elements.map((e) => e.id));
    this.elementSets.set('Eall', allElements);

    // Calculate mesh quality
    const quality = this.calculateMeshQuality();

    return {
      nodes: this.nodes,
      elements: this.elements,
      nodeSets: Array.from(this.nodeSets.entries()).map(([name, ids]) => ({
        name,
        nodeIds: Array.from(ids),
      })),
      elementSets: Array.from(this.elementSets.entries()).map(([name, ids]) => ({
        name,
        elementIds: Array.from(ids),
      })),
      surfaces: Array.from(this.surfaces.entries()).map(([name, elems]) => ({
        name,
        elements: elems,
      })),
      nodeCount: this.nodes.length,
      elementCount: this.elements.length,
      elementType: settings.elementType,
      boundingBox: {
        min: bbox.min,
        max: bbox.max,
      },
      quality,
    };
  }

  /**
   * Generate a simple box mesh when geometry-based meshing fails
   */
  private generateSimpleBoxMesh(
    vertices: number[],
    indices: number[],
    settings: MeshSettings
  ): void {
    this.reset();

    const bbox = this.calculateBoundingBox(vertices);
    const size = settings.globalSize;

    // Ensure minimum dimensions
    const dimX = Math.max(bbox.max.x - bbox.min.x, size);
    const dimY = Math.max(bbox.max.y - bbox.min.y, size);
    const dimZ = Math.max(bbox.max.z - bbox.min.z, size);

    // Calculate divisions
    const nx = Math.max(2, Math.ceil(dimX / size) + 1);
    const ny = Math.max(2, Math.ceil(dimY / size) + 1);
    const nz = Math.max(2, Math.ceil(dimZ / size) + 1);

    const dx = dimX / (nx - 1);
    const dy = dimY / (ny - 1);
    const dz = dimZ / (nz - 1);

    // Create nodes
    const nodeGrid: number[][][] = [];
    for (let k = 0; k < nz; k++) {
      nodeGrid[k] = [];
      for (let j = 0; j < ny; j++) {
        nodeGrid[k][j] = [];
        for (let i = 0; i < nx; i++) {
          const x = bbox.min.x + i * dx;
          const y = bbox.min.y + j * dy;
          const z = bbox.min.z + k * dz;
          const nodeId = this.addNode(x, y, z);
          nodeGrid[k][j][i] = nodeId;
        }
      }
    }

    // Create tetrahedral elements
    for (let k = 0; k < nz - 1; k++) {
      for (let j = 0; j < ny - 1; j++) {
        for (let i = 0; i < nx - 1; i++) {
          const n000 = nodeGrid[k][j][i];
          const n100 = nodeGrid[k][j][i + 1];
          const n010 = nodeGrid[k][j + 1][i];
          const n110 = nodeGrid[k][j + 1][i + 1];
          const n001 = nodeGrid[k + 1][j][i];
          const n101 = nodeGrid[k + 1][j][i + 1];
          const n011 = nodeGrid[k + 1][j + 1][i];
          const n111 = nodeGrid[k + 1][j + 1][i + 1];

          // Split hex into 6 tetrahedra
          this.addTetrahedron(settings.elementType, n000, n100, n010, n001);
          this.addTetrahedron(settings.elementType, n100, n110, n010, n111);
          this.addTetrahedron(settings.elementType, n010, n111, n011, n001);
          this.addTetrahedron(settings.elementType, n100, n101, n001, n111);
          this.addTetrahedron(settings.elementType, n001, n111, n011, n010);
          this.addTetrahedron(settings.elementType, n001, n100, n111, n010);
        }
      }
    }
  }

  private reset(): void {
    this.nodes = [];
    this.elements = [];
    this.nodeSets.clear();
    this.elementSets.clear();
    this.surfaces.clear();
    this.nodeIdCounter = 1;
    this.elementIdCounter = 1;
    this.nodeIndexMap.clear();
  }

  private addNode(x: number, y: number, z: number): number {
    // Round coordinates for key generation
    const key = `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;

    // Check if node already exists
    const existing = this.nodeIndexMap.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const id = this.nodeIdCounter++;
    this.nodes.push({ id, x, y, z });
    this.nodeIndexMap.set(key, id);
    return id;
  }

  private addTetrahedron(type: FEAElementType, n1: number, n2: number, n3: number, n4: number): void {
    // For C3D4 elements, we just need 4 nodes
    // For C3D10 elements, we would need to add midside nodes
    if (type === 'C3D4') {
      this.elements.push({
        id: this.elementIdCounter++,
        type: 'C3D4',
        nodeIds: [n1, n2, n3, n4],
      });
    } else if (type === 'C3D10') {
      // For quadratic tets, add midside nodes
      const node1 = this.nodes.find((n) => n.id === n1)!;
      const node2 = this.nodes.find((n) => n.id === n2)!;
      const node3 = this.nodes.find((n) => n.id === n3)!;
      const node4 = this.nodes.find((n) => n.id === n4)!;

      // Add midside nodes
      const n12 = this.addNode(
        (node1.x + node2.x) / 2,
        (node1.y + node2.y) / 2,
        (node1.z + node2.z) / 2
      );
      const n23 = this.addNode(
        (node2.x + node3.x) / 2,
        (node2.y + node3.y) / 2,
        (node2.z + node3.z) / 2
      );
      const n31 = this.addNode(
        (node3.x + node1.x) / 2,
        (node3.y + node1.y) / 2,
        (node3.z + node1.z) / 2
      );
      const n14 = this.addNode(
        (node1.x + node4.x) / 2,
        (node1.y + node4.y) / 2,
        (node1.z + node4.z) / 2
      );
      const n24 = this.addNode(
        (node2.x + node4.x) / 2,
        (node2.y + node4.y) / 2,
        (node2.z + node4.z) / 2
      );
      const n34 = this.addNode(
        (node3.x + node4.x) / 2,
        (node3.y + node4.y) / 2,
        (node3.z + node4.z) / 2
      );

      this.elements.push({
        id: this.elementIdCounter++,
        type: 'C3D10',
        nodeIds: [n1, n2, n3, n4, n12, n23, n31, n14, n24, n34],
      });
    }
  }

  private calculateBoundingBox(vertices: number[]): MeshBoundingBox {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }

    return {
      min: new Vector3(minX, minY, minZ),
      max: new Vector3(maxX, maxY, maxZ),
    };
  }

  /**
   * Simple point-in-mesh test using ray casting
   */
  private isInsideMesh(
    point: Vector3,
    vertices: number[],
    indices: number[]
  ): boolean {
    // Cast ray in +X direction and count intersections
    let intersections = 0;
    const rayDir = new Vector3(1, 0, 0);

    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;

      const v0 = new Vector3(vertices[i0], vertices[i0 + 1], vertices[i0 + 2]);
      const v1 = new Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
      const v2 = new Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);

      if (this.rayIntersectsTriangle(point, rayDir, v0, v1, v2)) {
        intersections++;
      }
    }

    // Odd number of intersections = inside
    return intersections % 2 === 1;
  }

  /**
   * Möller–Trumbore ray-triangle intersection
   */
  private rayIntersectsTriangle(
    origin: Vector3,
    dir: Vector3,
    v0: Vector3,
    v1: Vector3,
    v2: Vector3
  ): boolean {
    const EPSILON = 1e-8;

    const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
    const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };

    // Cross product: dir × edge2
    const h = {
      x: dir.y * edge2.z - dir.z * edge2.y,
      y: dir.z * edge2.x - dir.x * edge2.z,
      z: dir.x * edge2.y - dir.y * edge2.x,
    };

    // Dot product: edge1 · h
    const a = edge1.x * h.x + edge1.y * h.y + edge1.z * h.z;

    if (a > -EPSILON && a < EPSILON) {
      return false; // Ray parallel to triangle
    }

    const f = 1.0 / a;
    const s = { x: origin.x - v0.x, y: origin.y - v0.y, z: origin.z - v0.z };
    const u = f * (s.x * h.x + s.y * h.y + s.z * h.z);

    if (u < 0.0 || u > 1.0) {
      return false;
    }

    // Cross product: s × edge1
    const q = {
      x: s.y * edge1.z - s.z * edge1.y,
      y: s.z * edge1.x - s.x * edge1.z,
      z: s.x * edge1.y - s.y * edge1.x,
    };

    const v = f * (dir.x * q.x + dir.y * q.y + dir.z * q.z);

    if (v < 0.0 || u + v > 1.0) {
      return false;
    }

    const t = f * (edge2.x * q.x + edge2.y * q.y + edge2.z * q.z);

    return t > EPSILON; // Ray intersection in positive direction
  }

  /**
   * Create node sets for boundary faces (for BC application)
   */
  private createBoundaryNodeSets(bbox: MeshBoundingBox): void {
    const tolerance = 0.001;

    const xMinNodes = new Set<number>();
    const xMaxNodes = new Set<number>();
    const yMinNodes = new Set<number>();
    const yMaxNodes = new Set<number>();
    const zMinNodes = new Set<number>();
    const zMaxNodes = new Set<number>();

    for (const node of this.nodes) {
      if (Math.abs(node.x - bbox.min.x) < tolerance) xMinNodes.add(node.id);
      if (Math.abs(node.x - bbox.max.x) < tolerance) xMaxNodes.add(node.id);
      if (Math.abs(node.y - bbox.min.y) < tolerance) yMinNodes.add(node.id);
      if (Math.abs(node.y - bbox.max.y) < tolerance) yMaxNodes.add(node.id);
      if (Math.abs(node.z - bbox.min.z) < tolerance) zMinNodes.add(node.id);
      if (Math.abs(node.z - bbox.max.z) < tolerance) zMaxNodes.add(node.id);
    }

    if (xMinNodes.size > 0) this.nodeSets.set('XMin', xMinNodes);
    if (xMaxNodes.size > 0) this.nodeSets.set('XMax', xMaxNodes);
    if (yMinNodes.size > 0) this.nodeSets.set('YMin', yMinNodes);
    if (yMaxNodes.size > 0) this.nodeSets.set('YMax', yMaxNodes);
    if (zMinNodes.size > 0) this.nodeSets.set('ZMin', zMinNodes);
    if (zMaxNodes.size > 0) this.nodeSets.set('ZMax', zMaxNodes);

    // Create Nall set
    const allNodes = new Set(this.nodes.map((n) => n.id));
    this.nodeSets.set('Nall', allNodes);
  }

  /**
   * Calculate mesh quality metrics
   */
  private calculateMeshQuality(): MeshQuality {
    let minAR = Infinity;
    let maxAR = 0;
    let sumAR = 0;
    let minJac = Infinity;
    let warnings = 0;
    let errors = 0;

    for (const element of this.elements) {
      const ar = this.calculateAspectRatio(element);
      minAR = Math.min(minAR, ar);
      maxAR = Math.max(maxAR, ar);
      sumAR += ar;

      const jac = this.calculateJacobian(element);
      minJac = Math.min(minJac, jac);

      // Quality thresholds
      if (ar > 10) warnings++;
      if (ar > 50) errors++;
      if (jac < 0) errors++;
    }

    const avgAR = this.elements.length > 0 ? sumAR / this.elements.length : 1;

    return {
      minAspectRatio: minAR === Infinity ? 1 : minAR,
      maxAspectRatio: maxAR === 0 ? 1 : maxAR,
      avgAspectRatio: avgAR,
      minJacobian: minJac === Infinity ? 1 : minJac,
      warningCount: warnings,
      errorCount: errors,
    };
  }

  private calculateAspectRatio(element: FEAElement): number {
    // For tetrahedra, aspect ratio = longest edge / shortest altitude
    const nodes = element.nodeIds.slice(0, 4).map((id) => 
      this.nodes.find((n) => n.id === id)!
    );

    if (nodes.length < 4 || nodes.some(n => !n)) return 1;

    // Calculate edge lengths
    const edges: number[] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dz = nodes[j].z - nodes[i].z;
        edges.push(Math.sqrt(dx * dx + dy * dy + dz * dz));
      }
    }

    const maxEdge = Math.max(...edges);
    const minEdge = Math.min(...edges);

    return minEdge > 0 ? maxEdge / minEdge : 1;
  }

  private calculateJacobian(element: FEAElement): number {
    // For linear tetrahedra, Jacobian is proportional to signed volume
    const nodes = element.nodeIds.slice(0, 4).map((id) =>
      this.nodes.find((n) => n.id === id)!
    );

    if (nodes.length < 4 || nodes.some(n => !n)) return 1;

    // Calculate signed volume using determinant
    const v01 = {
      x: nodes[1].x - nodes[0].x,
      y: nodes[1].y - nodes[0].y,
      z: nodes[1].z - nodes[0].z,
    };
    const v02 = {
      x: nodes[2].x - nodes[0].x,
      y: nodes[2].y - nodes[0].y,
      z: nodes[2].z - nodes[0].z,
    };
    const v03 = {
      x: nodes[3].x - nodes[0].x,
      y: nodes[3].y - nodes[0].y,
      z: nodes[3].z - nodes[0].z,
    };

    // Determinant = v01 · (v02 × v03)
    const cross = {
      x: v02.y * v03.z - v02.z * v03.y,
      y: v02.z * v03.x - v02.x * v03.z,
      z: v02.x * v03.y - v02.y * v03.x,
    };

    const det = v01.x * cross.x + v01.y * cross.y + v01.z * cross.z;

    return det / 6; // Volume of tetrahedron
  }

  /**
   * Create node set for specific geometry selection
   */
  createNodeSetForGeometry(
    mesh: FEAMesh,
    geometryId: string,
    geometryType: 'face' | 'edge' | 'vertex',
    geometryBounds: { center: Vector3; radius: number }
  ): FEANodeSet {
    const nodeIds: number[] = [];

    for (const node of mesh.nodes) {
      const dx = node.x - geometryBounds.center.x;
      const dy = node.y - geometryBounds.center.y;
      const dz = node.z - geometryBounds.center.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist <= geometryBounds.radius) {
        nodeIds.push(node.id);
      }
    }

    return {
      name: `${geometryType}_${geometryId}`,
      nodeIds,
    };
  }
}

export const meshGenerator = new MeshGenerator();

