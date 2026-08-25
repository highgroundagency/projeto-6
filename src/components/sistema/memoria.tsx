import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import type { Avaliacao, PassoSubindicador } from '@/lib/calculo/tipos'

/**
 * A MEMÓRIA DE CÁLCULO (§8.3).
 *
 * É o argumento central do projeto contra a planilha: qualquer número exibido
 * responde "de onde veio?" em um clique. Tudo em fonte mono — a linguagem de
 * auditoria — e dentro de um `<details>` nativo, sem uma linha de JavaScript.
 */

function porcentagem(valor: number | null): string {
  return valor === null ? ', ' : `${(valor * 100).toFixed(1)}%`
}

export function MemoriaDeCalculo({ avaliacao }: { avaliacao: Avaliacao }) {
  const { memoria } = avaliacao

  return (
    <details className="group overflow-hidden rounded-xl border border-linha bg-cartao">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-superficie">
        <span>
          <span className="fonte-display text-base">Memória de cálculo</span>
          <span className="mt-0.5 block text-xs text-apagado">
            O extrato da nota: a conta inteira, linha por linha, para conferir.
          </span>
        </span>
        <span className="rotulo shrink-0 text-acento">
          <span className="group-open:hidden">abrir</span>
          <span className="hidden group-open:inline">fechar</span>
        </span>
      </summary>

      <div className="border-t border-linha px-4 py-4">
        {/* Antes da tabela, o modo de ler. Sem isto a tela mostrava a conta e
            não dizia para que ela serve, e quem não é da área ficava perdido. */}
        <p className="max-w-prose text-sm leading-relaxed">
          Como ler: cada linha é um indicador, e o valor dele nasce dos subindicadores que a
          unidade preencheu, listados dentro da própria linha. O valor composto é comparado com
          a meta do tipo da unidade e vira pontos. Os pontos são multiplicados pelo peso (o
          quanto aquele item vale). A soma de tudo, dividida pelo máximo possível, dá a nota de
          0 a 100.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <span>
            <span className="rotulo">Regra</span>{' '}
            <Num>
              {memoria.regraId} v{memoria.versaoRegra}
            </Num>
          </span>
          <span>
            <span className="rotulo">Pontuação máxima</span>{' '}
            <Num>{memoria.pontuacaoMaxima}</Num>
          </span>
          <span>
            <span className="rotulo">Soma dos pesos</span> <Num>{memoria.somaPesos}</Num>
          </span>
        </div>

        <div className="mt-3 overflow-x-auto border border-linha">
          <table className="numero w-full min-w-[46rem] border-collapse text-xs">
            <thead>
              <tr className="border-b border-linha bg-superficie">
                {[
                  'Indicador',
                  'Valor',
                  'Meta',
                  'Atingimento',
                  'Faixa',
                  'Pontos',
                  'Peso',
                  'Contribuição',
                ].map((coluna) => (
                  <th key={coluna} className="rotulo px-2 py-1.5 text-left whitespace-nowrap">
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memoria.passos.map((passo) => (
                <tr
                  key={passo.indicadorId}
                  className="border-b border-linha last:border-0 align-top"
                >
                  <td className="px-2 py-1.5">
                    <span className="font-sans">{passo.indicador}</span>
                    <span className="mt-0.5 block text-[0.65rem] text-apagado">
                      {passo.direcao === 'maior_melhor' ? 'maior é melhor' : 'menor é melhor'} ·{' '}
                      {passo.unidadeMedida}
                    </span>
                    {passo.subPassos.length > 0 ? (
                      <ul className="mt-1.5 space-y-0.5 border-l border-linha pl-2">
                        {passo.subPassos.map((sub) => (
                          <li key={sub.subindicadorId} className="text-[0.65rem] text-apagado">
                            <span className="font-sans">{sub.subindicador}</span>:{' '}
                            {descreverSubPasso(sub)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    {passo.valor === null ? (
                      <span className="text-alerta">sem lançamento</span>
                    ) : (
                      passo.valor
                    )}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap">{passo.meta}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    {porcentagem(passo.atingimento)}
                    {passo.aplicouTeto ? (
                      <span
                        className="ml-1 text-[0.65rem] text-acento"
                        title="Atingimento limitado pelo teto da regra"
                      >
                        (teto)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-apagado">{passo.faixa}</td>
                  <td className="px-2 py-1.5">{passo.pontos}</td>
                  <td className="px-2 py-1.5">{passo.peso}</td>
                  <td className="px-2 py-1.5 font-semibold">{passo.contribuicao}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-linha-alta bg-superficie">
                <td colSpan={7} className="rotulo px-2 py-1.5 text-right">
                  Soma das contribuições
                </td>
                <td className="px-2 py-1.5 font-semibold">{memoria.somaContribuicoes}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-3 border-l-2 border-acento bg-superficie px-3 py-2">
          <p className="rotulo">A conta final</p>
          <p className="numero mt-1 text-xs">{memoria.formula}</p>
          <p className="numero mt-1.5 text-sm">
            ({memoria.somaContribuicoes}) ÷ ({memoria.somaPesos} × {memoria.pontuacaoMaxima}) ×
            100 = <strong>{memoria.score}</strong>
          </p>
        </div>

        {avaliacao.avisos.length > 0 ? (
          <div className="mt-3">
            <p className="rotulo">Avisos</p>
            <ul className="mt-1 space-y-1 text-xs">
              {avaliacao.avisos.map((aviso) => (
                <li key={aviso} className="flex gap-2 text-alerta">
                  <span aria-hidden className="mt-1.5 h-px w-3 shrink-0 bg-alerta" />
                  <span>{aviso}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  )
}

/** A conta de um subindicador, numa linha: valor direto ou numerador ÷ denominador. */
function descreverSubPasso(sub: PassoSubindicador): string {
  if (sub.aviso) return sub.aviso
  if (sub.tipo === 'razao') {
    return `${sub.numerador} ÷ ${sub.denominador} = ${sub.valor}%`
  }
  return String(sub.valor)
}

/**
 * O cartão da nota. Aceita também a avaliação distrital: os três campos que
 * ele mostra (score, faixa e avisos) existem nas duas.
 */
export function CartaoScore({
  avaliacao,
}: {
  avaliacao: Pick<Avaliacao, 'score' | 'faixa' | 'avisos'>
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-linha bg-superficie p-5">
      <div>
        <p className="rotulo">Nota do mês</p>
        <p className="numero mt-1 text-5xl font-semibold leading-none">
          {avaliacao.score.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-apagado">o score, de 0 a 100</p>
      </div>

      <div className="text-right">
        <p className="rotulo">Faixa de pagamento</p>
        <p className="fonte-display mt-1 text-xl">{avaliacao.faixa?.rotulo ?? 'sem faixa'}</p>
        {avaliacao.faixa ? (
          <p className="numero mt-0.5 text-sm text-apagado">
            recebe {avaliacao.faixa.percentual}% da gratificação
          </p>
        ) : null}
      </div>

      {avaliacao.avisos.length > 0 ? (
        <Etiqueta tom="alerta">
          {avaliacao.avisos.length} aviso{avaliacao.avisos.length > 1 ? 's' : ''}
        </Etiqueta>
      ) : null}
    </div>
  )
}
