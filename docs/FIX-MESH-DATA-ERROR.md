# Fix: "No mesh data available" Error

## Problem

When clicking "Generate Mesh" in the FEA module, you were getting an error:
> "No mesh data available. Please ensure the geometry has been generated."

## Root Cause

The issue was a **data synchronization problem** between the frontend and backend:

1. **Frontend CAD System**:
   - When you create geometry (extrude, revolve, etc.), the `regenerateModel` function generates mesh data
   - This mesh data is stored as the `mesh` property on parts
   - This data stays in the **frontend store only**

2. **Backend FEA System**:
   - When you click "Generate Mesh", it sends a request to `/api/fea/mesh`
   - The backend tries to get parts from its **own separate store**
   - The backend's store doesn't have the mesh data because it was never sent
   - Backend was looking for `part.meshData` but it didn't exist

## Solution

### 1. Send Mesh Data with Request

Modified `packages/frontend/src/store/feaStore.ts` to:
- Access the document store to get current parts with their mesh data
- Send the mesh data along with the FEA mesh generation request
- Transform `mesh` → `meshData` for backend compatibility

```typescript
// Now sends mesh data directly:
const partsWithMesh = partStudio.parts.map((part: any) => ({
  id: part.id,
  name: part.name,
  meshData: part.mesh  // Send geometry data
}));

const response = await apiClient.generateMesh(partStudioId, {
  ...state.meshSettings,
  parts: partsWithMesh  // Include parts in request
});
```

### 2. Backend Accepts Mesh Data

Modified `packages/backend/src/routes/fea.ts` to:
- Accept `parts` array in the settings object
- Use sent mesh data if available (preferred)
- Fall back to backend store if no data sent
- Check both `meshData` and `mesh` properties for compatibility

```typescript
// Now accepts parts from frontend:
let parts = settings?.parts || [];

// Fall back to backend store if needed:
if (parts.length === 0) {
  partStudio = store.getPartStudio(partStudioId);
  parts = partStudio.parts || [];
}
```

### 3. Cross-Store Access

Exposed document store globally so FEA store can access it:

```typescript
// In packages/frontend/src/store/documentStore.ts:
if (typeof window !== 'undefined') {
  (window as any).__documentStore = useDocumentStore;
}
```

## How It Works Now

1. **Create Geometry** → Frontend generates mesh data and stores it
2. **Click Generate Mesh** → FEA store retrieves current mesh data from document store
3. **Send to Backend** → Mesh data is sent with the API request
4. **Backend Processes** → Uses the sent mesh data to generate FEA mesh
5. **Success!** → Mesh is generated and displayed

## Testing

To verify the fix works:

1. Create a new document
2. Add a feature (extrude, revolve, etc.) to create geometry
3. Click the FEA button in toolbar
4. Go to Mesh tab
5. Click "Generate Mesh"
6. ✅ Should now work without "No mesh data" error

## Additional Benefits

- Better error messages if geometry is missing
- Validates that parts exist before attempting mesh
- Logs mesh data info for debugging
- Compatible with both frontend `mesh` and backend `meshData` formats

