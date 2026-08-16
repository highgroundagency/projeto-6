import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirFeature, perfilAtual } from '@/lib/sistema'

const corpoSchema = z.object({
  gestorId: z.string().min(1).max(80),
  cicloId: z.string().min(1).max(80),
  indicadorId: z.string().max(80).optional(),
  motivo: z.string().trim().min(20).max(1000),
})

export async function POST(requisicao: NextRequest) {
  await exigirFeature('contestacao')

  const formulario = await requisicao.formData()
  const perfil = await perfilAtual()

  if (perfil !== 'gestor' && perfil !== 'cam') {
    return redirecionar(
      comParametros('/sistema/contestacao', { erro: 'Este perfil não abre contestação.' }),
    )
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
      comParametros('/sistema/contestacao', {
        erro: `Contestação recusada em ${primeiro.path.join('.')}: ${primeiro.message}.`,
      }),
    )
  }

  const dados = analisado.data
  const panorama = await carregarDados()

  if (!panorama.gestorPorId(dados.gestorId) || !panorama.cicloPorId(dados.cicloId)) {
    return redirecionar(
      comParametros('/sistema/contestacao', { erro: 'Gestor ou ciclo desconhecido.' }),
    )
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
    comParametros('/sistema/contestacao', {
      gestor: dados.gestorId,
      [resultado.ok ? 'ok' : 'erro']: resultado.mensagem,
    }),
  )
}
