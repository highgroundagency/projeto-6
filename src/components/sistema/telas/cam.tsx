import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { AcoesDaTela, Aviso, Barra, Painel, TrilhoEstados } from '@/components/sistema/base'
import { mensagemDe, type PropsTela } from '@/components/sistema/telas/tipos'
import { EXPLICACAO_ESTADO, ORDEM_ESTADOS, ROTULO_ESTADO } from '@/lib/calculo/tipos'
import { carregarDados, lancamentosDoCiclo } from '@/lib/dados/consultas'

export async function TelaCam({ ctx }: PropsTela) {
  const { ok, erro } = mensagemDe(ctx, 'painel-cam')

  const dados = await carregarDados()
  const todos = dados.ciclos
  const emAndamento = dados.cicloEmLancamento() ?? todos[todos.length - 1]
  const lancados = await lancamentosDoCiclo(emAndamento.id)

  const porArea = dados.areas.map((area) => {
    const indicadores = dados.indicadoresDaArea(area.id)
    const enviados = indicadores.filter((i) => lancados.some((l) => l.indicadorId === i.id))
    return { area, total: indicadores.length, enviados: enviados.length }
  })

  const pendentes = porArea.filter((linha) => linha.enviados < linha.total)
  const seguinte = dados.proximoEstado(emAndamento.estado)

  /**
   * O controle de transição só existe para quem tem sessão de admin (ADR-015).
   *
   * Ver em que fase o ciclo está é informação do MVP; movê-lo não é — o estado
   * vive na memória do processo e é compartilhado por todos os visitantes, então
   * um clique de qualquer pessoa mudaria a demonstração para as outras. Quem não
   * é admin não vê o formulário nem qualquer menção a ele.
   */
  const podeAgir = ctx.perfil === 'cam'

  return (
    <>
      <AcoesDaTela>
        <Etiqueta tom="acento">{ROTULO_ESTADO[emAndamento.estado]}</Etiqueta>
        <span className="text-xs text-apagado">
          mês em andamento: <Num>{emAndamento.competencia}</Num>
        </span>
      </AcoesDaTela>

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
        alvo="cam-estado"
        titulo={`Mês ${emAndamento.competencia}`}
        descricao={`Regra em uso: ${emAndamento.regraId}. Prazo para informar os números: até ${emAndamento.janelaLancamentoFim.slice(0, 10)}.`}
      >
        <TrilhoEstados estado={emAndamento.estado} />

        {/* O trilho mostra ONDE o mês está; este quadro diz O QUE cada etapa
            significa. Sem ele, "homologado" e "publicado" eram palavras soltas
            para quem não é do processo, e foi exatamente a reclamação de quem
            usou. Fica dobrado para não ocupar a tela de quem já sabe. */}
        <details className="group mt-4">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-2 text-xs lowercase text-apagado transition-colors hover:text-texto [&::-webkit-details-marker]:hidden">
            o que significa cada etapa?
            <span aria-hidden className="transition-transform group-open:rotate-90">
              →
            </span>
          </summary>
          <ol className="mt-3 space-y-2 border-l-2 border-linha pl-4">
            {ORDEM_ESTADOS.map((etapa) => (
              <li key={etapa} className="text-sm leading-relaxed">
                <span className="rotulo text-texto">{ROTULO_ESTADO[etapa]}</span>
                <span className="mt-0.5 block text-apagado">{EXPLICACAO_ESTADO[etapa]}</span>
              </li>
            ))}
          </ol>
        </details>

        {!seguinte ? (
          <p className="mt-4 border-t border-linha pt-4 text-sm text-apagado">
            Este mês já foi publicado: não há mais etapa para avançar.
          </p>
        ) : ctx.admin ? (
          <form
            action="/api/sistema/ciclo"
            method="post"
            className="mt-4 border-t border-linha pt-4"
          >
            <input type="hidden" name="cicloId" value={emAndamento.id} />
            <p className="text-sm">
              Próxima etapa: <strong>{ROTULO_ESTADO[emAndamento.estado]}</strong> →{' '}
              <strong>{ROTULO_ESTADO[seguinte]}</strong>
            </p>
            <label className="mt-2 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="confirmo"
                required
                disabled={!podeAgir}
                className="mt-0.5 size-4 accent-[color:var(--color-laranja)]"
              />
              <span>
                Confirmo o avanço. Ele fica gravado no histórico, com a etapa anterior e a nova,
                e não tem botão de desfazer.
              </span>
            </label>
            <Botao type="submit" variante="primario" className="mt-3" disabled={!podeAgir}>
              {seguinte === 'homologado'
                ? 'Homologar ciclo'
                : `Avançar para ${ROTULO_ESTADO[seguinte]}`}
            </Botao>
            {!podeAgir ? (
              <p className="mt-2 text-xs text-apagado">Só o perfil CAM avança a etapa.</p>
            ) : null}
          </form>
        ) : null}
      </Painel>

      <Painel
        alvo="cam-funil"
        titulo="Funil de lançamento por área"
        descricao="Quantos números cada área já informou neste mês. Barra cheia: área em dia."
      >
        <ul className="divide-y divide-linha border-y border-linha">
          {porArea.map((linha) => (
            <li
              key={linha.area.id}
              className="grid gap-2 py-2.5 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-4"
            >
              <span className="text-sm">
                <Num className="text-xs text-apagado">{linha.area.sigla}</Num> {linha.area.nome}
              </span>
              <Barra valor={linha.enviados} total={linha.total} />
            </li>
          ))}
        </ul>
      </Painel>

      <Painel
        alvo="cam-pendencias"
        titulo="Pendências"
        descricao="Áreas que ainda não informaram tudo neste mês."
      >
        {pendentes.length === 0 ? (
          <Aviso tom="ok">Todas as áreas já informaram tudo neste mês.</Aviso>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {pendentes.map((linha) => (
              <li key={linha.area.id} className="flex flex-wrap items-baseline gap-2">
                <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-alerta" />
                <span className="font-medium">{linha.area.nome}</span>
                <Num className="text-xs text-apagado">
                  faltam {linha.total - linha.enviados} de {linha.total}
                </Num>
              </li>
            ))}
          </ul>
        )}
      </Painel>

      <Painel titulo="Meses" descricao="Cada mês já avaliado, com a etapa em que está.">
        <ul className="divide-y divide-linha border-y border-linha text-sm">
          {[...todos].reverse().map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <Num>{c.competencia}</Num>
              <span className="text-apagado">{c.regraId}</span>
              <Etiqueta tom={c.estado === 'publicado' ? 'ok' : 'neutro'}>
                {ROTULO_ESTADO[c.estado]}
              </Etiqueta>
            </li>
          ))}
        </ul>
      </Painel>
    </>
  )
}
