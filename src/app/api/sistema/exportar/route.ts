import { type NextRequest } from 'next/server'
import { avaliacoesDoCiclo, carregarDados } from '@/lib/dados/consultas'
import { exigirFeature } from '@/lib/sistema'

/** Exportação dos resultados de um ciclo em CSV (§8.4, tela 5). */
export async function GET(requisicao: NextRequest) {
  await exigirFeature('painel-gestao')

  const cicloId = requisicao.nextUrl.searchParams.get('ciclo') ?? ''
  const anonimo = requisicao.nextUrl.searchParams.get('anonimo') === '1'

  const dados = await carregarDados()
  const ciclo = dados.cicloPorId(cicloId)
  if (!ciclo) return new Response('Ciclo não encontrado.', { status: 404 })

  const avaliacoes = [...(await avaliacoesDoCiclo(ciclo.id))].sort((a, b) => b.score - a.score)

  const cabecalho = [
    'posicao',
    'gestor',
    'area',
    'score',
    'faixa',
    'percentual_gratificacao',
    'regra',
    'versao_regra',
    'avisos',
  ]

  const linhas = avaliacoes.map((avaliacao, i) => {
    const gestor = dados.gestorPorId(avaliacao.gestorId)
    const area = gestor ? dados.areaPorId(gestor.areaId) : undefined
    return [
      String(i + 1),
      anonimo ? `gestor ${String(i + 1).padStart(2, '0')}` : (gestor?.nome ?? ''),
      anonimo ? '' : (area?.nome ?? ''),
      avaliacao.score.toFixed(2),
      avaliacao.faixa?.rotulo ?? '',
      String(avaliacao.faixa?.percentual ?? ''),
      avaliacao.memoria.regraId,
      String(avaliacao.memoria.versaoRegra),
      String(avaliacao.avisos.length),
    ]
  })

  // Aspas duplicadas conforme RFC 4180: campo com ; ou " não quebra o arquivo.
  const escapar = (campo: string) => `"${campo.replace(/"/g, '""')}"`
  const csv = [cabecalho, ...linhas].map((linha) => linha.map(escapar).join(';')).join('\r\n')

  return new Response(`\ufeff${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="prumo-${ciclo.competencia}${anonimo ? '-anonimo' : ''}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
