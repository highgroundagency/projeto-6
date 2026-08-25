import { MessageSquareWarning, Network, TrendingUp, UserRound } from 'lucide-react'
import { Botao, estiloBotao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Aviso, Painel, Preservar } from '@/components/sistema/base'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import type { PropsTela } from '@/components/sistema/telas/tipos'
import type { Gerente } from '@/lib/calculo/tipos'
import {
  avaliacoesDaUnidade,
  avaliacoesDistritaisDoDistrito,
  carregarDados,
  type DadosDoSistema,
} from '@/lib/dados/consultas'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** O que aparece ao lado do nome no seletor: a unidade ou o distrito. */
function vinculoDe(dados: DadosDoSistema, gerente: Gerente): string {
  if (gerente.escopo === 'unidade') {
    return dados.unidadePorId(gerente.unidadeId ?? '')?.nome ?? 'unidade'
  }
  return dados.distritoPorId(gerente.distritoId ?? '')?.nome ?? 'distrito'
}

export async function TelaMeuResultado({ ctx }: PropsTela) {
  const { res_gerente: gerenteParam, res_ciclo: cicloParam } = ctx.params

  const dados = await carregarDados()
  const gerente =
    dados.gerentes.find((g) => g.id === gerenteParam) ??
    (ctx.gerenteId ? dados.gerentePorId(ctx.gerenteId) : undefined) ??
    dados.gerentes[0]

  const historico =
    gerente.escopo === 'unidade'
      ? await avaliacoesDaUnidade(gerente.unidadeId ?? '')
      : await avaliacoesDistritaisDoDistrito(gerente.distritoId ?? '')

  const avaliacao =
    historico.find((a) => a.cicloId === cicloParam) ?? historico[historico.length - 1]

  // A contestação só é oferecida quando ela existe PARA ESTE PERFIL. Antes a
  // checagem era só de release, e o gerente via um botão que o administrador
  // também via, apontando para uma tela que não é dele.
  const podeContestar = ctx.disponiveis.includes('contestacao')
  const melhor = historico.reduce((max, a) => Math.max(max, a.score), 0)

  return (
    <>
      <Painel
        alvo="res-seletor"
        titulo="Gerente avaliado" icone={UserRound}
        descricao="Neste protótipo você escolhe um gerente de exemplo. Na versão final, cada pessoa entraria com o próprio login e veria só a si."
      >
        <form
          method="get"
          action={`/sistema${ancoraDaTela('meu-resultado')}`}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="abrir" value="meu-resultado" />
          <Preservar params={ctx.params} exceto={['res_gerente', 'res_ciclo']} />

          <div>
            <label htmlFor="res_gerente" className="rotulo">
              Gerente
            </label>
            <select
              id="res_gerente"
              name="res_gerente"
              defaultValue={gerente.id}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {dados.gerentes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}: {vinculoDe(dados, g)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="res_ciclo" className="rotulo">
              Mês
            </label>
            <select
              id="res_ciclo"
              name="res_ciclo"
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

        <p className="mt-3 text-xs text-apagado">
          {gerente.escopo === 'unidade'
            ? `A nota deste gerente é a nota da ${vinculoDe(dados, gerente)}, calculada pela régua do tipo dela.`
            : `A nota deste gerente é a média das unidades do ${vinculoDe(dados, gerente)}. Suposição declarada, a validar com a planilha do cliente.`}
        </p>
      </Painel>

      {!avaliacao ? (
        <div className="mt-6">
          <Aviso>
            Ainda não há nota publicada aqui. Mês que ainda está recebendo números não tem
            nota: inventar um número aqui seria o oposto do que este sistema defende.
          </Aviso>
        </div>
      ) : (
        <>
          <div id="alvo-res-score" className="mt-6">
            <CartaoScore avaliacao={avaliacao} />
          </div>

          {'memoria' in avaliacao ? (
            <div id="alvo-res-memoria" className="mt-4">
              <MemoriaDeCalculo avaliacao={avaliacao} />
            </div>
          ) : (
            <Painel
              alvo="res-composicao"
              titulo="Como a média foi composta" icone={Network}
              descricao="A nota do distrito é a média simples das unidades dele no mês."
            >
              <ul className="divide-y divide-linha border-y border-linha text-sm">
                {avaliacao.porUnidade.map((item) => (
                  <li
                    key={item.unidadeId}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-2"
                  >
                    <span>{dados.unidadePorId(item.unidadeId)?.nome ?? item.unidadeId}</span>
                    <Num>{item.score.toFixed(2)}</Num>
                  </li>
                ))}
              </ul>
              <p className="numero mt-3 text-sm">
                média das {avaliacao.porUnidade.length} unidades ={' '}
                <strong>{avaliacao.score.toFixed(2)}</strong>
              </p>
            </Painel>
          )}

          <Painel
            alvo="res-evolucao"
            titulo="Evolução mês a mês" icone={TrendingUp}
            descricao="A nota mês a mês. A barra laranja é o mês escolhido."
          >
            <ul className="space-y-2">
              {historico.map((item) => {
                const largura = melhor > 0 ? (item.score / melhor) * 100 : 0
                const atual = item.cicloId === avaliacao.cicloId
                return (
                  <li
                    key={item.cicloId}
                    className="grid gap-2 sm:grid-cols-[6rem_1fr_4rem] sm:items-center"
                  >
                    <Num className={`text-sm ${atual ? 'font-semibold' : 'text-apagado'}`}>
                      {dados.cicloPorId(item.cicloId)?.competencia}
                    </Num>
                    <div className="h-3 border border-linha bg-superficie">
                      <div
                        className={atual ? 'h-full bg-acento' : 'h-full bg-linha-alta'}
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
            alvo="res-contestar"
            titulo="Discorda da nota?" icone={MessageSquareWarning}
            descricao="O pedido de revisão fica registrado e recebe resposta da SEAB por escrito."
          >
            {podeContestar ? (
              /* Âncora de verdade, não `next/link`: uma navegação completa
                 garante que o servidor devolva a contestação já aberta, sem
                 depender de o navegador expandir a sanfona sozinho. */
              <a
                className={estiloBotao({ variante: 'secundario' })}
                href={`/sistema?abrir=contestacao&cont_gerente=${gerente.id}&cont_ciclo=${avaliacao.cicloId}${ancoraDaTela('contestacao')}`}
              >
                Abrir contestação
              </a>
            ) : (
              <p className="text-sm text-apagado">
                O pedido de revisão entra numa etapa mais adiante do projeto.
              </p>
            )}
          </Painel>
        </>
      )}
    </>
  )
}
