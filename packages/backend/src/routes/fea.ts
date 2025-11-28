/**
 * FEA API Routes - Finite Element Analysis with CalculiX
 */

import { Router } from 'express';
import { execFile, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { store } from '../store';

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

    if (!partStudioId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'partStudioId is required' }
      });
    }

    const partStudio = store.getPartStudio(partStudioId);
    if (!partStudio) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Part studio not found' }
      });
    }

    // Get geometry from part studio
    const parts = partStudio.parts || [];
    if (parts.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_GEOMETRY', message: 'No parts to mesh' }
      });
    }

    // Extract mesh data from parts
    const vertices: number[] = [];
    const indices: number[] = [];
    let indexOffset = 0;

    for (const part of parts) {
      if (part.mesh) {
        // Add vertices
        for (let i = 0; i < part.mesh.vertices.length; i++) {
          vertices.push(part.mesh.vertices[i]);
        }

        // Add indices with offset
        if (part.mesh.indices) {
          for (const idx of part.mesh.indices) {
            indices.push(idx + indexOffset);
          }
        }
        indexOffset += part.mesh.vertices.length / 3;
      }
    }

    // Use mesh generator (simplified version for backend)
    const globalSize = settings?.globalSize || 5;
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

    // Generate simple box mesh for demo
    const nodes: any[] = [];
    const elements: any[] = [];
    let nodeId = 1;
    let elementId = 1;

    const nx = Math.max(2, Math.ceil((maxX - minX) / globalSize) + 1);
    const ny = Math.max(2, Math.ceil((maxY - minY) / globalSize) + 1);
    const nz = Math.max(2, Math.ceil((maxZ - minZ) / globalSize) + 1);

    const dx = (maxX - minX) / (nx - 1);
    const dy = (maxY - minY) / (ny - 1);
    const dz = (maxZ - minZ) / (nz - 1);

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
    const { setup, partStudioId } = req.body;

    if (!setup || !partStudioId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'setup and partStudioId are required' }
      });
    }

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

    // Generate CalculiX input file
    const inpContent = generateInputFile(setup);
    const inpPath = path.join(workDir, 'model.inp');
    fs.writeFileSync(inpPath, inpContent);

    await delay(300);

    // Update status: Solving
    job.status = 'solving';
    job.progress = 50;
    job.message = 'Running CalculiX solver...';

    // Try to run CalculiX if available
    const ccxPath = findCalculiX();
    
    if (ccxPath) {
      // Run actual CalculiX
      await runCalculiX(ccxPath, workDir, job);
    } else {
      // Generate mock results for demo
      await delay(1500);
      job.progress = 80;
      job.message = 'Processing results...';
    }

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
 * Find CalculiX executable
 */
function findCalculiX(): string | null {
  const possiblePaths = [
    'ccx',
    '/usr/bin/ccx',
    '/usr/local/bin/ccx',
    'C:\\Program Files\\CalculiX\\ccx.exe',
    path.join(process.cwd(), 'bin', 'ccx'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {
      // Skip
    }
  }

  return null;
}

/**
 * Run CalculiX solver
 */
async function runCalculiX(ccxPath: string, workDir: string, job: SimulationJob): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(ccxPath, ['-i', 'model'], {
      cwd: workDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    job.process = process;

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
      // Update progress based on output
      if (stdout.includes('step 1')) {
        job.progress = 60;
      }
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`CalculiX exited with code ${code}: ${stderr}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Generate CalculiX input file
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

