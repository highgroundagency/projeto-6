import { describe, expect, it } from 'vitest'
import { BASE } from '@/lib/seed'
import type { Lancamento } from '@/lib/calculo/tipos'
import { driverSeed } from '@/lib/dados/driver-seed'
import {
  LIMITE_DE_REGISTROS,
  LIMITE_DE_VISITANTES,
  estadoDo,
  visitantesEmMemoria,
} from './estado'

/**
 * A escrita do protótipo é de quem escreve (auditoria do SR1, lacuna 10).
 *
 * Até aqui um visitante lançava e o outro via; o avanço de etapa que o admin
 * fazia ao vivo mudava a tela de todos. Estes casos provam o contrário: cada
 * visitante tem a própria cópia, e uma não enxerga a outra.
 */

const ABERTO = 'ciclo-2026-07'

/** Um lançamento válido em julho: USF Canário, famílias acompanhadas. */
function lancamentoDeTeste(
  visitante: string,
  extra: Partial<Omit<Lancamento, 'id'>> = {},
): Omit<Lancamento, 'id'> {
  return {
    subindicadorId: 'acompanhamento-familias',
    unidadeId: 'usf-canario',
    cicloId: ABERTO,
    valor: null,
    numerador: 170,
    denominador: 200,
    evidencia: `teste do visitante ${visitante}`,
    autor: 'ger-usf-canario',
    registradoEm: '2026-07-18T12:00:00.000Z',
    status: 'enviado',
    ...extra,
  }
}

const novo = () => crypto.randomUUID()

describe('uma cópia por visitante', () => {
  it('dois visitantes não se enxergam', () => {
    const ana = novo()
    const bia = novo()

    const resultado = estadoDo(ana).registrarLancamento(
      lancamentoDeTeste(ana),
      '2026-07-18T12:00:00.000Z',
    )
    expect(resultado.ok).toBe(true)

    const daAna = estadoDo(ana).lancamentos().filter((l) => l.evidencia.includes(ana))
    const daBia = estadoDo(bia).lancamentos().filter((l) => l.evidencia.includes(ana))
    expect(daAna).toHaveLength(1)
    expect(daBia).toHaveLength(0)

    // E o histórico também é de cada um.
    expect(estadoDo(ana).eventos().length).toBe(BASE.eventos.length + 1)
    expect(estadoDo(bia).eventos().length).toBe(BASE.eventos.length)
  })

  it('o avanço de etapa fica na cópia de quem avançou', () => {
    const admin = novo()
    const avaliador = novo()

    expect(estadoDo(admin).avancarCiclo(ABERTO, 'seab', '2026-07-21T10:00:00.000Z').ok).toBe(
      true,
    )
    expect(estadoDo(admin).ciclo(ABERTO)?.estado).toBe('em_validacao')
    expect(estadoDo(avaliador).ciclo(ABERTO)?.estado).toBe('lancamento_aberto')

    // Homologar calcula a nota, e a nota também só existe para quem homologou.
    expect(estadoDo(admin).avancarCiclo(ABERTO, 'seab', '2026-07-24T10:00:00.000Z').ok).toBe(
      true,
    )
    const notasDoAdmin = estadoDo(admin)
      .avaliacoes()
      .filter((a) => a.cicloId === ABERTO)
    expect(notasDoAdmin).toHaveLength(BASE.unidades.length)
    expect(notasDoAdmin.every((a) => a.memoria.metodo === 'notas')).toBe(true)
    expect(estadoDo(avaliador).avaliacoes().some((a) => a.cicloId === ABERTO)).toBe(false)
  })

  it('a contestação também é de quem abriu', () => {
    const ana = novo()
    const bia = novo()
    const antes = estadoDo(bia).contestacoes().length

    const resultado = estadoDo(ana).abrirContestacao(
      {
        gerenteId: 'ger-usf-canario',
        cicloId: 'ciclo-2026-06',
        indicadorId: null,
        motivo: 'A nota de junho não bate com o que mandamos.',
        abertaEm: '2026-07-02T09:00:00.000Z',
      },
      'gerente_unidade',
    )
    expect(resultado.ok).toBe(true)
    expect(estadoDo(ana).contestacoes()).toHaveLength(antes + 1)
    expect(estadoDo(bia).contestacoes()).toHaveLength(antes)
    expect(estadoDo(ana).eventos()[0].tipo).toBe('contestacao_aberta')
  })

  it('quem não tem cookie lê a base pura e não escreve', () => {
    const semCookie = estadoDo(null)
    expect(semCookie.lancamentos()).toHaveLength(BASE.lancamentos.length)
    expect(semCookie.registrarLancamento(lancamentoDeTeste('x'), '2026-07-18').ok).toBe(false)
    expect(semCookie.avancarCiclo(ABERTO, 'seab', '2026-07-21').ok).toBe(false)
  })

  it('ler não cria cópia: só a escrita ocupa memória', () => {
    const antes = visitantesEmMemoria()
    const curioso = estadoDo(novo())
    curioso.ciclos()
    curioso.lancamentos()
    curioso.eventos()
    expect(visitantesEmMemoria()).toBe(antes)
  })
})

describe('a tentativa fora do prazo fica no histórico', () => {
  it('recusa o lançamento e registra a tentativa, sem gravar número', () => {
    const visitante = novo()
    const estado = estadoDo(visitante)
    // Fecha julho nesta cópia: o prazo acabou.
    estado.avancarCiclo(ABERTO, 'seab', '2026-07-21T10:00:00.000Z')
    const lancamentosAntes = estado.lancamentos().length

    const resultado = estado.registrarLancamento(
      lancamentoDeTeste(visitante),
      '2026-07-22T08:00:00.000Z',
    )

    expect(resultado.ok).toBe(false)
    expect(resultado.mensagem).toContain('ficou registrada no histórico')
    expect(estado.lancamentos()).toHaveLength(lancamentosAntes)

    const [ultimo] = estado.eventos()
    expect(ultimo.tipo).toBe('lancamento_recusado')
    expect(ultimo.entidade).toBe(ABERTO)
    expect(ultimo.autor).toBe('ger-usf-canario')
    expect(ultimo.antes).toBeNull()
    expect(ultimo.depois).toMatchObject({ estadoDoCiclo: 'em_validacao', numerador: 170 })
  })

  it('mês publicado também recusa, e registra', () => {
    const estado = estadoDo(novo())
    const resultado = estado.registrarLancamento(
      lancamentoDeTeste('pub', { cicloId: 'ciclo-2026-04' }),
      '2026-07-22T08:00:00.000Z',
    )
    expect(resultado.ok).toBe(false)
    expect(estado.eventos()[0].tipo).toBe('lancamento_recusado')
  })
})

describe('a memória tem teto', () => {
  it('cada cópia aceita um número limitado de registros', () => {
    const estado = estadoDo(novo())
    for (let i = 0; i < LIMITE_DE_REGISTROS; i++) {
      expect(
        estado.registrarLancamento(lancamentoDeTeste(`n${i}`), '2026-07-18T12:00:00.000Z').ok,
      ).toBe(true)
    }
    const passou = estado.registrarLancamento(
      lancamentoDeTeste('um a mais'),
      '2026-07-18T12:00:00.000Z',
    )
    expect(passou.ok).toBe(false)
    expect(passou.mensagem).toContain('limite')
  })

  it('quando a memória enche, sai a cópia usada há mais tempo', () => {
    const primeiro = novo()
    estadoDo(primeiro).registrarLancamento(lancamentoDeTeste(primeiro), '2026-07-18')

    const segundo = novo()
    estadoDo(segundo).registrarLancamento(lancamentoDeTeste(segundo), '2026-07-18')

    // O segundo volta a ser usado; o primeiro fica sendo o mais antigo.
    estadoDo(segundo).lancamentos()

    for (let i = 0; i < LIMITE_DE_VISITANTES - 1; i++) {
      const outro = novo()
      estadoDo(outro).registrarLancamento(lancamentoDeTeste(outro), '2026-07-18')
    }

    expect(visitantesEmMemoria()).toBe(LIMITE_DE_VISITANTES)
    const achou = (id: string) =>
      estadoDo(id)
        .lancamentos()
        .some((l) => l.evidencia.includes(id))
    expect(achou(primeiro)).toBe(false)
    expect(achou(segundo)).toBe(true)
  })
})

describe('o driver resolve o visitante a cada chamada', () => {
  it('o contrato das telas não muda, e cada visitante vê o seu', async () => {
    const ana = novo()
    const bia = novo()
    const comoAna = driverSeed(async () => ana)
    const comoBia = driverSeed(async () => bia)

    const resultado = await comoAna.registrarLancamento(
      {
        subindicadorId: 'acompanhamento-familias',
        unidadeId: 'usf-canario',
        cicloId: ABERTO,
        valor: null,
        numerador: 160,
        denominador: 200,
        evidencia: `pelo driver ${ana}`,
        autor: 'ger-usf-canario',
        perfil: 'gerente_unidade',
      },
      '2026-07-18T12:00:00.000Z',
    )
    expect(resultado.ok).toBe(true)

    const daAna = (await comoAna.lancamentos(ABERTO)).filter((l) => l.evidencia.includes(ana))
    const daBia = (await comoBia.lancamentos(ABERTO)).filter((l) => l.evidencia.includes(ana))
    expect(daAna).toHaveLength(1)
    expect(daBia).toHaveLength(0)

    await comoAna.avancarCiclo(ABERTO, 'seab', '2026-07-21T10:00:00.000Z')
    const cicloDaAna = (await comoAna.panorama()).ciclos.find((c) => c.id === ABERTO)
    const cicloDaBia = (await comoBia.panorama()).ciclos.find((c) => c.id === ABERTO)
    expect(cicloDaAna?.estado).toBe('em_validacao')
    expect(cicloDaBia?.estado).toBe('lancamento_aberto')
  })
})
