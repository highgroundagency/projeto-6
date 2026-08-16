/**
 * Gera `DOSSIE.txt`: o projeto inteiro em texto puro.
 *
 * Existe porque "me manda tudo o que está no site" não deveria ser respondido
 * por alguém abrindo dezoito sanfonas e copiando à mão. E, principalmente,
 * porque um dossiê escrito à mão começa correto e envelhece: alguém muda um
 * peso no cronograma, um documento de entrega, o texto de um perfil, e o .txt
 * continua contando a versão antiga com toda a segurança do mundo.
 *
 * ENTÃO O DOSSIÊ É GERADO DA MESMA FONTE QUE A TELA LÊ. O cronograma vem de
 * `cronograma.ts`, os registros semanais dos arquivos de `content/ciclos/`, e os
 * documentos de entrega são RENDERIZADOS de verdade, com `react-dom/server`, e
 * convertidos em texto. Se o site mudar e o dossiê não for regerado, `npm run
 * verificar` acusa a diferença.
 *
 * Uso: npm run dossie          escreve DOSSIE.txt
 *      npm run dossie -- --conferir   falha se o arquivo estiver desatualizado
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

import { CRONOGRAMA, cicloPorId, type CicloId } from '../src/lib/cronograma'
import { formatarBR } from '../src/lib/datas'
import { EQUIPE, integrantePorId } from '../src/content/equipe'
import { CHECKLIST, ROTULO_STATUS } from '../src/content/checklist'
import {
  REQUISITOS,
  ROTULO_ESTADO_REQUISITO,
  type EstadoRequisito,
} from '../src/content/auditoria'
import {
  CLIENTE,
  INSTITUICAO,
  PERGUNTA_DO_PROJETO,
  PRODUTO,
  PROBLEMA,
  URL_REPOSITORIO,
} from '../src/content/produto'
import { TUTORIAIS } from '../src/content/tutoriais'
import { VITRINE } from '../src/content/vitrine'
import { FEATURES, ORDEM_PERFIS, PERFIS } from '../src/lib/features'
import { ADIANTAMENTO_PADRAO } from '../src/lib/releases'
import type { Documento, ModuloCiclo, RegistroSemana } from '../src/lib/registro/tipos'
import resultadosMl from '../src/content/ml/resultados.json'

/**
 * Os ciclos, importados DIRETO, sem passar pelo registry.
 *
 * `src/content/ciclos/registro.ts` tem `import 'server-only'`, que estoura fora
 * do Next — e é exatamente o ponto: aquele registry existe para o app carregar
 * apenas o que o gate de release aprovou. O dossiê é o oposto disso. Ele é o
 * documento COMPLETO do projeto, com as semanas ainda não publicadas incluídas,
 * e por isso monta a própria lista.
 *
 * Isto não vaza nada: o conteúdo já está versionado em texto no repositório, e
 * quem lê o .txt está lendo o repositório. O que o §6.3 protege é o que chega
 * ao NAVEGADOR de quem visita o site, e esse caminho continua passando pelo
 * registry com gate.
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

const RAIZ = process.cwd()
const DESTINO = join(RAIZ, 'DOSSIE.txt')
const LARGURA = 92

// ---------------------------------------------------------------------------
// Formatação
// ---------------------------------------------------------------------------

const linhas: string[] = []

function escrever(texto = '') {
  linhas.push(texto)
}

/** Título de primeiro nível, separado por régua dupla. */
function capitulo(numero: string, titulo: string) {
  escrever()
  escrever('='.repeat(LARGURA))
  escrever(`${numero}  ${titulo.toUpperCase()}`)
  escrever('='.repeat(LARGURA))
  escrever()
}

function secao(titulo: string) {
  escrever()
  escrever(`--- ${titulo} ${'-'.repeat(Math.max(0, LARGURA - titulo.length - 5))}`)
  escrever()
}

function subtitulo(titulo: string) {
  escrever()
  escrever(`  ${titulo}`)
  escrever(`  ${'~'.repeat(titulo.length)}`)
}

/** Quebra o parágrafo na largura fixa, preservando a indentação pedida. */
function paragrafo(texto: string, recuo = '') {
  const palavras = texto.split(/\s+/).filter(Boolean)
  let atual = recuo
  for (const palavra of palavras) {
    if (atual.length + palavra.length + 1 > LARGURA && atual.trim()) {
      escrever(atual.trimEnd())
      atual = recuo + palavra + ' '
    } else {
      atual += palavra + ' '
    }
  }
  if (atual.trim()) escrever(atual.trimEnd())
}

function item(texto: string, marcador = '  - ') {
  const recuo = ' '.repeat(marcador.length)
  const palavras = texto.split(/\s+/).filter(Boolean)
  let atual = marcador
  let primeira = true
  for (const palavra of palavras) {
    if (atual.length + palavra.length + 1 > LARGURA && !primeira) {
      escrever(atual.trimEnd())
      atual = recuo + palavra + ' '
    } else {
      atual += palavra + ' '
      primeira = false
    }
  }
  if (atual.trim()) escrever(atual.trimEnd())
}

// ---------------------------------------------------------------------------
// Renderização dos documentos de entrega
// ---------------------------------------------------------------------------

/**
 * Transforma o HTML de um documento TSX em texto legível.
 *
 * Não é um conversor genérico de HTML: é o suficiente para os primitivos de
 * `components/conteudo.tsx`, que é tudo o que os documentos usam. Tabela vira
 * linha com `|`, item de lista vira `-`, título vira linha própria.
 */
function htmlParaTexto(html: string): string {
  return (
    html
      // Bordas de célula viram separador antes de qualquer coisa.
      .replace(/<\/t[hd]>\s*<t[hd][^>]*>/g, ' | ')
      .replace(/<tr[^>]*>/g, '\n  ')
      .replace(/<\/tr>/g, '')
      .replace(/<li[^>]*>/g, '\n  - ')
      .replace(/<\/li>/g, '')
      .replace(/<\/(h[1-6]|p|div|section|ul|ol|table|thead|tbody)>/g, '\n')
      .replace(/<(h[1-6])[^>]*>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '')
      // Entidades que o React escapa.
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/ +\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

function renderizarDocumento(doc: Documento): string {
  const elemento = doc.Conteudo() as ReactElement
  return htmlParaTexto(renderToStaticMarkup(elemento))
}

// ---------------------------------------------------------------------------
// Blocos do registro semanal
// ---------------------------------------------------------------------------

function escreverBloco(rotulo: string, bloco: RegistroSemana[keyof RegistroSemana]) {
  if (typeof bloco !== 'object' || bloco === null || !('conteudo' in bloco)) return
  const selo = (bloco as { selo: string }).selo
  const validador = (bloco as { validadoPor: string | null }).validadoPor
  const conteudo = (bloco as { conteudo: unknown }).conteudo

  subtitulo(`${rotulo}  [${selo}${validador ? `, validado por ${validador}` : ''}]`)

  if (typeof conteudo === 'string') {
    if (conteudo === 'nenhum') {
      item('nenhum registro nesta semana.')
    } else {
      paragrafo(conteudo, '  ')
    }
    return
  }

  if (!Array.isArray(conteudo) || conteudo.length === 0) {
    item('nada registrado.')
    return
  }

  for (const entrada of conteudo) {
    if (typeof entrada === 'string') {
      item(entrada)
    } else if ('decisao' in entrada) {
      item(entrada.decisao)
      item(`por quê: ${entrada.porque}`, '      ')
    } else if ('integrante' in entrada) {
      const pessoa = integrantePorId(entrada.integrante)
      item(`${pessoa.nome}: ${entrada.contribuicao}`)
    } else if ('texto' in entrada) {
      item(`(${entrada.origem}) ${entrada.texto}`)
    } else if ('rotulo' in entrada) {
      item(`[${entrada.tipo}] ${entrada.rotulo} -> ${entrada.url}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Corpo do dossiê
// ---------------------------------------------------------------------------

async function montar(): Promise<string> {
  const pacote = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8'))

  escrever('='.repeat(LARGURA))
  escrever(`${PRODUTO.nome.toUpperCase()}: DOSSIÊ COMPLETO DO PROJETO`)
  escrever(PRODUTO.subtitulo)
  escrever('='.repeat(LARGURA))
  escrever()
  paragrafo(
    `${INSTITUICAO.escola}, ${INSTITUICAO.curso}, ${INSTITUICAO.periodo}, ${INSTITUICAO.equipe}. ` +
      `Cliente do caso: ${CLIENTE.orgao}, ${CLIENTE.area}.`,
  )
  escrever()
  paragrafo(
    'Este arquivo é GERADO por `npm run dossie` a partir do próprio código do site. ' +
      'Nada aqui foi digitado duas vezes: o cronograma vem do cronograma, os registros ' +
      'semanais vêm dos arquivos de ciclo, e os documentos de entrega são renderizados de ' +
      'verdade e convertidos em texto. Se o site mudar e este arquivo não for regerado, ' +
      '`npm run verificar` acusa.',
  )
  escrever()
  item(`repositório: ${URL_REPOSITORIO}`)
  item(`versão do pacote: ${pacote.version}`)
  item('nenhum dado real de pessoa ou da SESAU aparece aqui: a base é sintética.')

  // ---- 1. O projeto -------------------------------------------------------
  capitulo('1.', 'o projeto')

  secao('A pergunta')
  paragrafo(PERGUNTA_DO_PROJETO)

  secao('O problema')
  for (const linha of PROBLEMA) (paragrafo(linha), escrever())

  secao('O nome')
  paragrafo(PRODUTO.origemDoNome)

  secao('A equipe')
  for (const pessoa of EQUIPE) {
    item(`${pessoa.nome} (${pessoa.id}): ${pessoa.papel}`)
    if ('foco' in pessoa && pessoa.foco) item(String(pessoa.foco), '      ')
  }

  // ---- 2. Cronograma ------------------------------------------------------
  capitulo('2.', 'cronograma: a fonte única de verdade das datas')
  paragrafo(
    'Toda data do site sai de `src/lib/cronograma.ts`. O cabeçalho, o motor de releases, o ' +
      'registro semanal e o checklist derivam dela, e não existe segunda lista para manter ' +
      `em dia. O release público adianta ${ADIANTAMENTO_PADRAO} dias: uma semana entra no ar ` +
      'antes da própria data, para que a página nunca esteja atrasada em relação à aula.',
  )
  escrever()
  escrever(`  ${'ID'.padEnd(6)}${'DATA'.padEnd(13)}${'TIPO'.padEnd(10)}RÓTULO`)
  escrever(`  ${'-'.repeat(LARGURA - 4)}`)
  for (const ciclo of CRONOGRAMA) {
    escrever(
      `  ${ciclo.id.padEnd(6)}${formatarBR(ciclo.data).padEnd(13)}${ciclo.tipo.padEnd(10)}${ciclo.rotulo}`,
    )
  }
  escrever()
  item(`${CRONOGRAMA.length} ciclos no total.`)
  item(
    `${CRONOGRAMA.filter((c) => c.tipo === 'marco').length} marcos, ` +
      `${CRONOGRAMA.filter((c) => c.tipo === 'pausa').length} semanas imprensadas ` +
      '(sem registro próprio: as entregas são acumuladas na semana seguinte).',
  )

  // ---- 3. Registro semanal ------------------------------------------------
  capitulo('3.', 'registro semanal, semana a semana')
  paragrafo(
    'Oito blocos fixos por semana, sempre na mesma ordem: objetivo, avanços, decisões, ' +
      'bloqueios, feedback, próximos passos, responsáveis e evidências. O selo de cada bloco ' +
      'diz se ele foi validado e por quem. "nenhum" é resposta legítima e aparece assim: ' +
      'inventar feedback de professor ou de cliente seria fabricar evidência.',
  )

  for (const ciclo of CRONOGRAMA) {
    const carregador = CARREGADORES[ciclo.id as CicloId]
    if (!carregador) continue

    const modulo = await carregador()
    const registro = modulo.registro

    secao(`${ciclo.id.toUpperCase()} · ${ciclo.rotulo} · ${formatarBR(ciclo.data)}`)

    escreverBloco('Objetivo da semana', registro.objetivo)
    escreverBloco('Avanços', registro.avancos)
    escreverBloco('Decisões', registro.decisoes)
    escreverBloco('Bloqueios', registro.bloqueios)
    escreverBloco('Feedback recebido', registro.feedback)
    escreverBloco('Próximos passos', registro.proximosPassos)
    escreverBloco('Responsáveis', registro.responsaveis)
    escreverBloco('Evidências', registro.evidencias)

    const documentos = modulo.documentos ?? []
    if (documentos.length > 0) {
      subtitulo(`Documentos de entrega desta semana (${documentos.length})`)
      for (const doc of documentos) {
        escrever()
        escrever(`  >>> ${doc.titulo.toUpperCase()}`)
        escrever(`      âncora no site: #doc-${ciclo.id}-${doc.id}`)
        paragrafo(doc.resumo, '      ')
        escrever()
        for (const linha of renderizarDocumento(doc).split('\n')) {
          escrever(linha.trim() ? `      ${linha}` : '')
        }
      }
    }
  }

  // ---- 4. O sistema -------------------------------------------------------
  capitulo('4.', 'o sistema: as oito telas do mvp')
  paragrafo(
    'As oito telas vivem numa página só, `/sistema`, cada uma numa sanfona. Duas portas ' +
      'guardam cada uma delas, nesta ordem: o gate de release (a tela já existe hoje?) e o ' +
      'gate de perfil (ela é de quem está aqui?). Quem não passa recebe 404, nunca 403: da ' +
      'porta, "ainda não liberado" e "não é seu" precisam ser indistinguíveis.',
  )
  escrever()

  for (const feature of FEATURES) {
    const ciclo = cicloPorId(feature.ciclo as CicloId)
    subtitulo(feature.rotulo)
    paragrafo(feature.descricao, '  ')
    item(`id interno: ${feature.id}`)
    item(`rota histórica: ${feature.rota} (hoje redireciona para /sistema#tela-${feature.id})`)
    item(`liberada em: ${ciclo.rotulo}, ${formatarBR(ciclo.data)}`)
    item(`perfis que enxergam: ${feature.perfis.map((p) => PERFIS[p].rotulo).join(', ')}`)
  }

  // ---- 5. Perfis ----------------------------------------------------------
  capitulo('5.', 'os quatro papéis do processo')
  for (const id of ORDEM_PERFIS) {
    const perfil = PERFIS[id]
    subtitulo(`${perfil.rotulo} (${id})`)
    paragrafo(perfil.quemE, '  ')
    escrever()
    escrever('  O QUE FAZ')
    for (const linha of perfil.oQueFaz) item(linha)
    escrever()
    escrever('  O QUE O PROCESSO IMPEDE')
    for (const linha of perfil.oQueNaoPode) item(linha)
    escrever()
    escrever('  TELAS QUE ENXERGA')
    for (const feature of FEATURES.filter((f) =>
      (f.perfis as readonly string[]).includes(id),
    )) {
      item(feature.rotulo)
    }
  }

  // ---- 6. Tutoriais -------------------------------------------------------
  capitulo('6.', 'tutorial guiado, um por papel')
  paragrafo(
    'Com `?passo=N` o sistema entra em modo tutorial: uma tela só na página, o elemento de ' +
      'que o passo fala contornado em laranja, e uma barra no rodapé conduzindo. Cada passo ' +
      'tem URL própria. Passos que apontam para tela ainda não liberada são descartados.',
  )
  for (const id of ORDEM_PERFIS) {
    const tutorial = TUTORIAIS[id]
    secao(`Tutorial de ${PERFIS[id].rotulo} (${tutorial.passos.length} passos)`)
    paragrafo(tutorial.resumo, '  ')
    escrever()
    tutorial.passos.forEach((passo, i) => {
      escrever(`  ${String(i + 1).padStart(2, '0')}. ${passo.titulo}`)
      paragrafo(`o que fazer: ${passo.oQueFazer}`, '      ')
      paragrafo(`por quê: ${passo.porque}`, '      ')
      escrever(`      tela: ${passo.tela ?? 'nenhuma'} · alvo: ${passo.alvo ?? 'nenhum'}`)
      escrever()
    })
  }

  // ---- 7. Machine learning ------------------------------------------------
  capitulo('7.', 'lente de machine learning')
  paragrafo(resultadosMl.aviso)
  escrever()
  item(`base: ${resultadosMl.base}`)
  item(`gerado em: ${resultadosMl.gerado_em}`)
  item(`semente: ${resultadosMl.semente}`)
  item(`scikit-learn: ${resultadosMl.versao_sklearn}`)
  item(`commit: ${resultadosMl.commit}`)

  for (const modelo of resultadosMl.modelos) {
    subtitulo(modelo.modelo)
    paragrafo(`pergunta: ${modelo.pergunta}`, '  ')
    paragrafo(`método: ${modelo.metodo}`, '  ')
    const metricas = Object.entries(modelo.metricas)
      .filter(([, v]) => typeof v === 'number' || typeof v === 'boolean')
      .map(([k, v]) => `${k}=${v}`)
      .join(' · ')
    if (metricas) item(`métricas: ${metricas}`)
    item(
      `linha de base: ${modelo.referencia.nome}` +
        (modelo.referencia.acuracia !== undefined
          ? ` (acurácia ${modelo.referencia.acuracia})`
          : '') +
        (modelo.referencia.mae !== undefined ? ` (mae ${modelo.referencia.mae})` : ''),
    )
    if (modelo.metricas.supera_referencia === false) {
      item('ESTE MODELO NÃO SUPERA A LINHA DE BASE, e fica publicado dizendo isso.')
    }
    paragrafo(`limitação declarada: ${modelo.limitacao}`, '  ')
  }

  // ---- 8. Checklist da matriz ---------------------------------------------
  capitulo('8.', 'checklist das evidências da matriz')
  paragrafo(
    'Uma linha por evidência exigida pela matriz de avaliação, com o estado dela e quem ' +
      'respondeu. O status é conteúdo versionado, não campo de formulário: mudar aqui deixa ' +
      'histórico de quem mudou o quê e quando, que é exatamente o que o projeto defende.',
  )
  escrever()
  const porStatus = new Map<string, number>()
  let cicloAtual = ''
  for (const linha of CHECKLIST) {
    porStatus.set(linha.status, (porStatus.get(linha.status) ?? 0) + 1)
    if (linha.ciclo !== cicloAtual) {
      cicloAtual = linha.ciclo
      const ciclo = cicloPorId(cicloAtual as CicloId)
      subtitulo(`${ciclo.id.toUpperCase()} · ${ciclo.rotulo} · ${formatarBR(ciclo.data)}`)
    }
    const quem = linha.responsavel ? integrantePorId(linha.responsavel).nome : 'sem responsável'
    item(
      `[${ROTULO_STATUS[linha.status]}] ${linha.evidencia} (${quem})` +
        (linha.link ? ` -> ${linha.link}` : ''),
    )
  }
  escrever()
  subtitulo('Totais')
  for (const [status, quantidade] of porStatus) {
    item(`${ROTULO_STATUS[status as keyof typeof ROTULO_STATUS]}: ${quantidade}`)
  }
  item(`total de evidências acompanhadas: ${CHECKLIST.length}`)

  // ---- 9. Funcionalidades do site -----------------------------------------
  capitulo('9.', 'funcionalidades do site, uma a uma')
  const funcionalidades: Array<[string, string]> = [
    [
      'Página única',
      'A raiz contém o site inteiro: problema, pergunta, equipe, os quatro papéis, o registro ' +
        'semanal em sanfonas, a trilha de marcos e o ciclo de trabalho. `/registro` continua ' +
        'existindo como redirecionamento para a seção.',
    ],
    [
      'Motor de releases',
      'O que o visitante vê é calculado, não configurado: o release atual é o último ciclo com ' +
        `data menor ou igual a hoje mais ${ADIANTAMENTO_PADRAO} dias. Travas por ciclo e um ` +
        'override manual existem no painel para os casos em que o calendário e a realidade ' +
        'discordam.',
    ],
    [
      'Prova de não-vazamento',
      '`npm run verificar-vazamento` sobe o build de produção e confere que nenhum marcador de ' +
        'ciclo futuro aparece no HTML, no payload RSC ou nos chunks de `.next/static`, e que ' +
        'rota de funcionalidade não liberada responde 404.',
    ],
    [
      'Painel administrativo',
      'Em `/admin`, atrás de senha conferida só no servidor e cookie assinado com HMAC-SHA256. ' +
        'Nenhuma página do site linka para ele. Controla release, travas, data simulada e o ' +
        'modo "ver como visitante".',
    ],
    [
      'Vitrine com prazo',
      'Uma janela versionada em `src/content/vitrine.ts` abre o site inteiro por um período e ' +
        'fecha sozinha. Pode simular outra data civil, para demonstrar o semestre já concluído.',
    ],
    [
      'Documentos de entrega em TSX',
      'SWOT, personas, mapa de empatia, backlog, análises de segurança e privacidade: tudo ' +
        'renderizado dentro da página, em sanfona. Nenhum PDF, nenhuma aba nova, nenhum link ' +
        'que expira. Há teste que falha se uma evidência apontar para âncora inexistente.',
    ],
    [
      'Motor de cálculo puro',
      'Sem I/O, sem relógio, sem aleatoriedade. score = (Σ pontos × peso) ÷ (Σ peso × pontuação ' +
        'máxima) × 100. A memória de cálculo exibida na tela sai do mesmo cálculo, item a item.',
    ],
    [
      'Regra versionada',
      'Alterar uma regra cria versão nova; a vigente nunca é editada. Sem isso, um ciclo ' +
        'homologado deixaria de reproduzir o próprio resultado.',
    ],
    [
      'Trilha append-only',
      'Cada evento guarda quem, quando, o quê, o valor anterior e o novo. Correção entra como ' +
        'evento novo. Trilha que pode ser editada não serve de prova.',
    ],
    [
      'Perfis de acesso',
      'As oito telas conferem o perfil no servidor antes de montar qualquer coisa, e respondem ' +
        '404 para quem não tem direito. Teste percorre as 8 telas contra os 4 perfis.',
    ],
    [
      'Tutorial guiado',
      'Um passeio por dentro do sistema, por papel, com o elemento de cada passo contornado. ' +
        'Servidor puro: cada passo tem URL, funciona sem JavaScript.',
    ],
    [
      'Exportação em CSV',
      'O painel da gestão exporta o ranking do ciclo, com ou sem anonimização.',
    ],
    [
      'Schema PostgreSQL guardado',
      '`supabase/migrations/` tem schema completo com gatilhos de invariante e políticas de ' +
        'RLS, testado contra um Postgres real e DESLIGADO da aplicação. O app roda em memória.',
    ],
    [
      'Transparência no uso de IA',
      '`/transparencia-ia` lista o que foi feito com auxílio de IA, onde, e quem validou.',
    ],
    ['Health check', '`/api/status` responde com o estado do cronograma e do release.'],
  ]
  for (const [nome, texto] of funcionalidades) {
    subtitulo(nome)
    paragrafo(texto, '  ')
  }

  // ---- 9b. Auditoria ------------------------------------------------------
  capitulo('10.', 'auditoria: o que o professor pediu, e onde está')
  paragrafo(
    'Cada linha cita o pedido do briefing do case ou da Matriz Integrada e aponta onde ele ' +
      'está atendido no repositório. As ressalvas não são desculpa: são o que falta, dito ' +
      'antes que a banca pergunte. Auditoria que só encontra acerto não auditou nada.',
  )

  const contagem = new Map<string, number>()
  for (const fonte of ['briefing', 'matriz'] as const) {
    secao(fonte === 'briefing' ? 'Do briefing do case da SESAU' : 'Da Matriz Integrada')
    for (const requisito of REQUISITOS.filter((r) => r.fonte === fonte)) {
      contagem.set(requisito.estado, (contagem.get(requisito.estado) ?? 0) + 1)
      subtitulo(`[${ROTULO_ESTADO_REQUISITO[requisito.estado]}] ${requisito.id}`)
      paragrafo(`pedido: "${requisito.pedido}"`, '  ')
      escrever()
      escrever('  onde está:')
      for (const lugar of requisito.onde) item(lugar, '    - ')
      if (requisito.ressalva) {
        escrever()
        paragrafo(`RESSALVA: ${requisito.ressalva}`, '  ')
      }
    }
  }

  secao('Placar da auditoria')
  for (const [estado, quantidade] of contagem) {
    item(`${ROTULO_ESTADO_REQUISITO[estado as EstadoRequisito]}: ${quantidade}`)
  }
  item(`total de requisitos rastreados: ${REQUISITOS.length}`)

  // ---- 11. Regras da casa -------------------------------------------------
  capitulo('11.', 'as regras que não se negociam')
  const claude = readFileSync(join(RAIZ, 'CLAUDE.md'), 'utf8')
  const regras = claude.split('## Regras que não se negociam')[1]?.split('\n## ')[0] ?? ''
  for (const linha of regras.split('\n')) escrever(linha ? `  ${linha}` : '')

  // ---- 11. Decisões -------------------------------------------------------
  capitulo('12.', 'decisões de arquitetura (adrs)')
  paragrafo('Os porquês completos estão em `docs/decisoes.md`. Os títulos, aqui:')
  escrever()
  const decisoes = readFileSync(join(RAIZ, 'docs/decisoes.md'), 'utf8')
  for (const linha of decisoes.split('\n')) {
    if (linha.startsWith('## ADR-')) item(linha.replace('## ', ''))
  }

  // ---- 12. Comandos e estado ----------------------------------------------
  capitulo('13.', 'como rodar e como conferir')
  for (const [nome, comando] of Object.entries(pacote.scripts as Record<string, string>)) {
    escrever(`  npm run ${nome.padEnd(22)} ${comando}`)
  }
  escrever()
  secao('Estado da vitrine no momento em que este dossiê foi gerado')
  item(`fecha em: ${VITRINE.ate ?? 'fechada'}`)
  item(`data simulada: ${VITRINE.dataSimulada ?? 'nenhuma, usa o calendário real'}`)

  escrever()
  escrever('='.repeat(LARGURA))
  escrever('FIM DO DOSSIÊ')
  escrever('='.repeat(LARGURA))

  return linhas.join('\n') + '\n'
}

// ---------------------------------------------------------------------------

// `main()` em vez de top-level await: o tsx transpila este script para CJS, e
// lá o await de topo não existe.
async function main() {
  const conteudo = await montar()

  if (process.argv.includes('--conferir')) {
    let atual = ''
    try {
      atual = readFileSync(DESTINO, 'utf8')
    } catch {
      console.error('DOSSIE.txt não existe. Rode `npm run dossie`.')
      process.exit(1)
    }
    if (atual !== conteudo) {
      console.error(
        'DOSSIE.txt está desatualizado em relação ao código. Rode `npm run dossie` e commite.',
      )
      process.exit(1)
    }
    console.log('DOSSIE.txt está em dia.')
    return
  }

  writeFileSync(DESTINO, conteudo)
  console.log(
    `DOSSIE.txt escrito: ${conteudo.split('\n').length} linhas, ${conteudo.length} bytes.`,
  )
}

main().catch((erro) => {
  console.error(erro)
  process.exit(1)
})
