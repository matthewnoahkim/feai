import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '../../'), // Load .env from root directory
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@feai/shared': path.resolve(__dirname, '../shared/src'),
      '@feai/kernel': path.resolve(__dirname, '../kernel/src'),
    },
  },
  server: {
    port: 3000,
    // Enable required headers for SharedArrayBuffer (threading support)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    target: 'esnext',
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate WASM-related code into its own chunk for lazy loading
          'calculix-wasm': [
            './src/services/calculixWasmSolver.ts',
            './src/services/calculix-worker.ts',
            './src/services/inpGenerator.ts',
            './src/services/frdParser.ts',
          ],
          // Three.js and heavy visualization libraries
          'three': ['three'],
          'vendor': ['react', 'react-dom', 'zustand'],
        },
      },
    },
    // Increase chunk size warning limit for WASM
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    exclude: ['@feai/shared', '@feai/kernel'],
  },
  // Ensure WASM files are treated as assets
  assetsInclude: ['**/*.wasm'],
});
