import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Selo as TipoSelo } from '@/lib/registro/tipos'

/**
 * Selo de validação do bloco (rascunho × validado).
 *
 * Pílula: junto com as etiquetas de estado, é a única coisa arredondada da
 * identidade. Tudo o mais tem raio zero.
 */
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
        'pilula',
        selo === 'validado' ? 'border-ok/40 text-ok' : 'text-apagado',
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
