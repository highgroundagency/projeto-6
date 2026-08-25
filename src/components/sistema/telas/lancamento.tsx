import { Building2, PencilLine } from 'lucide-react'
import { Botao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { AcoesDaTela, Aviso, Painel, Preservar } from '@/components/sistema/base'
import { mensagemDe, type PropsTela } from '@/components/sistema/telas/tipos'
import { ROTULO_ESTADO, type Lancamento, type Subindicador } from '@/lib/calculo/tipos'
import {
  carregarDados,
  lancamentosDoCiclo,
  pareceErroDeDigitacao,
  vigente,
} from '@/lib/dados/consultas'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** O valor apurado de um lançamento, na escala da meta, para o aviso de vírgula. */
function apurado(sub: Subindicador, lancamento: Lancamento): number | null {
  if (sub.tipo === 'indice') return lancamento.valor
  if (lancamento.numerador === null || !lancamento.denominador) return null
  return (lancamento.numerador / lancamento.denominador) * 100
}

export async function TelaLancamento({ ctx }: PropsTela) {
  const { ok, erro } = mensagemDe(ctx, 'lancamento')
  const unidadeSelecionada = ctx.params.lanc_unidade

  const dados = await carregarDados()
  const unidade =
    dados.unidades.find((u) => u.id === unidadeSelecionada) ?? dados.unidades[0]
  const tipo = dados.tipoUnidadePorId(unidade.tipoId)
  const distrito = dados.distritoPorId(unidade.distritoId)

  const cicloAberto = dados.cicloEmLancamento()
  const regra = cicloAberto ? dados.regraPorId(cicloAberto.regraId) : undefined
  const aplicaveis = regra ? dados.indicadoresDoTipo(unidade.tipoId, regra) : []
  const lancados = cicloAberto ? await lancamentosDoCiclo(cicloAberto.id) : []
  const podeLancar = Boolean(cicloAberto) && ctx.perfil !== 'administrador'

  const inicioRevisao = cicloAberto?.revisaoInicio.slice(8, 10)
  const fimJanela = cicloAberto?.janelaLancamentoFim.slice(8, 10)

  return (
    <>
      <AcoesDaTela>
        {cicloAberto ? (
          <>
            <Etiqueta tom="acento">
              ciclo {cicloAberto.competencia} · {ROTULO_ESTADO[cicloAberto.estado]}
            </Etiqueta>
            {/* A regra dos 5 dias da reunião de 22/08: o fim do prazo é período
                de revisão, e corrigir ali cria registro novo com histórico. */}
            <Etiqueta>
              janela de revisão: dia {inicioRevisao} a {fimJanela}
            </Etiqueta>
          </>
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
        alvo="lanc-unidade"
        titulo="Unidade" icone={Building2}
        descricao="Escolha a unidade. Cada unidade informa apenas os próprios números, e o tipo dela decide o que aparece para preencher."
      >
        <form
          method="get"
          action={`/sistema${ancoraDaTela('lancamento')}`}
          className="flex flex-wrap items-end gap-3"
        >
          {/* `abrir` mantém esta sanfona escancarada depois do envio; `Preservar`
              impede que trocar de unidade zere as escolhas das outras telas. */}
          <input type="hidden" name="abrir" value="lancamento" />
          <Preservar params={ctx.params} exceto={['lanc_unidade']} />
          <div>
            <label htmlFor="lanc_unidade" className="rotulo">
              Unidade de saúde
            </label>
            <select
              id="lanc_unidade"
              name="lanc_unidade"
              defaultValue={unidade.id}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {dados.unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} · {dados.distritoPorId(u.distritoId)?.nome}
                </option>
              ))}
            </select>
          </div>
          <Botao type="submit" variante="contorno">
            Trocar unidade
          </Botao>
        </form>

        <p className="mt-3 text-xs text-apagado">
          {tipo?.nome} ({tipo?.sigla}) · {distrito?.nome}. O tipo decide quais indicadores
          valem e com que pesos: a régua está na regra vigente.
        </p>
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
        titulo={`O que ${unidade.nome} preenche`} icone={PencilLine}
        descricao="Cada indicador é calculado a partir dos subindicadores abaixo dele. O que já foi enviado aparece preenchido; corrigir cria um registro novo, e o valor antigo fica guardado."
      >
        <div className="space-y-4">
          {aplicaveis.map(({ indicador, aplicabilidade }) => {
            const subs = dados.subindicadoresDoIndicador(indicador.id)

            return (
              <section key={indicador.id} className="border border-linha p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-medium">{indicador.nome}</h4>
                  <Num className="text-xs text-apagado">
                    meta {aplicabilidade.meta} {indicador.unidadeMedida} ·{' '}
                    {indicador.direcao === 'maior_melhor' ? 'maior é melhor' : 'menor é melhor'}{' '}
                    · peso {aplicabilidade.peso}
                  </Num>
                </div>

                <div className="mt-3 space-y-3">
                  {subs.map((sub) => {
                    const atual = cicloAberto
                      ? vigente(lancados, sub.id, unidade.id)
                      : undefined
                    const valorApurado = atual ? apurado(sub, atual) : null
                    const suspeito =
                      valorApurado !== null &&
                      pareceErroDeDigitacao(valorApurado, aplicabilidade.meta)

                    return (
                      <form
                        key={sub.id}
                        action="/api/sistema/lancamento"
                        method="post"
                        className="border-t border-linha pt-3"
                      >
                        <input type="hidden" name="subindicadorId" value={sub.id} />
                        <input type="hidden" name="unidadeId" value={unidade.id} />
                        <input type="hidden" name="cicloId" value={cicloAberto?.id ?? ''} />

                        <p className="text-sm">{sub.nome}</p>

                        {sub.tipo === 'indice' ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-[9rem_1fr_auto] sm:items-end">
                            <div>
                              <label htmlFor={`valor-${sub.id}`} className="rotulo">
                                Valor ({indicador.unidadeMedida})
                              </label>
                              <input
                                id={`valor-${sub.id}`}
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
                            <CampoEvidencia sub={sub} atual={atual} podeLancar={podeLancar} />
                            <Botao type="submit" variante="primario" disabled={!podeLancar}>
                              Salvar
                            </Botao>
                          </div>
                        ) : (
                          <div className="mt-2 grid gap-2 sm:grid-cols-[8rem_8rem_1fr_auto] sm:items-end">
                            <div>
                              <label htmlFor={`numerador-${sub.id}`} className="rotulo">
                                {sub.rotuloNumerador ?? 'Numerador'}
                              </label>
                              <input
                                id={`numerador-${sub.id}`}
                                name="numerador"
                                type="number"
                                step="1"
                                min={0}
                                required
                                disabled={!podeLancar}
                                defaultValue={atual?.numerador ?? ''}
                                className="numero mt-1 w-full border border-linha px-2 py-1.5 text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor={`denominador-${sub.id}`} className="rotulo">
                                {sub.rotuloDenominador ?? 'Denominador'}
                              </label>
                              <input
                                id={`denominador-${sub.id}`}
                                name="denominador"
                                type="number"
                                step="1"
                                min={0}
                                required
                                disabled={!podeLancar}
                                defaultValue={atual?.denominador ?? ''}
                                className="numero mt-1 w-full border border-linha px-2 py-1.5 text-sm"
                              />
                            </div>
                            <CampoEvidencia sub={sub} atual={atual} podeLancar={podeLancar} />
                            <Botao type="submit" variante="primario" disabled={!podeLancar}>
                              Salvar
                            </Botao>
                          </div>
                        )}

                        {sub.tipo === 'razao' && valorApurado !== null ? (
                          <p className="numero mt-1.5 text-xs text-apagado">
                            proporção apurada: {valorApurado.toFixed(1)}%
                          </p>
                        ) : null}

                        {suspeito ? (
                          <p className="mt-2 border-l-2 border-alerta bg-alerta/5 px-2 py-1.5 text-xs text-alerta">
                            Este valor ficou muito longe da meta: confira se a vírgula está no
                            lugar. O aviso não trava o envio; quem decide é você.
                          </p>
                        ) : null}
                      </form>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {aplicaveis.length === 0 && cicloAberto ? (
            <Aviso>
              Nenhum indicador se aplica ao tipo desta unidade na regra vigente deste ciclo.
            </Aviso>
          ) : null}
        </div>

        {!podeLancar && cicloAberto ? (
          <p className="mt-3 text-xs text-apagado">
            Este perfil não informa números: ele só acompanha. Quem preenche é a gerência da
            unidade; a gerência distrital revisa na janela de revisão.
          </p>
        ) : null}
      </Painel>
    </>
  )
}

function CampoEvidencia({
  sub,
  atual,
  podeLancar,
}: {
  sub: Subindicador
  atual: Lancamento | undefined
  podeLancar: boolean
}) {
  return (
    <div>
      <label htmlFor={`evidencia-${sub.id}`} className="rotulo">
        De onde veio
      </label>
      <input
        id={`evidencia-${sub.id}`}
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
  )
}
