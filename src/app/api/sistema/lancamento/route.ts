import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { comParametros, redirecionar } from '@/lib/http'
import { BASE } from '@/lib/seed'
import { exigirFeature, perfilAtual } from '@/lib/sistema'
import { registrarLancamento } from '@/lib/sistema/estado'

/**
 * Registro de lançamento (§8.4, tela 3).
 *
 * Toda entrada passa por zod antes de tocar em qualquer coisa (§9): número
 * finito e não negativo, evidência com conteúdo, indicador e ciclo existentes.
 */
const corpoSchema = z.object({
  indicadorId: z.string().min(1).max(80),
  cicloId: z.string().min(1).max(80),
  valor: z.coerce.number().finite().min(0).max(1_000_000_000),
  evidencia: z.string().trim().min(5).max(300),
  area: z.string().min(1).max(40),
})

export async function POST(requisicao: NextRequest) {
  await exigirFeature('lancamento')

  const formulario = await requisicao.formData()

  const analisado = corpoSchema.safeParse({
    indicadorId: formulario.get('indicadorId'),
    cicloId: formulario.get('cicloId'),
    valor: formulario.get('valor'),
    evidencia: formulario.get('evidencia'),
    area: formulario.get('area'),
  })

  if (!analisado.success) {
    const primeiro = analisado.error.issues[0]
    return redirecionar(
      comParametros('/sistema/lancamento', {
        area: String(formulario.get('area') ?? ''),
        erro: `Lançamento recusado: ${primeiro.path.join('.')} — ${primeiro.message}.`,
      }),
    )
  }

  const dados = analisado.data

  const perfil = await perfilAtual()
  if (perfil !== 'area_tecnica' && perfil !== 'cam') {
    return redirecionar(
      comParametros('/sistema/lancamento', {
        area: dados.area,
        erro: 'Este perfil não lança indicadores.',
      }),
    )
  }

  const indicador = BASE.indicadores.find((i) => i.id === dados.indicadorId)
  if (!indicador) {
    return redirecionar(
      comParametros('/sistema/lancamento', { area: dados.area, erro: 'Indicador desconhecido.' }),
    )
  }

  const resultado = registrarLancamento(
    {
      indicadorId: dados.indicadorId,
      cicloId: dados.cicloId,
      valor: dados.valor,
      evidencia: dados.evidencia,
      autor: `gestor-${indicador.areaId}`,
      registradoEm: new Date().toISOString(),
      status: 'enviado',
    },
    new Date().toISOString(),
  )

  return redirecionar(
    comParametros('/sistema/lancamento', {
      area: dados.area,
      [resultado.ok ? 'ok' : 'erro']: resultado.mensagem,
    }),
  )
}
