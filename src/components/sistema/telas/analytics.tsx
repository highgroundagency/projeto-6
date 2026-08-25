import { BrainCircuit, SearchCheck, Shapes, TrendingDown } from 'lucide-react'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, Painel } from '@/components/sistema/base'
import { arredondar, calcularAtingimento } from '@/lib/calculo/motor'
import { repositorio } from '@/lib/dados'
import {
  carregarDados,
  pareceErroDeDigitacao,
  type DadosDoSistema,
} from '@/lib/dados/consultas'
import { ML, ROTULO_MODELO } from '@/lib/ml'
import type { Lancamento, Subindicador } from '@/lib/calculo/tipos'

/**
 * Tela de analytics (§10.3).
 *
 * Duas camadas, e a tela diz qual é qual:
 *
 * 1. MODELOS TREINADOS — classificação, regressão e clustering, treinados
 *    offline em `ml/` e lidos de `src/content/ml/resultados.json`. Cada painel
 *    mostra método, métrica E a linha de base, porque acurácia sem referência
 *    engana: num alvo desbalanceado, chutar a classe majoritária já acerta a
 *    maioria. Um modelo que não supera a referência é publicado dizendo isso.
 *    ATENÇÃO: o treino atual é anterior à remodelagem pós-reunião (ADR-034) e
 *    fala de "áreas"; o re-treino no domínio novo está no marco de ML do
 *    cronograma. A tela avisa em vez de esconder.
 *
 * 2. HEURÍSTICAS EXPLICÁVEIS sobre a base atual, que respondem "onde olhar
 *    agora" com o dado que está na tela, sem depender do treino.
 *
 * O contrato vale para as duas: método sempre ao lado do número, e nenhuma
 * saída daqui entra no cálculo da gratificação.
 */

/** O valor apurado de um lançamento, na escala da meta do indicador. */
function apurado(sub: Subindicador, lancamento: Lancamento): number | null {
  if (sub.tipo === 'indice') return lancamento.valor
  if (lancamento.numerador === null || !lancamento.denominador) return null
  return (lancamento.numerador / lancamento.denominador) * 100
}

/** A meta que vale para um lançamento: a da aplicabilidade do tipo da unidade. */
function metaDoLancamento(
  dados: DadosDoSistema,
  lancamento: Lancamento,
): { meta: number; direcao: 'maior_melhor' | 'menor_melhor'; indicador: string } | null {
  const sub = dados.subindicadorPorId(lancamento.subindicadorId)
  const unidade = dados.unidadePorId(lancamento.unidadeId)
  const ciclo = dados.cicloPorId(lancamento.cicloId)
  const regra = ciclo ? dados.regraPorId(ciclo.regraId) : undefined
  if (!sub || !unidade || !regra) return null

  const aplicabilidade = regra.aplicabilidades.find(
    (a) => a.tipoUnidadeId === unidade.tipoId && a.indicadorId === sub.indicadorId,
  )
  const indicador = dados.indicadorPorId(sub.indicadorId)
  if (!aplicabilidade || !indicador) return null
  return { meta: aplicabilidade.meta, direcao: indicador.direcao, indicador: indicador.nome }
}

function atingimentoMedioPorUnidade(
  dados: DadosDoSistema,
  lancamentos: readonly Lancamento[],
) {
  return dados.unidades.map((unidade) => {
    const valores: number[] = []

    for (const lancamento of lancamentos.filter((l) => l.unidadeId === unidade.id)) {
      const sub = dados.subindicadorPorId(lancamento.subindicadorId)
      if (!sub) continue
      const regua = metaDoLancamento(dados, lancamento)
      const valor = apurado(sub, lancamento)
      if (!regua || valor === null) continue
      const { comTeto } = calcularAtingimento(valor, regua.meta, regua.direcao, 1.5)
      valores.push(comTeto)
    }

    const media = valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : 0
    const desvio = valores.length
      ? Math.sqrt(valores.reduce((s, v) => s + (v - media) ** 2, 0) / valores.length)
      : 0

    return { unidade, media, desvio, amostras: valores.length }
  })
}

export async function TelaAnalytics() {
  const dados = await carregarDados()
  const lancamentos = await repositorio().lancamentos()

  const porUnidade = atingimentoMedioPorUnidade(dados, lancamentos)
  const risco = [...porUnidade].sort((a, b) => a.media - b.media).slice(0, 5)

  const suspeitos = lancamentos
    .flatMap((lancamento) => {
      const sub = dados.subindicadorPorId(lancamento.subindicadorId)
      if (!sub) return []
      const regua = metaDoLancamento(dados, lancamento)
      const valor = apurado(sub, lancamento)
      if (!regua || valor === null) return []
      if (!pareceErroDeDigitacao(valor, regua.meta)) return []
      return [{ lancamento, sub, valor, ...regua }]
    })
    .slice(0, 12)

  // Perfil por regularidade: alta média com baixo desvio é diferente de alta
  // média instável — é a intuição que o clustering formaliza.
  const perfis = porUnidade.map(({ unidade, media, desvio }) => ({
    unidade,
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
      <div className="mb-5 space-y-3">
        <Aviso tom="alerta">
          Os modelos abaixo foram treinados ANTES da remodelagem que a reunião com o cliente
          pediu: eles falam de áreas técnicas, e a base de hoje fala de unidades e
          subindicadores. O re-treino no domínio novo está no marco de ML do cronograma. Os
          painéis de heurística logo abaixo já usam a base nova.
        </Aviso>
        <Aviso>
          {ML.aviso} Base <strong>{ML.base}</strong>. Treino de <Num>{ML.gerado_em}</Num>,
          semente <Num>{ML.semente}</Num>, scikit-learn <Num>{ML.versao_sklearn}</Num>, commit{' '}
          <Num>{ML.commit}</Num>, os mesmos dois comandos reproduzem cada número desta tela.
        </Aviso>
      </div>

      <div id="alvo-ana-modelos">
        {ML.modelos.map((m) => {
          const supera = m.metricas.supera_referencia
          return (
            <Painel
              key={m.modelo}
              titulo={ROTULO_MODELO[m.modelo] ?? m.modelo} icone={BrainCircuit}
              descricao={`${m.pergunta}: ${m.metodo}`}
            >
              {supera === false ? (
                <div className="mb-4">
                  <Aviso tom="alerta">
                    Este modelo <strong>não supera</strong> a linha de base ({m.referencia.nome}
                    ). Fica publicado assim: esconder o resultado que falhou e mostrar só o que
                    deu certo seria escolher a métrica depois de ver o resultado.
                  </Aviso>
                </div>
              ) : null}

              <ul className="flex flex-wrap gap-x-8 gap-y-2 border-y border-linha py-3 text-sm">
                {[
                  ['acurácia', m.metricas.acuracia],
                  ['precisão', m.metricas.precisao],
                  ['revocação', m.metricas.revocacao],
                  ['f1', m.metricas.f1],
                  ['mae', m.metricas.mae],
                  ['r²', m.metricas.r2],
                  ['silhueta', m.metricas.silhueta],
                ]
                  .filter(([, valor]) => valor !== undefined)
                  .map(([rotulo, valor]) => (
                    <li key={String(rotulo)}>
                      <span className="rotulo block">{rotulo}</span>
                      <Num className="text-base text-texto">{String(valor)}</Num>
                    </li>
                  ))}
                <li>
                  <span className="rotulo block">referência</span>
                  <span className="text-xs">
                    {m.referencia.nome}
                    {m.referencia.acuracia !== undefined ? (
                      <>
                        {' '}
                        · acurácia <Num>{m.referencia.acuracia}</Num>
                      </>
                    ) : null}
                    {m.referencia.mae !== undefined ? (
                      <>
                        {' '}
                        · mae <Num>{m.referencia.mae}</Num>
                      </>
                    ) : null}
                  </span>
                </li>
              </ul>

              {m.metricas.importancias ? (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {m.metricas.importancias.map((imp) => (
                    <li key={imp.atributo} className="flex items-center gap-3">
                      <span className="w-48 shrink-0 text-xs">{imp.atributo}</span>
                      <span
                        aria-hidden
                        className="h-1 bg-acento"
                        style={{ width: `${imp.peso * 240}px` }}
                      />
                      <Num className="text-xs">{imp.peso}</Num>
                    </li>
                  ))}
                </ul>
              ) : null}

              {m.metricas.areas ? (
                <ul className="mt-4 divide-y divide-linha border-y border-linha text-sm">
                  {m.metricas.areas.map((a) => (
                    <li
                      key={a.area_id}
                      className="flex flex-wrap items-baseline justify-between gap-2 py-2"
                    >
                      <Num className="text-xs">{a.area_id}</Num>
                      <span className="flex items-baseline gap-3">
                        <span className="text-xs">
                          média <Num>{a.atingimento_medio}</Num> · vol{' '}
                          <Num>{a.volatilidade}</Num>
                        </span>
                        <Etiqueta>{a.grupo}</Etiqueta>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="mt-4 max-w-prose text-xs">
                <span className="rotulo">limitação</span> {m.limitacao}
              </p>
            </Painel>
          )
        })}
      </div>

      <Painel
        alvo="ana-risco"
        titulo="Unidades com risco de não bater a meta" icone={TrendingDown}
        descricao="Como é calculado: a média do que cada unidade atingiu nos meses anteriores, contra a meta do tipo dela. Quanto menor a média, maior o risco."
      >
        <ul className="divide-y divide-linha border-y border-linha">
          {risco.map(({ unidade, media, desvio, amostras }) => (
            <li
              key={unidade.id}
              className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
            >
              <span className="text-sm">{unidade.nome}</span>
              <span className="flex items-baseline gap-3 text-sm">
                <Num>{(media * 100).toFixed(1)}%</Num>
                <span className="text-xs text-apagado">
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
        alvo="ana-suspeitos"
        titulo="Números que parecem erro de digitação" icone={SearchCheck}
        descricao="Como é achado: valor apurado 5 vezes maior ou 5 vezes menor que a meta do tipo. O sistema só avisa; quem decide é gente."
      >
        {suspeitos.length === 0 ? (
          <Aviso tom="ok">Nenhum número fora do padrão esperado.</Aviso>
        ) : (
          <div className="overflow-x-auto border border-linha">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-linha bg-superficie">
                  {['Ciclo', 'Unidade', 'Subindicador', 'Apurado', 'Meta', 'Razão'].map((c) => (
                    <th key={c} className="rotulo px-3 py-2 text-left">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suspeitos.map(({ lancamento, sub, valor, meta }) => (
                  <tr key={lancamento.id} className="border-b border-linha last:border-0">
                    <td className="numero px-3 py-1.5">
                      {lancamento.cicloId.replace('ciclo-', '')}
                    </td>
                    <td className="px-3 py-1.5">
                      {dados.unidadePorId(lancamento.unidadeId)?.nome}
                    </td>
                    <td className="px-3 py-1.5">{sub.nome}</td>
                    <td className="numero px-3 py-1.5 text-alerta">
                      {arredondar(valor, 1)}
                    </td>
                    <td className="numero px-3 py-1.5">{meta}</td>
                    <td className="numero px-3 py-1.5">{arredondar(valor / meta, 1)}×</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      <Painel
        alvo="ana-perfis"
        titulo="O jeito de cada unidade" icone={Shapes}
        descricao="Como é feito: com a média e a variação do resultado de cada unidade, mês a mês."
      >
        <ul className="grid gap-px border border-linha bg-linha sm:grid-cols-2">
          {perfis.map(({ unidade, perfil }) => (
            <li
              key={unidade.id}
              className="flex items-baseline justify-between gap-3 bg-cartao px-3 py-2 text-sm"
            >
              <span>{unidade.nome}</span>
              <span className="rotulo shrink-0">{perfil}</span>
            </li>
          ))}
        </ul>
      </Painel>
    </>
  )
}
