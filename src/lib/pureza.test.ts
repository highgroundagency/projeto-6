import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * FUNÇÃO DE APTIDÃO ARQUITETURAL: a camada de domínio não aponta para fora.
 *
 * O desenho do C4 nível 3 afirma que nenhuma seta sai do domínio, e a ADR do
 * estilo repete isso. Afirmação em documento não segura fronteira: qualquer
 * pessoa pode importar o repositório dentro do motor amanhã, o `tsc` aprova, e
 * o desenho vira mentira sem ninguém perceber.
 *
 * Este teste é o que transforma a fronteira em regra executável. Ele lê o texto
 * dos arquivos de propósito, em vez de inspecionar módulos carregados: o que
 * importa aqui é o que está ESCRITO, porque é isso que a próxima pessoa vai ler
 * e copiar.
 *
 * As duas proibições têm motivos diferentes:
 *
 * - Importar I/O quebra a testabilidade e a reprodutibilidade de uma vez.
 * - Ler o relógio ou sortear número quebra só a reprodutibilidade, e de um jeito
 *   pior, porque o teste continua passando. Um mês recalculado em dezembro tem
 *   de devolver o número de fevereiro; `new Date()` dentro da regra faz o
 *   resultado depender do dia em que alguém apertou o botão.
 */

/** Os arquivos que a arquitetura declara puros. */
const MODULOS_PUROS = [
  'calculo/motor.ts',
  'releases.ts',
  'cronograma.ts',
  'datas.ts',
] as const

/** O que nenhum deles pode importar, e por quê. */
const IMPORTES_PROIBIDOS: readonly { padrao: RegExp; porque: string }[] = [
  { padrao: /from ['"]node:/, porque: 'I/O do Node' },
  { padrao: /from ['"]fs['"]/, porque: 'sistema de arquivos' },
  { padrao: /from ['"]next\//, porque: 'framework de entrega' },
  { padrao: /from ['"]react['"]/, porque: 'camada de apresentação' },
  { padrao: /from ['"]@\/lib\/dados/, porque: 'acesso a dados' },
  { padrao: /from ['"]@\/lib\/config/, porque: 'estado de configuração' },
  { padrao: /from ['"]@\/lib\/seed/, porque: 'a origem concreta dos dados' },
  { padrao: /from ['"]@\/lib\/admin/, porque: 'sessão e autorização' },
  { padrao: /from ['"]@\/components/, porque: 'componentes de tela' },
]

/** O que nenhum deles pode chamar: fontes de não determinismo. */
const CHAMADAS_PROIBIDAS: readonly { padrao: RegExp; porque: string }[] = [
  { padrao: /\bMath\.random\s*\(/, porque: 'aleatoriedade' },
  { padrao: /\bDate\.now\s*\(/, porque: 'relógio' },
  { padrao: /\bperformance\.now\s*\(/, porque: 'relógio' },
]

/**
 * O relógio pode aparecer, e só de um jeito: como VALOR PADRÃO DE PARÂMETRO.
 *
 * `hojeEmRecife(agora: Date = new Date())` é permitido; `const hoje = new Date()`
 * dentro do corpo não é. A diferença não é estética: no primeiro caso quem chama
 * escolhe o instante, e a vitrine consegue simular 2027 para conferir o site; no
 * segundo o resultado passa a depender do dia em que alguém apertou o botão, e um
 * mês recalculado deixa de reproduzir o próprio número.
 *
 * `new Date(epoch)` e `new Date(Date.UTC(...))` continuam livres: construir uma
 * data a partir de argumentos é aritmética, não leitura de relógio.
 */
const RELOGIO_SEM_ARGUMENTO = /new Date\s*\(\s*\)/g
// O padrão exige a ANOTAÇÃO DE TIPO junto: `agora: Date = new Date()`. Sem ela,
// `const agora = new Date()` passaria batido, que foi o primeiro furo deste
// teste quando ele foi escrito, achado injetando a violação de propósito.
const RELOGIO_COMO_PADRAO = /:\s*Date\s*=\s*new Date\s*\(\s*\)/g

function ler(caminho: string): string {
  return readFileSync(join(process.cwd(), 'src/lib', caminho), 'utf8')
}

/** Sem comentários: um `new Date()` citado num comentário não é uma chamada. */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
}

describe('a camada de domínio não aponta para fora', () => {
  for (const modulo of MODULOS_PUROS) {
    describe(modulo, () => {
      const fonte = ler(modulo)
      const codigo = semComentarios(fonte)

      for (const { padrao, porque } of IMPORTES_PROIBIDOS) {
        it(`não importa ${porque}`, () => {
          expect(codigo, `${modulo} importa ${porque}`).not.toMatch(padrao)
        })
      }

      for (const { padrao, porque } of CHAMADAS_PROIBIDAS) {
        it(`não usa ${porque}`, () => {
          expect(codigo, `${modulo} usa ${porque}`).not.toMatch(padrao)
        })
      }

      it('lê o relógio só como valor padrão de parâmetro', () => {
        const total = (codigo.match(RELOGIO_SEM_ARGUMENTO) ?? []).length
        const comoPadrao = (codigo.match(RELOGIO_COMO_PADRAO) ?? []).length
        expect(
          total - comoPadrao,
          `${modulo} lê o relógio dentro do corpo de alguma função`,
        ).toBe(0)
      })

      it('só importa tipos, dados estáticos versionados, ou outros módulos puros', () => {
        const linhas = codigo.match(/^import[^\n]*$/gm) ?? []
        const runtime = linhas.filter((l) => !l.startsWith('import type'))
        // Dado estático versionado é constante de compilação, não acesso a
        // dados: importar o cronograma não é I/O. O que não pode entrar é
        // ACESSOR, e por isso a lista é explícita em vez de liberar `@/content`
        // inteiro, onde moram os ciclos server-only.
        // Aceita as duas formas que o repositório usa: alias e caminho relativo.
        const permitidos =
          /(@\/lib\/|\.\/)(datas|cronograma|ambiente|tipos|calculo\/tipos)['"]|@\/content\/vitrine/
        for (const linha of runtime) {
          expect(linha, `${modulo}: import de runtime não permitido`).toMatch(permitidos)
        }
      })
    })
  }

  it('o "hoje" entra como argumento, nunca é lido dentro da regra', () => {
    // A assinatura é a prova: se `hoje` não fosse parâmetro, ele viria do
    // relógio, e a vitrine que simula datas deixaria de funcionar.
    expect(ler('releases.ts')).toMatch(/hoje:\s*DataISO/)
  })
})
