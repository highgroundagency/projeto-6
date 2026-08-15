import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { comParametros, redirecionar } from '@/lib/http'
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

  if ((await perfilAtual()) !== 'cam') {
    return redirecionar(
      comParametros('/sistema/cam', { erro: 'Somente o perfil CAM pode avançar o ciclo.' }),
    )
  }

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({
    cicloId: formulario.get('cicloId'),
    confirmo: formulario.get('confirmo'),
  })

  if (!analisado.success) {
    return redirecionar(
      comParametros('/sistema/cam', { erro: 'Confirme a transição antes de avançar.' }),
    )
  }

  const resultado = avancarCiclo(analisado.data.cicloId, 'comissao', new Date().toISOString())
  return redirecionar(
    comParametros('/sistema/cam', {
      [resultado.ok ? 'ok' : 'erro']: resultado.mensagem,
    }),
  )
}
