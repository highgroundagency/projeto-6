import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirFeature, identidadeAtual } from '@/lib/sistema'

/**
 * Registro de lançamento (§8.4, tela 3).
 *
 * Toda entrada passa por zod antes de tocar em qualquer coisa (§9): número
 * finito e não negativo, evidência com conteúdo, indicador e ciclo existentes.
 * A janela de prazo é garantida pela camada de dados — e, no schema de
 * `supabase/migrations/`, por gatilho, que vale para qualquer caminho de
 * escrita.
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
        erro: `Lançamento recusado em ${primeiro.path.join('.')}: ${primeiro.message}.`,
      }),
    )
  }

  const dados = analisado.data
  const identidade = await identidadeAtual()

  if (identidade.perfil !== 'area_tecnica' && identidade.perfil !== 'cam') {
    return redirecionar(
      comParametros('/sistema/lancamento', {
        area: dados.area,
        erro: 'Este perfil não lança indicadores.',
      }),
    )
  }

  const panorama = await carregarDados()
  const indicador = panorama.indicadorPorId(dados.indicadorId)
  if (!indicador) {
    return redirecionar(
      comParametros('/sistema/lancamento', {
        area: dados.area,
        erro: 'Indicador desconhecido.',
      }),
    )
  }

  const agora = new Date().toISOString()
  const resultado = await repositorio().registrarLancamento(
    {
      indicadorId: dados.indicadorId,
      cicloId: dados.cicloId,
      valor: dados.valor,
      evidencia: dados.evidencia,
      autor:
        identidade.nome !== 'Perfil simulado' ? identidade.nome : `gestor-${indicador.areaId}`,
    },
    agora,
  )

  return redirecionar(
    comParametros('/sistema/lancamento', {
      area: dados.area,
      [resultado.ok ? 'ok' : 'erro']: resultado.mensagem,
    }),
  )
}
