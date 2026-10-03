import { describe, expect, it } from 'vitest'
import { BASE } from '@/lib/seed'
import type { Lancamento } from '@/lib/calculo/tipos'
import { driverSeed } from '@/lib/dados/driver-seed'
import { LIMITE_DE_REGISTROS, estadoDo, novaSessao, type Sessao } from './estado'

/**
 * A escrita do protótipo é de quem escreve (auditoria do SR1, lacuna 10).
 *
 * Até aqui um visitante lançava e o outro via; o avanço de etapa que o admin
 * fazia ao vivo mudava a tela de todos. Estes casos provam o contrário: cada
 * visitante tem a própria cópia, e uma não enxerga a outra.
 *
 * E a cópia sai do DIÁRIO, não da memória (ADR-048): os casos de "outra
 * instância" refazem a cópia só com o diário, como faz a página na Vercel,
 * que roda numa função diferente da rota que gravou.
 */

const ABERTO = 'ciclo-2026-07'

/** Um lançamento válido em julho: USF Canário, famílias acompanhadas. */
function lancamentoDeTeste(
  marcaDoTeste: string,
  extra: Partial<Omit<Lancamento, 'id'>> = {},
): Omit<Lancamento, 'id'> {
  return {
    subindicadorId: 'acompanhamento-familias',
    unidadeId: 'usf-canario',
    cicloId: ABERTO,
    valor: null,
    numerador: 170,
    denominador: 200,
    evidencia: `teste ${marcaDoTeste}`,
    autor: 'ger-usf-canario',
    registradoEm: '2026-07-18T12:00:00.000Z',
    status: 'enviado',
    ...extra,
  }
}

/** Um visitante novo: diário vazio. */
const novo = (): Sessao => novaSessao()

/** Uma marca única para achar o lançamento de um teste no meio da base. */
const marca = () => crypto.randomUUID()

/** Outra instância, outra função: só o diário chega até ela. */
const emOutraInstancia = (sessao: Sessao) => estadoDo(novaSessao(sessao.diario))

describe('uma cópia por visitante', () => {
  it('dois visitantes não se enxergam', () => {
    const ana = novo()
    const bia = novo()
    const daAnaMarca = marca()

    const resultado = estadoDo(ana).registrarLancamento(
      lancamentoDeTeste(daAnaMarca),
      '2026-07-18T12:00:00.000Z',
    )
    expect(resultado.ok).toBe(true)

    const daAna = estadoDo(ana)
      .lancamentos()
      .filter((l) => l.evidencia.includes(daAnaMarca))
    const daBia = estadoDo(bia)
      .lancamentos()
      .filter((l) => l.evidencia.includes(daAnaMarca))
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
    expect(
      estadoDo(avaliador)
        .avaliacoes()
        .some((a) => a.cicloId === ABERTO),
    ).toBe(false)
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

  it('sem sessão, a base pura: lê e não escreve', () => {
    const semCookie = estadoDo(null)
    expect(semCookie.lancamentos()).toHaveLength(BASE.lancamentos.length)
    expect(semCookie.registrarLancamento(lancamentoDeTeste('x'), '2026-07-18').ok).toBe(false)
    expect(semCookie.avancarCiclo(ABERTO, 'seab', '2026-07-21').ok).toBe(false)
  })

  it('ler não escreve no diário', () => {
    const curioso = novo()
    const estado = estadoDo(curioso)
    estado.ciclos()
    estado.lancamentos()
    estado.eventos()
    expect(curioso.diario).toHaveLength(0)
  })

  it('só entra no diário a escrita que mudou a cópia', () => {
    const visitante = novo()
    expect(
      estadoDo(visitante).avancarCiclo('ciclo-que-nao-existe', 'seab', '2026-07-21').ok,
    ).toBe(false)
    expect(visitante.diario).toHaveLength(0)

    // A tentativa fora do prazo é recusada, mas fica no histórico: entra.
    estadoDo(visitante).registrarLancamento(
      lancamentoDeTeste(marca(), { cicloId: 'ciclo-2026-04' }),
      '2026-07-22T08:00:00.000Z',
    )
    expect(visitante.diario).toHaveLength(1)
  })
})

describe('o diário refaz a mesma cópia em qualquer instância (ADR-048)', () => {
  it('a demonstração do SR1: lançar, avançar até homologar e ver a nota', () => {
    const admin = novo()
    const daDemo = marca()

    expect(
      estadoDo(admin).registrarLancamento(lancamentoDeTeste(daDemo), '2026-07-18T12:00:00.000Z')
        .ok,
    ).toBe(true)
    expect(estadoDo(admin).avancarCiclo(ABERTO, 'seab', '2026-07-21T10:00:00.000Z').ok).toBe(
      true,
    )
    expect(estadoDo(admin).avancarCiclo(ABERTO, 'seab', '2026-07-24T10:00:00.000Z').ok).toBe(
      true,
    )

    // A página roda noutra função: tudo o que ela recebe é o diário.
    const pagina = emOutraInstancia(admin)
    expect(pagina.ciclo(ABERTO)?.estado).toBe('homologado')
    const lancado = pagina.lancamentos().find((l) => l.evidencia.includes(daDemo))
    expect(lancado?.numerador).toBe(170)

    const nota = pagina
      .avaliacoes()
      .find((a) => a.cicloId === ABERTO && a.unidadeId === 'usf-canario')
    expect(nota).toBeDefined()

    // A mesma cópia, com os mesmos ids e a mesma conta.
    const original = estadoDo(admin)
    expect(pagina.eventos().map((e) => e.id)).toEqual(original.eventos().map((e) => e.id))
    expect(pagina.avaliacoes()).toEqual(original.avaliacoes())
  })

  it('o lançamento de agora aparece na tela que vem depois', () => {
    const gerente = novo()
    const daGerente = marca()
    estadoDo(gerente).registrarLancamento(
      lancamentoDeTeste(daGerente),
      '2026-07-18T12:00:00.000Z',
    )

    const vigente = emOutraInstancia(gerente).lancamentoVigente(
      ABERTO,
      'acompanhamento-familias',
      'usf-canario',
    )
    expect(vigente?.evidencia).toContain(daGerente)
    expect(vigente?.numerador).toBe(170)
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
      lancamentoDeTeste(marca()),
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
})

describe('o driver lê a sessão a cada chamada e grava o diário', () => {
  it('o contrato das telas não muda, e cada visitante vê o seu', async () => {
    const ana = novo()
    const bia = novo()
    const daAnaMarca = marca()
    const gravado: Sessao[] = []
    const comoAna = driverSeed(
      async () => novaSessao(ana.diario),
      async (sessao) => {
        ana.diario.splice(0, ana.diario.length, ...sessao.diario)
        gravado.push(sessao)
        return true
      },
    )
    const comoBia = driverSeed(
      async () => novaSessao(bia.diario),
      async () => true,
    )

    const resultado = await comoAna.registrarLancamento(
      {
        subindicadorId: 'acompanhamento-familias',
        unidadeId: 'usf-canario',
        cicloId: ABERTO,
        valor: null,
        numerador: 160,
        denominador: 200,
        evidencia: `pelo driver ${daAnaMarca}`,
        autor: 'ger-usf-canario',
        perfil: 'gerente_unidade',
      },
      '2026-07-18T12:00:00.000Z',
    )
    expect(resultado.ok).toBe(true)

    expect(gravado).toHaveLength(1)

    const daAna = (await comoAna.lancamentos(ABERTO)).filter((l) =>
      l.evidencia.includes(daAnaMarca),
    )
    const daBia = (await comoBia.lancamentos(ABERTO)).filter((l) =>
      l.evidencia.includes(daAnaMarca),
    )
    expect(daAna).toHaveLength(1)
    expect(daBia).toHaveLength(0)

    await comoAna.avancarCiclo(ABERTO, 'seab', '2026-07-21T10:00:00.000Z')
    const cicloDaAna = (await comoAna.panorama()).ciclos.find((c) => c.id === ABERTO)
    const cicloDaBia = (await comoBia.panorama()).ciclos.find((c) => c.id === ABERTO)
    expect(cicloDaAna?.estado).toBe('em_validacao')
    expect(cicloDaBia?.estado).toBe('lancamento_aberto')
  })

  it('se o diário não cabe mais no cookie, a escrita não vale e quem escreveu fica sabendo', async () => {
    const cheio = driverSeed(
      async () => novo(),
      async () => false,
    )
    const resultado = await cheio.avancarCiclo(ABERTO, 'seab', '2026-07-21T10:00:00.000Z')
    expect(resultado.ok).toBe(false)
    expect(resultado.mensagem).toContain('limite')
  })
})
