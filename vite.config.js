import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  plugins: [react()],

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
        solo: "solo.html",
        burnouts: "burnouts.html"
      }
    }
  },

  server: {
    host: true,
    port: 5173,
    strictPort: false
  },

  preview: {
    port: 4173
  }
});
