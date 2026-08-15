import type { Metadata } from 'next'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, CabecalhoTela, Painel } from '@/components/sistema/base'
import { arredondar, calcularAtingimento } from '@/lib/calculo/motor'
import { repositorio } from '@/lib/dados'
import { carregarDados, pareceErroDeDigitacao } from '@/lib/dados/consultas'
import { exigirFeature } from '@/lib/sistema'
import type { Area, Indicador, Lancamento } from '@/lib/calculo/tipos'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

/**
 * Tela de analytics (§10.3).
 *
 * ESTADO ATUAL: os números abaixo vêm de heurísticas explicáveis calculadas
 * sobre a própria base — média histórica de atingimento e distância da meta.
 * Os modelos treinados (classificação, regressão e clustering) entram na F4 e
 * substituem cada card, mantendo o mesmo contrato de transparência: método e
 * métrica sempre ao lado do número.
 */

function atingimentoMedioPorArea(
  areas: readonly Area[],
  indicadoresTodos: readonly Indicador[],
  lancamentos: readonly Lancamento[],
) {
  return areas.map((area) => {
    const indicadores = indicadoresTodos.filter((i) => i.areaId === area.id)
    const valores: number[] = []

    for (const indicador of indicadores) {
      for (const lancamento of lancamentos.filter((l) => l.indicadorId === indicador.id)) {
        const { comTeto } = calcularAtingimento(
          lancamento.valor,
          indicador.meta,
          indicador.direcao,
          1.5,
        )
        valores.push(comTeto)
      }
    }

    const media = valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : 0
    const desvio = valores.length
      ? Math.sqrt(valores.reduce((s, v) => s + (v - media) ** 2, 0) / valores.length)
      : 0

    return { area, media, desvio, amostras: valores.length }
  })
}

export default async function TelaAnalytics() {
  await exigirFeature('analytics')

  const dados = await carregarDados()
  const lancamentos = await repositorio().lancamentos()

  const porArea = atingimentoMedioPorArea(dados.areas, dados.indicadores, lancamentos)
  const risco = [...porArea].sort((a, b) => a.media - b.media).slice(0, 5)

  const suspeitos = lancamentos
    .map((lancamento) => ({
      lancamento,
      indicador: dados.indicadorPorId(lancamento.indicadorId)!,
    }))
    .filter((item) => item.indicador)
    .filter(({ lancamento, indicador }) => pareceErroDeDigitacao(lancamento.valor, indicador.meta))
    .slice(0, 12)

  // Perfil por regularidade: alta média com baixo desvio é diferente de alta
  // média instável — é a intuição que o clustering da F4 vai formalizar.
  const perfis = porArea.map(({ area, media, desvio }) => ({
    area,
    perfil:
      media >= 0.95 && desvio < 0.12
        ? 'consistente acima da meta'
        : media >= 0.95
          ? 'boa média, resultado instável'
          : desvio >= 0.15
            ? 'oscilante'
            : 'consistente abaixo da meta',
  }))

  return (
    <>
      <CabecalhoTela
        titulo="Analytics"
        descricao="Sinais extraídos do histórico de indicadores, sempre com o método declarado ao lado."
      />

      <div className="mt-5">
        <Aviso>
          Os cards desta tela usam <strong>heurísticas explicáveis</strong> sobre a base
          sintética, não modelos treinados. Os modelos de classificação, regressão e
          clustering entram na etapa de Machine Learning e substituem cada card — mantendo
          método e métrica sempre visíveis.
        </Aviso>
      </div>

      <Painel
        titulo="Risco de não-atingimento no próximo ciclo"
        descricao="Método: média histórica de atingimento por área, com teto de 150%. Quanto menor a média, maior o risco."
      >
        <ul className="divide-y divide-linha border-y border-linha">
          {risco.map(({ area, media, desvio, amostras }) => (
            <li key={area.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
              <span className="text-sm">
                <Num className="text-xs text-cinza-forte">{area.sigla}</Num> {area.nome}
              </span>
              <span className="flex items-baseline gap-3 text-sm">
                <Num>{(media * 100).toFixed(1)}%</Num>
                <span className="text-xs text-cinza-forte">
                  desvio <Num>{(desvio * 100).toFixed(1)}</Num> · <Num>{amostras}</Num> obs.
                </span>
                <Etiqueta tom={media < 0.9 ? 'alerta' : 'neutro'}>
                  {media < 0.85 ? 'risco alto' : media < 0.95 ? 'atenção' : 'estável'}
                </Etiqueta>
              </span>
            </li>
          ))}
        </ul>
      </Painel>

      <Painel
        titulo="Possível erro de digitação"
        descricao="Método: valor a mais de 5× ou a menos de 1/5 da meta. O sistema SINALIZA e nunca bloqueia — a decisão é humana."
      >
        {suspeitos.length === 0 ? (
          <Aviso tom="ok">Nenhum lançamento fora do padrão esperado.</Aviso>
        ) : (
          <div className="overflow-x-auto border border-linha">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-linha bg-papel-2">
                  {['Ciclo', 'Indicador', 'Valor', 'Meta', 'Razão'].map((c) => (
                    <th key={c} className="rotulo px-3 py-2 text-left">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suspeitos.map(({ lancamento, indicador }) => (
                  <tr key={lancamento.id} className="border-b border-linha last:border-0">
                    <td className="numero px-3 py-1.5">{lancamento.cicloId.replace('ciclo-', '')}</td>
                    <td className="px-3 py-1.5">{indicador.nome}</td>
                    <td className="numero px-3 py-1.5 text-vinho-alerta">{lancamento.valor}</td>
                    <td className="numero px-3 py-1.5">{indicador.meta}</td>
                    <td className="numero px-3 py-1.5">
                      {arredondar(lancamento.valor / indicador.meta, 1)}×
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <Painel
        titulo="Perfis de área"
        descricao="Método: combinação de média e desvio-padrão do atingimento. Na F4 isto vira k-means com análise de silhueta."
      >
        <ul className="grid gap-px border border-linha bg-linha sm:grid-cols-2">
          {perfis.map(({ area, perfil }) => (
            <li key={area.id} className="flex items-baseline justify-between gap-3 bg-white px-3 py-2 text-sm">
              <span>{area.nome}</span>
              <span className="rotulo shrink-0">{perfil}</span>
            </li>
          ))}
        </ul>
      </Painel>
    </>
  )
}
