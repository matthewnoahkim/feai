/**
 * Authentication Routes - Google OAuth
 */

import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const router = express.Router();

// Google OAuth client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/auth/google/callback`,
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Generate JWT token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

/**
 * Auth middleware
 */
export function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' }
    });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
    });
  }
  
  (req as any).userId = decoded.userId;
  next();
}

/**
 * GET /auth/google - Redirect to Google OAuth
 */
router.get('/google', (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  
  res.redirect(authUrl);
});

/**
 * GET /auth/google/callback - Handle OAuth callback
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.send(`
      <script>
        window.opener.postMessage({ type: 'AUTH_ERROR', error: 'No authorization code' }, '*');
        window.close();
      </script>
    `);
  }
  
  try {
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    
    // Get user info
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const googleUser = await response.json() as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };
    
    // Find or create user in database
    let user = await db.user.findUnique({
      where: { googleId: googleUser.id }
    });
    
    if (!user) {
      // Check if email exists
      user = await db.user.findUnique({
        where: { email: googleUser.email }
      });
      
      if (user) {
        // Link Google account to existing user
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            photoURL: googleUser.picture,
          }
        });
      } else {
        // Create new user
        user = await db.user.create({
          data: {
            googleId: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            photoURL: googleUser.picture,
          }
        });
      }
    } else {
      // Update user info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: googleUser.name,
          photoURL: googleUser.picture,
        }
      });
    }
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    // Send success message to opener window
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    res.send(`
      <script>
        window.opener.postMessage({
          type: 'AUTH_SUCCESS',
          user: {
            id: '${user.id}',
            email: '${user.email}',
            name: '${user.name}',
            photoURL: '${user.photoURL || ''}'
          },
          token: '${token}'
        }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
        window.close();
      </script>
    `);
    
  } catch (error) {
    console.error('OAuth error:', error);
    res.send(`
      <script>
        window.opener.postMessage({ type: 'AUTH_ERROR', error: 'Authentication failed' }, '*');
        window.close();
      </script>
    `);
  }
});

/**
 * GET /auth/me - Get current user
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: (req as any).userId },
      select: {
        id: true,
        email: true,
        name: true,
        photoURL: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }
    
    res.json({ success: true, data: user });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get user' }
    });
  }
});

export const authRouter = router;

