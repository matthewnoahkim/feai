/**
 * CalculiX WASM Solver Service
 * Manages the WebAssembly module and provides high-level API for FEA solving
 */

import type { FEMesh, SimulationSetup, FEAResults } from '@feai/shared';
import { CalculiXInputWriter, CalculiXResultParser } from '@feai/kernel';
import type { CalculiXModule } from '../../calculix-wasm/calculix';

export interface SolverProgress {
  stage: 'initializing' | 'factorizing' | 'solving' | 'complete' | 'error';
  message: string;
  percent?: number;
}

export type SolverCallback = (progress: SolverProgress) => void;

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
    // Dynamically import the WASM module
    const createModule = await import('/wasm/calculix.js');
    
    this.module = await createModule.default({
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
    this.module.FS.mkdir('/work');
    this.module.FS.chdir('/work');

    return this.module;
  }

  private async initializeWorker(): Promise<CalculiXModule> {
    return new Promise((resolve, reject) => {
      this.worker = new Worker(
        new URL('./calculix-worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (e) => {
        if (e.data.type === 'initialized') {
          resolve({} as CalculiXModule); // Worker-based, no direct module access
        } else if (e.data.type === 'error') {
          reject(new Error(e.data.message));
        }
      };

      this.worker.onerror = (error) => {
        reject(error);
      };

      this.worker.postMessage({ type: 'initialize' });
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
        message: 'Generating input file...',
        percent: 0,
      });

      // Generate CalculiX input file
      const inputContent = CalculiXInputWriter.writeInput(mesh, setup);

      if (this.worker) {
        return await this.solveInWorker(jobName, inputContent, onProgress);
      } else {
        return await this.solveInMainThread(jobName, inputContent, onProgress);
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
        stage: 'complete',
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

      // Parse results
      const results = CalculiXResultParser.parseResults(frdContent, datContent);

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
      });
    });
  }

  private extractErrors(datContent: string): string[] {
    const errors: string[] = [];
    const lines = datContent.split('\n');

    for (const line of lines) {
      if (line.includes('***ERROR') || line.includes('*ERROR*')) {
        errors.push(line.trim());
      }
    }

    return errors;
  }

  /**
   * Get module statistics (memory usage, etc.)
   */
  getStats() {
    // WASM memory info not easily accessible, but we can estimate
    return {
      initialized: !!this.module || !!this.worker,
      useWorker: this.useWorker,
      // Approximate memory from WASM heap if available
      memoryUsedMB: this.module ? 'unknown' : 'N/A',
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

