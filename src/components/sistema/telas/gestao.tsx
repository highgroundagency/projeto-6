import { Botao, estiloBotao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { AcoesDaTela, Aviso, Painel, Preservar } from '@/components/sistema/base'
import type { PropsTela } from '@/components/sistema/telas/tipos'
import { arredondar } from '@/lib/calculo/motor'
import { avaliacoesDoCiclo, carregarDados } from '@/lib/dados/consultas'
import { ancoraDaTela } from '@/lib/sistema/parametros'

export async function TelaGestao({ ctx }: PropsTela) {
  const { gest_ciclo: cicloParam, gest_anonimo: anonimo } = ctx.params

  const dados = await carregarDados()
  const fechados = dados.ciclosFechados()
  const ciclo =
    fechados.find((c) => c.id === cicloParam) ?? dados.cicloMaisRecenteFechado() ?? fechados[0]
  const anonimizado = anonimo === '1'

  if (!ciclo) {
    return <Aviso>Nenhum mês fechado ainda: não há resultado para somar.</Aviso>
  }

  const avaliacoes = await avaliacoesDoCiclo(ciclo.id)
  const ranking = [...avaliacoes].sort((a, b) => b.score - a.score)

  const media =
    avaliacoes.length > 0
      ? arredondar(avaliacoes.reduce((s, a) => s + a.score, 0) / avaliacoes.length, 2)
      : 0
  const comAviso = avaliacoes.filter((a) => a.avisos.length > 0).length

  return (
    <>
      <AcoesDaTela alvo="gest-exportar">
        <Etiqueta tom="acento">mês {ciclo.competencia}</Etiqueta>
        {/* Âncora comum, não `next/link`: o CSV é um download, e o roteador do
            Next não tem o que fazer com uma resposta que não é uma página. */}
        <a
          className={estiloBotao({ variante: 'contorno', tamanho: 'pequeno' })}
          href={`/api/sistema/exportar?ciclo=${ciclo.id}${anonimizado ? '&anonimo=1' : ''}`}
        >
          Exportar CSV
        </a>
      </AcoesDaTela>

      <Painel alvo="gest-ciclo" titulo="Ciclo">
        <form
          method="get"
          action={`/sistema${ancoraDaTela('painel-gestao')}`}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="abrir" value="painel-gestao" />
          <Preservar params={ctx.params} exceto={['gest_ciclo', 'gest_anonimo']} />

          <div>
            <label htmlFor="gest_ciclo" className="rotulo">
              Mês
            </label>
            <select
              id="gest_ciclo"
              name="gest_ciclo"
              defaultValue={ciclo.id}
              className="numero mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {fechados.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.competencia}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="gest_anonimo"
              value="1"
              defaultChecked={anonimizado}
              className="size-4 accent-[color:var(--color-acento)]"
            />
            Esconder os nomes
          </label>

          <Botao type="submit" variante="contorno">
            Aplicar
          </Botao>
        </form>
      </Painel>

      <section id="alvo-gest-numeros" className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { rotulo: 'Nota média', valor: media.toFixed(2) },
          { rotulo: 'Gestores avaliados', valor: String(avaliacoes.length) },
          { rotulo: 'Avaliações com aviso', valor: String(comAviso) },
        ].map((item) => (
          <div key={item.rotulo} className="border border-linha bg-fundo px-4 py-3">
            <p className="rotulo">{item.rotulo}</p>
            <p className="numero mt-1 text-2xl">{item.valor}</p>
          </div>
        ))}
      </section>

      <Painel
        alvo="gest-ranking"
        titulo="Ranking por área"
        descricao={
          anonimizado
            ? 'Nomes escondidos: dá para comparar as áreas sem expor quem é quem.'
            : 'Da maior nota para a menor, no mês escolhido.'
        }
      >
        <div className="overflow-x-auto border border-linha">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-linha bg-superficie">
                {[
                  '#',
                  anonimizado ? 'Identificação' : 'Gestor',
                  'Área',
                  'Score',
                  'Faixa',
                  'Avisos',
                ].map((c) => (
                  <th key={c} className="rotulo px-3 py-2 text-left">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranking.map((avaliacao, i) => {
                const gestor = dados.gestorPorId(avaliacao.gestorId)
                const area = gestor ? dados.areaPorId(gestor.areaId) : undefined
                return (
                  <tr key={avaliacao.gestorId} className="border-b border-linha last:border-0">
                    <td className="numero px-3 py-1.5">{i + 1}</td>
                    <td className="px-3 py-1.5">
                      {anonimizado ? (
                        <Num className="text-apagado">
                          gestor {String(i + 1).padStart(2, '0')}
                        </Num>
                      ) : (
                        gestor?.nome
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-apagado">
                      {anonimizado ? 'área oculta' : `${area?.sigla} · ${area?.nome}`}
                    </td>
                    <td className="numero px-3 py-1.5 font-semibold">
                      {avaliacao.score.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5">{avaliacao.faixa?.rotulo ?? 'sem faixa'}</td>
                    <td className="px-3 py-1.5">
                      {avaliacao.avisos.length > 0 ? (
                        <Etiqueta tom="alerta">{avaliacao.avisos.length}</Etiqueta>
                      ) : (
                        <span className="text-apagado">nenhum</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <Aviso>
            O ranking serve para a gestão enxergar o conjunto, não para expor pessoas. Esconder
            os nomes deixa projetar este painel numa reunião sem constranger ninguém.
          </Aviso>
        </div>
      </Painel>
    </>
  )
}
