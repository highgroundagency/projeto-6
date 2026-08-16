import Link from 'next/link'
import { MarcaPrumo } from './marca'

/**
 * Cabeçalho fixo, transparente com desfoque e um fade do fundo embaixo.
 *
 * A identidade pede "logo à esquerda, ícone de menu à direita". Como o site
 * tem exatamente dois destinos, um hambúrguer seria um clique a mais para
 * revelar dois links — e exigiria JavaScript numa página que hoje não usa
 * nenhum. Os dois links ficam à mostra.
 */
export function Cabecalho() {
  return (
    <header className="sem-impressao fixed inset-x-0 top-0 z-50">
      <div className="bg-fundo/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" aria-label="Início">
            <MarcaPrumo tamanho="pequeno" />
          </Link>

          <nav aria-label="Seções" className="flex items-center gap-5 text-xs lowercase">
            <Link href="/registro" className="transition-colors hover:text-acento">
              registro
            </Link>
            <Link href="/sistema" className="transition-colors hover:text-acento">
              sistema
            </Link>
          </nav>
        </div>
      </div>
      {/* Fade do fundo: o conteúdo entra por baixo do cabeçalho sem linha dura. */}
      <div
        aria-hidden
        className="h-6 bg-gradient-to-b from-fundo/70 to-transparent"
      />
    </header>
  )
}
