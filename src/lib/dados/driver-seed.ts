import 'server-only'
import { BASE } from '@/lib/seed'
import {
  avaliacoes as avaliacoesDoOverlay,
  avaliacoesDistritais as avaliacoesDistritaisDoOverlay,
  avancarCiclo as avancarNoOverlay,
  ciclos as ciclosDoOverlay,
  eventos as eventosDoOverlay,
  lancamentos as lancamentosDoOverlay,
  registrarLancamento as registrarNoOverlay,
} from '@/lib/sistema/estado'
import {
  abrirContestacao,
  contestacoes as contestacoesDoOverlay,
} from '@/lib/sistema/contestacoes'
import type {
  EntradaContestacao,
  EntradaLancamento,
  FiltroAvaliacao,
  FiltroAvaliacaoDistrital,
  Panorama,
  RepositorioDados,
  Resultado,
} from './tipos'

/**
 * Driver do seed em memória — a única fonte de dados do app.
 *
 * É o que permite `git clone && npm run dev` funcionar sem nenhuma credencial,
 * o que importa num trabalho em equipe. Ver ADR-011 em docs/decisoes.md.
 */
export function driverSeed(): RepositorioDados {
  return {
    nome: 'seed em memória',
    persistente: false,

    async panorama(): Promise<Panorama> {
      return {
        distritos: BASE.distritos,
        tiposUnidade: BASE.tiposUnidade,
        unidades: BASE.unidades,
        gerentes: BASE.gerentes,
        indicadores: BASE.indicadores,
        subindicadores: BASE.subindicadores,
        regras: BASE.regras,
        ciclos: ciclosDoOverlay(),
      }
    },

    async lancamentos(cicloId?: string) {
      const todos = lancamentosDoOverlay()
      return cicloId ? todos.filter((l) => l.cicloId === cicloId) : todos
    },

    async avaliacoes(filtro: FiltroAvaliacao = {}) {
      return avaliacoesDoOverlay().filter(
        (a) =>
          (!filtro.unidadeId || a.unidadeId === filtro.unidadeId) &&
          (!filtro.cicloId || a.cicloId === filtro.cicloId),
      )
    },

    async avaliacoesDistritais(filtro: FiltroAvaliacaoDistrital = {}) {
      return avaliacoesDistritaisDoOverlay().filter(
        (a) =>
          (!filtro.distritoId || a.distritoId === filtro.distritoId) &&
          (!filtro.cicloId || a.cicloId === filtro.cicloId),
      )
    },

    async contestacoes(gerenteId?: string) {
      const todas = contestacoesDoOverlay()
      return gerenteId ? todas.filter((c) => c.gerenteId === gerenteId) : todas
    },

    async eventos(limite = 200) {
      return eventosDoOverlay().slice(0, limite)
    },

    async registrarLancamento(entrada: EntradaLancamento, agora: string): Promise<Resultado> {
      return registrarNoOverlay(
        {
          subindicadorId: entrada.subindicadorId,
          unidadeId: entrada.unidadeId,
          cicloId: entrada.cicloId,
          valor: entrada.valor,
          numerador: entrada.numerador,
          denominador: entrada.denominador,
          evidencia: entrada.evidencia,
          autor: entrada.autor,
          registradoEm: agora,
          status: 'enviado',
        },
        agora,
        entrada.perfil,
      )
    },

    async avancarCiclo(cicloId: string, autor: string, agora: string): Promise<Resultado> {
      return avancarNoOverlay(cicloId, autor, agora)
    },

    async abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado> {
      const { perfil, ...dados } = entrada
      abrirContestacao({ ...dados, abertaEm: agora }, perfil)
      return {
        ok: true,
        mensagem: 'Contestação registrada. A SEAB responde dentro do prazo do ciclo.',
      }
    },
  }
}
