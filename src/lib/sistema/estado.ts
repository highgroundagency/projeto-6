import 'server-only'
import { BASE } from '@/lib/seed'
import { calcularAvaliacao, calcularAvaliacaoDistrital } from '@/lib/calculo/motor'
import {
  ORDEM_ESTADOS,
  ROTULO_ESTADO,
  type Avaliacao,
  type AvaliacaoDistrital,
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
const avaliacoesNovas: Avaliacao[] = []
const avaliacoesDistritaisNovas: AvaliacaoDistrital[] = []
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

/**
 * A porta de escrita da trilha para as outras camadas do overlay.
 *
 * Existe para a contestação entrar na trilha como tudo o mais: caminho de
 * escrita que não passa pela trilha é exatamente o buraco que o produto
 * critica na planilha.
 */
export function registrarEvento(evento: Omit<EventoAuditoria, 'id'>): void {
  registrar(evento)
}

/** Avaliações calculadas pela interface (ciclos homologados no overlay). */
export function avaliacoes(): Avaliacao[] {
  return [...BASE.avaliacoes, ...avaliacoesNovas]
}

export function avaliacoesDistritais(): AvaliacaoDistrital[] {
  return [...BASE.avaliacoesDistritais, ...avaliacoesDistritaisNovas]
}

/**
 * Homologar é fazer a conta: ao chegar em 'homologado', o ciclo ganha as
 * avaliações de todas as unidades e as distritais, sobre os lançamentos
 * vigentes daquele momento. Sem isto, avançar o ciclo aberto numa
 * demonstração produzia um mês "fechado" sem nota nenhuma.
 */
function calcularAvaliacoesDoCiclo(cicloId: string, agora: string, autor: string): void {
  const jaTem =
    BASE.avaliacoes.some((a) => a.cicloId === cicloId) ||
    avaliacoesNovas.some((a) => a.cicloId === cicloId)
  if (jaTem) return

  const alvo = ciclo(cicloId)
  const regra = BASE.regras.find((r) => r.id === alvo?.regraId)
  if (!alvo || !regra) return

  const todosLancamentos = lancamentos()
  const doCiclo = BASE.unidades.map((unidade) =>
    calcularAvaliacao({
      unidade,
      cicloId,
      indicadores: BASE.indicadores,
      subindicadores: BASE.subindicadores,
      lancamentos: todosLancamentos,
      regra,
    }),
  )
  avaliacoesNovas.push(...doCiclo)

  for (const distrito of BASE.distritos) {
    const unidadesDoDistrito = new Set(
      BASE.unidades.filter((u) => u.distritoId === distrito.id).map((u) => u.id),
    )
    avaliacoesDistritaisNovas.push(
      calcularAvaliacaoDistrital({
        distritoId: distrito.id,
        cicloId,
        avaliacoesDasUnidades: doCiclo.filter((a) => unidadesDoDistrito.has(a.unidadeId)),
        regra,
      }),
    )
  }

  registrar({
    quando: agora,
    autor,
    perfil: 'seab',
    tipo: 'avaliacao_calculada',
    entidade: cicloId,
    descricao: `Avaliações do ciclo ${alvo.competencia} calculadas: ${doCiclo.length} unidades e ${BASE.distritos.length} distritos.`,
    antes: null,
    depois: { unidades: doCiclo.length, distritos: BASE.distritos.length },
  })
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
 * Só a SEAB pode fazer isso — o perfil é conferido por quem chama.
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
    perfil: 'seab',
    tipo: 'ciclo_estado_alterado',
    entidade: cicloId,
    descricao: `Ciclo ${alvo.competencia}: ${ROTULO_ESTADO[alvo.estado]} → ${ROTULO_ESTADO[seguinte]}.`,
    antes: { estado: alvo.estado },
    depois: { estado: seguinte },
  })

  if (seguinte === 'homologado') calcularAvaliacoesDoCiclo(cicloId, agora, autor)

  return { ok: true, mensagem: `Ciclo avançado para ${ROTULO_ESTADO[seguinte]}.` }
}

export function registrarLancamento(
  lancamento: Omit<Lancamento, 'id'>,
  agora: string,
  perfil = 'gerente_unidade',
): ResultadoTransicao {
  const cicloAlvo = ciclo(lancamento.cicloId)
  if (!cicloAlvo) return { ok: false, mensagem: 'Ciclo não encontrado.' }
  if (cicloAlvo.estado !== 'lancamento_aberto') {
    return {
      ok: false,
      mensagem: `A janela de lançamento deste ciclo está ${ROTULO_ESTADO[cicloAlvo.estado].toLowerCase()}.`,
    }
  }

  // O que não vale para o tipo da unidade não entra: a régua da regra do
  // ciclo decide, também no caminho de escrita.
  const subindicador = BASE.subindicadores.find((s) => s.id === lancamento.subindicadorId)
  const unidade = BASE.unidades.find((u) => u.id === lancamento.unidadeId)
  const regra = BASE.regras.find((r) => r.id === cicloAlvo.regraId)
  const aplicavel =
    subindicador &&
    unidade &&
    regra?.aplicabilidades.some(
      (a) => a.tipoUnidadeId === unidade.tipoId && a.indicadorId === subindicador.indicadorId,
    )
  if (!aplicavel) {
    return {
      ok: false,
      mensagem: 'Este indicador não vale para o tipo desta unidade na regra deste ciclo.',
    }
  }

  // O "antes" do diff é o lançamento VIGENTE, não o primeiro da lista: numa
  // segunda correção, comparar com o original mentiria sobre o que mudou.
  const anterior = lancamentoVigente(
    lancamento.cicloId,
    lancamento.subindicadorId,
    lancamento.unidadeId,
  )

  const novo: Lancamento = {
    ...lancamento,
    id: `lanc-app-${String(++sequencia).padStart(4, '0')}`,
  }
  lancamentosNovos.push(novo)

  registrar({
    quando: agora,
    autor: lancamento.autor,
    perfil,
    tipo: anterior ? 'lancamento_alterado' : 'lancamento_registrado',
    entidade: novo.id,
    descricao: `${anterior ? 'Correção' : 'Lançamento'} de ${lancamento.subindicadorId} pela ${lancamento.unidadeId} no ciclo ${lancamento.cicloId}.`,
    antes: anterior
      ? {
          valor: anterior.valor,
          numerador: anterior.numerador,
          denominador: anterior.denominador,
          status: anterior.status,
        }
      : null,
    depois: {
      valor: novo.valor,
      numerador: novo.numerador,
      denominador: novo.denominador,
      status: novo.status,
    },
  })

  return {
    ok: true,
    mensagem: anterior
      ? 'Lançamento corrigido. O valor anterior continua na trilha de auditoria.'
      : 'Lançamento registrado.',
  }
}

/** Lançamento vigente de um subindicador numa unidade: o último registrado vence. */
export function lancamentoVigente(
  cicloId: string,
  subindicadorId: string,
  unidadeId: string,
): Lancamento | undefined {
  return [...lancamentos()]
    .reverse()
    .find(
      (l) =>
        l.cicloId === cicloId &&
        l.subindicadorId === subindicadorId &&
        l.unidadeId === unidadeId,
    )
}
