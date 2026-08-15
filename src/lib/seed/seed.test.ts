import { describe, expect, it } from 'vitest'
import { gerarBase, SEMENTE_PADRAO } from './gerar'
import { pareceErroDeDigitacao } from './index'
import { AREAS, INDICADORES } from './catalogo'
import { prng } from './prng'

const base = gerarBase(SEMENTE_PADRAO)

describe('prng', () => {
  it('é determinístico para a mesma semente', () => {
    const a = prng(7)
    const b = prng(7)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('produz sequências diferentes para sementes diferentes', () => {
    expect(prng(1)()).not.toBe(prng(2)())
  })

  it('fica no intervalo [0, 1)', () => {
    const aleatorio = prng(99)
    for (let i = 0; i < 500; i++) {
      const valor = aleatorio()
      expect(valor).toBeGreaterThanOrEqual(0)
      expect(valor).toBeLessThan(1)
    }
  })
})

describe('base sintética', () => {
  it('é reproduzível: mesma semente, mesma base', () => {
    expect(gerarBase(SEMENTE_PADRAO)).toEqual(gerarBase(SEMENTE_PADRAO))
  })

  it('muda quando a semente muda', () => {
    expect(gerarBase(1).lancamentos[0].valor).not.toBe(gerarBase(2).lancamentos[0].valor)
  })

  it('tem o volume prometido no briefing', () => {
    expect(base.areas.length).toBe(AREAS.length)
    expect(base.areas.length).toBeGreaterThanOrEqual(10)
    expect(base.indicadores.length).toBe(INDICADORES.length)
    expect(base.indicadores.length).toBeGreaterThanOrEqual(25)
    expect(base.ciclos.length).toBe(6)
    expect(base.gestores.length).toBe(AREAS.length)
  })

  it('só tem referências válidas', () => {
    const areas = new Set(base.areas.map((a) => a.id))
    const indicadores = new Set(base.indicadores.map((i) => i.id))
    const ciclos = new Set(base.ciclos.map((c) => c.id))

    for (const indicador of base.indicadores) expect(areas.has(indicador.areaId)).toBe(true)
    for (const gestor of base.gestores) expect(areas.has(gestor.areaId)).toBe(true)
    for (const lancamento of base.lancamentos) {
      expect(indicadores.has(lancamento.indicadorId)).toBe(true)
      expect(ciclos.has(lancamento.cicloId)).toBe(true)
    }
    for (const contestacao of base.contestacoes) {
      expect(ciclos.has(contestacao.cicloId)).toBe(true)
      if (contestacao.indicadorId) expect(indicadores.has(contestacao.indicadorId)).toBe(true)
    }
  })

  it('não gera avaliação para ciclo que ainda está em lançamento', () => {
    const abertos = base.ciclos.filter((c) => c.estado === 'lancamento_aberto')
    expect(abertos.length).toBeGreaterThan(0)
    for (const ciclo of abertos) {
      expect(base.avaliacoes.filter((a) => a.cicloId === ciclo.id)).toHaveLength(0)
    }
  })

  it('gera avaliação para todo gestor em todo ciclo fechado', () => {
    const fechados = base.ciclos.filter(
      (c) => c.estado === 'publicado' || c.estado === 'homologado',
    )
    expect(base.avaliacoes.length).toBe(fechados.length * base.gestores.length)
  })

  it('usa a regra vigente da competência de cada ciclo', () => {
    expect(base.ciclos.find((c) => c.competencia === '2026-02')?.regraId).toBe('regra-v1')
    expect(base.ciclos.find((c) => c.competencia === '2026-05')?.regraId).toBe('regra-v2')
  })

  it('deixa o ciclo aberto com lançamentos faltando — é o funil da CAM', () => {
    const aberto = base.ciclos.find((c) => c.estado === 'lancamento_aberto')!
    const lancados = base.lancamentos.filter((l) => l.cicloId === aberto.id)
    expect(lancados.length).toBeGreaterThan(0)
    expect(lancados.length).toBeLessThan(base.indicadores.length)
  })

  it('inclui outliers plausíveis, na proporção prometida', () => {
    const suspeitos = base.lancamentos.filter((lancamento) => {
      const indicador = base.indicadores.find((i) => i.id === lancamento.indicadorId)!
      return pareceErroDeDigitacao(lancamento.valor, indicador.meta)
    })
    expect(suspeitos.length).toBeGreaterThan(0)
    expect(suspeitos.length / base.lancamentos.length).toBeLessThan(0.1)
  })

  it('nunca gera valor negativo ou não finito', () => {
    for (const lancamento of base.lancamentos) {
      expect(Number.isFinite(lancamento.valor)).toBe(true)
      expect(lancamento.valor).toBeGreaterThanOrEqual(0)
    }
  })

  it('mantém a trilha de auditoria em ordem decrescente e sem id repetido', () => {
    const ids = base.eventos.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    const quandos = base.eventos.map((e) => e.quando)
    expect([...quandos].sort().reverse()).toEqual(quandos)
  })

  it('registra ao menos um evento com antes e depois — o diff que a planilha não tem', () => {
    const comDiff = base.eventos.filter((e) => e.antes !== null && e.depois !== null)
    expect(comDiff.length).toBeGreaterThan(0)
  })

  it('não contém identificador pessoal de nenhum tipo', () => {
    // A base é 100% sintética (§2.4): sem CPF, e-mail, telefone ou matrícula.
    // A asserção compara listas de achados para não despejar a base inteira
    // na saída do teste quando algo falha.
    const texto = JSON.stringify(base)
    const padroes: Record<string, RegExp> = {
      cpf: /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
      email: /[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
      telefone: /\(?\d{2}\)?\s?9?\d{4}-?\d{4}/g,
      matricula: /\bmatr[ií]cula\b|\bcpf\b|\brg\b/gi,
    }

    const achados = Object.entries(padroes)
      .map(([nome, padrao]) => ({ nome, quantidade: (texto.match(padrao) ?? []).length }))
      .filter((a) => a.quantidade > 0)

    expect(achados).toEqual([])
  })
})

describe('pareceErroDeDigitacao', () => {
  it('sinaliza vírgula deslocada para cima e para baixo', () => {
    expect(pareceErroDeDigitacao(950, 95)).toBe(true)
    expect(pareceErroDeDigitacao(9.5, 95)).toBe(true)
  })

  it('não sinaliza variação normal', () => {
    expect(pareceErroDeDigitacao(88, 95)).toBe(false)
    expect(pareceErroDeDigitacao(112, 95)).toBe(false)
  })

  it('não divide por zero quando a meta é zero', () => {
    expect(pareceErroDeDigitacao(10, 0)).toBe(false)
  })
})
