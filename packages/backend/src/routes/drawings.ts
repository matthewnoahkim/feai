/**
 * Drawings API Routes
 */

import { Router } from 'express';
import { store } from '../store';

export const drawingsRouter = Router();

// Get drawing
drawingsRouter.get('/:docId/:dwgId', (req, res) => {
  const drawing = store.getDrawing(req.params.dwgId);
  
  if (!drawing) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Drawing not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { drawing },
    timestamp: new Date().toISOString()
  });
});

// Add view to drawing
drawingsRouter.post('/:docId/:dwgId/views', (req, res) => {
  const { sheetIndex, view } = req.body;
  
  const added = store.addView(req.params.dwgId, sheetIndex || 0, view);
  
  if (!added) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Drawing or sheet not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { view: added },
    timestamp: new Date().toISOString()
  });
});

// Add dimension to drawing
drawingsRouter.post('/:docId/:dwgId/dimensions', (req, res) => {
  // Placeholder - would add dimension to drawing
  res.status(201).json({
    success: true,
    data: { dimension: req.body },
    timestamp: new Date().toISOString()
  });
});
