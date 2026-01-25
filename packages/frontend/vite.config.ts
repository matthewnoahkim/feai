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
    // Proxy API and auth routes to backend server
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'esnext',
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js and heavy visualization libraries
          'three': ['three'],
          'vendor': ['react', 'react-dom', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    exclude: ['@feai/shared', '@feai/kernel'],
  },
});
