import type { Metadata } from 'next'
import Link from 'next/link'
import { ConteudoArquitetura } from '@/components/arquitetura'
import { AtalhoDoPitch } from '@/components/base/atalho-pitch'
import { Rodape } from '@/components/base/rodape'

export const metadata: Metadata = {
  title: 'Arquitetura',
  description:
    'Os quatro níveis do C4 do Prumo: contexto, contêineres, componentes por camada e o motor de cálculo por dentro.',
}

/**
 * A arquitetura em desenhos, dentro do site (regra da casa nº 5: documento de
 * entrega é página, nunca arquivo para baixar).
 *
 * A página veste a PELE DO SISTEMA (ADR-031), não a folha de especificação:
 * quem chega aqui quer entender desenhos, e cartões com ícones explicam melhor
 * que hairlines. O conteúdo mora em src/components/arquitetura.tsx porque a
 * página inicial também aponta para cá.
 */
export default function PaginaArquitetura() {
  return (
    <div data-pele="sistema" className="min-h-dvh bg-fundo text-texto">
      <main id="conteudo" className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
        <header className="border-b border-linha pb-5">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="rotulo text-apagado hover:text-texto">
              ← página inicial
            </Link>
            <AtalhoDoPitch />
          </div>
          <h1 className="fonte-display mt-3 text-3xl">Arquitetura</h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-apagado">
            O Prumo por dentro, nos quatro níveis do C4: quem usa, de que peças ele é feito,
            como as camadas se separam por dentro e o que o motor faz com um número. Mais o
            caminho que esse número percorre até virar nota. Sem precisar abrir o repositório.
          </p>
        </header>

        <div className="mt-8">
          <ConteudoArquitetura />
        </div>

        <Rodape className="mt-10" />
      </main>
    </div>
  )
}
