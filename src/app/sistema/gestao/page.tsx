import type { Metadata } from 'next'
import { Botao, BotaoLink } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, CabecalhoTela, Painel } from '@/components/sistema/base'
import { arredondar } from '@/lib/calculo/motor'
import { avaliacoesDoCiclo, carregarDados } from '@/lib/dados/consultas'
import { exigirFeature } from '@/lib/sistema'

export const metadata: Metadata = { title: 'Painel da gestão' }
export const dynamic = 'force-dynamic'

export default async function TelaGestao({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string; anonimo?: string }>
}) {
  await exigirFeature('painel-gestao')
  const { ciclo: cicloParam, anonimo } = await searchParams

  const dados = await carregarDados()
  const fechados = dados.ciclosFechados()
  const ciclo =
    fechados.find((c) => c.id === cicloParam) ?? dados.cicloMaisRecenteFechado() ?? fechados[0]
  const anonimizado = anonimo === '1'

  if (!ciclo) {
    return (
      <>
        <CabecalhoTela
          titulo="Painel da gestão"
          descricao="Resultados agregados por área, com ranking anonimizável e exportação."
        />
        <div className="mt-6">
          <Aviso>Nenhum ciclo homologado ainda: não há resultado para agregar.</Aviso>
        </div>
      </>
    )
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
      <CabecalhoTela
        titulo="Painel da gestão"
        descricao="Resultados agregados por área, com ranking anonimizável e exportação."
        acao={
          <BotaoLink
            variante="contorno"
            tamanho="pequeno"
            href={`/api/sistema/exportar?ciclo=${ciclo.id}${anonimizado ? '&anonimo=1' : ''}`}
            prefetch={false}
          >
            Exportar CSV
          </BotaoLink>
        }
      />

      <Painel titulo="Ciclo">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="ciclo" className="rotulo">
              Competência
            </label>
            <select
              id="ciclo"
              name="ciclo"
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
              name="anonimo"
              value="1"
              defaultChecked={anonimizado}
              className="size-4 accent-[color:var(--color-laranja)]"
            />
            Anonimizar o ranking
          </label>

          <Botao type="submit" variante="contorno">
            Aplicar
          </Botao>
        </form>
      </Painel>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { rotulo: 'Score médio', valor: media.toFixed(2) },
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
        titulo="Ranking por área"
        descricao={
          anonimizado
            ? 'Identificação oculta: a comparação continua possível sem expor quem é quem.'
            : 'Ordenado pelo score do ciclo.'
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
                      {anonimizado ? ', ' : `${area?.sigla} · ${area?.nome}`}
                    </td>
                    <td className="numero px-3 py-1.5 font-semibold">
                      {avaliacao.score.toFixed(2)}
                    </td>
                    <td className="px-3 py-1.5">{avaliacao.faixa?.rotulo ?? 'sem faixa'}</td>
                    <td className="px-3 py-1.5">
                      {avaliacao.avisos.length > 0 ? (
                        <Etiqueta tom="alerta">{avaliacao.avisos.length}</Etiqueta>
                      ) : (
                        <span className="text-apagado">, </span>
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
            O ranking é uma ferramenta de gestão, não de exposição. A anonimização existe para
            que a comparação entre áreas possa ser discutida sem constranger pessoas, e para que
            o painel possa ser projetado numa reunião.
          </Aviso>
        </div>
      </Painel>
    </>
  )
}
