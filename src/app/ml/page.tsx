import type { Metadata } from 'next'
import Link from 'next/link'
import { BotaoTema } from '@/components/base/botao-tema'
import { MarcaPrumo } from '@/components/base/marca'
import { SlidesML } from '@/components/ml/slides'
import { Deck } from '@/components/pitch/deck'
import { ARQUIVO_PDF_ML, DATA_DA_AV1, PILULA_DA_CAPA, SLIDES_ML } from '@/content/apresentacao-ml'
import { formatarBR } from '@/lib/datas'
import { temaAtual } from '@/lib/tema'

export const metadata: Metadata = {
  title: 'AV1 de machine learning',
  description:
    'Os slides da AV1 de machine learning: o problema, o dataset da SESAU, a exploração, o tratamento e as features novas.',
}

/**
 * A AV1 de machine learning, como página. O mesmo deck do Kick-off.
 *
 * SEM PORTÃO DE RELEASE, como `/arquitetura`, e pelo mesmo motivo: é entrega
 * de outra disciplina, não conteúdo de um ciclo do projeto. O que o portão
 * protege é o registro semanal e as telas do sistema antes da hora; esta
 * página não mostra nenhum dos dois. Os números vêm do JSON que o caderno 07
 * grava a partir da base autorizada pela Secretaria (ADR-044), e a menor coisa
 * que aparece é a unidade de saúde, nunca uma pessoa.
 *
 * Dinâmica pelo mesmo motivo do `/pitch`: o tema vem de cookie.
 */
export const dynamic = 'force-dynamic'

export default async function PaginaML() {
  const tema = await temaAtual()

  return (
    <>
      <header className="cromo sem-impressao">
        <Link href="/" aria-label="Página inicial">
          <MarcaPrumo tamanho="pequeno" prefixo="ml do" />
        </Link>
        <span className="flex items-center gap-3 text-xs lowercase">
          <span className="pilula hidden sm:inline-flex">
            {PILULA_DA_CAPA} · {formatarBR(DATA_DA_AV1)}
          </span>
          {/* Âncora comum com `download`, como no pitch: funciona sem
              JavaScript, que é quando baixar o PDF mais importa. */}
          <a
            href={ARQUIVO_PDF_ML}
            download
            className="underline decoration-linha-alta underline-offset-4 transition-colors hover:text-acento hover:decoration-acento"
          >
            baixar pdf
          </a>
          <BotaoTema tema={tema} voltarPara="/ml" />
        </span>
      </header>

      <main id="conteudo">
        <Deck total={SLIDES_ML.length}>
          <SlidesML />
        </Deck>
      </main>
    </>
  )
}
