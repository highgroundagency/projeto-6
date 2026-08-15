import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { exigirFeature, perfilAtual } from '@/lib/sistema'
import { avancarCiclo } from '@/lib/sistema/estado'

const corpoSchema = z.object({
  cicloId: z.string().min(1).max(60),
  confirmo: z.literal('on'),
})

/** Avanço de estado do ciclo. Só a CAM pode; toda transição vira evento de auditoria. */
export async function POST(requisicao: NextRequest) {
  // Mesmo gate das telas: funcionalidade não liberada não tem API.
  await exigirFeature('painel-cam')

  const destino = requisicao.nextUrl.clone()
  destino.pathname = '/sistema/cam'

  if ((await perfilAtual()) !== 'cam') {
    destino.search = `?erro=${encodeURIComponent('Somente o perfil CAM pode avançar o ciclo.')}`
    return NextResponse.redirect(destino, 303)
  }

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({
    cicloId: formulario.get('cicloId'),
    confirmo: formulario.get('confirmo'),
  })

  if (!analisado.success) {
    destino.search = `?erro=${encodeURIComponent('Confirme a transição antes de avançar.')}`
    return NextResponse.redirect(destino, 303)
  }

  const resultado = avancarCiclo(analisado.data.cicloId, 'comissao', new Date().toISOString())
  destino.search = `?${resultado.ok ? 'ok' : 'erro'}=${encodeURIComponent(resultado.mensagem)}`
  return NextResponse.redirect(destino, 303)
}
