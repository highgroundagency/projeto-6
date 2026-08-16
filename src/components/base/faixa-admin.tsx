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
