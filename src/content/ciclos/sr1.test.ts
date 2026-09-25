import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EQUIPE } from '@/content/equipe'
import { CONTAGENS_PITCH } from '@/content/pitch'
import { cicloPorId } from '@/lib/cronograma'
import { BACKLOG, RISCOS, contarBacklog } from './s6'
import {
  AMEACAS_STRIDE,
  ITENS_OWASP,
  LIMITACOES_DE_SEGURANCA,
  MAPA_DO_PACOTE,
  documentos,
} from './sr1'

/**
 * O pacote do SR1 e os documentos que ele aponta.
 *
 * Cada número daqui é dito na frente da banca, ou é o mapa que ela usa para
 * achar as coisas. Os dois quebram em silêncio se ninguém conferir.
 */

const RAIZ = join(__dirname, '..', '..', '..')
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), 'utf8')

/** Linhas de tabela markdown que não são cabeçalho nem separador. */
function linhasDaTabela(markdown: string, titulo: string): string[] {
  const inicio = markdown.indexOf(titulo)
  if (inicio < 0) throw new Error(`Seção não encontrada: ${titulo}`)
  const depois = markdown.slice(inicio)
  const fim = depois.indexOf('\n## ', 1)
  const secao = fim < 0 ? depois : depois.slice(0, fim)
  return secao
    .split('\n')
    .filter((linha) => linha.startsWith('| '))
    .filter((linha) => !/^\|\s*-{3}/.test(linha))
    .slice(1)
}

describe('o mapa do pacote do SR1', () => {
  it('tem uma linha para cada evidência da matriz, nem mais nem menos', () => {
    // O texto da evidência precisa bater letra por letra com o cronograma: é
    // ele que a banca lê na matriz, e é por ele que procura no mapa.
    for (const bloco of MAPA_DO_PACOTE) {
      expect(bloco.linhas.map((l) => l.evidencia)).toEqual([
        ...cicloPorId(bloco.ciclo).evidencias,
      ])
    }
    expect(MAPA_DO_PACOTE.map((b) => b.ciclo)).toEqual(['s6', 'sr1'])
  })

  it('só aponta para âncora de documento, rota do site ou o repositório', () => {
    for (const bloco of MAPA_DO_PACOTE) {
      for (const linha of bloco.linhas) {
        for (const destino of linha.onde) {
          expect(destino.href, `${linha.evidencia}: ${destino.rotulo}`).toMatch(
            /^(#doc-|#[a-z]|\/[a-z]|https:\/\/)/,
          )
        }
      }
    }
  })
})

describe('a segurança publicada no site', () => {
  const seguranca = ler('docs/seguranca.md')

  it('transcreve as ameaças STRIDE de docs/seguranca.md, sem mudar a contagem', () => {
    expect(AMEACAS_STRIDE).toHaveLength(linhasDaTabela(seguranca, '## STRIDE').length)
    expect(AMEACAS_STRIDE).toHaveLength(CONTAGENS_PITCH.ameacasStride)
  })

  it('transcreve os itens OWASP, com as mesmas parciais', () => {
    const owasp = linhasDaTabela(seguranca, '## OWASP Top 10')
    expect(ITENS_OWASP).toHaveLength(owasp.length)
    expect(ITENS_OWASP).toHaveLength(CONTAGENS_PITCH.itensOwasp)
    expect(ITENS_OWASP.filter((i) => i[1] === 'Parcial')).toHaveLength(
      owasp.filter((l) => l.includes('**Parcial**')).length,
    )
    expect(ITENS_OWASP.filter((i) => i[1] === 'Parcial')).toHaveLength(
      CONTAGENS_PITCH.owaspParciais,
    )
  })

  it('transcreve as limitações conhecidas, uma por uma', () => {
    const inicio = seguranca.indexOf('## Limitações conhecidas')
    const numeradas = seguranca
      .slice(inicio)
      .split('\n')
      .filter((linha) => /^\d+\. /.test(linha))
    expect(LIMITACOES_DE_SEGURANCA).toHaveLength(numeradas.length)
  })
})

describe('os documentos do SR1', () => {
  it('abre com o pacote, que é o mapa dos outros', () => {
    expect(documentos[0].id).toBe('pacote')
  })

  it('não usa travessão no texto que vai para a tela', () => {
    // Regra 8 da casa. Comentário pode; copy não.
    const copy = JSON.stringify([MAPA_DO_PACOTE, AMEACAS_STRIDE, ITENS_OWASP, RISCOS, BACKLOG])
    expect(copy).not.toMatch(/—/)
  })
})

describe('o backlog com estado da Semana 6', () => {
  it('tem as mesmas 26 histórias da Semana 4: 16 Must, 7 Should e 3 Could', () => {
    expect(BACKLOG).toHaveLength(26)
    expect(contarBacklog('M')).toBe(16)
    expect(contarBacklog('S')).toBe(7)
    expect(contarBacklog('C')).toBe(3)
  })

  it('soma os estados das obrigatórias sem sobra', () => {
    const somados =
      contarBacklog('M', 'no_ar') +
      contarBacklog('M', 'so_leitura') +
      contarBacklog('M', 'em_parte') +
      contarBacklog('M', 'falta')
    expect(somados).toBe(contarBacklog('M'))
  })
})

describe('os riscos da Semana 6', () => {
  it('têm dono que existe na equipe, e mitigação escrita', () => {
    const ids = new Set<string>(EQUIPE.map((i) => i.id))
    for (const risco of RISCOS) {
      expect(ids.has(risco.dono), risco.risco).toBe(true)
      expect(risco.mitigacao.trim().length).toBeGreaterThan(10)
    }
  })

  it('cobrem pelo menos os nove riscos da auditoria', () => {
    expect(RISCOS.length).toBeGreaterThanOrEqual(9)
  })
})
