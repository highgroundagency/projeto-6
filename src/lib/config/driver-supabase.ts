import 'server-only'
import { clienteDaSessao, clienteDeServico } from '@/lib/supabase/cliente'
import type { CicloId } from '@/lib/cronograma'
import type { Travas } from '@/lib/releases'
import type { LinhaConfiguracao, LinhaLogRelease } from '@/lib/supabase/tipos'
import {
  configPadrao,
  descreverMudancas,
  patchConfigSchema,
  type ConfigSite,
  type ConfigStore,
  type LogRelease,
  type PatchConfig,
} from './tipos'

/**
 * Driver do Supabase para a configuração do site (F3).
 *
 * É o que encerra a limitação do ADR-004: até aqui, produção não tinha onde
 * gravar a configuração de release, porque o filesystem da Vercel é read-only.
 *
 * Dois clientes, por um motivo específico:
 *
 * - LEITURA usa a chave anônima. A tabela tem política de select liberada até
 *   para `anon`, porque é ela que decide o release do visitante — precisa ser
 *   lida antes de qualquer login.
 *
 * - ESCRITA usa a service role. O painel administrativo se autentica por senha
 *   própria (§7.1), não por Supabase Auth, então não existe sessão de banco
 *   para carregar. Como a tabela não tem NENHUMA política de escrita, não há
 *   caminho de gravação a partir de um navegador — só por aqui, no servidor.
 */
export function driverSupabaseConfig(): ConfigStore {
  return {
    nome: 'supabase',
    gravavel: true,

    async ler(): Promise<ConfigSite> {
      const supabase = await clienteDaSessao()
      const { data } = await supabase
        .from('configuracao_site')
        .select('*')
        .eq('id', 1)
        .maybeSingle<LinhaConfiguracao>()

      if (!data) return configPadrao()

      return {
        adiantamentoDias: data.adiantamento_dias,
        overrideRelease: (data.override_release as CicloId | null) ?? null,
        travas: (data.travas ?? {}) as Travas,
        atualizadoEm: data.atualizado_em,
      }
    },

    async gravar(patch: PatchConfig, autor: string): Promise<ConfigSite> {
      const validado = patchConfigSchema.parse(patch)
      const servico = clienteDeServico()

      const { data: linhaAtual } = await servico
        .from('configuracao_site')
        .select('*')
        .eq('id', 1)
        .maybeSingle<LinhaConfiguracao>()

      const antes: ConfigSite = linhaAtual
        ? {
            adiantamentoDias: linhaAtual.adiantamento_dias,
            overrideRelease: (linhaAtual.override_release as CicloId | null) ?? null,
            travas: (linhaAtual.travas ?? {}) as Travas,
            atualizadoEm: linhaAtual.atualizado_em,
          }
        : configPadrao()

      const agora = new Date().toISOString()
      const depois: ConfigSite = {
        adiantamentoDias: validado.adiantamentoDias ?? antes.adiantamentoDias,
        overrideRelease:
          validado.overrideRelease !== undefined ? validado.overrideRelease : antes.overrideRelease,
        travas: validado.travas ?? antes.travas,
        atualizadoEm: agora,
      }

      const { error } = await servico
        .from('configuracao_site')
        .update({
          adiantamento_dias: depois.adiantamentoDias,
          override_release: depois.overrideRelease,
          travas: depois.travas,
          atualizado_em: agora,
        })
        .eq('id', 1)

      if (error) throw new Error(`Não foi possível gravar a configuração: ${error.message}`)

      // O log é append-only por gatilho: uma vez gravado, nem a service role
      // reescreve. É o que faz dele histórico e não rascunho.
      const mudancas = descreverMudancas(antes, depois)
      if (mudancas.length > 0) {
        await servico
          .from('log_releases')
          .insert(mudancas.map((mudanca) => ({ quando: agora, autor, ...mudanca })))
      }

      return depois
    },

    async historico(limite = 50): Promise<LogRelease[]> {
      const servico = clienteDeServico()
      const { data } = await servico
        .from('log_releases')
        .select('*')
        .order('quando', { ascending: false })
        .limit(limite)

      return ((data ?? []) as LinhaLogRelease[]).map((linha) => ({
        id: String(linha.id),
        quando: linha.quando,
        autor: linha.autor,
        campo: linha.campo,
        de: linha.de,
        para: linha.para,
      }))
    },
  }
}
