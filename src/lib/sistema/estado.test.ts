import { describe, expect, it } from 'vitest'
import { BASE } from '@/lib/seed'
import type { Lancamento } from '@/lib/calculo/tipos'
import { driverSeed } from '@/lib/dados/driver-seed'
import { LIMITE_DE_REGISTROS, estadoDo, novaSessao, type Sessao } from './estado'
import { prazoParaContestar } from './prazos'

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
        cicloId: 'ciclo-2026-04',
        indicadorId: null,
        motivo: 'A nota de abril não bate com o que mandamos.',
        abertaEm: '2026-05-02T12:00:00.000Z',
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

/**
 * O art. 9º no caminho de escrita (Sprint 2). Abril foi publicado em 27/04 na
 * base de teste: o prazo vai até 07/05. Junho está homologado, sem publicação.
 */
describe('o prazo do art. 9º', () => {
  const pedido = (cicloId: string, abertaEm: string) => ({
    gerenteId: 'ger-usf-canario',
    cicloId,
    indicadorId: null,
    motivo: 'Pedimos revisão do mês.',
    abertaEm,
  })

  it('aceita até o último dia e recusa no dia seguinte', () => {
    const noUltimoDia = estadoDo(novo()).abrirContestacao(
      pedido('ciclo-2026-04', '2026-05-07T20:00:00.000Z'),
    )
    expect(noUltimoDia.ok, noUltimoDia.mensagem).toBe(true)
    expect(noUltimoDia.mensagem).toContain('A SEAB tem até 14/05/2026')

    const depois = estadoDo(novo()).abrirContestacao(
      pedido('ciclo-2026-04', '2026-05-08T12:00:00.000Z'),
    )
    expect(depois.ok).toBe(false)
    expect(depois.mensagem).toContain('acabou em 07/05/2026')
  })

  it('o dia é o do Recife, não o de Greenwich', () => {
    // 08/05 às 02h em UTC ainda é 07/05 às 23h no Recife.
    expect(
      estadoDo(novo()).abrirContestacao(pedido('ciclo-2026-04', '2026-05-08T02:00:00.000Z')).ok,
    ).toBe(true)
  })

  it('mês homologado e não publicado ainda não aceita contestação', () => {
    const resultado = estadoDo(novo()).abrirContestacao(
      pedido('ciclo-2026-06', '2026-07-02T12:00:00.000Z'),
    )
    expect(resultado.ok).toBe(false)
    expect(resultado.mensagem).toContain('ainda não foi publicado')
  })

  it('a publicação feita na cópia abre o prazo de quem publicou, e só dele', () => {
    const seab = novo()
    for (const agora of ['2026-08-03', '2026-08-04', '2026-08-05']) {
      expect(estadoDo(seab).avancarCiclo(ABERTO, 'seab', `${agora}T12:00:00.000Z`).ok).toBe(
        true,
      )
    }
    expect(estadoDo(seab).publicadoEm(ABERTO)).toBe('2026-08-05')
    expect(prazoParaContestar('2026-08-05')).toBe('2026-08-15')

    const julho = pedido(ABERTO, '2026-08-10T12:00:00.000Z')
    expect(estadoDo(seab).abrirContestacao(julho).ok).toBe(true)
    expect(estadoDo(novo()).abrirContestacao(julho).ok).toBe(false)
    // E a outra instância chega ao mesmo lugar só com o diário.
    expect(emOutraInstancia(seab).contestacoes()[0].cicloId).toBe(ABERTO)
  })

  it('as contestações da base de teste respeitam o prazo', () => {
    const estado = estadoDo(null)
    for (const c of BASE.contestacoes) {
      const publicado = estado.publicadoEm(c.cicloId)
      expect(publicado, c.id).not.toBeNull()
      expect(c.abertaEm.slice(0, 10) <= prazoParaContestar(publicado!), c.id).toBe(true)
    }
  })
})

describe('a resposta da SEAB', () => {
  const resposta = (agora: string, decisao: 'acatada' | 'recusada' = 'acatada') => ({
    contestacaoId: 'cont-1',
    decisao,
    texto: 'Revisamos o denominador e excluímos as famílias transferidas.',
    autor: 'seab',
    agora,
  })

  it('responde, o gerente lê, e a trilha guarda o antes e o depois', () => {
    const seab = novo()
    const r = estadoDo(seab).responderContestacao(resposta('2026-05-08T12:00:00.000Z'))
    expect(r.ok, r.mensagem).toBe(true)

    const pedido = emOutraInstancia(seab)
      .contestacoes()
      .find((c) => c.id === 'cont-1')
    expect(pedido?.status).toBe('acatada')
    expect(pedido?.resposta).toContain('denominador')
    expect(pedido?.respondidaEm).toBe('2026-05-08T12:00:00.000Z')

    const evento = estadoDo(seab).eventos()[0]
    expect(evento.tipo).toBe('contestacao_respondida')
    expect(evento.antes).toEqual({ status: 'em_analise' })
    // Aberta num domingo (03/05): 5 dias úteis vão até a sexta, 08/05.
    expect(evento.depois).toMatchObject({
      status: 'acatada',
      prazoParaResponder: '2026-05-08',
      noPrazo: true,
    })

    // A base dos outros continua sem resposta.
    expect(
      estadoDo(novo())
        .contestacoes()
        .find((c) => c.id === 'cont-1')?.status,
    ).toBe('em_analise')
  })

  it('a resposta atrasada entra, mas a trilha diz que foi fora do prazo', () => {
    const seab = novo()
    expect(estadoDo(seab).responderContestacao(resposta('2026-05-11T12:00:00.000Z')).ok).toBe(
      true,
    )
    const evento = estadoDo(seab).eventos()[0]
    expect(evento.depois).toMatchObject({ noPrazo: false })
    expect(evento.descricao).toContain('fora do prazo de 5 dias úteis')
  })

  it('uma resposta só por pedido', () => {
    const seab = novo()
    expect(estadoDo(seab).responderContestacao(resposta('2026-05-08T12:00:00.000Z')).ok).toBe(
      true,
    )
    const deNovo = estadoDo(seab).responderContestacao(
      resposta('2026-05-08T13:00:00.000Z', 'recusada'),
    )
    expect(deNovo.ok).toBe(false)
    expect(seab.diario).toHaveLength(1)
    // Pedido já fechado na base também não reabre.
    expect(
      estadoDo(novo()).responderContestacao({
        ...resposta('2026-05-08T12:00:00.000Z'),
        contestacaoId: 'cont-2',
      }).ok,
    ).toBe(false)
  })
})

describe('a exportação na trilha', () => {
  it('cada CSV vira um evento com recorte e volume', () => {
    const gestor = novo()
    const r = estadoDo(gestor).registrarExportacao(
      {
        cicloId: 'ciclo-2026-06',
        distritoId: 'ds-leste',
        anonimo: true,
        linhas: 4,
        autor: 'gerente_distrital',
        agora: '2026-07-20T12:00:00.000Z',
      },
      'gerente_distrital',
    )
    expect(r.ok).toBe(true)
    const evento = emOutraInstancia(gestor).eventos()[0]
    expect(evento.tipo).toBe('exportacao_gerada')
    expect(evento.depois).toEqual({ distritoId: 'ds-leste', anonimo: true, linhas: 4 })
    expect(evento.descricao).toContain('sem nomes')
  })
})
