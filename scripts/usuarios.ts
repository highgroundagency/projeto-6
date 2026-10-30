/**
 * Contas de acesso ao /sistema (ADR-051).
 *
 * Uso (com Node):            npm run usuarios -- <comando> [opções]
 * Uso (só com Docker):       docker compose exec app npx tsx scripts/usuarios.ts <comando> [opções]
 *
 *   listar
 *   criar --login seab --perfil seab
 *   criar --login ger-usf-canario --perfil gerente_unidade --gerente ger-usf-canario
 *   criar ... --se-nao-existir         não falha se o login já existe (automação)
 *   senha --login seab                 troca a senha e derruba as sessões abertas
 *   desativar --login seab             a conta para de entrar na hora
 *   ativar --login seab
 *   demo                               uma conta por perfil, com senha aleatória
 *
 * A SENHA NUNCA VAI COMO ARGUMENTO: ficaria no histórico do terminal e na
 * lista de processos. Ela é pedida sem eco no terminal, ou lida da variável
 * PRUMO_SENHA (para automação, como a suíte de ponta a ponta), ou gerada com
 * `--gerar` e mostrada uma única vez.
 *
 * Logins são técnicos (`seab`, `ger-usf-canario`): nome, e-mail ou CPF de
 * pessoa não entram no sistema (regra 1 do CLAUDE.md).
 */

import { randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline'
import { Writable } from 'node:stream'
import {
  criarConta,
  definirAtiva,
  listarContas,
  trocarSenha,
  type NovaConta,
} from '../src/lib/auth/servico'
import { bancoDe, fonteDoAmbiente } from '../src/lib/dados/postgres/conexao'
import type { PerfilId } from '../src/lib/features'
import { lerEnvLocal } from './ambiente-local'

lerEnvLocal()

const PERFIS: readonly PerfilId[] = ['seab', 'administrador', 'gerente_distrital', 'gerente_unidade']

function opcao(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function falhar(mensagem: string): never {
  console.error(`\n${mensagem}\n`)
  process.exit(1)
}

/** Senha forte e legível: 18 bytes aleatórios, 24 caracteres. */
function senhaAleatoria(): string {
  return randomBytes(18).toString('base64url')
}

/** Lê do terminal sem mostrar o que se digita. */
function perguntarEscondido(pergunta: string): Promise<string> {
  let mudo = false
  const saida = new Writable({
    write(pedaco, codificacao, pronto) {
      if (!mudo) process.stdout.write(pedaco, codificacao)
      pronto()
    },
  })
  const leitor = createInterface({ input: process.stdin, output: saida, terminal: true })
  return new Promise((resolver) => {
    leitor.question(pergunta, (resposta) => {
      leitor.close()
      process.stdout.write('\n')
      resolver(resposta)
    })
    mudo = true
  })
}

async function obterSenha(): Promise<{ senha: string; gerada: boolean }> {
  if (process.argv.includes('--gerar')) return { senha: senhaAleatoria(), gerada: true }
  if (process.env.PRUMO_SENHA) return { senha: process.env.PRUMO_SENHA, gerada: false }
  if (!process.stdin.isTTY) {
    falhar('Sem terminal para digitar a senha. Use --gerar ou a variável PRUMO_SENHA.')
  }
  const senha = await perguntarEscondido('Senha (mínimo 10 caracteres): ')
  const confirmacao = await perguntarEscondido('Repita a senha: ')
  if (senha !== confirmacao) falhar('As senhas não conferem.')
  return { senha, gerada: false }
}

const fonte = fonteDoAmbiente(process.env)
if (!fonte) falhar('Falta DATABASE_URL (ou DATABASE_SECRET_ID). Ver docs/banco.md.')
const banco = bancoDe(fonte, 1)

async function principal(): Promise<void> {
  const comando = process.argv[2]
  const login = opcao('login')

  switch (comando) {
    case 'listar': {
      const contas = await listarContas(banco)
      if (contas.length === 0) {
        console.log('\nNenhuma conta ainda. Crie com: criar --login seab --perfil seab\n')
        return
      }
      console.table(
        contas.map((c) => ({
          login: c.login,
          perfil: c.perfil,
          gerente: c.gerenteId ?? '',
          situação: !c.ativo ? 'desativada' : c.bloqueado ? 'bloqueada (tentativas)' : 'ativa',
          'último acesso': c.ultimoAcesso ?? 'nunca',
        })),
      )
      return
    }

    case 'criar': {
      const perfil = opcao('perfil') as PerfilId | undefined
      if (!login || !perfil) falhar('Uso: criar --login <login> --perfil <perfil> [--gerente <id>]')
      if (!PERFIS.includes(perfil)) falhar(`Perfil inválido. Use um de: ${PERFIS.join(', ')}.`)
      if (process.argv.includes('--se-nao-existir')) {
        const existe = (await listarContas(banco)).some((c) => c.login === login.toLowerCase())
        if (existe) {
          console.log(`\nConta ${login} já existe: mantida como está.\n`)
          return
        }
      }
      const { senha, gerada } = await obterSenha()
      const conta: NovaConta = { login, senha, perfil, gerenteId: opcao('gerente') ?? null }
      const usuario = await criarConta(banco, conta)
      console.log(`\nConta criada: ${usuario.login} (${usuario.perfil}).`)
      if (gerada) console.log(`Senha: ${senha}\nGuarde agora: ela não aparece de novo.`)
      console.log('')
      return
    }

    case 'senha': {
      if (!login) falhar('Uso: senha --login <login> [--gerar]')
      const { senha, gerada } = await obterSenha()
      if (!(await trocarSenha(banco, login, senha))) falhar(`Conta ${login} não encontrada.`)
      console.log(`\nSenha de ${login} trocada. As sessões abertas com a senha antiga caíram.`)
      if (gerada) console.log(`Senha nova: ${senha}\nGuarde agora: ela não aparece de novo.`)
      console.log('')
      return
    }

    case 'desativar':
    case 'ativar': {
      if (!login) falhar(`Uso: ${comando} --login <login>`)
      if (!(await definirAtiva(banco, login, comando === 'ativar'))) {
        falhar(`Conta ${login} não encontrada.`)
      }
      console.log(`\nConta ${login} ${comando === 'ativar' ? 'ativada' : 'desativada'}.\n`)
      return
    }

    case 'demo': {
      // Uma conta por perfil, para demonstrar o sistema. Logins técnicos e
      // senhas aleatórias, mostradas uma única vez. Quem já existe fica como está.
      const existentes = new Set((await listarContas(banco)).map((c) => c.login))
      const contas: Omit<NovaConta, 'senha'>[] = [
        { login: 'seab', perfil: 'seab' },
        { login: 'administrador', perfil: 'administrador' },
        { login: 'ger-ds-norte', perfil: 'gerente_distrital', gerenteId: 'ger-ds-norte' },
        { login: 'ger-usf-canario', perfil: 'gerente_unidade', gerenteId: 'ger-usf-canario' },
      ]
      console.log('')
      for (const conta of contas) {
        if (existentes.has(conta.login)) {
          console.log(`  ${conta.login.padEnd(18)} já existe, mantida`)
          continue
        }
        const senha = senhaAleatoria()
        await criarConta(banco, { ...conta, senha })
        console.log(`  ${conta.login.padEnd(18)} ${conta.perfil.padEnd(18)} senha: ${senha}`)
      }
      console.log('\nGuarde as senhas agora: elas não aparecem de novo.\n')
      return
    }

    default:
      falhar(
        'Comandos: listar, criar, senha, desativar, ativar, demo. Ver o topo de scripts/usuarios.ts.',
      )
  }
}

principal()
  .catch((erro) => {
    const texto = erro instanceof Error ? erro.message : String(erro)
    if (/usuarios_login_key|duplicate key/.test(texto)) falhar('Já existe uma conta com esse login.')
    if (/usuario_vinculo|não combina/.test(texto)) falhar(texto)
    falhar(texto)
  })
  .finally(() => banco.end())
