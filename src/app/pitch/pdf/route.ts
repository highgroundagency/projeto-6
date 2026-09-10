import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { obterVisao, podeVer } from '@/lib/visao'

/**
 * O PDF dos slides, atrás do MESMO portão da página.
 *
 * A tentação era gravar o arquivo em `public/` e acabar: o Next serve
 * estático sem esforço e sem risco de runtime. Só que `public/` não passa por
 * `obterVisao()`. O deck inteiro, num arquivo só, com nome adivinhável,
 * responderia 200 nos dias em que `/pitch` responde 404 — e a garantia do
 * §6.3 é a única coisa que este repositório trata como inegociável. As nove
 * capturas já faziam isso sem ninguém ter notado; corrigir uma e abrir a
 * outra seria trocar seis por meia dúzia.
 *
 * Então o arquivo mora em `docs/`, fora do alcance do servidor de estáticos, e
 * quem o entrega é esta rota, que confere o release antes. Continua
 * funcionando sem JavaScript: é uma âncora comum.
 *
 * O CUSTO, DITO NA CARA: `readFile` sobre `process.cwd()` é invisível para o
 * rastreador de arquivos da Vercel, e sem a linha correspondente em
 * `next.config.ts` isto funciona local e some no deploy. `pitch.test.ts`
 * confere que a linha existe, e a falha aqui é 404, nunca um erro de servidor.
 */
export const dynamic = 'force-dynamic'

const CAMINHO = join(process.cwd(), 'docs', 'pitch-kickoff.pdf')

export async function GET(): Promise<Response> {
  const visao = await obterVisao()
  if (!podeVer(visao, 'ko')) return new Response(null, { status: 404 })

  const pdf = await readFile(CAMINHO).catch(() => null)
  if (!pdf) return new Response(null, { status: 404 })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="prumo-pitch-kickoff.pdf"',
      'cache-control': 'no-store',
    },
  })
}
