import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * O PDF da AV1 de machine learning.
 *
 * Mora em `docs/`, como o do Kick-off, e sai por rota, e não por `public/`:
 * mesmo sem portão de release, é um lugar só para os PDFs de apresentação, e o
 * mesmo teste que protege um protege o outro. O custo é o mesmo também:
 * `readFile` sobre `process.cwd()` é invisível para o rastreador da Vercel, e
 * a linha correspondente em `next.config.ts` é conferida por
 * `apresentacao-ml.test.ts`. Sem o arquivo, 404, nunca erro de servidor.
 */
export const dynamic = 'force-dynamic'

const CAMINHO = join(process.cwd(), 'docs', 'ml-av1.pdf')

export async function GET(): Promise<Response> {
  const pdf = await readFile(CAMINHO).catch(() => null)
  if (!pdf) return new Response(null, { status: 404 })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="prumo-av1-machine-learning.pdf"',
      'cache-control': 'no-store',
    },
  })
}
