import type { BaseSintetica } from '@/lib/seed/gerar'
import { ORDEM_ESTADOS, type EstadoCiclo } from '@/lib/calculo/tipos'
import {
  deAvaliacao,
  deCiclo,
  deIndicador,
  deLancamento,
  deRegra,
} from './mapeadores'

/**
 * Plano de semeadura da base sintética num PostgreSQL com o schema de
 * `supabase/migrations/` aplicado.
 *
 * O app não usa banco (ver ADR-011); isto existe para que o schema guardado
 * continue utilizável — e para provar, em `semeadura.test.ts`, que a base
 * sintética cabe nele.
 *
 * Separado da execução de propósito: o plano é uma função pura, então dá para
 * conferi-lo contra um PostgreSQL real sem subir infraestrutura.
 *
 * A ORDEM importa e não é arbitrária:
 *
 * 1. Cadastros primeiro, por causa das chaves estrangeiras.
 * 2. Ciclos entram em `rascunho` e sobem para `lancamento_aberto` — o gatilho
 *    `lancamento_dentro_da_janela` recusa lançamento em ciclo fechado, e isso
 *    vale inclusive para a service role.
 * 3. Lançamentos.
 * 4. Só então cada ciclo avança até o estado final, um passo por vez, porque o
 *    gatilho `ciclo_transicao_valida` não deixa pular etapa.
 * 5. Avaliações por último: elas se referem a ciclos já fechados.
 *
 * O efeito colateral é ótimo: a trilha de auditoria nasce preenchida, com os
 * eventos reais de criação, lançamento e transição — nada de auditoria
 * fabricada.
 */

export type Passo =
  | { tipo: 'inserir'; tabela: string; linhas: Record<string, unknown>[] }
  | { tipo: 'transicao'; cicloId: string; para: EstadoCiclo }

export interface PlanoDeSemeadura {
  passos: Passo[]
  resumo: Record<string, number>
}

/** Tabelas na ordem inversa de dependência, para limpeza. */
export const TABELAS_PARA_LIMPAR = [
  'avaliacoes',
  'contestacoes',
  'lancamentos',
  'eventos_auditoria',
  'ciclos',
  'indicadores',
  'regras_pontuacao',
  'usuarios',
  'gestores',
  'areas',
] as const

function caminhoDeEstados(alvo: EstadoCiclo): EstadoCiclo[] {
  const destino = ORDEM_ESTADOS.indexOf(alvo)
  // Começa em 1 porque `rascunho` é o estado inicial da tabela.
  return ORDEM_ESTADOS.slice(1, destino + 1)
}

export function montarPlano(base: BaseSintetica): PlanoDeSemeadura {
  const passos: Passo[] = []

  passos.push({
    tipo: 'inserir',
    tabela: 'areas',
    linhas: base.areas.map((a) => ({ id: a.id, sigla: a.sigla, nome: a.nome })),
  })

  passos.push({
    tipo: 'inserir',
    tabela: 'gestores',
    linhas: base.gestores.map((g) => ({
      id: g.id,
      nome: g.nome,
      cargo: g.cargo,
      area_id: g.areaId,
    })),
  })

  passos.push({
    tipo: 'inserir',
    tabela: 'regras_pontuacao',
    linhas: base.regras.map(deRegra),
  })

  passos.push({
    tipo: 'inserir',
    tabela: 'indicadores',
    linhas: base.indicadores.map(deIndicador),
  })

  // Ciclos entram sem estado: a tabela usa `rascunho` como padrão.
  passos.push({
    tipo: 'inserir',
    tabela: 'ciclos',
    linhas: base.ciclos.map(deCiclo),
  })

  // Abre a janela de todos antes de lançar qualquer coisa.
  for (const ciclo of base.ciclos) {
    passos.push({ tipo: 'transicao', cicloId: ciclo.id, para: 'lancamento_aberto' })
  }

  passos.push({
    tipo: 'inserir',
    tabela: 'lancamentos',
    linhas: base.lancamentos.map(deLancamento),
  })

  // Agora sim, cada ciclo caminha até onde deveria estar.
  for (const ciclo of base.ciclos) {
    for (const estado of caminhoDeEstados(ciclo.estado)) {
      if (estado === 'lancamento_aberto') continue
      passos.push({ tipo: 'transicao', cicloId: ciclo.id, para: estado })
    }
  }

  passos.push({
    tipo: 'inserir',
    tabela: 'avaliacoes',
    linhas: base.avaliacoes.map(deAvaliacao),
  })

  passos.push({
    tipo: 'inserir',
    tabela: 'contestacoes',
    linhas: base.contestacoes.map((c) => ({
      gestor_id: c.gestorId,
      ciclo_id: c.cicloId,
      indicador_id: c.indicadorId,
      motivo: c.motivo,
      aberta_em: c.abertaEm,
      status: c.status,
      resposta: c.resposta,
    })),
  })

  const resumo: Record<string, number> = {}
  for (const passo of passos) {
    if (passo.tipo === 'inserir') {
      resumo[passo.tabela] = (resumo[passo.tabela] ?? 0) + passo.linhas.length
    }
  }
  resumo.transicoes = passos.filter((p) => p.tipo === 'transicao').length

  return { passos, resumo }
}

/**
 * Contas de demonstração, uma por perfil.
 *
 * Existem para que a banca consiga entrar e ver as quatro visões do RBAC. São
 * contas de dados sintéticos: não há nada real por trás delas.
 */
export interface ContaDemonstracao {
  email: string
  perfil: 'cam' | 'area_tecnica' | 'gestor' | 'auditoria'
  nome: string
  areaId: string | null
  gestorId: string | null
}

export function contasDeDemonstracao(base: BaseSintetica): ContaDemonstracao[] {
  const primeiraArea = base.areas[0]
  const primeiroGestor = base.gestores[0]

  return [
    { email: 'cam@prumo.exemplo', perfil: 'cam', nome: 'Comissão de Avaliação de Metas', areaId: null, gestorId: null },
    {
      email: 'area@prumo.exemplo',
      perfil: 'area_tecnica',
      nome: `Área técnica — ${primeiraArea.sigla}`,
      areaId: primeiraArea.id,
      gestorId: null,
    },
    {
      email: 'gestor@prumo.exemplo',
      perfil: 'gestor',
      nome: primeiroGestor.nome,
      areaId: null,
      gestorId: primeiroGestor.id,
    },
    { email: 'auditoria@prumo.exemplo', perfil: 'auditoria', nome: 'Auditoria', areaId: null, gestorId: null },
  ]
}
