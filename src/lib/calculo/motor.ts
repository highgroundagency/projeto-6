import type {
  Aplicabilidade,
  Avaliacao,
  AvaliacaoDistrital,
  Direcao,
  FaixaGratificacao,
  Indicador,
  Lancamento,
  ModoArredondamento,
  PassoMemoria,
  PassoSubindicador,
  RegraDePontuacao,
  Subindicador,
  Unidade,
} from './tipos'

/**
 * Motor de cálculo da gratificação (§8.3).
 *
 * FUNÇÃO PURA: sem I/O, sem relógio, sem aleatoriedade. Os mesmos insumos
 * devolvem sempre o mesmo resultado — é o que permite recalcular um ciclo
 * homologado meses depois e obter exatamente o mesmo número.
 *
 * Depois da reunião com o cliente (ADR-034), a conta tem um degrau a mais:
 * o que a unidade preenche são SUBINDICADORES; o valor do indicador é composto
 * a partir deles; e a meta e o peso vêm da APLICABILIDADE do tipo da unidade,
 * que mora na regra versionada.
 *
 * Cada passo alimenta a MEMÓRIA DE CÁLCULO, que responde "de onde veio este
 * número?" em um clique. Esse é o argumento central contra a planilha.
 */

/**
 * Arredondamento com correção de ponto flutuante.
 *
 * `2.675 * 100` dá 267.49999999999997 em IEEE 754; sem a correção, arredondar
 * para 2 casas devolveria 2.67 em vez de 2.68.
 */
export function arredondar(
  valor: number,
  casas: number,
  modo: ModoArredondamento = 'meio_para_cima',
): number {
  if (!Number.isFinite(valor)) return valor
  const fator = 10 ** casas
  const escalado = Number((valor * fator).toPrecision(12))

  switch (modo) {
    case 'truncar':
      return Math.trunc(escalado) / fator
    case 'meio_para_baixo':
      return -Math.round(-escalado) / fator
    case 'meio_para_cima':
    default:
      // Meio para cima no sentido contábil: afasta-se do zero no empate.
      return (Math.sign(escalado) * Math.round(Math.abs(escalado))) / fator
  }
}

/**
 * Percentual de atingimento, respeitando a direção do indicador.
 *
 * - `maior_melhor`: valor / meta (vacinação em dia, cobertura de equipes…)
 * - `menor_melhor`: meta / valor (tempo de regulação, abandono de tratamento…)
 *
 * Casos de borda tratados explicitamente, porque na planilha eles viram #DIV/0!:
 * - meta zero em `maior_melhor`: qualquer valor positivo bate o teto; zero é 100%.
 * - valor zero em `menor_melhor`: é o melhor resultado possível, então bate o teto.
 */
export function calcularAtingimento(
  valor: number,
  meta: number,
  direcao: Direcao,
  teto: number,
): { bruto: number; comTeto: number; aplicouTeto: boolean } {
  let bruto: number

  if (direcao === 'maior_melhor') {
    bruto = meta === 0 ? (valor > 0 ? teto : 1) : valor / meta
  } else {
    bruto = valor === 0 ? teto : meta / valor
  }

  if (!Number.isFinite(bruto)) bruto = teto
  if (bruto < 0) bruto = 0

  const comTeto = Math.min(bruto, teto)
  return { bruto, comTeto, aplicouTeto: comTeto < bruto }
}

/** Faixa cujo intervalo `[de, ate)` contém o atingimento. */
export function faixaDoAtingimento(atingimento: number, regra: RegraDePontuacao) {
  return (
    regra.faixas.find(
      (faixa) => atingimento >= faixa.de && (faixa.ate === null || atingimento < faixa.ate),
    ) ?? null
  )
}

export function faixaDoScore(score: number, regra: RegraDePontuacao): FaixaGratificacao | null {
  return (
    regra.faixasGratificacao.find(
      (faixa) => score >= faixa.de && (faixa.ate === null || score < faixa.ate),
    ) ?? null
  )
}

function descreverFaixa(de: number, ate: number | null): string {
  const inicio = `${Math.round(de * 100)}%`
  return ate === null ? `≥ ${inicio}` : `${inicio} a <${Math.round(ate * 100)}%`
}

/** As aplicabilidades da regra para um tipo de unidade, na ordem da regra. */
export function aplicabilidadesDoTipo(
  regra: RegraDePontuacao,
  tipoUnidadeId: string,
): readonly Aplicabilidade[] {
  return regra.aplicabilidades.filter((a) => a.tipoUnidadeId === tipoUnidadeId)
}

export function aplicabilidadeDe(
  regra: RegraDePontuacao,
  tipoUnidadeId: string,
  indicadorId: string,
): Aplicabilidade | null {
  return (
    regra.aplicabilidades.find(
      (a) => a.tipoUnidadeId === tipoUnidadeId && a.indicadorId === indicadorId,
    ) ?? null
  )
}

/**
 * Apura o valor de um subindicador a partir do lançamento vigente dele.
 *
 * 'indice' devolve o valor como veio; 'razao' devolve a proporção em
 * percentual (numerador ÷ denominador × 100). Denominador zero não vira
 * #DIV/0!: o subindicador fica sem valor e o aviso conta o porquê.
 */
export function apurarSubindicador(
  subindicador: Subindicador,
  lancamento: Lancamento | undefined,
): PassoSubindicador {
  const base = {
    subindicadorId: subindicador.id,
    subindicador: subindicador.nome,
    tipo: subindicador.tipo,
  }

  if (!lancamento) {
    return { ...base, numerador: null, denominador: null, valor: null, aviso: 'sem lançamento' }
  }

  if (subindicador.tipo === 'indice') {
    if (lancamento.valor === null) {
      return {
        ...base,
        numerador: null,
        denominador: null,
        valor: null,
        aviso: 'lançamento sem valor',
      }
    }
    return { ...base, numerador: null, denominador: null, valor: lancamento.valor }
  }

  const { numerador, denominador } = lancamento
  if (numerador === null || denominador === null) {
    return { ...base, numerador, denominador, valor: null, aviso: 'lançamento incompleto' }
  }
  if (denominador === 0) {
    return {
      ...base,
      numerador,
      denominador,
      valor: null,
      aviso: 'denominador zero: proporção impossível de apurar',
    }
  }

  return { ...base, numerador, denominador, valor: arredondar((numerador / denominador) * 100, 4) }
}

/** O lançamento vigente de um subindicador: o último registrado vence. */
function lancamentoVigenteDoSub(
  lancamentos: readonly Lancamento[],
  subindicadorId: string,
): Lancamento | undefined {
  return lancamentos
    .filter((l) => l.subindicadorId === subindicadorId)
    .reduce<Lancamento | undefined>((vigente, atual) => {
      if (!vigente) return atual
      if (atual.registradoEm > vigente.registradoEm) return atual
      if (atual.registradoEm === vigente.registradoEm && atual.id > vigente.id) return atual
      return vigente
    }, undefined)
}

export interface EntradaCalculo {
  unidade: Unidade
  cicloId: string
  indicadores: readonly Indicador[]
  subindicadores: readonly Subindicador[]
  lancamentos: readonly Lancamento[]
  regra: RegraDePontuacao
}

interface Composicao {
  indicador: Indicador
  aplicabilidade: Aplicabilidade
  subPassos: PassoSubindicador[]
  /** Valor composto do indicador; null quando nenhum subindicador foi apurado. */
  valor: number | null
  avisoComposicao: string | null
}

/**
 * Calcula a avaliação de uma UNIDADE num ciclo.
 *
 * Entram na conta os indicadores com aplicabilidade para o TIPO da unidade na
 * regra do ciclo — os demais ficam fora da conta e da memória, porque para
 * aquele tipo eles simplesmente não existem.
 *
 * COMPOSIÇÃO (suposição declarada, a validar com a planilha do cliente): o
 * valor do indicador é a média simples dos valores apurados dos seus
 * subindicadores. O atingimento é calculado uma vez, sobre o valor composto,
 * contra a meta da aplicabilidade.
 *
 * O score é a média dos pontos ponderada pelos pesos, reescalada para 0–100
 * pela pontuação máxima da regra:
 *
 *     score = (Σ pontos_i × peso_i) ÷ (Σ peso_i × pontuaçãoMáxima) × 100
 *
 * A normalização do peso acontece só no FIM, na divisão. Normalizar peso a peso
 * antes de somar introduziria erro de arredondamento — três indicadores
 * perfeitos com peso igual dariam 99,9 em vez de 100, e a memória de cálculo
 * deixaria de fechar na conta. Aqui os números somam exatamente o que mostram.
 */
export function calcularAvaliacao({
  unidade,
  cicloId,
  indicadores,
  subindicadores,
  lancamentos,
  regra,
}: EntradaCalculo): Avaliacao {
  const { casas, modo } = regra.arredondamento
  const avisos: string[] = []

  const lancamentosDaUnidade = lancamentos.filter(
    (l) => l.cicloId === cicloId && l.unidadeId === unidade.id,
  )

  // A ordem do catálogo manda: a memória sai sempre na mesma sequência.
  const composicoes: Composicao[] = indicadores.flatMap((indicador) => {
    const aplicabilidade = aplicabilidadeDe(regra, unidade.tipoId, indicador.id)
    if (!aplicabilidade) return []

    const subs = subindicadores.filter((s) => s.indicadorId === indicador.id)
    const subPassos = subs.map((sub) =>
      apurarSubindicador(sub, lancamentoVigenteDoSub(lancamentosDaUnidade, sub.id)),
    )

    const apurados = subPassos.filter((p) => p.valor !== null)
    const valor =
      apurados.length === 0
        ? null
        : arredondar(apurados.reduce((s, p) => s + (p.valor ?? 0), 0) / apurados.length, 4, modo)

    const avisoComposicao =
      apurados.length > 0 && apurados.length < subPassos.length
        ? `${subPassos.length - apurados.length} de ${subPassos.length} subindicadores sem valor apurado: a média usou os que existem.`
        : null

    return [{ indicador, aplicabilidade, subPassos, valor, avisoComposicao }]
  })

  const considerados =
    regra.semLancamento === 'ignora' ? composicoes.filter((c) => c.valor !== null) : composicoes

  const somaPesos = considerados.reduce((soma, c) => soma + c.aplicabilidade.peso, 0)

  if (somaPesos <= 0) {
    return {
      unidadeId: unidade.id,
      cicloId,
      score: 0,
      faixa: faixaDoScore(0, regra),
      memoria: {
        regraId: regra.id,
        versaoRegra: regra.versao,
        passos: [],
        somaPesos: 0,
        somaContribuicoes: 0,
        pontuacaoMaxima: regra.pontuacaoMaxima,
        score: 0,
        formula: 'Sem indicadores aplicáveis com peso: score 0.',
      },
      avisos: ['Nenhum indicador aplicável com peso positivo para o tipo desta unidade neste ciclo.'],
    }
  }

  const passos: PassoMemoria[] = considerados.map(
    ({ indicador, aplicabilidade, subPassos, valor, avisoComposicao }) => {
      const pesoNormalizado = arredondar(aplicabilidade.peso / somaPesos, 6, 'meio_para_cima')
      const base = {
        indicadorId: indicador.id,
        indicador: indicador.nome,
        unidadeMedida: indicador.unidadeMedida,
        direcao: indicador.direcao,
        subPassos,
        meta: aplicabilidade.meta,
        peso: aplicabilidade.peso,
        pesoNormalizado,
      }

      if (valor === null) {
        if (regra.semLancamento === 'usa_meta') {
          const { comTeto } = calcularAtingimento(
            aplicabilidade.meta,
            aplicabilidade.meta,
            indicador.direcao,
            regra.tetoAtingimento,
          )
          const faixa = faixaDoAtingimento(comTeto, regra)
          const pontos = faixa?.pontos ?? 0
          const aviso = `Sem lançamento: a regra manda considerar a meta cumprida para "${indicador.nome}".`
          avisos.push(aviso)
          return {
            ...base,
            valor: null,
            atingimentoBruto: comTeto,
            atingimento: comTeto,
            aplicouTeto: false,
            faixa: faixa ? descreverFaixa(faixa.de, faixa.ate) : 'sem faixa correspondente',
            pontos,
            contribuicao: arredondar(pontos * aplicabilidade.peso, casas, modo),
            aviso,
          }
        }

        const aviso = `Indicador "${indicador.nome}" sem subindicador apurado neste ciclo: pontuação zerada.`
        avisos.push(aviso)
        return {
          ...base,
          valor: null,
          atingimentoBruto: null,
          atingimento: null,
          aplicouTeto: false,
          faixa: 'sem lançamento',
          pontos: 0,
          contribuicao: 0,
          aviso,
        }
      }

      if (avisoComposicao) avisos.push(`${indicador.nome}: ${avisoComposicao}`)

      const { bruto, comTeto, aplicouTeto } = calcularAtingimento(
        valor,
        aplicabilidade.meta,
        indicador.direcao,
        regra.tetoAtingimento,
      )
      const faixa = faixaDoAtingimento(comTeto, regra)
      const pontos = faixa?.pontos ?? 0

      const passo: PassoMemoria = {
        ...base,
        valor,
        atingimentoBruto: arredondar(bruto, 4, modo),
        atingimento: arredondar(comTeto, 4, modo),
        aplicouTeto,
        faixa: faixa ? descreverFaixa(faixa.de, faixa.ate) : 'sem faixa correspondente',
        pontos,
        contribuicao: arredondar(pontos * aplicabilidade.peso, casas, modo),
        ...(avisoComposicao ? { aviso: avisoComposicao } : {}),
        ...(faixa
          ? {}
          : {
              aviso: `Atingimento de ${Math.round(comTeto * 100)}% não caiu em nenhuma faixa da regra ${regra.id}.`,
            }),
      }

      if (!faixa && passo.aviso) avisos.push(passo.aviso)
      return passo
    },
  )

  const somaContribuicoes = arredondar(
    passos.reduce((soma, passo) => soma + passo.contribuicao, 0),
    casas,
    modo,
  )

  const score = arredondar(
    (somaContribuicoes / (somaPesos * regra.pontuacaoMaxima)) * 100,
    casas,
    modo,
  )
  const scoreLimitado = Math.min(Math.max(score, 0), 100)

  if (score !== scoreLimitado) {
    avisos.push(`Score calculado (${score}) foi limitado à faixa de 0 a 100.`)
  }

  return {
    unidadeId: unidade.id,
    cicloId,
    score: scoreLimitado,
    faixa: faixaDoScore(scoreLimitado, regra),
    memoria: {
      regraId: regra.id,
      versaoRegra: regra.versao,
      passos,
      somaPesos: arredondar(somaPesos, 4, modo),
      somaContribuicoes,
      pontuacaoMaxima: regra.pontuacaoMaxima,
      score: scoreLimitado,
      formula:
        'indicador = média dos subindicadores apurados; score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100',
    },
    avisos,
  }
}

export interface EntradaCalculoDistrital {
  distritoId: string
  cicloId: string
  /** As avaliações das unidades do distrito. Quem filtra por distrito é quem chama. */
  avaliacoesDasUnidades: readonly Avaliacao[]
  regra: RegraDePontuacao
}

/**
 * A nota do gerente distrital: média simples dos scores das unidades do
 * distrito naquele ciclo.
 *
 * SUPOSIÇÃO declarada (a validar com a planilha prometida): a agregação real
 * pode ponderar por porte ou tipo de unidade. Se vier diferente, vira campo da
 * regra versionada — não muda a forma desta função.
 */
export function calcularAvaliacaoDistrital({
  distritoId,
  cicloId,
  avaliacoesDasUnidades,
  regra,
}: EntradaCalculoDistrital): AvaliacaoDistrital {
  const { casas, modo } = regra.arredondamento
  const doCiclo = avaliacoesDasUnidades.filter((a) => a.cicloId === cicloId)

  if (doCiclo.length === 0) {
    return {
      distritoId,
      cicloId,
      score: 0,
      faixa: faixaDoScore(0, regra),
      porUnidade: [],
      avisos: ['Nenhuma unidade avaliada neste distrito neste ciclo.'],
    }
  }

  const porUnidade = doCiclo.map((a) => ({ unidadeId: a.unidadeId, score: a.score }))
  const score = arredondar(
    porUnidade.reduce((s, u) => s + u.score, 0) / porUnidade.length,
    casas,
    modo,
  )

  return {
    distritoId,
    cicloId,
    score,
    faixa: faixaDoScore(score, regra),
    porUnidade,
    avisos: [],
  }
}

/** Regra vigente para uma competência `YYYY-MM`. */
export function regraVigente(
  competencia: string,
  regras: readonly RegraDePontuacao[],
): RegraDePontuacao | null {
  const candidatas = regras.filter(
    (regra) =>
      regra.vigenteDe <= competencia &&
      (regra.vigenteAte === null || competencia <= regra.vigenteAte),
  )
  if (candidatas.length === 0) return null
  // Empate entre versões: vence a mais nova.
  return candidatas.reduce((maior, atual) => (atual.versao > maior.versao ? atual : maior))
}
