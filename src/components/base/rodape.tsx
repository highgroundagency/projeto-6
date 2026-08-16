import Link from 'next/link'
import { MarcaCesar } from '@/components/base/marca'
import { INSTITUICAO } from '@/content/produto'
import { cn } from '@/lib/utils'

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
        'flex flex-wrap items-center justify-between gap-4 border-t border-linha pt-5 text-xs text-apagado',
        className,
      )}
    >
      {/* A logo assina o rodapé de TODA página, não só o hero da inicial. Quem
          chega direto no /sistema por link nunca passou pela home, e a marca da
          instituição é o que diz de onde aquilo vem. Fica pequena e em linha,
          para assinar sem competir com o conteúdo. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lowercase">
        <MarcaCesar className="h-6" />
        <span aria-hidden className="text-linha-alta">
          ·
        </span>
        <span>
          {INSTITUICAO.escola} · {INSTITUICAO.curso}
        </span>
        <span aria-hidden className="text-linha-alta">
          ·
        </span>
        <span className="numero">{INSTITUICAO.periodo}</span>
        <span aria-hidden className="text-linha-alta">
          ·
        </span>
        <span>{INSTITUICAO.equipe}</span>
      </div>

      <Link
        href="/transparencia-ia"
        className="underline decoration-linha-alta underline-offset-4 lowercase transition-colors hover:text-acento hover:decoration-acento"
      >
        transparência no uso de ia
      </Link>
    </footer>
  )
}
