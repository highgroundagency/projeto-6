import type { ReactNode } from 'react'
import { Check, ChevronRight, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { ORDEM_ESTADOS, ROTULO_ESTADO, type EstadoCiclo } from '@/lib/calculo/tipos'
import {
  idDoAlvo,
  PARAMETROS_EFEMEROS,
  PARAMETROS_SISTEMA,
  type ParametroSistema,
  type ParametrosSistema,
} from '@/lib/sistema/parametros'
import { cn } from '@/lib/utils'

/** Etiqueta de estado, botão de exportar: a linha de ações no topo de uma tela. */
export function AcoesDaTela({ children, alvo }: { children: ReactNode; alvo?: string }) {
  return (
    <div
      id={alvo ? idDoAlvo(alvo) : undefined}
      className="mb-5 flex flex-wrap items-center gap-3 border-b border-linha pb-4"
    >
      {children}
    </div>
  )
}

/**
 * Carrega o estado das outras telas num formulário GET.
 *
 * As oito telas dividem uma query string só (ADR-023), e um `<form method=get>`
 * SUBSTITUI a query inteira ao ser enviado. Sem estes campos ocultos, filtrar a
 * auditoria zeraria o gestor escolhido em "meu resultado" três seções abaixo.
 *
 * Os efêmeros ficam de fora de propósito: faixa de sucesso é de uma leitura só.
 */
export function Preservar({
  params,
  exceto,
}: {
  params: ParametrosSistema
  /** Os campos que ESTE formulário já envia. Repetir viraria valor duplicado. */
  exceto: readonly ParametroSistema[]
}) {
  const descartar = [...PARAMETROS_EFEMEROS, ...exceto]
  return (
    <>
      {PARAMETROS_SISTEMA.filter((chave) => !descartar.includes(chave))
        .filter((chave) => params[chave])
        .map((chave) => (
          <input key={chave} type="hidden" name={chave} value={params[chave]} />
        ))}
    </>
  )
}

export function Painel({
  titulo,
  descricao,
  icone: Icone,
  children,
  className,
  alvo,
}: {
  titulo: string
  descricao?: string
  /** Símbolo do painel, num chip neutro: o acento fica para o que age. */
  icone?: LucideIcon
  children: ReactNode
  className?: string
  /**
   * Nome estável para o tutorial guiado apontar.
   *
   * É o que permite um passo do tutorial contornar ESTE painel sem que a tela
   * precise saber que existe tutorial. Ver `src/components/sistema/tour.tsx`.
   */
  alvo?: string
}) {
  return (
    <section
      id={alvo ? idDoAlvo(alvo) : undefined}
      className={cn(
        'mt-4 rounded-2xl border border-linha bg-cartao shadow-[0_1px_2px_var(--color-sombra)] first:mt-0',
        className,
      )}
    >
      <header className="flex items-start gap-3 px-5 pt-4">
        {Icone ? (
          <span
            aria-hidden
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-superficie text-apagado"
          >
            <Icone size={17} strokeWidth={1.8} />
          </span>
        ) : null}
        <span className="min-w-0">
          <h2 className="fonte-display text-lg leading-snug">{titulo}</h2>
          {descricao ? <p className="mt-0.5 text-sm text-apagado">{descricao}</p> : null}
        </span>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

/** Máquina de estados do ciclo, do rascunho à publicação (§8.2). */
export function TrilhoEstados({ estado }: { estado: EstadoCiclo }) {
  const atual = ORDEM_ESTADOS.indexOf(estado)
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
      {ORDEM_ESTADOS.map((passo, i) => (
        <li key={passo} className="flex items-center gap-1">
          <span
            className={cn(
              'rotulo inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
              i < atual && 'border-transparent bg-superficie text-apagado',
              i === atual && 'border-transparent bg-acento-fraco text-acento',
              i > atual && 'border-dashed border-linha text-apagado',
            )}
          >
            {i < atual ? <Check aria-hidden size={13} strokeWidth={2.5} /> : null}
            {ROTULO_ESTADO[passo]}
          </span>
          {i < ORDEM_ESTADOS.length - 1 ? (
            <ChevronRight aria-hidden size={14} strokeWidth={2} className="text-apagado" />
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
        className="h-2 w-full max-w-40 overflow-hidden rounded-full bg-superficie"
        role="img"
        aria-label={`${valor} de ${total}`}
      >
        <div className="h-full rounded-full bg-acento" style={{ width: `${porcentagem}%` }} />
      </div>
      <Num className="text-xs whitespace-nowrap">
        {valor}/{total}
      </Num>
    </div>
  )
}

export function Aviso({
  tom = 'neutro',
  children,
}: {
  tom?: 'neutro' | 'ok' | 'alerta'
  children: ReactNode
}) {
  const Icone = tom === 'ok' ? CircleCheck : tom === 'alerta' ? TriangleAlert : Info
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm',
        tom === 'ok' && 'border-ok/40 bg-ok/10 text-ok',
        tom === 'alerta' && 'border-alerta/40 bg-alerta/10 text-alerta',
        tom === 'neutro' && 'border-linha bg-superficie text-apagado',
      )}
    >
      <Icone aria-hidden size={17} strokeWidth={1.9} className="mt-0.5 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  )
}

export function SomenteLeitura() {
  return <Etiqueta>somente leitura</Etiqueta>
}
