import 'server-only'
import { BASE } from '@/lib/seed'
import { estadoDo, type EstadoDoVisitante } from '@/lib/sistema/estado'
import { visitanteAtual } from '@/lib/sistema/visitante'
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
 *
 * CADA CHAMADA RESOLVE O VISITANTE. A base é a mesma para todos; o que foi
 * escrito pela interface mora numa cópia por visitante (`sistema/estado.ts`).
 * As telas não sabem disso: o contrato de `RepositorioDados` não mudou.
 *
 * `quemEsta` existe para o teste trocar de visitante sem simular cookie.
 */
export function driverSeed(
  quemEsta: () => Promise<string | null> = visitanteAtual,
): RepositorioDados {
  const estado = async (): Promise<EstadoDoVisitante> => estadoDo(await quemEsta())

  return {
    nome: 'seed em memória, uma cópia por visitante',
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
        ciclos: (await estado()).ciclos(),
      }
    },

    async lancamentos(cicloId?: string) {
      const todos = (await estado()).lancamentos()
      return cicloId ? todos.filter((l) => l.cicloId === cicloId) : todos
    },

    async avaliacoes(filtro: FiltroAvaliacao = {}) {
      return (await estado())
        .avaliacoes()
        .filter(
          (a) =>
            (!filtro.unidadeId || a.unidadeId === filtro.unidadeId) &&
            (!filtro.cicloId || a.cicloId === filtro.cicloId),
        )
    },

    async avaliacoesDistritais(filtro: FiltroAvaliacaoDistrital = {}) {
      return (await estado())
        .avaliacoesDistritais()
        .filter(
          (a) =>
            (!filtro.distritoId || a.distritoId === filtro.distritoId) &&
            (!filtro.cicloId || a.cicloId === filtro.cicloId),
        )
    },

    async contestacoes(gerenteId?: string) {
      const todas = (await estado()).contestacoes()
      return gerenteId ? todas.filter((c) => c.gerenteId === gerenteId) : todas
    },

    async eventos(limite = 200) {
      return (await estado()).eventos().slice(0, limite)
    },

    async registrarLancamento(entrada: EntradaLancamento, agora: string): Promise<Resultado> {
      return (await estado()).registrarLancamento(
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
      return (await estado()).avancarCiclo(cicloId, autor, agora)
    },

    async abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado> {
      const { perfil, ...dados } = entrada
      return (await estado()).abrirContestacao({ ...dados, abertaEm: agora }, perfil)
    },
  }
}
