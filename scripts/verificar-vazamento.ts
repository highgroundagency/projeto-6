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
 *   6. `/pitch`, a primeira rota protegida por CICLO e não por funcionalidade,
 *      responde 404 enquanto o Kick-off estiver oculto e 200 para o admin; e
 *      nenhum texto de slide chega ao bundle do cliente.
 *
 * Uso: npm run verificar-vazamento    (exige `npm run build` antes)
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { IDS_CICLOS, type CicloId } from '../src/lib/cronograma'
import { hojeEmRecife } from '../src/lib/datas'
import { FEATURES, PERFIL_PADRAO, type PerfilId } from '../src/lib/features'
import { SLIDES, textoNaTela } from '../src/content/pitch'
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

async function arquivosDe(pasta: string): Promise<string[]> {
  const entradas = await readdir(pasta, { withFileTypes: true, recursive: true })
  return entradas
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath ?? pasta, e.name))
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
    // Grupo de processos próprio: `npx` cria o `next-server` como neto, e um
    // SIGTERM só no filho deixava o servidor vivo, segurando a porta.
    detached: true,
  })

  try {
    await esperarServidor(servidor)

    // ---- 1 e 2: HTML e payload RSC das páginas públicas ----
    // `/registro` saiu da lista: virou redirecionamento para `/#registro`, e o
    // registro semanal agora é uma seção da raiz. Conferir a raiz é conferir ele.
    for (const rota of ['/', '/transparencia-ia', '/arquitetura']) {
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
      const doPerfilPadrao = (feature.perfis as readonly PerfilId[]).includes(PERFIL_PADRAO)
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
    // O visitante chega com o PERFIL_PADRAO (a coordenação da SEAB). Nenhuma
    // tela exclusiva de outro perfil pode aparecer no sumário, nem no HTML.
    const paginaDoSistema = await (await fetch(`${BASE}/sistema`)).text()
    for (const feature of FEATURES) {
      const deveAparecer =
        visiveis.includes(feature.ciclo) &&
        (feature.perfis as readonly PerfilId[]).includes(PERFIL_PADRAO)
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

    // ---- 6: o pitch é conteúdo do ciclo `ko`, e o gate é por ciclo ----
    // Mesmo contrato das telas: oculto é 404 (nunca "em breve"), liberado é
    // 200. O admin vê sempre. A expectativa deriva do cronograma, então o
    // bloco não apodrece no dia em que o Kick-off virar público.
    const koVisivel = visiveis.includes('ko')
    const pitchVisitante = await fetch(`${BASE}/pitch`, { redirect: 'manual' })
    conferir(
      pitchVisitante.status === (koVisivel ? 200 : 404),
      `/pitch para o visitante responde ${koVisivel ? '200 (ko liberado)' : '404 (ko oculto)'} — recebeu ${pitchVisitante.status}`,
    )
    const pitchAdmin = await fetch(`${BASE}/pitch`, {
      headers: { cookie: `${NOME_COOKIE_SESSAO}=${token}` },
      redirect: 'manual',
    })
    conferir(pitchAdmin.status === 200, `/pitch para o admin responde 200 — recebeu ${pitchAdmin.status}`)
    const htmlDoPitch = await pitchAdmin.text()
    conferir(
      SLIDES.every((slide) => htmlDoPitch.includes(slide.titulo)),
      'admin recebe os nove slides no HTML do /pitch',
    )

    // NENHUM ARTEFATO DO DECK É ESTÁTICO. As nove capturas moraram em
    // `public/pitch/` e ali entregavam os slides em imagem mesmo nos dias em
    // que a rota respondia 404: o portão protege rota, e arquivo em `public/`
    // não passa por rota. Hoje moram em `docs/`, e estas provas impedem a
    // volta — inclusive a do PDF, que é a tentação mais óbvia.
    for (const caminho of ['/pitch/slide-01.png', '/pitch/slide-09.png', '/pitch-kickoff.pdf']) {
      const estatico = await fetch(`${BASE}${caminho}`, { redirect: 'manual' })
      conferir(
        estatico.status === 404,
        `${caminho} não é servido como estático — recebeu ${estatico.status}`,
      )
    }

    // O PDF sai por rota, com o MESMO portão da página: 404 enquanto o
    // Kick-off estiver oculto, e o arquivo para quem pode ver.
    const pdfVisitante = await fetch(`${BASE}/pitch/pdf`, { redirect: 'manual' })
    conferir(
      pdfVisitante.status === (koVisivel ? 200 : 404),
      `/pitch/pdf para o visitante responde ${koVisivel ? '200' : '404'} — recebeu ${pdfVisitante.status}`,
    )
    const pdfAdmin = await fetch(`${BASE}/pitch/pdf`, {
      headers: { cookie: `${NOME_COOKIE_SESSAO}=${token}` },
      redirect: 'manual',
    })
    conferir(
      pdfAdmin.status === 200 &&
        (pdfAdmin.headers.get('content-type') ?? '').includes('pdf'),
      `/pitch/pdf entrega o arquivo para o admin — recebeu ${pdfAdmin.status} ${pdfAdmin.headers.get('content-type')}`,
    )

    // A home não anuncia rota fechada: se o Kick-off estiver oculto, nenhum
    // link para /pitch pode aparecer no topo do site.
    if (!koVisivel) {
      const home = await (await fetch(`${BASE}/`)).text()
      conferir(
        !home.includes('href="/pitch"'),
        'a home não oferece o pitch enquanto o Kick-off está oculto',
      )
    }

    // O deck tem um componente cliente para as setas do teclado. Ele recebe só
    // índices: se algum título de slide aparecer em `.next/static`, alguém
    // passou o conteúdo por props e o texto do Kick-off virou público antes
    // da hora, por baixo do gate.
    for (const slide of SLIDES) {
      // Todo o texto da tela, e não só o título: depois que a copy virou dado
      // em `pitch.ts`, passar `ETAPAS_DO_MES` por props para o componente
      // cliente seria tão grave quanto passar o título, e igualmente invisível.
      // Só FRASES: quatro palavras ou mais. Rótulo de uma palavra como
      // "subindicadores" também existe na tela do sistema, e acusaria
      // vazamento onde só há vocabulário comum ao projeto inteiro.
      const textos = [slide.titulo, ...textoNaTela(slide.id)].filter(
        (t) => t.length >= 20 && t.split(/\s+/).length >= 4,
      )
      const vazando = conteudos.filter((a) => textos.some((t) => a.texto.includes(t)))
      conferir(
        vazando.length === 0,
        `bundle do cliente sem o texto do slide ${slide.numero}${
          vazando.length ? ` (encontrado em ${vazando.map((v) => v.caminho).join(', ')})` : ''
        }`,
      )
    }
  } finally {
    derrubar(servidor)
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
