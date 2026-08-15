import Link from 'next/link'
import { MarcaPrumo } from '@/components/base/marca'
import { Rodape } from '@/components/base/rodape'
import { PRODUTO } from '@/content/produto'

/**
 * Porta de entrada (§1).
 *
 * Uma bifurcação, não uma landing page: o professor escolhe por onde entrar.
 * Cabe na tela sem scroll, inclusive em 360px.
 *
 * É a única rota estática do site — não lê cookie nem data, então serve HTML
 * pronto do CDN e mantém o LCP baixo.
 */

function Porta({
  href,
  ordem,
  rotulo,
  descricao,
  className,
}: {
  href: string
  ordem: string
  rotulo: string
  descricao: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-40 flex-col justify-between gap-6 bg-white p-5 transition-colors hover:bg-tinta focus-visible:bg-tinta sm:min-h-56 sm:p-7 ${className ?? ''}`}
    >
      <span className="rotulo numero text-cinza-forte transition-colors group-hover:text-papel/60 group-focus-visible:text-papel/60">
        {ordem}
      </span>
      <span>
        <span className="fonte-display block text-2xl leading-tight text-tinta transition-colors group-hover:text-papel group-focus-visible:text-papel sm:text-3xl">
          {rotulo}
        </span>
        <span className="mt-1.5 flex items-center gap-2 text-sm text-cinza-forte transition-colors group-hover:text-papel/80 group-focus-visible:text-papel/80">
          {descricao}
          <span
            aria-hidden
            className="text-laranja transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </span>
    </Link>
  )
}

export default function PortaDeEntrada() {
  return (
    <main
      id="conteudo"
      className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-between gap-8 px-5 py-7 sm:px-8"
    >
      <header>
        <MarcaPrumo tamanho="grande" />
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-cinza-forte">
          {PRODUTO.subtitulo}
        </p>
      </header>

      <div>
        {/* O trilho do semestre nasce aqui e atravessa a timeline do registro. */}
        <div aria-hidden className="h-0.5 w-full bg-laranja" />
        <nav aria-label="Escolha por onde entrar" className="grid border border-t-0 border-linha sm:grid-cols-2">
          <Porta
            href="/registro"
            ordem="01"
            rotulo="Registro do projeto"
            descricao="A trajetória da equipe, semana a semana"
          />
          <Porta
            href="/sistema"
            ordem="02"
            rotulo="Sistema"
            descricao="O MVP funcionando"
            className="border-t border-linha sm:border-l sm:border-t-0"
          />
        </nav>
      </div>

      <Rodape />
    </main>
  )
}
