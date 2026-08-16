import type { Metadata } from 'next'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Aviso, CabecalhoTela, Painel } from '@/components/sistema/base'
import { ROTULO_ESTADO } from '@/lib/calculo/tipos'
import {
  carregarDados,
  lancamentosDoCiclo,
  pareceErroDeDigitacao,
  vigente,
} from '@/lib/dados/consultas'
import { exigirFeature } from '@/lib/sistema'

export const metadata: Metadata = { title: 'Lançamento' }
export const dynamic = 'force-dynamic'

export default async function TelaLancamento({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; ok?: string; erro?: string }>
}) {
  const { perfil } = await exigirFeature('lancamento')
  const { area: areaSelecionada, ok, erro } = await searchParams

  const dados = await carregarDados()
  const areaId = dados.areas.some((a) => a.id === areaSelecionada)
    ? (areaSelecionada as string)
    : dados.areas[0].id
  const area = dados.areaPorId(areaId)!
  const indicadores = dados.indicadoresDaArea(areaId)

  const cicloAberto = dados.cicloEmLancamento()
  const lancados = cicloAberto ? await lancamentosDoCiclo(cicloAberto.id) : []
  const podeLancar = Boolean(cicloAberto) && (perfil === 'area_tecnica' || perfil === 'cam')

  return (
    <>
      <CabecalhoTela
        titulo="Lançamento de indicadores"
        descricao="A área técnica informa os valores do ciclo, com a evidência que sustenta cada número."
        acao={
          cicloAberto ? (
            <Etiqueta tom="acento">
              ciclo {cicloAberto.competencia} · {ROTULO_ESTADO[cicloAberto.estado]}
            </Etiqueta>
          ) : (
            <Etiqueta tom="alerta">nenhum ciclo aberto</Etiqueta>
          )
        }
      />

      {ok ? <div className="mt-5"><Aviso tom="ok">{decodeURIComponent(ok)}</Aviso></div> : null}
      {erro ? <div className="mt-5"><Aviso tom="alerta">{decodeURIComponent(erro)}</Aviso></div> : null}

      <Painel titulo="Área" descricao="Cada área informa apenas os próprios indicadores.">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="area" className="rotulo">
              Área técnica
            </label>
            <select
              id="area"
              name="area"
              defaultValue={areaId}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {dados.areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.sigla} — {a.nome}
                </option>
              ))}
            </select>
          </div>
          <Botao type="submit" variante="contorno">
            Trocar área
          </Botao>
        </form>
      </Painel>

      {!cicloAberto ? (
        <div className="mt-6">
          <Aviso tom="alerta">
            Não há ciclo com janela de lançamento aberta. Fora da janela, o lançamento fica
            bloqueado — e a tentativa continua registrada na auditoria.
          </Aviso>
        </div>
      ) : null}

      <Painel
        titulo={`Indicadores de ${area.nome}`}
        descricao="Valores já enviados aparecem preenchidos. Corrigir cria uma nova versão na trilha; o valor anterior não some."
      >
        <div className="space-y-3">
          {indicadores.map((indicador) => {
            const atual = cicloAberto ? vigente(lancados, indicador.id) : undefined
            const suspeito = atual ? pareceErroDeDigitacao(atual.valor, indicador.meta) : false

            return (
              <form
                key={indicador.id}
                action="/api/sistema/lancamento"
                method="post"
                className="border border-linha p-3"
              >
                <input type="hidden" name="indicadorId" value={indicador.id} />
                <input type="hidden" name="cicloId" value={cicloAberto?.id ?? ''} />
                <input type="hidden" name="area" value={areaId} />

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{indicador.nome}</span>
                  <Num className="text-xs text-apagado">
                    meta {indicador.meta} {indicador.unidade} ·{' '}
                    {indicador.direcao === 'maior_melhor' ? 'maior é melhor' : 'menor é melhor'} ·
                    peso {indicador.peso}
                  </Num>
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-[9rem_1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor={`valor-${indicador.id}`} className="rotulo">
                      Valor ({indicador.unidade})
                    </label>
                    <input
                      id={`valor-${indicador.id}`}
                      name="valor"
                      type="number"
                      step="any"
                      min={0}
                      required
                      disabled={!podeLancar}
                      defaultValue={atual?.valor ?? ''}
                      className="numero mt-1 w-full border border-linha px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`evidencia-${indicador.id}`} className="rotulo">
                      Evidência
                    </label>
                    <input
                      id={`evidencia-${indicador.id}`}
                      name="evidencia"
                      type="text"
                      required
                      minLength={5}
                      maxLength={300}
                      disabled={!podeLancar}
                      defaultValue={atual?.evidencia ?? ''}
                      placeholder="De onde veio este número?"
                      className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
                    />
                  </div>
                  <Botao type="submit" variante="primario" disabled={!podeLancar}>
                    Salvar
                  </Botao>
                </div>

                {suspeito ? (
                  <p className="mt-2 border-l-2 border-alerta bg-alerta/5 px-2 py-1.5 text-xs text-alerta">
                    Valor muito distante da meta — confira se a vírgula está no lugar. O
                    sistema apenas sinaliza: quem decide é você.
                  </p>
                ) : null}
              </form>
            )
          })}
        </div>

        {!podeLancar && cicloAberto ? (
          <p className="mt-3 text-xs text-apagado">
            O perfil atual não lança indicadores. Troque para Área técnica no seletor acima.
          </p>
        ) : null}
      </Painel>
    </>
  )
}
