import 'server-only'
import { BASE } from '@/lib/seed'
import type { Contestacao } from '@/lib/calculo/tipos'
import { registrarEvento } from './estado'

/**
 * Contestações abertas pela interface, somadas às do seed.
 *
 * Como o resto da camada de escrita da F2, vive em memória e se perde no
 * reinício. Na F3 vira tabela com RLS. Ver src/lib/sistema/estado.ts.
 */
const novas: Contestacao[] = []
let sequencia = 0

export function contestacoes(): Contestacao[] {
  return [...novas, ...BASE.contestacoes].sort((a, b) => (a.abertaEm < b.abertaEm ? 1 : -1))
}

export function abrirContestacao(
  dados: Omit<Contestacao, 'id' | 'status' | 'resposta'>,
  perfil = 'gerente_unidade',
): Contestacao {
  const contestacao: Contestacao = {
    ...dados,
    id: `cont-app-${String(++sequencia).padStart(4, '0')}`,
    status: 'aberta',
    resposta: null,
  }
  novas.unshift(contestacao)

  // Contestação também é trilha: pedido de revisão sem rastro seria a caixa
  // de sugestões que o produto existe para substituir.
  registrarEvento({
    quando: dados.abertaEm,
    autor: dados.gerenteId,
    perfil,
    tipo: 'contestacao_aberta',
    entidade: contestacao.id,
    descricao: `Contestação aberta por ${dados.gerenteId} sobre o ciclo ${dados.cicloId}.`,
    antes: null,
    depois: { status: 'aberta', indicadorId: dados.indicadorId },
  })

  return contestacao
}
