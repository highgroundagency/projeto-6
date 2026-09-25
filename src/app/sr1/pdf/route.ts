import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { obterVisao, podeVer } from '@/lib/visao'

/**
 * O PDF do SR1, atrás do MESMO portão da página, como o do Kick-off.
 *
 * Mora em `docs/` e sai por rota, nunca por `public/`: arquivo estático não
 * passa por `obterVisao()`. O custo também é o mesmo: `readFile` sobre
 * `process.cwd()` é invisível para o rastreador da Vercel, e a linha em
 * `next.config.ts` é conferida por `apresentacao-sr1.test.ts`. Sem o arquivo,
 * 404, nunca erro de servidor.
 */
export const dynamic = 'force-dynamic'

const CAMINHO = join(process.cwd(), 'docs', 'sr1.pdf')

export async function GET(): Promise<Response> {
  const visao = await obterVisao()
  if (!podeVer(visao, 'sr1')) return new Response(null, { status: 404 })

  const pdf = await readFile(CAMINHO).catch(() => null)
  if (!pdf) return new Response(null, { status: 404 })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="prumo-sr1.pdf"',
      'cache-control': 'no-store',
    },
  })
}
