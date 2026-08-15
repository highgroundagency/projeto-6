import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { comParametros, redirecionar } from '@/lib/http'
import { BASE } from '@/lib/seed'
import { exigirFeature, perfilAtual } from '@/lib/sistema'
import { abrirContestacao } from '@/lib/sistema/contestacoes'

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
        erro: `Contestação recusada: ${primeiro.path.join('.')} — ${primeiro.message}.`,
      }),
    )
  }

  const dados = analisado.data
  const gestorExiste = BASE.gestores.some((g) => g.id === dados.gestorId)
  const cicloExiste = BASE.ciclos.some((c) => c.id === dados.cicloId)

  if (!gestorExiste || !cicloExiste) {
    return redirecionar(
      comParametros('/sistema/contestacao', { erro: 'Gestor ou ciclo desconhecido.' }),
    )
  }

  abrirContestacao({
    gestorId: dados.gestorId,
    cicloId: dados.cicloId,
    indicadorId: dados.indicadorId ?? null,
    motivo: dados.motivo,
    abertaEm: new Date().toISOString(),
  })

  return redirecionar(
    comParametros('/sistema/contestacao', {
      gestor: dados.gestorId,
      ok: 'Contestação registrada. A comissão responde dentro do prazo do ciclo.',
    }),
  )
}
