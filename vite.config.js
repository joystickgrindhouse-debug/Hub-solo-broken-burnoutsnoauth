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
        main: 'index.html',
        solo: 'solo.html',
        burnouts: 'burnouts.html'
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
