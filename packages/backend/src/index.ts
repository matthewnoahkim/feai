/**
 * feai Unified Server
 * Express.js backend serving both API and frontend static files
 */

// Load environment variables from root .env file (only in development)
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  const path = require('path');
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { documentsRouter } from './routes/documents';
import { partsRouter } from './routes/parts';
import { sketchesRouter } from './routes/sketches';
import { assembliesRouter } from './routes/assemblies';
import { drawingsRouter } from './routes/drawings';
import { exportRouter } from './routes/export';
import { importRouter } from './routes/import';
import { analysisRouter } from './routes/analysis';
import { feaRouter } from './routes/fea';
import { authRouter } from './routes/auth-oauth';
import { projectsRouter } from './routes/projects';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || `http://localhost:${PORT}`,
  credentials: true 
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser (required for sessions)
app.use(cookieParser());

// Session middleware (required for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'feai.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

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

// Auth Routes (BEFORE static files - OAuth needs to work)
// New OAuth 2.0 implementation with refresh tokens
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

// Serve frontend static files (built React app)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath, {
  // Set proper headers for SharedArrayBuffer support (WASM threading)
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js')) {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    }
  }
}));

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

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
║              feai Unified Server v1.0.0                      ║
╠══════════════════════════════════════════════════════════════╣
║  Application:  http://localhost:${PORT}                         ║
║  REST API:     http://localhost:${PORT}/api                     ║
║  Health:       http://localhost:${PORT}/api/health              ║
║  API Docs:     http://localhost:${PORT}/api                     ║
╠══════════════════════════════════════════════════════════════╣
║  Features:                                                   ║
║    ✅ Frontend & Backend combined on one port                ║
║    ✅ Google OAuth 2.0 with refresh tokens                   ║
║    ✅ Secure session management                              ║
║    ✅ CAD operations & FEA analysis                          ║
║    ✅ WebAssembly FEA solver support                         ║
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
║    Auth:         GET /auth/google, /auth/google/callback     ║
║    Projects:     GET|POST /api/projects                      ║
╚══════════════════════════════════════════════════════════════╝
  `);
  });
}

export default app;
