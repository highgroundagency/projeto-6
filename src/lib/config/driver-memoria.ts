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
 * Driver em memória — usado nos testes e como fallback quando o ambiente não
 * aceita escrita. O estado morre com o processo, e isso é explícito.
 */
export function driverMemoria(
  inicial: ConfigSite = configPadrao(),
  agora: () => string = () => new Date().toISOString(),
): ConfigStore {
  let atual: ConfigSite = { ...inicial, travas: { ...inicial.travas } }
  const log: LogRelease[] = []
  let sequencia = 0

  return {
    nome: 'memoria',
    gravavel: true,

    async ler() {
      return { ...atual, travas: { ...atual.travas } }
    },

    async gravar(patch: PatchConfig, autor: string) {
      const validado = patchConfigSchema.parse(patch)
      const antes = atual
      const depois: ConfigSite = {
        adiantamentoDias: validado.adiantamentoDias ?? antes.adiantamentoDias,
        overrideRelease:
          validado.overrideRelease !== undefined
            ? validado.overrideRelease
            : antes.overrideRelease,
        travas: validado.travas ?? antes.travas,
        atualizadoEm: agora(),
      }

      for (const mudanca of descreverMudancas(antes, depois)) {
        log.unshift({ id: `log-${++sequencia}`, quando: depois.atualizadoEm, autor, ...mudanca })
      }

      atual = depois
      return { ...atual, travas: { ...atual.travas } }
    },

    async historico(limite = 50) {
      return log.slice(0, limite)
    },
  }
}
