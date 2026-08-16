import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Botão do Prumo.
 *
 * Nota de contraste: no fundo escuro, o laranja da CESAR (#F7580B) dá 5,97:1
 * tanto como texto sobre o fundo quanto como fundo sólido com texto em `ink`.
 * Os dois passam em AA — o que não vale no claro, e é por isso que a ADR-009
 * ficou obsoleta. Não troque o texto do primário para branco: branco sobre
 * laranja dá 3,1:1 e reprova.
 */
export const estiloBotao = cva(
  'inline-flex items-center justify-center gap-2 border font-medium lowercase transition-colors disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variante: {
        // Sólido, e inverte no hover — o movimento nº 4 da identidade.
        primario: 'border-acento bg-acento text-ink hover:bg-transparent hover:text-acento',
        secundario:
          'border-linha-alta bg-transparent text-texto hover:border-acento hover:text-acento',
        contorno:
          'border-linha bg-transparent text-apagado hover:border-linha-alta hover:text-texto',
        fantasma: 'border-transparent bg-transparent text-apagado hover:text-texto',
        perigo: 'border-alerta/50 bg-transparent text-alerta hover:bg-alerta hover:text-ink',
      },
      tamanho: {
        pequeno: 'px-2.5 py-1 text-xs',
        medio: 'px-4 py-2 text-sm',
        grande: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: { variante: 'secundario', tamanho: 'medio' },
  },
)

type PropsEstilo = VariantProps<typeof estiloBotao>

export function Botao({
  className,
  variante,
  tamanho,
  ...props
}: ComponentProps<'button'> & PropsEstilo) {
  return <button className={cn(estiloBotao({ variante, tamanho }), className)} {...props} />
}

export function BotaoLink({
  className,
  variante,
  tamanho,
  ...props
}: ComponentProps<typeof Link> & PropsEstilo) {
  return <Link className={cn(estiloBotao({ variante, tamanho }), className)} {...props} />
}

/**
 * Chamada principal, envolta em colchetes literais: `[ ver o registro → ]`.
 *
 * Os colchetes são desenhados como texto mesmo, não como borda — é o que dá o
 * ar de prompt de terminal. Ficam `aria-hidden` para o leitor de tela não
 * anunciar "abre colchete".
 */
export function Chamada({
  href,
  children,
  variante = 'primario',
  className,
}: {
  href: string
  children: ReactNode
  variante?: 'primario' | 'secundario'
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        estiloBotao({ variante, tamanho: 'grande' }),
        'gap-3 tracking-tight',
        className,
      )}
    >
      <span aria-hidden>[</span>
      {children}
      <span aria-hidden>]</span>
    </Link>
  )
}
