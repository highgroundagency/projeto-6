import type { Metadata } from 'next'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, CabecalhoTela, Painel, SomenteLeitura } from '@/components/sistema/base'
import type { TipoEvento } from '@/lib/calculo/tipos'
import { carregarDados } from '@/lib/dados/consultas'
import { repositorio } from '@/lib/dados'
import { exigirFeature } from '@/lib/sistema'

export const metadata: Metadata = { title: 'Auditoria' }
export const dynamic = 'force-dynamic'

const ROTULO_TIPO: Record<TipoEvento, string> = {
  ciclo_criado: 'ciclo criado',
  ciclo_estado_alterado: 'estado do ciclo',
  indicador_criado: 'indicador criado',
  indicador_alterado: 'indicador alterado',
  regra_versionada: 'regra versionada',
  lancamento_registrado: 'lançamento',
  lancamento_alterado: 'lançamento corrigido',
  avaliacao_calculada: 'avaliação',
  contestacao_aberta: 'contestação aberta',
  contestacao_respondida: 'contestação respondida',
}

const LIMITE = 120

function Diff({ antes, depois }: { antes: unknown; depois: unknown }) {
  if (antes === null && depois === null) return null
  return (
    <div className="numero mt-1 flex flex-wrap gap-x-3 text-xs">
      {antes !== null ? (
        <span className="text-alerta">antes: {JSON.stringify(antes)}</span>
      ) : (
        <span className="text-apagado">antes:, </span>
      )}
      {depois !== null ? (
        <span className="text-ok">depois: {JSON.stringify(depois)}</span>
      ) : null}
    </div>
  )
}

export default async function TelaAuditoria({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; ciclo?: string }>
}) {
  await exigirFeature('auditoria')
  const { tipo, ciclo } = await searchParams

  const dados = await carregarDados()
  const todos = await repositorio().eventos(500)
  const totalLancamentos = (await repositorio().lancamentos()).length
  const filtrados = todos.filter((evento) => {
    if (tipo && evento.tipo !== tipo) return false
    if (ciclo && !evento.entidade.includes(ciclo) && !evento.descricao.includes(ciclo))
      return false
    return true
  })

  return (
    <>
      <CabecalhoTela
        titulo="Auditoria"
        descricao="Linha do tempo imutável de tudo que aconteceu. Nada aqui pode ser editado ou apagado."
        acao={<SomenteLeitura />}
      />

      <div className="mt-5">
        <Aviso>
          A trilha é <strong>append-only</strong>: correções entram como novos eventos, com o
          valor anterior preservado. Trilha que pode ser editada não serve de prova, e é
          justamente o que falta na planilha.
        </Aviso>
      </div>

      <Painel titulo="Filtros">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="tipo" className="rotulo">
              Tipo de evento
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={tipo ?? ''}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              <option value="">todos</option>
              {Object.entries(ROTULO_TIPO).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
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
              defaultValue={ciclo ?? ''}
              className="numero mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              <option value="">todos</option>
              {dados.ciclos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.competencia}
                </option>
              ))}
            </select>
          </div>

          <Botao type="submit" variante="contorno">
            Filtrar
          </Botao>
        </form>
      </Painel>

      <Painel
        titulo="Linha do tempo"
        descricao={`${filtrados.length} eventos de ${todos.length}. Exibindo os ${Math.min(LIMITE, filtrados.length)} mais recentes.`}
      >
        <ol className="divide-y divide-linha border-y border-linha">
          {filtrados.slice(0, LIMITE).map((evento) => (
            <li key={evento.id} className="py-2.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Num className="text-xs text-apagado">
                  {evento.quando.slice(0, 16).replace('T', ' ')}
                </Num>
                <Etiqueta>{ROTULO_TIPO[evento.tipo]}</Etiqueta>
                <span className="text-sm">{evento.descricao}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3">
                <Num className="text-[0.65rem] text-apagado">
                  {evento.entidade} · {evento.autor} ({evento.perfil})
                </Num>
              </div>
              <Diff antes={evento.antes} depois={evento.depois} />
            </li>
          ))}
        </ol>

        {filtrados.length === 0 ? (
          <p className="text-sm text-apagado">Nenhum evento para este filtro.</p>
        ) : null}
      </Painel>

      <Painel titulo="Resumo" descricao="Contagem por tipo de evento.">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(ROTULO_TIPO).map(([valor, rotulo]) => {
            const quantidade = todos.filter((e) => e.tipo === valor).length
            if (quantidade === 0) return null
            return (
              <li
                key={valor}
                className="flex items-baseline justify-between border border-linha px-3 py-1.5 text-sm"
              >
                <span>{rotulo}</span>
                <Num>{quantidade}</Num>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-apagado">
          {totalLancamentos} lançamentos em {dados.ciclos.length} ciclos.
        </p>
      </Painel>
    </>
  )
}
