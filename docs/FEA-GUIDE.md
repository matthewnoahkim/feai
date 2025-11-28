# FEA Module - CalculiX Integration Guide

## Recent Fixes

### Issue: "No mesh data available" Error

The error was occurring because:
1. The frontend and backend have separate data stores
2. When features were created, they only updated the frontend store with mesh data
3. The backend was looking for `meshData` property on parts but couldn't find it
4. The frontend stored geometry as `mesh` while backend expected `meshData`

### Fixes Applied

1. **Backend (`packages/backend/src/routes/fea.ts`)**:
   - Now accepts mesh data sent directly from the frontend in the request
   - Checks both `meshData` and `mesh` properties on parts (for compatibility)
   - Added fallback to backend store if no mesh data is sent
   - Better logging to debug mesh data issues

2. **Frontend (`packages/frontend/src/store/feaStore.ts`)**:
   - Modified `generateMesh` to send part mesh data along with the request
   - Accesses the document store to get the current part geometry
   - Transforms `mesh` property to `meshData` format for backend compatibility
   - Better error messages when geometry is missing

3. **Document Store (`packages/frontend/src/store/documentStore.ts`)**:
   - Exposed globally so FEA store can access current document and parts
   - Allows cross-store communication for mesh data retrieval

## Using the FEA Module

### Prerequisites

Before running FEA simulations, you need:

1. **Create a Document**: Use the File menu to create a new document
2. **Create Geometry**: Add features (extrude, revolve, etc.) to create solid parts
3. **Open FEA Panel**: Click the "FEA" button in the toolbar

### Workflow

1. **Mesh Tab**:
   - Set element size (smaller = more accurate, slower)
   - Choose element type (C3D10 recommended for accuracy)
   - Click "Generate Mesh"
   
2. **Material Tab**:
   - Materials are loaded automatically from the backend
   - Assign materials to your parts
   - Use presets (Steel, Aluminum, etc.) or create custom materials

3. **Loads & BCs Tab**:
   - Add fixed constraints (supports)
   - Add forces, pressures, or gravity loads
   - Visualize with icons in 3D viewport

4. **Run Simulation**:
   - Click "Run Analysis" button
   - Monitor progress
   - View results in Results tab

## CalculiX Integration

The FEA module is designed to use [CalculiX](https://github.com/Dhondtguido/CalculiX), an open-source FEA solver licensed under GPL-2.0.

### Current Implementation

The current implementation includes:
- CalculiX `.inp` file writer (`packages/kernel/src/fea/inp-writer.ts`)
- CalculiX `.frd` result parser (`packages/kernel/src/fea/result-parser.ts`)  
- Placeholder mesh generator that will integrate with CalculiX

### Installing CalculiX

To use the actual CalculiX solver:

1. **Download CalculiX**:
   ```bash
   git clone https://github.com/Dhondtguido/CalculiX.git
   ```

2. **Build CalculiX** (requires C/Fortran compilers):
   ```bash
   cd CalculiX/src
   # Follow build instructions in CalculiX documentation
   ```

3. **Place `ccx` executable** in one of these locations:
   - `/usr/local/bin/ccx` (Linux/Mac)
   - `C:\Program Files\CalculiX\ccx.exe` (Windows)
   - Project `bin/` folder

### Integration Steps

The backend (`packages/backend/src/routes/fea.ts`) already includes code to:
1. Find the CalculiX executable
2. Generate `.inp` files
3. Run the solver via `child_process`
4. Parse results

To complete the integration:

1. **Mesh Generation**: Replace the placeholder mesh generator with:
   - [Gmsh](http://gmsh.info/) integration for tetrahedral meshing
   - [Netgen](https://github.com/NGSolve/netgen) for complex geometries
   - Or use CalculiX's internal meshing capabilities

2. **File Export**: Export CAD geometry as:
   - STEP format for accurate geometry transfer
   - STL format for simpler meshers

3. **Result Parsing**: The `.frd` parser needs to:
   - Read binary/ASCII CalculiX result files
   - Extract nodal displacements and element stresses
   - Compute von Mises stress if not provided

### Example: Running CalculiX Manually

1. Generate an `.inp` file (the backend does this)
2. Run CalculiX:
   ```bash
   ccx -i model
   ```
3. This produces:
   - `model.dat` - text log file
   - `model.frd` - binary results file

### CalculiX Input Format

The `.inp` file follows Abaqus format:

```inp
*HEADING
FEA Analysis

*NODE
1, 0.0, 0.0, 0.0
2, 1.0, 0.0, 0.0
...

*ELEMENT, TYPE=C3D10, ELSET=Eall
1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
...

*MATERIAL, NAME=Steel
*ELASTIC
2.1e11, 0.3
*DENSITY
7850

*SOLID SECTION, ELSET=Eall, MATERIAL=Steel

*STEP
*STATIC
*BOUNDARY
FixedNodes, 1, 3, 0.0
*CLOAD
LoadNodes, 3, -1000.0
*NODE FILE
U
*EL FILE
S
*END STEP
```

## Troubleshooting

### "Part studio not found"
- **Solution**: Create geometry in a part studio before opening FEA
- Check that you have an active document with a part studio

### "No parts to mesh"
- **Solution**: Add features (extrude, revolve, etc.) to create solid geometry
- Ensure features aren't suppressed

### "No mesh data available"
- **Solution**: The CAD geometry needs to have tessellation data
- Try rebuilding the model

### Mesh generation fails
- Try larger element sizes first
- Check geometry for invalid faces or edges
- Simplify complex geometry

## License & Attribution

This FEA module uses:
- **CalculiX** (GPL-2.0) - © Guido Dhondt and Klaus Wittig
- The input format is compatible with Abaqus, used with permission from HKS
- See: http://www.calculix.de

## Further Resources

- [CalculiX Documentation](http://www.calculix.de/)
- [CalculiX Examples](https://github.com/Dhondtguido/CalculiX/tree/master/test)
- [FEA Theory Book](https://www.wiley.com/en-us/The+Finite+Element+Method+for+Three+Dimensional+Thermomechanical+Applications-p-9780470857526) by Guido Dhondt

