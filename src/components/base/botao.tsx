import type { ComponentProps } from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Botão do Prumo.
 *
 * Nota de contraste: laranja (#F15A24) sobre papel dá 3,18:1 e branco sobre
 * laranja dá 3,37:1 — os dois reprovam em AA para texto normal. Por isso o
 * botão primário usa TINTA sobre laranja (6,45:1). Não troque para branco.
 */
export const estiloBotao = cva(
  'inline-flex items-center justify-center gap-2 border font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variante: {
        primario: 'border-laranja bg-laranja text-tinta hover:bg-tinta hover:border-tinta hover:text-papel',
        secundario: 'border-tinta bg-transparent text-tinta hover:bg-tinta hover:text-papel',
        contorno: 'border-linha bg-white text-tinta hover:border-tinta',
        fantasma: 'border-transparent bg-transparent text-tinta hover:bg-papel-2',
        perigo: 'border-vinho-alerta bg-transparent text-vinho-alerta hover:bg-vinho-alerta hover:text-papel',
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
