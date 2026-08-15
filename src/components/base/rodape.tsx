import Link from 'next/link'
import { INSTITUICAO } from '@/content/produto'
import { cn } from '@/lib/utils'
import { MarcaCesar } from './marca'

/**
 * Rodapé comum a todas as páginas.
 *
 * Já teve um ponto discreto levando ao painel administrativo. Ele saiu na
 * ADR-015: um link rotulado "Painel administrativo" é achado por Ctrl+F, por
 * leitor de tela e por qualquer pessoa que passe o mouse no canto — anunciava
 * de graça o mecanismo que controla o que o professor vê. O painel continua em
 * `/admin/entrar`, por URL direta; quem protege é a senha, não o esconderijo.
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

      <Link href="/transparencia-ia" className="underline underline-offset-4 hover:text-tinta">
        Transparência no uso de IA
      </Link>
    </footer>
  )
}
