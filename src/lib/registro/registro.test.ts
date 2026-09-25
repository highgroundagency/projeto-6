import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CARREGADORES, carregarCiclos } from '@/content/ciclos/registro'
import { EQUIPE, type IntegranteId } from '@/content/equipe'
import { CRONOGRAMA, IDS_CICLOS, indiceDoCiclo, type CicloId } from '@/lib/cronograma'
import { hojeEmRecife } from '@/lib/datas'
import type { Bloco, RegistroSemana } from './tipos'

const IDS_INTEGRANTES = new Set<string>(EQUIPE.map((i) => i.id))

const COM_CONTEUDO = IDS_CICLOS.filter((id) => CARREGADORES[id] !== null)

const carregados = await carregarCiclos(COM_CONTEUDO)

function blocos(registro: RegistroSemana): [string, Bloco<unknown>][] {
  return Object.entries(registro).filter(
    (par): par is [string, Bloco<unknown>] =>
      typeof par[1] === 'object' && par[1] !== null && 'selo' in par[1],
  )
}

/**
 * As âncoras `#doc-<ciclo>-<id>` de todos os documentos publicados até este
 * ciclo, inclusive. É o que existe na página quando este ciclo aparece.
 */
function ancorasAte(ate: CicloId): Set<string> {
  const limite = indiceDoCiclo(ate)
  return new Set(
    carregados
      .filter((c) => indiceDoCiclo(c.id) <= limite)
      .flatMap((c) => (c.modulo.documentos ?? []).map((d) => `#doc-${c.id}-${d.id}`)),
  )
}

function textos(valor: unknown): string[] {
  if (typeof valor === 'string') return [valor]
  if (Array.isArray(valor)) return valor.flatMap(textos)
  if (valor && typeof valor === 'object') return Object.values(valor).flatMap(textos)
  return []
}

describe('registry de ciclos', () => {
  it('declara os 18 ciclos, sem esquecer nenhum', () => {
    expect(Object.keys(CARREGADORES).sort()).toEqual([...IDS_CICLOS].sort())
  })

  it('carrega apenas os ciclos pedidos', async () => {
    const apenasUm = await carregarCiclos(['s1'])
    expect(apenasUm.map((c) => c.id)).toEqual(['s1'])
  })

  it('ignora ciclo sem registro em vez de quebrar', async () => {
    expect(await carregarCiclos(['i1'])).toEqual([])
  })

  it('tem conteúdo para todos os ciclos já vencidos', () => {
    // Esta é a diretriz "atualizado semanalmente" virando teste: quando uma
    // semana passa sem registro, o CI acusa. Pausas não têm registro próprio.
    const hoje = hojeEmRecife()
    const vencidosSemRegistro = CRONOGRAMA.filter(
      (c) => c.data <= hoje && c.tipo !== 'pausa' && CARREGADORES[c.id as CicloId] === null,
    ).map((c) => `${c.id} (${c.data})`)

    expect(
      vencidosSemRegistro,
      `Ciclos já vencidos sem registro semanal: ${vencidosSemRegistro.join(', ')}. Escreva src/content/ciclos/<id>.tsx e registre o carregador.`,
    ).toEqual([])
  })
})

describe('conteúdo dos ciclos', () => {
  it('carregou o que era esperado', () => {
    expect(carregados.length).toBe(COM_CONTEUDO.length)
    expect(carregados.length).toBeGreaterThanOrEqual(5)
  })

  for (const { id, modulo } of carregados) {
    describe(id, () => {
      const registro = modulo.registro

      it('declara o próprio ciclo', () => {
        expect(registro.ciclo).toBe(id)
      })

      it('tem marcador único e no formato esperado', () => {
        expect(registro.marcador).toBe(`PRUMO-MARCADOR-CICLO-${id}`)
      })

      it('não tem texto vazio em nenhum bloco', () => {
        for (const [nome, bloco] of blocos(registro)) {
          for (const texto of textos(bloco.conteudo)) {
            expect(texto.trim(), `bloco "${nome}" tem texto vazio`).not.toBe('')
          }
        }
      })

      it('mantém selo e validador coerentes', () => {
        for (const [nome, bloco] of blocos(registro)) {
          if (bloco.selo === 'rascunho') {
            expect(
              bloco.validadoPor,
              `bloco "${nome}" em rascunho não pode ter validador`,
            ).toBeNull()
          } else {
            expect(
              bloco.validadoPor && IDS_INTEGRANTES.has(bloco.validadoPor),
              `bloco "${nome}" validado precisa de um integrante existente`,
            ).toBe(true)
          }
        }
      })

      it('nomeia responsáveis que existem na equipe', () => {
        const responsaveis = registro.responsaveis.conteudo
        expect(responsaveis.length).toBeGreaterThan(0)
        for (const { integrante } of responsaveis) {
          expect(IDS_INTEGRANTES.has(integrante), `integrante inexistente: ${integrante}`).toBe(
            true,
          )
        }
      })

      it('não repete o mesmo integrante na lista de responsáveis', () => {
        const ids = registro.responsaveis.conteudo.map((r) => r.integrante as IntegranteId)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('só tem link de evidência utilizável', () => {
        for (const evidencia of registro.evidencias.conteudo) {
          expect(
            /^(https?:\/\/|\/|#doc-)/.test(evidencia.url),
            `evidência "${evidencia.rotulo}" com url inválida: ${evidencia.url}`,
          ).toBe(true)
          expect(evidencia.rotulo.trim()).not.toBe('')
        }
      })

      it('não aponta para documento que não existe', () => {
        // Âncora de documento é link interno: se o id mudar e a evidência não
        // acompanhar, o professor clica e não acontece nada. O CI acusa antes.
        //
        // Vale para documento de OUTRA semana também (o SR1 aponta para os
        // riscos da Semana 6), desde que a semana de destino não venha depois
        // desta: semana futura ainda não está na página, e o link cairia no
        // vazio no dia em que esta fosse publicada sozinha.
        const existentes = ancorasAte(id)
        const ancoras = registro.evidencias.conteudo
          .map((e) => e.url)
          .filter((url) => /^\/?#doc-/.test(url))

        for (const ancora of ancoras) {
          expect(
            existentes.has(ancora.replace(/^\//, '')),
            `âncora sem documento correspondente: ${ancora}`,
          ).toBe(true)
        }
      })

      it('não tem link para âncora sem destino dentro dos documentos', () => {
        // O pacote do SR1 e a correção de rota são feitos de links. Renderizar
        // o documento é o único jeito de ver o que ele aponta de verdade.
        const existentes = ancorasAte(id)
        for (const doc of modulo.documentos ?? []) {
          const html = renderToStaticMarkup(createElement(doc.Conteudo))
          const ancoras = [...html.matchAll(/href="\/?(#doc-[^"]+)"/g)].map((m) => m[1])
          for (const ancora of ancoras) {
            expect(
              existentes.has(ancora),
              `documento "${doc.titulo}" aponta para âncora sem destino: ${ancora}`,
            ).toBe(true)
          }
        }
      })

      it('dá id único e resumo a cada documento', () => {
        const docs = modulo.documentos ?? []
        expect(new Set(docs.map((d) => d.id)).size).toBe(docs.length)
        for (const doc of docs) {
          expect(doc.titulo.trim(), 'documento sem título').not.toBe('')
          expect(doc.resumo.trim(), `documento "${doc.titulo}" sem resumo`).not.toBe('')
        }
      })

      it('preenche bloqueios com "nenhum" ou com bloqueios de verdade', () => {
        const bloqueios = registro.bloqueios.conteudo
        if (bloqueios !== 'nenhum') {
          expect(bloqueios.length).toBeGreaterThan(0)
        }
      })

      it('registra objetivo em uma frase curta', () => {
        expect(registro.objetivo.conteudo.length).toBeGreaterThan(20)
        expect(registro.objetivo.conteudo.length).toBeLessThan(220)
      })

      it('explica o porquê de cada decisão', () => {
        for (const decisao of registro.decisoes.conteudo) {
          expect(decisao.porque.trim().length).toBeGreaterThan(10)
        }
      })
    })
  }

  it('não repete marcador entre ciclos', () => {
    const marcadores = carregados.map((c) => c.modulo.registro.marcador)
    expect(new Set(marcadores).size).toBe(marcadores.length)
  })
})
