import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { ICONE_DA_TELA } from '@/components/sistema/icones'
import type { Feature, FeatureId } from '@/lib/features'
import { idDaTela } from '@/lib/sistema/parametros'

/**
 * Uma tela do sistema, dobrada na própria página (ADR-023).
 *
 * Antes cada funcionalidade era uma rota: clicar levava embora, e de lá não
 * havia caminho de volta a não ser o botão do navegador. Agora clicar abre a
 * tela logo abaixo do sumário, sem sair do lugar.
 *
 * `<details>` nativo pelo mesmo motivo do registro semanal (ADR-006): abre por
 * teclado, funciona sem JavaScript e não vira componente cliente.
 *
 * ATENÇÃO, a mesma da ADR-018: sanfona fechada NÃO esconde nada do HTML. Quem
 * filtra é o gate de release e o gate de perfil, na página, antes de a tela ser
 * montada. Se um dia alguém trocar essa ordem, o §6.2 cai junto.
 */
export function Tela({
  feature,
  aberta = false,
  children,
}: {
  feature: Feature
  /** Vem do parâmetro `abrir`: link externo cai com a tela certa já aberta. */
  aberta?: boolean
  children: ReactNode
}) {
  const Icone = ICONE_DA_TELA[feature.id as FeatureId]

  return (
    <details
      id={idDaTela(feature.id as FeatureId)}
      open={aberta}
      className="group scroll-mt-20 border border-linha bg-fundo [&+&]:mt-[-1px]"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 transition-colors hover:bg-superficie sm:gap-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        {/* Apagado fechado, laranja aberto. Regra da casa nº 9: oito ícones em
            acento ao mesmo tempo transformariam a única cor do site em
            decoração. Assim o laranja marca uma coisa só, a tela em uso. */}
        <Icone
          aria-hidden
          size={22}
          strokeWidth={1.5}
          className="shrink-0 text-apagado transition-colors group-open:text-acento"
        />
        <span className="min-w-0 flex-1">
          <span className="fonte-display block text-base leading-tight sm:text-lg">
            {feature.rotulo}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-apagado sm:text-sm">
            {feature.descricao}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          size={18}
          strokeWidth={1.5}
          className="shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="border-t-2 border-acento px-4 py-5 sm:px-5">
        {children}

        {/* Volta ao sumário sem exigir rolagem manual: as telas são longas. */}
        <p className="mt-6 border-t border-linha pt-4 text-xs">
          <a href="#sumario" className="lowercase hover:text-acento">
            ↑ voltar ao sumário
          </a>
        </p>
      </div>
    </details>
  )
}
