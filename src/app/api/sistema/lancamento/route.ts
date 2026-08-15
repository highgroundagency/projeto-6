import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
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
  const destino = requisicao.nextUrl.clone()
  destino.pathname = '/sistema/lancamento'

  const analisado = corpoSchema.safeParse({
    indicadorId: formulario.get('indicadorId'),
    cicloId: formulario.get('cicloId'),
    valor: formulario.get('valor'),
    evidencia: formulario.get('evidencia'),
    area: formulario.get('area'),
  })

  if (!analisado.success) {
    const primeiro = analisado.error.issues[0]
    destino.search = `?erro=${encodeURIComponent(
      `Lançamento recusado: ${primeiro.path.join('.')} — ${primeiro.message}.`,
    )}`
    return NextResponse.redirect(destino, 303)
  }

  const dados = analisado.data
  destino.search = `?area=${encodeURIComponent(dados.area)}`

  const perfil = await perfilAtual()
  if (perfil !== 'area_tecnica' && perfil !== 'cam') {
    destino.search += `&erro=${encodeURIComponent('Este perfil não lança indicadores.')}`
    return NextResponse.redirect(destino, 303)
  }

  const indicador = BASE.indicadores.find((i) => i.id === dados.indicadorId)
  if (!indicador) {
    destino.search += `&erro=${encodeURIComponent('Indicador desconhecido.')}`
    return NextResponse.redirect(destino, 303)
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

  destino.search += `&${resultado.ok ? 'ok' : 'erro'}=${encodeURIComponent(resultado.mensagem)}`
  return NextResponse.redirect(destino, 303)
}
