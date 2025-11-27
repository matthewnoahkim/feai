/**
 * Sketches API Routes
 */

import { Router } from 'express';
import { store } from '../store';

export const sketchesRouter = Router();

// Get sketch
sketchesRouter.get('/:docId/:psId/:skId', (req, res) => {
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

// Add entity to sketch
sketchesRouter.post('/:docId/:psId/:skId/entities', (req, res) => {
  const { entity } = req.body;
  
  const added = store.addSketchEntity(req.params.skId, entity);
  
  if (!added) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Sketch not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { entity: added },
    timestamp: new Date().toISOString()
  });
});

// Add constraint to sketch
sketchesRouter.post('/:docId/:psId/:skId/constraints', (req, res) => {
  const { constraint } = req.body;
  
  const added = store.addSketchConstraint(req.params.skId, constraint);
  
  if (!added) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Sketch not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { constraint: added },
    timestamp: new Date().toISOString()
  });
});
