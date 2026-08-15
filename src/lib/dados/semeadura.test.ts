import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { gerarBase } from '@/lib/seed/gerar'
import { montarPlano, TABELAS_PARA_LIMPAR } from './semeadura'

/**
 * Executa o plano de semeadura inteiro contra um PostgreSQL real.
 *
 * É o que prova que a migração do seed funciona de ponta a ponta: as 171
 * linhas de lançamento, as transições de estado e as avaliações passam pelas
 * mesmas constraints e gatilhos que valeriam em produção. O que fica de fora é
 * só o transporte HTTP do supabase-js.
 *
 * Roda quando `DATABASE_URL_TESTE` aponta para um Postgres descartável.
 */

const URL_TESTE = process.env.DATABASE_URL_TESTE
const temBanco = Boolean(URL_TESTE)

let pool: Pool
const base = gerarBase()

beforeAll(async () => {
  if (!temBanco) return
  pool = new Pool({ connectionString: URL_TESTE, max: 2 })

  const cliente = await pool.connect()
  try {
    await cliente.query('drop schema if exists public cascade')
    await cliente.query('drop schema if exists app cascade')
    await cliente.query('drop schema if exists auth cascade')
    await cliente.query('create schema public')
    await cliente.query(
      await readFile(join(process.cwd(), 'supabase/testes/stubs-locais.sql'), 'utf8'),
    )
    const pasta = join(process.cwd(), 'supabase/migrations')
    for (const arquivo of (await readdir(pasta)).filter((a) => a.endsWith('.sql')).sort()) {
      await cliente.query(await readFile(join(pasta, arquivo), 'utf8'))
    }
  } finally {
    cliente.release()
  }
}, 120_000)

afterAll(async () => {
  await pool?.end()
})

describe.skipIf(!temBanco)('semeadura da base sintética', () => {
  it('o plano executa inteiro contra o schema real', async () => {
    const { passos, resumo } = montarPlano(base)
    const cliente = await pool.connect()

    try {
      for (const tabela of TABELAS_PARA_LIMPAR) {
        // eventos_auditoria é append-only por gatilho: para recomeçar do zero
        // é preciso desativar o gatilho explicitamente — e o fato de isso ser
        // trabalhoso é exatamente o ponto.
        if (tabela === 'eventos_auditoria') {
          await cliente.query('alter table eventos_auditoria disable trigger trilha_append_only')
          await cliente.query('delete from eventos_auditoria')
          await cliente.query('alter table eventos_auditoria enable trigger trilha_append_only')
          continue
        }
        await cliente.query(`delete from ${tabela}`)
      }

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
        for (const linha of passo.linhas) {
          const valores = colunas.map((coluna) => {
            const valor = (linha as Record<string, unknown>)[coluna]
            return valor !== null && typeof valor === 'object' ? JSON.stringify(valor) : valor
          })
          const marcadores = colunas.map((_, i) => `$${i + 1}`).join(', ')
          await cliente.query(
            `insert into ${passo.tabela} (${colunas.join(', ')}) values (${marcadores})`,
            valores,
          )
        }
      }

      const contar = async (tabela: string) =>
        Number((await cliente.query(`select count(*)::int as total from ${tabela}`)).rows[0].total)

      expect(await contar('areas')).toBe(resumo.areas)
      expect(await contar('indicadores')).toBe(resumo.indicadores)
      expect(await contar('lancamentos')).toBe(resumo.lancamentos)
      expect(await contar('avaliacoes')).toBe(resumo.avaliacoes)
      expect(await contar('contestacoes')).toBe(resumo.contestacoes)

      // Os estados finais precisam bater com o que a base descreve.
      for (const ciclo of base.ciclos) {
        const { rows } = await cliente.query('select estado from ciclos where id = $1', [ciclo.id])
        expect(rows[0].estado, `estado final de ${ciclo.id}`).toBe(ciclo.estado)
      }

      // A trilha nasce preenchida pelos gatilhos, não por dados fabricados.
      const eventos = await contar('eventos_auditoria')
      expect(eventos).toBeGreaterThan(resumo.lancamentos)

      const porTipo = await cliente.query(
        `select tipo, count(*)::int as total from eventos_auditoria group by tipo order by tipo`,
      )
      const tipos = Object.fromEntries(porTipo.rows.map((r) => [r.tipo, r.total]))
      expect(tipos.ciclo_criado).toBe(base.ciclos.length)
      expect(tipos.lancamento_registrado + (tipos.lancamento_alterado ?? 0)).toBe(
        resumo.lancamentos,
      )
      expect(tipos.regra_versionada).toBe(base.regras.length)
      expect(tipos.ciclo_estado_alterado).toBe(resumo.transicoes)
    } finally {
      cliente.release()
    }
  }, 180_000)

  it('a memória de cálculo sobrevive à ida e volta do banco', async () => {
    const cliente = await pool.connect()
    try {
      const { rows } = await cliente.query(
        `select gestor_id, ciclo_id, score, memoria from avaliacoes order by ciclo_id, gestor_id limit 1`,
      )
      const salva = rows[0]
      const original = base.avaliacoes.find(
        (a) => a.gestorId === salva.gestor_id && a.cicloId === salva.ciclo_id,
      )

      expect(original).toBeDefined()
      expect(Number(salva.score)).toBe(original!.score)
      expect(salva.memoria.passos).toHaveLength(original!.memoria.passos.length)
      expect(salva.memoria.somaContribuicoes).toBe(original!.memoria.somaContribuicoes)
      expect(salva.memoria.formula).toBe(original!.memoria.formula)
    } finally {
      cliente.release()
    }
  })
})
