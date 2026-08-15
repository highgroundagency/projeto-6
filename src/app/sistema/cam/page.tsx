import type { Metadata } from 'next'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, Barra, CabecalhoTela, Painel, TrilhoEstados } from '@/components/sistema/base'
import { ROTULO_ESTADO } from '@/lib/calculo/tipos'
import { BASE } from '@/lib/seed'
import { exigirFeature } from '@/lib/sistema'
import { ciclos, lancamentos, proximoEstado } from '@/lib/sistema/estado'

export const metadata: Metadata = { title: 'Dashboard da CAM' }
export const dynamic = 'force-dynamic'

export default async function TelaCam({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>
}) {
  const { perfil } = await exigirFeature('painel-cam')
  const { ok, erro } = await searchParams

  const todos = ciclos()
  const emAndamento = todos.find((c) => c.estado === 'lancamento_aberto') ?? todos[todos.length - 1]
  const lancados = lancamentos().filter((l) => l.cicloId === emAndamento.id)

  const porArea = BASE.areas.map((area) => {
    const indicadores = BASE.indicadores.filter((i) => i.areaId === area.id)
    const enviados = indicadores.filter((i) => lancados.some((l) => l.indicadorId === i.id))
    return { area, total: indicadores.length, enviados: enviados.length }
  })

  const pendentes = porArea.filter((linha) => linha.enviados < linha.total)
  const seguinte = proximoEstado(emAndamento.estado)
  const podeAgir = perfil === 'cam'

  return (
    <>
      <CabecalhoTela
        titulo="Dashboard da CAM"
        descricao="Funil de lançamento por área, pendências e avanço do estado do ciclo."
        acao={<Etiqueta tom="laranja">{ROTULO_ESTADO[emAndamento.estado]}</Etiqueta>}
      />

      {ok ? <div className="mt-5"><Aviso tom="ok">{decodeURIComponent(ok)}</Aviso></div> : null}
      {erro ? <div className="mt-5"><Aviso tom="alerta">{decodeURIComponent(erro)}</Aviso></div> : null}

      <Painel
        titulo={`Ciclo ${emAndamento.competencia}`}
        descricao={`Regra em uso: ${emAndamento.regraId}. Janela de lançamento até ${emAndamento.janelaLancamentoFim.slice(0, 10)}.`}
      >
        <TrilhoEstados estado={emAndamento.estado} />

        {seguinte ? (
          <form action="/api/sistema/ciclo" method="post" className="mt-4 border-t border-linha pt-4">
            <input type="hidden" name="cicloId" value={emAndamento.id} />
            <p className="text-sm">
              Próxima transição: <strong>{ROTULO_ESTADO[emAndamento.estado]}</strong> →{' '}
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
                Confirmo a transição. A mudança é registrada na trilha de auditoria com o
                estado anterior e o novo.
              </span>
            </label>
            <Botao type="submit" variante="primario" className="mt-3" disabled={!podeAgir}>
              {seguinte === 'homologado' ? 'Homologar ciclo' : `Avançar para ${ROTULO_ESTADO[seguinte]}`}
            </Botao>
            {!podeAgir ? (
              <p className="mt-2 text-xs text-cinza-forte">
                Só o perfil CAM avança o estado do ciclo.
              </p>
            ) : null}
          </form>
        ) : (
          <p className="mt-4 border-t border-linha pt-4 text-sm text-cinza-forte">
            O ciclo já está publicado: não há transição seguinte.
          </p>
        )}
      </Painel>

      <Painel
        titulo="Funil de lançamento por área"
        descricao="Quantos indicadores cada área já informou no ciclo em andamento."
      >
        <ul className="divide-y divide-linha border-y border-linha">
          {porArea.map((linha) => (
            <li
              key={linha.area.id}
              className="grid gap-2 py-2.5 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-4"
            >
              <span className="text-sm">
                <Num className="text-xs text-cinza-forte">{linha.area.sigla}</Num>{' '}
                {linha.area.nome}
              </span>
              <Barra valor={linha.enviados} total={linha.total} />
            </li>
          ))}
        </ul>
      </Painel>

      <Painel
        titulo="Pendências"
        descricao="Áreas que ainda não fecharam o lançamento do ciclo."
      >
        {pendentes.length === 0 ? (
          <Aviso tom="ok">Todas as áreas concluíram o lançamento deste ciclo.</Aviso>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {pendentes.map((linha) => (
              <li key={linha.area.id} className="flex flex-wrap items-baseline gap-2">
                <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-vinho-alerta" />
                <span className="font-medium">{linha.area.nome}</span>
                <Num className="text-xs text-cinza-forte">
                  faltam {linha.total - linha.enviados} de {linha.total}
                </Num>
              </li>
            ))}
          </ul>
        )}
      </Painel>

      <Painel titulo="Ciclos" descricao="Histórico de competências e seus estados.">
        <ul className="divide-y divide-linha border-y border-linha text-sm">
          {[...todos].reverse().map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <Num>{c.competencia}</Num>
              <span className="text-cinza-forte">{c.regraId}</span>
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
