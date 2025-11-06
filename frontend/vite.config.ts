import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Query & State management
          'query-vendor': ['@tanstack/react-query'],
          
          // UI libraries (if you add them later)
          // 'ui-vendor': ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000, // 1MB
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
  
  // Optimization for dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
})
