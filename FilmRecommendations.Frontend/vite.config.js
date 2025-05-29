import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    cssCodeSplit: true,
    outDir: 'dist',
    assetsDir: 'assets'
  }
});