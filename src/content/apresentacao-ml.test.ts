import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ARQUIVO_PDF_ML,
  COLUNAS_CRUAS_NO_SLIDE,
  DURACAO_ML_SEGUNDOS,
  ETAPAS,
  GRUPO_DA_DISCIPLINA,
  SLIDES_ML,
  TETO_DE_PALAVRAS_ML,
  decimal,
  inicioDoSlideML,
  milhar,
  palavrasNaTela,
  rotuloDaColuna,
  textoNaTela,
} from './apresentacao-ml'
import dados from './ml/apresentacao.json'

const RAIZ = join(__dirname, '..', '..')
const ler = (caminho: string) => readFileSync(join(RAIZ, caminho), 'utf8')

/**
 * Tudo o que um caderno imprimiu, em texto: saída de `print` e a representação
 * das tabelas. É contra ISTO que o JSON dos slides é conferido, porque é isto
 * que a professora vê quando abre o caderno.
 */
function saidasDoCaderno(caminho: string): string {
  const caderno = JSON.parse(ler(caminho)) as {
    cells: { cell_type: string; outputs?: { text?: string[]; data?: Record<string, string[]> }[] }[]
  }
  return caderno.cells
    .filter((celula) => celula.cell_type === 'code')
    .flatMap((celula) => celula.outputs ?? [])
    .map((saida) => [...(saida.text ?? []), ...(saida.data?.['text/plain'] ?? [])].join(''))
    .join('\n')
}

/** `ind1    -0.38` → -0.38. A linha de uma Series impressa pelo pandas. */
function valorDaSerie(texto: string, chave: string): number {
  const linha = texto.split('\n').find((l) => new RegExp(`^${chave}\\s+-?\\d`).test(l))
  if (!linha) throw new Error(`Linha "${chave}" não encontrada na saída do caderno`)
  return Number(linha.trim().split(/\s+/).at(-1))
}

describe('a apresentação da AV1 de machine learning', () => {
  it('tem vinte slides numerados em sequência, com ids únicos', () => {
    expect(SLIDES_ML).toHaveLength(20)
    expect(SLIDES_ML.map((s) => s.numero)).toEqual(
      Array.from({ length: SLIDES_ML.length }, (_, i) => i + 1),
    )
    expect(new Set(SLIDES_ML.map((s) => s.id)).size).toBe(SLIDES_ML.length)
  })

  it('passa pelas cinco etapas da avaliação, na ordem, sem pular nenhuma', () => {
    const etapas = SLIDES_ML.map((s) => s.etapa).filter((e) => e !== null)
    // Cada etapa aparece, e nunca se volta para uma anterior: quem avalia
    // confere item a item, na ordem do enunciado.
    expect([...new Set(etapas)]).toEqual([1, 2, 3, 4, 5])
    expect(etapas).toEqual([...etapas].sort())
    expect(Object.keys(ETAPAS)).toHaveLength(5)
  })

  it('fecha no tempo declarado, abaixo de doze minutos', () => {
    const soma = SLIDES_ML.reduce((total, s) => total + s.segundos, 0)
    expect(soma).toBe(DURACAO_ML_SEGUNDOS)
    expect(soma).toBeLessThanOrEqual(12 * 60)
    expect(inicioDoSlideML(SLIDES_ML.length)).toBe(DURACAO_ML_SEGUNDOS)
  })

  it('cabe no teto de palavras: a explicação mora na nota', () => {
    for (const slide of SLIDES_ML) {
      expect(palavrasNaTela(slide.id), `slide ${slide.numero} (${slide.titulo})`).toBeLessThanOrEqual(
        TETO_DE_PALAVRAS_ML,
      )
    }
  })

  it('não usa travessão em texto de tela nem de fala (regra 8 da casa)', () => {
    for (const slide of SLIDES_ML) {
      const textos = [slide.titulo, slide.apoio, slide.visual, ...slide.notas, ...textoNaTela(slide.id)]
      for (const texto of textos) {
        expect(texto, `slide ${slide.numero}`).not.toMatch(/[—–]/)
        expect(texto.trim().length, `slide ${slide.numero}`).toBeGreaterThan(0)
      }
      expect(slide.notas.length, `slide ${slide.numero} sem nota`).toBeGreaterThan(0)
    }
  })

  it('o nome cru das colunas perde o travessão antes de chegar à tela', () => {
    // O dataset nomeia as colunas como "Desempenho consolidado — Indicador 3".
    // O dado pode ter; a tela, não.
    for (const coluna of dados.mais_correlatas.slice(0, COLUNAS_CRUAS_NO_SLIDE)) {
      expect(rotuloDaColuna(coluna.coluna)).not.toMatch(/[—–]/)
    }
    expect(rotuloDaColuna('Desempenho consolidado — Indicador 3.1')).toBe('pontos do ind3')
    expect(rotuloDaColuna('Desempenho consolidado — Indicador 3')).toBe('nota do ind3')
    // A coluna "Indicador 4" só existe na forma de pontos (nota vezes 0,4).
    expect(rotuloDaColuna('Desempenho consolidado — Indicador 4')).toBe('pontos do ind4')
    expect(rotuloDaColuna('Desempenho consolidado — Subindicador 4.IX')).toBe('bloco 4.IX')
    expect(rotuloDaColuna('Total avaliado — Subindicador 2.2')).toBe('total avaliado 2.2')
  })

  it('fala português com os números: vírgula, ponto de milhar e sinal de menos', () => {
    expect(decimal(0.79)).toBe('0,79')
    expect(decimal(-0.629)).toBe('−0,63')
    expect(decimal(-0.0004, 3)).toBe('0,000')
    expect(milhar(63440)).toBe('63.440')
  })

  it('todo texto de tela sai do conteúdo, e não do componente', () => {
    // O mesmo guarda do pitch: sem ele, o teto de palavras deixa de valer.
    for (const caminho of ['src/components/ml/slides.tsx', 'src/components/ml/graficos.tsx']) {
      const frasesLongas = ler(caminho)
        .replace(/\{\/\*[\s\S]*?\*\/\}?/g, ' ')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split('\n')
        .map((linha) => linha.trim())
        .filter((linha) => !/[=<>{}"'`]/.test(linha))
        .filter((linha) => !linha.startsWith('*') && !linha.startsWith('//'))
        .filter((linha) => linha.split(/\s+/).filter(Boolean).length >= 5)
      expect(frasesLongas, `${caminho}: ${frasesLongas.join(' | ')}`).toEqual([])
    }
  })

  it('assina com o grupo da disciplina inteiro', () => {
    expect(GRUPO_DA_DISCIPLINA).toHaveLength(9)
    expect(new Set(GRUPO_DA_DISCIPLINA).size).toBe(GRUPO_DA_DISCIPLINA.length)
  })

  it('o PDF está no rastreamento de arquivos, senão some no deploy', () => {
    const config = ler('next.config.ts')
    expect(config).toContain(`'${ARQUIVO_PDF_ML}'`)
    expect(config).toContain('docs/ml-av1.pdf')
  })

  it('o roteiro impresso traz o título e a fala de cada slide', () => {
    const roteiro = ler('docs/ml-av1.md')
    for (const slide of SLIDES_ML) {
      expect(roteiro, `slide ${slide.numero}`).toContain(slide.titulo)
      for (const nota of slide.notas) expect(roteiro, `slide ${slide.numero}`).toContain(nota)
    }
  })
})

/**
 * O NÚMERO DO SLIDE É O NÚMERO DO CADERNO.
 *
 * O JSON é gravado pelo caderno 07, que repete as contas dos cadernos 01 e 02.
 * Repetir conta é onde as duas versões se separam sem ninguém ver: alguém muda
 * um filtro no 02, roda, e o slide continua mostrando a análise antiga com toda
 * a segurança. Aqui o JSON é comparado com o que 01 e 02 IMPRIMIRAM, que é o que
 * a professora lê. Se falhar, rode o caderno 07 de novo.
 */
describe('os números dos slides batem com as saídas dos cadernos 01 e 02', () => {
  const eda = saidasDoCaderno('ml/notebooks/01-eda.ipynb')
  const pre = saidasDoCaderno('ml/notebooks/02-preprocessamento.ipynb')
  const B = dados.base

  it('tamanho da base, tipos e categóricas', () => {
    expect(eda).toContain(`(${B.linhas}, ${B.colunas})`)
    expect(eda).toContain(`registros: ${B.linhas} | atributos: ${B.colunas}`)
    expect(eda).toContain(`valores distintos: [${B.categoricas.map((c) => c.valores).join(', ')}]`)
    expect(eda).toContain(`numéricas: ${B.numericas}`)
    expect(valorDaSerie(eda, 'object')).toBe(B.tipos_na_leitura.texto)
    expect(valorDaSerie(eda, 'int64')).toBe(B.tipos_na_leitura.inteiro)
    expect(valorDaSerie(eda, 'float64')).toBe(B.tipos_na_leitura.decimal)
    for (const papel of B.papeis) {
      expect(eda, papel.papel).toMatch(new RegExp(`${papel.papel}\\s+${papel.colunas}\\s`))
    }
  })

  it('o funil de linhas: distrito, unidades, fora da regra e modeladas', () => {
    expect(eda).toContain(`unidades: ${B.unidades} | linhas de distrito: ${B.linhas_distrito}`)
    expect(pre).toContain(`linhas fora da regra: ${B.fora_da_regra}`)
    expect(pre).toContain(`(${B.modeladas}, 8)`)
    expect(B.unidades - B.fora_da_regra).toBe(B.modeladas)
  })

  it('assimetria e outliers das notas, nas 196 unidades', () => {
    for (const nota of dados.distribuicao) {
      expect(valorDaSerie(eda, nota.coluna), `assimetria de ${nota.coluna}`).toBe(nota.assimetria)
    }
    for (const outlier of dados.outliers) {
      const linha = eda.split('\n').find((l) => new RegExp(`^${outlier.coluna}\\s+\\d+\\s+\\d`).test(l))
      expect(linha, outlier.coluna).toBeDefined()
      const [, unidades, percentual] = (linha ?? '').trim().split(/\s+/)
      expect(Number(unidades)).toBe(outlier.unidades)
      expect(Number(percentual)).toBe(outlier.percentual)
    }
  })

  it('ausentes e inconsistências da planilha', () => {
    expect(eda).toContain(`colunas com algum ausente: ${dados.faltantes.colunas_com_ausente} de ${B.colunas}`)
    expect(pre).toContain(`ausentes antes: ${dados.faltantes.na_leitura} | depois: ${dados.faltantes.depois_da_conversao}`)
    expect(eda).toContain(
      `colunas constantes nas unidades (não informam nada ao modelo): ${dados.inconsistencias.colunas_constantes}`,
    )
    expect(eda).toContain(`colunas que misturam 0.8 e 80%: ${dados.inconsistencias.colunas_fracao_e_percentual}`)
    for (const meta of dados.inconsistencias.metas_escritas_de_dois_jeitos) {
      expect(eda).toContain(meta.coluna)
    }
  })

  it('as seis linhas fora da regra, unidade por unidade', () => {
    for (const linha of dados.linhas_fora_da_regra) {
      // O pandas imprime 1.8790 onde o JSON guarda 1.879: zero à direita é opcional.
      const numero = (valor: number) => `${String(valor).replace('.', '\\.')}0*`
      const casa = new RegExp(
        `${linha.tipo}\\s+${linha.distrito}\\s+[\\d.]+\\s+${numero(linha.lancado)}\\s+${numero(linha.esperado)}\\b`,
      )
      expect(pre, `${linha.tipo} ${linha.distrito}`).toMatch(casa)
    }
    expect(dados.dispersao.filter((p) => p.fora)).toHaveLength(B.fora_da_regra)
    expect(dados.dispersao).toHaveLength(B.unidades)
  })

  it('as features novas: correlação, assimetria e descartadas', () => {
    for (const linha of dados.correlacao_features) {
      const casa = new RegExp(`^${linha.coluna}\\s+${linha.com_geral}\\s+${linha.com_abaixo_de_90}$`, 'm')
      expect(pre, linha.coluna).toMatch(casa)
    }
    for (const feature of dados.features_novas) {
      expect(valorDaSerie(pre, feature.coluna), `assimetria de ${feature.coluna}`).toBe(feature.assimetria)
    }
    const d = dados.descartadas
    expect(pre).toContain(`assimetria do ind4: ${d.assimetria_ind4} | do log(ind4): ${d.assimetria_log_ind4}`)
    expect(pre).toContain(`correlação do porte com o geral: ${d.correlacao_porte_geral}`)
    expect(pre).toContain(`(${dados.codificacao.linhas}, ${dados.codificacao.colunas_finais})`)
  })

  it('as classes batem com o documento das etapas 1 e 2', () => {
    const documento = ler('ml/documento-problema-e-dados.md')
    const total = dados.classes.abaixo_de_90 + dados.classes.noventa_ou_mais
    expect(total).toBe(B.modeladas)
    expect(documento).toContain(`| ${dados.classes.noventa_ou_mais} |`)
    expect(documento).toContain(`| ${dados.classes.abaixo_de_90} |`)
  })

  it('não carrega nada que identifique pessoa', () => {
    // A menor coisa no JSON é a unidade, por tipo e distrito. Mesmos padrões
    // estreitos de `dados-do-cliente.test.ts`.
    const texto = JSON.stringify(dados)
    expect(texto).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
    expect(texto).not.toMatch(/[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
    expect(texto).not.toMatch(/\(\d{2}\)\s?9?\d{4}-\d{4}/)
    expect(texto).not.toMatch(/"(nome|cpf|matr[ií]cula|e-?mail|telefone)"/i)
  })
})
