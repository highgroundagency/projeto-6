import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { AcoesDaTela, Aviso, Painel, Preservar } from '@/components/sistema/base'
import { mensagemDe, type PropsTela } from '@/components/sistema/telas/tipos'
import { ROTULO_ESTADO } from '@/lib/calculo/tipos'
import {
  carregarDados,
  lancamentosDoCiclo,
  pareceErroDeDigitacao,
  vigente,
} from '@/lib/dados/consultas'
import { ancoraDaTela } from '@/lib/sistema/parametros'

export async function TelaLancamento({ ctx }: PropsTela) {
  const { ok, erro } = mensagemDe(ctx, 'lancamento')
  const areaSelecionada = ctx.params.lanc_area

  const dados = await carregarDados()
  const areaId = dados.areas.some((a) => a.id === areaSelecionada)
    ? (areaSelecionada as string)
    : dados.areas[0].id
  const area = dados.areaPorId(areaId)!
  const indicadores = dados.indicadoresDaArea(areaId)

  const cicloAberto = dados.cicloEmLancamento()
  const lancados = cicloAberto ? await lancamentosDoCiclo(cicloAberto.id) : []
  const podeLancar =
    Boolean(cicloAberto) && (ctx.perfil === 'area_tecnica' || ctx.perfil === 'cam')

  return (
    <>
      <AcoesDaTela>
        {cicloAberto ? (
          <Etiqueta tom="acento">
            ciclo {cicloAberto.competencia} · {ROTULO_ESTADO[cicloAberto.estado]}
          </Etiqueta>
        ) : (
          <Etiqueta tom="alerta">nenhum ciclo aberto</Etiqueta>
        )}
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
        alvo="lanc-area"
        titulo="Área"
        descricao="Escolha a sua área. Cada área informa apenas os próprios números."
      >
        <form
          method="get"
          action={`/sistema${ancoraDaTela('lancamento')}`}
          className="flex flex-wrap items-end gap-3"
        >
          {/* `abrir` mantém esta sanfona escancarada depois do envio; `Preservar`
              impede que trocar de área zere as escolhas das outras telas. */}
          <input type="hidden" name="abrir" value="lancamento" />
          <Preservar params={ctx.params} exceto={['lanc_area']} />
          <div>
            <label htmlFor="lanc_area" className="rotulo">
              Área técnica
            </label>
            <select
              id="lanc_area"
              name="lanc_area"
              defaultValue={areaId}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {dados.areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.sigla}: {a.nome}
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
            O prazo deste mês está fechado: não dá para informar número agora. Quem tenta fora
            do prazo não consegue, e a tentativa fica registrada no histórico.
          </Aviso>
        </div>
      ) : null}

      <Painel
        alvo="lanc-formularios"
        titulo={`Indicadores de ${area.nome}`}
        descricao="O que já foi enviado aparece preenchido. Corrigir cria um registro novo, e o valor antigo fica guardado."
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
                    {indicador.direcao === 'maior_melhor' ? 'maior é melhor' : 'menor é melhor'}{' '}
                    · peso {indicador.peso}
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
                      De onde veio
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
                      placeholder="De onde veio este número? Ex.: relatório mensal"
                      className="mt-1 w-full border border-linha px-2 py-1.5 text-sm"
                    />
                  </div>
                  <Botao type="submit" variante="primario" disabled={!podeLancar}>
                    Salvar
                  </Botao>
                </div>

                {suspeito ? (
                  <p className="mt-2 border-l-2 border-alerta bg-alerta/5 px-2 py-1.5 text-xs text-alerta">
                    Este valor ficou muito longe da meta: confira se a vírgula está no lugar. O
                    aviso não trava o envio; quem decide é você.
                  </p>
                ) : null}
              </form>
            )
          })}
        </div>

        {!podeLancar && cicloAberto ? (
          <p className="mt-3 text-xs text-apagado">
            Este perfil não informa números: ele só acompanha. Quem preenche é a Área técnica.
          </p>
        ) : null}
      </Painel>
    </>
  )
}
