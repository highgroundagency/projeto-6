/**
 * Banco de dados do Prumo: migração e carga inicial.
 *
 * Uso:
 *   npm run db:migrar              aplica as migrações novas de db/migrations/
 *   npm run db:semear              carrega a base sintética (só se o banco estiver vazio)
 *   npm run db:semear -- --limpar  apaga o conteúdo e carrega de novo (cuidado)
 *   npm run db:preparar            migrar + semear: o que se roda depois de `docker compose up -d`
 *
 * Lê DATABASE_URL (ou DATABASE_SECRET_ID) do ambiente ou do .env.local.
 */

import { Client } from 'pg'
import { fonteDoAmbiente } from '../src/lib/dados/postgres/conexao'
import { BASE } from '../src/lib/seed'
import { bancoVazio, carregarBase, limparDominio } from '../src/lib/dados/postgres/carga'
import { aplicarMigracoes } from '../src/lib/dados/postgres/migrar'
import { lerEnvLocal } from './ambiente-local'

lerEnvLocal()

const comando = process.argv[2]
const limpar = process.argv.includes('--limpar')
const fonte = fonteDoAmbiente(process.env)

if (!['migrar', 'semear', 'preparar'].includes(comando ?? '')) {
  console.error('Uso: tsx scripts/db.ts <migrar|semear|preparar> [--limpar]')
  process.exit(1)
}

if (!fonte) {
  console.error(
    '\nFalta DATABASE_URL (ou DATABASE_SECRET_ID, para ler do AWS Secrets Manager).\n' +
      '  1. docker compose up -d\n' +
      '  2. copie .env.example para .env.local (a DATABASE_URL do Docker já está lá)\n' +
      '  3. npm run db:preparar\n',
  )
  process.exit(1)
}

let cliente: Client

async function migrar(): Promise<void> {
  console.log('\nMigrações:')
  const novas = await aplicarMigracoes(cliente, undefined, console.log)
  if (novas.length === 0) console.log('  nada novo: o banco já está na versão atual.')
}

async function semear(): Promise<void> {
  console.log('\nCarga inicial:')
  await cliente.query('begin')
  try {
    if (!(await bancoVazio(cliente))) {
      if (!limpar) {
        await cliente.query('rollback')
        console.log(
          '  o banco já tem dados; nada foi alterado.\n' +
            '  Para apagar TUDO (inclusive o que foi lançado pela tela) e recarregar: ' +
            'npm run db:semear -- --limpar',
        )
        return
      }
      console.log('  --limpar: apagando o conteúdo atual…')
      await limparDominio(cliente)
    }
    const resumo = await carregarBase(cliente, BASE)
    await cliente.query('commit')
    for (const [tabela, total] of Object.entries(resumo)) {
      console.log(`  ${String(total).padStart(4)}  ${tabela}`)
    }
    console.log('\n  Base sintética carregada. Nenhum dado real foi utilizado.')
  } catch (erro) {
    await cliente.query('rollback')
    throw erro
  }
}

async function principal(): Promise<void> {
  cliente = new Client(await fonte!.configuracao())
  await cliente.connect()
  console.log(`Conectado: ${fonte!.descricao}`)
  try {
    if (comando === 'migrar' || comando === 'preparar') await migrar()
    if (comando === 'semear' || comando === 'preparar') await semear()
  } finally {
    await cliente.end()
  }
  console.log('')
}

principal().catch((erro) => {
  const texto = erro instanceof Error ? erro.message : String(erro)
  console.error(`\n${texto}\n`)
  if (/ECONNREFUSED/.test(texto)) {
    console.error('O Postgres está de pé? Rode `docker compose up -d` e tente de novo.\n')
  }
  process.exit(1)
})
