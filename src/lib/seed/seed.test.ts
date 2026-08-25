import { describe, expect, it } from 'vitest'
import { gerarBase, SEMENTE_PADRAO } from './gerar'
import { pareceErroDeDigitacao } from './index'
import {
  DISTRITOS,
  INDICADORES,
  SUBINDICADORES,
  TIPOS_UNIDADE,
  UNIDADES,
} from './catalogo'
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
    expect(gerarBase(1).lancamentos).not.toEqual(gerarBase(2).lancamentos)
  })

  it('tem o volume da rede remodelada', () => {
    expect(base.distritos.length).toBe(DISTRITOS.length)
    expect(base.tiposUnidade.length).toBe(TIPOS_UNIDADE.length)
    expect(base.unidades.length).toBe(UNIDADES.length)
    expect(base.unidades.length).toBeGreaterThanOrEqual(12)
    expect(base.indicadores.length).toBe(INDICADORES.length)
    expect(base.subindicadores.length).toBe(SUBINDICADORES.length)
    expect(base.subindicadores.length).toBeGreaterThanOrEqual(10)
    expect(base.ciclos.length).toBe(6)
    // Um gerente por unidade e um por distrito.
    expect(base.gerentes.length).toBe(UNIDADES.length + DISTRITOS.length)
  })

  it('só tem referências válidas', () => {
    const distritos = new Set(base.distritos.map((d) => d.id))
    const tipos = new Set(base.tiposUnidade.map((t) => t.id))
    const unidades = new Set(base.unidades.map((u) => u.id))
    const indicadores = new Set(base.indicadores.map((i) => i.id))
    const subindicadores = new Set(base.subindicadores.map((s) => s.id))
    const ciclos = new Set(base.ciclos.map((c) => c.id))
    const gerentes = new Set(base.gerentes.map((g) => g.id))

    for (const unidade of base.unidades) {
      expect(distritos.has(unidade.distritoId)).toBe(true)
      expect(tipos.has(unidade.tipoId)).toBe(true)
    }
    for (const sub of base.subindicadores) expect(indicadores.has(sub.indicadorId)).toBe(true)
    for (const lancamento of base.lancamentos) {
      expect(subindicadores.has(lancamento.subindicadorId)).toBe(true)
      expect(unidades.has(lancamento.unidadeId)).toBe(true)
      expect(ciclos.has(lancamento.cicloId)).toBe(true)
    }
    for (const regra of base.regras) {
      for (const aplicabilidade of regra.aplicabilidades) {
        expect(tipos.has(aplicabilidade.tipoUnidadeId)).toBe(true)
        expect(indicadores.has(aplicabilidade.indicadorId)).toBe(true)
      }
    }
    for (const contestacao of base.contestacoes) {
      expect(gerentes.has(contestacao.gerenteId)).toBe(true)
      expect(ciclos.has(contestacao.cicloId)).toBe(true)
      if (contestacao.indicadorId) expect(indicadores.has(contestacao.indicadorId)).toBe(true)
    }
  })

  it('todo gerente tem o vínculo do próprio escopo, e só ele', () => {
    for (const gerente of base.gerentes) {
      if (gerente.escopo === 'unidade') {
        expect(gerente.unidadeId).not.toBeNull()
        expect(gerente.distritoId).toBeNull()
      } else {
        expect(gerente.distritoId).not.toBeNull()
        expect(gerente.unidadeId).toBeNull()
      }
    }
  })

  it('o lançamento tem a forma do tipo do subindicador', () => {
    const tipoDe = new Map(base.subindicadores.map((s) => [s.id, s.tipo]))
    for (const lancamento of base.lancamentos) {
      if (tipoDe.get(lancamento.subindicadorId) === 'indice') {
        expect(lancamento.valor).not.toBeNull()
        expect(lancamento.numerador).toBeNull()
        expect(lancamento.denominador).toBeNull()
      } else {
        expect(lancamento.valor).toBeNull()
        expect(lancamento.numerador).not.toBeNull()
        expect(lancamento.denominador).not.toBeNull()
        expect(lancamento.denominador).toBeGreaterThan(0)
      }
    }
  })

  it('só lança o que a regra do ciclo aplica ao tipo da unidade', () => {
    const tipoDaUnidade = new Map(base.unidades.map((u) => [u.id, u.tipoId]))
    const indicadorDoSub = new Map(base.subindicadores.map((s) => [s.id, s.indicadorId]))
    for (const lancamento of base.lancamentos) {
      const ciclo = base.ciclos.find((c) => c.id === lancamento.cicloId)!
      const regra = base.regras.find((r) => r.id === ciclo.regraId)!
      const aplicavel = regra.aplicabilidades.some(
        (a) =>
          a.tipoUnidadeId === tipoDaUnidade.get(lancamento.unidadeId) &&
          a.indicadorId === indicadorDoSub.get(lancamento.subindicadorId),
      )
      expect(aplicavel, `${lancamento.id} sem aplicabilidade`).toBe(true)
    }
  })

  it('não gera avaliação para ciclo que ainda está em lançamento', () => {
    const abertos = base.ciclos.filter((c) => c.estado === 'lancamento_aberto')
    expect(abertos.length).toBeGreaterThan(0)
    for (const ciclo of abertos) {
      expect(base.avaliacoes.filter((a) => a.cicloId === ciclo.id)).toHaveLength(0)
      expect(base.avaliacoesDistritais.filter((a) => a.cicloId === ciclo.id)).toHaveLength(0)
    }
  })

  it('gera avaliação para toda unidade, e a distrital, em todo ciclo fechado', () => {
    const fechados = base.ciclos.filter(
      (c) => c.estado === 'publicado' || c.estado === 'homologado',
    )
    expect(base.avaliacoes.length).toBe(fechados.length * base.unidades.length)
    expect(base.avaliacoesDistritais.length).toBe(fechados.length * base.distritos.length)
  })

  it('a distrital é a média das unidades do distrito', () => {
    const distrital = base.avaliacoesDistritais.find(
      (a) => a.distritoId === 'ds-leste' && a.cicloId === 'ciclo-2026-01',
    )!
    const unidadesDoDistrito = base.unidades.filter((u) => u.distritoId === 'ds-leste')
    expect(distrital.porUnidade.length).toBe(unidadesDoDistrito.length)
    const media =
      distrital.porUnidade.reduce((s, u) => s + u.score, 0) / distrital.porUnidade.length
    expect(Math.abs(distrital.score - media)).toBeLessThan(0.01)
  })

  it('usa a regra vigente da competência de cada ciclo', () => {
    expect(base.ciclos.find((c) => c.competencia === '2026-02')?.regraId).toBe('regra-v1')
    expect(base.ciclos.find((c) => c.competencia === '2026-05')?.regraId).toBe('regra-v2')
  })

  it('a janela de revisão cabe dentro da janela de lançamento', () => {
    for (const ciclo of base.ciclos) {
      expect(ciclo.revisaoInicio >= ciclo.janelaLancamentoInicio.slice(0, 10)).toBe(true)
      expect(ciclo.revisaoInicio <= ciclo.janelaLancamentoFim.slice(0, 10)).toBe(true)
    }
  })

  it('tem uma correção dentro da janela de revisão, e a correção vence', () => {
    const alterado = base.eventos.find((e) => e.tipo === 'lancamento_alterado')
    expect(alterado?.descricao).toContain('janela de revisão')

    const correcao = base.lancamentos.find((l) => l.id.endsWith('-rev'))!
    const original = base.lancamentos.find(
      (l) =>
        l.id !== correcao.id &&
        l.subindicadorId === correcao.subindicadorId &&
        l.unidadeId === correcao.unidadeId &&
        l.cicloId === correcao.cicloId,
    )!
    const ciclo = base.ciclos.find((c) => c.id === correcao.cicloId)!

    expect(correcao.registradoEm > original.registradoEm).toBe(true)
    expect(correcao.registradoEm.slice(0, 10) >= ciclo.revisaoInicio).toBe(true)
    // O valor errado (vírgula deslocada) fica na base; a memória usa o certo.
    expect(original.valor).toBe((correcao.valor ?? 0) * 10)
  })

  it('deixa o ciclo aberto com lançamentos faltando — é o funil da SEAB', () => {
    const aberto = base.ciclos.find((c) => c.estado === 'lancamento_aberto')!
    const regra = base.regras.find((r) => r.id === aberto.regraId)!
    const lancados = base.lancamentos.filter((l) => l.cicloId === aberto.id)

    let esperados = 0
    for (const unidade of base.unidades) {
      for (const aplicabilidade of regra.aplicabilidades) {
        if (aplicabilidade.tipoUnidadeId !== unidade.tipoId) continue
        esperados += base.subindicadores.filter(
          (s) => s.indicadorId === aplicabilidade.indicadorId,
        ).length
      }
    }

    expect(lancados.length).toBeGreaterThan(0)
    expect(lancados.length).toBeLessThan(esperados)
  })

  it('inclui outliers plausíveis, na proporção prometida', () => {
    const tipoDaUnidade = new Map(base.unidades.map((u) => [u.id, u.tipoId]))
    const subPorId = new Map(base.subindicadores.map((s) => [s.id, s]))

    const suspeitos = base.lancamentos.filter((lancamento) => {
      const sub = subPorId.get(lancamento.subindicadorId)!
      const ciclo = base.ciclos.find((c) => c.id === lancamento.cicloId)!
      const regra = base.regras.find((r) => r.id === ciclo.regraId)!
      const aplicabilidade = regra.aplicabilidades.find(
        (a) =>
          a.tipoUnidadeId === tipoDaUnidade.get(lancamento.unidadeId) &&
          a.indicadorId === sub.indicadorId,
      )
      if (!aplicabilidade) return false
      const apurado =
        sub.tipo === 'indice'
          ? (lancamento.valor ?? 0)
          : ((lancamento.numerador ?? 0) / (lancamento.denominador ?? 1)) * 100
      return pareceErroDeDigitacao(apurado, aplicabilidade.meta)
    })

    expect(suspeitos.length).toBeGreaterThan(0)
    expect(suspeitos.length / base.lancamentos.length).toBeLessThan(0.1)
  })

  it('nunca gera valor negativo ou não finito', () => {
    for (const lancamento of base.lancamentos) {
      for (const campo of [lancamento.valor, lancamento.numerador, lancamento.denominador]) {
        if (campo === null) continue
        expect(Number.isFinite(campo)).toBe(true)
        expect(campo).toBeGreaterThanOrEqual(0)
      }
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
