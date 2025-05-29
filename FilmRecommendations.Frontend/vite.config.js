import { defineConfig } from 'vite';

export default defineConfig({
base: '/',
  build: {
    cssCodeSplit: true,
    outDir: 'dist',
    assetsDir: 'assets'
  }
});