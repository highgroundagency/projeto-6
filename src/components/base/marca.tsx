import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { cn } from '@/lib/utils'
import { INSTITUICAO, PRODUTO } from '@/content/produto'

/** Wordmark do produto. O ponto laranja é o fio de prumo. */
export function MarcaPrumo({
  tamanho = 'medio',
  className,
}: {
  tamanho?: 'pequeno' | 'medio' | 'grande'
  className?: string
}) {
  return (
    <span className={cn('fonte-display inline-flex items-baseline gap-1', className)}>
      <span
        className={cn(
          tamanho === 'grande' && 'text-5xl sm:text-6xl',
          tamanho === 'medio' && 'text-2xl',
          tamanho === 'pequeno' && 'text-base',
        )}
      >
        {PRODUTO.nome}
      </span>
      <span
        aria-hidden
        className={cn(
          'inline-block rounded-full bg-laranja',
          tamanho === 'grande' && 'size-2.5',
          tamanho === 'medio' && 'size-1.5',
          tamanho === 'pequeno' && 'size-1',
        )}
      />
    </span>
  )
}

/**
 * Marca da instituição.
 *
 * Slot de asset: se existir `public/marca/cesar.svg` (ou .png), ele é usado.
 * Sem arquivo, cai no wordmark tipográfico. Basta soltar o arquivo na pasta —
 * nenhuma alteração de código é necessária.
 */
const ARQUIVOS_MARCA = ['cesar.svg', 'cesar.png'] as const

function caminhoDaMarca(): string | null {
  for (const arquivo of ARQUIVOS_MARCA) {
    if (existsSync(join(process.cwd(), 'public', 'marca', arquivo))) {
      return `/marca/${arquivo}`
    }
  }
  return null
}

export function MarcaCesar({ className }: { className?: string }) {
  const arquivo = caminhoDaMarca()

  if (arquivo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- asset local, sem otimização necessária
      <img
        src={arquivo}
        alt={`${INSTITUICAO.escola} — ${INSTITUICAO.curso}`}
        className={cn('h-6 w-auto', className)}
      />
    )
  }

  return (
    <span className={cn('rotulo text-cinza-forte', className)}>
      {INSTITUICAO.escola} · {INSTITUICAO.curso}
    </span>
  )
}
