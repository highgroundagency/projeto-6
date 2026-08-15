import type { ReactNode } from 'react'
import { Num } from '@/components/base/num'
import { Etiqueta, Selo } from '@/components/base/selo'
import { integrantePorId } from '@/content/equipe'
import { cicloPorId, type CicloId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import {
  ROTULO_EVIDENCIA,
  ROTULO_ORIGEM,
  type Bloco as TipoBloco,
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
    <div className="grid gap-1.5 border-t border-linha py-3 first:border-t-0 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <div className="flex items-start gap-2 sm:flex-col sm:gap-1.5">
        <h4 className="rotulo pt-0.5">{rotulo}</h4>
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
          <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-laranja" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function RegistroSemana({
  registro,
  detalhes,
}: {
  registro: TipoRegistro
  detalhes?: ReactNode
}) {
  const ciclo = cicloPorId(registro.ciclo)
  const bloqueios = registro.bloqueios.conteudo
  const feedback = registro.feedback.conteudo

  return (
    <article
      id={`ciclo-${ciclo.id}`}
      data-marcador={registro.marcador}
      data-ciclo={ciclo.id}
      className="scroll-mt-4 border border-linha bg-white"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-2 border-laranja px-4 py-3 sm:px-5">
        <div className="flex items-baseline gap-3">
          <Num className="text-xs text-cinza-forte">{ciclo.id.toUpperCase()}</Num>
          <h3 className="fonte-display text-xl">{ciclo.rotulo}</h3>
        </div>
        <div className="flex items-center gap-2">
          {ciclo.tipo === 'marco' ? <Etiqueta tom="laranja">marco</Etiqueta> : null}
          <Num className="text-sm">{formatarBR(ciclo.data)}</Num>
        </div>
      </header>

      <div className="px-4 py-2 sm:px-5">
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
                <p className="text-cinza-forte">Por quê: {decisao.porque}</p>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco rotulo="Bloqueios" bloco={registro.bloqueios}>
          {bloqueios === 'nenhum' ? (
            <p className="text-cinza-forte">Nenhum bloqueio nesta semana.</p>
          ) : (
            <Itens itens={bloqueios} />
          )}
        </Bloco>

        <Bloco rotulo="Feedback recebido" bloco={registro.feedback}>
          {feedback === 'nenhum' ? (
            <p className="text-cinza-forte">Nenhum feedback registrado nesta semana.</p>
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
                  <span aria-hidden className="text-laranja">
                    →
                  </span>
                  <span className="text-cinza-forte">{item.contribuicao}</span>
                </li>
              )
            })}
          </ul>
        </Bloco>

        <Bloco rotulo="Evidências" bloco={registro.evidencias}>
          {registro.evidencias.conteudo.length === 0 ? (
            <p className="text-cinza-forte">Sem evidências anexadas nesta semana.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {registro.evidencias.conteudo.map((evidencia) => {
                const externo = evidencia.url.startsWith('http')
                return (
                  <li key={`${evidencia.tipo}-${evidencia.url}-${evidencia.rotulo}`}>
                    <a
                      href={evidencia.url}
                      {...(externo ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                      className="flex flex-col border border-linha px-3 py-2 hover:border-tinta"
                    >
                      <span className="rotulo text-laranja">
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

      {detalhes ? (
        <div className="border-t border-linha bg-papel-2/60 px-4 py-5 sm:px-5">
          <h4 className="rotulo mb-3">Detalhamento</h4>
          {detalhes}
        </div>
      ) : null}
    </article>
  )
}

export function CicloSemRegistro({ ciclo }: { ciclo: CicloId }) {
  const dados = cicloPorId(ciclo)
  return (
    <article
      id={`ciclo-${ciclo}`}
      data-ciclo={ciclo}
      className="scroll-mt-4 border border-dashed border-linha px-4 py-3 text-sm text-cinza-forte sm:px-5"
    >
      <span className="fonte-display text-tinta">{dados.rotulo}</span>{' '}
      <Num className="text-xs">{formatarBR(dados.data)}</Num>
      <p className="mt-1">
        {dados.tipo === 'pausa'
          ? 'Semana imprensada — as entregas são acumuladas na semana seguinte.'
          : 'Registro desta semana ainda não publicado.'}
      </p>
    </article>
  )
}
