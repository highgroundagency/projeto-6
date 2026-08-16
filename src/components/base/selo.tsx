import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Selo as TipoSelo } from '@/lib/registro/tipos'

/**
 * Selo de validação do bloco.
 *
 * SÓ APARECE EM RASCUNHO. Validado é o estado normal — carimbar "validado" em
 * tudo não informa nada e ainda enche a tela de pílula. O selo existe para
 * avisar do que ainda NÃO foi revisado; quando não há aviso, não há selo.
 */
export function Selo({ selo, className }: { selo: TipoSelo; className?: string }) {
  if (selo === 'validado') return null

  return (
    <span
      className={cn('pilula text-apagado', className)}
      title="Bloco em rascunho, ainda não validado pela equipe"
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
  /** `acento` é o tom caro: no máximo três usos do laranja por tela. */
  tom?: 'neutro' | 'acento' | 'ok' | 'alerta'
  className?: string
}) {
  return (
    <span
      className={cn(
        'pilula',
        tom === 'acento' && 'pilula-acento',
        tom === 'ok' && 'border-ok/40 text-ok',
        tom === 'alerta' && 'border-alerta/40 text-alerta',
        tom === 'neutro' && 'text-apagado',
        className,
      )}
    >
      {children}
    </span>
  )
}
