import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Diagrama de fluxo vertical.
 *
 * Alterna dois tipos de nó ligados por 40px de linha tracejada: pílula de
 * estado (o que o ciclo É) e card de ação (o que alguém FAZ). Os estados são
 * os mesmos de `ORDEM_ESTADOS` — o diagrama não inventa um fluxo bonito, ele
 * desenha a máquina de estados que o motor executa.
 */

export function Fluxo({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex max-w-md flex-col items-stretch">{children}</div>
}

export function Conector() {
  return <div aria-hidden className="conector conector-anima" />
}

export function EstadoDoFluxo({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center">
      <span className="pilula pilula-acento numero">{children}</span>
    </div>
  )
}

export function AcaoDoFluxo({
  icone,
  titulo,
  children,
  className,
}: {
  icone: ReactNode
  titulo: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start gap-4 border border-linha p-4', className)}>
      <span aria-hidden className="mt-0.5 shrink-0 text-acento">
        {icone}
      </span>
      <span className="min-w-0">
        <span className="rotulo block text-texto">{titulo}</span>
        <span className="mt-1 block text-sm lowercase">{children}</span>
      </span>
    </div>
  )
}
