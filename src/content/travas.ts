import type { Travas } from '@/lib/releases'

/**
 * As travas versionadas: liberar um ciclo fora de ordem por `git push`.
 *
 * Mesma ideia da vitrine (`src/content/vitrine.ts`): o mecanismo já existe no
 * motor de releases e pode ser acionado por env var na Vercel, mas isso obriga
 * alguém a abrir o painel, colar um JSON e pedir redeploy. Aqui o mesmo efeito
 * sai de um commit, que a Vercel já transforma em deploy sozinha — e, melhor,
 * fica no histórico do repositório em vez de morar num painel que ninguém
 * audita.
 *
 * A env var `RELEASE_TRAVAS` continua vencendo, ciclo a ciclo: quem opera pela
 * Vercel corrige um erro às pressas sem esperar por um deploy.
 *
 * POR QUE UMA TRAVA E NÃO MAIS ADIANTAMENTO. Subir o adiantamento de 7 para 14
 * dias também abriria a semana 5 hoje, mas arrastaria a semana 6 amanhã e o SR1
 * na semana seguinte: o diário passaria a publicar semanas que ainda não
 * aconteceram. A trava abre exatamente um ciclo e não move o release.
 */
export const TRAVAS_VERSIONADAS: Travas = {
  /**
   * A Semana 5 na véspera do Kick-off.
   *
   * Ela abriria sozinha em 12/09 (a data dela, 19/09, menos o adiantamento de
   * sete dias), e com ela as três primeiras telas do sistema. A trava antecipa
   * isso em um dia, para quem for conferir o site na véspera da apresentação
   * encontrar o sistema no ar em vez de uma página vazia. O registro da semana
   * aparece com o selo de rascunho que ele realmente tem.
   *
   * PODE SAIR depois do Kick-off: a partir de 12/09 ela é redundante.
   */
  s5: 'sempre_visivel',
}
