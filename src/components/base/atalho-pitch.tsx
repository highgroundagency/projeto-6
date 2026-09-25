import Link from 'next/link'
import { Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deckEmDestaque } from '@/lib/decks'
import { obterVisao, podeVer } from '@/lib/visao'

/**
 * O atalho para a apresentação, no topo de todas as páginas.
 *
 * COMPONENTE, e não uma prop repetida seis vezes: cada página do site tem um
 * cabeçalho próprio, e a primeira versão deste atalho ficou só na inicial.
 * Quem abrisse o sistema, a arquitetura ou a transparência não encontrava
 * caminho nenhum até os slides, que é exatamente o problema que ele existe
 * para resolver.
 *
 * Ele decide sozinho se deve existir, e para QUAL deck, e são duas condições:
 *
 *  1. o marco já foi liberado pelo release, senão o link apontaria para um
 *     404 (as rotas `/pitch` e `/sr1` são fechadas por ciclo);
 *  2. a data ainda está dentro da janela de destaque, que fecha dez dias
 *     depois do marco. Destaque sem prazo vira entulho de interface, e
 *     ninguém lembra de tirar.
 *
 * Até o SR1 ele só sabia do Kick-off, e dez dias depois dele sumia, na
 * semana de preparar a apresentação seguinte. A escolha do deck mora em
 * `lib/decks.ts`.
 *
 * É Server Component: chama `obterVisao()` por conta própria em vez de
 * receber a visão por prop, para uma página nova não precisar lembrar de
 * nada. Custa uma leitura de cookie, que a página já fazia de qualquer jeito.
 *
 * No celular fica só o ícone: com a palavra, o cabeçalho da inicial estoura
 * 360px, e há teste medindo isso.
 */
export async function AtalhoDoPitch({ className }: { className?: string }) {
  const visao = await obterVisao()
  const deck = deckEmDestaque(visao.hoje, (ciclo) => podeVer(visao, ciclo))
  if (!deck) return null

  return (
    <Link
      href={deck.rota}
      title={deck.titulo}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 border border-linha-alta px-1.5 py-1 text-xs lowercase transition-colors hover:border-acento hover:text-acento sm:px-2',
        className,
      )}
    >
      <Presentation aria-hidden size={13} strokeWidth={1.5} />
      {/* "kick-off" e não "pitch": pitch é o nome interno, e quem avalia
          procura pela palavra que o professor usa. No celular continua só o
          ícone, senão o cabeçalho estoura em 360px. */}
      <span className="sr-only sm:not-sr-only">{deck.rotulo}</span>
    </Link>
  )
}
