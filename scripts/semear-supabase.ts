/**
 * Semeia a base sintética num projeto Supabase (F3).
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE=... npm run semear
 *   ... npm run semear -- --limpar      # apaga o que existe antes
 *   ... npm run semear -- --contas      # cria também as contas de demonstração
 *
 * Pré-requisito: as migrações de `supabase/migrations/` já aplicadas.
 *
 * A ordem dos passos é a do plano em src/lib/dados/semeadura.ts, e ela não é
 * negociável: os gatilhos do banco recusam lançamento fora da janela e
 * transição de estado que pule etapa. Isso é proposital — o script obedece às
 * mesmas regras que qualquer outro caminho de escrita.
 */

import { createClient } from '@supabase/supabase-js'
import { gerarBase } from '../src/lib/seed/gerar'
import {
  contasDeDemonstracao,
  montarPlano,
  TABELAS_PARA_LIMPAR,
} from '../src/lib/dados/semeadura'

const url = process.env.SUPABASE_URL?.trim()
const chave = process.env.SUPABASE_SERVICE_ROLE?.trim()
const limpar = process.argv.includes('--limpar')
const criarContas = process.argv.includes('--contas')

if (!url || !chave) {
  console.error(
    '\nFaltam credenciais.\n' +
      '  SUPABASE_URL=https://xxx.supabase.co \\\n' +
      '  SUPABASE_SERVICE_ROLE=<chave de service role> \\\n' +
      '  npm run semear\n\n' +
      'A service role ignora RLS e nunca deve ir para o navegador: use só aqui.\n',
  )
  process.exit(1)
}

const supabase = createClient(url, chave, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SENHA_DEMO = process.env.SENHA_DEMO?.trim() || 'prumo-demo-2026'

async function limparBase(): Promise<void> {
  console.log('Limpando a base…')
  for (const tabela of TABELAS_PARA_LIMPAR) {
    if (tabela === 'eventos_auditoria') {
      // A trilha é append-only por gatilho. Apagá-la exige uma decisão
      // consciente — e em produção ela simplesmente não deve ser apagada.
      console.log('  · eventos_auditoria preservada (append-only)')
      continue
    }
    const { error } = await supabase.from(tabela).delete().not('id', 'is', null)
    if (error) throw new Error(`Falha ao limpar ${tabela}: ${error.message}`)
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
      const { error } = await supabase
        .from('ciclos')
        .update({ estado: passo.para })
        .eq('id', passo.cicloId)
      if (error) {
        throw new Error(`Transição ${passo.cicloId} → ${passo.para}: ${error.message}`)
      }
      continue
    }

    if (passo.linhas.length === 0) continue

    // Em lotes: uma inserção com centenas de linhas estoura o limite de payload.
    const TAMANHO = 200
    for (let i = 0; i < passo.linhas.length; i += TAMANHO) {
      const lote = passo.linhas.slice(i, i + TAMANHO)
      const { error } = await supabase.from(passo.tabela).insert(lote)
      if (error) throw new Error(`Inserção em ${passo.tabela}: ${error.message}`)
    }
    console.log(`  ✓ ${passo.tabela} (${passo.linhas.length})`)
  }
}

async function semearContas(): Promise<void> {
  const base = gerarBase()
  console.log('\nContas de demonstração:')

  for (const conta of contasDeDemonstracao(base)) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: conta.email,
      password: SENHA_DEMO,
      email_confirm: true,
    })

    let id = data?.user?.id

    if (error) {
      if (!/already/i.test(error.message)) {
        throw new Error(`Conta ${conta.email}: ${error.message}`)
      }
      const { data: existentes } = await supabase.auth.admin.listUsers()
      id = existentes?.users.find((u) => u.email === conta.email)?.id
    }

    if (!id) throw new Error(`Não foi possível resolver o id de ${conta.email}.`)

    const { error: erroVinculo } = await supabase.from('usuarios').upsert({
      id,
      nome: conta.nome,
      perfil: conta.perfil,
      area_id: conta.areaId,
      gestor_id: conta.gestorId,
    })
    if (erroVinculo) throw new Error(`Vínculo de ${conta.email}: ${erroVinculo.message}`)

    console.log(`  ✓ ${conta.email.padEnd(28)} ${conta.perfil}`)
  }

  console.log(`\n  Senha das contas: ${SENHA_DEMO}`)
  console.log('  Troque-a antes de qualquer uso que não seja demonstração.\n')
}

async function principal(): Promise<void> {
  console.log(`\nProjeto: ${url}`)

  if (limpar) await limparBase()
  await semear()
  if (criarContas) await semearContas()

  console.log('\nBase sintética semeada. Nenhum dado real foi utilizado.\n')
}

principal().catch((erro) => {
  console.error(`\n${erro instanceof Error ? erro.message : erro}\n`)
  process.exit(1)
})
