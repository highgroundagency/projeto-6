import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ARQUIVO_PDF_SR1,
  AVANCO,
  COMPROMISSOS_NO_SR1,
  DEMO_SR1,
  DISTRITOS_NA_BASE,
  DURACAO_SR1_SEGUNDOS,
  LIMITE_SR1_SEGUNDOS,
  CSD_SR1,
  OBJETIVOS_NO_SR1,
  PALAVRAS_POR_SEGUNDO,
  PARADAS_ATE_O_SR2,
  PARTES_SR1,
  PLANEJADO_X_REALIZADO,
  ROTEIRO_SR1,
  SEMANA_DO_SR1,
  SEMANAS_NO_SEMESTRE,
  SLIDES_SR1,
  TELAS_NO_SR1,
  TESTES_DO_MOTOR,
  TETO_DE_PALAVRAS_SR1,
  TRES_CONTAS,
  UNIDADE_DO_DECK,
  inicioDoSlide,
  palavrasFaladas,
  palavrasNaTela,
  porExtenso,
  slidesDaParte,
  tempoPorIntegranteSR1,
  textoNaTela,
  type SlideSR1,
} from './apresentacao-sr1'
import { CSD_EM_25_09 } from './analises'
import { CHECKLIST } from './checklist'
import { BACKLOG } from './ciclos/s6'
import { EQUIPE } from './equipe'
import { COMPROMISSOS_ATE_O_SR1 } from './pitch'
import { OBJETIVOS_ESPECIFICOS } from './produto'
import dados from './ml/apresentacao.json'
import { regraVigente } from '@/lib/calculo/motor'
import { CRONOGRAMA, indiceDoCiclo } from '@/lib/cronograma'
import { BASE } from '@/lib/seed'

const RAIZ = join(__dirname, '..', '..')
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), 'utf8')
const LISTA = SLIDES_SR1 as readonly SlideSR1[]

describe('o deck do SR1', () => {
  it('tem vinte e dois slides numerados em sequência, com ids únicos', () => {
    expect(SLIDES_SR1).toHaveLength(22)
    expect(SLIDES_SR1.map((s) => s.numero)).toEqual(
      Array.from({ length: SLIDES_SR1.length }, (_, i) => i + 1),
    )
    expect(new Set(SLIDES_SR1.map((s) => s.id)).size).toBe(SLIDES_SR1.length)
  })

  it('fecha com folga dentro dos quinze minutos em que a banca interrompe', () => {
    const total = LISTA.reduce((soma, s) => soma + s.segundos, 0)
    expect(total).toBe(DURACAO_SR1_SEGUNDOS)
    expect(inicioDoSlide(LISTA.length)).toBe(DURACAO_SR1_SEGUNDOS)
    expect(LIMITE_SR1_SEGUNDOS).toBe(900)
    // Troca de quem fala, a demonstração e o nervoso do dia comem tempo que a
    // conta de palavras não vê. Três minutos de margem, no mínimo.
    expect(LIMITE_SR1_SEGUNDOS - total).toBeGreaterThanOrEqual(180)
  })

  it('segue a rubrica: as seis partes, na ordem dela, entre a abertura e o encerramento', () => {
    expect(LISTA[0].id).toBe('capa')
    expect(LISTA[0].parte).toBe('abertura')
    expect(LISTA.at(-1)?.id).toBe('fechamento')
    expect(LISTA.at(-1)?.parte).toBe('encerramento')

    // Cada parte tem pelo menos um slide, e as partes não se misturam.
    const ordem = ['abertura', ...PARTES_SR1.map((p) => p.id), 'encerramento']
    const indices = LISTA.map((s) => ordem.indexOf(s.parte))
    expect(indices.every((i) => i >= 0)).toBe(true)
    expect(indices).toEqual([...indices].sort((a, b) => a - b))
    for (const parte of PARTES_SR1) {
      expect(LISTA.some((s) => s.parte === parte.id), parte.nome).toBe(true)
    }
    expect(PARTES_SR1.map((p) => p.criterio)).toEqual([1, 2, 3, 4, 5, 6])

    // O slide 2 é o mapa: os intervalos batem com os slides de verdade.
    for (const item of ROTEIRO_SR1) {
      const [primeiro, ultimo] = slidesDaParte(item.id)
      expect(item.slides).toContain(String(primeiro))
      expect(item.slides).toContain(String(ultimo))
    }
  })

  it('mostra o que cada critério da rubrica pede, com um slide para cada item', () => {
    const ids = LISTA.map((s) => s.id)
    // 1. problema, pesquisa, matriz CSD, usuários (personas e mapa), existentes (benchmarking e SWOT), objetivos
    // 2. técnicas, critérios da escolha, disciplinas-alvo
    // 3. funcionamento, wireframes, demonstração, diferenciais
    // 4. ciclo de vida, papéis e responsabilidades, ferramentas com o site e o Drive
    // 5. planejado x realizado e percentual de avanço
    // 6. pontos fortes, pontos de melhoria e riscos, cada um com o tratamento
    for (const id of [
      'problema',
      'pesquisa',
      'csd',
      'usuarios',
      'existentes',
      'objetivos',
      'tecnicas',
      'escolha',
      'disciplinas',
      'solucao',
      'wireframes',
      'demo',
      'diferenciais',
      'processo',
      'equipe',
      'ferramentas',
      'planejado',
      'avanco',
      'balanco',
    ]) {
      expect(ids, id).toContain(id)
    }
  })

  it('os sete falam, e ninguém some nem toma conta', () => {
    const tempos = tempoPorIntegranteSR1()
    expect([...tempos.keys()].sort()).toEqual(EQUIPE.map((i) => i.id).sort())
    for (const [quem, segundos] of tempos) {
      expect(segundos, quem).toBeGreaterThanOrEqual(60)
      expect(segundos, quem).toBeLessThanOrEqual(130)
    }
  })

  it('a fala de cada slide cabe no tempo dele, a uma fala calma', () => {
    for (const slide of LISTA) {
      const cabem = Math.floor(slide.segundos * PALAVRAS_POR_SEGUNDO)
      expect(palavrasFaladas(slide), `slide ${slide.numero} (${slide.titulo})`).toBeLessThanOrEqual(
        cabem,
      )
    }
  })

  it('cabe no teto de palavras: autocontido, sem virar teleprompter', () => {
    for (const slide of SLIDES_SR1) {
      expect(palavrasNaTela(slide.id), `slide ${slide.numero} (${slide.titulo})`).toBeLessThanOrEqual(
        TETO_DE_PALAVRAS_SR1,
      )
    }
  })

  it('todo texto de tela sai do conteúdo, e não do componente', () => {
    const frasesLongas = ler('src/components/sr1/slides.tsx')
      .replace(/\{\/\*[\s\S]*?\*\/\}?/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => !/[=<>{}"'`]/.test(linha))
      .filter((linha) => !linha.startsWith('*') && !linha.startsWith('//'))
      .filter((linha) => linha.split(/\s+/).filter(Boolean).length >= 5)
    expect(frasesLongas, `mova para apresentacao-sr1.ts: ${frasesLongas.join(' | ')}`).toEqual([])
  })

  it('não usa palavra difícil na tela nem na fala', () => {
    // A mesma lista do Kick-off: sete pessoas apresentam, e nem todas estão
    // dentro de cada parte. O que está entre parênteses é o termo que vale
    // ponto com a banca, depois da palavra simples.
    const DIFICEIS =
      /\b(consolida\w*|régua|aplicabilidade|homologa\w*|memória de cálculo|subindicador\w*|competência|gradação|atingimento|reproduzív\w*|sintétic\w*|instância|parametriz\w*)\b/i
    for (const slide of SLIDES_SR1) {
      const naTela = textoNaTela(slide.id).join(' ').replace(/\([^)]*\)/g, ' ')
      expect(naTela, `slide ${slide.numero} na tela`).not.toMatch(DIFICEIS)
      for (const nota of slide.notas) {
        expect(nota.replace(/\([^)]*\)/g, ' '), `slide ${slide.numero} na fala`).not.toMatch(DIFICEIS)
      }
    }
  })

  it('não usa travessão em nada que se lê ou se fala (regra 8 da casa)', () => {
    for (const slide of LISTA) {
      const textos = [
        slide.titulo,
        slide.apoio,
        slide.visual,
        ...slide.notas,
        ...(slide.perguntas ?? []),
        ...textoNaTela(slide.id as (typeof SLIDES_SR1)[number]['id']),
      ]
      for (const texto of textos) {
        expect(texto, `slide ${slide.numero}`).not.toMatch(/[—–]/)
        expect(texto.trim().length, `slide ${slide.numero}`).toBeGreaterThan(0)
      }
    }
  })

  it('nenhum título leva aspas, apóstrofo ou &: o HTML os escaparia e a checagem de vazamento não acharia o título', () => {
    for (const slide of SLIDES_SR1) expect(slide.titulo, slide.id).not.toMatch(/['"&]/)
  })

  it('maio continua com o número que fechou, e a regra nova é outra conta', () => {
    const [maioV2, maioV3, junhoV3] = TRES_CONTAS.map((c) => c.avaliacao)
    const guardada = BASE.avaliacoes.find(
      (a) => a.unidadeId === UNIDADE_DO_DECK && a.cicloId === 'ciclo-2026-05',
    )
    expect(guardada?.score).toBe(maioV2.score)
    expect(maioV3.score).not.toBe(maioV2.score)
    expect(regraVigente('2026-05', BASE.regras)?.id).toBe('regra-v2')
    expect(regraVigente('2026-06', BASE.regras)?.id).toBe('regra-v3')
    expect(junhoV3.memoria.passos.length).toBeGreaterThan(0)
    expect(DEMO_SR1.avaliacao).toBe(junhoV3)
    const junhoGuardado = BASE.avaliacoes.find(
      (a) => a.unidadeId === UNIDADE_DO_DECK && a.cicloId === 'ciclo-2026-06',
    )
    if (junhoGuardado) expect(junhoGuardado.score).toBe(junhoV3.score)
  })

  it('diz no palco os números que o repositório sustenta', () => {
    const casos = ler('src/lib/calculo/motor.test.ts').match(/^\s*it\(/gm) ?? []
    expect(casos).toHaveLength(TESTES_DO_MOTOR)
    expect(TELAS_NO_SR1.length).toBeGreaterThanOrEqual(4)
    expect(DISTRITOS_NA_BASE).toBeGreaterThan(0)
    expect(DISTRITOS_NA_BASE).toBe(
      dados.base.categoricas.find((c) => c.coluna === 'Distrito Sanitário')?.valores,
    )
    expect(CSD_SR1.map((c) => c.total)).toEqual([
      CSD_EM_25_09.certezas.length,
      CSD_EM_25_09.suposicoes.length,
      CSD_EM_25_09.duvidas.length,
    ])
    expect(porExtenso(5)).toBe('cinco')
    expect(porExtenso(8)).toBe('oito')
  })

  it('o planejado x realizado bate com o cronograma e com o checklist', () => {
    const ciclos = CRONOGRAMA.filter(
      (c) => c.tipo !== 'pausa' && indiceDoCiclo(c.id) <= indiceDoCiclo('sr1'),
    ).map((c) => c.id)
    expect(PLANEJADO_X_REALIZADO.map((l) => l.ciclo)).toEqual(ciclos)

    for (const linha of PLANEJADO_X_REALIZADO) {
      const ciclo = CRONOGRAMA.find((c) => c.id === linha.ciclo)!
      expect(linha.planejadas).toBe(ciclo.evidencias.length)
      expect(linha.entregues + linha.emAndamento.length).toBe(linha.planejadas)
      for (const evidencia of linha.emAndamento) {
        expect(ciclo.evidencias).toContain(evidencia)
        const item = CHECKLIST.find((i) => i.ciclo === linha.ciclo && i.evidencia === evidencia)
        expect(item?.status === 'feito' || item?.status === 'validado').toBe(false)
      }
      const equipe = EQUIPE.map((i) => i.id) as readonly string[]
      for (const quem of linha.responsaveis) expect(equipe).toContain(quem)
    }
  })

  it('o avanço é a conta que ele diz ser', () => {
    const [ateHoje, semestre, historias] = AVANCO
    const planejadas = PLANEJADO_X_REALIZADO.reduce((s, l) => s + l.planejadas, 0)
    const entregues = PLANEJADO_X_REALIZADO.reduce((s, l) => s + l.entregues, 0)
    expect(ateHoje.numero).toBe(`${Math.round((entregues / planejadas) * 100)}%`)
    expect(ateHoje.conta).toBe(`${entregues} de ${planejadas} entregas`)

    const doSemestre = CRONOGRAMA.filter((c) => c.tipo !== 'pausa').reduce(
      (s, c) => s + c.evidencias.length,
      0,
    )
    expect(semestre.conta).toContain(`de ${doSemestre}`)
    // "na metade do calendário" só vale se o SR1 cair mesmo no meio. A
    // "semana 9" do calendário não é a Semana 9 do cronograma (a Sprint 3), e
    // por isso a tela não diz o número.
    expect(semestre.conta).toContain('na metade do calendário')
    expect(SEMANA_DO_SR1 * 2).toBe(SEMANAS_NO_SEMESTRE)

    const noAr = BACKLOG.filter((h) => h.estado === 'no_ar').length
    expect(historias.numero).toBe(`${Math.round((noAr / BACKLOG.length) * 100)}%`)
  })

  it('cada objetivo específico tem estado, e a fala conta como a tela', () => {
    expect(OBJETIVOS_NO_SR1.map((o) => o.resumo)).toEqual(
      OBJETIVOS_ESPECIFICOS.map((o) => o.resumo),
    )
    const contar = (estado: string) => OBJETIVOS_NO_SR1.filter((o) => o.estado === estado).length
    // A fala do slide 8 diz "um foi alcançado e dois estão em parte. Os outros
    // dois vencem em...". Se o estado mudar, a fala muda junto.
    expect(contar('alcançado')).toBe(1)
    expect(contar('em parte')).toBe(2)
    expect(contar('no prazo')).toBe(2)
    const fala = LISTA.find((s) => s.id === 'objetivos')!.notas.join(' ')
    expect(fala).toContain('um foi alcançado e dois estão em parte')
    // "no prazo" só vale para objetivo cuja data ainda não passou.
    const depoisDoSR1 = ['Semana 9', 'Semana 10', 'Semana 11', 'Semana 12', 'SR2']
    for (const objetivo of OBJETIVOS_ESPECIFICOS) {
      const estado = OBJETIVOS_NO_SR1.find((o) => o.resumo === objetivo.resumo)?.estado
      if (estado === 'no prazo') expect(depoisDoSR1, objetivo.resumo).toContain(objetivo.quando)
    }
  })

  it('presta conta dos três compromissos do Kick-off, sem pular nenhum', () => {
    expect(COMPROMISSOS_NO_SR1.map((c) => c.ciclo)).toEqual(
      COMPROMISSOS_ATE_O_SR1.map((c) => c.ciclo),
    )
    for (const item of COMPROMISSOS_NO_SR1) {
      expect(['feito', 'em parte', 'não feito']).toContain(item.estado)
      expect(item.porque.length).toBeGreaterThan(10)
    }
    // A fala do slide 20 diz "um foi feito e um saiu em parte", e dá a data
    // nova dos outros dois.
    for (const estado of ['feito', 'em parte', 'não feito']) {
      expect(COMPROMISSOS_NO_SR1.filter((c) => c.estado === estado), estado).toHaveLength(1)
    }
    // O cronograma atualizado: quem não foi feito diz para quando foi, e a
    // data é uma data do cronograma, depois do SR1.
    const datasDepois = CRONOGRAMA.filter((c) => indiceDoCiclo(c.id) > indiceDoCiclo('sr1')).map(
      (c) => c.data.slice(8, 10) + '/' + c.data.slice(5, 7),
    )
    for (const item of COMPROMISSOS_NO_SR1.filter((c) => c.estado !== 'feito')) {
      expect(datasDepois.some((d) => item.agora.includes(d)), item.compromisso).toBe(true)
    }
    for (const item of COMPROMISSOS_NO_SR1) {
      expect(item.dono.length, item.compromisso).toBeGreaterThan(2)
    }
  })

  it('o caminho até o SR2 anda para a frente, passa pelas quatro sprints e termina no SR2', () => {
    const indices = PARADAS_ATE_O_SR2.map((p) => indiceDoCiclo(p.ciclo))
    expect(indices).toEqual([...indices].sort((a, b) => a - b))
    expect(indices[0]).toBeGreaterThan(indiceDoCiclo('sr1'))
    expect(PARADAS_ATE_O_SR2.at(-1)?.ciclo).toBe('sr2')
    expect(PARADAS_ATE_O_SR2.filter((p) => p.destaque)).toHaveLength(1)
    const sprints = CRONOGRAMA.filter((c) => /sprint/i.test(c.rotulo))
    expect(sprints).toHaveLength(4)
  })

  it('o slide 4 é da pesquisa, com as respostas preparadas: o teste de ponta a ponta abre ele', () => {
    const quarto = LISTA[3]
    expect(quarto.id).toBe('pesquisa')
    expect(quarto.quemFala).toBe('matheus')
    expect(quarto.perguntas?.length).toBeGreaterThan(0)
  })

  it('o roteiro impresso traz o título, a fala e as respostas de cada slide', () => {
    const roteiro = ler('docs/pitch-sr1.md')
    for (const slide of LISTA) {
      expect(roteiro, `slide ${slide.numero}`).toContain(slide.titulo)
      for (const nota of slide.notas) expect(roteiro, `slide ${slide.numero}`).toContain(nota)
      for (const resposta of slide.perguntas ?? []) {
        expect(roteiro, `slide ${slide.numero}`).toContain(resposta)
      }
    }
  })

  it('o PDF do SR1 está no rastreamento de arquivos, senão some no deploy', () => {
    const config = ler('next.config.ts')
    expect(config).toContain(ARQUIVO_PDF_SR1)
    expect(config).toContain('docs/sr1.pdf')
  })

  it('não traz dado de pessoa', () => {
    const tudo = JSON.stringify(SLIDES_SR1)
    expect(tudo).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
    expect(tudo).not.toMatch(/[\w.]+@[\w.]+\.\w+/)
  })
})
