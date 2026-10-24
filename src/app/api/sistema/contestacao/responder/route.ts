import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { repositorio } from '@/lib/dados'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirPerfil, perfilAtual } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** Volta para a sanfona da contestação, no gerente do pedido respondido. */
function deVolta(
  gerente: string | undefined,
  resultado: { ok?: string; erro?: string },
): string {
  return comParametros(
    '/sistema',
    { abrir: 'contestacao', de: 'contestacao', cont_gerente: gerente, ...resultado },
    ancoraDaTela('contestacao'),
  )
}

const corpoSchema = z.object({
  contestacaoId: z.string().min(1).max(80),
  decisao: z.enum(['acatada', 'recusada']),
  texto: z.string().trim().min(20).max(1000),
})

/**
 * A resposta por escrito da SEAB a um pedido de revisão (art. 9º).
 *
 * Só a SEAB responde: quem é avaliado não decide o próprio recurso, e o
 * administrador cuida da plataforma, não das notas. Como o avanço de etapa e o
 * lançamento, a resposta cai na cópia de quem respondeu, no diário do cookie.
 */
export async function POST(requisicao: NextRequest) {
  await exigirPerfil('contestacao')

  const formulario = await requisicao.formData()
  const gerente = String(formulario.get('gerenteId') ?? '') || undefined

  if ((await perfilAtual()) !== 'seab') {
    return redirecionar(deVolta(gerente, { erro: 'Somente a SEAB responde contestação.' }))
  }

  const analisado = corpoSchema.safeParse({
    contestacaoId: formulario.get('contestacaoId'),
    decisao: formulario.get('decisao'),
    texto: formulario.get('texto'),
  })

  if (!analisado.success) {
    return redirecionar(
      deVolta(gerente, {
        erro: 'Escolha acatar ou recusar e escreva a resposta, entre 20 e 1000 caracteres.',
      }),
    )
  }

  const resultado = await repositorio().responderContestacao(
    { ...analisado.data, autor: 'seab', perfil: 'seab' },
    new Date().toISOString(),
  )

  return redirecionar(deVolta(gerente, { [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }))
}
