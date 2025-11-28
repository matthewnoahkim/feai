# CRITICAL: Additional Crash Prevention Measures

## What I've Changed

### 1. More Aggressive Limits

- **Frontend vertex check**: Now rejects if CAD geometry has > 30,000 vertices (~10k triangles)
- **Backend node limit**: Reduced from 10,000 to **5,000 nodes maximum** (~25k elements)
- **Default element size**: Increased from 5mm to **10mm** (much safer starting point)
- **Minimum element size**: Increased from 1mm to 2mm in defaults

### 2. Early Detection

Before sending the request, the frontend now:
- Counts total vertices in all parts
- Rejects immediately if too large
- Shows helpful error message
- Prevents the crash before it happens

### 3. Better Error Messages

If mesh is too large, you'll now see:
- Exact part dimensions (e.g., "100×50×75mm")
- Current element size you tried
- **Recommended element size** to use
- Predicted node/element count

## If It Still Crashes

### Immediate Actions:

1. **Open Browser Console** (F12) BEFORE clicking Generate Mesh
2. **Watch for logs** starting with `[FEA]`
3. If it crashes, **the console will show what happened**

### Check Your Geometry:

The crash likely means your CAD geometry is too complex. Check in console:
```
[FEA] Total vertices in parts: XXXXX
```

If vertices > 30,000, you need to:
- **Simplify the CAD model** (fewer features, simpler shapes)
- **Use coarser tessellation** (if there's a setting for that)
- **Split into smaller parts**

### Safe Workflow:

1. **Start with LARGE element size**: 15-20mm
2. **Check console for warnings**
3. **Verify it works** before reducing size
4. **Gradually decrease** if needed (10mm → 7mm → 5mm)

### What Size Should You Use?

| Your Part Size | Safe Element Size | Will Create |
|----------------|-------------------|-------------|
| < 25mm         | 5mm              | ~100 nodes  |
| 25-50mm        | 10mm             | ~200 nodes  |
| 50-100mm       | 15-20mm          | ~500 nodes  |
| 100-200mm      | 25-30mm          | ~1000 nodes |
| 200mm+         | 40-50mm          | ~1000 nodes |

## Diagnostic Steps:

### Step 1: Check Your Geometry Size

Before meshing, note your part dimensions from the viewport.

### Step 2: Calculate Expected Nodes

```
nodes = (width/size + 1) × (height/size + 1) × (depth/size + 1)
```

Example: 100mm cube with 10mm elements:
```
nodes = (100/10 + 1) × (100/10 + 1) × (100/10 + 1)
      = 11 × 11 × 11  
      = 1,331 nodes ✅ SAFE
```

Same cube with 2mm elements:
```
nodes = (100/2 + 1) × (100/2 + 1) × (100/2 + 1)
      = 51 × 51 × 51
      = 132,651 nodes 💥 CRASH!
```

### Step 3: If Console Shows Error

The error will tell you EXACTLY what to change:
```
"Please increase element size to at least 15mm"
```

**Follow that advice!**

## Why It Might Still Crash

### Possibility 1: Huge CAD Geometry

Your CAD model itself might have millions of triangles. This happens when:
- Using very fine tessellation
- Complex curved surfaces
- Many small features
- Imported STL with high detail

**Solution**: Simplify the CAD model first

### Possibility 2: Browser Memory Limit

Some browsers have stricter memory limits:
- **Chrome**: ~2-4GB per tab
- **Firefox**: ~2-4GB per tab
- **Edge**: ~2-4GB per tab

If your system has low RAM or many tabs open:
- Close other tabs
- Restart browser
- Use a computer with more RAM

### Possibility 3: Response Too Large

If backend generates the mesh but browser crashes receiving it:
- The limit of 5,000 nodes should prevent this
- But network could still choke on large JSON

## Emergency Fallback

If nothing works and it keeps crashing:

1. **Edit the file manually**: `packages/frontend/src/store/feaStore.ts`
2. **Find line with** `globalSize: 10`
3. **Change to** `globalSize: 25` or even `globalSize: 50`
4. **Rebuild**: `npm run build`
5. This makes it MUCH safer but less accurate

## Report What You See

If it still crashes after all this, please share:
1. **Console output** (the `[FEA]` logs)
2. **Part dimensions** (how big is your model?)
3. **Element size** you tried
4. **When crash happens** (during request? during response? during visualization?)

This will help identify if there's another issue we haven't caught yet.

