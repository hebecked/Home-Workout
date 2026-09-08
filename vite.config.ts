import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  define: {
    __LEGAL_ADDRESS__: JSON.stringify((process.env.HW_LEGAL_ADDRESS ?? loadEnv(mode, process.cwd(), 'HW_').HW_LEGAL_ADDRESS ?? '').split('|').filter(Boolean))
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/core/**/*.ts'],
      exclude: ['src/data/**', 'src/**/*.d.ts'],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 95
      }
    }
  }
}));
