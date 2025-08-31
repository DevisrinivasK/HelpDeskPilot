
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    css: false,
    globals: true, // Enable global expect, describe, it
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    },
    include: ['src/**/*.{test,spec}.[jt]s?(x)']
  }
});