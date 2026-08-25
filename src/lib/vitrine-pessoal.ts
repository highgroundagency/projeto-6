import type { Ambiente } from '@/lib/ambiente'
import { senhaConfere } from '@/lib/admin/senha'
import { assinarToken, verificarToken } from '@/lib/admin/sessao'

/**
 * O link da vitrine pessoal.
 *
 * O painel administrativo continua sendo o lugar de OPERAR o site. Mas o uso
 * mais frequente de quem opera não é operar: é só olhar o projeto completo,
 * como ele estará depois da entrega final. Para isso, senha e painel são
 * atrito puro.
 *
 * Este módulo troca esse atrito por uma URL-capacidade: quem visita
 * `/vitrine/<chave>` com a chave certa ganha um cookie assinado e passa a ver
 * o site inteiro com a data simulada da vitrine (2027, semestre encerrado),
 * como se a janela da ADR-021 estivesse aberta SÓ para ele. Sem painel, sem
 * faixa de admin, sem botão de avançar ciclo: é visão, não operação.
 *
 * A chave mora em `CHAVE_VITRINE`, fora do código, porque o repositório é
 * público: uma chave versionada seria um link público com outro nome. Sem a
 * variável (ou com valor curto demais), a rota falha fechada e responde 404,
 * o mesmo 404 de chave errada: da porta, "não configurado", "não existe" e
 * "chave errada" são indistinguíveis, pela mesma razão do §6.2.
 */

export const NOME_COOKIE_VITRINE = 'prumo_vitrine'

/** Cobre o resto do semestre e a banca de janeiro sem renovar o link. */
export const DURACAO_VITRINE_DIAS = 150

/** Chaves curtas são adivinháveis por força bruta; melhor nenhuma que uma fraca. */
const TAMANHO_MINIMO_CHAVE = 16

const VERSAO_PAYLOAD = 1

interface PayloadVitrine {
  v: number
  uso: 'vitrine'
  iat: number
  exp: number
}

/**
 * SEPARAÇÃO DE DOMÍNIO: o token da vitrine NÃO pode valer como sessão de admin.
 *
 * Os dois cookies são assinados a partir do mesmo `ADMIN_COOKIE_SECRET`, e o
 * payload da sessão só exige `v` e `exp` — campos que a vitrine também tem. Sem
 * isto, copiar o valor de `prumo_vitrine` para `prumo_admin` viraria uma sessão
 * administrativa válida, e o link que promete "visão, não operação" entregaria
 * o painel inteiro. Derivar um segredo próprio corta a confusão pela raiz:
 * assinatura de um domínio nunca confere no outro, em nenhuma direção.
 */
function segredoDaVitrine(segredo: string): string {
  return `${segredo}::vitrine-pessoal`
}

/** A chave configurada, ou `null` quando ausente ou fraca (falha fechado). */
export function chaveVitrineEsperada(env: Ambiente = process.env): string | null {
  const chave = env.CHAVE_VITRINE?.trim()
  if (!chave || chave.length < TAMANHO_MINIMO_CHAVE) return null
  return chave
}

/**
 * Compara a chave informada com a esperada.
 *
 * Reusa a conferência da senha do painel: HMAC dos dois lados e comparação em
 * tempo constante, para nem o conteúdo nem o comprimento da chave certa
 * vazarem pelo tempo de resposta. O sal é próprio para este uso.
 */
export async function chaveVitrineConfere(
  informada: string,
  esperada: string,
): Promise<boolean> {
  return senhaConfere(informada, esperada, 'prumo-conferencia-de-chave-vitrine')
}

export async function criarTokenVitrine(
  segredo: string,
  agora: Date = new Date(),
): Promise<string> {
  const emitidoEm = Math.floor(agora.getTime() / 1000)
  const payload: PayloadVitrine = {
    v: VERSAO_PAYLOAD,
    uso: 'vitrine',
    iat: emitidoEm,
    exp: emitidoEm + DURACAO_VITRINE_DIAS * 24 * 60 * 60,
  }
  return assinarToken(payload, segredoDaVitrine(segredo))
}

/** true somente se a assinatura confere, a versão bate e o cookie não expirou. */
export async function vitrineValida(
  token: string | undefined | null,
  segredo: string,
  agora: Date = new Date(),
): Promise<boolean> {
  const payload = await verificarToken<PayloadVitrine>(token, segredoDaVitrine(segredo))
  if (!payload) return false
  if (payload.v !== VERSAO_PAYLOAD) return false
  if (payload.uso !== 'vitrine') return false
  if (typeof payload.exp !== 'number') return false
  return payload.exp > Math.floor(agora.getTime() / 1000)
}

/** Mesmos atributos do cookie de sessão do painel, com validade própria. */
export function opcoesCookieVitrine(producao = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACAO_VITRINE_DIAS * 24 * 60 * 60,
  }
}
