import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Resolve o alias `@/*` do tsconfig sem plugin extra.
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // e2e/ é do Playwright — o Vitest não deve tentar rodar aquilo.
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
  },
})
