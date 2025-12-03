/**
 * CalculiX FRD Results Parser
 * Parses .frd format output from CalculiX
 */

export interface ParsedResults {
  displacements: Map<number, number[]>; // nodeId -> [Ux, Uy, Uz, magnitude]
  stresses: Map<number, number[]>; // nodeId -> [σxx, σyy, σzz, τxy, τyz, τxz]
  strains?: Map<number, number[]>; // nodeId -> [εxx, εyy, εzz, γxy, γyz, γxz]
  vonMisesStress: Map<number, number>;
  reactions?: Map<number, number[]>; // nodeId -> [RFx, RFy, RFz]
  temperatures?: Map<number, number>; // For thermal analysis
  modeShapes?: ModeShape[]; // For modal analysis
  stepNumber: number;
  incrementNumber: number;
}

export interface ModeShape {
  mode: number;
  frequency: number;
  displacements: Map<number, number[]>;
}

export class FRDParser {
  /**
   * Parse CalculiX .frd file (ASCII format)
   */
  static parse(frdContent: string, datContent?: string): ParsedResults {
    const lines = frdContent.split('\n');
    
    const result: ParsedResults = {
      displacements: new Map(),
      stresses: new Map(),
      vonMisesStress: new Map(),
      stepNumber: 1,
      incrementNumber: 1,
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      // Check for result dataset header (100C)
      if (line.startsWith('100C') || line.match(/^\s*100C/)) {
        i++;
        i = this.parseDataset(lines, i, result);
      } else {
        i++;
      }
    }

    // Compute von Mises from stress tensor
    this.computeVonMises(result);

    // Parse modal frequencies from .dat if available
    if (datContent) {
      this.parseModalFrequencies(datContent, result);
    }

    return result;
  }

  private static parseDataset(
    lines: string[],
    startIdx: number,
    result: ParsedResults
  ): number {
    let i = startIdx;
    
    // Parse dataset header (-4 line)
    if (!lines[i] || !lines[i].includes('-4')) {
      return i + 1;
    }

    const headerLine = lines[i];
    const datasetName = this.extractDatasetName(headerLine);
    const numComponents = this.extractNumComponents(headerLine);

    i++; // Move past header

    // Parse component labels (-5 lines)
    const componentLabels: string[] = [];
    while (i < lines.length && lines[i].includes('-5')) {
      const label = this.extractComponentLabel(lines[i]);
      componentLabels.push(label);
      i++;
    }

    // Parse data values (-1 lines)
    const dataMap = new Map<number, number[]>();
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line.startsWith('-3')) {
        // End of dataset
        break;
      }

      if (line.startsWith('-1')) {
        const { nodeId, values } = this.parseDataLine(line, numComponents);
        if (nodeId !== null) {
          dataMap.set(nodeId, values);
        }
      }

      i++;
    }

    // Store data in appropriate result field
    this.storeDataset(datasetName, dataMap, result);

    return i + 1; // Move past -3 line
  }

  private static extractDatasetName(headerLine: string): string {
    // Format: -4  DISP    3   1
    // Extract "DISP" or similar
    const match = headerLine.match(/-4\s+(\w+)/);
    return match ? match[1] : 'UNKNOWN';
  }

  private static extractNumComponents(headerLine: string): number {
    // Format: -4  DISP    3   1
    // Extract the "3" (number of components)
    const match = headerLine.match(/-4\s+\w+\s+(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private static extractComponentLabel(line: string): string {
    // Format: -5  D1      1    2    1    0
    // Extract "D1"
    const match = line.match(/-5\s+(\w+)/);
    return match ? match[1] : '';
  }

  private static parseDataLine(line: string, numComponents: number): {
    nodeId: number | null;
    values: number[];
  } {
    // Format: -1    1 0.00000E+00 1.00000E+00 1.00000E+00
    // Node ID followed by values in scientific notation
    
    const parts = line.trim().split(/\s+/);
    
    if (parts.length < 2) {
      return { nodeId: null, values: [] };
    }

    const nodeId = parseInt(parts[1]);
    const values: number[] = [];

    for (let i = 2; i < Math.min(parts.length, 2 + numComponents); i++) {
      values.push(parseFloat(parts[i]));
    }

    return { nodeId, values };
  }

  private static storeDataset(
    name: string,
    data: Map<number, number[]>,
    result: ParsedResults
  ): void {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('disp') || nameLower === 'u') {
      // Displacement data - compute magnitude
      for (const [nodeId, values] of data) {
        if (values.length >= 3) {
          const magnitude = Math.sqrt(
            values[0] ** 2 + values[1] ** 2 + values[2] ** 2
          );
          result.displacements.set(nodeId, [...values.slice(0, 3), magnitude]);
        }
      }
    } else if (nameLower.includes('stress') || nameLower === 's') {
      // Stress data (6 components: σxx, σyy, σzz, τxy, τyz, τxz)
      for (const [nodeId, values] of data) {
        result.stresses.set(nodeId, values);
      }
    } else if (nameLower.includes('strain') || nameLower === 'e') {
      // Strain data
      result.strains = result.strains || new Map();
      for (const [nodeId, values] of data) {
        result.strains.set(nodeId, values);
      }
    } else if (nameLower.includes('rf') || nameLower.includes('reaction')) {
      // Reaction forces
      result.reactions = result.reactions || new Map();
      for (const [nodeId, values] of data) {
        result.reactions.set(nodeId, values);
      }
    } else if (nameLower.includes('nt') || nameLower.includes('temp')) {
      // Temperature
      result.temperatures = result.temperatures || new Map();
      for (const [nodeId, values] of data) {
        result.temperatures.set(nodeId, values[0]);
      }
    }
  }

  private static computeVonMises(result: ParsedResults): void {
    // Calculate von Mises stress from stress tensor
    // σ_vm = sqrt(0.5 * ((σxx-σyy)² + (σyy-σzz)² + (σzz-σxx)² + 6(τxy² + τyz² + τxz²)))
    
    for (const [nodeId, stress] of result.stresses) {
      if (stress.length >= 6) {
        const [sxx, syy, szz, txy, tyz, txz] = stress;
        
        const vonMises = Math.sqrt(
          0.5 * (
            (sxx - syy) ** 2 +
            (syy - szz) ** 2 +
            (szz - sxx) ** 2 +
            6 * (txy ** 2 + tyz ** 2 + txz ** 2)
          )
        );
        
        result.vonMisesStress.set(nodeId, vonMises);
      } else if (stress.length === 3) {
        // Principal stresses only - approximate
        const [s1, s2, s3] = stress;
        const vonMises = Math.sqrt(
          0.5 * ((s1 - s2) ** 2 + (s2 - s3) ** 2 + (s3 - s1) ** 2)
        );
        result.vonMisesStress.set(nodeId, vonMises);
      }
    }
  }

  private static parseModalFrequencies(datContent: string, result: ParsedResults): void {
    // Parse natural frequencies from .dat file
    // Look for lines like "EIGENVALUE =  1.234E+05  FREQUENCY =  12.34 CYCLES/TIME"
    
    const lines = datContent.split('\n');
    result.modeShapes = [];

    for (const line of lines) {
      if (line.includes('FREQUENCY') && line.includes('CYCLES')) {
        const match = line.match(/FREQUENCY\s*=\s*([\d.E+-]+)/i);
        if (match) {
          const frequency = parseFloat(match[1]);
          result.modeShapes.push({
            mode: result.modeShapes.length + 1,
            frequency,
            displacements: new Map(), // Would be populated from FRD mode shape data
          });
        }
      }
    }
  }

  /**
   * Parse multiple steps/increments from FRD
   */
  static parseMultiStep(frdContent: string): ParsedResults[] {
    // For transient or nonlinear analysis with multiple steps
    // This would split the FRD by step markers and parse each
    // Simplified for now - returns single step
    return [this.parse(frdContent)];
  }
}









