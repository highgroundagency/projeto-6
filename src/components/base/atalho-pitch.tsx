import Link from 'next/link'
import { Presentation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { pitchEmDestaque } from '@/lib/releases'
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
 * Ele decide sozinho se deve existir, e são duas condições:
 *
 *  1. o Kick-off já foi liberado pelo release, senão o link apontaria para um
 *     404 (a rota `/pitch` é fechada por ciclo);
 *  2. a data ainda está dentro da janela de destaque, que fecha dez dias
 *     depois do marco. Destaque sem prazo vira entulho de interface, e
 *     ninguém lembra de tirar.
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
  if (!podeVer(visao, 'ko') || !pitchEmDestaque(visao.hoje)) return null

  return (
    <Link
      href="/pitch"
      title="Pitch do Kick-off"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 border border-linha-alta px-1.5 py-1 text-xs lowercase transition-colors hover:border-acento hover:text-acento sm:px-2',
        className,
      )}
    >
      <Presentation aria-hidden size={13} strokeWidth={1.5} />
      <span className="sr-only sm:not-sr-only">pitch</span>
    </Link>
  )
}
