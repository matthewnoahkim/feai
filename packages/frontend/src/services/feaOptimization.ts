/**
 * Memory and Performance Management for FEA WASM
 * Handles memory constraints, performance monitoring, and optimization
 */

export interface MemoryStats {
  used: number;      // Bytes used
  available: number; // Bytes available
  limit: number;     // Browser/WASM limit
  percentage: number; // Usage percentage
}

export interface PerformanceMetrics {
  meshGenerationTime: number;
  solverInitTime: number;
  solverTime: number;
  parseTime: number;
  totalTime: number;
  nodeCount: number;
  elementCount: number;
}

export class FEAMemoryManager {
  // Conservative limits for browser WASM (typically 2GB max, but stay well below)
  private static readonly MAX_MEMORY_BYTES = 1.5 * 1024 * 1024 * 1024; // 1.5 GB
  private static readonly WARNING_THRESHOLD = 0.75; // Warn at 75%
  private static readonly CRITICAL_THRESHOLD = 0.9; // Critical at 90%
  
  // Estimated memory usage per element (very rough estimates)
  private static readonly BYTES_PER_NODE = 96; // ~96 bytes (coordinates, results, etc.)
  private static readonly BYTES_PER_ELEMENT = 256; // ~256 bytes (connectivity, stiffness contribution)
  
  /**
   * Estimate memory usage for a given mesh size
   */
  static estimateMemoryUsage(nodeCount: number, elementCount: number): number {
    const nodeMemory = nodeCount * this.BYTES_PER_NODE;
    const elementMemory = elementCount * this.BYTES_PER_ELEMENT;
    
    // Add overhead for stiffness matrix (sparse storage)
    // Rough estimate: ~50 bytes per DOF for sparse matrix
    const dofCount = nodeCount * 3; // 3 DOFs per node for 3D
    const matrixMemory = dofCount * 50;
    
    // Add solver overhead
    const solverOverhead = 50 * 1024 * 1024; // 50 MB for solver internals
    
    return nodeMemory + elementMemory + matrixMemory + solverOverhead;
  }

  /**
   * Check if mesh size is within memory limits
   */
  static checkMemoryLimits(nodeCount: number, elementCount: number): {
    ok: boolean;
    estimatedMemory: number;
    percentageOfLimit: number;
    message: string;
  } {
    const estimated = this.estimateMemoryUsage(nodeCount, elementCount);
    const percentage = estimated / this.MAX_MEMORY_BYTES;
    
    if (percentage > this.CRITICAL_THRESHOLD) {
      return {
        ok: false,
        estimatedMemory: estimated,
        percentageOfLimit: percentage,
        message: `Mesh too large! Estimated ${(estimated / 1024 / 1024).toFixed(0)} MB (${(percentage * 100).toFixed(0)}% of limit). Reduce element count or use server solver.`,
      };
    }
    
    if (percentage > this.WARNING_THRESHOLD) {
      return {
        ok: true,
        estimatedMemory: estimated,
        percentageOfLimit: percentage,
        message: `Warning: Large mesh may strain browser. Estimated ${(estimated / 1024 / 1024).toFixed(0)} MB (${(percentage * 100).toFixed(0)}% of limit).`,
      };
    }
    
    return {
      ok: true,
      estimatedMemory: estimated,
      percentageOfLimit: percentage,
      message: `Mesh size OK. Estimated ${(estimated / 1024 / 1024).toFixed(0)} MB (${(percentage * 100).toFixed(0)}% of limit).`,
    };
  }

  /**
   * Get recommended maximum mesh size
   */
  static getRecommendedLimits(): {
    maxNodes: number;
    maxElements: number;
    safeNodes: number;
    safeElements: number;
  } {
    // Work backwards from memory limit
    const targetMemory = this.MAX_MEMORY_BYTES * this.WARNING_THRESHOLD;
    
    // Solve for node/element count (assuming typical ratio of 1 node : 5 elements for tets)
    const solverOverhead = 50 * 1024 * 1024;
    const availableForMesh = targetMemory - solverOverhead;
    
    // Rough calculation (this is simplified)
    const maxNodes = Math.floor(availableForMesh / (this.BYTES_PER_NODE + 5 * this.BYTES_PER_ELEMENT + 150));
    const maxElements = maxNodes * 5;
    
    return {
      maxNodes: Math.min(maxNodes, 10000), // Cap at 10k nodes
      maxElements: Math.min(maxElements, 50000), // Cap at 50k elements
      safeNodes: Math.min(5000, maxNodes / 2),
      safeElements: Math.min(25000, maxElements / 2),
    };
  }

  /**
   * Get current browser memory info (if available)
   */
  static async getBrowserMemoryInfo(): Promise<MemoryStats | null> {
    // TypeScript doesn't have types for this experimental API
    const performance = (window as any).performance;
    
    if (performance && performance.memory) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
      };
    }
    
    return null;
  }

  /**
   * Monitor memory during solve
   */
  static startMemoryMonitoring(onUpdate: (stats: MemoryStats) => void): () => void {
    const interval = setInterval(async () => {
      const stats = await this.getBrowserMemoryInfo();
      if (stats) {
        onUpdate(stats);
        
        // Warn if approaching limits
        if (stats.percentage > this.CRITICAL_THRESHOLD) {
          console.warn('[FEA] Critical memory usage:', (stats.percentage * 100).toFixed(1) + '%');
        }
      }
    }, 1000); // Check every second
    
    // Return cleanup function
    return () => clearInterval(interval);
  }
}

/**
 * Performance tracking for FEA operations
 */
export class FEAPerformanceTracker {
  private timers: Map<string, number> = new Map();
  private metrics: Partial<PerformanceMetrics> = {};

  /**
   * Start timing an operation
   */
  start(operation: string): void {
    this.timers.set(operation, performance.now());
  }

  /**
   * End timing an operation
   */
  end(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      console.warn(`[Performance] Timer not found for: ${operation}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(operation);
    
    // Store in metrics
    switch (operation) {
      case 'meshGeneration':
        this.metrics.meshGenerationTime = duration;
        break;
      case 'solverInit':
        this.metrics.solverInitTime = duration;
        break;
      case 'solver':
        this.metrics.solverTime = duration;
        break;
      case 'parse':
        this.metrics.parseTime = duration;
        break;
      case 'total':
        this.metrics.totalTime = duration;
        break;
    }
    
    console.log(`[Performance] ${operation}: ${duration.toFixed(0)} ms`);
    return duration;
  }

  /**
   * Set mesh info
   */
  setMeshInfo(nodeCount: number, elementCount: number): void {
    this.metrics.nodeCount = nodeCount;
    this.metrics.elementCount = elementCount;
  }

  /**
   * Get complete metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics;
  }

  /**
   * Get formatted summary
   */
  getSummary(): string {
    const m = this.metrics;
    return `
FEA Performance Summary:
- Mesh: ${m.nodeCount} nodes, ${m.elementCount} elements
- Mesh Generation: ${(m.meshGenerationTime || 0).toFixed(0)} ms
- Solver Init: ${(m.solverInitTime || 0).toFixed(0)} ms
- Solver Time: ${(m.solverTime || 0).toFixed(0)} ms
- Parse Time: ${(m.parseTime || 0).toFixed(0)} ms
- Total Time: ${(m.totalTime || 0).toFixed(0)} ms
`;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.timers.clear();
    this.metrics = {};
  }
}

/**
 * Lazy loader for WASM module
 */
export class WASMModuleLoader {
  private loadPromise: Promise<any> | null = null;
  private module: any = null;

  /**
   * Lazy load WASM module only when needed
   */
  async load(onProgress?: (percent: number) => void): Promise<any> {
    if (this.module) {
      return this.module;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.performLoad(onProgress);
    this.module = await this.loadPromise;
    return this.module;
  }

  private async performLoad(onProgress?: (percent: number) => void): Promise<any> {
    console.log('[WASM] Starting lazy load...');
    onProgress?.(0);

    // Check if files exist and get size
    try {
      const wasmResponse = await fetch('/wasm/calculix.wasm', { method: 'HEAD' });
      const wasmSize = parseInt(wasmResponse.headers.get('content-length') || '0');
      
      console.log(`[WASM] Module size: ${(wasmSize / 1024 / 1024).toFixed(2)} MB`);
      
      onProgress?.(10);

      // Dynamically import the solver module
      const { calculixSolver } = await import('./calculixWasmSolver');
      
      onProgress?.(50);

      // Initialize the module
      await calculixSolver.initialize();
      
      onProgress?.(100);
      
      console.log('[WASM] Module loaded successfully');
      return calculixSolver;
    } catch (error) {
      console.error('[WASM] Failed to load:', error);
      throw new Error('Failed to load CalculiX WASM module. Ensure calculix.wasm and calculix.js are in /public/wasm/');
    }
  }

  /**
   * Check if module is loaded
   */
  isLoaded(): boolean {
    return this.module !== null;
  }

  /**
   * Unload module to free memory
   */
  unload(): void {
    if (this.module) {
      this.module.terminate?.();
      this.module = null;
      this.loadPromise = null;
      console.log('[WASM] Module unloaded');
    }
  }
}

// Singleton instances
export const memoryManager = FEAMemoryManager;
export const performanceTracker = new FEAPerformanceTracker();
export const wasmLoader = new WASMModuleLoader();

