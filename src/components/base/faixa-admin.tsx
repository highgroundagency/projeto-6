import Link from 'next/link'
import { Num } from '@/components/base/num'
import { formatarBR } from '@/lib/datas'
import type { Visao } from '@/lib/visao'

/**
 * Faixa fixa no topo quando há sessão administrativa (§7.2).
 *
 * Existe para que ninguém confunda o que está vendo com o que o professor vê.
 */
export function FaixaAdmin({ visao }: { visao: Visao }) {
  // A janela de vitrine aparece para TODO MUNDO, inclusive sem sessão: se o
  // site está aberto ao público, quem chega tem direito de saber que aquilo
  // não é o recorte normal — e a equipe tem direito de perceber que esqueceu
  // aberto. Ver `janelaAberta` em releases.ts.
  if (visao.janelaAberta) {
    return (
      <div className="sem-impressao flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-acento px-4 py-1.5 text-xs text-ink sm:px-8">
        <span className="rotulo text-inherit">
          Vitrine aberta{visao.dataSimulada ? ' — o site está simulando outra data' : ' — o semestre inteiro visível'}
        </span>
        <span className="lowercase">
          {visao.dataSimulada ? (
            <>
              simulando <Num>{formatarBR(visao.dataSimulada)}</Num> · hoje é de fato{' '}
              <Num>{formatarBR(visao.hojeReal)}</Num>
            </>
          ) : (
            <>
              fora desta janela, o site mostra só até{' '}
              <Num>{visao.release.releaseAtual ?? '—'}</Num>
            </>
          )}
        </span>
      </div>
    )
  }

  if (!visao.admin) return null

  const completo = visao.modoCompleto

  return (
    <div
      className={`sem-impressao flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b px-4 py-1.5 text-xs sm:px-8 ${
        completo
          ? 'border-linha-alta bg-superficie text-apagado'
          : 'border-transparent bg-acento text-ink'
      }`}
    >
      <span className="rotulo text-inherit">
        {completo ? 'Modo completo — visível só para você' : 'Vendo como visitante'}
      </span>

      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {visao.verComoVisitante && visao.dataSimulada ? (
          <span>
            data simulada <Num>{formatarBR(visao.dataSimulada)}</Num>
          </span>
        ) : null}
        <span>
          release{' '}
          <Num>{visao.release.releaseAtual ?? '—'}</Num>
          {visao.release.manual ? ' (fixado)' : ` (+${visao.release.adiantamentoDias}d)`}
        </span>
        <Link href="/admin" className="underline underline-offset-2">
          painel
        </Link>
      </span>
    </div>
  )
}
