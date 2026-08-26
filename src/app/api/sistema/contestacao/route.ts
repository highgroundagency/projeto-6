import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirPerfil, perfilAtual } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** Volta para a sanfona da contestação, já aberta e no gerente certo. */
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
  gerenteId: z.string().min(1).max(80),
  cicloId: z.string().min(1).max(80),
  indicadorId: z.string().max(80).optional(),
  motivo: z.string().trim().min(20).max(1000),
})

export async function POST(requisicao: NextRequest) {
  await exigirPerfil('contestacao')

  const formulario = await requisicao.formData()
  const perfil = await perfilAtual()

  if (perfil === 'administrador') {
    return redirecionar(deVolta(undefined, { erro: 'Este perfil não abre contestação.' }))
  }

  const analisado = corpoSchema.safeParse({
    gerenteId: formulario.get('gerenteId'),
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

  const ciclo = panorama.cicloPorId(dados.cicloId)
  if (!panorama.gerentePorId(dados.gerenteId) || !ciclo) {
    return redirecionar(deVolta(undefined, { erro: 'Gerente ou ciclo desconhecido.' }))
  }
  // Contesta-se um RESULTADO, e resultado só existe em mês fechado.
  if (ciclo.estado !== 'homologado' && ciclo.estado !== 'publicado') {
    return redirecionar(
      deVolta(dados.gerenteId, { erro: 'Só dá para contestar um mês já fechado.' }),
    )
  }
  if (dados.indicadorId && !panorama.indicadorPorId(dados.indicadorId)) {
    return redirecionar(deVolta(dados.gerenteId, { erro: 'Indicador desconhecido.' }))
  }

  const resultado = await repositorio().abrirContestacao(
    {
      gerenteId: dados.gerenteId,
      cicloId: dados.cicloId,
      indicadorId: dados.indicadorId ?? null,
      motivo: dados.motivo,
      perfil,
    },
    new Date().toISOString(),
  )

  return redirecionar(
    deVolta(dados.gerenteId, { [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }),
  )
}
