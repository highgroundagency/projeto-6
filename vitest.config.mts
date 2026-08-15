import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // O tsconfig do Next fixa `jsx: preserve` (o compilador do Next cuida disso e
  // reescreve o campo se alguém mudar). O Vitest, que usa oxc no Vite 8,
  // precisa da transformação explícita para conseguir ler os .tsx de conteúdo.
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  resolve: {
    // Resolve o alias `@/*` do tsconfig sem plugin extra.
    tsconfigPaths: true,
    alias: {
      // `server-only` lança erro fora do runtime de Server Component.
      'server-only': fileURLToPath(new URL('./test/stub-server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Os testes de banco recriam o schema no `beforeAll`. Rodando arquivos em
    // paralelo, um derrubava as tabelas do outro no meio da execução.
    fileParallelism: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // e2e/ é do Playwright — o Vitest não deve tentar rodar aquilo.
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
  },
})
