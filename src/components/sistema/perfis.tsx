import { ICONE_DA_TELA } from '@/components/sistema/icones'
import {
  FEATURES,
  ORDEM_PERFIS,
  PERFIS,
  featuresDoPerfil,
  type Feature,
  type FeatureId,
  type PerfilId,
} from '@/lib/features'

/**
 * Os quatro papéis do processo, explicados por extenso.
 *
 * Aparece em dois lugares, de propósito: no `/sistema`, para quem vai trocar de
 * perfil e precisa saber o que muda; e na página inicial, para quem avalia o
 * projeto sem abrir o MVP e ainda assim precisa entender quem é quem na SESAU.
 *
 * `telas` chega pronto de fora e já filtrado pelo gate de release. Se este
 * componente lesse `FEATURES` inteiro, ele anunciaria telas que ainda não
 * saíram, que é o roteiro que o §6.2 manda não entregar.
 */
export function ExplicacaoDosPerfis({
  telas = FEATURES,
  destacar,
}: {
  telas?: readonly Feature[]
  /** Perfil ativo no seletor. Ganha a borda de acento. */
  destacar?: PerfilId
}) {
  return (
    <div>
      {ORDEM_PERFIS.map((id) => {
        const perfil = PERFIS[id]
        const suas = featuresDoPerfil(telas, id)
        const ativo = id === destacar

        return (
          <article
            key={id}
            className={`border bg-fundo px-4 py-4 [&+&]:mt-[-1px] sm:px-5 ${
              ativo ? 'border-acento' : 'border-linha'
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="fonte-display text-base sm:text-lg">{perfil.rotulo}</h3>
              {ativo ? <span className="pilula numero text-xs">perfil ativo</span> : null}
            </div>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-apagado">
              {perfil.quemE}
            </p>

            <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <h4 className="rotulo text-texto">O que faz</h4>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                  {/* Hairline neutro nas duas colunas. Diferenciá-las por cor
                      encheria a seção de laranja: são quatro papéis por página,
                      e a regra da casa nº 9 manda separar por rótulo em caixa
                      alta, que já é o que os dois títulos acima fazem. */}
                  {perfil.oQueFaz.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-linha-alta" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="rotulo text-texto">O que o processo impede</h4>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-apagado">
                  {perfil.oQueNaoPode.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-linha-alta" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {suas.length > 0 ? (
              <div className="mt-4 border-t border-linha pt-3">
                <h4 className="rotulo">Telas que enxerga</h4>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {suas.map((feature) => {
                    const Icone = ICONE_DA_TELA[feature.id as FeatureId]
                    return (
                      <li
                        key={feature.id}
                        className="flex items-center gap-1.5 text-xs lowercase"
                      >
                        <Icone aria-hidden size={14} strokeWidth={1.5} />
                        {feature.rotulo}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
