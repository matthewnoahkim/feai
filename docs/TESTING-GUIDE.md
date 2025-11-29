# FEA Testing Guide
## Comprehensive Test Suite for CalculiX WebAssembly Integration

This document provides detailed testing procedures for all implemented FEA features.

## 🎯 Test Scenarios

### Test 1: Static Structural Analysis (Cantilever Beam)

**Objective**: Verify basic static analysis with known analytical solution

**Setup**:
- Geometry: Rectangular beam 200mm × 20mm × 20mm
- Material: Steel 1018 (E = 205 GPa, ν = 0.29)
- Mesh: 10mm element size (~2000 elements)
- BC: Fixed support on one end
- Load: 1000N downward force on free end

**Expected Results**:
- Max displacement at free end: ~1.5-2.0mm
- Max von Mises stress: ~150-200 MPa
- Stress concentration near fixed support

**Analytical Check**:
```
For cantilever beam:
δ = (F × L³) / (3 × E × I)
Where:
F = 1000N
L = 200mm
E = 205,000 MPa
I = (b × h³) / 12 = (20 × 20³) / 12 = 13,333 mm⁴

δ = (1000 × 200³) / (3 × 205000 × 13333) ≈ 0.97 mm

(FEA may show higher due to mesh and stress concentration)
```

**Pass Criteria**:
- ✅ Simulation completes without errors
- ✅ Displacement magnitude within 50% of analytical
- ✅ Displacement field shows smooth gradient
- ✅ Stress highest at fixed end
- ✅ Visualization renders correctly

---

### Test 2: Modal Analysis (Free-Free Beam)

**Objective**: Verify modal analysis and eigenfrequency extraction

**Setup**:
- Geometry: Rectangular beam 300mm × 30mm × 30mm
- Material: Aluminum 6061 (E = 68.9 GPa, ν = 0.33, ρ = 2700 kg/m³)
- Mesh: 15mm element size
- BC: None (free-free condition)
- Analysis: Modal, 10 modes

**Expected Results**:
- First 6 modes should be near-zero (rigid body modes)
- First bending mode: ~150-250 Hz
- Mode shapes should show characteristic patterns:
  - Modes 1-3: Translations (frequencies ≈ 0)
  - Modes 4-6: Rotations (frequencies ≈ 0)
  - Mode 7: First bending
  - Mode 8: First torsion

**Analytical Check**:
```
First bending frequency (free-free beam):
f₁ = (λ₁² / 2π) × √(E × I / (ρ × A × L⁴))

Where:
λ₁ = 4.730 (for first mode)
E = 68,900 MPa
I = (30 × 30³) / 12 = 67,500 mm⁴
ρ = 2.7 × 10⁻⁹ tonne/mm³
A = 900 mm²
L = 300 mm

f₁ ≈ 190 Hz
```

**Pass Criteria**:
- ✅ First 6 modes have frequencies < 1 Hz
- ✅ First elastic mode frequency within 30% of analytical
- ✅ Mode shapes visualize correctly
- ✅ Animation of modes works smoothly

---

### Test 3: Pressure Load on Thin-Walled Vessel

**Objective**: Test pressure boundary condition and stress distribution

**Setup**:
- Geometry: Hollow cylinder (simplified vessel)
  - Outer diameter: 100mm
  - Wall thickness: 5mm
  - Length: 200mm
- Material: Steel 304 (E = 193 GPa, ν = 0.29)
- Mesh: 8mm element size
- BC: 
  - Fixed support on bottom face
  - Internal pressure: 1.0 MPa
- Analysis: Static

**Expected Results**:
- Hoop stress (circumferential): ~10 MPa
- Longitudinal stress: ~5 MPa
- Radial displacement: ~0.025mm

**Analytical Check (Thin-wall cylinder)**:
```
σ_hoop = (P × r) / t
σ_long = (P × r) / (2 × t)

Where:
P = 1.0 MPa
r = 47.5 mm (mean radius)
t = 5 mm

σ_hoop = (1.0 × 47.5) / 5 = 9.5 MPa
σ_long = 9.5 / 2 = 4.75 MPa
```

**Pass Criteria**:
- ✅ Pressure correctly applied to internal surface
- ✅ Hoop stress within 20% of analytical
- ✅ Stress pattern shows expected distribution
- ✅ No stress concentration artifacts

---

### Test 4: Thermal Analysis (Heat Conduction)

**Objective**: Verify steady-state thermal analysis

**Setup**:
- Geometry: Rectangular plate 100mm × 100mm × 10mm
- Material: Copper (k = 388 W/(m·K))
- Mesh: 10mm element size
- BC:
  - Temperature constraint: 100°C on left edge
  - Temperature constraint: 20°C on right edge
  - Other faces: insulated (natural BC)
- Analysis: Thermal (steady-state)

**Expected Results**:
- Linear temperature gradient from left to right
- Temperature at center: ~60°C
- No temperature variation in Y and Z directions

**Analytical Check**:
```
For 1D steady-state conduction:
T(x) = T₁ + (T₂ - T₁) × (x / L)

At x = 50mm (center):
T = 100 + (20 - 100) × (50 / 100) = 60°C
```

**Pass Criteria**:
- ✅ Temperature field shows linear gradient
- ✅ Center temperature = 60°C ± 2°C
- ✅ Thermal BC applied correctly
- ✅ Temperature visualization works

---

### Test 5: Multiple Materials

**Objective**: Test material assignment and interface handling

**Setup**:
- Geometry: Two-part assembly
  - Part 1 (Steel): Cube 50mm × 50mm × 50mm
  - Part 2 (Aluminum): Cube 50mm × 50mm × 50mm
  - Joined face-to-face
- Materials:
  - Steel: E = 205 GPa
  - Aluminum: E = 68.9 GPa
- Mesh: 10mm element size
- BC:
  - Fixed support on steel end
  - 5000N tension force on aluminum end
- Analysis: Static

**Expected Results**:
- Aluminum deforms ~3× more than steel (ratio of E values)
- Displacement jump at interface
- Stress continuous across interface

**Pass Criteria**:
- ✅ Both materials present in .inp file
- ✅ Correct E values for each material
- ✅ Displacement ratio approximately matches E ratio
- ✅ Stress distribution looks physically reasonable

---

### Test 6: Buckling Analysis (Column)

**Objective**: Verify buckling analysis and critical load calculation

**Setup**:
- Geometry: Slender column 500mm × 20mm × 20mm
- Material: Steel (E = 205 GPa)
- Mesh: 15mm element size
- BC:
  - Fixed support on bottom
  - Pinned support on top (free rotation)
  - Compressive load: 100N (preload)
- Analysis: Buckling, 5 modes

**Expected Results**:
- First buckling factor: ~10-15
- Critical load: ~1000-1500N
- First mode: single half-wave bending
- Second mode: full-wave bending

**Analytical Check (Euler buckling)**:
```
P_cr = (π² × E × I) / (L_eff²)

Where:
E = 205,000 MPa
I = (20 × 20³) / 12 = 13,333 mm⁴
L_eff = 500mm (for fixed-pinned)

P_cr = (π² × 205000 × 13333) / (500²) ≈ 1080N

Buckling factor = P_cr / P_applied = 1080 / 100 = 10.8
```

**Pass Criteria**:
- ✅ Buckling analysis completes
- ✅ First buckling factor within 30% of analytical
- ✅ Buckling mode shapes show bending patterns
- ✅ No convergence issues

---

### Test 7: Large Mesh (Performance & Memory)

**Objective**: Test memory management and performance on larger models

**Setup**:
- Geometry: Complex part with ~5000 nodes
- Material: Any
- Mesh: Fine mesh approaching limits
- Analysis: Static with simple load case

**Expected Results**:
- Memory check warns if too large
- Solver completes in reasonable time (<60s)
- No browser crashes or freezes

**Pass Criteria**:
- ✅ Memory estimation runs before solve
- ✅ Warning shown if approaching limits
- ✅ Solve completes or fails gracefully
- ✅ UI remains responsive (runs in worker)
- ✅ Memory monitoring shows reasonable usage

---

### Test 8: Multiple Boundary Conditions

**Objective**: Test complex BC combinations

**Setup**:
- Geometry: L-bracket (50mm × 50mm × 100mm with 50mm × 50mm × 10mm flange)
- Material: Aluminum
- Mesh: 8mm element size
- BC:
  - Fixed support on mounting holes (3 locations)
  - Point force 500N at tip (downward)
  - Pressure 0.1 MPa on top surface
  - Gravity 9.81 m/s² (downward)
- Analysis: Static

**Expected Results**:
- Combined loading effects visible
- Stress concentration at mounting holes
- Tip displacement from all loads

**Pass Criteria**:
- ✅ All BC types present in .inp
- ✅ Multiple fixed supports handled correctly
- ✅ Combined load effects visible in results
- ✅ No BC conflicts or errors

---

## 🧪 Automated Test Checklist

For each test, verify:

### Input Generation
- [ ] .inp file created successfully
- [ ] All nodes present and numbered correctly
- [ ] All elements present with correct connectivity
- [ ] Material properties in correct format
- [ ] Material sections link elements to materials
- [ ] Boundary conditions in correct format
- [ ] Loads applied correctly
- [ ] Output requests appropriate for analysis type

### Solver Execution
- [ ] WASM module loads without errors
- [ ] Solver runs in Web Worker
- [ ] Progress updates received
- [ ] UI remains responsive during solve
- [ ] Solver completes with exit code 0
- [ ] .dat file contains no errors

### Results Parsing
- [ ] .frd file parsed successfully
- [ ] Displacement values reasonable
- [ ] Stress values reasonable
- [ ] No NaN or Infinity values
- [ ] Min/max values computed correctly
- [ ] Results visualize correctly

### Performance
- [ ] Memory usage within limits
- [ ] Solve time acceptable for mesh size
- [ ] No memory leaks (multiple runs)
- [ ] Browser doesn't freeze

---

## 📊 Performance Benchmarks

Target performance on typical hardware (4-core CPU, 8GB RAM):

| Mesh Size | Solve Time | Memory Usage |
|-----------|------------|--------------|
| 500 nodes | < 2 sec    | < 100 MB     |
| 1000 nodes| < 5 sec    | < 150 MB     |
| 2000 nodes| < 10 sec   | < 250 MB     |
| 5000 nodes| < 30 sec   | < 500 MB     |
| 10000 nodes| < 120 sec | < 1000 MB    |

---

## 🔍 Common Issues and Solutions

### Issue: "Mesh too large" error
**Solution**: Increase element size or simplify geometry

### Issue: Solver fails with "singular matrix"
**Possible Causes**:
- Unconstrained rigid body motion (add more supports)
- Zero stiffness elements (check mesh quality)
- Material modulus too low

### Issue: Unrealistic results
**Check**:
- Units consistency (N, mm, MPa, tonne/mm³)
- Material properties (E should be ~10^5 MPa for metals)
- Boundary conditions (are they correct?)
- Mesh quality (no inverted elements)

### Issue: Slow performance
**Solutions**:
- Reduce mesh density
- Enable threading (pthread build)
- Use server solver for very large models

---

## ✅ Final Verification

After all tests pass, verify:

1. **Integration**
   - [ ] All modules import correctly
   - [ ] No TypeScript errors
   - [ ] No runtime console errors
   - [ ] Build succeeds

2. **Documentation**
   - [ ] IMPLEMENTATION-COMPLETE.md is accurate
   - [ ] All file paths correct
   - [ ] Usage examples work

3. **Deployment Ready**
   - [ ] WASM files in `/public/wasm/`
   - [ ] `USE_WASM_SOLVER = true` set
   - [ ] COOP/COEP headers configured
   - [ ] Vercel.json has correct settings

4. **User Experience**
   - [ ] Error messages are clear
   - [ ] Progress feedback works
   - [ ] Results visualization is smooth
   - [ ] UI is responsive

---

## 🎉 Test Results Template

Use this template to document test results:

```markdown
## Test Results - [Date]

### Environment
- Browser: [Chrome/Firefox/Safari] [Version]
- OS: [Windows/Mac/Linux]
- CPU: [Cores]
- RAM: [GB]

### Test 1: Static Analysis
- Status: ✅ PASS / ❌ FAIL
- Max Displacement: [value]
- Max Stress: [value]
- Solve Time: [seconds]
- Notes: [any observations]

### Test 2: Modal Analysis
- Status: ✅ PASS / ❌ FAIL
- First Frequency: [Hz]
- Mode Shapes: [OK/Issues]
- Solve Time: [seconds]
- Notes: [any observations]

[Continue for all tests...]

### Overall
- Tests Passed: [X/8]
- Critical Issues: [None/List]
- Performance: [Acceptable/Slow/Fast]
- Ready for Production: [Yes/No]
```

---

**End of Testing Guide**

