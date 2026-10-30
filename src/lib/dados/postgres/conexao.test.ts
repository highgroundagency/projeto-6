import { Client } from 'pg'
import { afterAll, describe, expect, it } from 'vitest'
import {
  bancoDe,
  fonteDoAmbiente,
  fonteSecretsManager,
  interpretarSegredo,
  semSenha,
  type LerSegredo,
} from './conexao'

describe('o segredo do banco', () => {
  it('lê o formato JSON que o Secrets Manager usa para o RDS', () => {
    const json = JSON.stringify({
      engine: 'postgres',
      username: 'prumo_app',
      password: 's3nh@:com/caracteres',
      host: 'prumo.abc123.sa-east-1.rds.amazonaws.com',
      port: 5432,
      dbname: 'prumo',
    })
    expect(interpretarSegredo(json)).toEqual({
      host: 'prumo.abc123.sa-east-1.rds.amazonaws.com',
      porta: 5432,
      usuario: 'prumo_app',
      senha: 's3nh@:com/caracteres',
      banco: 'prumo',
    })
  })

  it('aceita também uma URL guardada como texto', () => {
    expect(interpretarSegredo('postgresql://app:p%40ss@db.interno:6543/prumo')).toEqual({
      host: 'db.interno',
      porta: 6543,
      usuario: 'app',
      senha: 'p@ss',
      banco: 'prumo',
    })
  })

  it('recusa segredo incompleto com mensagem clara, sem ecoar o conteúdo', () => {
    expect(() => interpretarSegredo('{"username":"x"}')).toThrow(/username, password e host/)
    expect(() => interpretarSegredo('não é json')).toThrow(/não é JSON/)
  })

  it('a senha nunca aparece na descrição nem no log', () => {
    expect(semSenha('postgresql://prumo:segredo@host:5432/db')).toBe(
      'postgresql://prumo:***@host:5432/db',
    )
    const fonte = fonteDoAmbiente({ DATABASE_URL: 'postgresql://prumo:segredo@host:5432/db' })
    expect(fonte?.descricao).not.toContain('segredo')
  })
})

describe('qual fonte vale', () => {
  it('o Secrets Manager vence a URL quando os dois estão definidos', () => {
    const fonte = fonteDoAmbiente({
      DATABASE_SECRET_ID: 'prumo/banco',
      DATABASE_URL: 'postgresql://local',
    })
    expect(fonte?.descricao).toBe('AWS Secrets Manager (prumo/banco)')
  })

  it('sem nenhum dos dois, não há banco', () => {
    expect(fonteDoAmbiente({})).toBeNull()
  })

  it('com o Secrets Manager, TLS com certificado conferido é o padrão', async () => {
    const ler: LerSegredo = async () =>
      JSON.stringify({ username: 'u', password: 'p', host: 'h', dbname: 'd' })
    const config = await fonteSecretsManager('id', {}, ler).configuracao()
    expect(config.ssl).toEqual({ rejectUnauthorized: true })
  })
})

describe('cache do segredo', () => {
  function leitorContado(senhas: string[]) {
    let chamadas = 0
    const ler: LerSegredo = async () => {
      const senha = senhas[Math.min(chamadas, senhas.length - 1)]
      chamadas++
      return JSON.stringify({ username: 'u', password: senha, host: 'h' })
    }
    return { ler, chamadas: () => chamadas }
  }

  it('não pergunta à AWS a cada conexão', async () => {
    const { ler, chamadas } = leitorContado(['a'])
    const fonte = fonteSecretsManager('id', {}, ler)
    const config = await fonte.configuracao()
    const senha = config.password as () => Promise<string>
    await senha()
    await senha()
    expect(chamadas()).toBe(1)
  })

  it('passada a validade, busca de novo e pega a senha rotacionada', async () => {
    let agora = 0
    const { ler, chamadas } = leitorContado(['velha', 'nova'])
    const fonte = fonteSecretsManager('id', { DATABASE_SECRET_TTL_SEGUNDOS: '60' }, ler, () => agora)
    const senha = (await fonte.configuracao()).password as () => Promise<string>
    expect(await senha()).toBe('velha')
    agora = 61_000
    expect(await senha()).toBe('nova')
    expect(chamadas()).toBe(2)
  })

  it('falha da AWS não fica guardada: a próxima tentativa pergunta de novo', async () => {
    let falhar = true
    const ler: LerSegredo = async () => {
      if (falhar) throw new Error('AccessDeniedException')
      return JSON.stringify({ username: 'u', password: 'p', host: 'h' })
    }
    const fonte = fonteSecretsManager('id', {}, ler)
    await expect(fonte.configuracao()).rejects.toThrow(/AccessDenied/)
    falhar = false
    await expect(fonte.configuracao()).resolves.toMatchObject({ host: 'h' })
  })
})

/**
 * A rotação de verdade, contra um Postgres que confere senha. Cria um papel
 * descartável, troca a senha dele no meio do caminho (como o Secrets Manager
 * faz no RDS) e prova que a aplicação se recupera sozinha, sem reinício.
 */
const URL_TESTE = process.env.DATABASE_URL_TESTE
const PAPEL = 'prumo_teste_rotacao'

describe.skipIf(!URL_TESTE)('rotação da senha contra um Postgres real', () => {
  let admin: Client

  afterAll(async () => {
    await admin?.query(`drop role if exists ${PAPEL}`).catch(() => {})
    await admin?.end()
  })

  it('a senha muda no banco e a próxima conexão já entra com a nova', async () => {
    admin = new Client({ connectionString: URL_TESTE })
    await admin.connect()
    await admin.query(`drop role if exists ${PAPEL}`)
    await admin.query(`create role ${PAPEL} login password 'senha-antes-da-rotacao'`)

    const url = new URL(URL_TESTE!)
    let senhaNoCofre = 'senha-antes-da-rotacao'
    const ler: LerSegredo = async () =>
      JSON.stringify({
        username: PAPEL,
        password: senhaNoCofre,
        host: url.hostname,
        port: Number(url.port || 5432),
        dbname: url.pathname.slice(1),
      })

    // TTL longo de propósito: a recuperação vem do erro 28P01, não da validade.
    const fonte = fonteSecretsManager(
      'prumo/teste',
      { DATABASE_SSL: 'desligado', DATABASE_SECRET_TTL_SEGUNDOS: '3600' },
      ler,
    )
    const banco = bancoDe(fonte, 1)
    expect((await banco.query('select current_user as u')).rows[0].u).toBe(PAPEL)

    // A rotação: o cofre e o banco passam a ter a senha nova.
    senhaNoCofre = 'senha-depois-da-rotacao'
    await admin.query(`alter role ${PAPEL} password 'senha-depois-da-rotacao'`)

    // Força conexão nova (a ociosa já estava autenticada com a senha velha).
    await banco.end()
    expect((await banco.query('select current_user as u')).rows[0].u).toBe(PAPEL)
    await banco.end()
  })
})
