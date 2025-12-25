# Revolve Feature - Technical Architecture

## System Overview

The Revolve feature is implemented across three main layers of the CAD system:

1. **Kernel Layer** - Core geometry algorithms
2. **Store Layer** - State management and feature regeneration
3. **UI Layer** - User interaction and visualization

---

## 1. Kernel Layer (`packages/kernel/src/modeling/revolve.ts`)

### Core Class: `RevolveOperation`

#### Public API

```typescript
class RevolveOperation {
  // Main revolve method
  static revolve(
    sketch: Sketch,
    region: SketchRegion,
    options: RevolveOptions
  ): SolidData

  // Validation
  static validate(
    sketch: Sketch,
    region: SketchRegion,
    options: RevolveOptions
  ): RevolveValidationResult
  
  // Convenience methods
  static createSphere(radius: number, center?: Vector3, segments?: number): SolidData
  static createTorus(majorRadius: number, minorRadius: number, ...): SolidData
}
```

#### RevolveOptions Interface

```typescript
interface RevolveOptions {
  angle: number;              // Primary angle (radians)
  angle2?: number;            // Secondary angle for two-direction (radians)
  axis: {
    point: Vector3;           // Point on axis
    direction: Vector3;       // Unit direction vector
  };
  segments?: number;          // Tessellation quality (default: 32)
  validateProfile?: boolean;  // Run validation (default: true)
  surfaceOnly?: boolean;      // Create surface vs solid (default: false)
}
```

#### Algorithm Flow

1. **Validation Phase**
   ```
   validate() → check profile validity
              → check angle validity
              → check axis-profile relationship
              → check sketch plane orientation
              → return errors/warnings
   ```

2. **Geometry Preparation**
   ```
   getRegionPoints() → extract 2D profile points
                    → handle lines, arcs, splines
                    → sample curves into segments
   
   PlaneUtils.to3D() → convert 2D sketch points to 3D
   
   normalize axis → ensure unit direction vector
   ```

3. **Revolution Generation**
   ```
   Calculate angle range:
     startAngle = -abs(angle2)
     endAngle = abs(angle)
     totalAngle = endAngle - startAngle
   
   For each angular segment:
     rotationMatrix = Mat4.rotationAxis(axisDir, currentAngle)
     For each profile point:
       relative = point - axisPoint
       rotated = rotationMatrix * relative
       final = rotated + axisPoint
       addVertex(final)
   ```

4. **Face Creation**
   ```
   For each quad (4 vertices):
     v00 ----e1---- v01
      |              |
     e4             e2
      |              |
     v10 ----e3---- v11
     
     createLoop([e1, e2, e3, e4], orientations)
     calculateNormal()
     addFace(surface, [loop])
   ```

5. **End Cap Generation** (if not full revolution and not surface-only)
   ```
   Start cap:
     edgeLoop = profile edges at startAngle
     normal = perpendicular to profile, pointing inward
     addFace(startCapSurface, [edgeLoop])
   
   End cap:
     edgeLoop = profile edges at endAngle
     normal = perpendicular to profile, pointing outward
     addFace(endCapSurface, [edgeLoop])
   ```

6. **B-Rep Assembly**
   ```
   builder.addShell(faceIds)
   return builder.toSolidData()
   ```

#### Key Private Methods

```typescript
// Get profile center relative to axis (for cap normals)
private static getProfileCenter(
  profilePoints: Vec3[], 
  axisPoint: Vec3, 
  axisDir: Vec3
): Vec3

// Extract and sample sketch region edges
private static getRegionPoints(
  sketch: Sketch, 
  region: SketchRegion
): { x: number; y: number }[]

// Evaluate spline at parameter t
private static evaluateSpline(
  controlPoints: any[], 
  t: number
): { x: number; y: number }
```

#### Validation Checks

| Check | Severity | Threshold |
|-------|----------|-----------|
| Zero angle | Error | angle < ε (1e-6) |
| Angle > 360° | Warning | totalAngle > 2π + ε |
| Profile too close to axis | Warning | distance < 1e-4 |
| Sketch plane parallel to axis | Error | \|normal·axis\| > 1 - ε |
| Insufficient points | Error | points < 2 |

---

## 2. Store Layer (`packages/frontend/src/store/documentStore.ts`)

### State Management

The document store manages:
- Feature tree structure
- Sketch-to-feature relationships
- Regeneration triggers
- Mesh generation for rendering

### Key Functions

#### Axis Resolution
```typescript
function getAxisVector(
  axisId: string, 
  partStudio?: PartStudio
): { origin: [number, number, number], direction: [number, number, number] }
```

**Supports:**
- Standard reference axes: `'x-axis'`, `'y-axis'`, `'z-axis'`
- Sketch line entities: extracted from sketch by entity ID
- Fallback: defaults to Y-axis if invalid

**Algorithm:**
```
if axisId is reference axis:
  return predefined direction
else:
  search all sketches for entity with axisId
  if found and is line:
    extract start/end points
    normalize direction vector
    return { origin: start, direction: normalized }
  else:
    return Y-axis (fallback)
```

#### Mesh Generation

```typescript
function createMeshFromSketchEntityRevolve(
  entity: SketchEntity,
  params: RevolveParams,
  partStudio?: PartStudio
): { vertices: number[], normals: number[], indices: number[] } | null
```

**Flow:**
1. Dispatch by entity type (rectangle, circle, polygon)
2. Call type-specific mesh generator
3. Pass partStudio for axis resolution
4. Return Three.js-compatible mesh data

#### Feature Regeneration

```typescript
regenerateModel: async (partStudioId) => {
  for each feature in features:
    if feature.type === 'revolve':
      extract parameters
      resolve sketch and profile
      create mesh
      apply operation (new/add/remove/intersect)
      update current body
}
```

**Operation Handling:**
- `new`: Create new part body
- `add`: Replace current body mesh (simplified union)
- `remove`: Replace mesh, mark with red color
- `intersect`: Replace mesh

---

## 3. UI Layer

### RevolveDialog Component (`packages/frontend/src/components/dialogs/RevolveDialog.tsx`)

#### Component Structure

```tsx
function RevolveDialog() {
  // State
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [selectedAxis, setSelectedAxis] = useState<string>('y-axis')
  const [operation, setOperation] = useState<OperationType>('new')
  const [directionType, setDirectionType] = useState<DirectionType>('full')
  const [angle, setAngle] = useState(360)
  const [angle2, setAngle2] = useState(0)
  // ... more state
  
  // Computed values
  const availableProfiles = useMemo(...)
  const availableAxes = useMemo(...)
  
  // Effects
  useEffect(() => {
    setDialogData({ /* update for preview */ })
  }, [selectedProfile, angle, axis, ...])
  
  // Handlers
  const handleCreate = async () => {
    validate inputs
    build parameters
    await addFeature(partStudioId, feature)
  }
  
  return <DialogUI />
}
```

#### Key UI Sections

1. **Profile Selection**
   - Lists all closed shapes (rectangle, circle, polygon) for solids
   - Lists lines for surfaces
   - Visual indicator for selected profile
   - Entity type icons

2. **Axis Selection**
   - Reference axes (X, Y, Z)
   - Sketch lines from all sketches
   - Visual indicator for selected axis
   - Entity type icons

3. **Angle Controls**
   - Direction type selector (Full/One-Direction/Symmetric)
   - Primary angle input (degrees)
   - Secondary angle input (for asymmetric)
   - Visual angle summary

4. **Operation Type**
   - Grid of 4 buttons: New, Add, Remove, Intersect
   - Icons for each operation
   - Color-coded for clarity

5. **Advanced Options**
   - Revolve type (Solid/Surface/Thin)
   - Thin revolve parameters (if selected)
   - Merge scope (for boolean operations)

6. **Summary Panel**
   - Selected profile name
   - Selected axis name
   - Operation type
   - Total angle calculation
   - Type indicator (solid vs surface)
   - Validation messages

#### Data Flow

```
User Input → Component State → useEffect → setDialogData
                                              ↓
                                    dialogData in store
                                              ↓
                                    RevolvePreview component reads
                                              ↓
                                    Renders preview mesh
                                              ↓
                                    User sees real-time preview
```

### RevolvePreview Component (`packages/frontend/src/components/Viewport3D.tsx`)

#### Component Structure

```tsx
function RevolvePreview() {
  const { activeDialog, dialogData } = useUIStore()
  const { document } = useDocumentStore()
  
  // Early returns for invalid state
  if (activeDialog !== 'revolve' || !dialogData) return null
  if (!profile || !axis) return null
  
  // Geometry generation
  const geometry = useMemo(() => {
    // Create Three.js BufferGeometry
    // Populate vertices, normals, indices
    return geo
  }, [entity, angle, axis, direction])
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={operationColor}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}
```

#### Preview Geometry Generation

**For Circles (Torus):**
```typescript
const torusRadius = distanceToAxis
const tubeRadius = circleRadius

for (revolveSegment in segments):
  theta = startAngle + segmentFraction * totalAngle
  for (profileSegment in circleSegments):
    phi = segmentFraction * 2π
    
    // Torus parametric equation
    r = torusRadius + tubeRadius * cos(phi)
    x = r * cos(theta)
    y = centerY + tubeRadius * sin(phi)
    z = r * sin(theta)
    
    addVertex(x, y, z)
```

**For Rectangles/Polygons:**
```typescript
profilePoints = extract2DPoints(entity)

for (revolveSegment in segments):
  theta = startAngle + segmentFraction * totalAngle
  for each profilePoint in profilePoints:
    [r, y] = profilePoint
    
    // Revolve around axis
    x = r * cos(theta)
    y = y
    z = r * sin(theta)
    
    addVertex(x, y, z)
```

**Indexing:**
```typescript
// Quad strip tessellation
for (i in segments):
  for (j in profilePoints):
    i0 = i * numProfilePoints + j
    i1 = i * numProfilePoints + (j+1)
    i2 = (i+1) * numProfilePoints + j
    i3 = (i+1) * numProfilePoints + (j+1)
    
    // Two triangles per quad
    indices.push(i0, i2, i1)
    indices.push(i1, i2, i3)
```

---

## 4. Data Flow Architecture

### Complete Feature Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                            │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ RevolveDialog                                                │
│  - Collect parameters                                        │
│  - Validate inputs                                           │
│  - Build feature definition                                  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ addFeature(partStudioId, featureData)
             ▼
┌─────────────────────────────────────────────────────────────┐
│ DocumentStore.addFeature()                                   │
│  - Add to feature tree                                       │
│  - Trigger regeneration                                      │
└────────────┬────────────────────────────────────────────────┘
             │
             │ regenerateModel(partStudioId)
             ▼
┌─────────────────────────────────────────────────────────────┐
│ DocumentStore.regenerateModel()                              │
│  - Iterate features in order                                 │
│  - Process revolve feature                                   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ createMeshFromSketchEntityRevolve()                          │
│  - Resolve axis                                              │
│  - Dispatch to type-specific generator                       │
│  - Return mesh data                                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Part Creation                                                │
│  - Create Part object with mesh                              │
│  - Add to parts array                                        │
│  - Update document state                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Viewport3D Rendering                                         │
│  - PartMesh component renders geometry                       │
│  - Three.js displays result                                  │
└─────────────────────────────────────────────────────────────┘
```

### Preview Flow (Real-Time)

```
┌─────────────────────────────────────────────────────────────┐
│ User adjusts parameter (angle, axis, etc.)                  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ setState()
             ▼
┌─────────────────────────────────────────────────────────────┐
│ RevolveDialog useEffect()                                    │
│  - Detects state change                                      │
│  - Calls setDialogData()                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ updates dialogData in UIStore
             ▼
┌─────────────────────────────────────────────────────────────┐
│ RevolvePreview component                                     │
│  - Subscribes to dialogData changes                          │
│  - useMemo triggers on dependency change                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Geometry Generation                                          │
│  - Create BufferGeometry                                     │
│  - Calculate vertices/normals/indices                        │
│  - Return new geometry                                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Three.js Rendering                                           │
│  - Mesh component receives new geometry                      │
│  - React-Three-Fiber updates scene                           │
│  - User sees updated preview (< 60ms)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Key Algorithms

### Rotation Matrix Generation

Using Rodrigues' rotation formula for arbitrary axis:

```typescript
Mat4.rotationAxis(axis: Vec3, angle: number): Mat4 {
  const c = cos(angle)
  const s = sin(angle)
  const t = 1 - c
  
  const [x, y, z] = [axis.x, axis.y, axis.z]
  
  return [
    [t*x*x + c,   t*x*y - s*z, t*x*z + s*y, 0],
    [t*x*y + s*z, t*y*y + c,   t*y*z - s*x, 0],
    [t*x*z - s*y, t*y*z + s*x, t*z*z + c,   0],
    [0,           0,           0,           1]
  ]
}
```

### Segment Count Calculation

```typescript
// Adaptive based on angle
const effectiveSegments = max(3, ceil(segments * totalAngle / (2π)))

// Full revolution: use exact segment count
if (isFullRevolution) {
  numSegments = effectiveSegments
} else {
  // Partial: add one for end vertices
  numSegments = effectiveSegments + 1
}
```

### Normal Calculation

```typescript
// For side faces
perpDir = point - axis * (point · axis)  // perpendicular component
rotatedPerp = rotationMatrix * perpDir
normal = normalize(rotatedPerp)

// For end caps
profileCenter = average(profilePoints - axis * (profilePoints · axis))
capNormal = normalize(profileCenter × axis)
startCapNormal = -capNormal
endCapNormal = capNormal
```

---

## 6. Performance Considerations

### Optimization Strategies

1. **Adaptive Tessellation**
   - Full revolution: 32 segments
   - Partial (90°): ~8 segments
   - Scales linearly with angle

2. **React Memoization**
   ```typescript
   const geometry = useMemo(() => {
     // Expensive calculation
   }, [angle, axis, profile])
   ```
   - Only recalculates when dependencies change
   - Prevents unnecessary recomputation

3. **Early Returns**
   - Bounding box checks before expensive operations
   - Validation short-circuits on first error
   - Preview early returns for invalid state

4. **Geometry Caching**
   - BufferGeometry reused when possible
   - Vertex buffers allocated once
   - Index buffers shared for similar topologies

### Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Profile extraction | O(n) | O(n) |
| Rotation matrix | O(1) | O(1) |
| Vertex generation | O(s × p) | O(s × p) |
| Face creation | O(s × p) | O(s × p) |
| End caps | O(p) | O(p) |
| **Total** | **O(s × p)** | **O(s × p)** |

Where:
- `s` = number of segments (typically 8-32)
- `p` = number of profile points (typically 4-24)
- `n` = number of sketch edges

**Typical Values:**
- Simple rectangle: s=32, p=4 → 128 vertices, 256 triangles
- Circle profile: s=32, p=16 → 512 vertices, 1024 triangles

---

## 7. Error Handling Strategy

### Validation Errors (Prevent Creation)

```typescript
if (angle === 0) {
  throw new Error('Revolve angle cannot be zero')
}

if (profilePoints.length < 2) {
  throw new Error('Profile must have at least 2 points')
}

if (sketchPlane parallel to axis) {
  throw new Error('Sketch plane normal is parallel to revolve axis')
}
```

### Warnings (Allow with Caution)

```typescript
if (totalAngle > 2π + ε) {
  warnings.push('Total revolve angle exceeds 360°')
}

if (minDistanceToAxis < threshold) {
  warnings.push('Profile is very close to revolve axis')
}
```

### Graceful Degradation

```typescript
// Invalid axis → fallback to Y-axis
const axis = getAxisVector(axisId, partStudio) || { origin: [0,0,0], direction: [0,1,0] }

// Invalid entity → return null, skip feature
if (!entity || !supportedType(entity)) {
  return null
}

// Failed mesh generation → show default cylinder
if (!mesh) {
  mesh = createCylinderMesh(defaultRadius, defaultHeight)
}
```

---

## 8. Testing Architecture

### Unit Tests (Recommended)

```typescript
describe('RevolveOperation', () => {
  test('validates zero angle', () => {
    const result = RevolveOperation.validate(sketch, region, { angle: 0, ... })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('angle cannot be zero')
  })
  
  test('generates correct vertex count', () => {
    const solid = RevolveOperation.revolve(sketch, region, { angle: Math.PI * 2, segments: 16, ... })
    const expectedVertices = 16 * profilePoints.length
    expect(Object.keys(solid.vertices).length).toBe(expectedVertices)
  })
  
  test('handles two-direction revolve', () => {
    const solid = RevolveOperation.revolve(sketch, region, {
      angle: Math.PI,
      angle2: Math.PI / 2,
      ...
    })
    // Verify geometry spans correct angle range
  })
})
```

### Integration Tests

```typescript
describe('Revolve Feature Integration', () => {
  test('creates feature in document', async () => {
    const doc = createTestDocument()
    const sketch = addTestSketch(doc)
    await addRevolveFeature(sketch, revolveParams)
    
    expect(doc.partStudios[0].features.length).toBe(1)
    expect(doc.partStudios[0].features[0].type).toBe('revolve')
  })
  
  test('regenerates on parameter change', async () => {
    const feature = createRevolveFeature()
    const originalMesh = feature.mesh
    
    feature.parameters.angle = 180
    await regenerateModel()
    
    expect(feature.mesh).not.toBe(originalMesh)
  })
})
```

### E2E Tests (Recommended)

```typescript
test('user can create revolve feature', async () => {
  await page.goto('/cad')
  await page.click('[data-testid="new-sketch"]')
  await page.click('[data-testid="rectangle-tool"]')
  await drawRectangle(page, 20, 20, 40, 40)
  await page.click('[data-testid="exit-sketch"]')
  await page.click('[data-testid="revolve-button"]')
  await page.click('[data-testid="create-revolve"]')
  
  const featureTree = await page.locator('[data-testid="feature-tree"]')
  await expect(featureTree).toContainText('Revolve 1')
})
```

---

## 9. Extension Points

### Adding New Profile Types

```typescript
// 1. Add case in getRegionPoints()
case 'ellipse':
  return sampleEllipse(entity.data)

// 2. Add mesh generator
function createRevolvedEllipseMesh(...) {
  // Generate mesh for ellipse profile
}

// 3. Add to dispatcher
case 'ellipse':
  return createRevolvedEllipseMesh(entity, params, partStudio)
```

### Adding New Axis Types

```typescript
// 1. Extend getAxisVector()
case 'construction-axis':
  return resolveConstructionAxis(axisId, partStudio)

// 2. Add to axis selector UI
availableAxes.push({
  sketchId: 'construction',
  entityId: axisId,
  entityType: 'construction-axis',
  displayName: 'Construction Axis 1'
})
```

### Adding Advanced Options

```typescript
// 1. Extend RevolveOptions
interface RevolveOptions {
  // ... existing fields
  offsetFromAxis?: number;
  draftAngle?: number;
}

// 2. Add UI controls in RevolveDialog
<input
  type="number"
  value={offsetFromAxis}
  onChange={(e) => setOffsetFromAxis(Number(e.target.value))}
/>

// 3. Apply in kernel
const adjustedPoint = point.add(axis.cross(normal).mul(offsetFromAxis))
```

---

## 10. Debugging Guide

### Common Issues

**Issue: Preview not showing**
```typescript
// Debug checklist:
console.log('activeDialog:', activeDialog)
console.log('dialogData:', dialogData)
console.log('profileEntity:', entity)
console.log('geometry vertices:', geometry.attributes.position?.count)
```

**Issue: Axis not resolving**
```typescript
// Add debug logging:
function getAxisVector(axisId: string, partStudio?: PartStudio) {
  console.log('Resolving axis:', axisId)
  console.log('PartStudio sketches:', partStudio?.sketches.size)
  const result = // ... resolution logic
  console.log('Resolved axis:', result)
  return result
}
```

**Issue: Feature fails to regenerate**
```typescript
// Check:
1. Feature parameters stored correctly?
2. Sketch reference still valid?
3. Entity still exists in sketch?
4. Console errors?
5. Linter errors?
```

### Performance Profiling

```typescript
// Add timing
console.time('revolve-geometry')
const solid = RevolveOperation.revolve(sketch, region, options)
console.timeEnd('revolve-geometry')

// Profile React renders
const RevolveDialog = React.memo(function RevolveDialog() {
  console.log('RevolveDialog render')
  // ...
}, (prev, next) => {
  return prev.dialogData === next.dialogData
})
```

---

## Conclusion

This architecture provides a robust, extensible foundation for the Revolve feature, following industry-standard CAD practices while maintaining clean separation of concerns across kernel, store, and UI layers.

