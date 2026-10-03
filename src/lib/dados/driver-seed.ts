import 'server-only'
import { BASE } from '@/lib/seed'
import { estadoDo, type EstadoDoVisitante, type Sessao } from '@/lib/sistema/estado'
import { MENSAGEM_DIARIO_CHEIO, gravarSessao, sessaoAtual } from '@/lib/sistema/visitante'
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
 * CADA CHAMADA LÊ A SESSÃO DO VISITANTE. A base é a mesma para todos; o que
 * foi escrito pela interface mora numa cópia por visitante, refeita do diário
 * que ele carrega no cookie (`sistema/estado.ts` e `sistema/visitante.ts`). As
 * telas não sabem disso: o contrato de `RepositorioDados` não mudou.
 *
 * `lerSessao` e `gravar` existem para o teste trocar de visitante sem simular
 * cookie.
 */
export function driverSeed(
  lerSessao: () => Promise<Sessao | null> = sessaoAtual,
  gravar: (sessao: Sessao) => Promise<boolean> = gravarSessao,
): RepositorioDados {
  const estado = async (): Promise<EstadoDoVisitante> => estadoDo(await lerSessao())

  /**
   * Escreve na cópia e grava o diário de volta. Se o diário não cabe mais no
   * cookie, a escrita não vale, e quem escreveu fica sabendo.
   */
  async function escrever(fazer: (estado: EstadoDoVisitante) => Resultado): Promise<Resultado> {
    const sessao = await lerSessao()
    const antes = sessao?.diario.length ?? 0
    const resultado = fazer(estadoDo(sessao))
    if (sessao && sessao.diario.length !== antes && !(await gravar(sessao))) {
      return { ok: false, mensagem: MENSAGEM_DIARIO_CHEIO }
    }
    return resultado
  }

  return {
    nome: 'seed em memória, com a cópia de cada visitante refeita do cookie dele',
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
      return escrever((estado) =>
        estado.registrarLancamento(
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
        ),
      )
    },

    async avancarCiclo(cicloId: string, autor: string, agora: string): Promise<Resultado> {
      return escrever((estado) => estado.avancarCiclo(cicloId, autor, agora))
    },

    async abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado> {
      const { perfil, ...dados } = entrada
      return escrever((estado) =>
        estado.abrirContestacao({ ...dados, abertaEm: agora }, perfil),
      )
    },
  }
}
