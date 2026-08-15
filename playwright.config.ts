import { defineConfig, devices } from '@playwright/test'

import { existsSync } from 'node:fs'

const PORTA = Number(process.env.PORTA_E2E ?? 3211)
const BASE = `http://127.0.0.1:${PORTA}`

/**
 * Alguns ambientes já trazem o Chromium instalado fora do diretório que esta
 * versão do Playwright procura. Quando o caminho conhecido existe, usamos ele
 * em vez de baixar um navegador novo.
 */
const CHROMIUM_DO_AMBIENTE = '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM_DO_AMBIENTE)
  ? { executablePath: CHROMIUM_DO_AMBIENTE }
  : {}

/**
 * Smoke das jornadas críticas.
 *
 * Roda contra o build de produção, não contra o dev server: as garantias que
 * mais importam aqui (conteúdo futuro fora do bundle, 404 em rota não liberada)
 * só valem no build real.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,

  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Recife',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions } },
    {
      name: 'mobile-360',
      use: { ...devices['Desktop Chrome'], launchOptions, viewport: { width: 360, height: 740 } },
    },
  ],

  webServer: {
    command: `npx next build && npx next start -p ${PORTA}`,
    url: BASE,
    // Sempre sobe um servidor novo: reaproveitar um build antigo já fez a suíte
    // testar código que não existia mais.
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ADMIN_COOKIE_SECRET: 'segredo-de-teste-e2e-com-tamanho-suficiente',
      ADMIN_SENHA: '0321',
    },
  },
})
