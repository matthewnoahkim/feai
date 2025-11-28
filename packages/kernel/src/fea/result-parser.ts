/**
 * CalculiX Result File Parser
 * Parses .frd (results) and .dat (log) files
 */

import {
  SimulationResults,
  StaticResults,
  ModalResults,
  ModalMode,
  NodalField,
  ElementField,
  ResultsSummary,
  Vector3,
  AnalysisType,
} from '@feai/shared';

interface ParsedNode {
  id: number;
  x: number;
  y: number;
  z: number;
}

interface ParsedDisplacement {
  nodeId: number;
  ux: number;
  uy: number;
  uz: number;
  magnitude: number;
}

interface ParsedStress {
  elementId: number;
  nodeId: number;  // Integration point or node
  sxx: number;
  syy: number;
  szz: number;
  sxy: number;
  syz: number;
  szx: number;
  vonMises: number;
}

export class ResultParser {
  private nodes: Map<number, ParsedNode> = new Map();
  private displacements: Map<number, ParsedDisplacement> = new Map();
  private stresses: Map<number, ParsedStress[]> = new Map(); // nodeId -> stresses

  /**
   * Parse CalculiX .frd result file (ASCII format)
   */
  parseFrdFile(content: string): {
    displacements: ParsedDisplacement[];
    stresses: ParsedStress[];
    nodes: ParsedNode[];
  } {
    this.nodes.clear();
    this.displacements.clear();
    this.stresses.clear();

    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Node coordinates block
      if (line.startsWith('2C') && line.includes('NODAL COORDINATES')) {
        i = this.parseNodalCoordinates(lines, i + 1);
        continue;
      }

      // Displacement results block
      if (line.startsWith('100C') || (line.includes('DISP') && !line.includes('*'))) {
        i = this.parseDisplacementResults(lines, i + 1);
        continue;
      }

      // Stress results block
      if (line.startsWith('100C') || (line.includes('STRESS') && !line.includes('*'))) {
        i = this.parseStressResults(lines, i + 1);
        continue;
      }

      i++;
    }

    return {
      displacements: Array.from(this.displacements.values()),
      stresses: this.flattenStresses(),
      nodes: Array.from(this.nodes.values()),
    };
  }

  /**
   * Parse simplified result format (for testing/mock data)
   */
  parseSimplifiedResults(
    nodeData: { id: number; x: number; y: number; z: number }[],
    dispData: { nodeId: number; ux: number; uy: number; uz: number }[],
    stressData: { nodeId: number; vonMises: number }[]
  ): SimulationResults {
    // Convert to internal format
    for (const node of nodeData) {
      this.nodes.set(node.id, node);
    }

    for (const disp of dispData) {
      const magnitude = Math.sqrt(disp.ux ** 2 + disp.uy ** 2 + disp.uz ** 2);
      this.displacements.set(disp.nodeId, { ...disp, magnitude });
    }

    return this.buildResults('static');
  }

  /**
   * Build SimulationResults from parsed data
   */
  buildResults(analysisType: AnalysisType): SimulationResults {
    if (analysisType === 'modal') {
      return this.buildModalResults();
    }
    return this.buildStaticResults();
  }

  private buildStaticResults(): SimulationResults {
    const dispArray = Array.from(this.displacements.values());
    const stressArray = this.flattenStresses();

    // Build displacement field
    const displacements: NodalField = {
      name: 'Displacement',
      unit: 'mm',
      nodeValues: dispArray.map((d) => ({
        nodeId: d.nodeId,
        values: [d.ux, d.uy, d.uz, d.magnitude],
      })),
      componentNames: ['Ux', 'Uy', 'Uz', 'Magnitude'],
      min: Math.min(...dispArray.map((d) => d.magnitude)),
      max: Math.max(...dispArray.map((d) => d.magnitude)),
    };

    // Build von Mises stress field (averaged to nodes)
    const vonMisesMap = new Map<number, number[]>();
    for (const s of stressArray) {
      const existing = vonMisesMap.get(s.nodeId) || [];
      existing.push(s.vonMises);
      vonMisesMap.set(s.nodeId, existing);
    }

    const vonMisesNodeValues: { nodeId: number; values: number[] }[] = [];
    for (const [nodeId, values] of vonMisesMap) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      vonMisesNodeValues.push({ nodeId, values: [avg] });
    }

    const vonMisesStress: NodalField = {
      name: 'Von Mises Stress',
      unit: 'Pa',
      nodeValues: vonMisesNodeValues,
      componentNames: ['Mises'],
      min: Math.min(...vonMisesNodeValues.map((v) => v.values[0])),
      max: Math.max(...vonMisesNodeValues.map((v) => v.values[0])),
    };

    // Build element stress field
    const stresses: ElementField = {
      name: 'Stress Tensor',
      unit: 'Pa',
      elementValues: stressArray.map((s) => ({
        elementId: s.elementId,
        values: [s.sxx, s.syy, s.szz, s.sxy, s.syz, s.szx, s.vonMises],
      })),
      componentNames: ['Sxx', 'Syy', 'Szz', 'Sxy', 'Syz', 'Szx', 'Mises'],
      min: Math.min(...stressArray.map((s) => s.vonMises)),
      max: Math.max(...stressArray.map((s) => s.vonMises)),
    };

    // Find max displacement location
    const maxDisp = dispArray.reduce((max, d) =>
      d.magnitude > max.magnitude ? d : max
    , dispArray[0] || { nodeId: 0, magnitude: 0 });

    const maxDispNode = this.nodes.get(maxDisp?.nodeId);

    // Find max stress location
    const maxStress = vonMisesNodeValues.reduce((max, v) =>
      v.values[0] > max.values[0] ? v : max
    , vonMisesNodeValues[0] || { nodeId: 0, values: [0] });

    const maxStressNode = this.nodes.get(maxStress?.nodeId);

    // Find min stress
    const minStress = vonMisesNodeValues.reduce((min, v) =>
      v.values[0] < min.values[0] ? v : min
    , vonMisesNodeValues[0] || { nodeId: 0, values: [0] });

    const summary: ResultsSummary = {
      maxDisplacement: {
        magnitude: maxDisp?.magnitude || 0,
        nodeId: maxDisp?.nodeId || 0,
        location: maxDispNode
          ? { x: maxDispNode.x, y: maxDispNode.y, z: maxDispNode.z }
          : { x: 0, y: 0, z: 0 },
      },
      maxVonMisesStress: {
        value: maxStress?.values[0] || 0,
        nodeId: maxStress?.nodeId || 0,
        location: maxStressNode
          ? { x: maxStressNode.x, y: maxStressNode.y, z: maxStressNode.z }
          : { x: 0, y: 0, z: 0 },
      },
      minVonMisesStress: {
        value: minStress?.values[0] || 0,
        nodeId: minStress?.nodeId || 0,
      },
    };

    const staticResults: StaticResults = {
      displacements,
      stresses,
      vonMisesStress,
      summary,
    };

    return {
      simulationId: '',
      analysisType: 'static',
      solveTime: 0,
      timestamp: new Date().toISOString(),
      staticResults,
      meshNodeCount: this.nodes.size,
      meshElementCount: 0,
    };
  }

  private buildModalResults(): SimulationResults {
    // Modal results would include mode shapes and frequencies
    // This is a placeholder for modal analysis results
    const modalResults: ModalResults = {
      modes: [],
    };

    return {
      simulationId: '',
      analysisType: 'modal',
      solveTime: 0,
      timestamp: new Date().toISOString(),
      modalResults,
      meshNodeCount: this.nodes.size,
      meshElementCount: 0,
    };
  }

  private parseNodalCoordinates(lines: string[], startIndex: number): number {
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i].trim();

      // End of block marker
      if (line.startsWith('-3')) {
        return i + 1;
      }

      // Skip non-data lines
      if (!line.startsWith('-1') && !line.startsWith('-2')) {
        i++;
        continue;
      }

      // Parse node data: -1 nodeId x y z
      if (line.startsWith('-1')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 5) {
          const nodeId = parseInt(parts[1]);
          const x = parseFloat(parts[2]);
          const y = parseFloat(parts[3]);
          const z = parseFloat(parts[4]);

          if (!isNaN(nodeId) && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
            this.nodes.set(nodeId, { id: nodeId, x, y, z });
          }
        }
      }

      i++;
    }

    return i;
  }

  private parseDisplacementResults(lines: string[], startIndex: number): number {
    let i = startIndex;

    while (i < lines.length) {
      const line = lines[i].trim();

      // End of block
      if (line.startsWith('-3')) {
        return i + 1;
      }

      // Parse displacement data: -1 nodeId ux uy uz
      if (line.startsWith('-1')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 5) {
          const nodeId = parseInt(parts[1]);
          const ux = parseFloat(parts[2]);
          const uy = parseFloat(parts[3]);
          const uz = parseFloat(parts[4]);

          if (!isNaN(nodeId) && !isNaN(ux) && !isNaN(uy) && !isNaN(uz)) {
            const magnitude = Math.sqrt(ux ** 2 + uy ** 2 + uz ** 2);
            this.displacements.set(nodeId, { nodeId, ux, uy, uz, magnitude });
          }
        }
      }

      i++;
    }

    return i;
  }

  private parseStressResults(lines: string[], startIndex: number): number {
    let i = startIndex;
    let currentElementId = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // End of block
      if (line.startsWith('-3')) {
        return i + 1;
      }

      // Element header: -1 elementId ...
      if (line.startsWith('-1')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          currentElementId = parseInt(parts[1]);
        }
      }

      // Stress data at integration point or node: -2 nodeId sxx syy szz sxy syz szx
      if (line.startsWith('-2')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 8) {
          const nodeId = parseInt(parts[1]);
          const sxx = parseFloat(parts[2]);
          const syy = parseFloat(parts[3]);
          const szz = parseFloat(parts[4]);
          const sxy = parseFloat(parts[5]);
          const syz = parseFloat(parts[6]);
          const szx = parseFloat(parts[7]);

          if (!isNaN(nodeId)) {
            // Calculate von Mises stress
            const vonMises = this.calculateVonMises(sxx, syy, szz, sxy, syz, szx);

            const existing = this.stresses.get(nodeId) || [];
            existing.push({
              elementId: currentElementId,
              nodeId,
              sxx,
              syy,
              szz,
              sxy,
              syz,
              szx,
              vonMises,
            });
            this.stresses.set(nodeId, existing);
          }
        }
      }

      i++;
    }

    return i;
  }

  /**
   * Calculate von Mises equivalent stress
   */
  private calculateVonMises(
    sxx: number,
    syy: number,
    szz: number,
    sxy: number,
    syz: number,
    szx: number
  ): number {
    // σ_vm = sqrt(0.5 * ((σxx-σyy)² + (σyy-σzz)² + (σzz-σxx)² + 6*(τxy² + τyz² + τzx²)))
    const term1 = (sxx - syy) ** 2;
    const term2 = (syy - szz) ** 2;
    const term3 = (szz - sxx) ** 2;
    const term4 = 6 * (sxy ** 2 + syz ** 2 + szx ** 2);

    return Math.sqrt(0.5 * (term1 + term2 + term3 + term4));
  }

  private flattenStresses(): ParsedStress[] {
    const result: ParsedStress[] = [];
    for (const stressArray of this.stresses.values()) {
      result.push(...stressArray);
    }
    return result;
  }

  /**
   * Parse .dat file for solver messages and additional results
   */
  parseDatFile(content: string): {
    success: boolean;
    errors: string[];
    warnings: string[];
    solveTime?: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let success = true;
    let solveTime: number | undefined;

    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for errors
      if (
        trimmed.includes('*ERROR') ||
        trimmed.includes('**ERROR') ||
        trimmed.includes('***ERROR')
      ) {
        success = false;
        errors.push(trimmed);
      }

      // Check for warnings
      if (
        trimmed.includes('*WARNING') ||
        trimmed.includes('**WARNING')
      ) {
        warnings.push(trimmed);
      }

      // Extract solve time if available
      if (trimmed.includes('total solver time')) {
        const match = trimmed.match(/(\d+\.?\d*)\s*s/);
        if (match) {
          solveTime = parseFloat(match[1]);
        }
      }
    }

    return { success, errors, warnings, solveTime };
  }

  /**
   * Generate mock results for testing UI
   */
  generateMockResults(
    nodeCount: number,
    elementCount: number
  ): SimulationResults {
    // Generate mock node positions
    const gridSize = Math.ceil(Math.cbrt(nodeCount));
    const spacing = 10; // mm

    for (let i = 1; i <= nodeCount; i++) {
      const ix = (i - 1) % gridSize;
      const iy = Math.floor((i - 1) / gridSize) % gridSize;
      const iz = Math.floor((i - 1) / (gridSize * gridSize));

      this.nodes.set(i, {
        id: i,
        x: ix * spacing,
        y: iy * spacing,
        z: iz * spacing,
      });
    }

    // Generate mock displacements (cantilever-like: fixed at z=0, deflects in -z)
    for (const [nodeId, node] of this.nodes) {
      // Displacement increases with distance from fixed end
      const distFromFixed = node.z;
      const ux = 0;
      const uy = 0;
      const uz = -0.001 * distFromFixed * distFromFixed; // Parabolic deflection
      const magnitude = Math.abs(uz);

      this.displacements.set(nodeId, { nodeId, ux, uy, uz, magnitude });
    }

    // Generate mock stresses (higher near fixed end)
    for (const [nodeId, node] of this.nodes) {
      const maxZ = (gridSize - 1) * spacing;
      const stressFactor = 1 - node.z / maxZ; // Higher at z=0

      // Typical bending stress distribution
      const sxx = 200e6 * stressFactor; // 200 MPa max
      const syy = 50e6 * stressFactor;
      const szz = 0;
      const sxy = 30e6 * stressFactor;
      const syz = 0;
      const szx = 20e6 * stressFactor;

      const vonMises = this.calculateVonMises(sxx, syy, szz, sxy, syz, szx);

      this.stresses.set(nodeId, [
        {
          elementId: nodeId,
          nodeId,
          sxx,
          syy,
          szz,
          sxy,
          syz,
          szx,
          vonMises,
        },
      ]);
    }

    const results = this.buildResults('static');
    results.meshNodeCount = nodeCount;
    results.meshElementCount = elementCount;
    results.solveTime = 2.5;

    return results;
  }
}

export const resultParser = new ResultParser();

