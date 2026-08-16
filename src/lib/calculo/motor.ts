import type {
  Avaliacao,
  FaixaGratificacao,
  Gestor,
  Indicador,
  Lancamento,
  ModoArredondamento,
  PassoMemoria,
  RegraDePontuacao,
} from './tipos'

/**
 * Motor de cálculo da gratificação (§8.3).
 *
 * FUNÇÃO PURA: sem I/O, sem relógio, sem aleatoriedade. Os mesmos insumos
 * devolvem sempre o mesmo resultado — é o que permite recalcular um ciclo
 * homologado meses depois e obter exatamente o mesmo número.
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
  direcao: Indicador['direcao'],
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

export interface EntradaCalculo {
  gestor: Gestor
  cicloId: string
  indicadores: readonly Indicador[]
  lancamentos: readonly Lancamento[]
  regra: RegraDePontuacao
}

/**
 * Calcula a avaliação de um gestor num ciclo.
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
  gestor,
  cicloId,
  indicadores,
  lancamentos,
  regra,
}: EntradaCalculo): Avaliacao {
  const { casas, modo } = regra.arredondamento
  const avisos: string[] = []

  const doGestor = indicadores.filter((indicador) => indicador.areaId === gestor.areaId)
  const lancamentosDoCiclo = lancamentos.filter((l) => l.cicloId === cicloId)

  const considerados = doGestor.filter((indicador) => {
    if (regra.semLancamento !== 'ignora') return true
    return lancamentosDoCiclo.some((l) => l.indicadorId === indicador.id)
  })

  const somaPesos = considerados.reduce((soma, indicador) => soma + indicador.peso, 0)

  if (somaPesos <= 0) {
    return {
      gestorId: gestor.id,
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
        formula: 'Sem indicadores com peso: score 0.',
      },
      avisos: ['Nenhum indicador com peso positivo para esta área neste ciclo.'],
    }
  }

  const passos: PassoMemoria[] = considerados.map((indicador) => {
    const lancamento = lancamentosDoCiclo.find((l) => l.indicadorId === indicador.id)
    const pesoNormalizado = arredondar(indicador.peso / somaPesos, 6, 'meio_para_cima')

    if (!lancamento) {
      if (regra.semLancamento === 'usa_meta') {
        const { comTeto } = calcularAtingimento(
          indicador.meta,
          indicador.meta,
          indicador.direcao,
          regra.tetoAtingimento,
        )
        const faixa = faixaDoAtingimento(comTeto, regra)
        const pontos = faixa?.pontos ?? 0
        const aviso = `Sem lançamento: a regra manda considerar a meta cumprida para "${indicador.nome}".`
        avisos.push(aviso)
        return {
          indicadorId: indicador.id,
          indicador: indicador.nome,
          unidade: indicador.unidade,
          direcao: indicador.direcao,
          valor: null,
          meta: indicador.meta,
          atingimentoBruto: comTeto,
          atingimento: comTeto,
          aplicouTeto: false,
          faixa: faixa ? descreverFaixa(faixa.de, faixa.ate) : 'sem faixa correspondente',
          pontos,
          peso: indicador.peso,
          pesoNormalizado,
          contribuicao: arredondar(pontos * indicador.peso, casas, modo),
          aviso,
        }
      }

      const aviso = `Indicador "${indicador.nome}" sem lançamento neste ciclo: pontuação zerada.`
      avisos.push(aviso)
      return {
        indicadorId: indicador.id,
        indicador: indicador.nome,
        unidade: indicador.unidade,
        direcao: indicador.direcao,
        valor: null,
        meta: indicador.meta,
        atingimentoBruto: null,
        atingimento: null,
        aplicouTeto: false,
        faixa: 'sem lançamento',
        pontos: 0,
        peso: indicador.peso,
        pesoNormalizado,
        contribuicao: 0,
        aviso,
      }
    }

    const { bruto, comTeto, aplicouTeto } = calcularAtingimento(
      lancamento.valor,
      indicador.meta,
      indicador.direcao,
      regra.tetoAtingimento,
    )
    const faixa = faixaDoAtingimento(comTeto, regra)
    const pontos = faixa?.pontos ?? 0

    const passo: PassoMemoria = {
      indicadorId: indicador.id,
      indicador: indicador.nome,
      unidade: indicador.unidade,
      direcao: indicador.direcao,
      valor: lancamento.valor,
      meta: indicador.meta,
      atingimentoBruto: arredondar(bruto, 4, modo),
      atingimento: arredondar(comTeto, 4, modo),
      aplicouTeto,
      faixa: faixa ? descreverFaixa(faixa.de, faixa.ate) : 'sem faixa correspondente',
      pontos,
      peso: indicador.peso,
      pesoNormalizado,
      contribuicao: arredondar(pontos * indicador.peso, casas, modo),
      ...(faixa
        ? {}
        : {
            aviso: `Atingimento de ${Math.round(comTeto * 100)}% não caiu em nenhuma faixa da regra ${regra.id}.`,
          }),
    }

    if (!faixa && passo.aviso) avisos.push(passo.aviso)
    return passo
  })

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
    gestorId: gestor.id,
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
      formula: 'score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100',
    },
    avisos,
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
