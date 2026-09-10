/**
 * Gera o PDF e as capturas do pitch a partir da própria rota `/pitch`, na
 * identidade do site. Nada é desenhado à parte: o que sai daqui é o que a
 * banca vê no navegador.
 *
 *   docs/pitch-kickoff.pdf     uma página por slide, 16:9, tema escuro
 *   docs/pitch/slide-NN.png    a captura de cada slide, 1280 × 720
 *
 * NADA DISTO VAI PARA `public/`, e é decisão, não descuido. Arquivo estático
 * não passa por `obterVisao()`: enquanto as capturas moraram em `public/`,
 * elas entregavam o deck inteiro em imagem nos dias em que `/pitch` respondia
 * 404. O PDF é servido pela rota `/pitch/pdf`, que confere o release antes de
 * ler o arquivo daqui.
 *
 * Uso: npm run pitch-pdf    (exige `npm run build` antes)
 *
 * Sobe o servidor de produção com a vitrine fechada e entra com sessão de
 * admin, para que o script funcione mesmo antes de o Kick-off virar público.
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { SLIDES } from '../src/content/pitch'
import { criarTokenSessao, NOME_COOKIE_SESSAO } from '../src/lib/admin/sessao'

const PORTA = Number(process.env.PORTA_PITCH ?? 3213)
const BASE = `http://127.0.0.1:${PORTA}`
const SEGREDO = 'pitch-pdf-segredo-longo-o-suficiente'
const CHROMIUM_DO_AMBIENTE = '/opt/pw-browsers/chromium'
const RAIZ = process.cwd()
const PASTA_CAPTURAS = join(RAIZ, 'docs', 'pitch')
const PDF = join(RAIZ, 'docs', 'pitch-kickoff.pdf')

/**
 * A porta precisa estar livre ANTES de subir o servidor. Se um servidor
 * antigo ainda estiver no ar, ele responde primeiro, o novo morre ao tentar a
 * mesma porta e o script passa a medir um build velho, com CSS e JS em 404.
 */
async function exigirPortaLivre(): Promise<void> {
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1500) })
  } catch {
    return
  }
  throw new Error(
    `A porta ${PORTA} já responde. Derrube o servidor antigo (pkill -f "next[-]server") antes de rodar.`,
  )
}

async function esperarServidor(processo: ChildProcess): Promise<void> {
  for (let tentativa = 0; tentativa < 60; tentativa++) {
    if (processo.exitCode !== null) {
      throw new Error(`Servidor encerrou antes de subir (código ${processo.exitCode})`)
    }
    try {
      const resposta = await fetch(BASE, { signal: AbortSignal.timeout(2000) })
      if (resposta.ok) return
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Servidor não respondeu em 60 segundos')
}

function derrubar(servidor: ChildProcess): void {
  if (servidor.pid === undefined) return
  try {
    process.kill(-servidor.pid, 'SIGTERM')
  } catch {
    servidor.kill('SIGTERM')
  }
}

async function main() {
  await exigirPortaLivre()
  console.log('Subindo o servidor de produção…')
  const servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: {
      ...process.env,
      ADMIN_COOKIE_SECRET: SEGREDO,
      NODE_ENV: 'production',
      RELEASE_ABERTO_ATE: '2020-01-01T00:00:00Z',
    },
    stdio: 'ignore',
    // Grupo de processos próprio: `npx` cria o `next-server` como neto, e um
    // SIGTERM só no filho deixava o servidor vivo, segurando a porta.
    detached: true,
  })

  try {
    await esperarServidor(servidor)

    const navegador = await chromium.launch(
      existsSync(CHROMIUM_DO_AMBIENTE) ? { executablePath: CHROMIUM_DO_AMBIENTE } : {},
    )
    const contexto = await navegador.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      locale: 'pt-BR',
      timezoneId: 'America/Recife',
    })
    await contexto.addCookies([
      { name: NOME_COOKIE_SESSAO, value: await criarTokenSessao(SEGREDO), url: BASE },
    ])

    const pagina = await contexto.newPage()
    const resposta = await pagina.goto(`${BASE}/pitch#slide-1`, { waitUntil: 'networkidle' })
    if (!resposta || resposta.status() !== 200) {
      throw new Error(`/pitch respondeu ${resposta?.status() ?? 'nada'}`)
    }
    await pagina.evaluate(() => document.fonts.ready)
    await pagina.waitForSelector('[data-modo="deck"]')

    // ---- capturas, slide a slide, avançando com a seta como no palco ----
    mkdirSync(PASTA_CAPTURAS, { recursive: true })
    for (const slide of SLIDES) {
      await pagina.waitForSelector(`[data-slide="${slide.numero}"][data-ativo]`)
      await pagina.waitForTimeout(150)
      const caminho = join(PASTA_CAPTURAS, `slide-${String(slide.numero).padStart(2, '0')}.png`)
      await pagina.screenshot({ path: caminho, fullPage: false })
      console.log(`  ${caminho}`)

      if (slide.numero < SLIDES.length) await pagina.keyboard.press('ArrowRight')
    }

    // ---- o PDF: CSS de impressão, uma página por slide ----
    await pagina.pdf({ path: PDF, printBackground: true, preferCSSPageSize: true })
    console.log(`  ${PDF}`)

    await navegador.close()
  } finally {
    derrubar(servidor)
  }

  console.log('\nPDF e capturas gerados. Lembre de `npm run dossie` se o package.json mudou.\n')
  process.exit(0)
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
