import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@rendering': path.resolve(__dirname, './src/rendering'),
      '@features': path.resolve(__dirname, './src/features')
    }
  }
});