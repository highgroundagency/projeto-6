import { Chamada } from '@/components/base/botao'
import { Num } from '@/components/base/num'
import { AtalhosDeDocumento, type DocumentoNoSite } from '@/components/registro/biblioteca'
import { ARQUIVO_PDF } from '@/content/pitch'
import type { Ciclo } from '@/lib/cronograma'
import { diferencaEmDias, formatarBR, type DataISO } from '@/lib/datas'

/**
 * A ENTREGA DA VEZ: o marco mais próximo, com nome, data e caminho.
 *
 * Nasceu de um defeito real. O site tinha tudo do Kick-off publicado, e a
 * palavra "Kick-off" não aparecia em lugar nenhum da navegação: o índice lista
 * as oito seções que o briefing exige e nenhuma delas é a apresentação, e o
 * botão do topo dizia "pitch", que é o nosso nome interno, não o do professor.
 * Quem chegava procurando o Kick-off não achava nada com esse nome antes de
 * rolar até o registro. Pior: na véspera, o cartão do marco estava ATRÁS do
 * rascunho da Semana 5 na lista, que é ordenada pelo calendário.
 *
 * O bloco fica logo abaixo do hero, antes do índice: a primeira pergunta de
 * quem abre o site no dia da entrega é "o que é hoje", não "o que tem aqui".
 *
 * NÃO É DO KICK-OFF: é do próximo marco, lido do cronograma. Em outubro ele
 * vira o SR1 sozinho, e em dezembro o SR2. Nada aqui sabe o nome do marco.
 *
 * E NÃO VIRA UMA NONA SEÇÃO no índice de propósito: a numeração de 01 a 08 é a
 * do briefing, e quem avalia procura por número. Isto é um aviso, não uma
 * seção do documento.
 */

/** "é hoje", "é amanhã", "em 5 dias". Sem relógio por dentro: `hoje` vem de fora. */
function quando(hoje: DataISO, data: DataISO): string {
  const dias = diferencaEmDias(hoje, data)
  if (dias === 0) return 'é hoje'
  if (dias === 1) return 'é amanhã'
  if (dias > 1) return `em ${dias} dias`
  if (dias === -1) return 'foi ontem'
  return `foi há ${Math.abs(dias)} dias`
}

export function EntregaDaVez({
  marco,
  hoje,
  objetivo,
  documentos,
  slidesLiberados,
}: {
  marco: Ciclo
  hoje: DataISO
  /** O objetivo declarado do ciclo, quando ele já está liberado. */
  objetivo: string | null
  /** Os documentos daquele ciclo. Vazio enquanto o release não o abriu. */
  documentos: readonly DocumentoNoSite[]
  /** A rota dos slides existe hoje? Ela é fechada pelo mesmo ciclo. */
  slidesLiberados: boolean
}) {
  return (
    <section id="entrega" className="bloco revelar scroll-mt-20" aria-labelledby="titulo-entrega">
      <h2 id="titulo-entrega" className="rotulo">
        a entrega da vez
      </h2>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <p className="titulo-bloco text-2xl sm:text-3xl">{marco.rotulo}</p>
        <span className="pilula numero">
          {formatarBR(marco.data)} · {quando(hoje, marco.data)}
        </span>
      </div>

      {objetivo ? <p className="prosa mt-4 text-sm">{objetivo}</p> : null}

      {slidesLiberados ? (
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Chamada href="/pitch">ver a apresentação →</Chamada>
          <a
            href={ARQUIVO_PDF}
            download
            className="text-xs lowercase underline decoration-linha-alta underline-offset-4 transition-colors hover:text-acento"
          >
            baixar em pdf
          </a>
        </div>
      ) : null}

      {documentos.length > 0 ? (
        <>
          <p className="rotulo mt-8">
            os documentos <Num>{documentos.length}</Num>
          </p>
          <AtalhosDeDocumento documentos={documentos} comSemana={false} />
        </>
      ) : null}
    </section>
  )
}
