/**
 * FEA API Routes - Finite Element Analysis
 */

import { Router } from 'express';
import { meshBodySchema, runSimulationSchema, validationErrorResponse } from '../schemas';
import { execFile, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { store, StoredPartStudio } from '../store';

// Import FEA types (would use proper imports in production)
interface SimulationJob {
  id: string;
  status: 'queued' | 'meshing' | 'preparing' | 'solving' | 'postProcessing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  message?: string;
  setup: any;
  results?: any;
  error?: string;
  process?: ChildProcess;
  workDir?: string;
  startTime?: number;
}

// In-memory job store (would use Redis/DB in production)
const jobs = new Map<string, SimulationJob>();

export const feaRouter = Router();

/**
 * Generate mesh for a part
 */
feaRouter.post('/mesh', async (req, res) => {
  try {
    const { partStudioId, settings } = req.body;

    console.log('[FEA] Mesh request received:', { partStudioId, settings: { ...settings, parts: settings?.parts ? `${settings.parts.length} parts` : 'none' } });

    if (!partStudioId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'partStudioId is required' }
      });
    }

    // Check if parts data was sent directly (preferred method)
    let parts = settings?.parts || [];
    
    // If no parts were sent, try to get from backend store
    if (parts.length === 0) {
      // Try to get the part studio
      let partStudio = store.getPartStudio(partStudioId);
      
      if (!partStudio) {
        console.log('[FEA] Part studio not found, checking if we need to create a default one');
        
        // Get all part studios to see what we have
        const allPartStudios = Array.from((store as any).partStudios?.values() || []) as StoredPartStudio[];
        console.log('[FEA] Available part studios:', allPartStudios.map((ps) => ({ id: ps.id, name: ps.name })));
        
        // If there are no part studios at all, return a helpful error
        if (allPartStudios.length === 0) {
          return res.status(404).json({
            success: false,
            error: { 
              code: 'NO_PART_STUDIO', 
              message: 'No part studio found. Please create geometry before running FEA.' 
            }
          });
        }
        
        // Use the first available part studio if the requested one doesn't exist
        partStudio = allPartStudios[0];
        console.log('[FEA] Using first available part studio:', partStudio.id);
      }

      // Get geometry from part studio
      parts = partStudio.parts || [];
    }
    
    console.log('[FEA] Found parts:', parts.length);
    
    if (parts.length === 0) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'NO_GEOMETRY', 
          message: 'No parts to mesh. Please create geometry before running FEA.' 
        }
      });
    }

    // Extract mesh data from parts
    const vertices: number[] = [];
    const indices: number[] = [];
    let indexOffset = 0;

    for (const part of parts) {
      // Check both 'meshData' (backend format) and 'mesh' (frontend format)
      const partMesh = (part as any).meshData || (part as any).mesh;
      
      if (partMesh && partMesh.vertices && partMesh.vertices.length > 0) {
        // Add vertices
        for (let i = 0; i < partMesh.vertices.length; i++) {
          vertices.push(partMesh.vertices[i]);
        }

        // Add indices with offset
        if (partMesh.indices && partMesh.indices.length > 0) {
          for (const idx of partMesh.indices) {
            indices.push(idx + indexOffset);
          }
        }
        indexOffset += partMesh.vertices.length / 3;
      }
    }

    console.log('[FEA] Extracted geometry:', { 
      vertices: vertices.length, 
      indices: indices.length,
      partsWithMesh: parts.filter((p: any) => (p.meshData || p.mesh)).length,
      totalParts: parts.length
    });

    if (vertices.length === 0) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'NO_MESH_DATA', 
          message: 'No mesh data available. Please ensure the geometry has been generated.' 
        }
      });
    }

    // Use mesh generator (simplified version for backend)
    const globalSize = Math.max(settings?.globalSize || 5, 2); // Minimum 2mm to prevent explosion
    const elementType = settings?.elementType || 'C3D4';

    // Calculate bounding box
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
    
    console.log('[FEA] Bounding box:', { 
      min: { x: minX, y: minY, z: minZ }, 
      max: { x: maxX, y: maxY, z: maxZ },
      size: { x: sizeX, y: sizeY, z: sizeZ }
    });

    // Calculate grid dimensions with safety limits
    let nx = Math.max(2, Math.ceil(sizeX / globalSize) + 1);
    let ny = Math.max(2, Math.ceil(sizeY / globalSize) + 1);
    let nz = Math.max(2, Math.ceil(sizeZ / globalSize) + 1);

    // SAFETY: Limit maximum nodes to prevent crash
    const MAX_NODES = 5000; // Reduced from 10k for better safety (~25k elements max)
    const totalNodes = nx * ny * nz;
    
    console.log(`[FEA] Calculated mesh: ${nx}x${ny}x${nz} = ${totalNodes} nodes`);
    
    if (totalNodes > MAX_NODES) {
      const recommendedSize = Math.ceil(Math.max(sizeX, sizeY, sizeZ) / 15);
      console.warn(`[FEA] Mesh too large! Would create ${totalNodes} nodes. Aborting.`);
      
      return res.status(400).json({
        success: false,
        error: { 
          code: 'MESH_TOO_LARGE', 
          message: `Mesh would be too large (${totalNodes.toLocaleString()} nodes, ${(totalNodes * 6).toLocaleString()} elements). ` +
                   `Please increase element size to at least ${recommendedSize}mm. ` +
                   `Current size: ${globalSize}mm, Part dimensions: ${sizeX.toFixed(0)}×${sizeY.toFixed(0)}×${sizeZ.toFixed(0)}mm`
        }
      });
    }

    // Generate simple box mesh for demo
    const nodes: any[] = [];
    const elements: any[] = [];
    let nodeId = 1;
    let elementId = 1;

    const dx = sizeX / (nx - 1);
    const dy = sizeY / (ny - 1);
    const dz = sizeZ / (nz - 1);

    // Create node grid
    const nodeGrid: number[][][] = [];
    for (let k = 0; k < nz; k++) {
      nodeGrid[k] = [];
      for (let j = 0; j < ny; j++) {
        nodeGrid[k][j] = [];
        for (let i = 0; i < nx; i++) {
          const x = minX + i * dx;
          const y = minY + j * dy;
          const z = minZ + k * dz;
          nodes.push({ id: nodeId, x, y, z });
          nodeGrid[k][j][i] = nodeId++;
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
          const tets = [
            [n000, n100, n010, n001],
            [n100, n110, n010, n111],
            [n010, n111, n011, n001],
            [n100, n101, n001, n111],
            [n001, n111, n011, n010],
            [n001, n100, n111, n010],
          ];

          for (const tet of tets) {
            elements.push({
              id: elementId++,
              type: elementType,
              nodeIds: tet,
            });
          }
        }
      }
    }

    // Create node sets for boundary faces
    const nodeSets = [
      {
        name: 'Nall',
        nodeIds: nodes.map((n: any) => n.id),
      },
      {
        name: 'ZMin',
        nodeIds: nodes.filter((n: any) => Math.abs(n.z - minZ) < 0.001).map((n: any) => n.id),
      },
      {
        name: 'ZMax',
        nodeIds: nodes.filter((n: any) => Math.abs(n.z - maxZ) < 0.001).map((n: any) => n.id),
      },
      {
        name: 'XMin',
        nodeIds: nodes.filter((n: any) => Math.abs(n.x - minX) < 0.001).map((n: any) => n.id),
      },
      {
        name: 'XMax',
        nodeIds: nodes.filter((n: any) => Math.abs(n.x - maxX) < 0.001).map((n: any) => n.id),
      },
    ];

    const mesh = {
      nodes,
      elements,
      nodeSets,
      elementSets: [
        { name: 'Eall', elementIds: elements.map((e: any) => e.id) },
      ],
      surfaces: [],
      nodeCount: nodes.length,
      elementCount: elements.length,
      elementType,
      boundingBox: {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ },
      },
      quality: {
        minAspectRatio: 1,
        maxAspectRatio: 2,
        avgAspectRatio: 1.5,
        minJacobian: 0.5,
        warningCount: 0,
        errorCount: 0,
      },
    };

    res.json({
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
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Mesh generation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'MESH_ERROR', message: error.message },
    });
  }
});

/**
 * Run FEA simulation
 */
feaRouter.post('/run', async (req, res) => {
  try {
    const parsed = runSimulationSchema.safeParse(req.body);
    if (!parsed.success) return validationErrorResponse(res, parsed.error);

    const { setup, partStudioId } = parsed.data;

    // Create job
    const jobId = `fea-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const job: SimulationJob = {
      id: jobId,
      status: 'queued',
      progress: 0,
      setup,
      startTime: Date.now(),
    };
    jobs.set(jobId, job);

    // Start async processing
    processSimulation(jobId, setup, partStudioId);

    res.json({
      success: true,
      data: {
        jobId,
        status: 'queued',
        message: 'Simulation job created',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Simulation start error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SIMULATION_ERROR', message: error.message },
    });
  }
});

/**
 * Get simulation status
 */
feaRouter.get('/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Job not found' }
    });
  }

  const response: any = {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    message: job.message,
  };

  if (job.status === 'completed' && job.results) {
    response.results = job.results;
  }

  if (job.status === 'error') {
    response.error = job.error;
  }

  res.json({
    success: true,
    data: response,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Cancel simulation
 */
feaRouter.post('/cancel/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Job not found' }
    });
  }

  if (job.process) {
    job.process.kill();
  }

  job.status = 'cancelled';
  job.message = 'Simulation cancelled by user';

  // Clean up work directory
  if (job.workDir && fs.existsSync(job.workDir)) {
    fs.rmSync(job.workDir, { recursive: true, force: true });
  }

  res.json({
    success: true,
    data: { status: 'cancelled' },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get material library
 */
feaRouter.get('/materials', (req, res) => {
  const materials = [
    {
      id: 'steel-1018',
      name: 'Steel 1018 (Mild Steel)',
      category: 'metal',
      isPreset: true,
      properties: {
        youngsModulus: 205e9,
        poissonsRatio: 0.29,
        density: 7870,
        yieldStrength: 370e6,
      }
    },
    {
      id: 'steel-304',
      name: 'Stainless Steel 304',
      category: 'metal',
      isPreset: true,
      properties: {
        youngsModulus: 193e9,
        poissonsRatio: 0.29,
        density: 8000,
        yieldStrength: 215e6,
      }
    },
    {
      id: 'aluminum-6061',
      name: 'Aluminum 6061-T6',
      category: 'metal',
      isPreset: true,
      properties: {
        youngsModulus: 68.9e9,
        poissonsRatio: 0.33,
        density: 2700,
        yieldStrength: 276e6,
      }
    },
    {
      id: 'titanium-ti64',
      name: 'Titanium Ti-6Al-4V',
      category: 'metal',
      isPreset: true,
      properties: {
        youngsModulus: 113.8e9,
        poissonsRatio: 0.342,
        density: 4430,
        yieldStrength: 880e6,
      }
    },
  ];

  res.json({
    success: true,
    data: { materials },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Process simulation asynchronously
 */
async function processSimulation(jobId: string, setup: any, partStudioId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    // Update status: Meshing
    job.status = 'meshing';
    job.progress = 10;
    job.message = 'Generating mesh...';

    // Simulate mesh generation delay
    await delay(500);

    // Update status: Preparing
    job.status = 'preparing';
    job.progress = 30;
    job.message = 'Preparing input file...';

    // Create work directory
    const workDir = path.join(os.tmpdir(), `fea-${jobId}`);
    fs.mkdirSync(workDir, { recursive: true });
    job.workDir = workDir;

    // Generate FEA input file
    const inpContent = generateInputFile(setup);
    const inpPath = path.join(workDir, 'model.inp');
    fs.writeFileSync(inpPath, inpContent);

    await delay(300);

    // Update status: Solving
    job.status = 'solving';
    job.progress = 50;
    job.message = 'Running FEA solver...';

    // Generate mock results for demo
    await delay(1500);
    job.progress = 80;
    job.message = 'Processing results...';

    // Update status: Post-processing
    job.status = 'postProcessing';
    job.progress = 90;
    job.message = 'Generating results...';

    await delay(500);

    // Generate results (mock for demo, real from .frd in production)
    const results = generateMockResults(setup);

    // Update job with results
    job.status = 'completed';
    job.progress = 100;
    job.message = 'Simulation completed successfully';
    job.results = results;

    console.log(`FEA job ${jobId} completed successfully`);

    // Clean up work directory after delay
    setTimeout(() => {
      if (job.workDir && fs.existsSync(job.workDir)) {
        fs.rmSync(job.workDir, { recursive: true, force: true });
      }
    }, 60000); // Keep for 1 minute

  } catch (error: any) {
    console.error(`FEA job ${jobId} failed:`, error);
    job.status = 'error';
    job.error = error.message;
    job.message = 'Simulation failed';

    // Clean up on error
    if (job.workDir && fs.existsSync(job.workDir)) {
      fs.rmSync(job.workDir, { recursive: true, force: true });
    }
  }
}

/**
 * Generate FEA input file
 */
function generateInputFile(setup: any): string {
  const lines: string[] = [];

  lines.push('*HEADING');
  lines.push(`${setup.name || 'FEA Analysis'} - Generated by feai`);
  lines.push('**');

  // Nodes
  if (setup.mesh && setup.mesh.nodes) {
    lines.push('*NODE');
    for (const node of setup.mesh.nodes) {
      lines.push(`${node.id}, ${node.x}, ${node.y}, ${node.z}`);
    }
  }

  // Elements
  if (setup.mesh && setup.mesh.elements) {
    const elementType = setup.mesh.elementType || 'C3D4';
    lines.push(`*ELEMENT, TYPE=${elementType}, ELSET=Eall`);
    for (const element of setup.mesh.elements) {
      lines.push(`${element.id}, ${element.nodeIds.join(', ')}`);
    }
  }

  // Node sets
  if (setup.mesh && setup.mesh.nodeSets) {
    for (const nset of setup.mesh.nodeSets) {
      lines.push(`*NSET, NSET=${nset.name}`);
      const ids = [...nset.nodeIds];
      while (ids.length > 0) {
        lines.push(ids.splice(0, 16).join(', '));
      }
    }
  }

  // Materials
  if (setup.materials && setup.materials.length > 0) {
    for (const mat of setup.materials) {
      const name = mat.name.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`*MATERIAL, NAME=${name}`);
      lines.push('*ELASTIC');
      lines.push(`${mat.properties.youngsModulus}, ${mat.properties.poissonsRatio}`);
      if (mat.properties.density) {
        lines.push('*DENSITY');
        lines.push(`${mat.properties.density}`);
      }
    }
  } else {
    // Default material
    lines.push('*MATERIAL, NAME=Steel');
    lines.push('*ELASTIC');
    lines.push('2.1e11, 0.3');
    lines.push('*DENSITY');
    lines.push('7850');
  }

  // Solid section
  lines.push('*SOLID SECTION, ELSET=Eall, MATERIAL=Steel');

  // Step
  lines.push('*STEP');
  lines.push('*STATIC');

  // Boundary conditions
  if (setup.boundaryConditions) {
    let hasBoundary = false;
    let hasCload = false;
    let hasDload = false;

    for (const bc of setup.boundaryConditions) {
      if (!bc.enabled) continue;

      if (bc.type === 'fixed') {
        if (!hasBoundary) {
          lines.push('*BOUNDARY');
          hasBoundary = true;
        }
        const nodeSet = bc.geometry?.name || 'Nall';
        lines.push(`${nodeSet}, 1, 3, 0.0`);
      } else if (bc.type === 'force') {
        if (!hasCload) {
          lines.push('*CLOAD');
          hasCload = true;
        }
        const nodeSet = bc.geometry?.name || 'Nall';
        const { magnitude, direction } = bc.force;
        if (Math.abs(direction.x * magnitude) > 1e-12) {
          lines.push(`${nodeSet}, 1, ${direction.x * magnitude}`);
        }
        if (Math.abs(direction.y * magnitude) > 1e-12) {
          lines.push(`${nodeSet}, 2, ${direction.y * magnitude}`);
        }
        if (Math.abs(direction.z * magnitude) > 1e-12) {
          lines.push(`${nodeSet}, 3, ${direction.z * magnitude}`);
        }
      } else if (bc.type === 'gravity') {
        if (!hasDload) {
          lines.push('*DLOAD');
          hasDload = true;
        }
        const { acceleration, direction } = bc;
        lines.push(`Eall, GRAV, ${acceleration}, ${direction.x}, ${direction.y}, ${direction.z}`);
      }
    }
  }

  // Output
  lines.push('*NODE FILE');
  lines.push('U');
  lines.push('*EL FILE');
  lines.push('S, E');

  lines.push('*END STEP');

  return lines.join('\n');
}

/**
 * Generate mock results for demo
 */
function generateMockResults(setup: any): any {
  const mesh = setup.mesh;
  if (!mesh) {
    return {
      simulationId: setup.id,
      analysisType: 'static',
      solveTime: 2.5,
      timestamp: new Date().toISOString(),
      meshNodeCount: 0,
      meshElementCount: 0,
    };
  }

  const nodes = mesh.nodes || [];
  
  // Calculate bounding box
  let minZ = Infinity, maxZ = -Infinity;
  for (const node of nodes) {
    minZ = Math.min(minZ, node.z);
    maxZ = Math.max(maxZ, node.z);
  }
  const zRange = maxZ - minZ || 1;

  // Generate displacements (cantilever-like)
  const displacements: any[] = [];
  let maxDisp = 0;
  let maxDispNode: any = null;

  for (const node of nodes) {
    const distFromFixed = (node.z - minZ) / zRange;
    const ux = 0;
    const uy = 0;
    const uz = -0.1 * distFromFixed * distFromFixed; // Parabolic
    const magnitude = Math.abs(uz);

    displacements.push({ nodeId: node.id, ux, uy, uz, magnitude });

    if (magnitude > maxDisp) {
      maxDisp = magnitude;
      maxDispNode = node;
    }
  }

  // Generate von Mises stress (higher near fixed end)
  const vonMisesValues: any[] = [];
  let maxStress = 0;
  let maxStressNode: any = null;
  let minStress = Infinity;
  let minStressNode: any = null;

  for (const node of nodes) {
    const distFromFixed = (node.z - minZ) / zRange;
    const stressFactor = Math.max(0.1, 1 - distFromFixed);
    const vonMises = 200e6 * stressFactor; // 200 MPa max

    vonMisesValues.push({ nodeId: node.id, values: [vonMises] });

    if (vonMises > maxStress) {
      maxStress = vonMises;
      maxStressNode = node;
    }
    if (vonMises < minStress) {
      minStress = vonMises;
      minStressNode = node;
    }
  }

  return {
    simulationId: setup.id,
    analysisType: 'static',
    solveTime: 2.5,
    timestamp: new Date().toISOString(),
    staticResults: {
      displacements: {
        name: 'Displacement',
        unit: 'mm',
        nodeValues: displacements.map(d => ({
          nodeId: d.nodeId,
          values: [d.ux, d.uy, d.uz, d.magnitude],
        })),
        componentNames: ['Ux', 'Uy', 'Uz', 'Magnitude'],
        min: 0,
        max: maxDisp,
      },
      vonMisesStress: {
        name: 'Von Mises Stress',
        unit: 'Pa',
        nodeValues: vonMisesValues,
        componentNames: ['Mises'],
        min: minStress,
        max: maxStress,
      },
      summary: {
        maxDisplacement: {
          magnitude: maxDisp,
          nodeId: maxDispNode?.id || 0,
          location: maxDispNode
            ? { x: maxDispNode.x, y: maxDispNode.y, z: maxDispNode.z }
            : { x: 0, y: 0, z: 0 },
        },
        maxVonMisesStress: {
          value: maxStress,
          nodeId: maxStressNode?.id || 0,
          location: maxStressNode
            ? { x: maxStressNode.x, y: maxStressNode.y, z: maxStressNode.z }
            : { x: 0, y: 0, z: 0 },
        },
        minVonMisesStress: {
          value: minStress,
          nodeId: minStressNode?.id || 0,
        },
      },
    },
    meshNodeCount: nodes.length,
    meshElementCount: mesh.elements?.length || 0,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

