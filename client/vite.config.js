import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Ensure rollup doesn't fail on missing optional deps
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress "use client" directive warnings from some libraries
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  // Ensure environment variables are accessible
  envPrefix: 'VITE_',
})
