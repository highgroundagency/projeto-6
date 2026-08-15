import type { ReactNode } from 'react'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { ORDEM_ESTADOS, ROTULO_ESTADO, type EstadoCiclo } from '@/lib/calculo/tipos'
import { cn } from '@/lib/utils'

export function CabecalhoTela({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-linha pb-5">
      <div>
        <h1 className="fonte-display text-2xl sm:text-3xl">{titulo}</h1>
        <p className="mt-1 max-w-prose text-sm text-cinza-forte">{descricao}</p>
      </div>
      {acao}
    </header>
  )
}

export function Painel({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string
  descricao?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('mt-6 border border-linha bg-white', className)}>
      <header className="border-b border-linha px-4 py-3">
        <h2 className="fonte-display text-lg">{titulo}</h2>
        {descricao ? <p className="mt-0.5 text-sm text-cinza-forte">{descricao}</p> : null}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  )
}

/** Máquina de estados do ciclo, do rascunho à publicação (§8.2). */
export function TrilhoEstados({ estado }: { estado: EstadoCiclo }) {
  const atual = ORDEM_ESTADOS.indexOf(estado)
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {ORDEM_ESTADOS.map((passo, i) => (
        <li key={passo} className="flex items-center gap-1.5">
          <span
            className={cn(
              'rotulo border px-2 py-1',
              i < atual && 'border-linha text-cinza-forte',
              i === atual && 'border-laranja bg-laranja-fraco text-tinta',
              i > atual && 'border-dashed border-linha text-cinza',
            )}
          >
            {ROTULO_ESTADO[passo]}
          </span>
          {i < ORDEM_ESTADOS.length - 1 ? (
            <span aria-hidden className="text-cinza">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export function Barra({ valor, total }: { valor: number; total: number }) {
  const porcentagem = total > 0 ? Math.min(100, (valor / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-full max-w-40 border border-linha bg-papel-2"
        role="img"
        aria-label={`${valor} de ${total}`}
      >
        <div className="h-full bg-laranja" style={{ width: `${porcentagem}%` }} />
      </div>
      <Num className="text-xs whitespace-nowrap">
        {valor}/{total}
      </Num>
    </div>
  )
}

export function Aviso({ tom = 'neutro', children }: { tom?: 'neutro' | 'ok' | 'alerta'; children: ReactNode }) {
  return (
    <p
      className={cn(
        'border px-3 py-2 text-sm',
        tom === 'ok' && 'border-verde-ok/40 bg-verde-ok/10 text-verde-ok',
        tom === 'alerta' && 'border-vinho-alerta/40 bg-vinho-alerta/10 text-vinho-alerta',
        tom === 'neutro' && 'border-linha bg-papel-2 text-cinza-forte',
      )}
    >
      {children}
    </p>
  )
}

export function SomenteLeitura() {
  return <Etiqueta>somente leitura</Etiqueta>
}
