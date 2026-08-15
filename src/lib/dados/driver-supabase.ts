import 'server-only'
import { clienteDaSessao } from '@/lib/supabase/cliente'
import { ORDEM_ESTADOS, ROTULO_ESTADO, type EstadoCiclo } from '@/lib/calculo/tipos'
import {
  paraArea,
  paraAvaliacao,
  paraCiclo,
  paraContestacao,
  paraEvento,
  paraGestor,
  paraIndicador,
  paraLancamento,
  paraRegra,
} from './mapeadores'
import type {
  EntradaContestacao,
  EntradaLancamento,
  FiltroAvaliacao,
  Panorama,
  RepositorioDados,
  Resultado,
} from './tipos'

/**
 * Driver do Supabase (F3).
 *
 * Toda consulta passa pela sessão do usuário e, portanto, pelas políticas de
 * RLS — o filtro de "quem vê o quê" acontece no banco, não aqui. Este arquivo
 * não repete a autorização: se repetisse, teríamos duas fontes de verdade e
 * uma delas ficaria desatualizada.
 *
 * As mensagens de erro do PostgreSQL são traduzidas para o vocabulário do
 * domínio: o gestor não precisa ver "new row violates row-level security".
 */

function traduzirErro(mensagem: string): string {
  if (/row-level security/i.test(mensagem)) {
    return 'Seu perfil não tem permissão para esta operação.'
  }
  if (/janela de lançamento não está aberta/i.test(mensagem)) {
    return 'A janela de lançamento deste ciclo não está aberta.'
  }
  if (/avança um estado por vez/i.test(mensagem)) {
    return 'Transição inválida: o ciclo avança um estado por vez e não volta.'
  }
  if (/append-only/i.test(mensagem)) {
    return 'A trilha de auditoria não pode ser alterada.'
  }
  if (/imutável/i.test(mensagem)) {
    return 'Esta regra é imutável. Crie uma nova versão em vez de editá-la.'
  }
  if (/evidencia|check constraint/i.test(mensagem)) {
    return 'Os dados informados não atendem às regras do cadastro.'
  }
  return 'Não foi possível concluir a operação.'
}

export function driverSupabase(): RepositorioDados {
  return {
    nome: 'supabase',
    persistente: true,

    async panorama(): Promise<Panorama> {
      const supabase = await clienteDaSessao()

      const [areas, gestores, indicadores, regras, ciclos] = await Promise.all([
        supabase.from('areas').select('*').order('id'),
        supabase.from('gestores').select('*').order('id'),
        supabase.from('indicadores').select('*').order('id'),
        supabase.from('regras_pontuacao').select('*').order('versao'),
        supabase.from('ciclos').select('*').order('competencia'),
      ])

      return {
        areas: (areas.data ?? []).map(paraArea),
        gestores: (gestores.data ?? []).map(paraGestor),
        indicadores: (indicadores.data ?? []).map(paraIndicador),
        regras: (regras.data ?? []).map(paraRegra),
        ciclos: (ciclos.data ?? []).map(paraCiclo),
      }
    },

    async lancamentos(cicloId?: string) {
      const supabase = await clienteDaSessao()
      let consulta = supabase.from('lancamentos').select('*').order('registrado_em')
      if (cicloId) consulta = consulta.eq('ciclo_id', cicloId)
      const { data } = await consulta
      return (data ?? []).map(paraLancamento)
    },

    async avaliacoes(filtro: FiltroAvaliacao = {}) {
      const supabase = await clienteDaSessao()
      let consulta = supabase.from('avaliacoes').select('*').order('ciclo_id')
      if (filtro.gestorId) consulta = consulta.eq('gestor_id', filtro.gestorId)
      if (filtro.cicloId) consulta = consulta.eq('ciclo_id', filtro.cicloId)
      const { data } = await consulta
      return (data ?? []).map(paraAvaliacao)
    },

    async contestacoes(gestorId?: string) {
      const supabase = await clienteDaSessao()
      let consulta = supabase.from('contestacoes').select('*').order('aberta_em', { ascending: false })
      if (gestorId) consulta = consulta.eq('gestor_id', gestorId)
      const { data } = await consulta
      return (data ?? []).map(paraContestacao)
    },

    async eventos(limite = 200) {
      const supabase = await clienteDaSessao()
      const { data } = await supabase
        .from('eventos_auditoria')
        .select('*')
        .order('quando', { ascending: false })
        .limit(limite)
      return (data ?? []).map(paraEvento)
    },

    async registrarLancamento(entrada: EntradaLancamento, agora: string): Promise<Resultado> {
      const supabase = await clienteDaSessao()

      // A janela de prazo e a auditoria são garantidas por gatilho no banco:
      // não há caminho de escrita que escape delas.
      const { error } = await supabase.from('lancamentos').insert({
        indicador_id: entrada.indicadorId,
        ciclo_id: entrada.cicloId,
        valor: entrada.valor,
        evidencia: entrada.evidencia,
        autor: entrada.autor,
        registrado_em: agora,
        status: 'enviado',
      })

      if (error) return { ok: false, mensagem: traduzirErro(error.message) }
      return { ok: true, mensagem: 'Lançamento registrado.' }
    },

    async avancarCiclo(cicloId: string): Promise<Resultado> {
      const supabase = await clienteDaSessao()

      const { data: atual } = await supabase
        .from('ciclos')
        .select('estado')
        .eq('id', cicloId)
        .maybeSingle()

      if (!atual) return { ok: false, mensagem: 'Ciclo não encontrado.' }

      const posicao = ORDEM_ESTADOS.indexOf(atual.estado as EstadoCiclo)
      const seguinte = ORDEM_ESTADOS[posicao + 1]
      if (!seguinte) {
        return {
          ok: false,
          mensagem: `O ciclo já está em ${ROTULO_ESTADO[atual.estado as EstadoCiclo]}.`,
        }
      }

      const { data, error } = await supabase
        .from('ciclos')
        .update({ estado: seguinte })
        .eq('id', cicloId)
        .select('id')

      if (error) return { ok: false, mensagem: traduzirErro(error.message) }

      // Sem erro e sem linha: a política de RLS não alcançou o registro.
      if (!data || data.length === 0) {
        return { ok: false, mensagem: 'Somente o perfil CAM pode avançar o ciclo.' }
      }

      return { ok: true, mensagem: `Ciclo avançado para ${ROTULO_ESTADO[seguinte]}.` }
    },

    async abrirContestacao(entrada: EntradaContestacao, agora: string): Promise<Resultado> {
      const supabase = await clienteDaSessao()

      const { error } = await supabase.from('contestacoes').insert({
        gestor_id: entrada.gestorId,
        ciclo_id: entrada.cicloId,
        indicador_id: entrada.indicadorId,
        motivo: entrada.motivo,
        aberta_em: agora,
      })

      if (error) return { ok: false, mensagem: traduzirErro(error.message) }
      return {
        ok: true,
        mensagem: 'Contestação registrada. A comissão responde dentro do prazo do ciclo.',
      }
    },
  }
}
