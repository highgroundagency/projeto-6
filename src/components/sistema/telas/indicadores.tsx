import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { AcoesDaTela, Aviso, Painel, SomenteLeitura } from '@/components/sistema/base'
import type { FaixaPontuacao, RegraDePontuacao } from '@/lib/calculo/tipos'
import { carregarDados } from '@/lib/dados/consultas'

function chaveFaixa(faixa: FaixaPontuacao): string {
  return `${faixa.de}|${faixa.ate ?? '∞'}`
}

/** Diff visual entre duas versões da regra — o que mudou, campo a campo. */
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

export async function TelaIndicadores() {
  const dados = await carregarDados()
  const [v1, v2] = dados.regras
  const porArea = dados.areas.map((area) => ({
    area,
    indicadores: dados.indicadoresDaArea(area.id),
  }))

  return (
    <>
      <AcoesDaTela>
        <SomenteLeitura />
        <span className="text-xs text-apagado">
          <Num>{dados.indicadores.length}</Num> indicadores · <Num>{dados.regras.length}</Num>{' '}
          versões de regra
        </span>
      </AcoesDaTela>

      <div className="mb-5">
        <Aviso>
          Indicadores e regras são <strong>dados</strong>, não código: quando a portaria mudar,
          o cadastro muda pela interface e o software fica igual. No protótipo o catálogo é
          sintético e a edição ainda não está construída.
        </Aviso>
      </div>

      <Painel
        alvo="ind-catalogo"
        titulo="Catálogo de indicadores"
        descricao={`${dados.indicadores.length} indicadores em ${dados.areas.length} áreas.`}
      >
        <div className="space-y-5">
          {porArea.map(({ area, indicadores }) => (
            <div key={area.id}>
              <h3 className="rotulo text-texto">
                {area.sigla} · {area.nome}
              </h3>
              <div className="mt-2 overflow-x-auto border border-linha">
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-linha bg-superficie">
                      {[
                        'Indicador',
                        'Unidade',
                        'Direção',
                        'Meta',
                        'Peso',
                        'Periodicidade',
                        'Fonte',
                      ].map((c) => (
                        <th key={c} className="rotulo px-3 py-2 text-left whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {indicadores.map((indicador) => (
                      <tr key={indicador.id} className="border-b border-linha last:border-0">
                        <td className="px-3 py-1.5">{indicador.nome}</td>
                        <td className="px-3 py-1.5 text-apagado">{indicador.unidade}</td>
                        <td className="px-3 py-1.5 whitespace-nowrap text-apagado">
                          {indicador.direcao === 'maior_melhor'
                            ? 'maior é melhor'
                            : 'menor é melhor'}
                        </td>
                        <td className="numero px-3 py-1.5">{indicador.meta}</td>
                        <td className="numero px-3 py-1.5">{indicador.peso}</td>
                        <td className="px-3 py-1.5 text-apagado">{indicador.periodicidade}</td>
                        <td className="px-3 py-1.5 text-apagado">{indicador.fonte}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Painel>

      <Painel
        alvo="ind-regras"
        titulo="Regras de pontuação versionadas"
        descricao="Alterar uma regra cria uma nova versão. A vigente nunca é editada, sem isso, um ciclo homologado deixaria de reproduzir o próprio resultado."
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
                {regra.semLancamento.replace(/_/g, ' ')}
              </p>
            </li>
          ))}
        </ul>
      </Painel>

      {v1 && v2 ? (
        <Painel
          alvo="ind-diff"
          titulo={`Diff: v${v1.versao} → v${v2.versao}`}
          descricao="O que exatamente mudou entre as versões da regra."
        >
          <DiffDeVersoes anterior={v1} nova={v2} />
        </Painel>
      ) : null}
    </>
  )
}
