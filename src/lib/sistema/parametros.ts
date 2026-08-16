import type { FeatureId } from '@/lib/features'

/**
 * O espaço de nomes da query string do sistema.
 *
 * As oito telas passaram a dividir uma URL só (ADR-023). Antes cada uma tinha a
 * própria rota e podia chamar o parâmetro de `ciclo` à vontade; agora `ciclo`
 * significaria quatro coisas ao mesmo tempo — o ciclo filtrado na auditoria, a
 * competência do painel da gestão, o ciclo do resultado e o da contestação. Pior
 * que o conflito seria `ok`/`erro`: um lançamento bem-sucedido pintaria a faixa
 * verde também no dashboard da CAM, que não fez nada.
 *
 * Por isso cada tela leva um prefixo. É feio de ler na barra de endereço e é a
 * única forma de o estado de uma tela não vazar para a vizinha.
 */
export const PARAMETROS_SISTEMA = [
  /** Qual sanfona abre. Vem do redirecionamento das rotas antigas e das APIs. */
  'abrir',
  /** De qual tela veio a mensagem: sem isso, a faixa apareceria em todas. */
  'de',
  'ok',
  'erro',
  'lanc_area',
  'res_gestor',
  'res_ciclo',
  'aud_tipo',
  'aud_ciclo',
  'gest_ciclo',
  'gest_anonimo',
  'cont_gestor',
  'cont_ciclo',
] as const

export type ParametroSistema = (typeof PARAMETROS_SISTEMA)[number]
export type ParametrosSistema = Partial<Record<ParametroSistema, string>>

/**
 * Parâmetros de uma leitura só.
 *
 * Não são preservados quando outro formulário da página é enviado: uma faixa de
 * "lançamento registrado" que sobrevivesse a três navegações viraria mentira, e
 * `abrir` grudado reabriria a mesma sanfona para sempre.
 */
export const PARAMETROS_EFEMEROS: readonly ParametroSistema[] = ['abrir', 'de', 'ok', 'erro']

/** O id do elemento `<details>` de uma tela, e o alvo de toda âncora que leva a ela. */
export function idDaTela(feature: FeatureId): string {
  return `tela-${feature}`
}

export function ancoraDaTela(feature: FeatureId): string {
  return `#${idDaTela(feature)}`
}

/**
 * O endereço de uma tela, preservando o estado das outras.
 *
 * Por que uma navegação de verdade e não a âncora `#tela-x` sozinha: um clique
 * em âncora do mesmo documento NÃO abre a sanfona de forma confiável. Existe uma
 * regra nova de HTML que manda expandir `<details>` ao navegar para um alvo
 * dentro dele, e ela funciona na carga da página com fragmento, mas não em todo
 * caminho de clique nem em todo navegador. Depender disso deixaria o item do
 * sumário rolando até um bloco fechado, que é pior do que não rolar.
 *
 * Com `abrir=` quem decide é o servidor, e o resultado é o mesmo em qualquer
 * navegador, com ou sem JavaScript.
 */
export function linkDaTela(params: ParametrosSistema, feature: FeatureId): string {
  const busca = new URLSearchParams()
  for (const chave of PARAMETROS_SISTEMA) {
    if (PARAMETROS_EFEMEROS.includes(chave)) continue
    const valor = params[chave]
    if (valor) busca.set(chave, valor)
  }
  busca.set('abrir', feature)
  return `/sistema?${busca.toString()}${ancoraDaTela(feature)}`
}

/**
 * Fica só com o que a página conhece.
 *
 * `searchParams` do Next entrega qualquer coisa que o visitante digitar,
 * inclusive arrays quando a chave se repete. Aqui vira um objeto de strings com
 * chaves conhecidas, que é o que as telas esperam.
 */
export function lerParametros(bruto: Record<string, string | string[] | undefined>) {
  const limpo: Record<string, string> = {}
  for (const chave of PARAMETROS_SISTEMA) {
    const valor = bruto[chave]
    const texto = Array.isArray(valor) ? valor[0] : valor
    if (typeof texto === 'string' && texto !== '') limpo[chave] = texto
  }
  return limpo as ParametrosSistema
}
