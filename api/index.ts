/**
 * Vercel Serverless Function Entry Point
 * This exports the Express app for Vercel's serverless environment
 */

// Import the main Express app
import app from '../packages/backend/src/index';

// Export for Vercel
export default app;

