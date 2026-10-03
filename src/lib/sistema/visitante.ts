import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { obterSegredo } from '@/lib/admin/sessao'
import { novaSessao, type Operacao, type Sessao } from './estado'

/**
 * O que um visitante escreveu no protótipo: o DIÁRIO, num cookie do próprio
 * navegador (ver `estado.ts`).
 *
 * Existe para cada visitante lançar numa CÓPIA PRÓPRIA do estado. Até o SR1 a
 * escrita era uma só para todo mundo; de 25/09 a 03/10 a cópia ficava na memória
 * do servidor, achada por um id aleatório neste cookie, e na Vercel a página
 * não enxergava o que a rota tinha gravado (ADR-048). Agora o cookie leva o
 * próprio diário, e qualquer instância refaz a mesma cópia a partir dele.
 *
 * ASSINADO, com HMAC-SHA256 e o segredo do painel em chave própria
 * (`:diario`), para que um token de um não sirva no lugar do outro. Quem edita
 * o cookie à mão perde a assinatura e volta para a base pura: ninguém escreve
 * no protótipo pulando a rota, que é onde ficam o perfil e a sessão de admin.
 * O diário não leva dado de ninguém: só ids da base de teste, números, horas e
 * o texto que o próprio visitante digitou.
 *
 * COMPACTADO (deflate) e com TETO: navegadores guardam cerca de 4 KB por
 * cookie. A demonstração inteira do SR1 usa menos de um quarto disso. Quando o
 * diário não cabe mais, a escrita é recusada com aviso, nunca perdida calada.
 *
 * Sem `maxAge`: é cookie de sessão do navegador. A cópia some quando ele fecha.
 */
export const NOME_COOKIE_DIARIO = 'prumo_diario'

/** Teto do valor do cookie, em caracteres. O limite dos navegadores é ~4096 com nome e atributos. */
export const LIMITE_DO_COOKIE = 3800

export const MENSAGEM_DIARIO_CHEIO =
  'Esta sessão de teste chegou ao limite do que cabe no navegador. Feche o navegador e abra de novo para começar outra.'

/** Muda quando o formato do diário mudar: diário de formato antigo vira base pura. */
const VERSAO_DO_DIARIO = 1

/** Teto do JSON descompactado: cookie de 4 KB não justifica mais que isso. */
const LIMITE_DESCOMPACTADO = 64 * 1024

const texto = (maximo: number) => z.string().max(maximo)
const numero = z.number().nullable()

const operacaoSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('avancar'),
    cicloId: texto(80),
    autor: texto(120),
    agora: texto(40),
  }),
  z.object({
    tipo: z.literal('lancar'),
    lancamento: z.object({
      subindicadorId: texto(80),
      unidadeId: texto(80),
      cicloId: texto(80),
      valor: numero,
      numerador: numero,
      denominador: numero,
      evidencia: texto(300),
      autor: texto(120),
      registradoEm: texto(40),
      status: z.enum(['rascunho', 'enviado', 'validado', 'rejeitado']),
    }),
    agora: texto(40),
    perfil: texto(40),
  }),
  z.object({
    tipo: z.literal('contestar'),
    dados: z.object({
      gerenteId: texto(80),
      cicloId: texto(80),
      indicadorId: texto(80).nullable(),
      motivo: texto(1000),
      abertaEm: texto(40),
    }),
    perfil: texto(40),
  }),
])

const diarioSchema = z.object({
  v: z.literal(VERSAO_DO_DIARIO),
  d: z.array(operacaoSchema).max(500),
})

/** O segredo do diário, separado do da sessão de admin. `null` se não há segredo. */
function segredoDoDiario(): string | null {
  try {
    return `${obterSegredo()}:diario`
  } catch {
    return null
  }
}

function assinar(corpo: string, segredo: string): Buffer {
  return createHmac('sha256', segredo).update(corpo).digest()
}

/** O diário como valor de cookie: `base64url(deflate(json)).base64url(hmac)`. */
export function codificarDiario(
  diario: readonly Operacao[],
  segredo: string | null = segredoDoDiario(),
): string | null {
  if (!segredo) return null
  const json = JSON.stringify({ v: VERSAO_DO_DIARIO, d: diario })
  const corpo = deflateRawSync(Buffer.from(json, 'utf8')).toString('base64url')
  return `${corpo}.${assinar(corpo, segredo).toString('base64url')}`
}

/**
 * O diário de volta, ou `null` se qualquer coisa estiver errada: assinatura,
 * compactação, formato ou versão. Nunca lança: entrada hostil é esperada aqui.
 */
export function decodificarDiario(
  valor: string | null | undefined,
  segredo: string | null = segredoDoDiario(),
): Operacao[] | null {
  if (!valor || !segredo) return null
  const partes = valor.split('.')
  if (partes.length !== 2) return null
  const [corpo, assinatura] = partes
  try {
    const esperada = assinar(corpo, segredo)
    const recebida = Buffer.from(assinatura, 'base64url')
    if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) return null
    const json = inflateRawSync(Buffer.from(corpo, 'base64url'), {
      maxOutputLength: LIMITE_DESCOMPACTADO,
    }).toString('utf8')
    const analisado = diarioSchema.safeParse(JSON.parse(json))
    return analisado.success ? analisado.data.d : null
  } catch {
    return null
  }
}

export function opcoesCookieDiario(producao = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: producao,
    sameSite: 'lax' as const,
    path: '/',
  }
}

/** A sessão desta requisição: o diário do cookie, ou um diário vazio. */
export async function sessaoAtual(): Promise<Sessao> {
  const armazem = await cookies()
  return novaSessao(decodificarDiario(armazem.get(NOME_COOKIE_DIARIO)?.value) ?? [])
}

/**
 * Grava o diário no cookie. Devolve `false`, sem gravar, se ele não cabe mais.
 *
 * SÓ EM ROUTE HANDLER (ou server action): é o único lugar em que o Next deixa
 * gravar cookie. Quem lê depois, na mesma requisição, já enxerga o valor novo.
 */
export async function gravarSessao(sessao: Sessao): Promise<boolean> {
  const valor = codificarDiario(sessao.diario)
  if (!valor || valor.length > LIMITE_DO_COOKIE) return false
  const armazem = await cookies()
  armazem.set(NOME_COOKIE_DIARIO, valor, opcoesCookieDiario())
  return true
}
