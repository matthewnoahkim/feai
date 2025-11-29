# Vercel Deployment Guide

## Problem

Your FEA module was getting "Unexpected token 'T', 'The page c'... is not valid JSON" because the **backend API was not deployed** to Vercel. You were only deploying the frontend static site, so API calls returned 404 HTML pages.

## Solution

Your backend now runs as **Vercel Serverless Functions**.

## Files Changed

### 1. `vercel.json` - Routes API calls to serverless function
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "packages/frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

### 2. `api/index.js` - Vercel function entry point
```javascript
import app from '../packages/backend/dist/index.js';
export default app;
```

### 3. `packages/backend/src/index.ts` - Conditional server start
Only starts Express server locally, exports app for Vercel serverless.

## Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Option 2: Deploy via Git (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Add Vercel serverless backend support"
git push
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the settings from `vercel.json`
   - Click "Deploy"

3. **Environment Variables** (if needed later):
   - Go to Project Settings → Environment Variables
   - Add any secrets (API keys, database URLs, etc.)

## How It Works

### Local Development
```bash
# Terminal 1: Start backend server
npm run dev -w @feai/backend  # Runs on http://localhost:3001

# Terminal 2: Start frontend dev server
npm run dev -w @feai/frontend  # Runs on http://localhost:5173

# Frontend proxies /api/* to http://localhost:3001
```

### Production (Vercel)
```
User Request: https://your-app.vercel.app/api/fea/mesh
               ↓
Vercel Routing: /api/* → /api/index serverless function
               ↓
Express App:    Your backend handles the request
               ↓
Response:       JSON data back to frontend
```

## Testing Your Deployment

After deploying, test these endpoints:

```bash
# Replace YOUR_DOMAIN with your Vercel URL

# 1. Health check
curl https://YOUR_DOMAIN.vercel.app/api/health

# Should return:
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0"
  }
}

# 2. FEA materials
curl https://YOUR_DOMAIN.vercel.app/api/fea/materials

# Should return list of materials
```

## Troubleshooting

### "Function invocation failed" error
- Check Vercel deployment logs
- Make sure `npm run build` succeeded
- Verify `packages/backend/dist/` exists

### "Module not found" errors
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Run `npm install` and rebuild

### CORS errors
- The backend already has CORS enabled
- If issues persist, check browser console for the exact error

### Serverless function timeout (10s limit on hobby plan)
- FEA mesh generation might be slow for large models
- Consider upgrading to Pro plan (60s timeout)
- Or use a separate server for heavy computations

## Important Notes

### Serverless Limitations

1. **Stateless**: Each request starts fresh
   - Your in-memory `store` resets between requests
   - Consider using a database (Vercel KV, PostgreSQL) for persistence

2. **File System**:
   - `/tmp` is available but cleared between invocations
   - Max 250MB temp storage
   - CalculiX solver won't work (no native executables in serverless)
   - FEA mesh generation uses JavaScript implementation

3. **Execution Time**:
   - Hobby plan: 10 seconds max
   - Pro plan: 60 seconds max
   - Heavy FEA might timeout

### Recommendations for Production

1. **For FEA Solver**:
   - The mesh generation works fine (pure JavaScript)
   - For actual CalculiX solving, you'll need:
     - Option A: Separate compute server (Railway, Fly.io)
     - Option B: Cloud functions with longer timeout (AWS Lambda, Google Cloud Run)
     - Option C: Client-side WebAssembly CalculiX (advanced)

2. **For Data Persistence**:
   - Add Vercel KV (Redis) for storing documents/models
   - Or PostgreSQL (Vercel Postgres, Supabase)

3. **For Large Meshes**:
   - Implement progressive loading
   - Stream results back incrementally
   - Use WebWorkers for client-side processing

## Next Steps

1. **Deploy** using one of the methods above
2. **Test** the deployed API endpoints
3. **Monitor** Vercel logs for any errors
4. **Optimize** if you hit timeout limits

The frontend will automatically use the same domain for API calls (no configuration needed!).

