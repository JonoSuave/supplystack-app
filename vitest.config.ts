import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts', // Optional: if you need global setup
    // You might want to exclude node_modules and .next folders if not done by default
    exclude: [
      'node_modules/**',
      '.next/**',
      './tests/e2e/**' // If you have e2e tests elsewhere
    ],
    // Alias to match Next.js path aliases like @/components/*
    alias: {
      '@/': new URL('./', import.meta.url).pathname,
    },
  },
});
