import { GitCompareArrows, Ruler, Scale, Table2 } from 'lucide-react'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { AcoesDaTela, Aviso, Painel, SomenteLeitura } from '@/components/sistema/base'
import type { FaixaPontuacao, RegraDePontuacao } from '@/lib/calculo/tipos'
import { carregarDados } from '@/lib/dados/consultas'

function chaveFaixa(faixa: FaixaPontuacao): string {
  return `${faixa.de}|${faixa.ate ?? '∞'}`
}

/** Diff visual entre duas versões da regra — o que mudou, faixa por faixa. */
function DiffDeVersoes({
  anterior,
  nova,
}: {
  anterior: RegraDePontuacao
  nova: RegraDePontuacao
}) {
  const antigas = new Map(anterior.faixas.map((f) => [chaveFaixa(f), f]))
  const novas = new Map(nova.faixas.map((f) => [chaveFaixa(f), f]))
  const chaves = [...new Set([...antigas.keys(), ...novas.keys()])].sort(
    (a, b) => Number(a.split('|')[0]) - Number(b.split('|')[0]),
  )

  return (
    <div className="overflow-x-auto border border-linha">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-linha bg-superficie">
            <th className="rotulo px-3 py-2 text-left">Faixa de atingimento</th>
            <th className="rotulo px-3 py-2 text-left">v{anterior.versao}</th>
            <th className="rotulo px-3 py-2 text-left">v{nova.versao}</th>
            <th className="rotulo px-3 py-2 text-left">Mudança</th>
          </tr>
        </thead>
        <tbody>
          {chaves.map((chave) => {
            const antiga = antigas.get(chave)
            const atual = novas.get(chave)
            const situacao = !antiga
              ? 'adicionada'
              : !atual
                ? 'removida'
                : antiga.pontos === atual.pontos
                  ? 'igual'
                  : 'alterada'
            const [de, ate] = chave.split('|')

            return (
              <tr key={chave} className="border-b border-linha last:border-0">
                <td className="numero px-3 py-1.5 whitespace-nowrap">
                  {Math.round(Number(de) * 100)}% a{' '}
                  {ate === '∞' ? '∞' : `<${Math.round(Number(ate) * 100)}%`}
                </td>
                <td className="numero px-3 py-1.5">
                  {antiga ? `${antiga.pontos} pts` : 'não havia'}
                </td>
                <td className="numero px-3 py-1.5">
                  {atual ? `${atual.pontos} pts` : 'não havia'}
                </td>
                <td className="px-3 py-1.5">
                  {situacao === 'igual' ? (
                    <span className="text-apagado">sem mudança</span>
                  ) : (
                    <Etiqueta tom={situacao === 'removida' ? 'alerta' : 'acento'}>
                      {situacao}
                    </Etiqueta>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** As metas e pesos que mudaram de uma versão da régua para a outra. */
function DiffDaRegua({
  anterior,
  nova,
  nomeDoTipo,
  nomeDoIndicador,
}: {
  anterior: RegraDePontuacao
  nova: RegraDePontuacao
  nomeDoTipo: (id: string) => string
  nomeDoIndicador: (id: string) => string
}) {
  const mudancas = nova.aplicabilidades.flatMap((atual) => {
    const antiga = anterior.aplicabilidades.find(
      (a) => a.tipoUnidadeId === atual.tipoUnidadeId && a.indicadorId === atual.indicadorId,
    )
    if (!antiga || (antiga.meta === atual.meta && antiga.peso === atual.peso)) return []
    return [{ atual, antiga }]
  })

  if (mudancas.length === 0) {
    return <p className="text-sm text-apagado">Nenhuma meta ou peso mudou entre as versões.</p>
  }

  return (
    <ul className="divide-y divide-linha border-y border-linha text-sm">
      {mudancas.map(({ atual, antiga }) => (
        <li
          key={`${atual.tipoUnidadeId}-${atual.indicadorId}`}
          className="flex flex-wrap items-baseline justify-between gap-2 py-2"
        >
          <span>
            {nomeDoTipo(atual.tipoUnidadeId)} · {nomeDoIndicador(atual.indicadorId)}
          </span>
          <Num className="text-xs">
            meta {antiga.meta} → {atual.meta} · peso {antiga.peso} → {atual.peso}
          </Num>
        </li>
      ))}
    </ul>
  )
}

export async function TelaIndicadores() {
  const dados = await carregarDados()
  const [v1, v2] = dados.regras
  const reguaAtual = v2 ?? v1

  const nomeDoTipo = (id: string) => dados.tipoUnidadePorId(id)?.nome ?? id
  const nomeDoIndicador = (id: string) => dados.indicadorPorId(id)?.nome ?? id

  return (
    <>
      <AcoesDaTela>
        <SomenteLeitura />
        <span className="text-xs text-apagado">
          <Num>{dados.indicadores.length}</Num> indicadores ·{' '}
          <Num>{dados.subindicadores.length}</Num> subindicadores ·{' '}
          <Num>{dados.regras.length}</Num> versões de regra
        </span>
      </AcoesDaTela>

      <div className="mb-5">
        <Aviso>
          Esta tela é só de leitura: é a régua da avaliação. Quando o documento oficial mudar,
          muda o cadastro aqui dentro, e as regras antigas ficam guardadas. Neste protótipo os
          dados são de exemplo e a edição ainda não foi construída.
        </Aviso>
      </div>

      <Painel
        alvo="ind-catalogo"
        titulo="Catálogo de indicadores" icone={Ruler}
        descricao={`O que é medido, e do que cada medida é feita: ${dados.indicadores.length} indicadores calculados a partir de ${dados.subindicadores.length} subindicadores preenchidos pelas unidades.`}
      >
        <ul className="space-y-3">
          {dados.indicadores.map((indicador) => {
            const subs = dados.subindicadoresDoIndicador(indicador.id)
            return (
              <li key={indicador.id} className="border border-linha p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{indicador.nome}</span>
                  <Num className="text-xs text-apagado">
                    {indicador.unidadeMedida} ·{' '}
                    {indicador.direcao === 'maior_melhor' ? 'maior é melhor' : 'menor é melhor'}{' '}
                    · {indicador.periodicidade} · {indicador.fonte}
                  </Num>
                </div>
                <ul className="mt-2 space-y-1 border-l border-linha pl-3 text-sm">
                  {subs.map((sub) => (
                    <li key={sub.id} className="flex flex-wrap items-baseline gap-x-2">
                      <span>{sub.nome}</span>
                      <span className="text-xs text-apagado">
                        {sub.tipo === 'razao'
                          ? `${sub.rotuloNumerador} ÷ ${sub.rotuloDenominador}`
                          : 'valor direto'}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </Painel>

      <Painel
        alvo="ind-regua"
        titulo="A régua por tipo de unidade" icone={Table2}
        descricao={`O que a reunião com o cliente confirmou: a depender do tipo, só alguns indicadores valem, e meta e peso mudam. Régua da ${reguaAtual?.id ?? 'regra vigente'}.`}
      >
        <div className="space-y-5">
          {dados.tiposUnidade.map((tipo) => {
            const linhas = reguaAtual ? dados.indicadoresDoTipo(tipo.id, reguaAtual) : []
            return (
              <div key={tipo.id}>
                <h3 className="rotulo text-texto">
                  {tipo.sigla} · {tipo.nome}
                </h3>
                <div className="mt-2 overflow-x-auto border border-linha">
                  <table className="w-full min-w-[30rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-linha bg-superficie">
                        {['Indicador', 'Meta', 'Peso'].map((c) => (
                          <th key={c} className="rotulo px-3 py-2 text-left whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhas.map(({ indicador, aplicabilidade }) => (
                        <tr key={indicador.id} className="border-b border-linha last:border-0">
                          <td className="px-3 py-1.5">{indicador.nome}</td>
                          <td className="numero px-3 py-1.5">
                            {aplicabilidade.meta} {indicador.unidadeMedida}
                          </td>
                          <td className="numero px-3 py-1.5">{aplicabilidade.peso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </Painel>

      <Painel
        alvo="ind-regras"
        titulo="Regras de pontuação" icone={Scale}
        descricao="A tabela que transforma resultado em pontos, e a régua de cada tipo. Mudar a regra cria uma versão nova; a antiga fica guardada, para que a conta de um mês fechado sempre possa ser refeita igual."
      >
        <ul className="space-y-3">
          {dados.regras.map((regra) => (
            <li key={regra.id} className="border border-linha p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="fonte-display text-base">
                  {regra.id} <Num className="text-sm">v{regra.versao}</Num>
                </span>
                <Num className="text-xs text-apagado">
                  vigência {regra.vigenteDe} → {regra.vigenteAte ?? 'em aberto'}
                </Num>
              </div>
              <p className="mt-1 text-sm text-apagado">{regra.descricao}</p>
              <p className="numero mt-2 text-xs text-apagado">
                teto {Math.round(regra.tetoAtingimento * 100)}% · arredondamento{' '}
                {regra.arredondamento.casas} casas (
                {regra.arredondamento.modo.replace(/_/g, ' ')}) · sem lançamento:{' '}
                {regra.semLancamento.replace(/_/g, ' ')} ·{' '}
                {regra.aplicabilidades.length} pares tipo × indicador
              </p>
            </li>
          ))}
        </ul>
      </Painel>

      {v1 && v2 ? (
        <Painel
          alvo="ind-diff"
          titulo={`Diff: v${v1.versao} → v${v2.versao}`} icone={GitCompareArrows}
          descricao="O quadro do que mudou de uma versão da regra para a outra: as faixas de pontos e a régua por tipo."
        >
          <DiffDeVersoes anterior={v1} nova={v2} />
          <h3 className="rotulo mt-5 text-texto">Metas e pesos que mudaram</h3>
          <div className="mt-2">
            <DiffDaRegua
              anterior={v1}
              nova={v2}
              nomeDoTipo={nomeDoTipo}
              nomeDoIndicador={nomeDoIndicador}
            />
          </div>
        </Painel>
      ) : null}
    </>
  )
}
