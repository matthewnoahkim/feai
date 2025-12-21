/**
 * Server Configuration Example
 * 
 * This shows how to integrate the OAuth 2.0 implementation
 * into your existing Express server
 */

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import OAuth routes
import { authRouter as authOAuthRouter } from './routes/auth-oauth';
import { requireAuth, optionalAuth } from './auth/middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

// CORS - Enable credentials for cookies/sessions
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true, // IMPORTANT: Required for session cookies
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser (required for sessions)
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'feai.sid', // Custom session cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,   // Prevent XSS attacks (no JavaScript access)
    sameSite: 'lax',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Production: Use Redis or database for session storage
  // store: new RedisStore({ client: redisClient })
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

// ============================================================================
// OAuth Routes (Must come BEFORE static file serving)
// ============================================================================

app.use('/auth', authOAuthRouter);

// ============================================================================
// API Routes
// ============================================================================

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Documentation (public)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'feai API',
    version: '1.0.0',
    endpoints: {
      auth: [
        'GET /auth/google - Initiate OAuth',
        'GET /auth/google/callback - OAuth callback',
        'GET /auth/me - Get current user (protected)',
        'POST /auth/logout - Sign out (protected)',
        'POST /auth/refresh - Refresh token (protected)',
      ],
      api: [
        'GET /api/health - Health check',
        'GET /api/projects - List projects (protected)',
        'POST /api/projects - Create project (protected)',
      ]
    }
  });
});

// Example: Protected route
app.get('/api/projects', requireAuth, async (req, res) => {
  try {
    // req.user is available (attached by requireAuth middleware)
    const userId = req.user!.userId;
    
    // Your logic here
    res.json({
      success: true,
      user: req.user,
      projects: [], // Fetch from database
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

// Example: Optional authentication
app.get('/api/public-data', optionalAuth, async (req, res) => {
  if (req.user) {
    // User is authenticated
    res.json({
      message: `Hello ${req.user.name}`,
      type: 'personalized',
    });
  } else {
    // Anonymous user
    res.json({
      message: 'Hello guest',
      type: 'public',
    });
  }
});

// ============================================================================
// Static Files & SPA Routing
// ============================================================================

// Serve frontend static files
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath, {
  setHeaders: (res, filePath) => {
    // Headers for SharedArrayBuffer (WASM threading)
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

// ============================================================================
// Error Handling
// ============================================================================

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Start Server
// ============================================================================

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║              feai Unified Server v1.0.0                      ║
╠══════════════════════════════════════════════════════════════╣
║  Application:  http://localhost:${PORT}                         ║
║  REST API:     http://localhost:${PORT}/api                     ║
║  Health:       http://localhost:${PORT}/api/health              ║
║  Login:        http://localhost:${PORT}/login                   ║
╠══════════════════════════════════════════════════════════════╣
║  OAuth Flow:                                                 ║
║    1. Visit /login                                           ║
║    2. Click "Sign in with Google"                            ║
║    3. GET /auth/google (redirect to Google)                  ║
║    4. User authenticates with Google                         ║
║    5. GET /auth/google/callback (handle callback)            ║
║    6. Redirect to /dashboard                                 ║
╠══════════════════════════════════════════════════════════════╣
║  Features:                                                   ║
║    ✅ OAuth 2.0 with refresh tokens                          ║
║    ✅ Secure session management                              ║
║    ✅ CSRF protection                                         ║
║    ✅ Automatic token refresh                                 ║
║    ✅ Protected routes                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Environment:                                                ║
║    SESSION_SECRET: ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing'}                                   ║
║    GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing'}                               ║
║    GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}                       ║
╚══════════════════════════════════════════════════════════════╝
  `);
    
    if (!process.env.SESSION_SECRET) {
      console.warn('\n⚠️  WARNING: SESSION_SECRET not set! Generate one with:');
      console.warn('node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn('\n⚠️  WARNING: Google OAuth not configured!');
      console.warn('See GOOGLE_OAUTH_GUIDE.md for setup instructions');
    }
  });
}

export default app;

