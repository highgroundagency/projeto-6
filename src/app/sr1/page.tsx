import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BotaoTema } from '@/components/base/botao-tema'
import { MarcaPrumo } from '@/components/base/marca'
import { Deck } from '@/components/pitch/deck'
import { SlidesSR1 } from '@/components/sr1/slides'
import {
  ARQUIVO_PDF_SR1,
  DATA_DO_SR1,
  PILULA_DA_CAPA_SR1,
  SLIDES_SR1,
} from '@/content/apresentacao-sr1'
import { formatarBR } from '@/lib/datas'
import { temaAtual } from '@/lib/tema'
import { obterVisao, podeVer } from '@/lib/visao'

export const metadata: Metadata = {
  title: 'Apresentação do SR1',
  description:
    'Os slides do SR1, na ordem da rubrica: imersão, ideação, solução, processo, planejado x realizado e o balanço da equipe.',
}

/**
 * O SR1, como página. O mesmo deck do Kick-off e da AV1 de ML.
 *
 * FECHADA PELO CICLO `sr1`, como `/pitch` é fechada pelo `ko`: é conteúdo do
 * marco, e aparece quando o release o libera. Oculto é 404, e admin, "ver como
 * visitante" e a vitrine pessoal funcionam de graça porque tudo passa por
 * `obterVisao()`.
 *
 * Uma versão só. A de cinco minutos (`?versao=curta`) existiu enquanto o
 * tempo do SR1 não estava confirmado; as orientações oficiais deram quinze
 * minutos, e ela saiu (ADR-047). O parâmetro antigo cai no deck inteiro.
 *
 * Dinâmica por construção: o portão lê cookie e calendário.
 */
export const dynamic = 'force-dynamic'

export default async function PaginaSR1() {
  const visao = await obterVisao()
  if (!podeVer(visao, 'sr1')) notFound()

  const tema = await temaAtual()

  return (
    <>
      <header className="cromo sem-impressao">
        <Link href="/" aria-label="Página inicial">
          <MarcaPrumo tamanho="pequeno" prefixo="sr1 do" />
        </Link>
        <span className="flex items-center gap-3 text-xs lowercase">
          <span className="pilula hidden sm:inline-flex">
            {PILULA_DA_CAPA_SR1} · {formatarBR(DATA_DO_SR1)}
          </span>
          <a
            href={ARQUIVO_PDF_SR1}
            download
            className="underline decoration-linha-alta underline-offset-4 transition-colors hover:text-acento hover:decoration-acento"
          >
            baixar pdf
          </a>
          <BotaoTema tema={tema} voltarPara="/sr1" />
        </span>
      </header>

      <main id="conteudo">
        <Deck total={SLIDES_SR1.length}>
          <SlidesSR1 />
        </Deck>
      </main>
    </>
  )
}
