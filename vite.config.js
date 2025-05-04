import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/addie-pro/',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false
  }
});