import type { PerfilId } from '@/lib/features'
import type { Banco } from '@/lib/dados/postgres/conexao'
import {
  cifrarSessao,
  decifrarSessao,
  gerarHashDeSenha,
  hashParaUsuarioInexistente,
  problemaNaSenha,
  senhaConfereComHash,
  type CustoScrypt,
} from './cripto'

/**
 * Contas, login e sessão do /sistema.
 *
 * Sem `server-only` de propósito: o script de contas (`scripts/usuarios.ts`)
 * usa as mesmas funções pela linha de comando. Nada aqui é importado por
 * componente de cliente.
 */

export const NOME_COOKIE_SESSAO_SISTEMA = 'prumo_sessao'
/** Um expediente. Passou disso, entra de novo. */
export const DURACAO_SESSAO_SEGUNDOS = 8 * 60 * 60
export const MAX_FALHAS_SEGUIDAS = 5
export const MINUTOS_DE_BLOQUEIO = 15

export interface Usuario {
  id: string
  login: string
  perfil: PerfilId
  gerenteId: string | null
  unidadeId: string | null
  distritoId: string | null
  versaoSessao: number
}

interface ConteudoDaSessao {
  /** id do usuário */
  u: string
  /** versão da sessão no momento do login */
  s: number
  /** expira em (epoch, segundos) */
  exp: number
}

/* eslint-disable @typescript-eslint/no-explicit-any -- linha crua do `pg` */
function deLinha(l: any): Usuario {
  return {
    id: l.id,
    login: l.login,
    perfil: l.perfil,
    gerenteId: l.gerente_id,
    // O distrito de um gerente de unidade vem da própria unidade.
    unidadeId: l.unidade_id ?? null,
    distritoId: l.distrito_id ?? l.distrito_da_unidade ?? null,
    versaoSessao: l.versao_sessao,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const SELECIONAR_USUARIO = `
  select u.id, u.login, u.perfil, u.gerente_id, u.versao_sessao, u.ativo,
         u.senha_hash, u.falhas_seguidas,
         (u.bloqueado_ate is not null and u.bloqueado_ate > now()) as bloqueado,
         g.unidade_id, g.distrito_id, un.distrito_id as distrito_da_unidade
  from usuarios u
  left join gerentes g on g.id = u.gerente_id
  left join unidades un on un.id = g.unidade_id
`

export type ResultadoLogin =
  | { ok: true; usuario: Usuario }
  | { ok: false; motivo: 'credenciais' | 'bloqueado' }

/**
 * Confere login e senha.
 *
 * A resposta para quem chama é sempre a mesma em caso de falha (a rota mostra
 * "não foi possível entrar"), e o TEMPO também: login inexistente, conta
 * bloqueada ou desativada passam pela mesma conferência de scrypt que uma
 * senha errada. Assim nem a mensagem nem o relógio contam quais logins existem.
 */
export async function autenticar(
  banco: Banco,
  login: string,
  senha: string,
): Promise<ResultadoLogin> {
  const cliente = await banco.connect()
  try {
    await cliente.query('begin')
    // `for update`: duas tentativas simultâneas não contam a mesma falha uma vez só.
    const { rows } = await cliente.query(`${SELECIONAR_USUARIO} where u.login = $1 for update of u`, [
      login.trim().toLowerCase(),
    ])
    const linha = rows[0]

    if (!linha || !linha.ativo || linha.bloqueado) {
      await senhaConfereComHash(senha, await hashParaUsuarioInexistente())
      await cliente.query('commit')
      return { ok: false, motivo: linha?.bloqueado ? 'bloqueado' : 'credenciais' }
    }

    if (!(await senhaConfereComHash(senha, linha.senha_hash))) {
      await cliente.query(
        `update usuarios set
           falhas_seguidas = case when falhas_seguidas + 1 >= $2 then 0 else falhas_seguidas + 1 end,
           bloqueado_ate = case when falhas_seguidas + 1 >= $2
                                then now() + make_interval(mins => $3) else bloqueado_ate end
         where id = $1`,
        [linha.id, MAX_FALHAS_SEGUIDAS, MINUTOS_DE_BLOQUEIO],
      )
      await cliente.query('commit')
      return { ok: false, motivo: 'credenciais' }
    }

    await cliente.query(
      `update usuarios set falhas_seguidas = 0, bloqueado_ate = null, ultimo_acesso_em = now()
       where id = $1`,
      [linha.id],
    )
    await cliente.query('commit')
    return { ok: true, usuario: deLinha(linha) }
  } catch (erro) {
    await cliente.query('rollback').catch(() => {})
    throw erro
  } finally {
    cliente.release()
  }
}

/** O cookie de sessão: AES-256-GCM sobre id, versão e validade. */
export function emitirSessao(usuario: Usuario, chave: Buffer, agoraSegundos: number): string {
  const conteudo: ConteudoDaSessao = {
    u: usuario.id,
    s: usuario.versaoSessao,
    exp: agoraSegundos + DURACAO_SESSAO_SEGUNDOS,
  }
  return cifrarSessao(conteudo, chave)
}

/**
 * Quem é o dono deste cookie, conferido no banco a cada requisição.
 *
 * O cookie sozinho não basta: a conta pode ter sido desativada ou ter trocado
 * de senha depois do login. Por isso a versão da sessão é comparada com a do
 * banco, e o perfil e o vínculo vêm do banco, não do cookie.
 */
export async function usuarioDaSessao(
  banco: Banco,
  token: string | null | undefined,
  chave: Buffer,
  agoraSegundos: number,
): Promise<Usuario | null> {
  const conteudo = decifrarSessao<ConteudoDaSessao>(token, chave)
  if (!conteudo || typeof conteudo.u !== 'string' || typeof conteudo.exp !== 'number') return null
  if (conteudo.exp <= agoraSegundos) return null

  const { rows } = await banco.query(`${SELECIONAR_USUARIO} where u.id = $1`, [conteudo.u])
  const linha = rows[0]
  if (!linha || !linha.ativo || linha.versao_sessao !== conteudo.s) return null
  return deLinha(linha)
}

// --- Administração das contas (script de linha de comando) -----------------

export interface NovaConta {
  login: string
  senha: string
  perfil: PerfilId
  gerenteId?: string | null
}

export async function criarConta(
  banco: Banco,
  conta: NovaConta,
  custo?: CustoScrypt,
): Promise<Usuario> {
  const problema = problemaNaSenha(conta.senha)
  if (problema) throw new Error(problema)
  const hash = await gerarHashDeSenha(conta.senha, custo)
  const { rows } = await banco.query(
    `insert into usuarios (login, senha_hash, perfil, gerente_id) values ($1, $2, $3, $4)
     returning id`,
    [conta.login.trim().toLowerCase(), hash, conta.perfil, conta.gerenteId ?? null],
  )
  const { rows: completa } = await banco.query(`${SELECIONAR_USUARIO} where u.id = $1`, [
    rows[0].id,
  ])
  return deLinha(completa[0])
}

/** Troca a senha e derruba as sessões abertas com a senha antiga. */
export async function trocarSenha(
  banco: Banco,
  login: string,
  senhaNova: string,
  custo?: CustoScrypt,
): Promise<boolean> {
  const problema = problemaNaSenha(senhaNova)
  if (problema) throw new Error(problema)
  const hash = await gerarHashDeSenha(senhaNova, custo)
  const { rowCount } = await banco.query(
    `update usuarios set senha_hash = $2, versao_sessao = versao_sessao + 1,
       senha_trocada_em = now(), falhas_seguidas = 0, bloqueado_ate = null
     where login = $1`,
    [login.trim().toLowerCase(), hash],
  )
  return (rowCount ?? 0) > 0
}

/** Desativa (não apaga): a conta para de entrar e as sessões caem na hora. */
export async function definirAtiva(banco: Banco, login: string, ativa: boolean): Promise<boolean> {
  const { rowCount } = await banco.query(
    `update usuarios set ativo = $2, versao_sessao = versao_sessao + 1 where login = $1`,
    [login.trim().toLowerCase(), ativa],
  )
  return (rowCount ?? 0) > 0
}

export interface ContaListada {
  login: string
  perfil: string
  gerenteId: string | null
  ativo: boolean
  bloqueado: boolean
  ultimoAcesso: string | null
}

export async function listarContas(banco: Banco): Promise<ContaListada[]> {
  const { rows } = await banco.query(
    `select login, perfil, gerente_id, ativo,
            (bloqueado_ate is not null and bloqueado_ate > now()) as bloqueado,
            to_char(ultimo_acesso_em at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI"Z"') as ultimo
     from usuarios order by login`,
  )
  return rows.map((l) => ({
    login: l.login,
    perfil: l.perfil,
    gerenteId: l.gerente_id,
    ativo: l.ativo,
    bloqueado: l.bloqueado,
    ultimoAcesso: l.ultimo,
  }))
}
