# Revolve Feature - Complete Documentation

> **Consolidated documentation for the Revolve parametric CAD feature**  
> Last Updated: December 27, 2025

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Feature Overview](#feature-overview)
3. [Implementation Architecture](#implementation-architecture)
4. [Testing Guide](#testing-guide)
5. [API Reference](#api-reference)

---

## Quick Start

### Basic Usage

```typescript
import { RevolveOperation } from '@feai/kernel';

// Create a simple revolve
const result = RevolveOperation.revolve(sketch, region, {
  angle: Math.PI * 2,  // 360° full revolution
  axis: {
    point: { x: 0, y: 0, z: 0 },
    direction: { x: 0, y: 1, z: 0 }  // Y-axis
  },
  segments: 32  // Tessellation quality
});
```

### Common Examples

#### 1. Cylinder (360° Revolve)
```typescript
// Draw rectangle offset from Y-axis, revolve 360°
RevolveOperation.revolve(sketch, rectangleRegion, {
  angle: 2 * Math.PI,
  axis: { point: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 } }
});
```

#### 2. Partial Revolve (270°)
```typescript
// Revolve circle 270° for 3/4 torus
RevolveOperation.revolve(sketch, circleRegion, {
  angle: 1.5 * Math.PI,  // 270 degrees
  axis: { point: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 } }
});
```

#### 3. Symmetric Revolve (±60°)
```typescript
// Revolve in both directions (120° total)
RevolveOperation.revolve(sketch, polygonRegion, {
  angle: Math.PI / 3,   // +60°
  angle2: Math.PI / 3,  // -60°
  axis: { point: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 1, z: 0 } }
});
```

---

## Feature Overview

### Capabilities

The Revolve feature supports:

- **✅ Full Revolution (360°)** - Complete rotation around axis
- **✅ Partial Revolution** - Any angle from 0° to 360°+
- **✅ Two-Direction Revolve** - Asymmetric angles (angle + angle2)
- **✅ Symmetric Revolve** - Equal angles in both directions (±θ)
- **✅ Multiple Profile Types:**
  - Closed profiles → Solid bodies (rectangles, circles, polygons)
  - Open profiles → Surface bodies (lines, arcs, splines)
- **✅ Surface-Only Mode** - Create thin-wall surfaces
- **✅ Comprehensive Validation** - Pre-checks for common errors

### Direction Types

| Type | Description | Parameters |
|------|-------------|------------|
| **Full** | 360° revolution | No angle input needed |
| **One Direction** | Single angle from start | `angle` only |
| **Two Direction** | Different angles in each direction | `angle` + `angle2` |
| **Symmetric** | Equal angles both ways | Single `angle` → ±angle |

---

## Implementation Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                             │
│  RevolveDialog.tsx - User interaction & controls        │
│  Toolbar.tsx - Feature activation                       │
│  PropertyPanel.tsx - Feature editing                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Store Layer                            │
│  documentStore.ts - Feature management & regeneration   │
│  uiStore.ts - UI state & selection                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Kernel Layer                            │
│  packages/kernel/src/modeling/revolve.ts                │
│  Core geometry algorithms & validation                  │
└─────────────────────────────────────────────────────────┘
```

### Kernel Implementation

**File:** `packages/kernel/src/modeling/revolve.ts`

#### Core Algorithm

```typescript
class RevolveOperation {
  static revolve(sketch, region, options) {
    // 1. Validation
    validate(sketch, region, options);
    
    // 2. Extract 2D profile
    const points = getRegionPoints(region);
    
    // 3. Convert to 3D
    const points3D = PlaneUtils.to3D(points, sketch.plane);
    
    // 4. Calculate angle range
    const startAngle = -Math.abs(options.angle2 || 0);
    const endAngle = Math.abs(options.angle);
    const totalAngle = endAngle - startAngle;
    
    // 5. Generate revolution
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (totalAngle * i / segments);
      const matrix = Mat4.rotationAxis(axis.direction, angle);
      
      for (const point of points3D) {
        const relative = Vec3.subtract(point, axis.point);
        const rotated = Vec3.transformMat4(relative, matrix);
        const final = Vec3.add(rotated, axis.point);
        vertices.push(final);
      }
    }
    
    // 6. Create faces
    createQuadFaces(vertices);
    createEndCaps(vertices, closed);
    
    // 7. Return solid data
    return { vertices, faces, edges };
  }
}
```

#### Validation System

```typescript
interface RevolveValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

validate() checks:
- Profile has minimum 2 points
- Angle is non-zero
- Profile doesn't intersect axis
- Sketch plane not parallel to axis
- Profile within reasonable distance to axis
```

### Store Integration

**File:** `packages/frontend/src/store/documentStore.ts`

```typescript
// Adding revolve feature
addRevolveFeature(sketchId, regionId, options) {
  const feature = {
    id: generateId(),
    type: 'revolve',
    sketchId,
    regionId,
    angle: options.angle,
    angle2: options.angle2,
    axis: options.axis,
    direction: options.direction,
    surfaceOnly: options.surfaceOnly
  };
  
  this.document.features.push(feature);
  this.regenerateModel();  // Rebuild entire model
}

// Regeneration
regenerateModel() {
  for (const feature of this.document.features) {
    if (feature.type === 'revolve') {
      const geometry = RevolveOperation.revolve(
        getSketch(feature.sketchId),
        getRegion(feature.regionId),
        feature
      );
      this.scene.add(geometry);
    }
  }
}
```

### UI Components

**File:** `packages/frontend/src/components/dialogs/RevolveDialog.tsx`

Key features:
- Direction type selector (Full/One/Two/Symmetric)
- Angle inputs with degree ↔ radian conversion
- Axis selection (sketch axes or custom)
- Profile preview with validation
- Real-time error/warning display

---

## Testing Guide

### Manual Test Cases

#### Test 1: Basic 360° Cylinder
**Setup:**
1. Create sketch on Top plane
2. Draw rectangle (20x40) at x=30
3. Exit sketch

**Execute:**
1. Click Revolve button
2. Select rectangle
3. Select Y-axis
4. Direction: "Full (360°)"
5. Click Create

**Expected:** Hollow cylinder with rectangular cross-section

**Validation:**
- ✅ Continuous surface (no gaps)
- ✅ Smooth connection at 0°/360°
- ✅ Correct profile orientation
- ✅ No self-intersections

---

#### Test 2: Partial Revolve (270°)
**Setup:**
1. Sketch on Top plane
2. Draw circle (radius 10) at (25, 0)

**Execute:**
1. Revolve dialog
2. Select circle
3. Select Y-axis
4. Direction: "One Direction"
5. Angle: 270°
6. Create

**Expected:** 3/4 of a torus

**Validation:**
- ✅ Correct arc length (3/4 circumference)
- ✅ Open ends properly formed
- ✅ No face at 270° boundary

---

#### Test 3: Symmetric Revolve
**Setup:**
1. Sketch on Top
2. Hexagon (6 sides, r=15) at (30, 0)

**Execute:**
1. Revolve
2. Select hexagon
3. Y-axis
4. Direction: "Symmetric"
5. Angle: 60° (creates ±60° = 120° total)
6. Create

**Expected:** 120° revolved hexagon, symmetric

**Validation:**
- ✅ Equal extent both sides of 0°
- ✅ Total angle = 120°
- ✅ Center aligned correctly

---

#### Test 4: Two-Direction Asymmetric
**Setup:**
1. Sketch: Triangle at (20, 0)

**Execute:**
1. Revolve
2. Triangle selected
3. Direction: "Two Direction"
4. Angle 1: 180°
5. Angle 2: 90°
6. Create

**Expected:** Asymmetric 270° revolution
- 180° in positive direction
- 90° in negative direction

---

#### Test 5: Surface-Only Revolve
**Setup:**
1. Sketch: Single line segment

**Execute:**
1. Revolve
2. Select line
3. Enable "Surface Only"
4. Full revolution
5. Create

**Expected:** Cylindrical surface (no end caps)

---

### Validation Tests

#### Test 6: Profile Too Close to Axis (Warning)
**Setup:**
1. Draw rectangle with edge at x=1 (very close to Y-axis)

**Execute:**
1. Attempt revolve

**Expected:**
- ⚠️ Warning: "Profile is very close to axis"
- Allow creation but flag potential issue

---

#### Test 7: Profile Intersects Axis (Error)
**Setup:**
1. Draw rectangle crossing Y-axis (x=-10 to x=10)

**Execute:**
1. Attempt revolve

**Expected:**
- ❌ Error: "Profile intersects revolve axis"
- Disable Create button

---

#### Test 8: Parallel Sketch Plane (Error)
**Setup:**
1. Sketch on Front plane (XZ)
2. Draw circle
3. Select X-axis (parallel to plane)

**Execute:**
1. Attempt revolve

**Expected:**
- ❌ Error: "Axis is parallel to sketch plane"
- Suggest using perpendicular axis

---

### Regression Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| REG-01 | Multiple revolves in sequence | All features regenerate correctly |
| REG-02 | Edit existing revolve feature | Changes applied, model updates |
| REG-03 | Delete revolve feature | Feature removed, dependents handled |
| REG-04 | Undo/Redo revolve operation | State restored correctly |
| REG-05 | Save/Load document with revolve | Features persist correctly |
| REG-06 | Revolve with pattern | Pattern applies to revolved body |
| REG-07 | Complex profile (20+ points) | Handles without performance issues |
| REG-08 | Extreme angles (>360°) | Warning shown, wrapping handled |

---

### Performance Tests

#### Test 9: High Segment Count
**Setup:**
1. Simple circle profile
2. Set segments = 128 (high quality)

**Metrics:**
- Generation time < 500ms
- Smooth rendering
- No frame drops

---

#### Test 10: Complex Profile
**Setup:**
1. Profile with 50+ points
2. Standard segments (32)

**Metrics:**
- Generation time < 1000ms
- Correct tessellation
- Acceptable memory usage

---

## API Reference

### RevolveOperation Class

#### `revolve(sketch, region, options): SolidData`

Generate revolved geometry from 2D profile.

**Parameters:**
- `sketch: Sketch` - Parent sketch containing profile
- `region: SketchRegion` - Profile region to revolve
- `options: RevolveOptions` - Revolution parameters

**Returns:** `SolidData` - Generated 3D geometry

**Throws:**
- `Error` - If validation fails
- `Error` - If geometry generation fails

---

#### `validate(sketch, region, options): RevolveValidationResult`

Validate revolve parameters before execution.

**Returns:**
```typescript
{
  valid: boolean,
  errors: string[],
  warnings: string[]
}
```

---

### RevolveOptions Interface

```typescript
interface RevolveOptions {
  // Primary angle (radians)
  angle: number;
  
  // Secondary angle for two-direction (radians)
  angle2?: number;
  
  // Revolution axis
  axis: {
    point: Vector3;      // Point on axis
    direction: Vector3;  // Unit direction vector
  };
  
  // Tessellation quality (default: 32)
  segments?: number;
  
  // Run validation (default: true)
  validateProfile?: boolean;
  
  // Create surface vs solid (default: false)
  surfaceOnly?: boolean;
}
```

---

### Convenience Methods

#### `createSphere(radius, center?, segments?): SolidData`

Generate a sphere.

```typescript
const sphere = RevolveOperation.createSphere(50, { x: 0, y: 0, z: 0 }, 32);
```

---

#### `createTorus(majorRadius, minorRadius, center?, segments?): SolidData`

Generate a torus (donut).

```typescript
const torus = RevolveOperation.createTorus(100, 20, { x: 0, y: 0, z: 0 }, 32);
```

---

## Best Practices

### 1. Profile Design
- ✅ Keep profile at reasonable distance from axis (>1mm)
- ✅ Use closed profiles for solid bodies
- ✅ Use open profiles for surface bodies
- ❌ Avoid profiles that cross the axis
- ❌ Avoid very close proximity to axis (<0.1mm)

### 2. Angle Selection
- ✅ Use 360° (2π) for full revolution
- ✅ Use Two-Direction for asymmetric shapes
- ✅ Use Symmetric for balanced features
- ⚠️ Angles >360° will show warning
- ❌ Zero angle is invalid

### 3. Axis Selection
- ✅ Use sketch axes when possible (X, Y, Z)
- ✅ Ensure axis is perpendicular to sketch plane
- ❌ Avoid axes parallel to sketch plane
- ❌ Avoid axes too close to profile

### 4. Performance
- ✅ Use 16-32 segments for preview/testing
- ✅ Use 32-64 segments for final geometry
- ⚠️ Segments >64 may impact performance
- ❌ Avoid unnecessary high segment counts

---

## Troubleshooting

### Common Issues

#### "Profile intersects revolve axis"
**Cause:** Profile crosses the axis of revolution  
**Solution:** Move profile away from axis or choose different axis

#### "Axis is parallel to sketch plane"
**Cause:** Selected axis doesn't intersect sketch plane properly  
**Solution:** Choose an axis perpendicular to sketch plane

#### "Invalid profile for revolve"
**Cause:** Profile has <2 points or is degenerate  
**Solution:** Ensure profile is properly defined with multiple points

#### Jagged/faceted geometry
**Cause:** Too few segments for tessellation  
**Solution:** Increase segment count (32-64 recommended)

#### Self-intersecting geometry
**Cause:** Profile shape causes overlaps during revolution  
**Solution:** Simplify profile or reduce revolution angle

---

## Future Enhancements

### Planned Features
- [ ] Revolve with draft angle
- [ ] Revolve with twist (spiral forms)
- [ ] Revolve with variable radius (tapered)
- [ ] Multi-profile revolve
- [ ] Revolve around custom 3D axis

### Under Consideration
- [ ] GPU-accelerated tessellation
- [ ] Adaptive segment count based on curvature
- [ ] NURBS surface generation option
- [ ] Direct B-rep output (vs mesh)

---

## References

### Related Features
- **Extrude** - Linear profile sweep
- **Sweep** - Profile along path
- **Loft** - Between multiple profiles

### External Resources
- [Parametric CAD Fundamentals](https://en.wikipedia.org/wiki/Parametric_design)
- [Solid Modeling Theory](https://en.wikipedia.org/wiki/Solid_modeling)
- [Revolution Surfaces](https://mathworld.wolfram.com/SurfaceofRevolution.html)

---

**Document Version:** 1.0  
**Last Updated:** December 27, 2025  
**Maintainer:** FeAI Development Team

