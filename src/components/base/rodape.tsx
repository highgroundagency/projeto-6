import Link from 'next/link'
import { INSTITUICAO } from '@/content/produto'
import { cn } from '@/lib/utils'
import { MarcaCesar } from './marca'

/**
 * Rodapé comum a todas as páginas.
 *
 * O ponto no canto direito é a entrada do painel administrativo (§1): discreto
 * de propósito, mas com rótulo acessível para quem navega por leitor de tela.
 */
export function Rodape({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-linha pt-4 text-xs text-cinza-forte',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <MarcaCesar />
        <span aria-hidden className="text-linha">
          ·
        </span>
        <span className="numero">{INSTITUICAO.periodo}</span>
        <span aria-hidden className="text-linha">
          ·
        </span>
        <span>{INSTITUICAO.equipe}</span>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/transparencia-ia" className="underline underline-offset-4 hover:text-tinta">
          Transparência no uso de IA
        </Link>
        <Link
          href="/admin/entrar"
          aria-label="Painel administrativo"
          title="Painel administrativo"
          className="px-1 text-base leading-none text-cinza opacity-30 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        >
          ·
        </Link>
      </div>
    </footer>
  )
}
