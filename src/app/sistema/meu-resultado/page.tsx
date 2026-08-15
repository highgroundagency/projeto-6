import type { Metadata } from 'next'
import { Botao, BotaoLink } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Aviso, CabecalhoTela, Painel } from '@/components/sistema/base'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import { avaliacoesDoGestor, carregarDados } from '@/lib/dados/consultas'
import { exigirFeature } from '@/lib/sistema'

export const metadata: Metadata = { title: 'Meu resultado' }
export const dynamic = 'force-dynamic'

export default async function TelaMeuResultado({
  searchParams,
}: {
  searchParams: Promise<{ gestor?: string; ciclo?: string }>
}) {
  const { visao, identidade } = await exigirFeature('meu-resultado')
  const { gestor: gestorParam, ciclo: cicloParam } = await searchParams

  const dados = await carregarDados()
  const gestor =
    dados.gestores.find((g) => g.id === gestorParam) ??
    (identidade.gestorId ? dados.gestorPorId(identidade.gestorId) : undefined) ??
    dados.gestores[0]
  const historico = await avaliacoesDoGestor(gestor.id)
  const avaliacao =
    historico.find((a) => a.cicloId === cicloParam) ?? historico[historico.length - 1]

  const podeContestar = visao.visiveis.includes('s11')
  const melhor = historico.reduce((max, a) => Math.max(max, a.score), 0)

  return (
    <>
      <CabecalhoTela
        titulo="Meu resultado"
        descricao="Seu score no ciclo, a faixa de gratificação e o caminho completo até cada número."
      />

      <Painel titulo="Gestor avaliado" descricao="Seletor simulado enquanto o login real não entra (F3).">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="gestor" className="rotulo">
              Gestor
            </label>
            <select
              id="gestor"
              name="gestor"
              defaultValue={gestor.id}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {dados.gestores.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome} — {dados.areaPorId(g.areaId)?.sigla}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ciclo" className="rotulo">
              Ciclo
            </label>
            <select
              id="ciclo"
              name="ciclo"
              defaultValue={avaliacao?.cicloId ?? ''}
              className="numero mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {historico.map((a) => (
                <option key={a.cicloId} value={a.cicloId}>
                  {dados.cicloPorId(a.cicloId)?.competencia}
                </option>
              ))}
            </select>
          </div>

          <Botao type="submit" variante="contorno">
            Ver resultado
          </Botao>
        </form>
      </Painel>

      {!avaliacao ? (
        <div className="mt-6">
          <Aviso>
            Ainda não há resultado publicado para este gestor. Ciclos em lançamento não
            produzem avaliação — inventar um número aqui seria exatamente o oposto do que
            este sistema defende.
          </Aviso>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CartaoScore avaliacao={avaliacao} />
          </div>

          <div className="mt-4">
            <MemoriaDeCalculo avaliacao={avaliacao} />
          </div>

          <Painel titulo="Evolução entre ciclos" descricao="Score por competência.">
            <ul className="space-y-2">
              {historico.map((item) => {
                const largura = melhor > 0 ? (item.score / melhor) * 100 : 0
                const atual = item.cicloId === avaliacao.cicloId
                return (
                  <li key={item.cicloId} className="grid gap-2 sm:grid-cols-[6rem_1fr_4rem] sm:items-center">
                    <Num className={`text-sm ${atual ? 'font-semibold' : 'text-cinza-forte'}`}>
                      {dados.cicloPorId(item.cicloId)?.competencia}
                    </Num>
                    <div className="h-3 border border-linha bg-papel-2">
                      <div
                        className={atual ? 'h-full bg-laranja' : 'h-full bg-cinza'}
                        style={{ width: `${largura}%` }}
                      />
                    </div>
                    <Num className="text-sm">{item.score.toFixed(2)}</Num>
                  </li>
                )
              })}
            </ul>
          </Painel>

          <Painel
            titulo="Discorda do resultado?"
            descricao="A contestação fica registrada, com resposta da comissão."
          >
            {podeContestar ? (
              <BotaoLink
                variante="secundario"
                href={`/sistema/contestacao?gestor=${gestor.id}&ciclo=${avaliacao.cicloId}`}
              >
                Abrir contestação
              </BotaoLink>
            ) : (
              <p className="text-sm text-cinza-forte">
                O fluxo de contestação entra numa etapa posterior do projeto.
              </p>
            )}
          </Painel>
        </>
      )}
    </>
  )
}
