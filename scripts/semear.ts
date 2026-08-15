/**
 * Semeia a base sintética num PostgreSQL com o schema de
 * `supabase/migrations/` aplicado.
 *
 * Uso:
 *   DATABASE_URL=postgresql://... npm run semear
 *   DATABASE_URL=postgresql://... npm run semear -- --limpar
 *
 * O app NÃO usa banco (ver ADR-011 em docs/decisoes.md). Este script existe
 * para que o schema guardado continue utilizável: aponte para qualquer
 * PostgreSQL — incluindo a connection string direta de um projeto Supabase — e
 * a base sintética entra inteira.
 *
 * Usa `pg` em vez de um SDK: é a mesma dependência que os testes de RLS já
 * usam, e funciona com qualquer Postgres.
 *
 * A ORDEM dos passos não é negociável: os gatilhos do banco recusam lançamento
 * fora da janela e transição de estado que pule etapa. O script obedece às
 * mesmas regras que qualquer outro caminho de escrita — e é por isso que a
 * trilha de auditoria nasce com os eventos reais.
 */

import { Client } from 'pg'
import { gerarBase } from '../src/lib/seed/gerar'
import { montarPlano, TABELAS_PARA_LIMPAR } from '../src/lib/dados/semeadura'

const url = process.env.DATABASE_URL?.trim()
const limpar = process.argv.includes('--limpar')

if (!url) {
  console.error(
    '\nFalta a conexão.\n' +
      '  DATABASE_URL=postgresql://usuario:senha@host:5432/banco npm run semear\n\n' +
      'Aplique antes as migrações de supabase/migrations/.\n',
  )
  process.exit(1)
}

const cliente = new Client({ connectionString: url })

async function limparBase(): Promise<void> {
  console.log('Limpando a base…')
  for (const tabela of TABELAS_PARA_LIMPAR) {
    if (tabela === 'eventos_auditoria') {
      // A trilha é append-only por gatilho. Apagá-la exige desativá-lo
      // explicitamente — e o fato de dar trabalho é exatamente o ponto.
      await cliente.query('alter table eventos_auditoria disable trigger trilha_append_only')
      await cliente.query('delete from eventos_auditoria')
      await cliente.query('alter table eventos_auditoria enable trigger trilha_append_only')
      console.log('  · eventos_auditoria (gatilho reativado)')
      continue
    }
    await cliente.query(`delete from ${tabela}`)
    console.log(`  · ${tabela}`)
  }
}

async function semear(): Promise<void> {
  const base = gerarBase()
  const { passos, resumo } = montarPlano(base)

  console.log('\nPlano de semeadura:')
  for (const [tabela, total] of Object.entries(resumo)) {
    console.log(`  ${String(total).padStart(4)}  ${tabela}`)
  }
  console.log('')

  for (const passo of passos) {
    if (passo.tipo === 'transicao') {
      await cliente.query('update ciclos set estado = $1 where id = $2', [
        passo.para,
        passo.cicloId,
      ])
      continue
    }

    if (passo.linhas.length === 0) continue

    const colunas = Object.keys(passo.linhas[0])
    const marcadores = colunas.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `insert into ${passo.tabela} (${colunas.join(', ')}) values (${marcadores})`

    for (const linha of passo.linhas) {
      const valores = colunas.map((coluna) => {
        const valor = (linha as Record<string, unknown>)[coluna]
        // jsonb precisa chegar como texto; o resto vai como está.
        return valor !== null && typeof valor === 'object' ? JSON.stringify(valor) : valor
      })
      await cliente.query(sql, valores)
    }

    console.log(`  ✓ ${passo.tabela} (${passo.linhas.length})`)
  }
}

async function principal(): Promise<void> {
  await cliente.connect()
  console.log(`\nConectado: ${url!.replace(/:[^:@/]+@/, ':***@')}`)

  try {
    await cliente.query('begin')
    if (limpar) await limparBase()
    await semear()
    await cliente.query('commit')
  } catch (erro) {
    await cliente.query('rollback')
    throw erro
  } finally {
    await cliente.end()
  }

  console.log('\nBase sintética semeada. Nenhum dado real foi utilizado.\n')
}

principal().catch((erro) => {
  console.error(`\n${erro instanceof Error ? erro.message : erro}\n`)
  process.exit(1)
})
