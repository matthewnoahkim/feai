/**
 * Assemblies API Routes
 */

import { Router } from 'express';
import { store } from '../store';

export const assembliesRouter = Router();

// Get assembly
assembliesRouter.get('/:docId/:asmId', (req, res) => {
  const assembly = store.getAssembly(req.params.asmId);
  
  if (!assembly) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Assembly not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    data: { assembly },
    timestamp: new Date().toISOString()
  });
});

// Add instance to assembly
assembliesRouter.post('/:docId/:asmId/instances', (req, res) => {
  const instance = store.addInstance(req.params.asmId, req.body);
  
  if (!instance) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Assembly not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { instance },
    timestamp: new Date().toISOString()
  });
});

// Add mate to assembly
assembliesRouter.post('/:docId/:asmId/mates', (req, res) => {
  const mate = store.addMate(req.params.asmId, req.body);
  
  if (!mate) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Assembly not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    data: { mate },
    timestamp: new Date().toISOString()
  });
});

// Check interference
assembliesRouter.get('/:docId/:asmId/interference', (req, res) => {
  const assembly = store.getAssembly(req.params.asmId);
  
  if (!assembly) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Assembly not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Placeholder - would run actual interference check
  res.json({
    success: true,
    data: {
      hasInterference: false,
      interferences: []
    },
    timestamp: new Date().toISOString()
  });
});
