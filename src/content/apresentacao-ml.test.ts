import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ARQUIVO_PDF_ML,
  COLUNAS_CRUAS_NO_SLIDE,
  DIVISOR_DAS_SEIS,
  DOMINIOS,
  DURACAO_ML_SEGUNDOS,
  ETAPAS,
  GRUPO_DA_DISCIPLINA,
  LINHAS_FORA,
  PALAVRAS_POR_SEGUNDO,
  SLIDES_ML,
  TETO_DE_PALAVRAS_ML,
  decimal,
  enxuto,
  inicioDoSlideML,
  milhar,
  palavrasFaladas,
  palavrasNaTela,
  rotuloDaColuna,
  textoNaTela,
  type SlideML,
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

  it('fecha no tempo declarado, abaixo de treze minutos', () => {
    const soma = SLIDES_ML.reduce((total, s) => total + s.segundos, 0)
    expect(soma).toBe(DURACAO_ML_SEGUNDOS)
    expect(soma).toBeLessThanOrEqual(13 * 60)
    expect(inicioDoSlideML(SLIDES_ML.length)).toBe(DURACAO_ML_SEGUNDOS)
  })

  it('a fala de cada slide cabe no tempo dele, a um ritmo calmo', () => {
    // A primeira versão prometia 11:05 e a fala somava uns 14 minutos. O tempo
    // do slide agora é medido pela fala: se alguém acrescentar uma frase, o
    // teste pede mais segundos, e o total acima diz se ainda cabe.
    for (const slide of SLIDES_ML) {
      const palavras = palavrasFaladas(slide.id)
      expect(
        palavras / slide.segundos,
        `slide ${slide.numero} (${slide.titulo}): ${palavras} palavras em ${slide.segundos}s`,
      ).toBeLessThanOrEqual(PALAVRAS_POR_SEGUNDO)
    }
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
      const perguntas = (slide as SlideML).perguntas ?? []
      const textos = [
        slide.titulo,
        slide.apoio,
        slide.visual,
        ...slide.notas,
        ...perguntas,
        ...textoNaTela(slide.id),
      ]
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
    expect(enxuto(0.5)).toBe('0,5')
    expect(enxuto(0.8974)).toBe('0,897')
    expect(enxuto(1)).toBe('1')
    expect(enxuto(311)).toBe('311')
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

  it('o roteiro impresso traz o título, a fala e as respostas de cada slide', () => {
    const roteiro = ler('docs/ml-av1.md')
    for (const slide of SLIDES_ML as readonly SlideML[]) {
      expect(roteiro, `slide ${slide.numero}`).toContain(slide.titulo)
      for (const nota of [...slide.notas, ...(slide.perguntas ?? [])]) {
        expect(roteiro, `slide ${slide.numero}`).toContain(nota)
      }
    }
  })

  it('todo valor que os gráficos desenham cabe no eixo', () => {
    // Os domínios são fixos; o dado vem do caderno. Se o caderno rodar com
    // base nova e um ponto passar da ponta, ele sairia da caixa sem aviso.
    const cabe = (valores: number[], dominio: { de: number; ate: number }, onde: string) => {
      expect(Math.min(...valores), onde).toBeGreaterThanOrEqual(dominio.de)
      expect(Math.max(...valores), onde).toBeLessThanOrEqual(dominio.ate)
    }
    const daCaixa = (c: { bigode_baixo: number; bigode_alto: number; fora: readonly number[] }) => [
      c.bigode_baixo,
      c.bigode_alto,
      ...c.fora,
    ]
    cabe([...dados.por_familia, ...dados.por_distrito].flatMap(daCaixa), DOMINIOS.grupos, 'grupos')
    cabe(dados.dispersao.flatMap((p) => [p.esperado, p.lancado]), DOMINIOS.dispersao, 'dispersão')
    cabe(dados.codificacao.nivel_mac.flatMap(daCaixa), DOMINIOS.nivelMac, 'MAC por nível')
  })

  it('a fala sobre as MAC por nível é o que o gráfico mostra', () => {
    // "MAC 1 e 2 ficam todas acima de 1; MAC 3 e 4, todas abaixo do corte."
    // A primeira versão dizia 1,2 e 0,8 digitados à mão, e o gráfico desmentia.
    const extremos = (niveis: number[]) =>
      dados.codificacao.nivel_mac
        .filter((n) => niveis.includes(n.nivel))
        .flatMap((n) => [n.bigode_baixo, n.bigode_alto, ...n.fora])
    expect(Math.min(...extremos([1, 2]))).toBeGreaterThan(1)
    expect(Math.max(...extremos([3, 4]))).toBeLessThan(0.9)
  })

  it('as seis linhas seguem a mesma conta, e são todas as unidades dos seus tipos', () => {
    // É o que a fala do slide 14 afirma. Se deixar de ser verdade, a frase de
    // "padrão, não erro solto" vira invenção.
    expect(LINHAS_FORA).toHaveLength(dados.base.fora_da_regra)
    for (const linha of LINHAS_FORA) {
      expect(linha.soma_dos_pontos_sobre_lancado, `${linha.tipo} ${linha.distrito}`).toBe(DIVISOR_DAS_SEIS)
      expect(dados.base.familias_fora_da_regra).toContain(linha.tipo)
    }
    expect(DIVISOR_DAS_SEIS).toBe(1.7)
    expect(dados.base.unidades_dessas_familias).toBe(dados.base.fora_da_regra)
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
    // O pandas 2 imprime `object`; o 3, `str`. Os dois contam como texto.
    expect(valorDaSerie(eda, '(?:object|str)')).toBe(B.tipos_na_leitura.texto)
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

  it('os outliers do resultado geral, família por família', () => {
    for (const [familia, n] of Object.entries(dados.outliers_geral_por_familia)) {
      expect(pre, familia).toMatch(new RegExp(`^${familia}\\s+${n}$`, 'm'))
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

  it('as classes nas 196 batem com a proporção que o caderno 01 imprime', () => {
    const c = dados.classes_196
    const total = c.abaixo_de_90 + c.noventa_ou_mais
    expect(total).toBe(B.unidades)
    expect(valorDaSerie(eda, '90% ou mais')).toBe(Number((c.noventa_ou_mais / total).toFixed(3)))
    expect(valorDaSerie(eda, 'abaixo de 90%')).toBe(Number((c.abaixo_de_90 / total).toFixed(3)))
  })

  it('as correlações de quatro casas arredondam para as de três que o caderno 02 imprime', () => {
    for (const linha of dados.correlacao_features) {
      expect(Number(linha.com_geral_exata.toFixed(3)), linha.coluna).toBeCloseTo(linha.com_geral, 3)
      expect(Number(linha.com_abaixo_de_90_exata.toFixed(3)), linha.coluna).toBeCloseTo(
        linha.com_abaixo_de_90,
        3,
      )
    }
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
