import type {
  Aplicabilidade,
  Degrau,
  Avaliacao,
  AvaliacaoDistrital,
  Direcao,
  FaixaGratificacao,
  GraduacaoIndicador,
  GraduacaoSubindicador,
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
      // Aproxima-se do zero no empate, para os dois sinais.
      return (Math.sign(escalado) * -Math.round(-Math.abs(escalado))) / fator
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

  // `faixa_ideal` cai no ramo de `maior_melhor` de propósito: esta função é do
  // método de ATINGIMENTO, que não sabe exprimir um teto. Quem usa faixa ideal
  // usa o método de notas, onde o teto é um degrau. Cair aqui é sinal de regra
  // mal montada, e o aviso do passo diz isso.
  if (direcao !== 'menor_melhor') {
    bruto = meta === 0 ? (valor > 0 ? teto : 1) : valor / meta
  } else {
    bruto = valor === 0 ? teto : meta / valor
  }

  if (!Number.isFinite(bruto)) bruto = teto
  if (bruto < 0) bruto = 0

  const comTeto = Math.min(bruto, teto)
  return { bruto, comTeto, aplicouTeto: comTeto < bruto }
}

/**
 * A nota do primeiro degrau que contém o valor, ou `null` se nenhum contém.
 *
 * A ORDEM DA LISTA MANDA, e é isso que deixa a faixa ideal caber sem campo
 * novo: basta pôr o degrau de nota cheia entre os dois de nota menor. Buraco na
 * régua devolve `null` em vez de zero, porque "não previsto" e "previsto e vale
 * zero" são coisas diferentes na hora de contestar uma nota.
 */
export function notaDoDegrau(valor: number, degraus: readonly Degrau[]): number | null {
  const degrau = degraus.find(
    (d) => (d.de === null || valor >= d.de) && (d.ate === null || valor < d.ate),
  )
  return degrau ? degrau.nota : null
}

/** A régua de um subindicador na regra, quando ela existe. */
export function graduacaoDoSubindicador(
  regra: RegraDePontuacao,
  subindicadorId: string,
): GraduacaoSubindicador | null {
  return regra.graduacoes?.find((g) => g.subindicadorId === subindicadorId) ?? null
}

/** A segunda régua de um indicador na regra, quando ela existe. */
export function segundaGraduacaoDoIndicador(
  regra: RegraDePontuacao,
  indicadorId: string,
): GraduacaoIndicador | null {
  return regra.segundaGraduacao?.find((g) => g.indicadorId === indicadorId) ?? null
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
  modo: ModoArredondamento = 'meio_para_cima',
  /**
   * Rejeitar razão com numerador maior que o denominador?
   *
   * Vem da REGRA, e o padrão é não rejeitar, embora numerador maior que
   * denominador seja sempre um lançamento malformado. O motivo não é técnico: é
   * a promessa de que um mês já publicado devolve para sempre o mesmo número.
   * As regras v1 e v2 fecharam meses sem esta checagem; ligá-la para todo mundo
   * mudaria resultado homologado, que é exatamente o que este produto existe
   * para impedir. A checagem entra com a v3, junto com o resto do método novo.
   */
  rejeitarRazaoInvalida = false,
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
  // A planilha do cliente marca esta célula como ERRO, e está certa: numerador
  // maior que denominador é lançamento malformado, não desempenho acima de
  // 100%. Sem a checagem, o erro de digitação vira nota cheia em silêncio.
  if (rejeitarRazaoInvalida && numerador > denominador) {
    return {
      ...base,
      numerador,
      denominador,
      valor: null,
      aviso: 'numerador maior que o denominador: lançamento inconsistente',
    }
  }

  return {
    ...base,
    numerador,
    denominador,
    valor: arredondar((numerador / denominador) * 100, 4, modo),
  }
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
  /** Só no método de notas: média das notas dos subindicadores apurados. */
  mediaDasNotas: number | null
  /** Só no método de notas: a nota depois da segunda gradação. */
  nota: number | null
  avisoComposicao: string | null
  /** O indicador tem resultado para entrar na conta? */
  temResultado: boolean
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
  const porNotas = regra.metodo === 'notas'
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
      apurarSubindicador(sub, lancamentoVigenteDoSub(lancamentosDaUnidade, sub.id), modo, porNotas),
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

    if (!porNotas) {
      return [
        {
          indicador,
          aplicabilidade,
          subPassos,
          valor,
          mediaDasNotas: null,
          nota: null,
          avisoComposicao,
          temResultado: valor !== null,
        },
      ]
    }

    // MÉTODO DE NOTAS. Cada subindicador vira nota pela régua da regra ANTES de
    // qualquer média. É a diferença que a planilha do cliente revelou: graduar
    // no fim, sobre a média dos valores, dá número diferente de graduar cada um
    // e tirar a média das notas, e quem está perto de um degrau sente.
    const comNota = subPassos.map((passo) => {
      if (passo.valor === null) return passo
      const graduacao = graduacaoDoSubindicador(regra, passo.subindicadorId)
      if (!graduacao) {
        return {
          ...passo,
          nota: null,
          aviso: `Sem régua de notas para "${passo.subindicador}" na regra ${regra.id}.`,
        }
      }
      const nota = notaDoDegrau(passo.valor, graduacao.degraus)
      return nota === null
        ? {
            ...passo,
            nota: null,
            aviso: `Valor ${passo.valor} não caiu em nenhum degrau da régua de "${passo.subindicador}".`,
          }
        : { ...passo, nota }
    })

    const comNotaApurada = comNota.filter((p) => p.nota !== null && p.nota !== undefined)
    const mediaDasNotas =
      comNotaApurada.length === 0
        ? null
        : arredondar(
            comNotaApurada.reduce((soma, p) => soma + (p.nota ?? 0), 0) / comNotaApurada.length,
            4,
            modo,
          )

    // Segunda gradação: a média volta para uma régua antes de virar a nota do
    // indicador. Sem entrada na regra, a média JÁ É a nota.
    const segunda = segundaGraduacaoDoIndicador(regra, indicador.id)
    const nota =
      mediaDasNotas === null
        ? null
        : segunda
          ? notaDoDegrau(mediaDasNotas, segunda.degraus)
          : mediaDasNotas

    // OS DEFEITOS DE RÉGUA SOBEM AQUI, não lá embaixo. Subindicador sem régua,
    // ou com valor fora de todos os degraus, deixa o indicador sem nota; com
    // `semLancamento: 'ignora'` ele é filtrado antes do passo, e o aviso morreria
    // junto. Um número que some da conta sem uma linha dizendo por quê é o pior
    // caso possível num sistema que existe para ser conferido.
    for (const passo of comNota) {
      if (passo.nota === null && passo.aviso) avisos.push(`${indicador.nome}: ${passo.aviso}`)
    }

    const avisoNotas =
      mediaDasNotas !== null && nota === null
        ? `Média ${mediaDasNotas} não caiu em nenhum degrau da segunda régua de "${indicador.nome}".`
        : comNotaApurada.length > 0 && comNotaApurada.length < subPassos.length
          ? `${subPassos.length - comNotaApurada.length} de ${subPassos.length} subindicadores sem nota: a média usou os que existem.`
          : avisoComposicao

    return [
      {
        indicador,
        aplicabilidade,
        subPassos: comNota,
        valor,
        mediaDasNotas,
        nota,
        avisoComposicao: avisoNotas,
        temResultado: nota !== null,
      },
    ]
  })

  const considerados =
    regra.semLancamento === 'ignora' ? composicoes.filter((c) => c.temResultado) : composicoes

  const somaPesos = considerados.reduce((soma, c) => soma + c.aplicabilidade.peso, 0)

  if (somaPesos <= 0) {
    // Dois estados diferentes merecem explicações diferentes: um tipo sem
    // aplicabilidade na regra NÃO é uma unidade que deixou de lançar.
    const ignorados = composicoes.filter((c) => !c.temResultado)
    const semAplicaveis = composicoes.length === 0
    return {
      unidadeId: unidade.id,
      cicloId,
      score: 0,
      faixa: faixaDoScore(0, regra),
      memoria: {
        regraId: regra.id,
        versaoRegra: regra.versao,
        metodo: porNotas ? 'notas' : 'atingimento',
        passos: [],
        somaPesos: 0,
        somaContribuicoes: 0,
        pontuacaoMaxima: regra.pontuacaoMaxima,
        score: 0,
        formula: semAplicaveis
          ? 'Sem indicadores aplicáveis com peso: score 0.'
          : 'Sem lançamento em nenhum indicador aplicável, e a regra manda ignorá-los: score 0.',
      },
      // Os avisos já acumulados VÃO JUNTO. Sem isso, a unidade que perdeu todos
      // os indicadores por defeito de régua receberia só "nenhum teve
      // lançamento", que é verdade e esconde a causa.
      avisos: semAplicaveis
        ? [
            ...avisos,
            'Nenhum indicador aplicável com peso positivo para o tipo desta unidade neste ciclo.',
          ]
        : [
            ...avisos,
            `Nenhum dos ${ignorados.length} indicadores aplicáveis teve lançamento neste ciclo; a regra manda ignorá-los. Ignorados: ${ignorados
              .map((c) => c.indicador.nome)
              .join('; ')}.`,
          ],
    }
  }

  const passos: PassoMemoria[] = considerados.map(
    ({ indicador, aplicabilidade, subPassos, valor, mediaDasNotas, nota, avisoComposicao }) => {
      const pesoNormalizado = arredondar(aplicabilidade.peso / somaPesos, 6, modo)
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

      if (porNotas) {
        if (nota === null) {
          const aviso = `Indicador "${indicador.nome}" sem nota apurada neste ciclo: pontuação zerada.`
          avisos.push(aviso)
          return {
            ...base,
            valor,
            mediaDasNotas,
            nota: null,
            atingimentoBruto: null,
            atingimento: null,
            aplicouTeto: false,
            faixa: 'sem nota',
            pontos: 0,
            contribuicao: 0,
            aviso,
          }
        }

        if (avisoComposicao) avisos.push(`${indicador.nome}: ${avisoComposicao}`)

        // A NOTA JÁ É O PONTO. Não há atingimento nem teto aqui: a régua de
        // degraus é que diz quanto o valor vale, e ela pode subir, descer ou
        // ter um platô no meio. `pontuacaoMaxima` da regra é 1, então a mesma
        // divisão do fim continua valendo sem exceção.
        return {
          ...base,
          valor,
          mediaDasNotas,
          nota,
          atingimentoBruto: null,
          atingimento: null,
          aplicouTeto: false,
          faixa: segundaGraduacaoDoIndicador(regra, indicador.id)
            ? 'nota da régua, com segunda gradação sobre a média'
            : 'nota da régua de degraus',
          pontos: nota,
          contribuicao: arredondar(nota * aplicabilidade.peso, casas, modo),
          ...(avisoComposicao ? { aviso: avisoComposicao } : {}),
        }
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
      // A faixa é escolhida sobre o MESMO atingimento que a memória grava e
      // exibe. Escolher sobre o valor bruto e mostrar o arredondado faria a
      // memória se contradizer na fronteira de faixa, que é exatamente o ponto
      // sensível de uma gratificação.
      const atingimento = arredondar(comTeto, 4, modo)
      const faixa = faixaDoAtingimento(atingimento, regra)
      const pontos = faixa?.pontos ?? 0

      const passo: PassoMemoria = {
        ...base,
        valor,
        atingimentoBruto: arredondar(bruto, 4, modo),
        atingimento,
        aplicouTeto,
        faixa: faixa ? descreverFaixa(faixa.de, faixa.ate) : 'sem faixa correspondente',
        pontos,
        contribuicao: arredondar(pontos * aplicabilidade.peso, casas, modo),
        ...(avisoComposicao ? { aviso: avisoComposicao } : {}),
        ...(faixa
          ? {}
          : {
              aviso: `Atingimento de ${Math.round(atingimento * 100)}% não caiu em nenhuma faixa da regra ${regra.id}.`,
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
      metodo: porNotas ? 'notas' : 'atingimento',
      passos,
      somaPesos: arredondar(somaPesos, 4, modo),
      somaContribuicoes,
      pontuacaoMaxima: regra.pontuacaoMaxima,
      score: scoreLimitado,
      formula: porNotas
        ? 'subindicador → nota pela régua; indicador = média das notas (com segunda gradação quando há); score = (Σ nota × peso) ÷ (Σ peso dos que têm nota) × 100'
        : 'indicador = média dos subindicadores apurados; score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100',
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
