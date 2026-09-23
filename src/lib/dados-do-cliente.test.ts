import { createReadStream, existsSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A GUARDA DA REGRA 1, do lado do dado autorizado.
 *
 * A Secretaria autorizou a base de desempenho por unidade a viver em `ml/data/`
 * (ADR-044). A autorização é para dado INSTITUCIONAL: unidade, distrito,
 * indicador, número. Ela não cobre, e nada cobriria, dado que identifique
 * pessoa, porque isso não é questão de permissão do cliente e sim do art. 20 da
 * LGPD.
 *
 * Por isso a fronteira precisa de teste e não de confiança: entre uma extração
 * e outra, uma coluna a mais no arquivo original passaria batida, e ninguém
 * relê 825 mil linhas à mão. O teste relê.
 *
 * VARRE O ARQUIVO INTEIRO, linha a linha, e não uma amostra. Custa cerca de
 * cinco segundos no `npm test`, o que é caro para um teste e barato para a
 * única coisa neste repositório que não pode falhar em silêncio.
 *
 * Os padrões são ESTREITOS de propósito. A primeira versão procurava telefone
 * como `\\d{2}\\s?9?\\d{4}-?\\d{4}` e acusou 824.782 das 825.029 linhas: num CSV
 * de números, quase toda coluna decimal casa. Padrão que acusa tudo não acusa
 * nada, porque a equipe aprende a ignorá-lo. Aqui o telefone exige parênteses e
 * hífen, o CPF exige a pontuação, e o reforço de verdade vem do cabeçalho: uma
 * coluna chamada "nome" ou "matrícula" reprova o arquivo mesmo que nenhuma
 * linha case com nada.
 */

const PASTA = 'ml/data'

/** O que não pode aparecer em nenhuma linha. */
const PADROES: Record<string, RegExp> = {
  cpf: /\d{3}\.\d{3}\.\d{3}-\d{2}/,
  email: /[\w.-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  telefone: /\(\d{2}\)\s?9?\d{4}-\d{4}/,
}

/** O que não pode nomear uma coluna. */
const COLUNA_DE_PESSOA =
  /\b(nome|cpf|rg|matr[ií]cula|e-?mail|telefone|celular|servidor|funcion[aá]rio|gestor)\b/i

async function varrer(caminho: string): Promise<string[]> {
  const achados: string[] = []
  const linhas = createInterface({
    input: createReadStream(caminho),
    crlfDelay: Number.POSITIVE_INFINITY,
  })

  let numero = 0
  for await (const linha of linhas) {
    numero += 1
    if (numero === 1) {
      const coluna = linha.split(/[,;]/).find((c) => COLUNA_DE_PESSOA.test(c))
      if (coluna) achados.push(`coluna que identifica pessoa: "${coluna.trim()}"`)
    }
    for (const [nome, padrao] of Object.entries(PADROES)) {
      if (padrao.test(linha)) {
        achados.push(`linha ${numero}: ${nome}`)
        break
      }
    }
    // Vinte achados já provam o ponto; o resto só encheria a saída do teste.
    if (achados.length >= 20) break
  }

  return achados
}

describe('a base autorizada do cliente não carrega identificador pessoal', () => {
  const arquivos = existsSync(PASTA)
    ? readdirSync(PASTA).filter((f) => /\.(csv|tsv|json)$/i.test(f))
    : []

  it('a pasta de dados existe e tem arquivo para conferir', () => {
    // Se a pasta sumir, o teste acima passaria vazio e a guarda viraria enfeite.
    expect(arquivos.length).toBeGreaterThan(0)
  })

  for (const arquivo of arquivos) {
    it(
      `${arquivo} não tem CPF, e-mail, telefone nem coluna de pessoa`,
      async () => {
        expect(await varrer(join(PASTA, arquivo))).toEqual([])
      },
      30_000,
    )
  }
})
