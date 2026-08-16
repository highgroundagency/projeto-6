import { Lock } from 'lucide-react'
import { Num } from '@/components/base/num'
import { CRONOGRAMA, MARCOS, type CicloId } from '@/lib/cronograma'
import { formatarBR, type DataISO } from '@/lib/datas'
import { estadoDoMarco, type EstadoMarco } from '@/lib/releases'
import { cn } from '@/lib/utils'

const TEXTO_ESTADO: Record<EstadoMarco, string> = {
  feito: 'concluído',
  atual: 'em andamento',
  futuro: 'a realizar',
}

/**
 * Trilha dos marcos — Kick-off → SR1 → SR2.
 * É a "evolução visível" que a diretriz de registro exige.
 */
export function TrilhaMarcos({ hoje }: { hoje: DataISO }) {
  return (
    <section className="mt-10" aria-labelledby="titulo-marcos">
      <h2 id="titulo-marcos" className="rotulo">
        Evolução do projeto
      </h2>

      <ol className="mt-3 grid gap-px border border-linha bg-linha sm:grid-cols-3">
        {MARCOS.map((marco) => {
          const estado = estadoDoMarco(marco, hoje)
          return (
            <li
              key={marco.id}
              className={cn(
                'relative bg-fundo p-4',
                estado === 'atual' && 'bg-acento-fraco',
                estado === 'futuro' && 'text-apagado',
              )}
              aria-current={estado === 'atual' ? 'step' : undefined}
            >
              <div
                aria-hidden
                className={cn(
                  'absolute inset-x-0 top-0 h-0.5',
                  estado === 'feito' && 'bg-acento',
                  estado === 'atual' && 'bg-acento',
                  estado === 'futuro' && 'bg-linha',
                )}
              />
              <div className="flex items-baseline justify-between gap-2">
                <span className="fonte-display text-base text-texto">{marco.rotulo}</span>
                <Num className="text-xs">{formatarBR(marco.data)}</Num>
              </div>
              <p className="rotulo mt-1.5">{TEXTO_ESTADO[estado]}</p>
              <p className="mt-2 text-xs leading-relaxed">{marco.evidencias[0]}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/**
 * Timeline dos 18 ciclos. Ciclos liberados linkam para o registro da semana;
 * futuros aparecem com cadeado e data — a data é pública (é o calendário da
 * disciplina), o conteúdo não.
 */
export function TimelineCiclos({
  visiveis,
  comRegistro,
  cicloCorrente,
}: {
  visiveis: readonly CicloId[]
  comRegistro: readonly CicloId[]
  cicloCorrente: CicloId | null
}) {
  return (
    <section className="mt-10" aria-labelledby="titulo-timeline">
      <h2 id="titulo-timeline" className="rotulo">
        Ciclos do semestre
      </h2>

      <div className="relative mt-4 overflow-x-auto pb-2">
        {/* O trilho: a linha contínua que vem da porta de entrada. */}
        <div aria-hidden className="absolute inset-x-0 top-[0.3125rem] h-0.5 bg-linha" />

        <ol className="relative flex min-w-max gap-0">
          {CRONOGRAMA.map((ciclo) => {
            const liberado = visiveis.includes(ciclo.id as CicloId)
            const temConteudo = comRegistro.includes(ciclo.id as CicloId)
            const atual = ciclo.id === cicloCorrente

            const conteudo = (
              <>
                <span
                  aria-hidden
                  className={cn(
                    'mb-2 block size-2.5 rounded-full border-2',
                    liberado ? 'border-acento bg-acento' : 'border-linha bg-fundo',
                    atual && 'ring-2 ring-acento/30 ring-offset-2 ring-offset-papel',
                  )}
                />
                <span
                  className={cn(
                    'block text-xs font-medium',
                    liberado ? 'text-texto' : 'text-apagado',
                  )}
                >
                  {ciclo.id.toUpperCase()}
                </span>
                <Num className="mt-0.5 block text-[0.65rem] text-apagado">
                  {formatarBR(ciclo.data).slice(0, 5)}
                </Num>
                {!liberado ? (
                  <Lock aria-hidden className="mt-1 size-3 text-apagado" strokeWidth={2.5} />
                ) : null}
              </>
            )

            return (
              <li key={ciclo.id} className="w-[3.75rem] shrink-0">
                {liberado && temConteudo ? (
                  <a
                    href={`#ciclo-${ciclo.id}`}
                    className="block rounded-sm px-1 py-0.5 hover:bg-superficie"
                    title={ciclo.rotulo}
                  >
                    {conteudo}
                    <span className="sr-only">{ciclo.rotulo} — registro disponível</span>
                  </a>
                ) : (
                  <div
                    className="px-1 py-0.5"
                    title={
                      liberado
                        ? `${ciclo.rotulo} — sem registro semanal`
                        : `${ciclo.rotulo} — ainda não liberado`
                    }
                  >
                    {conteudo}
                    <span className="sr-only">
                      {ciclo.rotulo} —{' '}
                      {liberado ? 'sem registro semanal' : 'ainda não liberado'}
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
