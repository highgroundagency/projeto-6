import { describe, expect, it } from 'vitest'
import {
  arredondar,
  calcularAtingimento,
  calcularAvaliacao,
  faixaDoAtingimento,
  faixaDoScore,
  regraVigente,
} from './motor'
import type { Gestor, Indicador, Lancamento, RegraDePontuacao } from './tipos'

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

const GESTOR: Gestor = {
  id: 'g1',
  nome: 'Gestor Sintético 1',
  cargo: 'Coordenação',
  areaId: 'a1',
}

function indicador(parcial: Partial<Indicador> & Pick<Indicador, 'id'>): Indicador {
  return {
    areaId: 'a1',
    nome: `Indicador ${parcial.id}`,
    unidade: '%',
    direcao: 'maior_melhor',
    fonte: 'sintético',
    periodicidade: 'mensal',
    meta: 100,
    peso: 1,
    ...parcial,
  }
}

function lancamento(indicadorId: string, valor: number): Lancamento {
  return {
    id: `l-${indicadorId}`,
    indicadorId,
    cicloId: 'c1',
    valor,
    evidencia: 'planilha sintética',
    autor: 'seed',
    registradoEm: '2026-02-01T12:00:00.000Z',
    status: 'validado',
  }
}

function avaliar(
  indicadores: Indicador[],
  lancamentos: Lancamento[],
  regra: RegraDePontuacao = REGRA_V1,
) {
  return calcularAvaliacao({ gestor: GESTOR, cicloId: 'c1', indicadores, lancamentos, regra })
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

  it('meio para baixo aproxima do zero no empate', () => {
    expect(arredondar(0.5, 0, 'meio_para_baixo')).toBe(0)
    expect(arredondar(1.5, 0, 'meio_para_baixo')).toBe(1)
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

describe('calcularAvaliacao', () => {
  it('desempenho perfeito dá exatamente 100, sem sobra de arredondamento', () => {
    const indicadores = [
      indicador({ id: 'i1' }),
      indicador({ id: 'i2' }),
      indicador({ id: 'i3' }),
    ]
    const avaliacao = avaliar(indicadores, [
      lancamento('i1', 100),
      lancamento('i2', 100),
      lancamento('i3', 100),
    ])
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.faixa?.rotulo).toBe('integral plena')
  })

  it('a memória de cálculo fecha na conta que ela mesma mostra', () => {
    const indicadores = [
      indicador({ id: 'i1', peso: 0.3 }),
      indicador({ id: 'i2', peso: 0.3 }),
      indicador({ id: 'i3', peso: 0.4 }),
    ]
    const avaliacao = avaliar(indicadores, [
      lancamento('i1', 100), // 100% → 10 pontos
      lancamento('i2', 90), // 90%  → 7 pontos
      lancamento('i3', 80), // 80%  → 4 pontos
    ])

    const soma = avaliacao.memoria.passos.reduce((s, p) => s + p.contribuicao, 0)
    expect(arredondar(soma, 2)).toBe(avaliacao.memoria.somaContribuicoes)
    expect(avaliacao.memoria.somaContribuicoes).toBe(6.7)
    expect(avaliacao.score).toBe(67)
  })

  it('registra um passo por indicador, com todos os campos da auditoria', () => {
    const avaliacao = avaliar([indicador({ id: 'i1' })], [lancamento('i1', 88)])
    const passo = avaliacao.memoria.passos[0]

    expect(passo).toMatchObject({
      indicadorId: 'i1',
      valor: 88,
      meta: 100,
      atingimento: 0.88,
      pontos: 7,
      peso: 1,
      contribuicao: 7,
      direcao: 'maior_melhor',
    })
    expect(passo.faixa).toBe('85% a <95%')
    expect(avaliacao.memoria.versaoRegra).toBe(1)
    expect(avaliacao.memoria.regraId).toBe('regra-2026-v1')
  })

  it('respeita menor_melhor no cálculo completo', () => {
    const indicadores = [
      indicador({ id: 'tempo', direcao: 'menor_melhor', meta: 10, unidade: 'dias' }),
    ]
    const bom = avaliar(indicadores, [lancamento('tempo', 8)])
    const ruim = avaliar(indicadores, [lancamento('tempo', 20)])

    expect(bom.memoria.passos[0].pontos).toBe(10)
    expect(ruim.memoria.passos[0].pontos).toBe(0)
    expect(bom.score).toBeGreaterThan(ruim.score)
  })

  it('indicador sem lançamento zera com aviso, por padrão', () => {
    const indicadores = [indicador({ id: 'i1' }), indicador({ id: 'i2' })]
    const avaliacao = avaliar(indicadores, [lancamento('i1', 100)])

    expect(avaliacao.memoria.passos).toHaveLength(2)
    const semLancamento = avaliacao.memoria.passos.find((p) => p.indicadorId === 'i2')
    expect(semLancamento?.pontos).toBe(0)
    expect(semLancamento?.valor).toBeNull()
    expect(semLancamento?.faixa).toBe('sem lançamento')
    expect(avaliacao.avisos.join(' ')).toContain('sem lançamento')
    expect(avaliacao.score).toBe(50)
  })

  it('com "ignora", o indicador sem lançamento sai da conta e do peso', () => {
    const regra = { ...REGRA_V1, semLancamento: 'ignora' } as RegraDePontuacao
    const avaliacao = avaliar(
      [indicador({ id: 'i1' }), indicador({ id: 'i2' })],
      [lancamento('i1', 100)],
      regra,
    )
    expect(avaliacao.memoria.passos).toHaveLength(1)
    expect(avaliacao.memoria.somaPesos).toBe(1)
    expect(avaliacao.score).toBe(100)
  })

  it('com "usa_meta", o indicador sem lançamento entra como meta cumprida', () => {
    const regra = { ...REGRA_V1, semLancamento: 'usa_meta' } as RegraDePontuacao
    const avaliacao = avaliar(
      [indicador({ id: 'i1' }), indicador({ id: 'i2' })],
      [lancamento('i1', 100)],
      regra,
    )
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.avisos.join(' ')).toContain('meta cumprida')
  })

  it('normaliza pesos que não somam 1', () => {
    const comPesosGrandes = avaliar(
      [indicador({ id: 'i1', peso: 30 }), indicador({ id: 'i2', peso: 70 })],
      [lancamento('i1', 100), lancamento('i2', 60)],
    )
    const comPesosFracionarios = avaliar(
      [indicador({ id: 'i1', peso: 0.3 }), indicador({ id: 'i2', peso: 0.7 })],
      [lancamento('i1', 100), lancamento('i2', 60)],
    )
    expect(comPesosGrandes.score).toBe(comPesosFracionarios.score)
    expect(comPesosGrandes.score).toBe(30)
  })

  it('ignora indicadores de outra área', () => {
    const avaliacao = avaliar(
      [indicador({ id: 'i1' }), indicador({ id: 'outra', areaId: 'a2' })],
      [lancamento('i1', 100)],
    )
    expect(avaliacao.memoria.passos.map((p) => p.indicadorId)).toEqual(['i1'])
  })

  it('devolve score zero e aviso quando a área não tem indicador com peso', () => {
    const avaliacao = avaliar([], [])
    expect(avaliacao.score).toBe(0)
    expect(avaliacao.memoria.passos).toEqual([])
    expect(avaliacao.avisos[0]).toContain('Nenhum indicador')
  })

  it('mantém o score dentro de 0 a 100 mesmo com todo mundo estourando o teto', () => {
    const avaliacao = avaliar(
      [indicador({ id: 'i1' }), indicador({ id: 'i2' })],
      [lancamento('i1', 900), lancamento('i2', 900)],
    )
    expect(avaliacao.score).toBe(100)
    expect(avaliacao.memoria.passos.every((p) => p.aplicouTeto)).toBe(true)
  })

  it('é determinística: mesma entrada, mesmo resultado', () => {
    const indicadores = [indicador({ id: 'i1' }), indicador({ id: 'i2', peso: 2 })]
    const lancamentos = [lancamento('i1', 93), lancamento('i2', 71)]
    expect(avaliar(indicadores, lancamentos)).toEqual(avaliar(indicadores, lancamentos))
  })

  it('ignora lançamento de outro ciclo', () => {
    const deOutroCiclo = { ...lancamento('i1', 100), cicloId: 'c2' }
    const avaliacao = avaliar([indicador({ id: 'i1' })], [deOutroCiclo])
    expect(avaliacao.memoria.passos[0].valor).toBeNull()
    expect(avaliacao.score).toBe(0)
  })
})

describe('troca de versão da regra entre ciclos', () => {
  const indicadores = [indicador({ id: 'i1' })]
  const lancamentos = [lancamento('i1', 92)]

  it('o mesmo lançamento pontua diferente sob regras diferentes', () => {
    const sobV1 = avaliar(indicadores, lancamentos, REGRA_V1) // 92% → faixa 85-95 → 7
    const sobV2 = avaliar(indicadores, lancamentos, REGRA_V2) // 92% → faixa 90-100 → 8

    expect(sobV1.memoria.passos[0].pontos).toBe(7)
    expect(sobV2.memoria.passos[0].pontos).toBe(8)
    expect(sobV1.score).toBe(70)
    expect(sobV2.score).toBe(80)
  })

  it('a memória diz qual versão foi usada — é o que torna o ciclo reproduzível', () => {
    expect(avaliar(indicadores, lancamentos, REGRA_V1).memoria.versaoRegra).toBe(1)
    expect(avaliar(indicadores, lancamentos, REGRA_V2).memoria.versaoRegra).toBe(2)
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
