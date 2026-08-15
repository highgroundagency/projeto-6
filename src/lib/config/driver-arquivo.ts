import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  configPadrao,
  configSiteSchema,
  descreverMudancas,
  patchConfigSchema,
  type ConfigSite,
  type ConfigStore,
  type LogRelease,
  type PatchConfig,
} from './tipos'

interface Arquivo {
  config: ConfigSite
  log: LogRelease[]
}

/**
 * Driver de arquivo JSON — para desenvolvimento local.
 *
 * NÃO funciona em produção na Vercel: o filesystem é read-only lá. A seleção
 * de driver em `store.ts` cuida disso; aqui só documentamos o motivo.
 */
export function driverArquivo(
  caminho: string,
  agora: () => string = () => new Date().toISOString(),
): ConfigStore {
  async function carregar(): Promise<Arquivo> {
    try {
      const bruto = await readFile(caminho, 'utf8')
      const analisado = JSON.parse(bruto) as Partial<Arquivo>
      const config = configSiteSchema.safeParse(analisado.config)
      return {
        config: config.success ? (config.data as ConfigSite) : configPadrao(),
        log: Array.isArray(analisado.log) ? (analisado.log as LogRelease[]) : [],
      }
    } catch {
      // Arquivo inexistente ou corrompido: começa dos padrões do ambiente.
      return { config: configPadrao(), log: [] }
    }
  }

  async function salvar(dados: Arquivo): Promise<void> {
    await mkdir(dirname(caminho), { recursive: true })
    await writeFile(caminho, `${JSON.stringify(dados, null, 2)}\n`, 'utf8')
  }

  return {
    nome: 'arquivo',
    gravavel: true,

    async ler() {
      return (await carregar()).config
    },

    async gravar(patch: PatchConfig, autor: string) {
      const validado = patchConfigSchema.parse(patch)
      const { config: antes, log } = await carregar()
      const depois: ConfigSite = {
        adiantamentoDias: validado.adiantamentoDias ?? antes.adiantamentoDias,
        overrideRelease:
          validado.overrideRelease !== undefined
            ? validado.overrideRelease
            : antes.overrideRelease,
        travas: validado.travas ?? antes.travas,
        atualizadoEm: agora(),
      }

      const novasLinhas = descreverMudancas(antes, depois).map((mudanca, i) => ({
        id: `log-${Date.now()}-${i}`,
        quando: depois.atualizadoEm,
        autor,
        ...mudanca,
      }))

      await salvar({ config: depois, log: [...novasLinhas, ...log].slice(0, 500) })
      return depois
    },

    async historico(limite = 50) {
      return (await carregar()).log.slice(0, limite)
    },
  }
}
