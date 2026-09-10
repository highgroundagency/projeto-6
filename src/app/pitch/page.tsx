import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BotaoTema } from '@/components/base/botao-tema'
import { MarcaPrumo } from '@/components/base/marca'
import { Deck } from '@/components/pitch/deck'
import { Slides } from '@/components/pitch/slides'
import { ARQUIVO_PDF, SLIDES } from '@/content/pitch'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { temaAtual } from '@/lib/tema'
import { obterVisao, podeVer } from '@/lib/visao'

export const metadata: Metadata = {
  title: 'Pitch do Kick-off',
  description:
    'Os nove slides do pitch de cinco minutos do Kick-off, apresentados direto do site.',
}

/**
 * O pitch, como página.
 *
 * A PRIMEIRA ROTA PROTEGIDA POR CICLO, e não por funcionalidade: o pitch é
 * conteúdo do Kick-off, então ele aparece quando o release libera o `ko`, do
 * mesmo jeito que o registro daquela semana. Oculto é 404 (nunca "em breve"),
 * e admin, "ver como visitante" e a vitrine pessoal funcionam de graça, porque
 * tudo passa por `obterVisao()`.
 *
 * Dinâmica por construção: o gate lê cookie e calendário.
 */
export const dynamic = 'force-dynamic'

export default async function PaginaPitch() {
  const visao = await obterVisao()
  if (!podeVer(visao, 'ko')) notFound()

  const tema = await temaAtual()
  const ko = cicloPorId('ko')

  return (
    <>
      <header className="cromo sem-impressao">
        <Link href="/" aria-label="Página inicial">
          <MarcaPrumo tamanho="pequeno" prefixo="pitch do" />
        </Link>
        <span className="flex items-center gap-3 text-xs lowercase">
          <span className="pilula hidden sm:inline-flex">
            {ko.rotulo.toLowerCase()} · {formatarBR(ko.data)}
          </span>
          {/* Âncora comum, com `download`: baixar um arquivo não é navegação
              de aplicação, e assim funciona sem JavaScript, que é o caso em
              que baixar o PDF mais importa. O botão de imprimir, que depende
              de script, fica na barra do deck. */}
          <a
            href={ARQUIVO_PDF}
            download
            className="underline decoration-linha-alta underline-offset-4 transition-colors hover:text-acento hover:decoration-acento"
          >
            baixar pdf
          </a>
          <BotaoTema tema={tema} voltarPara="/pitch" />
        </span>
      </header>

      <main id="conteudo">
        <Deck total={SLIDES.length}>
          <Slides />
        </Deck>
      </main>

    </>
  )
}
