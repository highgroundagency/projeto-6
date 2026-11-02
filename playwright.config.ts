import { defineConfig, devices } from '@playwright/test'

import { existsSync } from 'node:fs'
import { CONTA_CANARIO, CONTA_SEAB, SENHA_E2E } from './e2e/contas'

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
 * Banco da suíte. É APAGADO e recarregado a cada execução (`db.ts preparar
 * --limpar`), então nunca aponte para o banco de desenvolvimento: crie um só
 * para isto (`createdb prumo_e2e` no Postgres do Docker, por exemplo).
 */
const BANCO_E2E = process.env.DATABASE_URL_E2E?.trim()
if (!BANCO_E2E) {
  throw new Error(
    'Defina DATABASE_URL_E2E com um banco descartável: a suíte apaga e recarrega o conteúdo dele. ' +
      'Ex.: postgresql://prumo:prumo@localhost:5432/prumo_e2e',
  )
}

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
    // Banco limpo e com a base sintética antes de cada execução: as jornadas
    // escrevem (lançam, homologam), e o banco guarda tudo.
    // As duas contas da suíte: a SEAB e a gerente da USF Canário.
    command: [
      'npx tsx scripts/db.ts preparar --limpar',
      `npx tsx scripts/usuarios.ts criar --login ${CONTA_SEAB} --perfil seab --se-nao-existir`,
      `npx tsx scripts/usuarios.ts criar --login ${CONTA_CANARIO} --perfil gerente_unidade --gerente ger-usf-canario --se-nao-existir`,
      'npx next build',
      `npx next start -p ${PORTA}`,
    ].join(' && '),
    url: BASE,
    // Sempre sobe um servidor novo: reaproveitar um build antigo já fez a suíte
    // testar código que não existia mais.
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      DATABASE_URL: BANCO_E2E,
      // Senha das contas da suíte. Só existe no banco descartável do e2e.
      PRUMO_SENHA: SENHA_E2E,
      // Chave AES da sessão. Em produção o login falha fechado sem ela.
      SESSAO_CHAVE: 'ZTJlLWNoYXZlLWRlLXNlc3Nhby0zMi1ieXRlcy0hISE=',
      ADMIN_COOKIE_SECRET: 'segredo-de-teste-e2e-com-tamanho-suficiente',
      ADMIN_SENHA: '0321',
      // Chave do link da vitrine pessoal, só para a suíte exercitar a rota.
      CHAVE_VITRINE: 'chave-de-teste-e2e-da-vitrine-pessoal',
      // Vitrine fechada: a suíte exercita o comportamento normal do site. Com a
      // vitrine aberta, todo ciclo fica visível e metade das asserções de gate
      // deixaria de medir qualquer coisa. Ver ADR-021.
      RELEASE_ABERTO_ATE: '2020-01-01T00:00:00Z',
    },
  },
})
