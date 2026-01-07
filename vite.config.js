import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
          'mediapipe': ['@mediapipe/pose', '@mediapipe/camera_utils', '@mediapipe/drawing_utils']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
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
      clientPort: 443,
      protocol: 'wss',
      host: '0.0.0.0',
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
