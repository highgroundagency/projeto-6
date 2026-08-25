import { MessageSquarePlus, MessagesSquare } from 'lucide-react'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, Painel } from '@/components/sistema/base'
import { mensagemDe, type PropsTela } from '@/components/sistema/telas/tipos'
import type { StatusContestacao } from '@/lib/calculo/tipos'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'

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

export async function TelaContestacao({ ctx }: PropsTela) {
  const { ok, erro } = mensagemDe(ctx, 'contestacao')
  const { cont_gerente: gerenteParam, cont_ciclo: cicloParam } = ctx.params

  const dados = await carregarDados()
  const gerente = dados.gerentes.find((g) => g.id === gerenteParam) ?? dados.gerentes[0]
  const fechados = dados.ciclosFechados()

  // O "sobre o quê" lista o que vale para quem contesta: os indicadores do tipo
  // da unidade do gerente. Para o distrital, cuja nota é a média, vale o
  // catálogo inteiro — a divergência dele pode estar em qualquer unidade.
  const regraReferencia = dados.regraPorId(fechados[fechados.length - 1]?.regraId ?? '')
  const unidadeDoGerente = gerente.unidadeId ? dados.unidadePorId(gerente.unidadeId) : undefined
  const contestaveis =
    unidadeDoGerente && regraReferencia
      ? dados
          .indicadoresDoTipo(unidadeDoGerente.tipoId, regraReferencia)
          .map(({ indicador }) => indicador)
      : dados.indicadores

  const todas = await repositorio().contestacoes()
  const minhas = todas.filter((c) => c.gerenteId === gerente.id)
  const podeAbrir = ctx.perfil !== 'administrador'

  return (
    <>
      {ok ? (
        <div className="mb-5">
          <Aviso tom="ok">{decodeURIComponent(ok)}</Aviso>
        </div>
      ) : null}
      {erro ? (
        <div className="mb-5">
          <Aviso tom="alerta">{decodeURIComponent(erro)}</Aviso>
        </div>
      ) : null}

      <Painel
        alvo="cont-abrir"
        titulo="Pedir revisão da nota" icone={MessageSquarePlus}
        descricao="O pedido não muda a nota na hora: ele abre uma análise, que fica registrada e recebe resposta por escrito."
      >
        <form action="/api/sistema/contestacao" method="post" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="gerenteId" className="rotulo">
                Gerente
              </label>
              <select
                id="gerenteId"
                name="gerenteId"
                defaultValue={gerente.id}
                className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
              >
                {dados.gerentes.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cicloId" className="rotulo">
                Mês
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
                Sobre o quê? (opcional)
              </label>
              <select
                id="indicadorId"
                name="indicadorId"
                defaultValue=""
                className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
              >
                <option value="">a nota como um todo</option>
                {contestaveis.map((i) => (
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
              placeholder="Conte o que você acha que está errado e por quê."
              className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
            />
            <p className="mt-1 text-xs text-apagado">Entre 20 e 1000 caracteres.</p>
          </div>

          <Botao type="submit" variante="primario" disabled={!podeAbrir}>
            Abrir contestação
          </Botao>
          {!podeAbrir ? (
            <p className="text-xs text-apagado">
              Só quem é avaliado (ou a SEAB em nome dele) pede revisão. Este perfil só
              acompanha.
            </p>
          ) : null}
        </form>
      </Painel>

      <Painel
        alvo="cont-lista"
        titulo={`Contestações de ${gerente.nome}`} icone={MessagesSquare}
        descricao={`Os pedidos deste gerente, com a situação de cada um. ${minhas.length} de ${todas.length} no sistema.`}
      >
        {minhas.length === 0 ? (
          <p className="text-sm text-apagado">Nenhum pedido de revisão registrado.</p>
        ) : (
          <ul className="divide-y divide-linha border-y border-linha">
            {minhas.map((contestacao) => (
              <li key={contestacao.id} className="py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <Num className="text-xs text-apagado">
                    {contestacao.abertaEm.slice(0, 10)}
                  </Num>
                  <Num className="text-xs">
                    mês {dados.cicloPorId(contestacao.cicloId)?.competencia}
                  </Num>
                  <Etiqueta tom={TOM[contestacao.status]}>
                    {ROTULO[contestacao.status]}
                  </Etiqueta>
                </div>
                <p className="mt-1 text-sm">{contestacao.motivo}</p>
                {contestacao.indicadorId ? (
                  <p className="mt-1 text-xs text-apagado">
                    Indicador: {dados.indicadorPorId(contestacao.indicadorId)?.nome}
                  </p>
                ) : null}
                {contestacao.resposta ? (
                  <p className="mt-2 border-l-2 border-acento bg-superficie px-3 py-2 text-sm">
                    <span className="rotulo block">Resposta da SEAB</span>
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
