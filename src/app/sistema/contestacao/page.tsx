import type { Metadata } from 'next'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, CabecalhoTela, Painel } from '@/components/sistema/base'
import type { StatusContestacao } from '@/lib/calculo/tipos'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { exigirFeature } from '@/lib/sistema'

export const metadata: Metadata = { title: 'Contestação' }
export const dynamic = 'force-dynamic'

const TOM: Record<StatusContestacao, 'neutro' | 'acento' | 'ok' | 'alerta'> = {
  aberta: 'acento',
  em_analise: 'acento',
  respondida: 'neutro',
  acatada: 'ok',
  recusada: 'alerta',
}

const ROTULO: Record<StatusContestacao, string> = {
  aberta: 'aberta',
  em_analise: 'em análise',
  respondida: 'respondida',
  acatada: 'acatada',
  recusada: 'recusada',
}

export default async function TelaContestacao({
  searchParams,
}: {
  searchParams: Promise<{ gestor?: string; ciclo?: string; ok?: string; erro?: string }>
}) {
  const { perfil } = await exigirFeature('contestacao')
  const { gestor: gestorParam, ciclo: cicloParam, ok, erro } = await searchParams

  const dados = await carregarDados()
  const gestor = dados.gestores.find((g) => g.id === gestorParam) ?? dados.gestores[0]
  const fechados = dados.ciclosFechados()
  const indicadoresDoGestor = dados.indicadoresDaArea(gestor.areaId)

  const todas = await repositorio().contestacoes()
  const minhas = todas.filter((c) => c.gestorId === gestor.id)
  const podeAbrir = perfil === 'gestor' || perfil === 'cam'

  return (
    <>
      <CabecalhoTela
        titulo="Contestação"
        descricao="Questionamento formal de um resultado, com registro e resposta da comissão."
      />

      {ok ? <div className="mt-5"><Aviso tom="ok">{decodeURIComponent(ok)}</Aviso></div> : null}
      {erro ? <div className="mt-5"><Aviso tom="alerta">{decodeURIComponent(erro)}</Aviso></div> : null}

      <Painel
        titulo="Abrir contestação"
        descricao="A contestação não altera o resultado por si só: ela abre uma análise, que fica registrada na trilha."
      >
        <form action="/api/sistema/contestacao" method="post" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="gestorId" className="rotulo">
                Gestor
              </label>
              <select
                id="gestorId"
                name="gestorId"
                defaultValue={gestor.id}
                className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
              >
                {dados.gestores.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cicloId" className="rotulo">
                Ciclo
              </label>
              <select
                id="cicloId"
                name="cicloId"
                defaultValue={cicloParam ?? fechados[fechados.length - 1]?.id}
                className="numero mt-1 w-full border border-linha px-2 py-1.5 text-sm"
              >
                {fechados.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.competencia}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="indicadorId" className="rotulo">
                Indicador (opcional)
              </label>
              <select
                id="indicadorId"
                name="indicadorId"
                defaultValue=""
                className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
              >
                <option value="">o resultado como um todo</option>
                {indicadoresDoGestor.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="motivo" className="rotulo">
              Motivo
            </label>
            <textarea
              id="motivo"
              name="motivo"
              required
              minLength={20}
              maxLength={1000}
              rows={4}
              disabled={!podeAbrir}
              placeholder="Descreva o que precisa ser revisto e por quê."
              className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
            />
            <p className="mt-1 text-xs text-apagado">Entre 20 e 1000 caracteres.</p>
          </div>

          <Botao type="submit" variante="primario" disabled={!podeAbrir}>
            Abrir contestação
          </Botao>
          {!podeAbrir ? (
            <p className="text-xs text-apagado">
              Só o gestor avaliado (ou a CAM em nome dele) abre contestação.
            </p>
          ) : null}
        </form>
      </Painel>

      <Painel
        titulo={`Contestações de ${gestor.nome}`}
        descricao={`${minhas.length} de ${todas.length} registradas no sistema.`}
      >
        {minhas.length === 0 ? (
          <p className="text-sm text-apagado">Nenhuma contestação registrada.</p>
        ) : (
          <ul className="divide-y divide-linha border-y border-linha">
            {minhas.map((contestacao) => (
              <li key={contestacao.id} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Num className="text-xs text-apagado">{contestacao.abertaEm.slice(0, 10)}</Num>
                  <Num className="text-xs">
                    ciclo {dados.cicloPorId(contestacao.cicloId)?.competencia}
                  </Num>
                  <Etiqueta tom={TOM[contestacao.status]}>{ROTULO[contestacao.status]}</Etiqueta>
                </div>
                <p className="mt-1 text-sm">{contestacao.motivo}</p>
                {contestacao.indicadorId ? (
                  <p className="mt-1 text-xs text-apagado">
                    Indicador: {dados.indicadorPorId(contestacao.indicadorId)?.nome}
                  </p>
                ) : null}
                {contestacao.resposta ? (
                  <p className="mt-2 border-l-2 border-acento bg-superficie px-3 py-2 text-sm">
                    <span className="rotulo block">Resposta da comissão</span>
                    {contestacao.resposta}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Painel>
    </>
  )
}
