/**
 * API Routes Index
 * Combines all route modules into a single router
 */

import { Router } from 'express'
import { documentsRouter } from './documents'
import { partsRouter } from './parts'
import { sketchesRouter } from './sketches'
import { assembliesRouter } from './assemblies'
import { drawingsRouter } from './drawings'
import { exportRouter } from './export'
import { importRouter } from './import'
import { analysisRouter } from './analysis'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  })
})

// Mount route modules
router.use('/documents', documentsRouter)
router.use('/parts', partsRouter)
router.use('/sketches', sketchesRouter)
router.use('/assemblies', assembliesRouter)
router.use('/drawings', drawingsRouter)
router.use('/export', exportRouter)
router.use('/import', importRouter)
router.use('/analysis', analysisRouter)

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'feai API',
      version: '1.0.0',
      description: 'RESTful API for web-based CAD operations',
      endpoints: {
        documents: {
          'GET /documents': 'List all documents',
          'POST /documents': 'Create new document',
          'GET /documents/:id': 'Get document by ID',
          'PUT /documents/:id': 'Update document',
          'DELETE /documents/:id': 'Delete document'
        },
        partStudios: {
          'GET /documents/:docId/partstudios/:psId': 'Get part studio',
          'GET /documents/:docId/partstudios/:psId/features': 'List features',
          'POST /documents/:docId/partstudios/:psId/features': 'Add feature',
          'PUT /documents/:docId/partstudios/:psId/features/:fId': 'Update feature',
          'DELETE /documents/:docId/partstudios/:psId/features/:fId': 'Delete feature'
        },
        sketches: {
          'POST /documents/:docId/partstudios/:psId/sketches': 'Create sketch',
          'GET /documents/:docId/partstudios/:psId/sketches/:skId': 'Get sketch',
          'POST /documents/:docId/partstudios/:psId/sketches/:skId/entities': 'Add sketch entities',
          'POST /documents/:docId/partstudios/:psId/sketches/:skId/constraints': 'Add constraints'
        },
        assemblies: {
          'GET /documents/:docId/assemblies/:asmId': 'Get assembly',
          'POST /documents/:docId/assemblies/:asmId/instances': 'Add component instance',
          'POST /documents/:docId/assemblies/:asmId/mates': 'Add mate',
          'GET /documents/:docId/assemblies/:asmId/interference': 'Check interference'
        },
        drawings: {
          'GET /documents/:docId/drawings/:dwgId': 'Get drawing',
          'POST /documents/:docId/drawings/:dwgId/views': 'Add view',
          'POST /documents/:docId/drawings/:dwgId/dimensions': 'Add dimension'
        },
        export: {
          'GET /export/:docId/:elementId': 'Export model (format: step, stl, obj)',
          'POST /export/:docId/:elementId/step': 'Export to STEP',
          'POST /export/:docId/:elementId/stl': 'Export to STL'
        },
        import: {
          'POST /import/:docId': 'Import file (STEP, STL, OBJ, DXF)'
        },
        analysis: {
          'GET /analysis/:docId/:elementId/mass-properties': 'Calculate mass properties',
          'GET /analysis/:docId/:elementId/interference': 'Check interference',
          'GET /analysis/:docId/:elementId/draft': 'Draft analysis'
        }
      }
    }
  })
})

export default router
