/**
 * feai REST API Server
 * Express.js backend for web-based CAD operations
 */

import express from 'express';
import cors from 'cors';
import { documentsRouter } from './routes/documents';
import { partsRouter } from './routes/parts';
import { sketchesRouter } from './routes/sketches';
import { assembliesRouter } from './routes/assemblies';
import { drawingsRouter } from './routes/drawings';
import { exportRouter } from './routes/export';
import { importRouter } from './routes/import';
import { analysisRouter } from './routes/analysis';
import { feaRouter } from './routes/fea';
import { authRouter } from './routes/auth';
import { projectsRouter } from './routes/projects';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'feai API',
      version: '1.0.0',
      description: 'RESTful API for web-based CAD operations',
      endpoints: [
        'GET /api/health - Health check',
        'GET /api/documents - List documents',
        'POST /api/documents - Create document',
        'GET /api/documents/:id/partstudios/:psId - Get part studio',
        'POST /api/documents/:id/partstudios/:psId/features - Add feature',
        'GET /api/export/:docId/:elementId - Export model',
        'GET /api/analysis/:docId/:elementId/mass-properties - Get mass properties'
      ]
    }
  });
});

// Auth Routes (not under /api prefix for OAuth redirects)
app.use('/auth', authRouter);

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/parts', partsRouter);
app.use('/api/sketches', sketchesRouter);
app.use('/api/assemblies', assembliesRouter);
app.use('/api/drawings', drawingsRouter);
app.use('/api/export', exportRouter);
app.use('/api/import', importRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/fea', feaRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  });
});

// Start server (only if not in serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                 feai REST API Server v1.0.0                  ║
╠══════════════════════════════════════════════════════════════╣
║  REST API:     http://localhost:${PORT}/api                     ║
║  Health:       http://localhost:${PORT}/api/health              ║
║  API Docs:     http://localhost:${PORT}/api                     ║
╠══════════════════════════════════════════════════════════════╣
║  Available Endpoints:                                        ║
║    Documents:    GET|POST /api/documents                     ║
║    Part Studios: GET /api/documents/:id/partstudios/:psId    ║
║    Features:     GET|POST /api/documents/:id/partstudios/... ║
║    Assemblies:   GET /api/documents/:id/assemblies/:asmId    ║
║    Drawings:     GET /api/documents/:id/drawings/:dwgId      ║
║    Export:       GET /api/export/:docId/:elementId           ║
║    Import:       POST /api/import/:docId                     ║
║    Analysis:     GET /api/analysis/:docId/:elementId/...     ║
║    FEA:          POST /api/fea/mesh, /api/fea/run            ║
╚══════════════════════════════════════════════════════════════╝
  `);
  });
}

export default app;
