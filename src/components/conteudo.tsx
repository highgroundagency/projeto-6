import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Primitivos de apresentação usados pelo conteúdo dos ciclos.
 *
 * Todos são Server Components sem estado. Isso é deliberado: os arquivos de
 * `content/ciclos/` não podem arrastar código para o bundle do cliente, senão
 * um ciclo futuro deixaria rastro em `.next/static`.
 */

export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: ReactNode
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h4 className="fonte-display text-lg text-texto">{titulo}</h4>
      {descricao ? <p className="mt-1 max-w-prose text-sm text-apagado">{descricao}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Grade({ colunas = 2, children }: { colunas?: 2 | 3; children: ReactNode }) {
  return (
    <div
      className={cn(
        'grid gap-3',
        colunas === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2',
      )}
    >
      {children}
    </div>
  )
}

export function Cartao({
  titulo,
  etiqueta,
  children,
}: {
  titulo: string
  etiqueta?: string
  children: ReactNode
}) {
  return (
    <article className="border border-linha bg-fundo p-4">
      <header className="flex items-baseline justify-between gap-2">
        <h5 className="fonte-display text-sm text-texto">{titulo}</h5>
        {etiqueta ? <span className="rotulo shrink-0">{etiqueta}</span> : null}
      </header>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-apagado">{children}</div>
    </article>
  )
}

export function Lista({ itens }: { itens: readonly string[] }) {
  return (
    <ul className="space-y-1.5 text-sm leading-relaxed">
      {itens.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-acento" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function ListaDefinicao({
  itens,
}: {
  itens: readonly { termo: string; definicao: string }[]
}) {
  return (
    <dl className="divide-y divide-linha border-y border-linha">
      {itens.map((item) => (
        <div key={item.termo} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
          <dt className="rotulo pt-0.5">{item.termo}</dt>
          <dd className="text-sm leading-relaxed">{item.definicao}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Tabela({
  colunas,
  linhas,
  alinharNumeros = true,
}: {
  colunas: readonly string[]
  linhas: readonly (readonly string[])[]
  alinharNumeros?: boolean
}) {
  return (
    <div className="overflow-x-auto border border-linha">
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-linha bg-superficie">
            {colunas.map((coluna) => (
              <th key={coluna} className="rotulo px-3 py-2 text-left">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-b border-linha last:border-0">
              {linha.map((celula, j) => (
                <td
                  key={j}
                  className={cn(
                    'px-3 py-2 align-top leading-relaxed',
                    alinharNumeros && j > 0 && /^[\d.,%\s: -]+$/.test(celula)
                      ? 'numero whitespace-nowrap'
                      : '',
                  )}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Quadro 2×2 — SWOT, impacto × esforço, e afins. */
export function Quadro({
  quadrantes,
}: {
  quadrantes: readonly { titulo: string; itens: readonly string[] }[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {quadrantes.map((quadrante) => (
        <div key={quadrante.titulo} className="border border-linha bg-fundo p-4">
          <h5 className="rotulo text-texto">{quadrante.titulo}</h5>
          <div className="mt-2">
            <Lista itens={quadrante.itens} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Citacao({ children, fonte }: { children: ReactNode; fonte?: string }) {
  return (
    <blockquote className="border-l-2 border-acento bg-superficie px-4 py-3">
      <p className="text-sm leading-relaxed">{children}</p>
      {fonte ? <footer className="rotulo mt-2">{fonte}</footer> : null}
    </blockquote>
  )
}

export function Nota({ children }: { children: ReactNode }) {
  return (
    <p className="border border-dashed border-linha-alta bg-superficie px-3 py-2 text-sm text-apagado">
      {children}
    </p>
  )
}
