import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    reporters: 'default',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/tests/helpers/**'],
    },
  },
});
