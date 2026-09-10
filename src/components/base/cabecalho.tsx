import Link from 'next/link'
import { AtalhoDoPitch } from './atalho-pitch'
import { BotaoTema } from './botao-tema'
import { MarcaPrumo } from './marca'
import type { Tema } from '@/lib/tema'

/**
 * Cabeçalho do site.
 *
 * `sticky`, não `fixed`: a faixa do admin fica acima dele no fluxo normal e
 * rola embora, enquanto o cabeçalho gruda no topo. Com `fixed`, os dois
 * disputavam o mesmo espaço e era preciso compensar altura na mão.
 *
 * A identidade pede "logo à esquerda, ícone de menu à direita". Como a página
 * tem três seções e um destino externo, um hambúrguer seria um clique a mais
 * para revelar quatro links — e exigiria JavaScript numa página que não usa
 * nenhum. Os links ficam à mostra e somem no mobile, onde o espaço não dá.
 */
export function Cabecalho({ tema }: { tema: Tema }) {
  return (
    <header className="sem-impressao sticky top-0 z-50 bg-fundo/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 py-3.5 sm:gap-4 sm:px-8">
        <Link href="/" aria-label="Início">
          <MarcaPrumo tamanho="pequeno" prefixo="website do" />
        </Link>

        <nav aria-label="Seções" className="flex items-center gap-3.5 text-xs lowercase sm:gap-5">
          <a href="#equipe" className="hidden transition-colors hover:text-acento sm:inline">
            equipe
          </a>
          <a href="#registro" className="transition-colors hover:text-acento">
            registro
          </a>
          <Link href="/sistema" className="transition-colors hover:text-acento">
            sistema
          </Link>
          {/* O caminho para a apresentação, enquanto ela for a entrega da vez.
              Some sozinho dez dias depois do Kick-off: um destaque sem prazo
              vira entulho, e ninguém lembra de tirar. Quem decide é a página,
              que já resolveu a visão; aqui o componente só desenha. Borda em
              vez de laranja porque o orçamento de acento da home está no
              limite (regra 11). */}
          {/* O atalho decide sozinho se deve existir: ver atalho-pitch.tsx. */}
          <AtalhoDoPitch className="text-texto" />
          <BotaoTema tema={tema} voltarPara="/" />
        </nav>
      </div>
      <div aria-hidden className="h-px bg-linha" />
    </header>
  )
}
