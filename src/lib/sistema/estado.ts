import 'server-only'
import { BASE } from '@/lib/seed'
import { calcularAvaliacao, calcularAvaliacaoDistrital } from '@/lib/calculo/motor'
import {
  ORDEM_ESTADOS,
  ROTULO_ESTADO,
  type Avaliacao,
  type AvaliacaoDistrital,
  type CicloAvaliacao,
  type Contestacao,
  type EstadoCiclo,
  type EventoAuditoria,
  type Lancamento,
} from '@/lib/calculo/tipos'

/**
 * Camada de escrita do protótipo (F2): UMA CÓPIA POR VISITANTE.
 *
 * A base é somente leitura e vive em memória. O que a interface escreve
 * (lançamento, avanço de etapa, contestação, e o histórico de tudo isso) fica
 * numa cópia em memória que pertence a quem escreveu, achada pelo id aleatório
 * do cookie de `visitante.ts`.
 *
 * Até o SR1 a cópia era uma só, no nível do módulo, e valia para todo mundo: o
 * lançamento de um avaliador aparecia na tela do outro, e um avanço de etapa
 * mudava a demonstração de todos. Agora dois visitantes não se enxergam, e o
 * avanço que o admin faz ao vivo fica na cópia dele.
 *
 * Consequências declaradas, e ditas também na tela:
 *
 * - A cópia some quando o processo reinicia. Em ambiente serverless ela pode
 *   nem valer entre duas requisições que caiam em instâncias diferentes.
 * - A memória tem teto: no máximo `LIMITE_DE_VISITANTES` cópias, e quando
 *   chega uma nova, sai a usada há mais tempo; e no máximo
 *   `LIMITE_DE_REGISTROS` registros no histórico de cada cópia.
 * - Quem ainda não escreveu nada não tem cópia: lê a base pura, e ler não cria
 *   cópia nenhuma. Só a escrita ocupa memória.
 *
 * As mesmas regras estão escritas como gatilho em `supabase/migrations/`: lá a
 * auditoria é append-only e a transição de estado é validada pelo banco. Aqui
 * elas dependem de esta camada ser o único caminho de escrita.
 */

/** Quantas cópias cabem na memória ao mesmo tempo. */
export const LIMITE_DE_VISITANTES = 100

/** Quantos registros novos de histórico cada cópia aceita. */
export const LIMITE_DE_REGISTROS = 200

interface Copia {
  readonly estadosAlterados: Map<string, EstadoCiclo>
  readonly lancamentosNovos: Lancamento[]
  readonly eventosNovos: EventoAuditoria[]
  readonly avaliacoesNovas: Avaliacao[]
  readonly avaliacoesDistritaisNovas: AvaliacaoDistrital[]
  readonly contestacoesNovas: Contestacao[]
  sequencia: number
}

/**
 * As cópias, na ordem de uso: a primeira chave é a usada há mais tempo.
 *
 * `Map` guarda a ordem de inserção, então "usar" é tirar e pôr de volta no
 * fim, e "descartar a mais antiga" é apagar a primeira chave.
 */
const copias = new Map<string, Copia>()

function copiaVazia(): Copia {
  return {
    estadosAlterados: new Map(),
    lancamentosNovos: [],
    eventosNovos: [],
    avaliacoesNovas: [],
    avaliacoesDistritaisNovas: [],
    contestacoesNovas: [],
    sequencia: 0,
  }
}

function usar(visitante: string, copia: Copia): Copia {
  copias.delete(visitante)
  copias.set(visitante, copia)
  return copia
}

/** A cópia de quem lê, ou uma vazia. Ler NÃO cria cópia. */
function copiaParaLer(visitante: string | null): Copia {
  const copia = visitante ? copias.get(visitante) : undefined
  return copia && visitante ? usar(visitante, copia) : copiaVazia()
}

/** A cópia de quem escreve, criada se preciso, abrindo espaço se a memória encheu. */
function copiaParaEscrever(visitante: string): Copia {
  const existente = copias.get(visitante)
  if (existente) return usar(visitante, existente)

  while (copias.size >= LIMITE_DE_VISITANTES) {
    const maisAntiga = copias.keys().next().value
    if (maisAntiga === undefined) break
    copias.delete(maisAntiga)
  }
  const nova = copiaVazia()
  copias.set(visitante, nova)
  return nova
}

/** Quantas cópias estão na memória agora. */
export function visitantesEmMemoria(): number {
  return copias.size
}

export interface ResultadoTransicao {
  ok: boolean
  mensagem: string
}

const SEM_VISITANTE: ResultadoTransicao = {
  ok: false,
  mensagem: 'Não achamos a sua sessão de teste. Recarregue a página e tente de novo.',
}

function semEspaco(copia: Copia): ResultadoTransicao | null {
  if (copia.eventosNovos.length < LIMITE_DE_REGISTROS) return null
  return {
    ok: false,
    mensagem: `Esta sessão de teste chegou ao limite de ${LIMITE_DE_REGISTROS} registros. Feche o navegador e abra de novo para começar outra.`,
  }
}

function proximoId(copia: Copia, prefixo: string): string {
  return `${prefixo}-app-${String(++copia.sequencia).padStart(4, '0')}`
}

function registrar(copia: Copia, evento: Omit<EventoAuditoria, 'id'>): void {
  copia.eventosNovos.unshift({ id: proximoId(copia, 'ev'), ...evento })
}

export function proximoEstado(atual: EstadoCiclo): EstadoCiclo | null {
  const indice = ORDEM_ESTADOS.indexOf(atual)
  return indice >= 0 && indice < ORDEM_ESTADOS.length - 1 ? ORDEM_ESTADOS[indice + 1] : null
}

/** O que um visitante enxerga e pode escrever. */
export interface EstadoDoVisitante {
  ciclos(): CicloAvaliacao[]
  ciclo(id: string): CicloAvaliacao | undefined
  lancamentos(): Lancamento[]
  eventos(): EventoAuditoria[]
  avaliacoes(): Avaliacao[]
  avaliacoesDistritais(): AvaliacaoDistrital[]
  contestacoes(): Contestacao[]
  lancamentoVigente(
    cicloId: string,
    subindicadorId: string,
    unidadeId: string,
  ): Lancamento | undefined
  avancarCiclo(cicloId: string, autor: string, agora: string): ResultadoTransicao
  registrarLancamento(
    lancamento: Omit<Lancamento, 'id'>,
    agora: string,
    perfil?: string,
  ): ResultadoTransicao
  abrirContestacao(
    dados: Omit<Contestacao, 'id' | 'status' | 'resposta'>,
    perfil?: string,
  ): ResultadoTransicao
}

/**
 * A base somada à cópia de UM visitante.
 *
 * `null` é quem ainda não tem cookie: enxerga a base pura e não escreve. As
 * rotas de escrita garantem o cookie antes de chamar (`garantirVisitante`).
 */
export function estadoDo(visitante: string | null): EstadoDoVisitante {
  const ciclos = (): CicloAvaliacao[] => {
    const { estadosAlterados } = copiaParaLer(visitante)
    return BASE.ciclos.map((ciclo) => ({
      ...ciclo,
      estado: estadosAlterados.get(ciclo.id) ?? ciclo.estado,
    }))
  }

  const ciclo = (id: string) => ciclos().find((c) => c.id === id)

  const lancamentos = (): Lancamento[] => [
    ...BASE.lancamentos,
    ...copiaParaLer(visitante).lancamentosNovos,
  ]

  /** Lançamento vigente de um subindicador numa unidade: o último registrado vence. */
  const lancamentoVigente = (cicloId: string, subindicadorId: string, unidadeId: string) =>
    [...lancamentos()]
      .reverse()
      .find(
        (l) =>
          l.cicloId === cicloId &&
          l.subindicadorId === subindicadorId &&
          l.unidadeId === unidadeId,
      )

  /**
   * Homologar é fazer a conta: ao chegar em 'homologado', o ciclo ganha as
   * avaliações de todas as unidades e as distritais, sobre os lançamentos
   * vigentes daquele momento NESTA cópia. Sem isto, avançar o ciclo aberto
   * numa demonstração produzia um mês "fechado" sem nota nenhuma.
   */
  function calcularAvaliacoesDoCiclo(
    copia: Copia,
    cicloId: string,
    agora: string,
    autor: string,
  ): void {
    const jaTem =
      BASE.avaliacoes.some((a) => a.cicloId === cicloId) ||
      copia.avaliacoesNovas.some((a) => a.cicloId === cicloId)
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
    copia.avaliacoesNovas.push(...doCiclo)

    for (const distrito of BASE.distritos) {
      const unidadesDoDistrito = new Set(
        BASE.unidades.filter((u) => u.distritoId === distrito.id).map((u) => u.id),
      )
      copia.avaliacoesDistritaisNovas.push(
        calcularAvaliacaoDistrital({
          distritoId: distrito.id,
          cicloId,
          avaliacoesDasUnidades: doCiclo.filter((a) => unidadesDoDistrito.has(a.unidadeId)),
          regra,
        }),
      )
    }

    registrar(copia, {
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

  return {
    ciclos,
    ciclo,
    lancamentos,
    lancamentoVigente,

    eventos: () => [...copiaParaLer(visitante).eventosNovos, ...BASE.eventos],

    avaliacoes: () => [...BASE.avaliacoes, ...copiaParaLer(visitante).avaliacoesNovas],

    avaliacoesDistritais: () => [
      ...BASE.avaliacoesDistritais,
      ...copiaParaLer(visitante).avaliacoesDistritaisNovas,
    ],

    contestacoes: () =>
      [...copiaParaLer(visitante).contestacoesNovas, ...BASE.contestacoes].sort((a, b) =>
        a.abertaEm < b.abertaEm ? 1 : -1,
      ),

    /**
     * Avança o ciclo para o próximo estado, sempre gravando na trilha.
     * Só a SEAB pode fazer isso: o perfil e a sessão são conferidos por quem chama.
     */
    avancarCiclo(cicloId, autor, agora) {
      if (!visitante) return SEM_VISITANTE
      const alvo = ciclo(cicloId)
      if (!alvo) return { ok: false, mensagem: 'Ciclo não encontrado.' }

      const seguinte = proximoEstado(alvo.estado)
      if (!seguinte) {
        return { ok: false, mensagem: `O ciclo já está em ${ROTULO_ESTADO[alvo.estado]}.` }
      }

      const copia = copiaParaEscrever(visitante)
      const cheio = semEspaco(copia)
      if (cheio) return cheio

      copia.estadosAlterados.set(cicloId, seguinte)
      registrar(copia, {
        quando: agora,
        autor,
        perfil: 'seab',
        tipo: 'ciclo_estado_alterado',
        entidade: cicloId,
        descricao: `Ciclo ${alvo.competencia}: ${ROTULO_ESTADO[alvo.estado]} → ${ROTULO_ESTADO[seguinte]}.`,
        antes: { estado: alvo.estado },
        depois: { estado: seguinte },
      })

      if (seguinte === 'homologado') calcularAvaliacoesDoCiclo(copia, cicloId, agora, autor)

      return { ok: true, mensagem: `Ciclo avançado para ${ROTULO_ESTADO[seguinte]}.` }
    },

    registrarLancamento(lancamento, agora, perfil = 'gerente_unidade') {
      if (!visitante) return SEM_VISITANTE
      const cicloAlvo = ciclo(lancamento.cicloId)
      if (!cicloAlvo) return { ok: false, mensagem: 'Ciclo não encontrado.' }

      // Fora do prazo, a escrita não entra, mas a TENTATIVA entra no histórico.
      // Recusa sem rastro é o que a planilha faz hoje: ninguém fica sabendo
      // que alguém tentou mandar número depois da hora.
      if (cicloAlvo.estado !== 'lancamento_aberto') {
        const copia = copiaParaEscrever(visitante)
        const cheio = semEspaco(copia)
        if (cheio) return cheio

        const situacao = ROTULO_ESTADO[cicloAlvo.estado].toLowerCase()
        registrar(copia, {
          quando: agora,
          autor: lancamento.autor,
          perfil,
          tipo: 'lancamento_recusado',
          entidade: cicloAlvo.id,
          descricao: `Tentativa de lançamento de ${lancamento.subindicadorId} pela ${lancamento.unidadeId} no ciclo ${cicloAlvo.id}, recusada: o mês está ${situacao}.`,
          antes: null,
          depois: {
            estadoDoCiclo: cicloAlvo.estado,
            valor: lancamento.valor,
            numerador: lancamento.numerador,
            denominador: lancamento.denominador,
          },
        })
        return {
          ok: false,
          mensagem: `A janela de lançamento deste ciclo está ${situacao}. A tentativa ficou registrada no histórico.`,
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

      const copia = copiaParaEscrever(visitante)
      const cheio = semEspaco(copia)
      if (cheio) return cheio

      // O "antes" do diff é o lançamento VIGENTE, não o primeiro da lista: numa
      // segunda correção, comparar com o original mentiria sobre o que mudou.
      const anterior = lancamentoVigente(
        lancamento.cicloId,
        lancamento.subindicadorId,
        lancamento.unidadeId,
      )

      const novo: Lancamento = { ...lancamento, id: proximoId(copia, 'lanc') }
      copia.lancamentosNovos.push(novo)

      registrar(copia, {
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
    },

    abrirContestacao(dados, perfil = 'gerente_unidade') {
      if (!visitante) return SEM_VISITANTE
      const copia = copiaParaEscrever(visitante)
      const cheio = semEspaco(copia)
      if (cheio) return cheio

      const contestacao: Contestacao = {
        ...dados,
        id: proximoId(copia, 'cont'),
        status: 'aberta',
        resposta: null,
      }
      copia.contestacoesNovas.unshift(contestacao)

      // Contestação também é trilha: pedido de revisão sem rastro seria a caixa
      // de sugestões que o produto existe para substituir.
      registrar(copia, {
        quando: dados.abertaEm,
        autor: dados.gerenteId,
        perfil,
        tipo: 'contestacao_aberta',
        entidade: contestacao.id,
        descricao: `Contestação aberta por ${dados.gerenteId} sobre o ciclo ${dados.cicloId}.`,
        antes: null,
        depois: { status: 'aberta', indicadorId: dados.indicadorId },
      })

      return {
        ok: true,
        mensagem:
          'Contestação registrada. Ela está na lista abaixo e no histórico. Neste protótipo, ninguém responde ainda.',
      }
    },
  }
}
