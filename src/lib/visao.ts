import 'server-only'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { IDS_CICLOS, type CicloId } from './cronograma'
import { ehDataISO, hojeEmRecife, type DataISO } from './datas'
import { obterStore } from './config/store'
import type { ConfigSite } from './config/tipos'
import {
  NOME_COOKIE_SESSAO,
  NOME_COOKIE_VISAO,
  obterSegredo,
  sessaoValida,
  verificarToken,
} from './admin/sessao'
import {
  ciclosVisiveis,
  resumirRelease,
  type ResumoRelease,
  type Travas,
} from './releases'

const cicloIdSchema = z.enum(IDS_CICLOS as unknown as [CicloId, ...CicloId[]])

/**
 * Overlay de visão — preferências que valem SÓ para a sessão do admin.
 *
 * É o que permite "ver como visitante em 03/10" sem alterar nada para o
 * público, e é também o único jeito de o painel ter efeito em produção, já que
 * o filesystem da Vercel é read-only. Ver docs/releases.md.
 */
export const overlaySchema = z.object({
  adiantamentoDias: z.number().int().min(0).max(120).optional(),
  overrideRelease: cicloIdSchema.nullable().optional(),
  travas: z.partialRecord(cicloIdSchema, z.enum(['automatico', 'sempre_visivel', 'sempre_oculto'])).optional(),
  /** Data simulada, `YYYY-MM-DD`. Só faz efeito com "ver como visitante". */
  dataSimulada: z.string().optional(),
  verComoVisitante: z.boolean().optional(),
})

export type Overlay = z.infer<typeof overlaySchema>

export interface Visao {
  /** Sessão administrativa válida. */
  admin: boolean
  /** Admin vendo tudo — todos os ciclos e todas as funcionalidades. */
  modoCompleto: boolean
  /** Admin pediu para enxergar o recorte público. */
  verComoVisitante: boolean
  /** Data usada nos cálculos (simulada quando o admin pede). */
  hoje: DataISO
  /** Data real em Recife, sempre. */
  hojeReal: DataISO
  dataSimulada: DataISO | null
  release: ResumoRelease
  /** Ciclos que esta visão pode ver. */
  visiveis: CicloId[]
  configGlobal: ConfigSite
  overlay: Overlay | null
  /** false quando o ambiente não persiste configuração global (produção). */
  configGravavel: boolean
}

async function lerSessaoAdmin(): Promise<boolean> {
  let segredo: string
  try {
    segredo = obterSegredo()
  } catch {
    // Produção sem ADMIN_COOKIE_SECRET: painel indisponível, site público normal.
    return false
  }
  const cookieStore = await cookies()
  return sessaoValida(cookieStore.get(NOME_COOKIE_SESSAO)?.value, segredo)
}

async function lerOverlay(admin: boolean): Promise<Overlay | null> {
  if (!admin) return null
  let segredo: string
  try {
    segredo = obterSegredo()
  } catch {
    return null
  }
  const cookieStore = await cookies()
  const bruto = await verificarToken<unknown>(
    cookieStore.get(NOME_COOKIE_VISAO)?.value,
    segredo,
  )
  if (!bruto) return null
  const analisado = overlaySchema.safeParse(bruto)
  return analisado.success ? analisado.data : null
}

/**
 * Resolve, no servidor, tudo que decide o que esta requisição pode ver.
 *
 * Chamar isto torna a rota dinâmica (lê cookies) — e é exatamente o que
 * queremos: o release avança com o calendário, então HTML assado no build
 * estaria errado por construção.
 */
export async function obterVisao(agora: Date = new Date()): Promise<Visao> {
  const hojeReal = hojeEmRecife(agora)
  const admin = await lerSessaoAdmin()
  const overlay = await lerOverlay(admin)
  const store = obterStore()
  const configGlobal = await store.ler()

  const verComoVisitante = Boolean(admin && overlay?.verComoVisitante)
  const modoCompleto = admin && !verComoVisitante

  const dataSimulada =
    overlay?.dataSimulada && ehDataISO(overlay.dataSimulada) ? overlay.dataSimulada : null
  const hoje = verComoVisitante && dataSimulada ? dataSimulada : hojeReal

  const adiantamentoDias = overlay?.adiantamentoDias ?? configGlobal.adiantamentoDias
  const override =
    overlay?.overrideRelease !== undefined
      ? overlay.overrideRelease
      : configGlobal.overrideRelease
  const travas: Travas = overlay?.travas ?? configGlobal.travas

  const release = resumirRelease({ hoje, adiantamentoDias, override, travas })

  return {
    admin,
    modoCompleto,
    verComoVisitante,
    hoje,
    hojeReal,
    dataSimulada,
    release,
    // Modo completo ignora o release: o admin vê o projeto inteiro (§7.2).
    visiveis: modoCompleto
      ? [...IDS_CICLOS]
      : ciclosVisiveis({ releaseAtual: release.releaseAtual, travas }),
    configGlobal,
    overlay,
    configGravavel: store.gravavel,
  }
}

export function podeVer(visao: Visao, ciclo: CicloId): boolean {
  return visao.visiveis.includes(ciclo)
}
