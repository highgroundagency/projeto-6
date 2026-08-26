import { describe, expect, it } from 'vitest'
import {
  aplicabilidadeDe,
  apurarSubindicador,
  arredondar,
  calcularAtingimento,
  calcularAvaliacao,
  calcularAvaliacaoDistrital,
  faixaDoAtingimento,
  faixaDoScore,
  regraVigente,
} from './motor'
import type {
  Aplicabilidade,
  Avaliacao,
  Indicador,
  Lancamento,
  RegraDePontuacao,
  Subindicador,
  Unidade,
} from './tipos'

const REGRA_V1: RegraDePontuacao = {
  id: 'regra-2026-v1',
  versao: 1,
  descricao: 'Faixas da portaria vigente',
  vigenteDe: '2026-01',
  vigenteAte: '2026-06',
  faixas: [
    { de: 0, ate: 0.7, pontos: 0 },
    { de: 0.7, ate: 0.85, pontos: 4 },
    { de: 0.85, ate: 0.95, pontos: 7 },
    { de: 0.95, ate: 1, pontos: 9 },
    { de: 1, ate: null, pontos: 10 },
  ],
  pontuacaoMaxima: 10,
  faixasGratificacao: [
    { de: 0, ate: 50, rotulo: 'sem gratificação', percentual: 0 },
    { de: 50, ate: 70, rotulo: 'parcial', percentual: 50 },
    { de: 70, ate: 90, rotulo: 'integral', percentual: 80 },
    { de: 90, ate: null, rotulo: 'integral plena', percentual: 100 },
  ],
  aplicabilidades: [],
  arredondamento: { casas: 2, modo: 'meio_para_cima' },
  tetoAtingimento: 1.5,
  semLancamento: 'zera_com_aviso',
}

/** Versão nova: mesma estrutura, faixas mais exigentes. */
const REGRA_V2: RegraDePontuacao = {
  ...REGRA_V1,
  id: 'regra-2026-v2',
  versao: 2,
  descricao: 'Faixas revisadas',
  vigenteDe: '2026-07',
  vigenteAte: null,
  faixas: [
    { de: 0, ate: 0.8, pontos: 0 },
    { de: 0.8, ate: 0.9, pontos: 4 },
    { de: 0.9, ate: 1, pontos: 8 },
    { de: 1, ate: null, pontos: 10 },
  ],
}

const USF: Unidade = { id: 'u1', nome: 'USF Sintética 1', distritoId: 'd1', tipoId: 'usf' }
const CAPS: Unidade = { id: 'u2', nome: 'CAPS Sintético 1', distritoId: 'd1', tipoId: 'caps' }

function indicador(parcial: Partial<Indicador> & Pick<Indicador, 'id'>): Indicador {
  return {
    nome: `Indicador ${parcial.id}`,
    unidadeMedida: '%',
    direcao: 'maior_melhor',
    fonte: 'sintético',
    periodicidade: 'mensal',
    ...parcial,
  }
}

function sub(
  id: string,
  indicadorId: string,
  tipo: Subindicador['tipo'] = 'indice',
): Subindicador {
  return { id, indicadorId, nome: `Subindicador ${id}`, tipo }
}

function aplic(
  indicadorId: string,
  parcial: Partial<Aplicabilidade> = {},
): Aplicabilidade {
  return { tipoUnidadeId: 'usf', indicadorId, meta: 100, peso: 1, ...parcial }
}

function lancIndice(
  subindicadorId: string,
  valor: number,
  extra: Partial<Lancamento> = {},
): Lancamento {
  return {
    id: `l-${subindicadorId}`,
    subindicadorId,
    unidadeId: 'u1',
    cicloId: 'c1',
    valor,
    numerador: null,
    denominador: null,
    evidencia: 'planilha sintética',
    autor: 'seed',
    registradoEm: '2026-02-01T12:00:00.000Z',
    status: 'validado',
    ...extra,
  }
}

function lancRazao(
  subindicadorId: string,
  numerador: number,
  denominador: number,
  extra: Partial<Lancamento> = {},
): Lancamento {
  return {
    ...lancIndice(subindicadorId, 0, extra),
    valor: null,
    numerador,
    denominador,
  }
}

function avaliar(
  indicadores: Indicador[],
  subindicadores: Subindicador[],
  lancamentos: Lancamento[],
  regra: RegraDePontuacao = REGRA_V1,
  unidade: Unidade = USF,
) {
  return calcularAvaliacao({
    unidade,
    cicloId: 'c1',
    indicadores,
    subindicadores,
    lancamentos,
    regra,
  })
}

/** Um indicador com um subindicador 'indice' de mesmo nome: o caso simples. */
function cenarioSimples(ids: string[], pesos?: number[]) {
  const indicadores = ids.map((id) => indicador({ id }))
  const subindicadores = ids.map((id) => sub(`s-${id}`, id))
  const aplicabilidades = ids.map((id, i) => aplic(id, { peso: pesos?.[i] ?? 1 }))
  return {
    indicadores,
    subindicadores,
    regra: { ...REGRA_V1, aplicabilidades },
    lancar: (valores: number[]) => ids.map((id, i) => lancIndice(`s-${id}`, valores[i])),
  }
}

describe('arredondar', () => {
  it('corrige o erro clássico de ponto flutuante', () => {
    // 2.675 * 100 = 267.49999999999997 em IEEE 754.
    expect(arredondar(2.675, 2)).toBe(2.68)
    expect(arredondar(1.005, 2)).toBe(1.01)
  })

  it('meio para cima afasta do zero', () => {
    expect(arredondar(0.5, 0, 'meio_para_cima')).toBe(1)
    expect(arredondar(-0.5, 0, 'meio_para_cima')).toBe(-1)
  })

  it('meio para baixo aproxima do zero no empate, nos dois sinais', () => {
    expect(arredondar(0.5, 0, 'meio_para_baixo')).toBe(0)
    expect(arredondar(1.5, 0, 'meio_para_baixo')).toBe(1)
    expect(arredondar(-0.5, 0, 'meio_para_baixo')).toBe(-0)
    expect(arredondar(-1.5, 0, 'meio_para_baixo')).toBe(-1)
  })

  it('truncar corta sem olhar o resto', () => {
    expect(arredondar(9.999, 2, 'truncar')).toBe(9.99)
    expect(arredondar(9.991, 2, 'truncar')).toBe(9.99)
  })

  it('não quebra com valor não finito', () => {
    expect(arredondar(Number.POSITIVE_INFINITY, 2)).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('calcularAtingimento', () => {
  it('maior_melhor divide valor pela meta', () => {
    expect(calcularAtingimento(90, 100, 'maior_melhor', 1.5).comTeto).toBeCloseTo(0.9)
  })

  it('menor_melhor inverte a razão', () => {
    // Meta de 10 dias; entregou em 8: superou a meta.
    expect(calcularAtingimento(8, 10, 'menor_melhor', 1.5).comTeto).toBeCloseTo(1.25)
    // Entregou em 20: metade do esperado.
    expect(calcularAtingimento(20, 10, 'menor_melhor', 1.5).comTeto).toBeCloseTo(0.5)
  })

  it('menor_melhor com valor zero é o melhor resultado possível, sem dividir por zero', () => {
    const resultado = calcularAtingimento(0, 10, 'menor_melhor', 1.5)
    expect(resultado.comTeto).toBe(1.5)
    expect(Number.isFinite(resultado.comTeto)).toBe(true)
  })

  it('maior_melhor com meta zero não vira #DIV/0!', () => {
    expect(calcularAtingimento(5, 0, 'maior_melhor', 1.5).comTeto).toBe(1.5)
    expect(calcularAtingimento(0, 0, 'maior_melhor', 1.5).comTeto).toBe(1)
  })

  it('aplica o teto e sinaliza que aplicou', () => {
    const resultado = calcularAtingimento(300, 100, 'maior_melhor', 1.5)
    expect(resultado.bruto).toBe(3)
    expect(resultado.comTeto).toBe(1.5)
    expect(resultado.aplicouTeto).toBe(true)
  })

  it('não deixa atingimento negativo', () => {
    expect(calcularAtingimento(-10, 100, 'maior_melhor', 1.5).comTeto).toBe(0)
  })
})

describe('faixas', () => {
  it('a fronteira pertence à faixa de cima', () => {
    expect(faixaDoAtingimento(0.85, REGRA_V1)?.pontos).toBe(7)
    expect(faixaDoAtingimento(0.8499, REGRA_V1)?.pontos).toBe(4)
    expect(faixaDoAtingimento(0.95, REGRA_V1)?.pontos).toBe(9)
    expect(faixaDoAtingimento(1, REGRA_V1)?.pontos).toBe(10)
    expect(faixaDoAtingimento(0.9999, REGRA_V1)?.pontos).toBe(9)
  })

  it('cobre do zero ao infinito sem buraco', () => {
    for (const atingimento of [0, 0.1, 0.7, 0.84, 0.85, 0.94, 0.95, 0.99, 1, 1.5, 99]) {
      expect(
        faixaDoAtingimento(atingimento, REGRA_V1),
        `sem faixa para ${atingimento}`,
      ).not.toBeNull()
    }
  })

  it('faixa de gratificação segue a mesma regra de fronteira', () => {
    expect(faixaDoScore(70, REGRA_V1)?.rotulo).toBe('integral')
    expect(faixaDoScore(69.99, REGRA_V1)?.rotulo).toBe('parcial')
    expect(faixaDoScore(100, REGRA_V1)?.rotulo).toBe('integral plena')
    expect(faixaDoScore(0, REGRA_V1)?.rotulo).toBe('sem gratificação')
  })
})

describe('apurarSubindicador', () => {
  const indice = sub('s1', 'i1', 'indice')
  const razao = sub('s2', 'i1', 'razao')

  it('índice devolve o valor como veio', () => {
    expect(apurarSubindicador(indice, lancIndice('s1', 87)).valor).toBe(87)
  })

  it('razão vira proporção em percentual', () => {
    const passo = apurarSubindicador(razao, lancRazao('s2', 45, 50))
    expect(passo.valor).toBe(90)
    expect(passo.numerador).toBe(45)
    expect(passo.denominador).toBe(50)
  })

  it('denominador zero não vira #DIV/0!: fica sem valor, com aviso', () => {
    const passo = apurarSubindicador(razao, lancRazao('s2', 45, 0))
    expect(passo.valor).toBeNull()
    expect(passo.aviso).toContain('denominador zero')
  })

  it('sem lançamento fica sem valor, com aviso', () => {
    const passo = apurarSubindicador(indice, undefined)
    expect(passo.valor).toBeNull()
    expect(passo.aviso).toBe('sem lançamento')
  })
})

describe('calcularAvaliacao', () => {
  it('desempenho perfeito dá exatamente 100, sem sobra de arredondamento', () => {
    const { indicadores, subindicadores, regra, lancar } = cenarioSimples(['i1', 'i2', 'i3'])
    const avaliacao = avaliar(indicadores, subindicadores, lancar([100, 100, 100]), regra)
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.faixa?.rotulo).toBe('integral plena')
  })

  it('a memória de cálculo fecha na conta que ela mesma mostra', () => {
    const { indicadores, subindicadores, regra, lancar } = cenarioSimples(
      ['i1', 'i2', 'i3'],
      [0.3, 0.3, 0.4],
    )
    // 100% → 10 pontos; 90% → 7 pontos; 80% → 4 pontos.
    const avaliacao = avaliar(indicadores, subindicadores, lancar([100, 90, 80]), regra)

    const soma = avaliacao.memoria.passos.reduce((s, p) => s + p.contribuicao, 0)
    expect(arredondar(soma, 2)).toBe(avaliacao.memoria.somaContribuicoes)
    expect(avaliacao.memoria.somaContribuicoes).toBe(6.7)
    expect(avaliacao.score).toBe(67)
  })

  it('compõe o indicador pela média simples dos subindicadores', () => {
    const indicadores = [indicador({ id: 'i1' })]
    const subindicadores = [sub('s1', 'i1'), sub('s2', 'i1')]
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1')] }
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [lancIndice('s1', 80), lancIndice('s2', 120)],
      regra,
    )

    const passo = avaliacao.memoria.passos[0]
    expect(passo.valor).toBe(100)
    expect(passo.subPassos.map((p) => p.valor)).toEqual([80, 120])
    expect(passo.pontos).toBe(10)
    expect(avaliacao.score).toBe(100)
  })

  it('mistura índice e razão na mesma composição', () => {
    const indicadores = [indicador({ id: 'i1' })]
    const subindicadores = [sub('s1', 'i1', 'indice'), sub('s2', 'i1', 'razao')]
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1')] }
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [lancIndice('s1', 100), lancRazao('s2', 40, 50)],
      regra,
    )

    // (100 + 80) / 2 = 90 → faixa 85–95 → 7 pontos.
    expect(avaliacao.memoria.passos[0].valor).toBe(90)
    expect(avaliacao.memoria.passos[0].pontos).toBe(7)
  })

  it('subindicador com denominador zero sai da média, com aviso na memória', () => {
    const indicadores = [indicador({ id: 'i1' })]
    const subindicadores = [sub('s1', 'i1', 'indice'), sub('s2', 'i1', 'razao')]
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1')] }
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [lancIndice('s1', 100), lancRazao('s2', 45, 0)],
      regra,
    )

    const passo = avaliacao.memoria.passos[0]
    expect(passo.valor).toBe(100)
    expect(passo.subPassos.find((p) => p.subindicadorId === 's2')?.aviso).toContain(
      'denominador zero',
    )
    expect(avaliacao.avisos.join(' ')).toContain('subindicadores sem valor apurado')
  })

  it('indicador cujo único subindicador falhou é tratado como sem lançamento', () => {
    const indicadores = [indicador({ id: 'i1' })]
    const subindicadores = [sub('s1', 'i1', 'razao')]
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1')] }
    const avaliacao = avaliar(indicadores, subindicadores, [lancRazao('s1', 45, 0)], regra)

    expect(avaliacao.score).toBe(0)
    expect(avaliacao.memoria.passos[0].faixa).toBe('sem lançamento')
    expect(avaliacao.memoria.passos[0].subPassos[0].aviso).toContain('denominador zero')
  })

  it('indicador sem aplicabilidade para o tipo fica fora da conta e da memória', () => {
    const indicadores = [indicador({ id: 'i1' }), indicador({ id: 'i2' })]
    const subindicadores = [sub('s1', 'i1'), sub('s2', 'i2')]
    // Só i1 vale para USF; i2 não existe para esse tipo.
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1')] }
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [lancIndice('s1', 100), lancIndice('s2', 10)],
      regra,
    )

    expect(avaliacao.memoria.passos.map((p) => p.indicadorId)).toEqual(['i1'])
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.avisos).toEqual([])
  })

  it('meta e peso vêm da aplicabilidade do TIPO da unidade', () => {
    const indicadores = [indicador({ id: 'i1' })]
    const subindicadores = [sub('s1', 'i1')]
    const regra = {
      ...REGRA_V1,
      aplicabilidades: [
        aplic('i1', { tipoUnidadeId: 'usf', meta: 100 }),
        aplic('i1', { tipoUnidadeId: 'caps', meta: 80 }),
      ],
    }
    const lancamentosUsf = [lancIndice('s1', 80)]
    const lancamentosCaps = [lancIndice('s1', 80, { unidadeId: 'u2' })]

    // O MESMO valor 80: na USF é 80% da meta (4 pontos); no CAPS é 100% (10).
    const naUsf = avaliar(indicadores, subindicadores, lancamentosUsf, regra, USF)
    const noCaps = avaliar(indicadores, subindicadores, lancamentosCaps, regra, CAPS)
    expect(naUsf.memoria.passos[0].pontos).toBe(4)
    expect(noCaps.memoria.passos[0].pontos).toBe(10)
    expect(naUsf.memoria.passos[0].meta).toBe(100)
    expect(noCaps.memoria.passos[0].meta).toBe(80)
  })

  it('a correção mais recente do mesmo subindicador vence', () => {
    const { indicadores, subindicadores, regra } = cenarioSimples(['i1'])
    const original = lancIndice('s-i1', 10, {
      id: 'l-a',
      registradoEm: '2026-02-01T10:00:00.000Z',
    })
    const correcao = lancIndice('s-i1', 100, {
      id: 'l-b',
      registradoEm: '2026-02-02T10:00:00.000Z',
    })
    const avaliacao = avaliar(indicadores, subindicadores, [original, correcao], regra)
    expect(avaliacao.memoria.passos[0].valor).toBe(100)
    expect(avaliacao.score).toBe(100)
  })

  it('ignora lançamento de outra unidade e de outro ciclo', () => {
    const { indicadores, subindicadores, regra } = cenarioSimples(['i1'])
    const deOutraUnidade = lancIndice('s-i1', 100, { unidadeId: 'u9' })
    const deOutroCiclo = lancIndice('s-i1', 100, { cicloId: 'c2' })
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [deOutraUnidade, deOutroCiclo],
      regra,
    )
    expect(avaliacao.memoria.passos[0].valor).toBeNull()
    expect(avaliacao.score).toBe(0)
  })

  it('indicador sem lançamento zera com aviso, por padrão', () => {
    const { indicadores, subindicadores, regra } = cenarioSimples(['i1', 'i2'])
    const avaliacao = avaliar(indicadores, subindicadores, [lancIndice('s-i1', 100)], regra)

    expect(avaliacao.memoria.passos).toHaveLength(2)
    const semLancamento = avaliacao.memoria.passos.find((p) => p.indicadorId === 'i2')
    expect(semLancamento?.pontos).toBe(0)
    expect(semLancamento?.valor).toBeNull()
    expect(semLancamento?.faixa).toBe('sem lançamento')
    expect(avaliacao.avisos.join(' ')).toContain('sem subindicador apurado')
    expect(avaliacao.score).toBe(50)
  })

  it('com "ignora", o indicador sem lançamento sai da conta e do peso', () => {
    const { indicadores, subindicadores, regra } = cenarioSimples(['i1', 'i2'])
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [lancIndice('s-i1', 100)],
      { ...regra, semLancamento: 'ignora' },
    )
    expect(avaliacao.memoria.passos).toHaveLength(1)
    expect(avaliacao.memoria.somaPesos).toBe(1)
    expect(avaliacao.score).toBe(100)
  })

  it('com "usa_meta", o indicador sem lançamento entra como meta cumprida', () => {
    const { indicadores, subindicadores, regra } = cenarioSimples(['i1', 'i2'])
    const avaliacao = avaliar(
      indicadores,
      subindicadores,
      [lancIndice('s-i1', 100)],
      { ...regra, semLancamento: 'usa_meta' },
    )
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.avisos.join(' ')).toContain('meta cumprida')
  })

  it('normaliza pesos que não somam 1', () => {
    const grandes = cenarioSimples(['i1', 'i2'], [30, 70])
    const fracionarios = cenarioSimples(['i1', 'i2'], [0.3, 0.7])
    const comPesosGrandes = avaliar(
      grandes.indicadores,
      grandes.subindicadores,
      grandes.lancar([100, 60]),
      grandes.regra,
    )
    const comPesosFracionarios = avaliar(
      fracionarios.indicadores,
      fracionarios.subindicadores,
      fracionarios.lancar([100, 60]),
      fracionarios.regra,
    )
    expect(comPesosGrandes.score).toBe(comPesosFracionarios.score)
    expect(comPesosGrandes.score).toBe(30)
  })

  it('devolve score zero e aviso quando nada se aplica ao tipo da unidade', () => {
    const avaliacao = avaliar([indicador({ id: 'i1' })], [sub('s1', 'i1')], [], REGRA_V1)
    expect(avaliacao.score).toBe(0)
    expect(avaliacao.memoria.passos).toEqual([])
    expect(avaliacao.avisos[0]).toContain('Nenhum indicador aplicável')
  })

  it('mantém o score dentro de 0 a 100 mesmo com todo mundo estourando o teto', () => {
    const { indicadores, subindicadores, regra, lancar } = cenarioSimples(['i1', 'i2'])
    const avaliacao = avaliar(indicadores, subindicadores, lancar([900, 900]), regra)
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.memoria.passos.every((p) => p.aplicouTeto)).toBe(true)
  })

  it('na fronteira de faixa, a memória fecha na conta que ela mesma mostra', () => {
    // 9562 ÷ 12500 = 76.496; contra meta 90, o atingimento bruto é 0.849955…
    // A faixa é escolhida sobre o atingimento ARREDONDADO (0.85), o mesmo que
    // a memória grava: mostrar 85% ao lado da faixa "70% a <85%" seria a
    // memória se contradizendo no ponto mais sensível de uma gratificação.
    const indicadores = [indicador({ id: 'i1' })]
    const subindicadores = [sub('s1', 'i1', 'razao')]
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1', { meta: 90 })] }
    const avaliacao = avaliar(indicadores, subindicadores, [lancRazao('s1', 9562, 12500)], regra)

    const passo = avaliacao.memoria.passos[0]
    expect(passo.atingimento).toBe(0.85)
    expect(passo.faixa).toBe('85% a <95%')
    expect(passo.pontos).toBe(7)
  })

  it('com "ignora" e nada lançado, a memória diz a verdade: faltou lançamento', () => {
    const { indicadores, subindicadores, regra } = cenarioSimples(['i1', 'i2'])
    const avaliacao = avaliar(indicadores, subindicadores, [], {
      ...regra,
      semLancamento: 'ignora',
    })

    expect(avaliacao.score).toBe(0)
    expect(avaliacao.memoria.formula).toContain('Sem lançamento em nenhum indicador aplicável')
    expect(avaliacao.avisos[0]).toContain('Ignorados: Indicador i1; Indicador i2.')
    // O caso é DIFERENTE de um tipo sem aplicabilidade, que continua com a
    // mensagem própria dele.
    const semAplicavel = avaliar(indicadores, subindicadores, [], {
      ...regra,
      aplicabilidades: [],
      semLancamento: 'ignora',
    })
    expect(semAplicavel.avisos[0]).toContain('Nenhum indicador aplicável')
  })

  it('o modo de arredondamento da regra alcança a apuração da razão', () => {
    const comTruncar = apurarSubindicador(sub('s1', 'i1', 'razao'), lancRazao('s1', 2, 3), 'truncar')
    const comMeioParaCima = apurarSubindicador(sub('s1', 'i1', 'razao'), lancRazao('s1', 2, 3))
    expect(comTruncar.valor).toBe(66.6666)
    expect(comMeioParaCima.valor).toBe(66.6667)
  })

  it('é determinística: mesma entrada, mesmo resultado', () => {
    const { indicadores, subindicadores, regra, lancar } = cenarioSimples(['i1', 'i2'], [1, 2])
    const lancamentos = lancar([93, 71])
    expect(avaliar(indicadores, subindicadores, lancamentos, regra)).toEqual(
      avaliar(indicadores, subindicadores, lancamentos, regra),
    )
  })
})

describe('calcularAvaliacaoDistrital', () => {
  function avaliacaoDaUnidade(unidadeId: string, score: number): Avaliacao {
    return {
      unidadeId,
      cicloId: 'c1',
      score,
      faixa: faixaDoScore(score, REGRA_V1),
      memoria: {
        regraId: REGRA_V1.id,
        versaoRegra: 1,
        passos: [],
        somaPesos: 1,
        somaContribuicoes: 0,
        pontuacaoMaxima: 10,
        score,
        formula: 'sintética',
      },
      avisos: [],
    }
  }

  it('é a média simples das unidades do distrito', () => {
    const resultado = calcularAvaliacaoDistrital({
      distritoId: 'd1',
      cicloId: 'c1',
      avaliacoesDasUnidades: [
        avaliacaoDaUnidade('u1', 80),
        avaliacaoDaUnidade('u2', 90),
        avaliacaoDaUnidade('u3', 100),
      ],
      regra: REGRA_V1,
    })
    expect(resultado.score).toBe(90)
    expect(resultado.faixa?.rotulo).toBe('integral plena')
    expect(resultado.porUnidade).toHaveLength(3)
  })

  it('só conta avaliações do ciclo pedido', () => {
    const deOutroCiclo = { ...avaliacaoDaUnidade('u2', 0), cicloId: 'c9' }
    const resultado = calcularAvaliacaoDistrital({
      distritoId: 'd1',
      cicloId: 'c1',
      avaliacoesDasUnidades: [avaliacaoDaUnidade('u1', 80), deOutroCiclo],
      regra: REGRA_V1,
    })
    expect(resultado.score).toBe(80)
    expect(resultado.porUnidade).toHaveLength(1)
  })

  it('distrito sem unidade avaliada devolve zero com aviso', () => {
    const resultado = calcularAvaliacaoDistrital({
      distritoId: 'd1',
      cicloId: 'c1',
      avaliacoesDasUnidades: [],
      regra: REGRA_V1,
    })
    expect(resultado.score).toBe(0)
    expect(resultado.avisos[0]).toContain('Nenhuma unidade')
  })
})

describe('aplicabilidadeDe', () => {
  it('encontra o par tipo × indicador, e devolve null quando não há', () => {
    const regra = { ...REGRA_V1, aplicabilidades: [aplic('i1', { meta: 42 })] }
    expect(aplicabilidadeDe(regra, 'usf', 'i1')?.meta).toBe(42)
    expect(aplicabilidadeDe(regra, 'caps', 'i1')).toBeNull()
    expect(aplicabilidadeDe(regra, 'usf', 'i2')).toBeNull()
  })
})

describe('troca de versão da regra entre ciclos', () => {
  const cenario = cenarioSimples(['i1'])
  const lancamentos = cenario.lancar([92])
  const v1 = { ...REGRA_V1, aplicabilidades: cenario.regra.aplicabilidades }
  const v2 = { ...REGRA_V2, aplicabilidades: cenario.regra.aplicabilidades }

  it('o mesmo lançamento pontua diferente sob regras diferentes', () => {
    // 92%: na v1 cai na faixa 85–95 (7 pontos); na v2, na faixa 90–100 (8).
    const sobV1 = avaliar(cenario.indicadores, cenario.subindicadores, lancamentos, v1)
    const sobV2 = avaliar(cenario.indicadores, cenario.subindicadores, lancamentos, v2)

    expect(sobV1.memoria.passos[0].pontos).toBe(7)
    expect(sobV2.memoria.passos[0].pontos).toBe(8)
    expect(sobV1.score).toBe(70)
    expect(sobV2.score).toBe(80)
  })

  it('a memória diz qual versão foi usada — é o que torna o ciclo reproduzível', () => {
    expect(
      avaliar(cenario.indicadores, cenario.subindicadores, lancamentos, v1).memoria.versaoRegra,
    ).toBe(1)
    expect(
      avaliar(cenario.indicadores, cenario.subindicadores, lancamentos, v2).memoria.versaoRegra,
    ).toBe(2)
  })

  it('regraVigente escolhe pela competência do ciclo', () => {
    const regras = [REGRA_V1, REGRA_V2]
    expect(regraVigente('2026-03', regras)?.versao).toBe(1)
    expect(regraVigente('2026-06', regras)?.versao).toBe(1)
    expect(regraVigente('2026-07', regras)?.versao).toBe(2)
    expect(regraVigente('2027-01', regras)?.versao).toBe(2)
    expect(regraVigente('2025-12', regras)).toBeNull()
  })

  it('em caso de sobreposição, vence a versão mais nova', () => {
    const sobreposta = { ...REGRA_V2, vigenteDe: '2026-01' }
    expect(regraVigente('2026-03', [REGRA_V1, sobreposta])?.versao).toBe(2)
  })
})
