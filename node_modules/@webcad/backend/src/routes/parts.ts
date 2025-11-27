/**
 * Parts API Routes
 */

import { Router } from 'express';
import { store } from '../store';

export const partsRouter = Router();

// Get parts from a part studio - redirect to documents route
partsRouter.get('/:docId/:psId', (req, res) => {
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
    data: { 
      parts: partStudio.parts,
      features: partStudio.features
    },
    timestamp: new Date().toISOString()
  });
});
