import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Todo número, data e score do Prumo passa por aqui.
 *
 * A mono nos números é parte da identidade (§12): é a "linguagem de auditoria".
 * Encapsular num componente evita depender de disciplina manual a cada uso.
 */
export function Num({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('numero', className)} {...props} />
}
