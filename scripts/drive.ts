/**
 * Gera, em `drive/`, a cópia do que o professor vê no site, pronta para a pasta
 * da equipe no Google Drive.
 *
 * O SITE CONTINUA SENDO A ENTREGA (regra 5 do CLAUDE.md, ADR-019). A pasta do
 * Drive é espelho: um Google Doc por documento e um diário de bordo por
 * semana, cada um apontando de volta para o original no site. Este script não
 * sobe nada. Ele escreve um HTML por arquivo e um `manifesto.json`. Quem sobe é
 * quem tem acesso à pasta, e o Google converte o HTML em Google Doc (ADR-050).
 *
 * SÓ O QUE O VISITANTE VÊ. Os ciclos saem do mesmo motor de releases do site,
 * com as travas versionadas e o adiantamento padrão, na data de hoje em Recife.
 * A janela de vitrine não entra: ela abre o site inteiro por um prazo, e a
 * pasta ficaria com semanas que ainda não aconteceram. Se uma trava por env var
 * (`RELEASE_TRAVAS`) mudar o que o visitante vê, `--ciclos` recebe a lista que
 * o site mostra de fato: os marcadores `PRUMO-MARCADOR-CICLO-*` da página.
 *
 * OS SLIDES vão em PDF, sem virar Google Doc, na pasta da semana em que foram
 * apresentados (`SLIDES`, abaixo). O manifesto lista cada um com o hash do
 * arquivo de `docs/`.
 *
 * O QUE MUDOU DESDE A ÚLTIMA CÓPIA. Com `--desde <commit>`, o script gera de
 * novo a cópia daquele commit, numa worktree temporária e com ESTE script, e
 * marca cada arquivo como `novo`, `mudou` ou `igual`. As duas pontas saem do
 * mesmo script, então só o conteúdo conta: mexer no formato da cópia não marca
 * nada como mudado. O commit da última cópia fica no título do Leia-me da
 * pasta, e o `versao` do manifesto é o que vai para lá depois de subir.
 *
 * Uso: npm run drive
 *      npm run drive -- --hoje 2026-10-10
 *      npm run drive -- --ciclos s1,s2,s3,s4,ko,s5,s6,sr1
 *      npm run drive -- --desde ad76959
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

import { integrantePorId } from '../src/content/equipe'
import { TRAVAS_VERSIONADAS } from '../src/content/travas'
import { CRONOGRAMA, cicloPorId, type CicloId } from '../src/lib/cronograma'
import { ehDataISO, formatarBR, hojeEmRecife } from '../src/lib/datas'
import { ADIANTAMENTO_PADRAO, calcularReleaseAtual, ciclosVisiveis } from '../src/lib/releases'
import {
  ROTULO_ORIGEM,
  type Documento,
  type ModuloCiclo,
  type RegistroSemana,
} from '../src/lib/registro/tipos'

/**
 * Os ciclos com conteúdo, na ordem do cronograma, importados DIRETO.
 *
 * O registry de `src/content/ciclos/registro.ts` é `server-only` e estoura fora
 * do Next, como no dossiê. Aqui quem decide o que sai é `ciclosVisiveis`, logo
 * abaixo, e não a lista: importar uma semana futura não a publica.
 */
const CARREGADORES: Partial<Record<CicloId, () => Promise<ModuloCiclo>>> = {
  s1: () => import('../src/content/ciclos/s1'),
  s2: () => import('../src/content/ciclos/s2'),
  s3: () => import('../src/content/ciclos/s3'),
  s4: () => import('../src/content/ciclos/s4'),
  ko: () => import('../src/content/ciclos/ko'),
  s5: () => import('../src/content/ciclos/s5'),
  s6: () => import('../src/content/ciclos/s6'),
  sr1: () => import('../src/content/ciclos/sr1'),
  s7: () => import('../src/content/ciclos/s7'),
  s8: () => import('../src/content/ciclos/s8'),
  s9: () => import('../src/content/ciclos/s9'),
  s10: () => import('../src/content/ciclos/s10'),
  s11: () => import('../src/content/ciclos/s11'),
  s12: () => import('../src/content/ciclos/s12'),
  sr2: () => import('../src/content/ciclos/sr2'),
}

/**
 * Os slides de cada apresentação, na pasta da semana em que ela aconteceu.
 *
 * O PDF sai de `npm run pitch-pdf`. Sem número na frente do nome, ele fica no
 * fim da pasta, depois do diário e dos documentos numerados. A AV1 de ML foi
 * em 30/09, na semana do SR1, e é o registro do SR1 que aponta para `/ml`.
 */
const SLIDES: Partial<Record<CicloId, readonly { readonly nome: string; readonly pdf: string }[]>> =
  {
    ko: [{ nome: 'Slides do Kick-off.pdf', pdf: 'docs/pitch-kickoff.pdf' }],
    sr1: [
      { nome: 'Slides do SR1.pdf', pdf: 'docs/sr1.pdf' },
      { nome: 'Slides da AV1 de Machine Learning.pdf', pdf: 'docs/ml-av1.pdf' },
    ],
  }

const RAIZ = process.cwd()
const DESTINO = join(RAIZ, 'drive')

function argumento(nome: string): string | undefined {
  const i = process.argv.indexOf(nome)
  return i >= 0 ? process.argv[i + 1] : undefined
}

/**
 * Rodada que regenera uma cópia antiga, chamada por `manifestoDe`. Lá, um PDF
 * de `SLIDES` que ainda não existia naquele commit é esperado, não erro.
 */
const ANTERIOR = process.argv.includes('--anterior')

/**
 * O endereço público, fixo. `NEXT_PUBLIC_SITE_URL` não serve aqui: no ambiente
 * de desenvolvimento ela aponta para localhost, e o link iria para o Drive.
 */
const SITE = (argumento('--site') ?? 'https://projeto6-si.vercel.app').replace(/\/$/, '')

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Link do site em endereço completo: no Drive, `#doc-s6-riscos` não leva a lugar nenhum. */
function absoluto(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  if (url.startsWith('#')) return `${SITE}/${url}`
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`
}

function link(url: string, rotulo: string): string {
  return `<a href="${escapar(absoluto(url))}">${escapar(rotulo)}</a>`
}

/**
 * O HTML do componente, enxuto: sem classe, sem atributo de dado, links
 * completos. O Google Docs ignora as classes do Tailwind de qualquer jeito, e
 * cada byte a menos é upload mais rápido.
 *
 * Desenho em SVG não passa para o Google Docs. Ele sai daqui, e o documento
 * diz no topo que o desenho está no original.
 */
function enxugar(html: string): { html: string; temDesenho: boolean } {
  const temDesenho = /<svg[\s>]/.test(html)
  const limpo = html
    .replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/\s(class|style|data-[\w-]+|aria-[\w-]+|role|tabindex|id)="[^"]*"/g, '')
    .replace(/\s(target|rel)="[^"]*"/g, '')
    .replace(/href="([^"]*)"/g, (_, url: string) => `href="${escapar(absoluto(url.replace(/&amp;/g, '&')))}"`)
    .replace(/<span><\/span>/g, '')
    .replace(/<div>\s*<\/div>/g, '')
  return { html: limpo, temDesenho }
}

function pagina(titulo: string, cabecalho: string, corpo: string): string {
  return [
    '<!doctype html>',
    '<html lang="pt-BR"><head><meta charset="utf-8">',
    `<title>${escapar(titulo)}</title></head><body>`,
    `<h1>${escapar(titulo)}</h1>`,
    cabecalho,
    '<hr>',
    corpo,
    '</body></html>',
  ].join('\n')
}

function cabecalho(rotuloDoCiclo: string, ancora: string, extra?: string): string {
  const original = `${SITE}/${ancora}`
  return [
    `<p><i>${escapar(rotuloDoCiclo)} · Projeto 6, CESAR School, Equipe 2.</i></p>`,
    extra ? `<p>${extra}</p>` : '',
    `<p>Cópia do site do projeto. O original, sempre atualizado, está em ${link(original, original)}.</p>`,
  ]
    .filter(Boolean)
    .join('\n')
}

// ---------------------------------------------------------------------------
// Diário de bordo
// ---------------------------------------------------------------------------

function lista(itens: readonly string[]): string {
  return `<ul>${itens.map((i) => `<li>${escapar(i)}</li>`).join('')}</ul>`
}

/** Os oito blocos, com os mesmos rótulos do cartão da semana no site. */
function diario(registro: RegistroSemana, temDocumentos: boolean): string {
  const partes: string[] = []
  const bloco = (rotulo: string, conteudo: string) => partes.push(`<h2>${rotulo}</h2>`, conteudo)

  bloco('Objetivo da semana', `<p>${escapar(registro.objetivo.conteudo)}</p>`)
  bloco('Avanços', lista(registro.avancos.conteudo))
  bloco(
    'Decisões',
    registro.decisoes.conteudo
      .map((d) => `<p><b>${escapar(d.decisao)}</b></p><p>Por quê: ${escapar(d.porque)}</p>`)
      .join(''),
  )

  const bloqueios = registro.bloqueios.conteudo
  bloco(
    'Bloqueios',
    bloqueios === 'nenhum' ? '<p>Nenhum bloqueio nesta semana.</p>' : lista(bloqueios),
  )

  const feedback = registro.feedback.conteudo
  bloco(
    'Feedback recebido',
    feedback === 'nenhum'
      ? '<p>Nenhum feedback registrado nesta semana.</p>'
      : `<ul>${feedback.map((f) => `<li><b>${escapar(ROTULO_ORIGEM[f.origem])}:</b> ${escapar(f.texto)}</li>`).join('')}</ul>`,
  )

  bloco('Próximos passos', lista(registro.proximosPassos.conteudo))
  bloco(
    'Responsáveis',
    `<ul>${registro.responsaveis.conteudo
      .map((r) => `<li><b>${escapar(integrantePorId(r.integrante).nome)}:</b> ${escapar(r.contribuicao)}</li>`)
      .join('')}</ul>`,
  )

  const evidencias = registro.evidencias.conteudo
  bloco(
    'Evidências',
    evidencias.length === 0
      ? `<p>${temDocumentos ? 'As entregas desta semana são os documentos desta pasta.' : 'Sem evidências anexadas nesta semana.'}</p>`
      : `<ul>${evidencias.map((e) => `<li>${link(e.url, e.rotulo)}</li>`).join('')}</ul>`,
  )

  return partes.join('\n')
}

// ---------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------

/** Como o arquivo está em relação à cópia de `--desde`. */
type Estado = 'novo' | 'mudou' | 'igual'

interface Arquivo {
  /** Estável entre cópias: `diario` ou o id do documento no ciclo. */
  readonly chave: string
  /**
   * O nome do Google Doc na pasta: número na ordem do site, e o título. Quem
   * procura o arquivo no Drive compara sem o número, que muda se um documento
   * entrar no meio.
   */
  readonly nome: string
  /** O título dentro do documento. */
  readonly titulo: string
  /** Caminho do HTML, relativo a `drive/`. */
  readonly arquivo: string
  /** Onde o original mora no site. */
  readonly original: string
  readonly hash: string
  readonly estado?: Estado
}

interface Slides {
  /** O nome do PDF na pasta. */
  readonly nome: string
  /** O PDF no repositório. */
  readonly pdf: string
  readonly hash: string
  readonly estado?: Estado
}

interface PastaDoCiclo {
  readonly ciclo: CicloId
  /** O nome da pasta no Drive: número para ordenar e o rótulo do cronograma. */
  readonly pasta: string
  readonly data: string
  readonly arquivos: Arquivo[]
  readonly slides: Slides[]
}

/** Documento que estava na cópia de `--desde` e saiu do site. */
interface Removido {
  readonly ciclo: CicloId
  readonly chave: string
  readonly nome: string
}

interface Manifesto {
  readonly geradoEm: string
  readonly site: string
  /** O commit de onde a cópia saiu, com `+alterado` se havia conteúdo fora do commit. */
  readonly versao: string
  /** O commit contra o qual `estado` foi calculado. */
  readonly desde: string | null
  readonly pastas: readonly PastaDoCiclo[]
  readonly removidos: readonly Removido[]
}

function resumo(conteudo: string | Buffer): string {
  return createHash('sha256').update(conteudo).digest('hex').slice(0, 16)
}

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' }).trim()
}

function versaoAtual(): string {
  const commit = git('rev-parse', '--short', 'HEAD')
  const pdfs = Object.values(SLIDES).flatMap((lista) => (lista ?? []).map((s) => s.pdf))
  return git('status', '--porcelain', '--', 'src', ...pdfs) ? `${commit}+alterado` : commit
}

function ciclosDeHoje(hoje: string): CicloId[] {
  const pedidos = argumento('--ciclos')
  if (pedidos) {
    const ids = pedidos.split(',').map((c) => c.trim()).filter(Boolean)
    for (const id of ids) cicloPorId(id as CicloId) // falha alto se o id não existe
    return ids as CicloId[]
  }
  const releaseAtual = calcularReleaseAtual({ hoje, adiantamentoDias: ADIANTAMENTO_PADRAO })
  return ciclosVisiveis({ releaseAtual, travas: TRAVAS_VERSIONADAS })
}

/**
 * O manifesto que ESTE script escreveria no commit pedido, para os mesmos
 * ciclos de agora.
 *
 * A worktree é descartável e usa o node_modules daqui. O script e o tsconfig
 * vão por cima dos daquele commit, para comparar conteúdo e não versão de
 * script.
 */
function manifestoDe(commit: string, ciclos: readonly CicloId[]): Manifesto {
  if (ciclos.length === 0) {
    return { geradoEm: '', site: SITE, versao: commit, desde: null, pastas: [], removidos: [] }
  }
  const base = mkdtempSync(join(tmpdir(), 'prumo-drive-'))
  const copia = join(base, 'copia')
  git('worktree', 'add', '--detach', '--quiet', copia, commit)
  try {
    symlinkSync(join(RAIZ, 'node_modules'), join(copia, 'node_modules'), 'dir')
    for (const arquivo of ['scripts/drive.ts', 'scripts/tsconfig.dossie.json']) {
      copyFileSync(join(RAIZ, arquivo), join(copia, arquivo))
    }
    execFileSync(
      join(RAIZ, 'node_modules', '.bin', 'tsx'),
      [
        '--tsconfig',
        'scripts/tsconfig.dossie.json',
        'scripts/drive.ts',
        '--anterior',
        '--ciclos',
        ciclos.join(','),
        '--site',
        SITE,
      ],
      { cwd: copia, stdio: ['ignore', 'ignore', 'inherit'] },
    )
    return JSON.parse(readFileSync(join(copia, 'drive', 'manifesto.json'), 'utf8')) as Manifesto
  } finally {
    git('worktree', 'remove', '--force', copia)
    rmSync(base, { recursive: true, force: true })
  }
}

/**
 * Cada arquivo de agora contra o mesmo arquivo (ciclo e chave) na cópia
 * anterior. Ciclo que ainda não tem pasta no Drive sobe inteiro, qualquer que
 * seja o estado: quem sobe confere a pasta antes.
 */
function comparar(
  pastas: readonly PastaDoCiclo[],
  anterior: Manifesto,
): { pastas: PastaDoCiclo[]; removidos: Removido[] } {
  const antes = new Map<string, string>()
  for (const p of anterior.pastas) {
    for (const a of p.arquivos) antes.set(`${p.ciclo}/${a.chave}`, a.hash)
    for (const s of p.slides) antes.set(`${p.ciclo}/slides/${s.nome}`, s.hash)
  }
  const estado = (chave: string, hash: string): Estado => {
    const velho = antes.get(chave)
    if (velho === undefined) return 'novo'
    return velho === hash ? 'igual' : 'mudou'
  }

  const comparadas = pastas.map((p) => ({
    ...p,
    arquivos: p.arquivos.map((a) => ({ ...a, estado: estado(`${p.ciclo}/${a.chave}`, a.hash) })),
    slides: p.slides.map((s) => ({ ...s, estado: estado(`${p.ciclo}/slides/${s.nome}`, s.hash) })),
  }))

  const agora = new Set(pastas.flatMap((p) => p.arquivos.map((a) => `${p.ciclo}/${a.chave}`)))
  const removidos = anterior.pastas.flatMap((p) =>
    p.arquivos
      .filter((a) => !agora.has(`${p.ciclo}/${a.chave}`))
      .map((a) => ({ ciclo: p.ciclo, chave: a.chave, nome: a.nome })),
  )
  return { pastas: comparadas, removidos }
}

async function montar() {
  const hoje = argumento('--hoje') ?? hojeEmRecife()
  if (!ehDataISO(hoje)) throw new Error(`--hoje precisa ser YYYY-MM-DD: ${hoje}`)
  const desde = argumento('--desde')

  const visiveis = new Set(ciclosDeHoje(hoje))
  const comConteudo = CRONOGRAMA.filter((c) => CARREGADORES[c.id as CicloId])

  rmSync(DESTINO, { recursive: true, force: true })
  mkdirSync(DESTINO, { recursive: true })

  const pastas: PastaDoCiclo[] = []
  for (const [posicao, ciclo] of comConteudo.entries()) {
    const id = ciclo.id as CicloId
    if (!visiveis.has(id)) continue
    const modulo = await CARREGADORES[id]!()
    const documentos: readonly Documento[] = modulo.documentos ?? []
    mkdirSync(join(DESTINO, id), { recursive: true })

    const arquivos: Arquivo[] = []
    const escreverArquivo = (
      chave: string,
      nomeCurto: string,
      titulo: string,
      ancora: string,
      html: string,
    ) => {
      writeFileSync(join(DESTINO, id, `${chave}.html`), html)
      arquivos.push({
        chave,
        nome: `${String(arquivos.length).padStart(2, '0')} ${nomeCurto}`,
        titulo,
        arquivo: `${id}/${chave}.html`,
        original: `${SITE}/${ancora}`,
        hash: resumo(html),
      })
    }

    const tituloDoDiario = `Diário de bordo: ${ciclo.rotulo}`
    escreverArquivo(
      'diario',
      'Diário de bordo',
      tituloDoDiario,
      `#ciclo-${id}`,
      pagina(
        tituloDoDiario,
        cabecalho(`${ciclo.rotulo}, ${formatarBR(ciclo.data)}`, `#ciclo-${id}`),
        diario(modulo.registro, documentos.length > 0),
      ),
    )

    for (const doc of documentos) {
      const ancora = `#doc-${id}-${doc.id}`
      const { html, temDesenho } = enxugar(renderToStaticMarkup(doc.Conteudo() as ReactElement))
      const aviso = temDesenho
        ? '<b>Este documento tem desenhos que não passam para o Google Docs. Eles estão no original, no link abaixo.</b>'
        : undefined
      escreverArquivo(
        doc.id,
        doc.titulo,
        doc.titulo,
        ancora,
        pagina(
          doc.titulo,
          cabecalho(`${ciclo.rotulo}: ${doc.resumo}`, ancora, aviso),
          html,
        ),
      )
    }

    const slides: Slides[] = []
    for (const { nome, pdf } of SLIDES[id] ?? []) {
      const caminho = join(RAIZ, pdf)
      if (!existsSync(caminho)) {
        if (ANTERIOR) continue
        throw new Error(`${pdf} não existe: gere com npm run pitch-pdf ou corrija SLIDES.`)
      }
      slides.push({ nome, pdf, hash: resumo(readFileSync(caminho)) })
    }

    pastas.push({
      ciclo: id,
      pasta: `${String(posicao + 1).padStart(2, '0')} ${ciclo.rotulo}`,
      data: ciclo.data,
      arquivos,
      slides,
    })
  }

  const comparacao = desde
    ? comparar(pastas, manifestoDe(desde, pastas.map((p) => p.ciclo)))
    : { pastas, removidos: [] }

  const manifesto: Manifesto = {
    geradoEm: hoje,
    site: SITE,
    versao: versaoAtual(),
    desde: desde ?? null,
    pastas: comparacao.pastas,
    removidos: comparacao.removidos,
  }
  writeFileSync(join(DESTINO, 'manifesto.json'), `${JSON.stringify(manifesto, null, 2)}\n`)

  const total = pastas.reduce((soma, p) => soma + p.arquivos.length, 0)
  console.log(
    `drive/ escrito para ${hoje}, versão ${manifesto.versao}: ${pastas.length} ciclos, ${total} arquivos.`,
  )
  for (const p of manifesto.pastas) {
    const mexidos = [...p.arquivos, ...p.slides].filter((i) => i.estado && i.estado !== 'igual')
    const pdfs = p.slides.length ? ` e ${p.slides.length} PDF${p.slides.length > 1 ? 's' : ''}` : ''
    const iguais = desde && mexidos.length === 0 ? `, conteúdo igual ao de ${desde}` : ''
    console.log(`  ${p.pasta}: ${p.arquivos.length} arquivos${pdfs}${iguais}`)
    for (const i of mexidos) console.log(`      ${String(i.estado).padEnd(6)} ${i.nome}`)
  }
  for (const r of manifesto.removidos) {
    console.log(`  saiu do site desde ${desde}: ${r.ciclo}, ${r.nome}`)
  }
}

montar().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
