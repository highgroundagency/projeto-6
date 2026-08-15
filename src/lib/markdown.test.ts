import { describe, expect, it } from 'vitest'
import { analisarMarkdown, segmentar } from './markdown'

describe('analisarMarkdown', () => {
  it('reconhece títulos por nível', () => {
    const nos = analisarMarkdown('# Um\n\n## Dois\n\n### Três')
    expect(nos).toEqual([
      { tipo: 'titulo', nivel: 1, texto: 'Um' },
      { tipo: 'titulo', nivel: 2, texto: 'Dois' },
      { tipo: 'titulo', nivel: 3, texto: 'Três' },
    ])
  })

  it('junta linhas seguidas num único parágrafo', () => {
    const nos = analisarMarkdown('primeira linha\nsegunda linha\n\noutro parágrafo')
    expect(nos).toEqual([
      { tipo: 'paragrafo', texto: 'primeira linha segunda linha' },
      { tipo: 'paragrafo', texto: 'outro parágrafo' },
    ])
  })

  it('lê lista não ordenada e ordenada', () => {
    expect(analisarMarkdown('- um\n- dois')).toEqual([
      { tipo: 'lista', ordenada: false, itens: ['um', 'dois'] },
    ])
    expect(analisarMarkdown('1. um\n2. dois')).toEqual([
      { tipo: 'lista', ordenada: true, itens: ['um', 'dois'] },
    ])
  })

  it('lê tabela com cabeçalho e corpo', () => {
    const nos = analisarMarkdown(
      ['| Data | Ferramenta |', '| --- | --- |', '| 08/08 | Claude |', '| 15/08 | Claude |'].join(
        '\n',
      ),
    )
    expect(nos).toEqual([
      {
        tipo: 'tabela',
        colunas: ['Data', 'Ferramenta'],
        linhas: [
          ['08/08', 'Claude'],
          ['15/08', 'Claude'],
        ],
      },
    ])
  })

  it('não confunde parágrafo com pipe com uma tabela', () => {
    const nos = analisarMarkdown('isto | não é tabela')
    expect(nos[0].tipo).toBe('paragrafo')
  })

  it('lê o documento real de uso de IA sem perder a tabela', async () => {
    const { lerDoc } = await import('./markdown')
    const nos = analisarMarkdown(await lerDoc('uso-de-ia.md'))
    const tabela = nos.find((n) => n.tipo === 'tabela')
    expect(tabela).toBeDefined()
    if (tabela?.tipo === 'tabela') {
      expect(tabela.colunas).toContain('Validado por')
      expect(tabela.linhas.length).toBeGreaterThan(0)
      for (const linha of tabela.linhas) {
        expect(linha).toHaveLength(tabela.colunas.length)
      }
    }
  })
})

describe('segmentar', () => {
  it('separa negrito e mono do texto normal', () => {
    expect(segmentar('antes **forte** meio `mono` fim')).toEqual([
      { texto: 'antes ' },
      { texto: 'forte', forte: true },
      { texto: ' meio ' },
      { texto: 'mono', mono: true },
      { texto: ' fim' },
    ])
  })

  it('devolve o texto inteiro quando não há ênfase', () => {
    expect(segmentar('simples')).toEqual([{ texto: 'simples' }])
  })
})
