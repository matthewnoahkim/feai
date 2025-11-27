/**
 * Documents API Routes
 */

import { Router } from 'express';
import { store } from '../store';

export const documentsRouter = Router();

// List all documents
documentsRouter.get('/', (req, res) => {
  const documents = store.getDocuments();
  
  res.json({
    success: true,
    data: {
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        created: doc.created,
        modified: doc.modified,
        elementCount: doc.elements.partStudios.length + 
                      doc.elements.assemblies.length + 
                      doc.elements.drawings.length
      }))
    },
    timestamp: new Date().toISOString()
  });
});

// Get a specific document
documentsRouter.get('/:id', (req, res) => {
  const doc = store.getDocument(req.params.id);
  
  if (!doc) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Document not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { document: doc },
    timestamp: new Date().toISOString()
  });
});

// Create a new document
documentsRouter.post('/', (req, res) => {
  const { name, description } = req.body;
  
  const doc = store.createDocument({
    name: name || 'Untitled Document',
    description
  });

  res.status(201).json({
    success: true,
    data: { document: doc },
    timestamp: new Date().toISOString()
  });
});

// Update a document
documentsRouter.put('/:id', (req, res) => {
  const { name, description } = req.body;
  
  const updated = store.updateDocument(req.params.id, {
    name,
    description
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Document not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { document: updated },
    timestamp: new Date().toISOString()
  });
});

// Delete a document
documentsRouter.delete('/:id', (req, res) => {
  const deleted = store.deleteDocument(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Document not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { deleted: true },
    timestamp: new Date().toISOString()
  });
});

// Get part studios in a document
documentsRouter.get('/:id/partstudios', (req, res) => {
  const partStudios = store.getPartStudiosByDocument(req.params.id);
  
  res.json({
    success: true,
    data: { partStudios },
    timestamp: new Date().toISOString()
  });
});

// Get a specific part studio
documentsRouter.get('/:docId/partstudios/:psId', (req, res) => {
  const partStudio = store.getPartStudio(req.params.psId);
  
  if (!partStudio) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Part studio not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { partStudio },
    timestamp: new Date().toISOString()
  });
});

// Get features in a part studio
documentsRouter.get('/:docId/partstudios/:psId/features', (req, res) => {
  const partStudio = store.getPartStudio(req.params.psId);
  
  if (!partStudio) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Part studio not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { features: partStudio.features },
    timestamp: new Date().toISOString()
  });
});

// Add a feature to a part studio
documentsRouter.post('/:docId/partstudios/:psId/features', (req, res) => {
  const { feature } = req.body;
  
  const newFeature = store.addFeature(req.params.psId, feature);
  
  if (!newFeature) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Part studio not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { feature: newFeature },
    timestamp: new Date().toISOString()
  });
});

// Update a feature
documentsRouter.put('/:docId/partstudios/:psId/features/:fId', (req, res) => {
  const updated = store.updateFeature(req.params.psId, req.params.fId, req.body);
  
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Feature not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { feature: updated },
    timestamp: new Date().toISOString()
  });
});

// Delete a feature
documentsRouter.delete('/:docId/partstudios/:psId/features/:fId', (req, res) => {
  const deleted = store.deleteFeature(req.params.psId, req.params.fId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Feature not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { deleted: true },
    timestamp: new Date().toISOString()
  });
});

// Create a sketch
documentsRouter.post('/:docId/partstudios/:psId/sketches', (req, res) => {
  const { name, plane } = req.body;
  
  const sketch = store.createSketch(req.params.psId, {
    name: name || 'Sketch',
    plane: plane || {
      origin: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 1 },
      xAxis: { x: 1, y: 0, z: 0 }
    },
    entities: [],
    constraints: [],
    dimensions: []
  });
  
  if (!sketch) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Part studio not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { sketch },
    timestamp: new Date().toISOString()
  });
});

// Get a sketch
documentsRouter.get('/:docId/partstudios/:psId/sketches/:skId', (req, res) => {
  const sketch = store.getSketch(req.params.skId);
  
  if (!sketch) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Sketch not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { sketch },
    timestamp: new Date().toISOString()
  });
});

// Add entities to a sketch
documentsRouter.post('/:docId/partstudios/:psId/sketches/:skId/entities', (req, res) => {
  const { entities } = req.body;
  const addedEntities = [];
  
  for (const entity of entities || []) {
    const added = store.addSketchEntity(req.params.skId, entity);
    if (added) addedEntities.push(added);
  }

  res.status(201).json({
    success: true,
    data: { entities: addedEntities },
    timestamp: new Date().toISOString()
  });
});

// Add constraints to a sketch
documentsRouter.post('/:docId/partstudios/:psId/sketches/:skId/constraints', (req, res) => {
  const { constraints } = req.body;
  const addedConstraints = [];
  
  for (const constraint of constraints || []) {
    const added = store.addSketchConstraint(req.params.skId, constraint);
    if (added) addedConstraints.push(added);
  }

  res.status(201).json({
    success: true,
    data: { constraints: addedConstraints },
    timestamp: new Date().toISOString()
  });
});
