import 'server-only'
import { BASE } from '@/lib/seed'
import {
  avancarCiclo as avancarNoOverlay,
  ciclos as ciclosDoOverlay,
  eventos as eventosDoOverlay,
  lancamentos as lancamentosDoOverlay,
  registrarLancamento as registrarNoOverlay,
} from '@/lib/sistema/estado'
import { abrirContestacao, contestacoes as contestacoesDoOverlay } from '@/lib/sistema/contestacoes'
import type {
  EntradaContestacao,
  EntradaLancamento,
  FiltroAvaliacao,
  Panorama,
  RepositorioDados,
  Resultado,
} from './tipos'

/**
 * Driver do seed em memória (fases 1–2).
 *
 * Continua sendo o padrão quando não há Supabase configurado: é o que permite
 * `git clone && npm run dev` funcionar sem nenhuma credencial, o que importa
 * num trabalho em equipe.
 */
export function driverSeed(): RepositorioDados {
  return {
    nome: 'seed em memória',
    persistente: false,

    async panorama(): Promise<Panorama> {
      return {
        areas: BASE.areas,
        gestores: BASE.gestores,
        indicadores: BASE.indicadores,
        regras: BASE.regras,
        ciclos: ciclosDoOverlay(),
      }
    },

    async lancamentos(cicloId?: string) {
      const todos = lancamentosDoOverlay()
      return cicloId ? todos.filter((l) => l.cicloId === cicloId) : todos
    },

    async avaliacoes(filtro: FiltroAvaliacao = {}) {
      return BASE.avaliacoes.filter(
        (a) =>
          (!filtro.gestorId || a.gestorId === filtro.gestorId) &&
          (!filtro.cicloId || a.cicloId === filtro.cicloId),
      )
    },

    async contestacoes(gestorId?: string) {
      const todas = contestacoesDoOverlay()
      return gestorId ? todas.filter((c) => c.gestorId === gestorId) : todas
    },

    async eventos(limite = 200) {
      return eventosDoOverlay().slice(0, limite)
    },

    async registrarLancamento(entrada: EntradaLancamento, agora: string): Promise<Resultado> {
      return registrarNoOverlay(
        {
          indicadorId: entrada.indicadorId,
          cicloId: entrada.cicloId,
          valor: entrada.valor,
          evidencia: entrada.evidencia,
          autor: entrada.autor,
          registradoEm: agora,
          status: 'enviado',
        },
        agora,
      )
    },

    async avancarCiclo(cicloId: string, autor: string, agora: string): Promise<Resultado> {
      return avancarNoOverlay(cicloId, autor, agora)
    },

    async abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado> {
      abrirContestacao({ ...entrada, abertaEm: agora })
      return {
        ok: true,
        mensagem: 'Contestação registrada. A comissão responde dentro do prazo do ciclo.',
      }
    },
  }
}
