import { cn } from '@/lib/utils'
import { INSTITUICAO, PRODUTO } from '@/content/produto'

/**
 * Wordmark do produto.
 *
 * O prumo é o `_` do fim: o mesmo cursor da headline, aqui parado. O nome vai
 * em minúsculas como todo o resto da identidade.
 */
export function MarcaPrumo({
  tamanho = 'medio',
  prefixo,
  className,
}: {
  tamanho?: 'pequeno' | 'medio' | 'grande'
  /** Texto antes do nome, em cinza. No cabeçalho: "website do". */
  prefixo?: string
  className?: string
}) {
  return (
    <span className={cn('fonte-display inline-flex items-baseline', className)}>
      {prefixo ? (
        <span
          className={cn(
            'mr-1.5 text-apagado',
            tamanho === 'grande' && 'text-2xl sm:text-3xl',
            tamanho === 'medio' && 'text-base',
            tamanho === 'pequeno' && 'text-sm',
          )}
        >
          {prefixo}
        </span>
      ) : null}
      <span
        className={cn(
          tamanho === 'grande' && 'text-4xl sm:text-5xl',
          tamanho === 'medio' && 'text-xl',
          tamanho === 'pequeno' && 'text-sm',
        )}
      >
        {PRODUTO.nome.toLowerCase()}
      </span>
      <span aria-hidden className="text-acento">
        _
      </span>
    </span>
  )
}

/**
 * Marca da instituição.
 *
 * O arquivo é `public/marca/cesar.png`, versionado no repositório. A logo tem
 * canal alfa de verdade, então assenta no fundo escuro sem caixa branca — e é
 * de onde saiu o `--color-acento` (#F7580B).
 *
 * Antes isto checava a existência do arquivo com `existsSync` para cair num
 * wordmark de reserva. Saiu: em serverless o `public/` não está no cwd da
 * função, então a checagem falharia em produção e a logo sumiria justamente lá.
 */
export function MarcaCesar({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- asset local, sem otimização necessária
    <img
      src="/marca/cesar.png"
      alt={`${INSTITUICAO.escola} — ${INSTITUICAO.curso}`}
      width={1440}
      height={863}
      // A logo empilha o símbolo e o wordmark "c.e.s.a.r": abaixo de ~28px de
      // altura o wordmark vira borrão. h-8 mantém os dois legíveis.
      className={cn('h-8 w-auto', className)}
    />
  )
}
