import { Fragment } from 'react'
import { Tabela } from '@/components/conteudo'
import { segmentar, type NoMarkdown } from '@/lib/markdown'

function Texto({ texto }: { texto: string }) {
  return (
    <>
      {segmentar(texto).map((segmento, i) => (
        <Fragment key={i}>
          {segmento.forte ? (
            <strong className="font-semibold">{segmento.texto}</strong>
          ) : segmento.mono ? (
            <code className="numero bg-superficie px-1 py-0.5 text-[0.85em]">
              {segmento.texto}
            </code>
          ) : (
            segmento.texto
          )}
        </Fragment>
      ))}
    </>
  )
}

/** Renderiza os documentos de `docs/` com a mesma tipografia do resto do site. */
export function Markdown({ nos }: { nos: NoMarkdown[] }) {
  return (
    <div className="space-y-4">
      {nos.map((no, i) => {
        switch (no.tipo) {
          case 'titulo':
            return no.nivel === 1 ? null : (
              <h2 key={i} className="fonte-display mt-8 text-xl first:mt-0">
                <Texto texto={no.texto} />
              </h2>
            )

          case 'paragrafo':
            return (
              <p key={i} className="max-w-prose text-sm leading-relaxed">
                <Texto texto={no.texto} />
              </p>
            )

          case 'lista':
            return (
              <ul key={i} className="max-w-prose space-y-1.5 text-sm leading-relaxed">
                {no.itens.map((item, j) => (
                  <li key={j} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-acento" />
                    <span>
                      <Texto texto={item} />
                    </span>
                  </li>
                ))}
              </ul>
            )

          case 'tabela':
            return (
              <Tabela key={i} colunas={no.colunas} linhas={no.linhas} alinharNumeros={false} />
            )
        }
      })}
    </div>
  )
}
