/**
 * Web Worker for running CalculiX WASM
 * Keeps the main thread responsive during heavy computation
 */

let calculixModule: any = null;

// Handle messages from main thread
self.onmessage = async (e: MessageEvent) => {
  const { type, jobName, inputContent, mesh } = e.data;

  try {
    switch (type) {
      case 'initialize':
        await initializeModule();
        self.postMessage({ type: 'initialized' });
        break;

      case 'solve':
        await runSolver(jobName, inputContent, mesh);
        break;

      default:
        console.warn('[Worker] Unknown message type:', type);
    }
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      data: { message: error.message, stack: error.stack },
    });
  }
};

async function initializeModule() {
  if (calculixModule) {
    return; // Already initialized
  }

  postProgress('initializing', 'Loading CalculiX module...', 0);

  try {
    // In worker, use importScripts for the WASM module
    // @ts-ignore - Worker API
    self.importScripts('/wasm/calculix.js');

    // @ts-ignore - Global from imported script
    const createModule = self.createCalculiXModule || self.CCXModule;
    if (!createModule) {
      throw new Error('CalculiX module not found after importScripts');
    }

    calculixModule = await createModule({
      locateFile: (path: string) => {
        if (path.endsWith('.wasm')) {
          return '/wasm/calculix.wasm';
        }
        return path;
      },
      print: (text: string) => {
        postProgress('solving', text);
        console.log('[CCX Worker]', text);
      },
      printErr: (text: string) => {
        postProgress('solving', text);
        console.error('[CCX Worker]', text);
      },
    });

    // Set up working directory
    calculixModule.FS.mkdir('/work');
    calculixModule.FS.chdir('/work');

    console.log('[Worker] CalculiX module loaded');
  } catch (error: any) {
    throw new Error(`Failed to load CalculiX WASM in worker: ${error.message}. Ensure calculix.js and calculix.wasm are in /public/wasm/`);
  }
}

async function runSolver(jobName: string, inputContent: string, meshInfo: any) {
  if (!calculixModule) {
    throw new Error('Module not initialized');
  }

  const inputFile = `${jobName}.inp`;
  const datFile = `${jobName}.dat`;
  const frdFile = `${jobName}.frd`;

  try {
    postProgress('initializing', 'Writing input file...', 5);

    // Write input to virtual filesystem
    calculixModule.FS.writeFile(inputFile, inputContent);

    postProgress('factorizing', 'Starting CalculiX solver...', 10);

    // Run CalculiX
    const exitCode = calculixModule.callMain([jobName]);

    if (exitCode !== 0) {
      // Try to get error details
      let errorMessage = `Solver failed with exit code ${exitCode}`;
      
      try {
        if (calculixModule.FS.stat(datFile)) {
          const datContent = calculixModule.FS.readFile(datFile, {
            encoding: 'utf8',
          });
          const errors = extractErrors(datContent);
          if (errors.length > 0) {
            errorMessage += ':\n' + errors.join('\n');
          }
        }
      } catch {}

      throw new Error(errorMessage);
    }

    postProgress('parsing', 'Solver finished, parsing results...', 85);

    // Read output files
    const datContent = calculixModule.FS.readFile(datFile, {
      encoding: 'utf8',
    });
    const frdContent = calculixModule.FS.readFile(frdFile, {
      encoding: 'utf8',
    });

    postProgress('parsing', 'Parsing displacement and stress data...', 90);

    // Parse results (simplified parser)
    const results = parseResults(frdContent, datContent, meshInfo);

    // Extract warnings
    const warnings = extractWarnings(datContent);

    // Clean up files
    try {
      calculixModule.FS.unlink(inputFile);
      calculixModule.FS.unlink(datFile);
      calculixModule.FS.unlink(frdFile);
    } catch {}

    postProgress('complete', 'Complete!', 100);

    // Send results back
    self.postMessage({
      type: 'complete',
      data: {
        results,
        warnings,
        log: datContent.substring(0, 10000), // Limit log size
      },
    });
  } catch (error: any) {
    // Clean up on error
    try {
      calculixModule.FS.unlink(inputFile);
      calculixModule.FS.unlink(datFile);
      calculixModule.FS.unlink(frdFile);
    } catch {}

    throw error;
  }
}

function postProgress(
  stage: 'initializing' | 'factorizing' | 'solving' | 'parsing' | 'complete',
  message: string,
  percent?: number
) {
  self.postMessage({
    type: 'progress',
    data: { stage, message, percent },
  });
}

function parseResults(frdContent: string, datContent: string, meshInfo: any): any {
  const lines = frdContent.split('\n');
  const displacements: any[] = [];
  const stresses: any[] = [];
  
  let inDispBlock = false;
  let inStressBlock = false;

  // Parse FRD format (simplified)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes('DISP') || line.includes('-4  DISP')) {
      inDispBlock = true;
      inStressBlock = false;
      continue;
    }

    if (line.includes('STRESS') || line.includes('-4  S')) {
      inStressBlock = true;
      inDispBlock = false;
      continue;
    }

    if (line.startsWith('-3')) {
      inDispBlock = false;
      inStressBlock = false;
      continue;
    }

    if (line.startsWith('-1') && (inDispBlock || inStressBlock)) {
      const parts = line.split(/\s+/).filter(p => p);
      if (parts.length >= 5) {
        const nodeId = parseInt(parts[1]);
        const values = [
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          parseFloat(parts[4])
        ];

        if (inDispBlock) {
          const magnitude = Math.sqrt(values[0]**2 + values[1]**2 + values[2]**2);
          displacements.push({
            nodeId,
            values: [...values, magnitude]
          });
        } else if (inStressBlock) {
          // von Mises (simplified - would need full tensor)
          const vonMises = Math.sqrt(values[0]**2 + values[1]**2 + values[2]**2);
          stresses.push({ nodeId, values: [vonMises] });
        }
      }
    }
  }

  const dispMagnitudes = displacements.map(d => d.values[3]);
  const stressValues = stresses.map(s => s.values[0]);

  return {
    analysisType: 'static',
    timestamp: new Date().toISOString(),
    staticResults: {
      displacements: {
        nodeValues: displacements,
        min: Math.min(...dispMagnitudes),
        max: Math.max(...dispMagnitudes),
        unit: 'mm'
      },
      vonMisesStress: {
        nodeValues: stresses,
        min: Math.min(...stressValues),
        max: Math.max(...stressValues),
        unit: 'MPa'
      }
    },
    summary: {
      maxDisplacement: Math.max(...dispMagnitudes),
      maxVonMisesStress: Math.max(...stressValues),
      solveTime: 0,
      warnings: extractWarnings(datContent)
    }
  };
}

function extractErrors(datContent: string): string[] {
  const errors: string[] = [];
  const lines = datContent.split('\n');

  for (const line of lines) {
    if (
      line.includes('***ERROR') ||
      line.includes('*ERROR*') ||
      line.includes('ERROR:')
    ) {
      errors.push(line.trim());
    }
  }

  return errors;
}

function extractWarnings(datContent: string): string[] {
  const warnings: string[] = [];
  const lines = datContent.split('\n');

  for (const line of lines) {
    if (line.includes('*WARNING') || line.includes('WARNING:')) {
      warnings.push(line.trim());
    }
  }

  return warnings;
}

// Handle errors
self.onerror = (error) => {
  console.error('[Worker] Unhandled error:', error);
  self.postMessage({
    type: 'error',
    data: { message: String(error) },
  });
};

