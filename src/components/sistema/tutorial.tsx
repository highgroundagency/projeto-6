import { ChevronDown, GraduationCap, Play } from 'lucide-react'
import { ICONE_DA_TELA } from '@/components/sistema/icones'
import { passosDoTutorial } from '@/components/sistema/tour'
import { TUTORIAIS } from '@/content/tutoriais'
import { PERFIS, featurePorId, type FeatureId, type PerfilId } from '@/lib/features'
import { linkDoPasso, type ParametrosSistema } from '@/lib/sistema/parametros'

/**
 * A porta de entrada do tutorial guiado.
 *
 * O botão grande começa o passeio: `?passo=1` põe o sistema em modo tutorial e
 * a partir dali a barra do rodapé conduz. A sanfona logo abaixo é o índice, para
 * quem prefere pular direto para um passo específico ou só ler o percurso antes
 * de entrar.
 *
 * Trocar o perfil no seletor troca o tutorial inteiro: quem é Área técnica não
 * aprende a homologar ciclo, porque nunca vai homologar ciclo.
 *
 * `disponiveis` é o recorte de release ∩ perfil. Um passo que aponta para tela
 * fora dessa lista é DESCARTADO, não exibido em cinza: descrever a tela que
 * ainda não saiu é entregar o roteiro que o §6.2 manda guardar.
 */
export function Tutorial({
  perfil,
  disponiveis,
  params,
}: {
  perfil: PerfilId
  disponiveis: readonly FeatureId[]
  /** Estado das telas, para que entrar no tutorial não jogue fora o resto. */
  params: ParametrosSistema
}) {
  const tutorial = TUTORIAIS[perfil]
  const passos = passosDoTutorial(perfil, disponiveis)

  if (passos.length === 0) return null

  return (
    <div className="border border-linha bg-fundo">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <GraduationCap
            aria-hidden
            size={22}
            strokeWidth={1.5}
            className="shrink-0 text-acento"
          />
          <div className="min-w-0">
            <p className="fonte-display text-base leading-tight">
              Tutorial guiado para {PERFIS[perfil].rotulo}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-apagado">
              {passos.length} passos, um de cada vez. O sistema abre a tela certa e marca em
              laranja a parte de que o texto está falando.
            </p>
          </div>
        </div>

        <a
          href={linkDoPasso(params, 1)}
          className="inline-flex shrink-0 items-center justify-center gap-2 border border-acento bg-acento px-4 py-2 text-sm lowercase text-ink transition-colors hover:bg-transparent hover:text-acento"
        >
          <Play aria-hidden size={15} strokeWidth={1.5} />
          começar o tutorial
        </a>
      </div>

      <details className="group border-t border-linha">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs lowercase transition-colors hover:bg-superficie sm:px-5 [&::-webkit-details-marker]:hidden">
          ver o percurso completo antes de começar
          <ChevronDown
            aria-hidden
            size={16}
            strokeWidth={1.5}
            className="shrink-0 transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="border-t border-linha px-4 py-5 sm:px-5">
          <p className="max-w-prose text-sm leading-relaxed">{tutorial.resumo}</p>

          <ol className="mt-5">
            {passos.map((passo, i) => {
              const feature = passo.tela ? featurePorId(passo.tela) : null
              const Icone = passo.tela ? ICONE_DA_TELA[passo.tela] : null

              return (
                <li
                  key={`${passo.tela}-${passo.titulo}`}
                  className="grid gap-x-4 gap-y-1 border-t border-linha py-3 first:border-t-0 first:pt-0 sm:grid-cols-[3rem_1fr]"
                >
                  <span
                    aria-hidden
                    className="numero flex size-8 shrink-0 items-center justify-center border border-linha-alta text-xs"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <a
                      href={linkDoPasso(params, i + 1)}
                      className="fonte-display text-sm leading-snug transition-colors hover:text-acento"
                    >
                      {passo.titulo}
                    </a>
                    <p className="mt-1 max-w-prose text-sm leading-relaxed text-apagado">
                      {passo.oQueFazer}
                    </p>
                    {feature && Icone ? (
                      <p className="mt-1 flex items-center gap-1.5 text-xs lowercase text-apagado">
                        <Icone aria-hidden size={13} strokeWidth={1.5} />
                        {feature.rotulo.toLowerCase()}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </details>
    </div>
  )
}
