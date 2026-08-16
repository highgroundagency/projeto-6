import { Botao, estiloBotao } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { Aviso, Painel, Preservar } from '@/components/sistema/base'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import type { PropsTela } from '@/components/sistema/telas/tipos'
import { avaliacoesDoGestor, carregarDados } from '@/lib/dados/consultas'
import { ancoraDaTela } from '@/lib/sistema/parametros'

export async function TelaMeuResultado({ ctx }: PropsTela) {
  const { res_gestor: gestorParam, res_ciclo: cicloParam } = ctx.params

  const dados = await carregarDados()
  const gestor =
    dados.gestores.find((g) => g.id === gestorParam) ??
    (ctx.gestorId ? dados.gestorPorId(ctx.gestorId) : undefined) ??
    dados.gestores[0]
  const historico = await avaliacoesDoGestor(gestor.id)
  const avaliacao =
    historico.find((a) => a.cicloId === cicloParam) ?? historico[historico.length - 1]

  // A contestação só é oferecida quando ela existe PARA ESTE PERFIL. Antes a
  // checagem era só de release, e o gestor via um botão que a Área técnica
  // também via, apontando para uma tela que não é dela.
  const podeContestar = ctx.disponiveis.includes('contestacao')
  const melhor = historico.reduce((max, a) => Math.max(max, a.score), 0)

  return (
    <>
      <Painel
        titulo="Gestor avaliado"
        descricao="Seletor simulado enquanto o login real não entra (F3)."
      >
        <form
          method="get"
          action={`/sistema${ancoraDaTela('meu-resultado')}`}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="abrir" value="meu-resultado" />
          <Preservar params={ctx.params} exceto={['res_gestor', 'res_ciclo']} />

          <div>
            <label htmlFor="res_gestor" className="rotulo">
              Gestor
            </label>
            <select
              id="res_gestor"
              name="res_gestor"
              defaultValue={gestor.id}
              className="mt-1 block border border-linha px-2 py-1.5 text-sm"
            >
              {dados.gestores.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}: {dados.areaPorId(g.areaId)?.sigla}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="res_ciclo" className="rotulo">
              Ciclo
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
      </Painel>

      {!avaliacao ? (
        <div className="mt-6">
          <Aviso>
            Ainda não há resultado publicado para este gestor. Ciclos em lançamento não produzem
            avaliação: inventar um número aqui seria exatamente o oposto do que este sistema
            defende.
          </Aviso>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CartaoScore avaliacao={avaliacao} />
          </div>

          <div className="mt-4">
            <MemoriaDeCalculo avaliacao={avaliacao} />
          </div>

          <Painel titulo="Evolução entre ciclos" descricao="Score por competência.">
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
            titulo="Discorda do resultado?"
            descricao="A contestação fica registrada, com resposta da comissão."
          >
            {podeContestar ? (
              /* Âncora de verdade, não `next/link`: uma navegação completa
                 garante que o servidor devolva a contestação já aberta, sem
                 depender de o navegador expandir a sanfona sozinho. */
              <a
                className={estiloBotao({ variante: 'secundario' })}
                href={`/sistema?abrir=contestacao&cont_gestor=${gestor.id}&cont_ciclo=${avaliacao.cicloId}${ancoraDaTela('contestacao')}`}
              >
                Abrir contestação
              </a>
            ) : (
              <p className="text-sm text-apagado">
                O fluxo de contestação entra numa etapa posterior do projeto.
              </p>
            )}
          </Painel>
        </>
      )}
    </>
  )
}
