import { z } from 'zod'
import { IDS_CICLOS, type CicloId } from '@/lib/cronograma'
import { ADIANTAMENTO_PADRAO, type Trava, type Travas } from '@/lib/releases'

const cicloIdSchema = z.enum(IDS_CICLOS as unknown as [CicloId, ...CicloId[]])
const travaSchema = z.enum(['automatico', 'sempre_visivel', 'sempre_oculto'])

export const configSiteSchema = z.object({
  /** Quantos dias à frente o release corre. 0–120 para evitar valor absurdo. */
  adiantamentoDias: z.number().int().min(0).max(120),
  /** Fixa o release manualmente; null volta ao automático. */
  overrideRelease: cicloIdSchema.nullable(),
  // partialRecord: no zod 4, `record` com chave enum exige TODAS as chaves.
  travas: z.partialRecord(cicloIdSchema, travaSchema),
  atualizadoEm: z.string(),
})

export type ConfigSite = z.infer<typeof configSiteSchema> & { travas: Travas }

/** Alterações que o painel pode aplicar. */
export const patchConfigSchema = configSiteSchema
  .omit({ atualizadoEm: true })
  .partial()

export type PatchConfig = z.infer<typeof patchConfigSchema>

export interface LogRelease {
  readonly id: string
  /** Timestamp ISO completo do momento da mudança. */
  readonly quando: string
  readonly autor: string
  readonly campo: string
  readonly de: string
  readonly para: string
}

export interface ConfigStore {
  /** Nome do driver, exibido em /status e no painel. */
  readonly nome: string
  /** false quando o ambiente não aceita escrita (Vercel sem Supabase). */
  readonly gravavel: boolean
  ler(): Promise<ConfigSite>
  gravar(patch: PatchConfig, autor: string): Promise<ConfigSite>
  historico(limite?: number): Promise<LogRelease[]>
}

function lerTravasDaEnv(bruto: string | undefined): Travas {
  if (!bruto) return {}
  let analisado: unknown
  try {
    analisado = JSON.parse(bruto)
  } catch {
    // Env var com JSON inválido não derruba o site: cai no padrão.
    return {}
  }

  const entradas = z.record(z.string(), z.string()).safeParse(analisado)
  if (!entradas.success) return {}

  // Descarta entrada por entrada: uma trava escrita errado não invalida as boas.
  const travas: Travas = {}
  for (const [id, valor] of Object.entries(entradas.data)) {
    const idOk = cicloIdSchema.safeParse(id)
    const valorOk = travaSchema.safeParse(valor)
    if (idOk.success && valorOk.success) travas[idOk.data] = valorOk.data
  }
  return travas
}

/**
 * Configuração base do ambiente. É o que o visitante vê quando não há nada
 * gravado — e, em produção antes da F3, é a única forma de mudar o release
 * público (via env var + redeploy). Ver docs/releases.md.
 */
export function configPadrao(env: NodeJS.ProcessEnv = process.env): ConfigSite {
  const adiantamentoBruto = Number(env.RELEASE_ADIANTAMENTO_DIAS)
  const adiantamentoDias =
    Number.isFinite(adiantamentoBruto) && adiantamentoBruto >= 0 && adiantamentoBruto <= 120
      ? Math.trunc(adiantamentoBruto)
      : ADIANTAMENTO_PADRAO

  const overrideBruto = env.RELEASE_OVERRIDE?.trim()
  const overrideRelease =
    overrideBruto && IDS_CICLOS.includes(overrideBruto as CicloId)
      ? (overrideBruto as CicloId)
      : null

  return {
    adiantamentoDias,
    overrideRelease,
    travas: lerTravasDaEnv(env.RELEASE_TRAVAS),
    atualizadoEm: '',
  }
}

/** Descreve uma mudança em linguagem humana para o log de liberações. */
export function descreverMudancas(
  antes: ConfigSite,
  depois: ConfigSite,
): Array<Pick<LogRelease, 'campo' | 'de' | 'para'>> {
  const mudancas: Array<Pick<LogRelease, 'campo' | 'de' | 'para'>> = []

  if (antes.adiantamentoDias !== depois.adiantamentoDias) {
    mudancas.push({
      campo: 'adiantamentoDias',
      de: String(antes.adiantamentoDias),
      para: String(depois.adiantamentoDias),
    })
  }
  if (antes.overrideRelease !== depois.overrideRelease) {
    mudancas.push({
      campo: 'overrideRelease',
      de: antes.overrideRelease ?? 'automático',
      para: depois.overrideRelease ?? 'automático',
    })
  }

  const ids = new Set([...Object.keys(antes.travas), ...Object.keys(depois.travas)])
  for (const id of ids) {
    const de = (antes.travas[id as CicloId] ?? 'automatico') as Trava
    const para = (depois.travas[id as CicloId] ?? 'automatico') as Trava
    if (de !== para) mudancas.push({ campo: `trava:${id}`, de, para })
  }

  return mudancas
}
