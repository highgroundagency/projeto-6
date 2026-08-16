import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Num } from '@/components/base/num'
import { Etiqueta, Selo } from '@/components/base/selo'
import { integrantePorId } from '@/content/equipe'
import { cicloPorId, type CicloId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import {
  ROTULO_EVIDENCIA,
  ROTULO_ORIGEM,
  type Bloco as TipoBloco,
  type Documento,
  type RegistroSemana as TipoRegistro,
} from '@/lib/registro/tipos'

/**
 * O registro semanal — o coração da página (§5.1).
 *
 * Os oito blocos são fixos e sempre aparecem na mesma ordem: quem lê deve
 * escanear a semana em dez segundos e saber onde procurar cada coisa.
 */

function Bloco({
  rotulo,
  bloco,
  children,
}: {
  rotulo: string
  bloco: TipoBloco<unknown>
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5 border-t border-linha py-4 first:border-t-0 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <div className="flex items-start gap-2 sm:flex-col sm:gap-1.5">
        {/* Maior e em branco: são as âncoras que o professor procura ao varrer
            a semana, e em cinza pequeno elas sumiam no corpo do texto. */}
        <h4 className="rotulo pt-0.5 text-sm text-texto">{rotulo}</h4>
        <Selo selo={bloco.selo} />
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

function Itens({ itens }: { itens: readonly string[] }) {
  return (
    <ul className="space-y-1.5">
      {itens.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-acento" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Uma semana, dobrada.
 *
 * `<details>` nativo: a setinha abre e fecha sem uma linha de JavaScript, é
 * navegável por teclado de graça e continua funcionando com JS desligado
 * (ADR-006). Radix Accordion faria o mesmo com um componente cliente — e
 * componente cliente perto de conteúdo de ciclo é justamente o que a ADR-005
 * proíbe.
 *
 * ATENÇÃO: o conteúdo de um `<details>` fechado continua no DOM. Isto NÃO é um
 * mecanismo de ocultação — semana não liberada não chega aqui, porque o gate de
 * release filtra antes de carregar o módulo. Ver §6.3.
 */
export function RegistroSemana({
  registro,
  documentos = [],
  detalhes,
  atual = false,
}: {
  registro: TipoRegistro
  /** Documentos da semana. Cada um abre numa sanfona dentro da própria página. */
  documentos?: readonly Documento[]
  detalhes?: ReactNode
  /**
   * A semana em curso. Não abre sozinha — nenhuma abre —, mas fica marcada.
   *
   * O professor volta aqui toda semana procurando UMA linha. Abrir alguma por
   * padrão só empurra as outras para fora da tela; marcar qual é a da vez
   * resolve o mesmo problema sem ocupar espaço.
   */
  atual?: boolean
}) {
  const ciclo = cicloPorId(registro.ciclo)
  const bloqueios = registro.bloqueios.conteudo
  const feedback = registro.feedback.conteudo

  return (
    <details
      id={`ciclo-${ciclo.id}`}
      data-marcador={registro.marcador}
      data-ciclo={ciclo.id}
      className="group scroll-mt-20 border border-linha bg-fundo [&+&]:mt-[-1px]"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-4 transition-colors hover:bg-superficie sm:px-5 [&::-webkit-details-marker]:hidden">
        {/* O título fica como heading de verdade dentro do summary: é assim que
            quem navega por leitor de tela pula de semana em semana. */}
        <span className="flex items-baseline gap-3">
          <Num className="text-xs text-apagado">{ciclo.id.toUpperCase()}</Num>
          <h3 className="fonte-display text-xl">{ciclo.rotulo}</h3>
        </span>
        <span className="flex items-center gap-3">
          {atual ? <Etiqueta tom="acento">esta semana</Etiqueta> : null}
          {ciclo.tipo === 'marco' ? <Etiqueta tom="acento">marco</Etiqueta> : null}
          <Num className="text-sm">{formatarBR(ciclo.data)}</Num>
          <ChevronDown
            aria-hidden
            size={18}
            strokeWidth={1.5}
            className="text-acento transition-transform group-open:rotate-180"
          />
        </span>
      </summary>

      <div className="border-t-2 border-acento px-4 py-2 sm:px-5">
        <Bloco rotulo="Objetivo da semana" bloco={registro.objetivo}>
          <p className="fonte-display text-base leading-snug">{registro.objetivo.conteudo}</p>
        </Bloco>

        <Bloco rotulo="Avanços" bloco={registro.avancos}>
          <Itens itens={registro.avancos.conteudo} />
        </Bloco>

        <Bloco rotulo="Decisões" bloco={registro.decisoes}>
          <ul className="space-y-2">
            {registro.decisoes.conteudo.map((decisao) => (
              <li key={decisao.decisao}>
                <p className="font-medium">{decisao.decisao}</p>
                <p className="text-apagado">Por quê: {decisao.porque}</p>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco rotulo="Bloqueios" bloco={registro.bloqueios}>
          {bloqueios === 'nenhum' ? (
            <p className="text-apagado">Nenhum bloqueio nesta semana.</p>
          ) : (
            <Itens itens={bloqueios} />
          )}
        </Bloco>

        <Bloco rotulo="Feedback recebido" bloco={registro.feedback}>
          {feedback === 'nenhum' ? (
            <p className="text-apagado">Nenhum feedback registrado nesta semana.</p>
          ) : (
            <ul className="space-y-2">
              {feedback.map((item) => (
                <li key={item.texto} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                  <Etiqueta className="self-start">{ROTULO_ORIGEM[item.origem]}</Etiqueta>
                  <span>{item.texto}</span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco rotulo="Próximos passos" bloco={registro.proximosPassos}>
          <Itens itens={registro.proximosPassos.conteudo} />
        </Bloco>

        <Bloco rotulo="Responsáveis" bloco={registro.responsaveis}>
          <ul className="space-y-1.5">
            {registro.responsaveis.conteudo.map((item) => {
              const integrante = integrantePorId(item.integrante)
              return (
                <li key={item.integrante} className="flex flex-wrap gap-x-2">
                  <span className="font-medium">{integrante.nome}</span>
                  <span aria-hidden className="text-acento">
                    →
                  </span>
                  <span className="text-apagado">{item.contribuicao}</span>
                </li>
              )
            })}
          </ul>
        </Bloco>

        <Bloco rotulo="Evidências" bloco={registro.evidencias}>
          {registro.evidencias.conteudo.length === 0 ? (
            <p className="text-apagado">Sem evidências anexadas nesta semana.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {registro.evidencias.conteudo.map((evidencia) => {
                const externo = evidencia.url.startsWith('http')
                return (
                  <li key={`${evidencia.tipo}-${evidencia.url}-${evidencia.rotulo}`}>
                    <a
                      href={evidencia.url}
                      {...(externo ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                      className="flex flex-col border border-linha px-3 py-2 hover:border-linha-alta"
                    >
                      <span className="rotulo text-acento">
                        {ROTULO_EVIDENCIA[evidencia.tipo]}
                      </span>
                      <span className="mt-0.5 text-sm">
                        {evidencia.rotulo} {externo ? '↗' : '→'}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </Bloco>
      </div>

      {documentos.length > 0 ? (
        <div className="border-t border-linha bg-superficie px-4 py-5 sm:px-5">
          <h4 className="rotulo text-sm text-texto">Documentos</h4>
          <p className="mt-1 text-xs lowercase">
            clique no título e o documento abre aqui mesmo. nenhum pdf, nenhuma aba nova.
          </p>

          <div className="mt-4">
            {documentos.map((doc) => (
              <details
                key={doc.id}
                id={`doc-${ciclo.id}-${doc.id}`}
                className="group/doc scroll-mt-24 border border-linha bg-fundo [&+&]:mt-[-1px]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-superficie [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="fonte-display block text-base">{doc.titulo}</span>
                    <span className="mt-0.5 block text-xs lowercase">{doc.resumo}</span>
                  </span>
                  <ChevronDown
                    aria-hidden
                    size={18}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-acento transition-transform group-open/doc:rotate-180"
                  />
                </summary>
                <div className="border-t border-linha px-4 py-5">
                  <doc.Conteudo />
                </div>
              </details>
            ))}
          </div>
        </div>
      ) : null}

      {detalhes ? (
        <div className="border-t border-linha bg-superficie px-4 py-5 sm:px-5">
          <h4 className="rotulo text-sm text-texto">Detalhamento</h4>
          <div className="mt-3">{detalhes}</div>
        </div>
      ) : null}
    </details>
  )
}

export function CicloSemRegistro({ ciclo }: { ciclo: CicloId }) {
  const dados = cicloPorId(ciclo)
  return (
    <article
      id={`ciclo-${ciclo}`}
      data-ciclo={ciclo}
      className="scroll-mt-4 border border-dashed border-linha px-4 py-3 text-sm text-apagado sm:px-5"
    >
      <span className="fonte-display text-texto">{dados.rotulo}</span>{' '}
      <Num className="text-xs">{formatarBR(dados.data)}</Num>
      <p className="mt-1">
        {dados.tipo === 'pausa'
          ? 'Semana imprensada — as entregas são acumuladas na semana seguinte.'
          : 'Registro desta semana ainda não publicado.'}
      </p>
    </article>
  )
}
