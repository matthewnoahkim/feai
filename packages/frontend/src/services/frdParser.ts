/**
 * CalculiX Results File (.frd) Parser
 * Comprehensive parser for FRD ASCII format supporting:
 * - Nodal displacements (full vector)
 * - Full stress tensor (6 components)
 * - Strain tensor (6 components)
 * - Reaction forces
 * - Modal analysis results (mode shapes + frequencies)
 * - Multi-step/time-step results
 */

import type {
  FEAMesh,
  SimulationResults,
  StaticResults,
  ModalResults,
  ModalMode,
  NodalField,
  ElementField,
  AnalysisType,
} from '@feai/shared';

export interface FRDParseResult {
  nodes: Map<number, { x: number; y: number; z: number }>;
  results: ResultDataset[];
  warnings: string[];
}

export interface ResultDataset {
  step: number;
  increment: number;
  type: string; // 'DISP', 'STRESS', 'STRAIN', 'TOSTRAIN', 'FORC', etc.
  components: string[]; // e.g., ['D1', 'D2', 'D3'] or ['SXX', 'SYY', 'SZZ', 'SXY', 'SYZ', 'SXZ']
  nodeValues: Map<number, number[]>; // nodeId -> values array
  elementValues?: Map<number, number[]>; // elementId -> values array (for element results)
}

export class CalculiXFRDParser {
  /**
   * Parse FRD file content into structured results
   */
  parseFRD(frdContent: string, mesh: FEAMesh, analysisType: AnalysisType): SimulationResults {
    const parseResult = this.parseRawFRD(frdContent);
    
    if (analysisType === 'modal') {
      return this.buildModalResults(parseResult, mesh);
    } else {
      return this.buildStaticResults(parseResult, mesh, analysisType);
    }
  }

  /**
   * Parse raw FRD format into intermediate structure
   */
  private parseRawFRD(content: string): FRDParseResult {
    const lines = content.split('\n');
    const nodes = new Map<number, { x: number; y: number; z: number }>();
    const results: ResultDataset[] = [];
    const warnings: string[] = [];
    
    let i = 0;
    let currentStep = 1;
    let currentIncrement = 1;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Node definition block (starts with "2C")
      if (line.startsWith('2C') || line.startsWith('    2C')) {
        i = this.parseNodeBlock(lines, i, nodes);
        continue;
      }
      
      // Result dataset block (starts with "100C")
      if (line.startsWith('100C') || line.includes('100C')) {
        const dataset = this.parseResultBlock(lines, i, currentStep, currentIncrement);
        if (dataset) {
          results.push(dataset.dataset);
          i = dataset.nextIndex;
          continue;
        }
      }
      
      // Step information (might be in comments or special records)
      if (line.includes('STEP') || line.includes('Step')) {
        const match = line.match(/STEP\s+(\d+)/i);
        if (match) {
          currentStep = parseInt(match[1]);
        }
      }
      
      if (line.includes('INCREMENT') || line.includes('Increment')) {
        const match = line.match(/INCREMENT\s+(\d+)/i);
        if (match) {
          currentIncrement = parseInt(match[1]);
        }
      }
      
      // End of data marker
      if (line.startsWith('9999')) {
        break;
      }
      
      i++;
    }
    
    return { nodes, results, warnings };
  }

  /**
   * Parse node coordinate block
   */
  private parseNodeBlock(
    lines: string[],
    startIndex: number,
    nodes: Map<number, { x: number; y: number; z: number }>
  ): number {
    let i = startIndex + 1;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Node data line starts with "-1"
      if (line.startsWith('-1')) {
        const parts = this.splitFortranLine(line);
        if (parts.length >= 5) {
          const nodeId = parseInt(parts[1]);
          const x = parseFloat(parts[2]);
          const y = parseFloat(parts[3]);
          const z = parseFloat(parts[4]);
          nodes.set(nodeId, { x, y, z });
        }
      }
      // End of node block ("-3")
      else if (line.startsWith('-3')) {
        return i + 1;
      }
      // Another block starts
      else if (line.startsWith('100C') || line.startsWith('1C')) {
        return i;
      }
      
      i++;
    }
    
    return i;
  }

  /**
   * Parse result dataset block
   */
  private parseResultBlock(
    lines: string[],
    startIndex: number,
    step: number,
    increment: number
  ): { dataset: ResultDataset; nextIndex: number } | null {
    let i = startIndex;
    const headerLine = lines[i].trim();
    
    // Parse dataset header
    // Format: "100C" or line with result type
    i++;
    
    // Next line should be "-4" line with dataset info
    if (i >= lines.length) return null;
    
    const datasetInfoLine = lines[i].trim();
    if (!datasetInfoLine.startsWith('-4')) {
      // Try next line
      i++;
      if (i >= lines.length || !lines[i].trim().startsWith('-4')) {
        return null;
      }
    }
    
    // Parse dataset type
    // Format: -4  DISP        4    1    (type, ncomponents, etc.)
    const parts = this.splitFortranLine(lines[i]);
    const datasetType = parts.length > 1 ? parts[1] : 'UNKNOWN';
    const numComponents = parts.length > 2 ? parseInt(parts[2]) : 3;
    
    i++;
    
    // Parse component labels ("-5" lines)
    const components: string[] = [];
    while (i < lines.length && lines[i].trim().startsWith('-5')) {
      const compLine = this.splitFortranLine(lines[i]);
      if (compLine.length > 1) {
        components.push(compLine[1]);
      }
      i++;
    }
    
    // If no components found, use defaults based on type
    if (components.length === 0) {
      components.push(...this.getDefaultComponents(datasetType, numComponents));
    }
    
    // Parse nodal values ("-1" lines)
    const nodeValues = new Map<number, number[]>();
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line.startsWith('-1')) {
        const parts = this.splitFortranLine(line);
        if (parts.length >= 2) {
          const nodeId = parseInt(parts[1]);
          const values: number[] = [];
          
          // Read all component values from this line
          for (let j = 2; j < parts.length && j < 2 + components.length; j++) {
            values.push(parseFloat(parts[j]));
          }
          
          // Some FRD formats split values across multiple lines
          // If we need more values, check next line
          if (values.length < components.length) {
            // Read continuation line if needed (not standard but possible)
          }
          
          nodeValues.set(nodeId, values);
        }
      }
      // End of dataset ("-3")
      else if (line.startsWith('-3')) {
        i++;
        break;
      }
      // Another block starts
      else if (line.startsWith('100C') || line.startsWith('1C') || line.startsWith('2C')) {
        break;
      }
      
      i++;
    }
    
    const dataset: ResultDataset = {
      step,
      increment,
      type: datasetType,
      components,
      nodeValues,
    };
    
    return { dataset, nextIndex: i };
  }

  /**
   * Get default component names for dataset type
   */
  private getDefaultComponents(type: string, count: number): string[] {
    const upper = type.toUpperCase();
    
    if (upper.includes('DISP') || upper === 'U') {
      return ['Ux', 'Uy', 'Uz', 'Umag'];
    } else if (upper.includes('STRESS') || upper === 'S') {
      return ['Sxx', 'Syy', 'Szz', 'Sxy', 'Syz', 'Sxz'];
    } else if (upper.includes('STRAIN') || upper === 'E') {
      return ['Exx', 'Eyy', 'Ezz', 'Exy', 'Eyz', 'Exz'];
    } else if (upper.includes('FORC') || upper === 'RF') {
      return ['RFx', 'RFy', 'RFz'];
    } else if (upper === 'NT' || upper.includes('TEMP')) {
      return ['Temp'];
    }
    
    // Generic
    return Array.from({ length: count }, (_, i) => `C${i + 1}`);
  }

  /**
   * Build static analysis results from parsed data
   */
  private buildStaticResults(
    parsed: FRDParseResult,
    mesh: FEAMesh,
    analysisType: AnalysisType
  ): SimulationResults {
    // Find displacement dataset
    const dispDataset = parsed.results.find(r => 
      r.type.includes('DISP') || r.type === 'U'
    );
    
    // Find stress dataset
    const stressDataset = parsed.results.find(r => 
      r.type.includes('STRESS') || r.type === 'S'
    );
    
    // Find strain dataset
    const strainDataset = parsed.results.find(r => 
      r.type.includes('STRAIN') || r.type === 'E'
    );
    
    // Find reaction forces
    const reactionDataset = parsed.results.find(r => 
      r.type.includes('FORC') || r.type === 'RF'
    );
    
    // Build displacement field
    const displacements = this.buildNodalField(
      dispDataset,
      'Displacement',
      'mm',
      ['Ux', 'Uy', 'Uz', 'Umag']
    );
    
    // Build stress field (convert to von Mises)
    const vonMisesStress = this.buildVonMisesField(stressDataset);
    
    // Build full stress tensor field
    const stresses = this.buildElementField(
      stressDataset,
      'Stress',
      'MPa',
      ['Sxx', 'Syy', 'Szz', 'Sxy', 'Syz', 'Sxz']
    );
    
    // Build strain field
    const strains = strainDataset ? this.buildElementField(
      strainDataset,
      'Strain',
      '',
      ['Exx', 'Eyy', 'Ezz', 'Exy', 'Eyz', 'Exz']
    ) : undefined;
    
    // Build reaction forces
    const reactionForces = reactionDataset ? this.buildReactionForces(reactionDataset) : undefined;
    
    // Calculate summary
    const summary = this.calculateSummary(displacements, vonMisesStress, parsed.nodes);
    
    const staticResults: StaticResults = {
      displacements,
      vonMisesStress,
      stresses,
      strains,
      reactionForces,
      summary,
    };
    
    return {
      simulationId: `sim-${Date.now()}`,
      analysisType,
      solveTime: 0,
      timestamp: new Date().toISOString(),
      staticResults,
      meshNodeCount: mesh.nodeCount,
      meshElementCount: mesh.elementCount,
    };
  }

  /**
   * Build modal analysis results with frequencies and mode shapes
   */
  private buildModalResults(
    parsed: FRDParseResult,
    mesh: FEAMesh
  ): SimulationResults {
    const modes: ModalMode[] = [];
    
    // Each displacement dataset in modal analysis is a mode shape
    const dispDatasets = parsed.results.filter(r => 
      r.type.includes('DISP') || r.type === 'U'
    );
    
    for (let i = 0; i < dispDatasets.length; i++) {
      const dataset = dispDatasets[i];
      
      // Mode shape is the displacement field
      const modeShape = this.buildNodalField(
        dataset,
        `Mode ${i + 1}`,
        '',
        ['Ux', 'Uy', 'Uz', 'Umag']
      );
      
      // Frequency would come from .dat file or eigenvalue output
      // For now, use placeholder (would need to parse .dat)
      const frequency = 0; // Hz - to be extracted from .dat
      const angularFrequency = 2 * Math.PI * frequency;
      
      modes.push({
        modeNumber: i + 1,
        frequency,
        angularFrequency,
        modeShape,
      });
    }
    
    const modalResults: ModalResults = {
      modes,
    };
    
    return {
      simulationId: `sim-${Date.now()}`,
      analysisType: 'modal',
      solveTime: 0,
      timestamp: new Date().toISOString(),
      modalResults,
      meshNodeCount: mesh.nodeCount,
      meshElementCount: mesh.elementCount,
    };
  }

  /**
   * Build nodal field from dataset
   */
  private buildNodalField(
    dataset: ResultDataset | undefined,
    name: string,
    unit: string,
    componentNames: string[]
  ): NodalField {
    if (!dataset || !dataset.nodeValues) {
      return {
        name,
        unit,
        nodeValues: [],
        componentNames,
        min: 0,
        max: 0,
        avg: 0,
      };
    }
    
    const nodeValues: { nodeId: number; values: number[] }[] = [];
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    
    for (const [nodeId, values] of dataset.nodeValues.entries()) {
      nodeValues.push({ nodeId, values });
      
      // Use magnitude (last component) or first component for min/max
      const magnitude = values[values.length - 1] || values[0] || 0;
      min = Math.min(min, magnitude);
      max = Math.max(max, magnitude);
      sum += magnitude;
    }
    
    const avg = nodeValues.length > 0 ? sum / nodeValues.length : 0;
    
    return {
      name,
      unit,
      nodeValues,
      componentNames,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      avg,
    };
  }

  /**
   * Build element field from dataset
   */
  private buildElementField(
    dataset: ResultDataset | undefined,
    name: string,
    unit: string,
    componentNames: string[]
  ): ElementField {
    if (!dataset) {
      return {
        name,
        unit,
        elementValues: [],
        componentNames,
        min: 0,
        max: 0,
      };
    }
    
    const elementValues: { elementId: number; values: number[] }[] = [];
    let min = Infinity;
    let max = -Infinity;
    
    // If nodeValues exist, treat them as element values (CalculiX sometimes outputs element data as nodes)
    if (dataset.nodeValues) {
      for (const [id, values] of dataset.nodeValues.entries()) {
        elementValues.push({ elementId: id, values });
        
        const value = values[0] || 0;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    
    return {
      name,
      unit,
      elementValues,
      componentNames,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }

  /**
   * Calculate von Mises stress from full stress tensor
   */
  private buildVonMisesField(stressDataset: ResultDataset | undefined): NodalField {
    if (!stressDataset || !stressDataset.nodeValues) {
      return {
        name: 'von Mises Stress',
        unit: 'MPa',
        nodeValues: [],
        componentNames: ['Mises'],
        min: 0,
        max: 0,
      };
    }
    
    const nodeValues: { nodeId: number; values: number[] }[] = [];
    let min = Infinity;
    let max = -Infinity;
    
    for (const [nodeId, stressComponents] of stressDataset.nodeValues.entries()) {
      // Extract stress components (Sxx, Syy, Szz, Sxy, Syz, Sxz)
      const sxx = stressComponents[0] || 0;
      const syy = stressComponents[1] || 0;
      const szz = stressComponents[2] || 0;
      const sxy = stressComponents[3] || 0;
      const syz = stressComponents[4] || 0;
      const sxz = stressComponents[5] || 0;
      
      // von Mises formula: sqrt(0.5 * ((sxx-syy)² + (syy-szz)² + (szz-sxx)² + 6*(sxy² + syz² + sxz²)))
      const vonMises = Math.sqrt(
        0.5 * (
          Math.pow(sxx - syy, 2) +
          Math.pow(syy - szz, 2) +
          Math.pow(szz - sxx, 2) +
          6 * (Math.pow(sxy, 2) + Math.pow(syz, 2) + Math.pow(sxz, 2))
        )
      );
      
      nodeValues.push({ nodeId, values: [vonMises] });
      min = Math.min(min, vonMises);
      max = Math.max(max, vonMises);
    }
    
    return {
      name: 'von Mises Stress',
      unit: 'MPa',
      nodeValues,
      componentNames: ['Mises'],
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }

  /**
   * Build reaction forces array
   */
  private buildReactionForces(
    reactionDataset: ResultDataset
  ): { nodeId: number; fx: number; fy: number; fz: number }[] {
    const reactions: { nodeId: number; fx: number; fy: number; fz: number }[] = [];
    
    for (const [nodeId, values] of reactionDataset.nodeValues.entries()) {
      reactions.push({
        nodeId,
        fx: values[0] || 0,
        fy: values[1] || 0,
        fz: values[2] || 0,
      });
    }
    
    return reactions;
  }

  /**
   * Calculate result summary statistics
   */
  private calculateSummary(
    displacements: NodalField,
    vonMisesStress: NodalField,
    nodes: Map<number, { x: number; y: number; z: number }>
  ) {
    let maxDispMag = 0;
    let maxDispNodeId = 0;
    let maxDispLoc = { x: 0, y: 0, z: 0 };
    
    let maxStress = 0;
    let maxStressNodeId = 0;
    let maxStressLoc = { x: 0, y: 0, z: 0 };
    
    let minStress = Infinity;
    let minStressNodeId = 0;
    
    // Find max displacement
    for (const { nodeId, values } of displacements.nodeValues as any[]) {
      const magnitude = values[values.length - 1] || 0;
      if (magnitude > maxDispMag) {
        maxDispMag = magnitude;
        maxDispNodeId = nodeId;
        const node = nodes.get(nodeId);
        if (node) {
          maxDispLoc = node;
        }
      }
    }
    
    // Find max/min stress
    for (const { nodeId, values } of vonMisesStress.nodeValues as any[]) {
      const stress = values[0] || 0;
      if (stress > maxStress) {
        maxStress = stress;
        maxStressNodeId = nodeId;
        const node = nodes.get(nodeId);
        if (node) {
          maxStressLoc = node;
        }
      }
      if (stress < minStress) {
        minStress = stress;
        minStressNodeId = nodeId;
      }
    }
    
    return {
      maxDisplacement: {
        magnitude: maxDispMag,
        nodeId: maxDispNodeId,
        location: maxDispLoc,
      },
      maxVonMisesStress: {
        value: maxStress,
        nodeId: maxStressNodeId,
        location: maxStressLoc,
      },
      minVonMisesStress: {
        value: minStress === Infinity ? 0 : minStress,
        nodeId: minStressNodeId,
      },
    };
  }

  /**
   * Parse frequencies from .dat file
   */
  parseFrequenciesFromDat(datContent: string): number[] {
    const frequencies: number[] = [];
    const lines = datContent.split('\n');
    
    for (const line of lines) {
      // Look for frequency output lines
      // Format examples:
      // "Eigenfrequency 1: 123.45 Hz"
      // "MODE    1  FREQUENCY =   1.2345E+02 Hz"
      
      const match1 = line.match(/Eigenfrequency\s+\d+:\s+([\d.Ee+-]+)/i);
      if (match1) {
        frequencies.push(parseFloat(match1[1]));
        continue;
      }
      
      const match2 = line.match(/MODE\s+\d+\s+FREQUENCY\s*=\s*([\d.Ee+-]+)/i);
      if (match2) {
        frequencies.push(parseFloat(match2[1]));
        continue;
      }
    }
    
    return frequencies;
  }

  /**
   * Split Fortran-style formatted line (fixed or free format)
   */
  private splitFortranLine(line: string): string[] {
    // Try splitting by whitespace first
    const parts = line.trim().split(/\s+/);
    
    // Filter empty parts
    return parts.filter(p => p.length > 0);
  }

  /**
   * Parse warnings and errors from .dat file
   */
  parseWarningsFromDat(datContent: string): string[] {
    const warnings: string[] = [];
    const lines = datContent.split('\n');
    
    for (const line of lines) {
      if (line.includes('*WARNING') || line.includes('WARNING:')) {
        warnings.push(line.trim());
      }
    }
    
    return warnings;
  }
}

// Singleton instance
export const frdParser = new CalculiXFRDParser();

