import type { FeatureId, PerfilId } from '@/lib/features'
import type { ParametrosSistema } from '@/lib/sistema/parametros'

/**
 * O que uma tela recebe da página que a monta.
 *
 * NENHUMA tela chama `exigirFeature` ou `exigirPerfil` por dentro: quem decide
 * se ela existe é `/sistema/page.tsx`, antes de montá-la. Se a checagem morasse
 * aqui, uma tela montada por engano só falharia depois de já ter carregado os
 * dados, e o §6.2 pede o contrário: 404 antes de qualquer renderização.
 */
export interface ContextoTela {
  readonly params: ParametrosSistema
  readonly perfil: PerfilId
  /** Sessão de admin ativa e sem "ver como visitante" (ADR-015). */
  readonly admin: boolean
  /** Telas liberadas E do perfil, para que uma tela possa apontar para a outra. */
  readonly disponiveis: readonly FeatureId[]
  /**
   * Gestor da sessão. Hoje sempre `null`, e é de propósito.
   *
   * É a costura por onde o login de verdade entra: quando existir sessão, "meu
   * resultado" abre no próprio avaliado em vez de no primeiro da lista, sem que
   * a tela precise mudar.
   */
  readonly gestorId: string | null
}

export interface PropsTela {
  readonly ctx: ContextoTela
}

/** A faixa de sucesso ou de erro é de quem a produziu, não de quem estiver por perto. */
export function mensagemDe(ctx: ContextoTela, tela: FeatureId): { ok?: string; erro?: string } {
  if (ctx.params.de !== tela) return {}
  return { ok: ctx.params.ok, erro: ctx.params.erro }
}
