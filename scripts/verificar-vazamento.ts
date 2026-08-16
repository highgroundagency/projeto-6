/**
 * Prova automatizada da regra inegociável do §6.3:
 * conteúdo de release futuro NUNCA chega ao visitante.
 *
 * O que este script confere, com o servidor de produção no ar:
 *   1. Nenhum marcador de ciclo não liberado aparece no HTML das páginas públicas.
 *   2. Nenhum marcador aparece no payload RSC (flight) dessas páginas.
 *   3. Nenhum marcador aparece em `.next/static` — o bundle que vai para o cliente.
 *   4. Rota de funcionalidade não liberada responde 404, não "em breve".
 *   5. O admin, com sessão válida, continua vendo tudo (se não, o gate está
 *      escondendo demais e o painel não serve para nada).
 *
 * Uso: npm run verificar-vazamento    (exige `npm run build` antes)
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { IDS_CICLOS, type CicloId } from '../src/lib/cronograma'
import { hojeEmRecife } from '../src/lib/datas'
import { FEATURES } from '../src/lib/features'
import { ciclosVisiveis, calcularReleaseAtual, ADIANTAMENTO_PADRAO } from '../src/lib/releases'
import { criarTokenSessao, NOME_COOKIE_SESSAO } from '../src/lib/admin/sessao'

const PORTA = Number(process.env.PORTA_VERIFICACAO ?? 3210)
const BASE = `http://127.0.0.1:${PORTA}`
const SEGREDO = 'verificacao-de-vazamento-segredo-longo'

const falhas: string[] = []
const sucessos: string[] = []

function conferir(condicao: boolean, mensagem: string) {
  if (condicao) sucessos.push(mensagem)
  else falhas.push(mensagem)
}

function marcador(id: CicloId): string {
  return `PRUMO-MARCADOR-CICLO-${id}`
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

async function arquivosDe(pasta: string): Promise<string[]> {
  const entradas = await readdir(pasta, { withFileTypes: true, recursive: true })
  return entradas
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath ?? pasta, e.name))
}

async function main() {
  const hoje = hojeEmRecife()
  const release = calcularReleaseAtual({ hoje, adiantamentoDias: ADIANTAMENTO_PADRAO })
  const visiveis = ciclosVisiveis({ releaseAtual: release })
  const ocultos = IDS_CICLOS.filter((id) => !visiveis.includes(id))

  console.log(`\nData de referência (Recife): ${hoje}`)
  console.log(`Release público esperado:    ${release ?? '—'}`)
  console.log(`Ciclos visíveis:             ${visiveis.join(', ') || '(nenhum)'}`)
  console.log(`Ciclos que devem estar ocultos: ${ocultos.join(', ') || '(nenhum)'}\n`)

  console.log('Subindo o servidor de produção…')
  const servidor = spawn('npx', ['next', 'start', '-p', String(PORTA)], {
    env: {
      ...process.env,
      ADMIN_COOKIE_SECRET: SEGREDO,
      NODE_ENV: 'production',
      // A VITRINE FICA FECHADA AQUI, SEMPRE. Ela existe para abrir o site numa
      // demonstração, e aberta faz conteúdo futuro chegar ao visitante de
      // propósito (ADR-021). Este script prova o comportamento NORMAL: se ele
      // herdasse a vitrine, passaria a medir a exceção e a garantia do §6.3
      // ficaria sem prova justamente nos dias em que ela mais importa.
      RELEASE_ABERTO_ATE: '2020-01-01T00:00:00Z',
    },
    // 'ignore' e não 'pipe': ninguém lê essa saída, e um pipe cheio trava o
    // servidor no meio da verificação.
    stdio: 'ignore',
  })

  try {
    await esperarServidor(servidor)

    // ---- 1 e 2: HTML e payload RSC das páginas públicas ----
    // `/registro` saiu da lista: virou redirecionamento para `/#registro`, e o
    // registro semanal agora é uma seção da raiz. Conferir a raiz é conferir ele.
    for (const rota of ['/', '/transparencia-ia']) {
      const html = await (await fetch(`${BASE}${rota}`)).text()
      const flight = await (await fetch(`${BASE}${rota}`, { headers: { RSC: '1' } })).text()

      for (const id of ocultos) {
        conferir(
          !html.includes(marcador(id)),
          `${rota}: HTML sem marcador do ciclo oculto ${id}`,
        )
        conferir(
          !flight.includes(marcador(id)),
          `${rota}: payload RSC sem marcador do ciclo oculto ${id}`,
        )
      }
    }

    // ---- 3: bundle do cliente ----
    const estaticos = await arquivosDe(join(process.cwd(), '.next', 'static'))
    const conteudos = await Promise.all(
      estaticos.map(async (caminho) => ({ caminho, texto: await readFile(caminho, 'utf8').catch(() => '') })),
    )
    for (const id of IDS_CICLOS) {
      const vazando = conteudos.filter((a) => a.texto.includes(marcador(id)))
      conferir(
        vazando.length === 0,
        `bundle do cliente sem marcador do ciclo ${id}${
          vazando.length ? ` (encontrado em ${vazando.map((v) => v.caminho).join(', ')})` : ''
        }`,
      )
    }

    // ---- 4: rotas de funcionalidade não liberadas devolvem 404 ----
    // Desde a ADR-023 as oito rotas são redirecionamentos para `/sistema#tela-x`.
    // O gate roda ANTES do redirecionamento, então o contrato continua o mesmo:
    // não liberada é 404, liberada é 3xx apontando para a sanfona certa.
    for (const feature of FEATURES) {
      const liberada = visiveis.includes(feature.ciclo)
      const doPerfilPadrao = (feature.perfis as readonly string[]).includes('cam')
      const resposta = await fetch(`${BASE}${feature.rota}`, { redirect: 'manual' })
      const status = resposta.status

      if (liberada && doPerfilPadrao) {
        const destino = resposta.headers.get('location') ?? ''
        conferir(
          status >= 300 && status < 400,
          `${feature.rota} liberada (${feature.ciclo}) redireciona — recebeu ${status}`,
        )
        conferir(
          destino.includes(`/sistema`) && destino.includes(`tela-${feature.id}`),
          `${feature.rota} aponta para a sanfona de ${feature.id} — recebeu "${destino}"`,
        )
      } else {
        conferir(
          status === 404,
          `${feature.rota} ${liberada ? 'fora do perfil padrão' : `não liberada (${feature.ciclo})`} responde 404 — recebeu ${status}`,
        )
      }
    }

    // ---- 4b: o sistema não anuncia tela que o perfil não tem ----
    // O visitante chega como CAM (PERFIL_PADRAO). Nenhuma tela exclusiva de
    // outro perfil pode aparecer no sumário, nem no HTML da página.
    const paginaDoSistema = await (await fetch(`${BASE}/sistema`)).text()
    for (const feature of FEATURES) {
      const deveAparecer =
        visiveis.includes(feature.ciclo) && (feature.perfis as readonly string[]).includes('cam')
      if (deveAparecer) continue
      conferir(
        !paginaDoSistema.includes(`tela-${feature.id}`),
        `/sistema não monta a sanfona de ${feature.id} para quem não tem direito a ela`,
      )
    }

    // ---- 5: o admin continua vendo tudo ----
    // Sem esta checagem, um gate quebrado que escondesse tudo passaria batido.
    const token = await criarTokenSessao(SEGREDO)
    const comoAdmin = await (
      await fetch(`${BASE}/`, { headers: { cookie: `${NOME_COOKIE_SESSAO}=${token}` } })
    ).text()
    const comoVisitante = await (await fetch(`${BASE}/`)).text()

    const vistosPeloAdmin = IDS_CICLOS.filter((id) => comoAdmin.includes(marcador(id)))
    const vistosPeloVisitante = IDS_CICLOS.filter((id) => comoVisitante.includes(marcador(id)))
    const perdidos = vistosPeloVisitante.filter((id) => !vistosPeloAdmin.includes(id))

    conferir(
      perdidos.length === 0,
      `admin enxerga ao menos tudo que o visitante enxerga${
        perdidos.length ? ` (faltaram: ${perdidos.join(', ')})` : ''
      }`,
    )
    conferir(
      vistosPeloAdmin.length >= vistosPeloVisitante.length,
      `admin (${vistosPeloAdmin.length} ciclos) enxerga pelo menos o mesmo que o visitante (${vistosPeloVisitante.length})`,
    )
    conferir(comoAdmin.includes('Modo completo'), 'admin vê a faixa de modo completo')
    conferir(
      !comoVisitante.includes('Modo completo'),
      'visitante não vê a faixa de modo completo',
    )
  } finally {
    servidor.kill('SIGTERM')
  }

  console.log(`\n${sucessos.length} verificações passaram.`)
  if (falhas.length > 0) {
    console.error(`\n${falhas.length} FALHARAM:`)
    for (const falha of falhas) console.error(`  ✗ ${falha}`)
    process.exit(1)
  }
  console.log('Nenhum vazamento de conteúdo futuro detectado.\n')

  // O processo filho pode demorar a morrer e seguraria o encerramento; as
  // verificações já terminaram, então saímos explicitamente.
  process.exit(0)
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
