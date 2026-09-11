import { FileText } from 'lucide-react'
import type { CicloId } from '@/lib/cronograma'
import type { Documento } from '@/lib/registro/tipos'

/**
 * A BIBLIOTECA DE ENTREGAS: todo documento publicado, num lugar só.
 *
 * Os documentos sempre existiram, e sempre estiveram inalcançáveis: cada um
 * mora dentro da sanfona da sua semana, que por sua vez está dentro da sanfona
 * do registro. Dois cliques e três rolagens até a SWOT, e nenhum link no site
 * inteiro apontava para ela, apesar de a âncora `#doc-s2-swot` existir desde o
 * começo.
 *
 * O briefing do Kick-off cobra que todo o material esteja organizado no site, e
 * "organizado" não é "presente no HTML". Esta seção existe para quem avalia
 * abrir a página e ver a lista inteira do que foi entregue, com um clique até
 * cada peça.
 *
 * NÃO DUPLICA CONTEÚDO: cada linha é um link para a âncora que já existe, e o
 * texto vem do próprio documento (`titulo` e `resumo`). Se um documento mudar
 * de nome, esta lista muda junto, porque ela lê a mesma fonte que o registro.
 */

export interface DocumentoNoSite {
  readonly ciclo: CicloId
  readonly rotuloCiclo: string
  readonly id: string
  readonly titulo: string
  readonly resumo: string
  /** A âncora, igual à que `registro-semana.tsx` escreve no `<details>`. */
  readonly ancora: string
}

export function listarDocumentos(
  carregados: readonly {
    id: CicloId
    rotuloCiclo: string
    documentos?: readonly Documento[]
  }[],
): DocumentoNoSite[] {
  return carregados.flatMap((ciclo) =>
    (ciclo.documentos ?? []).map((doc) => ({
      ciclo: ciclo.id,
      rotuloCiclo: ciclo.rotuloCiclo,
      id: doc.id,
      titulo: doc.titulo,
      resumo: doc.resumo,
      ancora: `#doc-${ciclo.id}-${doc.id}`,
    })),
  )
}

/** Uma linha: o título do documento, o que ele entrega e de que semana é. */
function Linha({ doc, comSemana = true }: { doc: DocumentoNoSite; comSemana?: boolean }) {
  return (
    <li className="border-b border-linha last:border-0">
      <a
        href={doc.ancora}
        className="group flex gap-3 px-1 py-2.5 transition-colors hover:bg-superficie"
      >
        <FileText
          aria-hidden
          size={14}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-apagado group-hover:text-acento"
        />
        <span className="min-w-0">
          <span className="fonte-display block text-sm leading-tight group-hover:text-acento">
            {doc.titulo}
          </span>
          <span className="mt-1 block text-xs leading-relaxed">{doc.resumo}</span>
          {comSemana ? <span className="rotulo mt-1 block">{doc.rotuloCiclo}</span> : null}
        </span>
      </a>
    </li>
  )
}

/**
 * A lista inteira, agrupada por semana e na ordem do semestre.
 *
 * Ordem direta, e não invertida como o registro: aqui a pergunta não é "o que
 * saiu esta semana", é "onde está a análise tal". Quem procura um documento
 * pensa na fase do projeto, não na data.
 */
export function Biblioteca({ documentos }: { documentos: readonly DocumentoNoSite[] }) {
  const porCiclo = documentos.reduce<Map<CicloId, DocumentoNoSite[]>>((mapa, doc) => {
    const lista = mapa.get(doc.ciclo) ?? []
    lista.push(doc)
    mapa.set(doc.ciclo, lista)
    return mapa
  }, new Map())

  if (documentos.length === 0) {
    return (
      <p className="mt-6 border border-dashed border-linha px-4 py-6 text-sm">
        Nenhum documento publicado ainda.
      </p>
    )
  }

  return (
    <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {[...porCiclo].map(([ciclo, docs]) => (
        <section key={ciclo} aria-labelledby={`biblioteca-${ciclo}`}>
          <h3 id={`biblioteca-${ciclo}`} className="rotulo text-acento">
            {docs[0].rotuloCiclo}
          </h3>
          <ul className="mt-2">
            {docs.map((doc) => (
              <Linha key={doc.ancora} doc={doc} comSemana={false} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/**
 * Um punhado de documentos escolhidos a dedo, para as seções temáticas.
 *
 * As seções de usuário, solução e processo que o briefing exige não repetem o
 * conteúdo dos documentos: elas APONTAM para eles. Conteúdo duplicado é
 * conteúdo que diverge.
 */
export function AtalhosDeDocumento({ documentos }: { documentos: readonly DocumentoNoSite[] }) {
  if (documentos.length === 0) return null
  return (
    <ul className="mt-5 border-t border-linha">
      {documentos.map((doc) => (
        <Linha key={doc.ancora} doc={doc} />
      ))}
    </ul>
  )
}

/** Escolhe documentos por `ciclo-id`, na ordem pedida, ignorando o que não saiu. */
export function escolher(
  documentos: readonly DocumentoNoSite[],
  chaves: readonly string[],
): DocumentoNoSite[] {
  return chaves
    .map((chave) => documentos.find((doc) => `${doc.ciclo}-${doc.id}` === chave))
    .filter((doc): doc is DocumentoNoSite => doc !== undefined)
}
