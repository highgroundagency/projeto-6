import 'server-only'
import { obterStore } from '@/lib/config/store'
import { CRONOGRAMA } from '@/lib/cronograma'
import { hojeEmRecife } from '@/lib/datas'
import { FEATURES } from '@/lib/features'
import { BASE } from '@/lib/seed'
import { calcularReleaseAtual } from '@/lib/releases'

export interface Status {
  produto: string
  versao: string
  ambiente: string
  commit: string
  modoDeDados: string
  driverConfiguracao: string
  configuracaoGravavel: boolean
  hojeRecife: string
  releasePublico: string
  ciclosNoCronograma: number
  funcionalidades: number
  registros: { areas: number; indicadores: number; ciclos: number; lancamentos: number }
  latenciaMs: number
  ok: boolean
}

/** Health check do §8.4 — build, modo de dados, versão e latência. */
export async function coletarStatus(): Promise<Status> {
  const inicio = performance.now()

  const store = obterStore()
  const config = await store.ler()
  const hoje = hojeEmRecife()
  const release = calcularReleaseAtual({
    hoje,
    adiantamentoDias: config.adiantamentoDias,
    override: config.overrideRelease,
  })

  return {
    produto: 'Prumo',
    versao: process.env.npm_package_version ?? '0.1.0',
    ambiente: process.env.NODE_ENV ?? 'desconhecido',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    modoDeDados: process.env.NEXT_PUBLIC_DATA_MODE ?? 'seed em memória',
    driverConfiguracao: store.nome,
    configuracaoGravavel: store.gravavel,
    hojeRecife: hoje,
    releasePublico: release ?? '—',
    ciclosNoCronograma: CRONOGRAMA.length,
    funcionalidades: FEATURES.length,
    registros: {
      areas: BASE.areas.length,
      indicadores: BASE.indicadores.length,
      ciclos: BASE.ciclos.length,
      lancamentos: BASE.lancamentos.length,
    },
    latenciaMs: Math.round((performance.now() - inicio) * 100) / 100,
    ok: true,
  }
}
