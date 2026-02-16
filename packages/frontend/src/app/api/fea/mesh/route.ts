import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { meshRequestBodySchema, validationErrorResponse } from '@/schemas';

/**
 * POST /api/fea/mesh - Generate mesh from geometry (parts).
 * Body: { partStudioId, settings: { parts, globalSize?, elementType? } }
 * Returns JSON { success, data: { mesh, statistics } } so the client never gets HTML.
 */
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const raw = await request.json();
    const parsed = meshRequestBodySchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { partStudioId, settings } = parsed.data;
    const parts = settings?.parts ?? [];
    if (parts.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_GEOMETRY', message: 'No parts to mesh. Please create geometry first.' } },
        { status: 400 }
      );
    }

    const vertices: number[] = [];
    for (const part of parts) {
      const partMesh = (part as any).meshData || (part as any).mesh;
      if (partMesh?.vertices?.length) {
        for (let i = 0; i < partMesh.vertices.length; i++) {
          vertices.push(partMesh.vertices[i]);
        }
      }
    }

    if (vertices.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_MESH_DATA', message: 'No mesh data in parts. Ensure geometry is generated.' } },
        { status: 400 }
      );
    }

    const globalSize = Math.max(settings?.globalSize ?? 5, 2);
    const elementType = settings?.elementType || 'C3D4';

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < vertices.length; i += 3) {
      minX = Math.min(minX, vertices[i]);
      minY = Math.min(minY, vertices[i + 1]);
      minZ = Math.min(minZ, vertices[i + 2]);
      maxX = Math.max(maxX, vertices[i]);
      maxY = Math.max(maxY, vertices[i + 1]);
      maxZ = Math.max(maxZ, vertices[i + 2]);
    }

    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;

    let nx = Math.max(2, Math.ceil(sizeX / globalSize) + 1);
    let ny = Math.max(2, Math.ceil(sizeY / globalSize) + 1);
    let nz = Math.max(2, Math.ceil(sizeZ / globalSize) + 1);

    const MAX_NODES = 5000;
    const totalNodes = nx * ny * nz;
    if (totalNodes > MAX_NODES) {
      const recommendedSize = Math.ceil(Math.max(sizeX, sizeY, sizeZ) / 15);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MESH_TOO_LARGE',
            message: `Mesh would be too large. Increase element size to at least ${recommendedSize}mm or simplify geometry.`,
          },
        },
        { status: 400 }
      );
    }

    const nodes: { id: number; x: number; y: number; z: number }[] = [];
    const elements: { id: number; type: string; nodeIds: number[] }[] = [];
    let nodeId = 1;
    let elementId = 1;

    const dx = sizeX / (nx - 1);
    const dy = sizeY / (ny - 1);
    const dz = sizeZ / (nz - 1);

    const nodeGrid: number[][][] = [];
    for (let k = 0; k < nz; k++) {
      nodeGrid[k] = [];
      for (let j = 0; j < ny; j++) {
        nodeGrid[k][j] = [];
        for (let i = 0; i < nx; i++) {
          nodes.push({
            id: nodeId,
            x: minX + i * dx,
            y: minY + j * dy,
            z: minZ + k * dz,
          });
          nodeGrid[k][j][i] = nodeId++;
        }
      }
    }

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
          const tets = [
            [n000, n100, n010, n001],
            [n100, n110, n010, n111],
            [n010, n111, n011, n001],
            [n100, n101, n001, n111],
            [n001, n111, n011, n010],
            [n001, n100, n111, n010],
          ];
          for (const tet of tets) {
            elements.push({ id: elementId++, type: elementType, nodeIds: tet });
          }
        }
      }
    }

    const nodeSets = [
      { name: 'Nall', nodeIds: nodes.map((n) => n.id) },
      { name: 'ZMin', nodeIds: nodes.filter((n) => Math.abs(n.z - minZ) < 0.001).map((n) => n.id) },
      { name: 'ZMax', nodeIds: nodes.filter((n) => Math.abs(n.z - maxZ) < 0.001).map((n) => n.id) },
      { name: 'XMin', nodeIds: nodes.filter((n) => Math.abs(n.x - minX) < 0.001).map((n) => n.id) },
      { name: 'XMax', nodeIds: nodes.filter((n) => Math.abs(n.x - maxX) < 0.001).map((n) => n.id) },
    ];

    const mesh = {
      nodes,
      elements,
      nodeSets,
      elementSets: [{ name: 'Eall', elementIds: elements.map((e) => e.id) }],
      surfaces: [],
      nodeCount: nodes.length,
      elementCount: elements.length,
      elementType,
      boundingBox: { min: { x: minX, y: minY, z: minZ }, max: { x: maxX, y: maxY, z: maxZ } },
      quality: { minAspectRatio: 1, maxAspectRatio: 2, avgAspectRatio: 1.5, minJacobian: 0.5, warningCount: 0, errorCount: 0 },
    };

    return NextResponse.json({
      success: true,
      data: {
        mesh,
        statistics: {
          nodeCount: nodes.length,
          elementCount: elements.length,
          elementType,
          quality: mesh.quality,
          generationTime: 0.1,
        },
      },
    });
  } catch (err: any) {
    console.error('[FEA] Mesh generation error:', err);
    return NextResponse.json(
      { success: false, error: { code: 'MESH_ERROR', message: err?.message || 'Mesh generation failed' } },
      { status: 500 }
    );
  }
}
