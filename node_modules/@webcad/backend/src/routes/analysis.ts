/**
 * Analysis API Routes
 */

import { Router } from 'express';
import { store } from '../store';

export const analysisRouter = Router();

// Get mass properties
analysisRouter.get('/:docId/:elementId/mass-properties', (req, res) => {
  const partStudio = store.getPartStudio(req.params.elementId);
  
  if (!partStudio) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Element not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Calculate mass properties (placeholder values)
  const massProperties = {
    volume: 27000, // mm³
    surfaceArea: 5400, // mm²
    mass: 0.212, // kg (assuming steel density)
    density: 7850, // kg/m³
    centerOfMass: {
      x: 0,
      y: 0,
      z: 15
    },
    momentOfInertia: {
      ixx: 1125000,
      iyy: 1125000,
      izz: 1125000,
      ixy: 0,
      ixz: 0,
      iyz: 0
    },
    boundingBox: {
      min: { x: -15, y: -15, z: 0 },
      max: { x: 15, y: 15, z: 30 }
    }
  };

  res.json({
    success: true,
    data: { massProperties },
    timestamp: new Date().toISOString()
  });
});

// Check interference (for assemblies)
analysisRouter.get('/:docId/:elementId/interference', (req, res) => {
  const assembly = store.getAssembly(req.params.elementId);
  
  if (!assembly) {
    // Might be a part studio, return no interference
    return res.json({
      success: true,
      data: {
        hasInterference: false,
        interferences: []
      },
      timestamp: new Date().toISOString()
    });
  }

  // Run interference check (placeholder)
  const interferences: any[] = [];

  res.json({
    success: true,
    data: {
      hasInterference: interferences.length > 0,
      interferences
    },
    timestamp: new Date().toISOString()
  });
});

// Draft analysis
analysisRouter.get('/:docId/:elementId/draft', (req, res) => {
  const { pullDirection } = req.query;
  
  const partStudio = store.getPartStudio(req.params.elementId);
  
  if (!partStudio) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Element not found'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Parse pull direction (default: +Z)
  let direction = { x: 0, y: 0, z: 1 };
  if (pullDirection) {
    try {
      direction = JSON.parse(pullDirection as string);
    } catch {}
  }

  // Run draft analysis (placeholder)
  const draftAnalysis = {
    pullDirection: direction,
    requiredDraftAngle: 1, // degrees
    faces: [
      {
        faceId: 'face1',
        draftAngle: 0,
        isPositive: false,
        isParallel: true
      },
      {
        faceId: 'face2',
        draftAngle: 90,
        isPositive: true,
        isPerpendicular: true
      }
    ],
    summary: {
      totalFaces: 6,
      positiveDraftFaces: 4,
      negativeDraftFaces: 0,
      parallelFaces: 2,
      insufficientDraftFaces: 0
    }
  };

  res.json({
    success: true,
    data: { draftAnalysis },
    timestamp: new Date().toISOString()
  });
});

// Measure distance
analysisRouter.post('/:docId/:elementId/measure', (req, res) => {
  const { from, to, measureType } = req.body;
  
  // Placeholder measurement
  const measurement = {
    type: measureType || 'pointToPoint',
    distance: 30, // mm
    from,
    to,
    units: 'mm'
  };

  res.json({
    success: true,
    data: { measurement },
    timestamp: new Date().toISOString()
  });
});
