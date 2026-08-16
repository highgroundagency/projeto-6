import { ChevronDown, GraduationCap } from 'lucide-react'
import { ICONE_DA_TELA } from '@/components/sistema/icones'
import { TUTORIAIS } from '@/content/tutoriais'
import { PERFIS, featurePorId, type FeatureId, type PerfilId } from '@/lib/features'
import { linkDaTela, type ParametrosSistema } from '@/lib/sistema/parametros'

/**
 * Aprendizado guiado do perfil ativo.
 *
 * Trocar o perfil no seletor troca o tutorial: quem é Área técnica não aprende
 * a homologar ciclo, porque nunca vai homologar ciclo.
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
  /** Estado das telas, para que abrir um passo não jogue fora o resto. */
  params: ParametrosSistema
}) {
  const tutorial = TUTORIAIS[perfil]
  const passos = tutorial.passos.filter(
    (passo) => passo.tela === null || disponiveis.includes(passo.tela),
  )

  if (passos.length === 0) return null

  return (
    <details className="group border border-linha bg-fundo">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-superficie sm:px-5 [&::-webkit-details-marker]:hidden">
        <GraduationCap
          aria-hidden
          size={22}
          strokeWidth={1.5}
          className="shrink-0 text-acento"
        />
        <span className="min-w-0 flex-1">
          <span className="fonte-display block text-base leading-tight">
            Tutorial: usando o sistema como {PERFIS[perfil].rotulo}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-apagado">
            {passos.length} passos, na ordem em que o processo acontece.
          </span>
        </span>
        <ChevronDown
          aria-hidden
          size={18}
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
                key={passo.titulo}
                className="grid gap-x-4 gap-y-2 border-t border-linha py-4 first:border-t-0 first:pt-0 sm:grid-cols-[3rem_1fr]"
              >
                <span
                  aria-hidden
                  className="numero flex size-9 shrink-0 items-center justify-center border border-linha-alta text-sm"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <h4 className="fonte-display text-base leading-snug">{passo.titulo}</h4>
                  <p className="mt-1.5 max-w-prose text-sm leading-relaxed">
                    {passo.oQueFazer}
                  </p>
                  <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-apagado">
                    Por que: {passo.porque}
                  </p>

                  {feature && Icone ? (
                    <p className="mt-2.5">
                      <a
                        href={linkDaTela(params, passo.tela as FeatureId)}
                        className="inline-flex items-center gap-2 border border-linha px-2.5 py-1 text-xs lowercase transition-colors hover:border-acento hover:text-acento"
                      >
                        <Icone aria-hidden size={14} strokeWidth={1.5} />
                        abrir {feature.rotulo.toLowerCase()}
                      </a>
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </details>
  )
}
