import { randomBytes } from 'node:crypto'
import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BASE } from '@/lib/seed'
import { carregarBase } from '@/lib/dados/postgres/carga'
import { bancoDoPool, type Banco } from '@/lib/dados/postgres/conexao'
import { aplicarMigracoes } from '@/lib/dados/postgres/migrar'
import { cifrarSessao, type CustoScrypt } from './cripto'
import {
  autenticar,
  criarConta,
  definirAtiva,
  emitirSessao,
  MAX_FALHAS_SEGUIDAS,
  trocarSenha,
  usuarioDaSessao,
} from './servico'

/**
 * O login inteiro contra um PostgreSQL de verdade: conta, senha, bloqueio por
 * tentativas, sessão cifrada e a revogação quando a senha muda.
 *
 * Roda com `DATABASE_URL_TESTE` (banco DESCARTÁVEL: o schema é recriado).
 */

const URL_TESTE = process.env.DATABASE_URL_TESTE
const BARATO: CustoScrypt = { N: 2 ** 10, r: 8, p: 1 }
const chave = randomBytes(32)
const agora = () => Math.floor(Date.now() / 1000)

let pool: Pool
let banco: Banco

beforeAll(async () => {
  if (!URL_TESTE) return
  pool = new Pool({ connectionString: URL_TESTE, max: 4 })
  const cliente = await pool.connect()
  try {
    await cliente.query('drop schema if exists public cascade')
    await cliente.query('drop schema if exists app cascade')
    await cliente.query('drop schema if exists auth cascade')
    await cliente.query('create schema public')
    await aplicarMigracoes(cliente)
    await cliente.query('begin')
    await carregarBase(cliente, BASE)
    await cliente.query('commit')
  } finally {
    cliente.release()
  }
  banco = bancoDoPool(pool)
}, 120_000)

afterAll(async () => {
  await pool?.end()
})

describe.skipIf(!URL_TESTE)('login', () => {
  it('a senha certa entra, a errada não, e login inexistente responde igual', async () => {
    await criarConta(banco, { login: 'seab', senha: 'uma senha bem longa', perfil: 'seab' }, BARATO)

    const certo = await autenticar(banco, 'seab', 'uma senha bem longa')
    expect(certo).toMatchObject({ ok: true, usuario: { login: 'seab', perfil: 'seab' } })

    expect(await autenticar(banco, 'seab', 'senha errada qualquer')).toEqual({
      ok: false,
      motivo: 'credenciais',
    })
    expect(await autenticar(banco, 'ninguem', 'uma senha bem longa')).toEqual({
      ok: false,
      motivo: 'credenciais',
    })
  })

  it('o login não diferencia maiúscula', async () => {
    expect((await autenticar(banco, '  SEAB ', 'uma senha bem longa')).ok).toBe(true)
  })

  it('o banco guarda só o hash, nunca a senha', async () => {
    const { rows } = await pool.query(`select senha_hash from usuarios where login = 'seab'`)
    expect(rows[0].senha_hash).toMatch(/^scrypt\$/)
    expect(rows[0].senha_hash).not.toContain('senha')
    await expect(
      pool.query(
        `insert into usuarios (login, senha_hash, perfil) values ('texto-puro', 'minhasenha123', 'seab')`,
      ),
    ).rejects.toThrow(/senha_hash/)
  })

  it(`${MAX_FALHAS_SEGUIDAS} erros seguidos travam a conta, mesmo com a senha certa depois`, async () => {
    await criarConta(
      banco,
      { login: 'alvo', senha: 'senha do alvo 123', perfil: 'administrador' },
      BARATO,
    )
    for (let i = 0; i < MAX_FALHAS_SEGUIDAS; i++) {
      await autenticar(banco, 'alvo', `chute ${i} errado`)
    }
    expect(await autenticar(banco, 'alvo', 'senha do alvo 123')).toEqual({
      ok: false,
      motivo: 'bloqueado',
    })

    // Passado o bloqueio, a senha certa volta a entrar e zera a contagem.
    await pool.query(`update usuarios set bloqueado_ate = now() - interval '1 second' where login = 'alvo'`)
    expect((await autenticar(banco, 'alvo', 'senha do alvo 123')).ok).toBe(true)
    const { rows } = await pool.query(`select falhas_seguidas from usuarios where login = 'alvo'`)
    expect(rows[0].falhas_seguidas).toBe(0)
  })

  it('conta desativada não entra', async () => {
    await definirAtiva(banco, 'alvo', false)
    expect((await autenticar(banco, 'alvo', 'senha do alvo 123')).ok).toBe(false)
    await definirAtiva(banco, 'alvo', true)
  })
})

describe.skipIf(!URL_TESTE)('sessão', () => {
  it('o cookie leva de volta à conta, com perfil e vínculo vindos do banco', async () => {
    await criarConta(
      banco,
      {
        login: 'ger-usf-canario',
        senha: 'senha da canario',
        perfil: 'gerente_unidade',
        gerenteId: 'ger-usf-canario',
      },
      BARATO,
    )
    const login = await autenticar(banco, 'ger-usf-canario', 'senha da canario')
    if (!login.ok) throw new Error('login devia passar')
    const token = emitirSessao(login.usuario, chave, agora())

    expect(await usuarioDaSessao(banco, token, chave, agora())).toEqual({
      id: login.usuario.id,
      login: 'ger-usf-canario',
      perfil: 'gerente_unidade',
      gerenteId: 'ger-usf-canario',
      unidadeId: 'usf-canario',
      distritoId: 'ds-norte',
      versaoSessao: 1,
    })
  })

  it('trocar a senha derruba as sessões abertas antes', async () => {
    const login = await autenticar(banco, 'ger-usf-canario', 'senha da canario')
    if (!login.ok) throw new Error('login devia passar')
    const token = emitirSessao(login.usuario, chave, agora())

    await trocarSenha(banco, 'ger-usf-canario', 'senha nova da canario', BARATO)
    expect(await usuarioDaSessao(banco, token, chave, agora())).toBeNull()
    expect((await autenticar(banco, 'ger-usf-canario', 'senha da canario')).ok).toBe(false)
    expect((await autenticar(banco, 'ger-usf-canario', 'senha nova da canario')).ok).toBe(true)
  })

  it('desativar derruba a sessão na hora', async () => {
    const login = await autenticar(banco, 'seab', 'uma senha bem longa')
    if (!login.ok) throw new Error('login devia passar')
    const token = emitirSessao(login.usuario, chave, agora())
    await definirAtiva(banco, 'seab', false)
    expect(await usuarioDaSessao(banco, token, chave, agora())).toBeNull()
    await definirAtiva(banco, 'seab', true)
  })

  it('sessão vencida, adulterada ou de outra chave não vale', async () => {
    const login = await autenticar(banco, 'seab', 'uma senha bem longa')
    if (!login.ok) throw new Error('login devia passar')
    const token = emitirSessao(login.usuario, chave, agora())

    expect(await usuarioDaSessao(banco, token, chave, agora() + 9 * 3600)).toBeNull()
    expect(await usuarioDaSessao(banco, token, randomBytes(32), agora())).toBeNull()
    expect(await usuarioDaSessao(banco, token.slice(0, -2) + 'AA', chave, agora())).toBeNull()
  })

  it('não dá para forjar uma sessão de outra conta sem a chave', async () => {
    // Mesmo sabendo o formato, sem a chave o cifrado não abre.
    const forjado = cifrarSessao({ u: 'usr-0001', s: 2, exp: agora() + 60 }, randomBytes(32))
    expect(await usuarioDaSessao(banco, forjado, chave, agora())).toBeNull()
  })
})

describe.skipIf(!URL_TESTE)('vínculo da conta', () => {
  const senha = 'senha qualquer longa'

  it('gerente precisa de gerente; SEAB não pode ter', async () => {
    await expect(
      criarConta(banco, { login: 'sem-vinculo', senha, perfil: 'gerente_unidade' }, BARATO),
    ).rejects.toThrow(/usuario_vinculo_coerente/)
    await expect(
      criarConta(
        banco,
        { login: 'seab-2', senha, perfil: 'seab', gerenteId: 'ger-usf-sabia' },
        BARATO,
      ),
    ).rejects.toThrow(/usuario_vinculo_coerente/)
  })

  it('conta de unidade não pode apontar para gerente distrital, nem o contrário', async () => {
    await expect(
      criarConta(
        banco,
        { login: 'errada-1', senha, perfil: 'gerente_unidade', gerenteId: 'ger-ds-norte' },
        BARATO,
      ),
    ).rejects.toThrow(/não combina/)
    await expect(
      criarConta(
        banco,
        { login: 'errada-2', senha, perfil: 'gerente_distrital', gerenteId: 'ger-usf-sabia' },
        BARATO,
      ),
    ).rejects.toThrow(/não combina/)
  })

  it('senha curta é recusada antes de chegar ao banco', async () => {
    await expect(
      criarConta(banco, { login: 'curta', senha: '123', perfil: 'seab' }, BARATO),
    ).rejects.toThrow(/10 caracteres/)
  })
})
