/**
 * Build POST /api/analyze bodies from workflow store data.
 *
 * The public Vercel app is a thin proxy: it validates box meshes (min/max) and that file
 * meshes include data | path | url, then forwards JSON to COMPUTE_SERVER_URL. It does not
 * parse MSH, assign boundary_id, or define materials/results shape—that is all compute-side.
 * mesh.data encoding: see encodeFileMeshData() in integration-config.ts (base64 vs plain).
 */

import type {
  BoundaryCondition,
  BoundaryTarget,
  Load,
  AnalysisRequest,
  Mesh,
  BoxMesh,
} from './types';
import type {
  BoundaryConditionDef,
  LoadDef,
  MeshData,
  CustomMaterial,
} from '@/store/workflowStore';
import { workflowMaterialIdToApiPreset } from './map-material';
import { workflowMeshToGmshMsh22, type GmshMeshNode, type GmshMeshElement } from './mesh-to-gmsh';
import { encodeFileMeshData } from './integration-config';

function estimateBoxSubdivisions(nodeCount: number): [number, number, number] {
  const n = Math.min(24, Math.max(2, Math.round(Math.cbrt(Math.max(nodeCount, 8)))));
  return [n, n, n];
}

function tupleBoundingBox(meshData: MeshData): { min: [number, number, number]; max: [number, number, number] } | null {
  if (meshData.boundingBox) {
    const { min, max } = meshData.boundingBox;
    return {
      min: [min.x, min.y, min.z],
      max: [max.x, max.y, max.z],
    };
  }
  const nodes = meshData.nodes;
  if (!nodes?.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    minZ = Math.min(minZ, n.z);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
    maxZ = Math.max(maxZ, n.z);
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;
  return {
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
  };
}

function fallbackDemoBox(): BoxMesh {
  return {
    type: 'box',
    min: [-50, -50, -50],
    max: [50, 50, 50],
    subdivisions: [10, 10, 10],
  };
}

/**
 * Prefer volumetric .msh from meshed tetrahedra; otherwise a box matching the workflow bounding box.
 */
export function buildMeshPayload(meshData: MeshData): Mesh {
  const nodes = meshData.nodes as GmshMeshNode[] | undefined;
  const elements = meshData.elements as GmshMeshElement[] | undefined;
  if (nodes?.length && elements?.length) {
    const msh = workflowMeshToGmshMsh22(nodes, elements);
    if (msh) {
      return { type: 'file', format: 'msh', data: encodeFileMeshData(msh) };
    }
  }

  const bbox = tupleBoundingBox(meshData);
  if (bbox) {
    const [sx, sy, sz] = estimateBoxSubdivisions(meshData.nodeCount);
    const dx = bbox.max[0] - bbox.min[0];
    const dy = bbox.max[1] - bbox.min[1];
    const dz = bbox.max[2] - bbox.min[2];
    const flat = dx <= 1e-9 || dy <= 1e-9 || dz <= 1e-9;
    if (flat) {
      return fallbackDemoBox();
    }
    return {
      type: 'box',
      min: bbox.min,
      max: bbox.max,
      subdivisions: [sx, sy, sz],
    };
  }

  return fallbackDemoBox();
}

export function unsupportedWorkflowTargetMessage(
  boundaryConditions: BoundaryConditionDef[],
  loads: LoadDef[]
): string | null {
  for (const bc of boundaryConditions) {
    if (!bc.enabled) continue;
    if (bc.target.type === 'face' || bc.target.type === 'edge') {
      return (
        'Face and edge boundary targets are not supported for cloud FEA yet. ' +
        'Use point, box, or sphere regions in setup.'
      );
    }
  }
  for (const l of loads) {
    if (!l.enabled || !l.target) continue;
    if (l.target.type === 'face' || l.target.type === 'edge') {
      return (
        'Face and edge load targets are not supported for cloud FEA yet. ' +
        'Use point, box, or sphere regions in setup.'
      );
    }
  }
  return null;
}

function mapTargetToApi(
  target: BoundaryConditionDef['target'] | NonNullable<LoadDef['target']>
): BoundaryTarget | null {
  switch (target.type) {
    case 'point':
      if (!target.location) return null;
      return { type: 'point', location: target.location };
    case 'box':
      if (!target.min || !target.max) return null;
      return { type: 'box', min: target.min, max: target.max };
    case 'sphere':
      if (!target.center || target.radius == null) return null;
      return { type: 'sphere', center: target.center, radius: target.radius };
    default:
      return null;
  }
}

export function workflowBoundaryToApi(bc: BoundaryConditionDef): BoundaryCondition | null {
  const target = mapTargetToApi(bc.target);
  if (!target) return null;

  const base = { target, description: bc.name };

  switch (bc.type) {
    case 'fixed':
      return { type: 'fixed', ...base };
    case 'displacement':
      if (!bc.values) return null;
      return { type: 'displacement', ...base, values: bc.values };
    case 'symmetry':
      if (!bc.planeNormal) return null;
      return { type: 'symmetry', ...base, plane_normal: bc.planeNormal };
    case 'elastic_support':
      if (!bc.stiffnessPerArea) return null;
      return {
        type: 'elastic_support',
        ...base,
        stiffness_per_area: bc.stiffnessPerArea,
      };
    default:
      return null;
  }
}

export function workflowLoadToApi(load: LoadDef): Load | null {
  switch (load.type) {
    case 'gravity':
      if (!load.acceleration) return null;
      return { type: 'gravity', acceleration: load.acceleration, description: load.name };
    case 'pressure': {
      if (load.value == null || !load.target) return null;
      const target = mapTargetToApi(load.target);
      if (!target) return null;
      return {
        type: 'pressure',
        target,
        value: load.value,
        description: load.name,
      };
    }
    case 'surface_force': {
      if (!load.target || !load.forcePerArea) return null;
      const target = mapTargetToApi(load.target);
      if (!target) return null;
      return {
        type: 'surface_force',
        target,
        force_per_area: load.forcePerArea,
        description: load.name,
      };
    }
    case 'point_force':
      if (!load.location || !load.force) return null;
      return {
        type: 'point_force',
        location: load.location,
        force: load.force,
        description: load.name,
      };
    case 'thermal':
      if (load.referenceTemperature == null || load.appliedTemperature == null) return null;
      return {
        type: 'thermal',
        reference_temperature: load.referenceTemperature,
        applied_temperature: load.appliedTemperature,
        description: load.name,
      };
    case 'centrifugal':
      if (!load.axisPoint || !load.axisDirection || load.angularVelocity == null) return null;
      return {
        type: 'centrifugal',
        axis_point: load.axisPoint,
        axis_direction: load.axisDirection,
        angular_velocity: load.angularVelocity,
        description: load.name,
      };
    default:
      return null;
  }
}

export function buildAnalysisRequestFromWorkflow(input: {
  meshData: MeshData;
  boundaryConditions: BoundaryConditionDef[];
  loads: LoadDef[];
  materials: CustomMaterial[];
  defaultMaterialId: string | null;
}): { ok: true; request: AnalysisRequest } | { ok: false; error: string } {
  const unsupported = unsupportedWorkflowTargetMessage(input.boundaryConditions, input.loads);
  if (unsupported) return { ok: false, error: unsupported };

  const material =
    input.materials.find((m) => m.id === input.defaultMaterialId) || input.materials[0];
  const apiPreset = workflowMaterialIdToApiPreset(material?.id ?? null);

  const boundary_conditions: BoundaryCondition[] = [];
  for (const bc of input.boundaryConditions.filter((b) => b.enabled)) {
    const api = workflowBoundaryToApi(bc);
    if (!api) {
      return {
        ok: false,
        error: `Boundary condition "${bc.name}" is missing a valid target (point, box, or sphere).`,
      };
    }
    boundary_conditions.push(api);
  }

  const apiLoads: Load[] = [];
  for (const l of input.loads.filter((x) => x.enabled)) {
    const api = workflowLoadToApi(l);
    if (!api) {
      return {
        ok: false,
        error: `Load "${l.name}" is missing required fields or has an invalid target.`,
      };
    }
    apiLoads.push(api);
  }

  return {
    ok: true,
    request: {
      mesh: buildMeshPayload(input.meshData),
      materials: { default: apiPreset },
      boundary_conditions,
      loads: apiLoads,
      solver_options: {
        fe_degree: 1,
        refinement_cycles: 0,
        compute_reactions: true,
        compute_safety_factors: true,
      },
      units: { type: 'SI_MM' },
    },
  };
}
