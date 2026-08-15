import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { exigirAdmin } from '@/lib/admin/guard'
import { repositorio } from '@/lib/dados'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirFeature, perfilAtual } from '@/lib/sistema'

const corpoSchema = z.object({
  cicloId: z.string().min(1).max(60),
  confirmo: z.literal('on'),
})

/**
 * Avanço de estado do ciclo.
 *
 * ÚNICA ESCRITA DO SISTEMA QUE EXIGE CREDENCIAL (ADR-015). O estado do ciclo é
 * compartilhado por todos os visitantes da instância, e a transição não tem
 * volta pela interface: um clique alheio deixaria a janela de lançamento
 * fechada para todo mundo. `exigirAdmin` responde 404 em vez de 403 pela mesma
 * razão de `/admin` — não confirmar o mecanismo a quem não deveria conhecê-lo.
 *
 * A checagem de perfil, essa sim, é conveniência de interface: o seletor de
 * perfil é simulado. A validação da transição vive na camada de escrita — e, no
 * schema de `supabase/migrations/`, num gatilho do banco.
 */
export async function POST(requisicao: NextRequest) {
  await exigirAdmin()
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

  const resultado = await repositorio().avancarCiclo(
    analisado.data.cicloId,
    'comissao',
    new Date().toISOString(),
  )

  return redirecionar(
    comParametros('/sistema/cam', { [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }),
  )
}
