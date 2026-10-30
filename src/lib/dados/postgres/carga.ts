import type { ClientBase } from 'pg'
import type { BaseSintetica } from '@/lib/seed/gerar'
import {
  linhaAvaliacao,
  linhaAvaliacaoDistrital,
  linhaCiclo,
  linhaContestacao,
  linhaDistrito,
  linhaEvento,
  linhaGerente,
  linhaIndicador,
  linhaLancamento,
  linhaRegra,
  linhaSubindicador,
  linhasAplicabilidade,
  linhaTipoUnidade,
  linhaUnidade,
} from './linhas'

/**
 * Carga inicial: põe a base sintética num banco recém-migrado.
 *
 * O banco nasce com o mesmo conteúdo que o app mostrava em memória: os seis
 * meses fechados, julho aberto, as notas, a trilha e as contestações. A base
 * é 100% sintética (regra 1 da casa), e entra UMA vez. Daí em diante, tudo o
 * que muda é escrita de verdade, gravada pelo driver.
 *
 * POR QUE OS GATILHOS FICAM DESLIGADOS AQUI. A base já traz a própria trilha,
 * com os eventos na hora em que aconteceram. Com os gatilhos ligados, cada
 * insert geraria um evento novo com a hora de agora, duplicando a história, e
 * a trava da janela recusaria os lançamentos dos meses já fechados.
 * `session_replication_role = replica` desliga os gatilhos só nesta sessão e
 * exige ser dono do banco (superusuário), o que é verdade no Docker local.
 * Desligar a trava dar trabalho é o ponto.
 */

/** Tabelas na ordem inversa de dependência, para limpeza. */
export const TABELAS_DO_DOMINIO = [
  'eventos_auditoria',
  'contestacoes',
  'avaliacoes_distritais',
  'avaliacoes',
  'lancamentos',
  'ciclos',
  'aplicabilidades',
  'regras_pontuacao',
  'subindicadores',
  'indicadores',
  'gerentes',
  'unidades',
  'tipos_unidade',
  'distritos',
] as const

/** Insere em lote, preservando a ordem da lista (a coluna `ordem` segue ela). */
async function inserir(
  cliente: ClientBase,
  tabela: string,
  linhas: readonly Record<string, unknown>[],
): Promise<void> {
  if (linhas.length === 0) return
  const colunas = Object.keys(linhas[0])
  await cliente.query(
    `insert into ${tabela} (${colunas.join(', ')})
     select ${colunas.map((c) => `r.${c}`).join(', ')}
     from jsonb_populate_recordset(null::${tabela}, $1::jsonb) with ordinality as r
     order by r.ordinality`,
    [JSON.stringify(linhas)],
  )
}

export async function bancoVazio(cliente: ClientBase): Promise<boolean> {
  const { rows } = await cliente.query<{ total: number }>(
    'select (select count(*) from ciclos)::int as total',
  )
  return rows[0].total === 0
}

export async function limparDominio(cliente: ClientBase): Promise<void> {
  await cliente.query('set local session_replication_role = replica')
  for (const tabela of TABELAS_DO_DOMINIO) await cliente.query(`delete from ${tabela}`)
  await cliente.query('alter sequence lancamentos_id_seq restart')
  await cliente.query('alter sequence contestacoes_id_seq restart')
  await cliente.query(
    `select setval(pg_get_serial_sequence('eventos_auditoria', 'seq'), 1, false)`,
  )
  await cliente.query('set local session_replication_role = origin')
}

/** Deve rodar dentro de uma transação aberta por quem chama. */
export async function carregarBase(
  cliente: ClientBase,
  base: BaseSintetica,
): Promise<Record<string, number>> {
  try {
    await cliente.query('set local session_replication_role = replica')
  } catch (erro) {
    throw new Error(
      'A carga inicial precisa desligar os gatilhos por um instante, e isso exige o ' +
        'usuário dono do banco (superusuário). No Docker deste projeto ele é o padrão. ' +
        `Detalhe: ${erro instanceof Error ? erro.message : String(erro)}`,
    )
  }

  await inserir(cliente, 'distritos', base.distritos.map(linhaDistrito))
  await inserir(cliente, 'tipos_unidade', base.tiposUnidade.map(linhaTipoUnidade))
  await inserir(cliente, 'unidades', base.unidades.map(linhaUnidade))
  await inserir(cliente, 'gerentes', base.gerentes.map(linhaGerente))
  await inserir(cliente, 'indicadores', base.indicadores.map(linhaIndicador))
  await inserir(cliente, 'subindicadores', base.subindicadores.map(linhaSubindicador))
  await inserir(cliente, 'regras_pontuacao', base.regras.map(linhaRegra))
  await inserir(cliente, 'aplicabilidades', base.regras.flatMap(linhasAplicabilidade))
  await inserir(cliente, 'ciclos', base.ciclos.map(linhaCiclo))
  await inserir(cliente, 'lancamentos', base.lancamentos.map(linhaLancamento))
  await inserir(cliente, 'avaliacoes', base.avaliacoes.map(linhaAvaliacao))
  await inserir(
    cliente,
    'avaliacoes_distritais',
    base.avaliacoesDistritais.map(linhaAvaliacaoDistrital),
  )
  await inserir(cliente, 'contestacoes', base.contestacoes.map(linhaContestacao))
  // A base guarda a trilha do mais novo para o mais antigo; o banco numera do
  // mais antigo para o mais novo, então a leitura por `seq desc` devolve a
  // mesma ordem.
  await inserir(cliente, 'eventos_auditoria', [...base.eventos].reverse().map(linhaEvento))

  await cliente.query('set local session_replication_role = origin')

  return {
    distritos: base.distritos.length,
    tipos_unidade: base.tiposUnidade.length,
    unidades: base.unidades.length,
    gerentes: base.gerentes.length,
    indicadores: base.indicadores.length,
    subindicadores: base.subindicadores.length,
    regras_pontuacao: base.regras.length,
    aplicabilidades: base.regras.reduce((t, r) => t + r.aplicabilidades.length, 0),
    ciclos: base.ciclos.length,
    lancamentos: base.lancamentos.length,
    avaliacoes: base.avaliacoes.length,
    avaliacoes_distritais: base.avaliacoesDistritais.length,
    contestacoes: base.contestacoes.length,
    eventos_auditoria: base.eventos.length,
  }
}
