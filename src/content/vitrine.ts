/**
 * A vitrine, versionada no código.
 *
 * A janela de vitrine (ADR-021) abre o site inteiro por um prazo. Ela pode ser
 * ligada por env var na Vercel, mas isso obriga alguém a abrir o painel, colar
 * dois valores e pedir redeploy. Aqui o mesmo efeito sai de um `git push`, que
 * a Vercel já transforma em deploy sozinha.
 *
 * A env var continua vencendo, quando existir: quem opera pelo painel não
 * precisa mexer em código para corrigir uma data errada às pressas.
 *
 * COMO FECHAR ANTES DA HORA: troque `ate` por uma data no passado, ou por
 * `null`, e empurre. Não é preciso lembrar de nada no prazo normal, porque ele
 * expira sozinho.
 */
export interface Vitrine {
  /**
   * Instante em que a vitrine fecha, em ISO 8601 com fuso.
   *
   * `null` = fechada. O site volta ao recorte normal do cronograma.
   */
  readonly ate: string | null
  /**
   * Data civil que o site finge que é enquanto a vitrine estiver aberta.
   *
   * `null` = mostra tudo, mas com o calendário real. Com data, o site inteiro
   * se comporta como se fosse aquele dia: marcos concluídos, nenhuma semana
   * corrente, o topo com a data simulada.
   */
  readonly dataSimulada: string | null
}

export const VITRINE: Vitrine = {
  // Aberta para a demonstração; fecha sozinha na virada.
  ate: '2026-08-17T18:00:00Z',
  // O semestre já terminou: SR2 é 05/12/2026.
  dataSimulada: '2027-01-15',
}
