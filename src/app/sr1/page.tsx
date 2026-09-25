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
  ROTA_CURTA_SR1,
  slidesDaVersao,
  type Versao,
} from '@/content/apresentacao-sr1'
import { formatarBR } from '@/lib/datas'
import { temaAtual } from '@/lib/tema'
import { obterVisao, podeVer } from '@/lib/visao'

export const metadata: Metadata = {
  title: 'Apresentação do SR1',
  description:
    'Os slides do SR1: a planilha do cliente, a regra corrigida, o sistema rodando e o que foi e o que não foi cumprido desde o Kick-off.',
}

/**
 * O SR1, como página. O mesmo deck do Kick-off e da AV1 de ML.
 *
 * FECHADA PELO CICLO `sr1`, como `/pitch` é fechada pelo `ko`: é conteúdo do
 * marco, e aparece quando o release o libera. Oculto é 404, e admin, "ver como
 * visitante" e a vitrine pessoal funcionam de graça porque tudo passa por
 * `obterVisao()`.
 *
 * `?versao=curta` monta a versão de cinco minutos com os mesmos slides: o
 * tempo do SR1 não foi confirmado, e trocar de versão na hora não pode depender
 * de outro arquivo. Qualquer outro valor cai na completa.
 *
 * Dinâmica por construção: o portão lê cookie e calendário.
 */
export const dynamic = 'force-dynamic'

export default async function PaginaSR1({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const visao = await obterVisao()
  if (!podeVer(visao, 'sr1')) notFound()

  const { versao: pedida } = await searchParams
  const versao: Versao = pedida === 'curta' ? 'curta' : 'completa'
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
          {/* A troca de versão é um link comum: funciona sem JavaScript, e o
              deck recomeça do primeiro slide, que é o que se quer ao trocar. */}
          <a
            href={versao === 'curta' ? '/sr1' : ROTA_CURTA_SR1}
            className="underline decoration-linha-alta underline-offset-4 transition-colors hover:text-acento hover:decoration-acento"
          >
            {versao === 'curta' ? 'versão completa' : 'versão de 5 min'}
          </a>
          <a
            href={ARQUIVO_PDF_SR1}
            download
            className="underline decoration-linha-alta underline-offset-4 transition-colors hover:text-acento hover:decoration-acento"
          >
            baixar pdf
          </a>
          <BotaoTema tema={tema} voltarPara={versao === 'curta' ? ROTA_CURTA_SR1 : '/sr1'} />
        </span>
      </header>

      <main id="conteudo">
        <Deck total={slidesDaVersao(versao).length}>
          <SlidesSR1 versao={versao} />
        </Deck>
      </main>
    </>
  )
}
