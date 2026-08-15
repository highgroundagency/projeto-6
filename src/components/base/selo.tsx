import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Selo as TipoSelo } from '@/lib/registro/tipos'

export function Selo({
  selo,
  className,
}: {
  selo: TipoSelo
  className?: string
}) {
  return (
    <span
      className={cn(
        'rotulo inline-flex shrink-0 items-center border px-1.5 py-0.5',
        selo === 'validado'
          ? 'border-verde-ok/40 bg-verde-ok/10 text-verde-ok'
          : 'border-cinza/40 bg-papel-2 text-cinza-forte',
        className,
      )}
      title={
        selo === 'validado'
          ? 'Bloco revisado e validado pela equipe'
          : 'Bloco em rascunho, ainda não validado pela equipe'
      }
    >
      {selo}
    </span>
  )
}

export function Etiqueta({
  children,
  tom = 'neutro',
  className,
}: {
  children: ReactNode
  tom?: 'neutro' | 'laranja' | 'ok' | 'alerta'
  className?: string
}) {
  return (
    <span
      className={cn(
        'rotulo inline-flex shrink-0 items-center border px-1.5 py-0.5',
        tom === 'laranja' && 'border-laranja/50 bg-laranja-fraco text-tinta',
        tom === 'ok' && 'border-verde-ok/40 bg-verde-ok/10 text-verde-ok',
        tom === 'alerta' && 'border-vinho-alerta/40 bg-vinho-alerta/10 text-vinho-alerta',
        tom === 'neutro' && 'border-linha bg-papel-2 text-cinza-forte',
        className,
      )}
    >
      {children}
    </span>
  )
}
