import { describe, expect, it } from 'vitest'
import {
  ADIANTAMENTO_PADRAO,
  calcularReleaseAtual,
  cicloCorrente,
  cicloVisivel,
  dataSimuladaDaJanela,
  ehSemanaCorrente,
  ciclosVisiveis,
  estadoDoMarco,
  janelaAberta,
  proximoMarco,
  resumirRelease,
  type Travas,
} from './releases'
import { CRONOGRAMA, cicloPorId } from './cronograma'

// Vitrine fechada injetada: os casos abaixo medem a REGRA, não o valor que
// `src/content/vitrine.ts` estiver carregando hoje.
const FECHADA = { ate: null, dataSimulada: null }

describe('calcularReleaseAtual', () => {
  it('usa uma semana de adiantamento por padrão', () => {
    expect(ADIANTAMENTO_PADRAO).toBe(7)
  })

  it('libera até s7 em 12/10 com adiantamento 7 (exemplo do briefing)', () => {
    expect(calcularReleaseAtual({ hoje: '2026-10-12', adiantamentoDias: 7 })).toBe('s7')
  })

  it('avança duas semanas de uma vez quando o adiantamento vira 14', () => {
    expect(calcularReleaseAtual({ hoje: '2026-10-12', adiantamentoDias: 14 })).toBe('s8')
  })

  it('libera o ciclo quando a data cai exatamente na fronteira', () => {
    // 15/08 + 7 = 22/08, que é a data de s3: o limite é inclusivo.
    expect(calcularReleaseAtual({ hoje: '2026-08-15', adiantamentoDias: 7 })).toBe('s3')
  })

  it('não libera o ciclo seguinte um dia antes da fronteira', () => {
    expect(calcularReleaseAtual({ hoje: '2026-08-14', adiantamentoDias: 7 })).toBe('s2')
  })

  it('sem adiantamento, libera só o que já aconteceu', () => {
    expect(calcularReleaseAtual({ hoje: '2026-08-22', adiantamentoDias: 0 })).toBe('s3')
    expect(calcularReleaseAtual({ hoje: '2026-08-21', adiantamentoDias: 0 })).toBe('s2')
  })

  it('devolve null antes do primeiro ciclo', () => {
    expect(calcularReleaseAtual({ hoje: '2026-07-01', adiantamentoDias: 7 })).toBeNull()
  })

  it('fica no último ciclo depois do fim do semestre', () => {
    expect(calcularReleaseAtual({ hoje: '2027-02-10', adiantamentoDias: 7 })).toBe('sr2')
  })

  it('aceita adiantamento maior que o semestre inteiro', () => {
    expect(calcularReleaseAtual({ hoje: '2026-08-08', adiantamentoDias: 365 })).toBe('sr2')
  })

  it('override manual tem prioridade sobre o cálculo por data', () => {
    expect(
      calcularReleaseAtual({ hoje: '2026-08-15', adiantamentoDias: 7, override: 'sr2' }),
    ).toBe('sr2')
  })

  it('override também serve para voltar atrás', () => {
    expect(
      calcularReleaseAtual({ hoje: '2026-11-30', adiantamentoDias: 7, override: 's1' }),
    ).toBe('s1')
  })

  it('ignora override desconhecido em vez de quebrar a página', () => {
    expect(
      calcularReleaseAtual({
        hoje: '2026-10-12',
        adiantamentoDias: 7,
        override: 'lixo-vindo-de-env-var' as never,
      }),
    ).toBe('s7')
  })
})

describe('cicloVisivel e ciclosVisiveis', () => {
  it('mostra o release e tudo que veio antes', () => {
    const visiveis = ciclosVisiveis({ releaseAtual: 's3' })
    expect(visiveis).toEqual(['s1', 's2', 's3'])
  })

  it('não mostra nada quando nenhum ciclo começou', () => {
    expect(ciclosVisiveis({ releaseAtual: null })).toEqual([])
  })

  it('trava sempre_visivel libera um ciclo fora de ordem sem mexer no resto', () => {
    const travas: Travas = { s9: 'sempre_visivel' }
    const visiveis = ciclosVisiveis({ releaseAtual: 's3', travas })
    expect(visiveis).toEqual(['s1', 's2', 's3', 's9'])
    expect(visiveis).not.toContain('s7')
  })

  it('trava sempre_oculto esconde ciclo já vencido', () => {
    const travas: Travas = { s2: 'sempre_oculto' }
    expect(ciclosVisiveis({ releaseAtual: 's3', travas })).toEqual(['s1', 's3'])
  })

  it('trava vale mesmo sem release nenhum', () => {
    const travas: Travas = { ko: 'sempre_visivel' }
    expect(ciclosVisiveis({ releaseAtual: null, travas })).toEqual(['ko'])
  })

  it('trava automatico é o mesmo que não ter trava', () => {
    expect(cicloVisivel('s2', { releaseAtual: 's3', travas: { s2: 'automatico' } })).toBe(true)
    expect(cicloVisivel('s7', { releaseAtual: 's3', travas: { s7: 'automatico' } })).toBe(false)
  })

  it('devolve os ciclos na ordem do cronograma', () => {
    const visiveis = ciclosVisiveis({
      releaseAtual: 'sr1',
      travas: { s11: 'sempre_visivel' },
    })
    const posicoes = visiveis.map((id) => CRONOGRAMA.findIndex((c) => c.id === id))
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes)
  })
})

describe('cicloCorrente', () => {
  it('ignora o adiantamento e responde onde a equipe está de fato', () => {
    // Em 12/10 o release já mostra s7, mas a equipe está na semana imprensada.
    expect(cicloCorrente('2026-10-12')).toBe('i2')
  })
})

describe('marcos', () => {
  it('aponta o próximo marco a partir de hoje', () => {
    expect(proximoMarco('2026-08-15')?.id).toBe('ko')
    expect(proximoMarco('2026-09-13')?.id).toBe('sr1')
    expect(proximoMarco('2026-12-06')).toBeNull()
  })

  it('considera o marco de hoje como o próximo', () => {
    expect(proximoMarco('2026-10-03')?.id).toBe('sr1')
  })

  it('classifica a trilha em feito / atual / futuro', () => {
    const hoje = '2026-09-20'
    expect(estadoDoMarco(cicloPorId('ko'), hoje)).toBe('feito')
    expect(estadoDoMarco(cicloPorId('sr1'), hoje)).toBe('atual')
    expect(estadoDoMarco(cicloPorId('sr2'), hoje)).toBe('futuro')
  })
})

describe('resumirRelease', () => {
  it('empacota o estado completo para a UI', () => {
    const resumo = resumirRelease({ hoje: '2026-10-12' })
    expect(resumo.releaseAtual).toBe('s7')
    expect(resumo.cicloCorrente).toBe('i2')
    expect(resumo.adiantamentoDias).toBe(7)
    expect(resumo.manual).toBe(false)
    expect(resumo.visiveis).toContain('s7')
    expect(resumo.visiveis).not.toContain('s8')
  })

  it('marca como manual quando há override válido', () => {
    const resumo = resumirRelease({ hoje: '2026-10-12', override: 'sr2' })
    expect(resumo.manual).toBe(true)
    expect(resumo.override).toBe('sr2')
    expect(resumo.visiveis).toHaveLength(18)
  })

  it('não marca como manual quando o override é inválido', () => {
    const resumo = resumirRelease({
      hoje: '2026-10-12',
      override: 'nao-existe' as never,
    })
    expect(resumo.manual).toBe(false)
    expect(resumo.override).toBeNull()
  })
})

describe('janela de vitrine com prazo', () => {
  const agora = new Date('2026-08-16T18:00:00Z')

  it('fica fechada sem a variável', () => {
    expect(janelaAberta({}, agora, FECHADA)).toBe(false)
  })

  it('fica fechada com valor vazio ou só espaço', () => {
    expect(janelaAberta({ RELEASE_ABERTO_ATE: '' }, agora, FECHADA)).toBe(false)
    expect(janelaAberta({ RELEASE_ABERTO_ATE: '   ' }, agora, FECHADA)).toBe(false)
  })

  it('abre enquanto o prazo não venceu', () => {
    expect(janelaAberta({ RELEASE_ABERTO_ATE: '2026-08-17T06:00:00Z' }, agora, FECHADA)).toBe(true)
  })

  it('fecha sozinha quando o prazo vence', () => {
    const depois = new Date('2026-08-17T06:00:01Z')
    expect(janelaAberta({ RELEASE_ABERTO_ATE: '2026-08-17T06:00:00Z' }, depois, FECHADA)).toBe(false)
  })

  it('fecha no instante exato do prazo, sem empate a favor', () => {
    const exato = new Date('2026-08-17T06:00:00Z')
    expect(janelaAberta({ RELEASE_ABERTO_ATE: '2026-08-17T06:00:00Z' }, exato, FECHADA)).toBe(false)
  })

  it('trata valor malformado como fechada, em vez de lançar', () => {
    // Uma env var digitada errada não pode derrubar o site — e muito menos
    // abri-lo por acidente.
    expect(janelaAberta({ RELEASE_ABERTO_ATE: 'amanhã de manhã' }, agora, FECHADA)).toBe(false)
    expect(janelaAberta({ RELEASE_ABERTO_ATE: '17/08/2026' }, agora, FECHADA)).toBe(false)
  })
})

describe('data simulada da janela', () => {
  it('devolve null sem a variável', () => {
    expect(dataSimuladaDaJanela({}, FECHADA)).toBeNull()
  })

  it('aceita uma data ISO válida', () => {
    expect(dataSimuladaDaJanela({ RELEASE_DATA_SIMULADA: '2027-01-15' }, FECHADA)).toBe('2027-01-15')
  })

  it('recusa formato que não seja YYYY-MM-DD', () => {
    // Nada de `new Date('15/01/2027')`: data neste projeto é string comparada
    // lexicograficamente, e formato errado não pode virar data silenciosamente.
    expect(dataSimuladaDaJanela({ RELEASE_DATA_SIMULADA: '15/01/2027' }, FECHADA)).toBeNull()
    expect(dataSimuladaDaJanela({ RELEASE_DATA_SIMULADA: '2027-13-99' }, FECHADA)).toBeNull()
    expect(dataSimuladaDaJanela({ RELEASE_DATA_SIMULADA: 'ano que vem' }, FECHADA)).toBeNull()
  })

  it('numa data depois do fim do cronograma, todos os marcos estão feitos', () => {
    const depoisDoSemestre = '2027-01-15'
    expect(proximoMarco(depoisDoSemestre)).toBeNull()
    for (const marco of CRONOGRAMA.filter((c) => c.tipo === 'marco')) {
      expect(estadoDoMarco(marco, depoisDoSemestre)).toBe('feito')
    }
  })
})

describe('ehSemanaCorrente', () => {
  it('é verdade no dia do ciclo e nos seis dias seguintes', () => {
    expect(ehSemanaCorrente('2026-08-15', 's2')).toBe(true)
    expect(ehSemanaCorrente('2026-08-21', 's2')).toBe(true)
  })

  it('é falso antes do ciclo e a partir do sétimo dia', () => {
    expect(ehSemanaCorrente('2026-08-14', 's2')).toBe(false)
    expect(ehSemanaCorrente('2026-08-22', 's2')).toBe(false)
  })

  it('não gruda no último ciclo depois que o semestre acaba', () => {
    // O bug que a simulação de 2027 encontrou: `cicloCorrente` devolve sr2 para
    // qualquer data depois de 05/12, e a pílula "esta semana" ficava lá presa.
    expect(cicloCorrente('2027-01-15')).toBe('sr2')
    expect(ehSemanaCorrente('2027-01-15', 'sr2')).toBe(false)
  })
})
