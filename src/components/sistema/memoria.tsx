import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import type { Avaliacao } from '@/lib/calculo/tipos'

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
    <details className="group border border-linha bg-fundo">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-superficie">
        <span>
          <span className="fonte-display text-base">Memória de cálculo</span>
          <span className="mt-0.5 block text-xs text-apagado">
            Cada passo do cálculo, do lançamento ao score.
          </span>
        </span>
        <span className="rotulo shrink-0 text-acento">
          <span className="group-open:hidden">abrir</span>
          <span className="hidden group-open:inline">fechar</span>
        </span>
      </summary>

      <div className="border-t border-linha px-4 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
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
                      {passo.unidade}
                    </span>
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
          <p className="rotulo">Fórmula</p>
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

export function CartaoScore({ avaliacao }: { avaliacao: Avaliacao }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border border-linha bg-fundo p-5">
      <div>
        <p className="rotulo">Score do ciclo</p>
        <p className="numero mt-1 text-5xl font-semibold leading-none">
          {avaliacao.score.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-apagado">de 0 a 100</p>
      </div>

      <div className="text-right">
        <p className="rotulo">Faixa de gratificação</p>
        <p className="fonte-display mt-1 text-xl">{avaliacao.faixa?.rotulo ?? 'sem faixa'}</p>
        {avaliacao.faixa ? (
          <p className="numero mt-0.5 text-sm text-apagado">
            {avaliacao.faixa.percentual}% da gratificação
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
