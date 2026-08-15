import 'server-only'
import { BASE } from '@/lib/seed'
import {
  ORDEM_ESTADOS,
  ROTULO_ESTADO,
  type CicloAvaliacao,
  type EstadoCiclo,
  type EventoAuditoria,
  type Lancamento,
} from '@/lib/calculo/tipos'

/**
 * Camada de escrita do protótipo (F2).
 *
 * A base é somente leitura e vive em memória; as alterações feitas pela
 * interface ficam neste overlay, também em memória. Consequência honesta e
 * declarada: elas se perdem quando o processo reinicia, e em ambiente
 * serverless podem nem valer entre duas requisições.
 *
 * As mesmas regras estão escritas como gatilho em `supabase/migrations/` — lá
 * a auditoria é append-only e a transição de estado é validada pelo banco. Aqui
 * elas dependem de esta camada ser o único caminho de escrita.
 */

const estadosAlterados = new Map<string, EstadoCiclo>()
const lancamentosNovos: Lancamento[] = []
const eventosNovos: EventoAuditoria[] = []
let sequencia = 0

export function ciclos(): CicloAvaliacao[] {
  return BASE.ciclos.map((ciclo) => ({
    ...ciclo,
    estado: estadosAlterados.get(ciclo.id) ?? ciclo.estado,
  }))
}

export function ciclo(id: string): CicloAvaliacao | undefined {
  return ciclos().find((c) => c.id === id)
}

export function lancamentos(): Lancamento[] {
  return [...BASE.lancamentos, ...lancamentosNovos]
}

export function eventos(): EventoAuditoria[] {
  return [...eventosNovos, ...BASE.eventos]
}

function registrar(evento: Omit<EventoAuditoria, 'id'>): void {
  eventosNovos.unshift({ id: `ev-app-${String(++sequencia).padStart(4, '0')}`, ...evento })
}

export function proximoEstado(atual: EstadoCiclo): EstadoCiclo | null {
  const indice = ORDEM_ESTADOS.indexOf(atual)
  return indice >= 0 && indice < ORDEM_ESTADOS.length - 1 ? ORDEM_ESTADOS[indice + 1] : null
}

export interface ResultadoTransicao {
  ok: boolean
  mensagem: string
}

/**
 * Avança o ciclo para o próximo estado, sempre gravando na trilha.
 * Só a CAM pode fazer isso — o perfil é conferido por quem chama.
 */
export function avancarCiclo(
  cicloId: string,
  autor: string,
  agora: string,
): ResultadoTransicao {
  const alvo = ciclo(cicloId)
  if (!alvo) return { ok: false, mensagem: 'Ciclo não encontrado.' }

  const seguinte = proximoEstado(alvo.estado)
  if (!seguinte) {
    return { ok: false, mensagem: `O ciclo já está em ${ROTULO_ESTADO[alvo.estado]}.` }
  }

  estadosAlterados.set(cicloId, seguinte)
  registrar({
    quando: agora,
    autor,
    perfil: 'cam',
    tipo: 'ciclo_estado_alterado',
    entidade: cicloId,
    descricao: `Ciclo ${alvo.competencia}: ${ROTULO_ESTADO[alvo.estado]} → ${ROTULO_ESTADO[seguinte]}.`,
    antes: { estado: alvo.estado },
    depois: { estado: seguinte },
  })

  return { ok: true, mensagem: `Ciclo avançado para ${ROTULO_ESTADO[seguinte]}.` }
}

export function registrarLancamento(
  lancamento: Omit<Lancamento, 'id'>,
  agora: string,
): ResultadoTransicao {
  const cicloAlvo = ciclo(lancamento.cicloId)
  if (!cicloAlvo) return { ok: false, mensagem: 'Ciclo não encontrado.' }
  if (cicloAlvo.estado !== 'lancamento_aberto') {
    return {
      ok: false,
      mensagem: `A janela de lançamento deste ciclo está ${ROTULO_ESTADO[cicloAlvo.estado].toLowerCase()}.`,
    }
  }

  const anterior = lancamentos().find(
    (l) => l.cicloId === lancamento.cicloId && l.indicadorId === lancamento.indicadorId,
  )

  const novo: Lancamento = {
    ...lancamento,
    id: `lanc-app-${String(++sequencia).padStart(4, '0')}`,
  }
  lancamentosNovos.push(novo)

  registrar({
    quando: agora,
    autor: lancamento.autor,
    perfil: 'area_tecnica',
    tipo: anterior ? 'lancamento_alterado' : 'lancamento_registrado',
    entidade: novo.id,
    descricao: `${anterior ? 'Correção' : 'Lançamento'} de ${lancamento.indicadorId} no ciclo ${lancamento.cicloId}.`,
    antes: anterior ? { valor: anterior.valor, status: anterior.status } : null,
    depois: { valor: novo.valor, status: novo.status },
  })

  return {
    ok: true,
    mensagem: anterior
      ? 'Lançamento corrigido. O valor anterior continua na trilha de auditoria.'
      : 'Lançamento registrado.',
  }
}

/** Lançamento vigente de um indicador num ciclo: o último registrado vence. */
export function lancamentoVigente(cicloId: string, indicadorId: string): Lancamento | undefined {
  return [...lancamentos()]
    .reverse()
    .find((l) => l.cicloId === cicloId && l.indicadorId === indicadorId)
}
