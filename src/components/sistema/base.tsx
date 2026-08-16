import type { ReactNode } from 'react'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { ORDEM_ESTADOS, ROTULO_ESTADO, type EstadoCiclo } from '@/lib/calculo/tipos'
import {
  PARAMETROS_EFEMEROS,
  PARAMETROS_SISTEMA,
  type ParametroSistema,
  type ParametrosSistema,
} from '@/lib/sistema/parametros'
import { cn } from '@/lib/utils'

/** Etiqueta de estado, botão de exportar: a linha de ações no topo de uma tela. */
export function AcoesDaTela({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-linha pb-4">
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
  children,
  className,
}: {
  titulo: string
  descricao?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('mt-6 border border-linha bg-fundo first:mt-0', className)}>
      <header className="border-b border-linha px-4 py-3">
        <h2 className="fonte-display text-lg">{titulo}</h2>
        {descricao ? <p className="mt-0.5 text-sm text-apagado">{descricao}</p> : null}
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
              i < atual && 'border-linha text-apagado',
              i === atual && 'border-acento bg-acento-fraco text-texto',
              i > atual && 'border-dashed border-linha text-apagado',
            )}
          >
            {ROTULO_ESTADO[passo]}
          </span>
          {i < ORDEM_ESTADOS.length - 1 ? (
            <span aria-hidden className="text-apagado">
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
        className="h-2 w-full max-w-40 border border-linha bg-superficie"
        role="img"
        aria-label={`${valor} de ${total}`}
      >
        <div className="h-full bg-acento" style={{ width: `${porcentagem}%` }} />
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
  return (
    <p
      className={cn(
        'border px-3 py-2 text-sm',
        tom === 'ok' && 'border-ok/40 bg-ok/10 text-ok',
        tom === 'alerta' && 'border-alerta/40 bg-alerta/10 text-alerta',
        tom === 'neutro' && 'border-linha bg-superficie text-apagado',
      )}
    >
      {children}
    </p>
  )
}

export function SomenteLeitura() {
  return <Etiqueta>somente leitura</Etiqueta>
}
