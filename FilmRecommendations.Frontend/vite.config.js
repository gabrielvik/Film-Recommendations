import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Ensure CSS is extracted to its own files
    cssCodeSplit: true,
    // Improve SWA compatibility
    outDir: 'dist',
    // Fix asset paths
    assetsDir: 'assets'
  }
});