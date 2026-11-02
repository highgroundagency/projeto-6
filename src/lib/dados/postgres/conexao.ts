import { readFileSync } from 'node:fs'
import { Pool, type PoolClient, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg'
import type { Ambiente } from '@/lib/ambiente'

/**
 * De onde vêm as credenciais do banco, e como a conexão é aberta.
 *
 * DUAS FONTES, NUNCA O CÓDIGO:
 *
 * - `DATABASE_SECRET_ID` definido: as credenciais vêm do AWS Secrets Manager.
 *   A aplicação guarda só o NOME do segredo; usuário e senha nunca passam por
 *   variável de ambiente, arquivo ou repositório. A permissão de ler o segredo
 *   vem do papel IAM de quem roda (ECS, EC2, Lambda) ou do `aws sso login` de
 *   quem desenvolve: nenhuma chave de acesso da AWS no projeto.
 * - Senão, `DATABASE_URL`: o caminho de desenvolvimento (Docker local).
 *
 * ROTAÇÃO. O Secrets Manager pode trocar a senha do RDS sozinho. Por isso a
 * senha não é lida uma vez e congelada: cada conexão nova pede a senha a um
 * cache com validade curta, e se o banco recusar a senha (código 28P01, o que
 * acontece logo depois de uma rotação), o cache é jogado fora e a conexão é
 * tentada uma vez mais, já com a senha nova.
 *
 * TLS. Banco fora da máquina exige conexão cifrada E certificado conferido
 * (`rejectUnauthorized: true`). O RDS usa uma autoridade da própria AWS que o
 * Node não conhece: aponte `DATABASE_SSL_CA` para o pacote dela
 * (https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem).
 */

/** O formato que o Secrets Manager usa para segredo de banco do RDS. */
interface SegredoRds {
  username: string
  password: string
  host: string
  port?: number | string
  dbname?: string
}

export interface Credenciais {
  host: string
  porta: number
  usuario: string
  senha: string
  banco: string
}

/** Lê o texto do segredo. Injetável para os testes não falarem com a AWS. */
export type LerSegredo = (id: string, regiao: string | undefined) => Promise<string>

export const lerSegredoDaAws: LerSegredo = async (id, regiao) => {
  // Import dinâmico: quem roda só com DATABASE_URL nem carrega o SDK.
  const { SecretsManagerClient, GetSecretValueCommand } = await import(
    '@aws-sdk/client-secrets-manager'
  )
  const cliente = new SecretsManagerClient(regiao ? { region: regiao } : {})
  const resposta = await cliente.send(new GetSecretValueCommand({ SecretId: id }))
  if (!resposta.SecretString) {
    throw new Error(`O segredo ${id} não tem valor em texto (SecretString).`)
  }
  return resposta.SecretString
}

/** Aceita o JSON do RDS ou uma URL `postgresql://` guardada como texto. */
export function interpretarSegredo(texto: string): Credenciais {
  const limpo = texto.trim()
  if (limpo.startsWith('postgres://') || limpo.startsWith('postgresql://')) {
    const url = new URL(limpo)
    return {
      host: url.hostname,
      porta: Number(url.port || 5432),
      usuario: decodeURIComponent(url.username),
      senha: decodeURIComponent(url.password),
      banco: url.pathname.replace(/^\//, '') || 'postgres',
    }
  }

  let dados: Partial<SegredoRds>
  try {
    dados = JSON.parse(limpo)
  } catch {
    throw new Error('O segredo do banco não é JSON do RDS nem uma URL postgresql://.')
  }
  if (!dados.username || !dados.password || !dados.host) {
    throw new Error('O segredo do banco precisa ter username, password e host.')
  }
  return {
    host: dados.host,
    porta: Number(dados.port ?? 5432),
    usuario: dados.username,
    senha: dados.password,
    banco: dados.dbname ?? 'postgres',
  }
}

/** Mensagem de erro sem a senha, para log. */
export function semSenha(texto: string): string {
  return texto.replace(/(postgres(?:ql)?:\/\/[^:/@]+:)[^@]+@/g, '$1***@')
}

export interface FonteDoBanco {
  /** Para log e para a tela de status. Nunca contém senha. */
  readonly descricao: string
  configuracao(): Promise<PoolConfig>
  /** Esquece as credenciais guardadas: a próxima conexão busca de novo. */
  esquecer(): void
}

function configuracaoTls(env: Ambiente, padrao: 'desligado' | 'exigir'): PoolConfig['ssl'] {
  const modo = (env.DATABASE_SSL?.trim().toLowerCase() || padrao) as string
  if (modo === 'desligado') return undefined
  if (modo !== 'exigir') {
    throw new Error('DATABASE_SSL aceita "exigir" ou "desligado".')
  }
  const arquivoCa = env.DATABASE_SSL_CA?.trim()
  return {
    rejectUnauthorized: true,
    ...(arquivoCa ? { ca: readFileSync(arquivoCa, 'utf8') } : {}),
  }
}

/** Credenciais do Secrets Manager, com cache curto para acompanhar a rotação. */
export function fonteSecretsManager(
  id: string,
  env: Ambiente = process.env,
  ler: LerSegredo = lerSegredoDaAws,
  agora: () => number = Date.now,
): FonteDoBanco {
  const validadeMs = Number(env.DATABASE_SECRET_TTL_SEGUNDOS ?? 300) * 1000
  const regiao = env.AWS_REGION?.trim() || env.AWS_DEFAULT_REGION?.trim() || undefined
  let guardado: { credenciais: Promise<Credenciais>; ate: number } | null = null

  function credenciais(): Promise<Credenciais> {
    if (!guardado || agora() >= guardado.ate) {
      const pedido = ler(id, regiao).then(interpretarSegredo)
      guardado = { credenciais: pedido, ate: agora() + validadeMs }
      // Falha não fica em cache: a próxima tentativa pergunta de novo.
      pedido.catch(() => {
        if (guardado?.credenciais === pedido) guardado = null
      })
    }
    return guardado.credenciais
  }

  return {
    descricao: `AWS Secrets Manager (${id})`,
    async configuracao() {
      const inicial = await credenciais()
      return {
        host: inicial.host,
        port: inicial.porta,
        user: inicial.usuario,
        database: inicial.banco,
        // Função, não valor: cada conexão nova pega a senha vigente do cache.
        password: async () => (await credenciais()).senha,
        ssl: configuracaoTls(env, 'exigir'),
      }
    },
    esquecer() {
      guardado = null
    },
  }
}

export function fonteUrl(url: string, env: Ambiente = process.env): FonteDoBanco {
  return {
    descricao: `DATABASE_URL (${semSenha(url)})`,
    async configuracao() {
      return { connectionString: url, ssl: configuracaoTls(env, 'desligado') }
    },
    esquecer() {},
  }
}

/** Escolhe a fonte pelo ambiente. `null` quando não há banco configurado. */
export function fonteDoAmbiente(env: Ambiente = process.env): FonteDoBanco | null {
  const segredo = env.DATABASE_SECRET_ID?.trim()
  if (segredo) return fonteSecretsManager(segredo, env)
  const url = env.DATABASE_URL?.trim()
  if (url) return fonteUrl(url, env)
  return null
}

// --- Pool com renovação -----------------------------------------------------

const SENHA_RECUSADA = '28P01'

function senhaFoiRecusada(erro: unknown): boolean {
  return (erro as { code?: string } | null)?.code === SENHA_RECUSADA
}

/** O que o driver precisa de uma conexão: consultar e abrir transação. */
export interface Banco {
  query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    valores?: unknown[],
  ): Promise<QueryResult<R>>
  connect(): Promise<PoolClient>
  end(): Promise<void>
}

/**
 * Pool aberto sob demanda, com uma segunda chance quando a senha muda.
 * Só abre conexão quando alguém consulta: importar o módulo não toca no banco.
 */
export function bancoDe(fonte: FonteDoBanco, max = 5): Banco {
  let pool: Promise<Pool> | null = null

  function obter(): Promise<Pool> {
    pool ??= fonte.configuracao().then(
      (config) => new Pool({ ...config, max, idleTimeoutMillis: 30_000 }),
    )
    pool.catch(() => {
      pool = null
    })
    return pool
  }

  async function comSegundaChance<T>(fazer: (p: Pool) => Promise<T>): Promise<T> {
    try {
      return await fazer(await obter())
    } catch (erro) {
      if (!senhaFoiRecusada(erro)) throw erro
      // Provável rotação: esquece a senha velha e tenta uma vez com a nova.
      fonte.esquecer()
      return fazer(await obter())
    }
  }

  return {
    query: (sql, valores) => comSegundaChance((p) => p.query(sql, valores)),
    connect: () => comSegundaChance((p) => p.connect()),
    async end() {
      if (pool) await (await pool).end()
      pool = null
    },
  }
}

/** Banco já pronto a partir de um Pool (testes). */
export function bancoDoPool(pool: Pool): Banco {
  return {
    query: (sql, valores) => pool.query(sql, valores),
    connect: () => pool.connect(),
    end: () => pool.end(),
  }
}
