import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Selo as TipoSelo } from '@/lib/registro/tipos'

/**
 * Selo de validação do bloco.
 *
 * NÃO RENDERIZA NADA, e isso é decisão, não preguiça (ADR-026). O selo já
 * apareceu de duas formas: carimbando "validado" em tudo (ruído) e carimbando
 * "rascunho" nas semanas futuras (parecia defeito para quem lê, porque a
 * palavra fala do processo interno da equipe, não do conteúdo). O dado
 * continua existindo em `content/ciclos/` e o teste continua exigindo
 * validador em bloco validado; só a pílula saiu da frente do visitante.
 *
 * O componente fica de pé para o dia em que o selo voltar a ter leitor certo,
 * por exemplo num modo de revisão interna.
 */
export function Selo({ selo, className }: { selo: TipoSelo; className?: string }) {
  void selo
  void className
  return null
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
