/**
 * Rate limit da tela de login (§7.1): 5 tentativas por 10 minutos, por IP.
 *
 * LIMITAÇÃO DECLARADA: em serverless a memória do processo é volátil e há
 * várias instâncias — um atacante distribuído pode ganhar tentativas extras a
 * cada instância fria. Isto é *best-effort* e continua assim: sem banco, não há
 * onde guardar o contador. Está registrado em docs/seguranca.md, não escondido.
 */

export const MAX_TENTATIVAS = 5
export const JANELA_MS = 10 * 60 * 1000

interface Registro {
  tentativas: number[]
}

const memoria = new Map<string, Registro>()

export interface ResultadoLimite {
  permitido: boolean
  restantes: number
  /** Segundos até liberar de novo, quando bloqueado. */
  esperarSegundos: number
}

export function verificarLimite(
  chave: string,
  agora = Date.now(),
  armazem = memoria,
): ResultadoLimite {
  const registro = armazem.get(chave) ?? { tentativas: [] }
  const recentes = registro.tentativas.filter((t) => agora - t < JANELA_MS)

  if (recentes.length >= MAX_TENTATIVAS) {
    const maisAntiga = Math.min(...recentes)
    return {
      permitido: false,
      restantes: 0,
      esperarSegundos: Math.ceil((JANELA_MS - (agora - maisAntiga)) / 1000),
    }
  }

  return {
    permitido: true,
    restantes: MAX_TENTATIVAS - recentes.length - 1,
    esperarSegundos: 0,
  }
}

/** Registra uma tentativa falha. Acerto limpa o contador. */
export function registrarTentativa(
  chave: string,
  agora = Date.now(),
  armazem = memoria,
): void {
  const registro = armazem.get(chave) ?? { tentativas: [] }
  const recentes = registro.tentativas.filter((t) => agora - t < JANELA_MS)
  recentes.push(agora)
  armazem.set(chave, { tentativas: recentes })
}

export function limparTentativas(chave: string, armazem = memoria): void {
  armazem.delete(chave)
}

export function criarArmazem(): Map<string, Registro> {
  return new Map<string, Registro>()
}

/**
 * IP do cliente conforme os cabeçalhos da Vercel. Cai em 'desconhecido' quando
 * não há proxy — o que na prática agrupa todo mundo no mesmo balde em dev.
 */
export function ipDaRequisicao(headers: Headers): string {
  const encaminhado = headers.get('x-forwarded-for')
  if (encaminhado) return encaminhado.split(',')[0].trim()
  return headers.get('x-real-ip')?.trim() || 'desconhecido'
}
