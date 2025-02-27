import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  publicDir: 'assets',
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  css: {
    postcss: true,
    devSourcemap: true
  }
}); 