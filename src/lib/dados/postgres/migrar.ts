import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ClientBase } from 'pg'

/**
 * Aplica as migrações de `db/migrations/` que ainda não rodaram.
 *
 * Cada arquivo roda numa transação própria e fica anotado em
 * `migracoes_aplicadas`, então rodar de novo é seguro: só o que é novo entra.
 * Migração aplicada não se edita. Mudou o schema? Arquivo novo, com número
 * seguinte.
 */

export const PASTA_MIGRACOES = join(process.cwd(), 'db', 'migrations')

export async function aplicarMigracoes(
  cliente: ClientBase,
  pasta: string = PASTA_MIGRACOES,
  avisar: (mensagem: string) => void = () => {},
): Promise<string[]> {
  await cliente.query(`
    create table if not exists migracoes_aplicadas (
      arquivo     text primary key,
      aplicada_em timestamptz not null default now()
    )
  `)

  const { rows } = await cliente.query<{ arquivo: string }>(
    'select arquivo from migracoes_aplicadas',
  )
  const jaAplicadas = new Set(rows.map((r) => r.arquivo))

  const arquivos = (await readdir(pasta)).filter((a) => a.endsWith('.sql')).sort()
  const novas: string[] = []

  for (const arquivo of arquivos) {
    if (jaAplicadas.has(arquivo)) continue
    const sql = await readFile(join(pasta, arquivo), 'utf8')
    try {
      await cliente.query('begin')
      await cliente.query(sql)
      await cliente.query('insert into migracoes_aplicadas (arquivo) values ($1)', [arquivo])
      await cliente.query('commit')
    } catch (erro) {
      await cliente.query('rollback')
      throw new Error(
        `Migração ${arquivo} falhou: ${erro instanceof Error ? erro.message : String(erro)}`,
      )
    }
    novas.push(arquivo)
    avisar(`  ✓ ${arquivo}`)
  }

  return novas
}
