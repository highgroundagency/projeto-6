import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirPerfil, perfilAtual } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** Volta para a sanfona da contestação, já aberta e no gestor certo. */
function deVolta(
  gestor: string | undefined,
  resultado: { ok?: string; erro?: string },
): string {
  return comParametros(
    '/sistema',
    { abrir: 'contestacao', de: 'contestacao', cont_gestor: gestor, ...resultado },
    ancoraDaTela('contestacao'),
  )
}

const corpoSchema = z.object({
  gestorId: z.string().min(1).max(80),
  cicloId: z.string().min(1).max(80),
  indicadorId: z.string().max(80).optional(),
  motivo: z.string().trim().min(20).max(1000),
})

export async function POST(requisicao: NextRequest) {
  await exigirPerfil('contestacao')

  const formulario = await requisicao.formData()
  const perfil = await perfilAtual()

  if (perfil !== 'gestor' && perfil !== 'cam') {
    return redirecionar(deVolta(undefined, { erro: 'Este perfil não abre contestação.' }))
  }

  const analisado = corpoSchema.safeParse({
    gestorId: formulario.get('gestorId'),
    cicloId: formulario.get('cicloId'),
    indicadorId: formulario.get('indicadorId') || undefined,
    motivo: formulario.get('motivo'),
  })

  if (!analisado.success) {
    const primeiro = analisado.error.issues[0]
    return redirecionar(
      deVolta(undefined, {
        erro: `Contestação recusada em ${primeiro.path.join('.')}: ${primeiro.message}.`,
      }),
    )
  }

  const dados = analisado.data
  const panorama = await carregarDados()

  if (!panorama.gestorPorId(dados.gestorId) || !panorama.cicloPorId(dados.cicloId)) {
    return redirecionar(deVolta(undefined, { erro: 'Gestor ou ciclo desconhecido.' }))
  }

  const resultado = await repositorio().abrirContestacao(
    {
      gestorId: dados.gestorId,
      cicloId: dados.cicloId,
      indicadorId: dados.indicadorId ?? null,
      motivo: dados.motivo,
    },
    new Date().toISOString(),
  )

  return redirecionar(
    deVolta(dados.gestorId, { [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }),
  )
}
