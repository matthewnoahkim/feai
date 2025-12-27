/**
 * CalculiX WASM Solver Service
 * Manages the WebAssembly module and provides high-level API for FEA solving
 */

import type { FEMesh, SimulationSetup, FEAResults } from '@feai/shared';
import { CalculiXInputWriter, FRDParser } from '@feai/kernel';

export interface SolverProgress {
  stage: 'initializing' | 'factorizing' | 'solving' | 'parsing' | 'complete' | 'error';
  message: string;
  percent?: number;
}

export type SolverCallback = (progress: SolverProgress) => void;

interface CalculiXModule {
  FS: any;
  callMain: (args: string[]) => number;
  onExit?: (status: number) => void;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}

class CalculiXWASMSolver {
  private module: CalculiXModule | null = null;
  private loading: Promise<CalculiXModule> | null = null;
  private worker: Worker | null = null;
  private useWorker: boolean = true; // Run in Web Worker to avoid blocking UI

  /**
   * Initialize the CalculiX WASM module
   */
  async initialize(): Promise<void> {
    if (this.module) {
      return; // Already initialized
    }

    if (this.loading) {
      await this.loading;
      return;
    }

    console.log('[CalculiX WASM] Initializing module...');

    if (this.useWorker && typeof Worker !== 'undefined') {
      // Load in Web Worker
      this.loading = this.initializeWorker();
    } else {
      // Load in main thread (fallback)
      this.loading = this.initializeMainThread();
    }

    await this.loading;
    console.log('[CalculiX WASM] Module initialized successfully');
  }

  private async initializeMainThread(): Promise<CalculiXModule> {
    try {
      // Check if WASM files exist before trying to load
      const response = await fetch('/wasm/calculix.js');
      if (!response.ok) {
        throw new Error('CalculiX WASM files not found. Please place calculix.js and calculix.wasm in public/wasm/');
      }

      // Dynamically import the WASM module using a script tag approach
      // This avoids Vite build issues with dynamic imports
      return await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/wasm/calculix.js';
        script.onload = async () => {
          // @ts-ignore - Global module
          const createModule = window.createCalculiXModule || window.CCXModule;
          if (!createModule) {
            reject(new Error('CalculiX module not found after loading script'));
            return;
          }

          try {
            const module = await createModule({
              locateFile: (path: string) => {
                if (path.endsWith('.wasm')) {
                  return '/wasm/calculix.wasm';
                }
                return path;
              },
              print: (text: string) => {
                console.log('[CCX]', text);
              },
              printErr: (text: string) => {
                console.error('[CCX]', text);
              },
            });

            // Set up working directory
            module.FS.mkdir('/work');
            module.FS.chdir('/work');

            this.module = module;
            resolve(module);
          } catch (error: any) {
            reject(error);
          }
        };
        script.onerror = () => {
          reject(new Error('Failed to load CalculiX WASM script'));
        };
        document.head.appendChild(script);
      });
    } catch (error: any) {
      console.error('[CalculiX WASM] Failed to load module:', error);
      throw new Error(`Failed to load CalculiX WASM: ${error.message}. Make sure calculix.js and calculix.wasm are in /public/wasm/`);
    }
  }

  private async initializeWorker(): Promise<CalculiXModule> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(
          new URL('./calculix-worker.ts', import.meta.url),
          { type: 'module' }
        );

        const timeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout'));
        }, 30000); // 30 second timeout

        this.worker.onmessage = (e) => {
          if (e.data.type === 'initialized') {
            clearTimeout(timeout);
            resolve({} as CalculiXModule); // Worker-based, no direct module access
          } else if (e.data.type === 'error') {
            clearTimeout(timeout);
            reject(new Error(e.data.message));
          }
        };

        this.worker.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        this.worker.postMessage({ type: 'initialize' });
      } catch (error: any) {
        reject(new Error(`Failed to create worker: ${error.message}`));
      }
    });
  }

  /**
   * Run FEA simulation
   */
  async solve(
    mesh: FEMesh,
    setup: SimulationSetup,
    onProgress?: SolverCallback
  ): Promise<FEAResults> {
    if (!this.module && !this.worker) {
      await this.initialize();
    }

    const jobName = `job_${Date.now()}`;

    try {
      onProgress?.({
        stage: 'initializing',
        message: 'Generating CalculiX input file...',
        percent: 0,
      });

      // Generate CalculiX input file using full writer
      const inputContent = CalculiXInputWriter.writeInput(mesh, setup);

      if (this.worker) {
        return await this.solveInWorker(jobName, inputContent, mesh, onProgress);
      } else {
        return await this.solveInMainThread(jobName, inputContent, mesh, onProgress);
      }
    } catch (error: any) {
      onProgress?.({
        stage: 'error',
        message: error.message || 'Simulation failed',
      });
      throw error;
    }
  }

  private async solveInMainThread(
    jobName: string,
    inputContent: string,
    mesh: FEMesh,
    onProgress?: SolverCallback
  ): Promise<FEAResults> {
    if (!this.module) {
      throw new Error('Module not initialized');
    }

    const inputFile = `${jobName}.inp`;
    const datFile = `${jobName}.dat`;
    const frdFile = `${jobName}.frd`;

    try {
      // Write input file to virtual filesystem
      this.module.FS.writeFile(inputFile, inputContent);

      onProgress?.({
        stage: 'solving',
        message: 'Running CalculiX solver...',
        percent: 10,
      });

      // Capture console output
      const logs: string[] = [];
      this.module.print = (text: string) => {
        logs.push(text);
        console.log('[CCX]', text);
      };
      this.module.printErr = (text: string) => {
        logs.push('[ERROR] ' + text);
        console.error('[CCX]', text);
      };

      // Run CalculiX
      const exitCode = this.module.callMain([jobName]);

      if (exitCode !== 0) {
        // Try to read error log
        let errorMessage = `Solver exited with code ${exitCode}`;
        try {
          const datContent = this.module.FS.readFile(datFile, { encoding: 'utf8' });
          const errors = this.extractErrors(datContent);
          if (errors.length > 0) {
            errorMessage += '\n' + errors.join('\n');
          }
        } catch {}
        throw new Error(errorMessage);
      }

      onProgress?.({
        stage: 'parsing',
        message: 'Parsing results...',
        percent: 90,
      });

      // Read output files
      const datContent = this.module.FS.readFile(datFile, { encoding: 'utf8' });
      const frdContent = this.module.FS.readFile(frdFile, { encoding: 'utf8' });

      // Clean up
      try {
        this.module.FS.unlink(inputFile);
        this.module.FS.unlink(datFile);
        this.module.FS.unlink(frdFile);
      } catch {}

      // Parse results using full FRD parser
      const parsedResults = FRDParser.parse(frdContent, datContent);
      const results = this.convertToFEAResults(parsedResults, mesh);

      onProgress?.({
        stage: 'complete',
        message: 'Simulation complete',
        percent: 100,
      });

      return results;
    } catch (error: any) {
      // Clean up on error
      try {
        this.module.FS.unlink(inputFile);
        this.module.FS.unlink(datFile);
        this.module.FS.unlink(frdFile);
      } catch {}
      throw error;
    }
  }

  private async solveInWorker(
    jobName: string,
    inputContent: string,
    mesh: FEMesh,
    onProgress?: SolverCallback
  ): Promise<FEAResults> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        const { type, data } = e.data;

        switch (type) {
          case 'progress':
            onProgress?.(data);
            break;

          case 'complete':
            this.worker?.removeEventListener('message', handleMessage);
            resolve(data.results);
            break;

          case 'error':
            this.worker?.removeEventListener('message', handleMessage);
            reject(new Error(data.message));
            break;
        }
      };

      this.worker.addEventListener('message', handleMessage);

      this.worker.postMessage({
        type: 'solve',
        jobName,
        inputContent,
        mesh: {
          nodeCount: mesh.nodeCount,
          elementCount: mesh.elementCount,
        }
      });
    });
  }

  private extractErrors(datContent: string): string[] {
    const errors: string[] = [];
    const lines = datContent.split('\n');

    for (const line of lines) {
      if (line.includes('***ERROR') || line.includes('*ERROR*') || line.includes('ERROR:')) {
        errors.push(line.trim());
      }
    }

    return errors;
  }

  /**
   * Convert parsed FRD results to FEAResults format
   */
  private convertToFEAResults(parsed: any, mesh: FEMesh): FEAResults {
    const displacements: any[] = [];
    const stresses: any[] = [];

    // Convert displacements
    for (const [nodeId, values] of parsed.displacements) {
      displacements.push({
        nodeId,
        values: values, // [Ux, Uy, Uz, magnitude]
      });
    }

    // Convert von Mises stresses
    for (const [nodeId, value] of parsed.vonMisesStress) {
      stresses.push({
        nodeId,
        values: [value],
      });
    }

    // Calculate min/max
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
        warnings: []
      }
    } as any;
  }

  // Note: parseResults and generateInputFile methods have been replaced with
  // dedicated modules (CalculiXInputWriter and FRDParser) for better maintainability

  /**
   * Get module statistics (memory usage, etc.)
   */
  getStats() {
    return {
      initialized: !!this.module || !!this.worker,
      useWorker: this.useWorker,
      memoryUsedMB: 'unknown', // WASM memory info not easily accessible
    };
  }

  /**
   * Terminate and clean up
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.module = null;
    this.loading = null;
    console.log('[CalculiX WASM] Terminated');
  }
}

// Singleton instance
export const calculixSolver = new CalculiXWASMSolver();

