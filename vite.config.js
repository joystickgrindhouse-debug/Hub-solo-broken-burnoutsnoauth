import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // ✅ FIX: solo.html and burnouts.html were listed as entry points but don't exist
        // as separate HTML files — Solo and Burnouts are React routes, not separate pages.
        // Including nonexistent files causes the entire Vite build to fail with
        // "Could not resolve entry module" errors.
        main: 'index.html',
      },
      output: {
        manualChunks: undefined
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3000',
      '/objects': 'http://localhost:3000'
    },
    hmr: {
      timeout: 30000
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true
  }
})
