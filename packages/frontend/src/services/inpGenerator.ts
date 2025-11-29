/**
 * CalculiX Input File (.inp) Generator
 * Comprehensive implementation supporting multiple materials, BCs, loads, and analysis types
 */

import type {
  FEAMesh,
  SimulationSetup,
  FEAMaterial,
  BoundaryCondition,
  FixedConstraint,
  DisplacementConstraint,
  ForceLoad,
  PressureLoad,
  GravityLoad,
  TemperatureConstraint,
  AnalysisType,
  FEAMaterialAssignment,
} from '@feai/shared';

export class CalculiXInputGenerator {
  /**
   * Generate complete CalculiX .inp file from mesh and simulation setup
   */
  generateInputFile(mesh: FEAMesh, setup: SimulationSetup): string {
    let inp = this.writeHeader(setup);
    inp += this.writeNodes(mesh);
    inp += this.writeElements(mesh);
    inp += this.writeNodeSets(mesh);
    inp += this.writeElementSets(mesh);
    inp += this.writeSurfaces(mesh);
    inp += this.writeMaterials(setup.materials);
    inp += this.writeSections(mesh, setup.materialAssignments);
    inp += this.writeAnalysisStep(setup);
    
    return inp;
  }

  /**
   * Write file header with metadata
   */
  private writeHeader(setup: SimulationSetup): string {
    let inp = '*HEADING\n';
    inp += `FEA Model: ${setup.name}\n`;
    inp += `Analysis Type: ${setup.analysisType}\n`;
    inp += `Generated: ${new Date().toISOString()}\n`;
    inp += `Generator: FEAI CalculiX WASM Solver\n`;
    inp += '**\n';
    return inp;
  }

  /**
   * Write all nodes
   */
  private writeNodes(mesh: FEAMesh): string {
    let inp = '**\n';
    inp += '** NODES\n';
    inp += '**\n';
    inp += '*NODE\n';
    
    for (const node of mesh.nodes) {
      // Format: nodeId, x, y, z
      inp += `${node.id}, ${node.x.toExponential(8)}, ${node.y.toExponential(8)}, ${node.z.toExponential(8)}\n`;
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write all elements
   */
  private writeElements(mesh: FEAMesh): string {
    let inp = '**\n';
    inp += '** ELEMENTS\n';
    inp += '**\n';
    
    // Group elements by type if needed, but for now assume single type
    const elementType = mesh.elementType || 'C3D4';
    inp += `*ELEMENT, TYPE=${elementType}, ELSET=Eall\n`;
    
    for (const elem of mesh.elements) {
      // Format: elemId, node1, node2, node3, ...
      inp += `${elem.id}, ${elem.nodeIds.join(', ')}\n`;
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write node sets for boundary conditions
   */
  private writeNodeSets(mesh: FEAMesh): string {
    if (!mesh.nodeSets || mesh.nodeSets.length === 0) {
      return '';
    }

    let inp = '**\n';
    inp += '** NODE SETS\n';
    inp += '**\n';
    
    for (const nset of mesh.nodeSets) {
      inp += `*NSET, NSET=${nset.name}\n`;
      
      // Write node IDs, 16 per line
      for (let i = 0; i < nset.nodeIds.length; i += 16) {
        const chunk = nset.nodeIds.slice(i, i + 16);
        inp += chunk.join(', ') + '\n';
      }
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write element sets for sections
   */
  private writeElementSets(mesh: FEAMesh): string {
    if (!mesh.elementSets || mesh.elementSets.length === 0) {
      return '';
    }

    let inp = '**\n';
    inp += '** ELEMENT SETS\n';
    inp += '**\n';
    
    for (const elset of mesh.elementSets) {
      inp += `*ELSET, ELSET=${elset.name}\n`;
      
      // Write element IDs, 16 per line
      for (let i = 0; i < elset.elementIds.length; i += 16) {
        const chunk = elset.elementIds.slice(i, i + 16);
        inp += chunk.join(', ') + '\n';
      }
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write surfaces for pressure loads
   */
  private writeSurfaces(mesh: FEAMesh): string {
    if (!mesh.surfaces || mesh.surfaces.length === 0) {
      return '';
    }

    let inp = '**\n';
    inp += '** SURFACES\n';
    inp += '**\n';
    
    for (const surf of mesh.surfaces) {
      inp += `*SURFACE, NAME=${surf.name}, TYPE=ELEMENT\n`;
      
      for (const elem of surf.elements) {
        inp += `${elem.elementId}, S${elem.faceNumber}\n`;
      }
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write materials with all properties
   */
  private writeMaterials(materials: FEAMaterial[]): string {
    if (!materials || materials.length === 0) {
      // Return default steel material
      return this.getDefaultMaterial();
    }

    let inp = '**\n';
    inp += '** MATERIALS\n';
    inp += '**\n';
    
    for (const material of materials) {
      inp += this.formatMaterial(material);
    }
    
    return inp;
  }

  /**
   * Format a single material for CalculiX
   */
  private formatMaterial(material: FEAMaterial): string {
    let inp = `*MATERIAL, NAME=${this.sanitizeName(material.name)}\n`;
    
    // Elastic properties (required for structural)
    if (material.properties.youngsModulus && material.properties.poissonsRatio !== undefined) {
      inp += '*ELASTIC\n';
      // Convert Pa to MPa (CalculiX typically uses N/mm² = MPa)
      const E_MPa = material.properties.youngsModulus / 1e6;
      inp += `${E_MPa.toExponential(8)}, ${material.properties.poissonsRatio}\n`;
    }
    
    // Density (for dynamics, gravity)
    if (material.properties.density) {
      inp += '*DENSITY\n';
      // Convert kg/m³ to tonne/mm³ for consistent N,mm units
      const density_tmm3 = material.properties.density / 1e9;
      inp += `${density_tmm3.toExponential(8)}\n`;
    }
    
    // Thermal expansion
    if (material.properties.thermalExpansion) {
      inp += '*EXPANSION\n';
      inp += `${material.properties.thermalExpansion.toExponential(8)}\n`;
    }
    
    // Thermal conductivity (for heat transfer)
    if (material.properties.thermalConductivity) {
      inp += '*CONDUCTIVITY\n';
      // Convert W/(m·K) to N/(s·K) for CalculiX (thermal)
      const k = material.properties.thermalConductivity;
      inp += `${k.toExponential(8)}\n`;
    }
    
    // Specific heat
    if (material.properties.specificHeat) {
      inp += '*SPECIFIC HEAT\n';
      // J/(kg·K)
      inp += `${material.properties.specificHeat.toExponential(8)}\n`;
    }
    
    // Plasticity (if yield strength provided - simple bilinear)
    if (material.properties.yieldStrength) {
      inp += '*PLASTIC\n';
      const sigma_y_MPa = material.properties.yieldStrength / 1e6;
      // Yield stress, plastic strain (0 at yield)
      inp += `${sigma_y_MPa.toExponential(8)}, 0.0\n`;
      
      // Add hardening point if ultimate strength available
      if (material.properties.ultimateStrength) {
        const sigma_u_MPa = material.properties.ultimateStrength / 1e6;
        // Approximate plastic strain at ultimate (simplified)
        const E_MPa = material.properties.youngsModulus / 1e6;
        const eps_plastic = 0.1; // Assume 10% plastic strain at ultimate (simplified)
        inp += `${sigma_u_MPa.toExponential(8)}, ${eps_plastic}\n`;
      }
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write section definitions (link elements to materials)
   */
  private writeSections(mesh: FEAMesh, assignments: FEAMaterialAssignment[]): string {
    let inp = '**\n';
    inp += '** SECTIONS\n';
    inp += '**\n';
    
    if (!assignments || assignments.length === 0) {
      // Default: assign all elements to first material
      inp += '*SOLID SECTION, ELSET=Eall, MATERIAL=MAT1\n';
      inp += '**\n';
      return inp;
    }
    
    // For each material assignment, create a section
    for (const assignment of assignments) {
      const elsetName = this.sanitizeName(`Elset_${assignment.partId}`);
      const matName = this.sanitizeName(assignment.materialName);
      
      inp += `*SOLID SECTION, ELSET=${elsetName}, MATERIAL=${matName}\n`;
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write analysis step with BCs, loads, and output requests
   */
  private writeAnalysisStep(setup: SimulationSetup): string {
    let inp = '**\n';
    inp += '** STEP: Analysis\n';
    inp += '**\n';
    inp += '*STEP\n';
    
    // Write step type based on analysis type
    inp += this.writeStepType(setup.analysisType, setup);
    
    // Write boundary conditions
    inp += this.writeBoundaryConditions(setup.boundaryConditions);
    
    // Write loads
    inp += this.writeLoads(setup.boundaryConditions);
    
    // Write output requests
    inp += this.writeOutputRequests(setup.analysisType);
    
    inp += '*END STEP\n';
    return inp;
  }

  /**
   * Write step type card based on analysis type
   */
  private writeStepType(analysisType: AnalysisType, setup: SimulationSetup): string {
    let inp = '';
    
    switch (analysisType) {
      case 'static':
        inp += '*STATIC\n';
        if (setup.staticSettings?.nonlinear) {
          // Add parameters for nonlinear (not implemented yet)
        }
        break;
        
      case 'modal':
        inp += '*FREQUENCY\n';
        const numModes = setup.modalSettings?.numModes || 10;
        inp += `${numModes}\n`;
        break;
        
      case 'buckling':
        // Buckling requires a preload step, then perturbation
        // For now, simplified to single step
        inp += '*BUCKLE\n';
        inp += '10\n'; // Request 10 buckling modes
        break;
        
      case 'thermal':
        inp += '*HEAT TRANSFER, STEADY STATE\n';
        break;
        
      case 'nonlinearStatic':
        inp += '*STATIC\n';
        inp += '0.1, 1.0\n'; // Initial increment, total time
        break;
        
      default:
        inp += '*STATIC\n';
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Write boundary conditions (constraints)
   */
  private writeBoundaryConditions(conditions: BoundaryCondition[]): string {
    const constraints = conditions.filter(bc => 
      bc.enabled && (bc.type === 'fixed' || bc.type === 'displacement' || bc.type === 'temperature')
    );
    
    if (constraints.length === 0) {
      return '';
    }

    let inp = '**\n';
    inp += '** BOUNDARY CONDITIONS\n';
    inp += '**\n';
    inp += '*BOUNDARY\n';
    
    for (const bc of constraints) {
      inp += this.formatConstraint(bc);
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Format a single constraint for CalculiX
   */
  private formatConstraint(bc: BoundaryCondition): string {
    const nsetName = this.sanitizeName(`Nset_${bc.id}`);
    let inp = '';
    
    if (bc.type === 'fixed') {
      // Fix all translations (DOF 1-3)
      const fixedBC = bc as FixedConstraint;
      inp += `${nsetName}, 1, 3, 0.0\n`;
    }
    else if (bc.type === 'displacement') {
      const dispBC = bc as DisplacementConstraint;
      
      // Apply constraints for each specified DOF
      if (dispBC.displacement.x !== undefined) {
        inp += `${nsetName}, 1, 1, ${dispBC.displacement.x}\n`;
      }
      if (dispBC.displacement.y !== undefined) {
        inp += `${nsetName}, 2, 2, ${dispBC.displacement.y}\n`;
      }
      if (dispBC.displacement.z !== undefined) {
        inp += `${nsetName}, 3, 3, ${dispBC.displacement.z}\n`;
      }
    }
    else if (bc.type === 'temperature') {
      // Temperature constraint (DOF 11)
      const tempBC = bc as TemperatureConstraint;
      inp += `${nsetName}, 11, 11, ${tempBC.temperature}\n`;
    }
    
    return inp;
  }

  /**
   * Write loads (forces, pressures, gravity)
   */
  private writeLoads(conditions: BoundaryCondition[]): string {
    let inp = '';
    
    // Concentrated loads (forces)
    const forces = conditions.filter(bc => bc.enabled && bc.type === 'force') as ForceLoad[];
    if (forces.length > 0) {
      inp += '**\n';
      inp += '** CONCENTRATED LOADS\n';
      inp += '**\n';
      inp += '*CLOAD\n';
      
      for (const force of forces) {
        inp += this.formatForce(force);
      }
      
      inp += '**\n';
    }
    
    // Distributed loads (pressure)
    const pressures = conditions.filter(bc => bc.enabled && bc.type === 'pressure') as PressureLoad[];
    if (pressures.length > 0) {
      inp += '**\n';
      inp += '** DISTRIBUTED LOADS (PRESSURE)\n';
      inp += '**\n';
      inp += '*DLOAD\n';
      
      for (const pressure of pressures) {
        inp += this.formatPressure(pressure);
      }
      
      inp += '**\n';
    }
    
    // Gravity load
    const gravityLoads = conditions.filter(bc => bc.enabled && bc.type === 'gravity') as GravityLoad[];
    if (gravityLoads.length > 0) {
      inp += '**\n';
      inp += '** GRAVITY\n';
      inp += '**\n';
      
      for (const gravity of gravityLoads) {
        inp += this.formatGravity(gravity);
      }
      
      inp += '**\n';
    }
    
    return inp;
  }

  /**
   * Format concentrated force
   */
  private formatForce(force: ForceLoad): string {
    const nsetName = this.sanitizeName(`Nset_${force.id}`);
    let inp = '';
    
    // Convert force direction to DOF components
    const fx = force.force.magnitude * force.force.direction.x;
    const fy = force.force.magnitude * force.force.direction.y;
    const fz = force.force.magnitude * force.force.direction.z;
    
    if (Math.abs(fx) > 1e-9) {
      inp += `${nsetName}, 1, ${fx.toExponential(8)}\n`;
    }
    if (Math.abs(fy) > 1e-9) {
      inp += `${nsetName}, 2, ${fy.toExponential(8)}\n`;
    }
    if (Math.abs(fz) > 1e-9) {
      inp += `${nsetName}, 3, ${fz.toExponential(8)}\n`;
    }
    
    return inp;
  }

  /**
   * Format pressure load
   */
  private formatPressure(pressure: PressureLoad): string {
    const surfName = this.sanitizeName(`Surf_${pressure.id}`);
    const pressureValue = pressure.reverseNormal ? -pressure.pressure : pressure.pressure;
    
    // Convert Pa to MPa
    const p_MPa = pressureValue / 1e6;
    
    // Format: Surface name, P (pressure), value
    return `${surfName}, P, ${p_MPa.toExponential(8)}\n`;
  }

  /**
   * Format gravity load
   */
  private formatGravity(gravity: GravityLoad): string {
    let inp = '*DLOAD\n';
    inp += `Eall, GRAV, ${gravity.acceleration}, `;
    inp += `${gravity.direction.x}, ${gravity.direction.y}, ${gravity.direction.z}\n`;
    return inp;
  }

  /**
   * Write output requests
   */
  private writeOutputRequests(analysisType: AnalysisType): string {
    let inp = '**\n';
    inp += '** OUTPUT REQUESTS\n';
    inp += '**\n';
    
    if (analysisType === 'thermal') {
      // Thermal analysis outputs
      inp += '*NODE FILE\n';
      inp += 'NT\n'; // Nodal temperature
      inp += '*EL FILE\n';
      inp += 'HFL\n'; // Heat flux
    }
    else if (analysisType === 'modal') {
      // Modal analysis outputs
      inp += '*NODE FILE\n';
      inp += 'U\n'; // Mode shapes (displacements)
      inp += '*NODE PRINT, NSET=Nall\n';
      inp += 'U\n';
    }
    else {
      // Static/buckling: displacement and stress
      inp += '*NODE FILE\n';
      inp += 'U\n'; // Displacements
      inp += 'RF\n'; // Reaction forces
      inp += '*EL FILE\n';
      inp += 'S\n'; // Stresses
      inp += 'E\n'; // Strains
    }
    
    inp += '**\n';
    return inp;
  }

  /**
   * Get default steel material if none provided
   */
  private getDefaultMaterial(): string {
    let inp = '**\n';
    inp += '** DEFAULT MATERIAL (Steel 1018)\n';
    inp += '**\n';
    inp += '*MATERIAL, NAME=MAT1\n';
    inp += '*ELASTIC\n';
    inp += '2.05E+05, 0.29\n'; // 205 GPa, ν=0.29
    inp += '*DENSITY\n';
    inp += '7.87E-09\n'; // 7870 kg/m³ in tonne/mm³
    inp += '**\n';
    return inp;
  }

  /**
   * Sanitize names for CalculiX (no spaces, special chars)
   */
  private sanitizeName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 80); // CalculiX has name length limits
  }
}

// Singleton instance
export const inpGenerator = new CalculiXInputGenerator();

