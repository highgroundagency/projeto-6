import { MessageSquarePlus, MessagesSquare, Reply } from 'lucide-react'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, Painel } from '@/components/sistema/base'
import { mensagemDe, type PropsTela } from '@/components/sistema/telas/tipos'
import type { StatusContestacao } from '@/lib/calculo/tipos'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { formatarBR, hojeEmRecife } from '@/lib/datas'
import {
  DIAS_PARA_CONTESTAR,
  DIAS_UTEIS_PARA_RESPONDER,
  prazoParaResponder,
  situacaoParaContestar,
} from '@/lib/sistema/prazos'

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
  const respondeAqui = ctx.perfil === 'seab'
  const aguardando = todas.filter((c) => c.status === 'aberta' || c.status === 'em_analise')

  // O prazo de cada mês, dito na opção do seletor. A tela só informa: quem
  // cobra é a camada de escrita, com a hora do pedido.
  const publicacoes = await repositorio().publicacoes()
  const hoje = hojeEmRecife()
  const situacaoDoMes = (cicloId: string): string => {
    const prazo = situacaoParaContestar(publicacoes[cicloId] ?? null, hoje)
    if (prazo.aberto) return `prazo até ${formatarBR(prazo.ate)}`
    return prazo.motivo === 'nao_publicado' ? 'ainda não publicado' : 'prazo encerrado'
  }
  const prazoDaResposta = (abertaEm: string) =>
    formatarBR(prazoParaResponder(hojeEmRecife(new Date(abertaEm))))

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

      {/* O art. 9º, cobrado desde a Sprint 2: 10 dias corridos da publicação
          para pedir, 5 dias úteis do pedido para a SEAB responder. Feriado não
          entra na conta, e a tela diz isso (ver `sistema/prazos.ts`). */}
      <div className="mb-5">
        <Aviso>
          Pelo art. 9º da portaria, o pedido vai em até {DIAS_PARA_CONTESTAR} dias corridos da
          publicação do mês, e a SEAB responde por escrito em até {DIAS_UTEIS_PARA_RESPONDER}{' '}
          dias úteis. Fora do prazo, o sistema não aceita o pedido. Os feriados ainda não entram
          na conta dos dias úteis.
        </Aviso>
      </div>

      <Painel
        alvo="cont-abrir"
        titulo="Pedir revisão da nota"
        icone={MessageSquarePlus}
        descricao="O pedido não muda a nota na hora. Ele fica registrado, com data, na lista abaixo e no histórico. Neste protótipo você escolhe um gerente de exemplo, e o pedido fica só na sua sessão de teste."
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
                    {c.competencia}: {situacaoDoMes(c.id)}
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
            {/* Requisito 6 da Atividade 2 de Direito (src/content/privacidade.ts):
                o texto livre pode receber dado sensível sem querer. */}
            <p className="mt-1 text-xs text-apagado">
              Não escreva aqui dado de saúde, de filiação sindical, de religião ou de origem
              racial. O motivo é lido por quem analisa a contestação.
            </p>
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

      {respondeAqui ? (
        <Painel
          alvo="cont-responder"
          titulo="Pedidos à espera de resposta"
          icone={Reply}
          descricao={`Todos os pedidos ainda sem resposta, de qualquer gerente. A resposta é por escrito, fica com o pedido e entra no histórico. ${aguardando.length} na fila.`}
        >
          {aguardando.length === 0 ? (
            <p className="text-sm text-apagado">Nenhum pedido esperando resposta.</p>
          ) : (
            <ul className="divide-y divide-linha border-y border-linha">
              {aguardando.map((pedido) => (
                <li key={pedido.id} className="py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-sm">
                      {dados.gerentePorId(pedido.gerenteId)?.nome ?? pedido.gerenteId}
                    </span>
                    <Num className="text-xs">
                      mês {dados.cicloPorId(pedido.cicloId)?.competencia}
                    </Num>
                    <Num className="text-xs text-apagado">
                      responder até {prazoDaResposta(pedido.abertaEm)}
                    </Num>
                  </div>
                  <p className="mt-1 text-sm">{pedido.motivo}</p>
                  <form
                    action="/api/sistema/contestacao/responder"
                    method="post"
                    className="mt-2 space-y-2"
                  >
                    <input type="hidden" name="contestacaoId" value={pedido.id} />
                    <input type="hidden" name="gerenteId" value={pedido.gerenteId} />
                    <div>
                      <label htmlFor={`texto-${pedido.id}`} className="rotulo">
                        Resposta
                      </label>
                      <textarea
                        id={`texto-${pedido.id}`}
                        name="texto"
                        required
                        minLength={20}
                        maxLength={1000}
                        rows={3}
                        placeholder="Explique a decisão para quem pediu a revisão."
                        className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="decisao" value="acatada" required />
                        acatar
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="decisao" value="recusada" />
                        recusar
                      </label>
                      <Botao type="submit" variante="contorno">
                        Responder
                      </Botao>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Painel>
      ) : null}

      <Painel
        alvo="cont-lista"
        titulo={`Contestações de ${gerente.nome}`}
        icone={MessagesSquare}
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
                  {contestacao.status === 'aberta' || contestacao.status === 'em_analise' ? (
                    <Num className="text-xs text-apagado">
                      a SEAB responde até {prazoDaResposta(contestacao.abertaEm)}
                    </Num>
                  ) : null}
                </div>
                <p className="mt-1 text-sm">{contestacao.motivo}</p>
                {contestacao.indicadorId ? (
                  <p className="mt-1 text-xs text-apagado">
                    Indicador: {dados.indicadorPorId(contestacao.indicadorId)?.nome}
                  </p>
                ) : null}
                {contestacao.resposta ? (
                  <p className="mt-2 border-l-2 border-acento bg-superficie px-3 py-2 text-sm">
                    <span className="rotulo block">
                      Resposta da SEAB
                      {contestacao.respondidaEm
                        ? `, em ${formatarBR(hojeEmRecife(new Date(contestacao.respondidaEm)))}`
                        : ''}
                    </span>
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
