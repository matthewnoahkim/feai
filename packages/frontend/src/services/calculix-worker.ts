/**
 * Web Worker for running CalculiX WASM
 * Keeps the main thread responsive during heavy computation
 */

import { CalculiXInputWriter, CalculiXResultParser } from '@feai/kernel';
import type { CalculiXModule } from '../../calculix-wasm/calculix';

let calculixModule: CalculiXModule | null = null;

// Handle messages from main thread
self.onmessage = async (e: MessageEvent) => {
  const { type, jobName, inputContent } = e.data;

  try {
    switch (type) {
      case 'initialize':
        await initializeModule();
        self.postMessage({ type: 'initialized' });
        break;

      case 'solve':
        await runSolver(jobName, inputContent);
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

  // Import the WASM module
  // @ts-ignore - Dynamic import in worker
  const createModule = await import('/wasm/calculix.js');

  calculixModule = await createModule.default({
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
}

async function runSolver(jobName: string, inputContent: string) {
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

    postProgress('complete', 'Solver finished, parsing results...', 85);

    // Read output files
    const datContent = calculixModule.FS.readFile(datFile, {
      encoding: 'utf8',
    });
    const frdContent = calculixModule.FS.readFile(frdFile, {
      encoding: 'utf8',
    });

    postProgress('complete', 'Parsing displacement and stress data...', 90);

    // Parse results
    const results = CalculiXResultParser.parseResults(frdContent, datContent);

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
  stage: 'initializing' | 'factorizing' | 'solving' | 'complete',
  message: string,
  percent?: number
) {
  self.postMessage({
    type: 'progress',
    data: { stage, message, percent },
  });
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
    data: { message: error.message || 'Unknown worker error' },
  });
};

