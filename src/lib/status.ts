import 'server-only'
import { obterStore } from '@/lib/config/store'
import { CRONOGRAMA } from '@/lib/cronograma'
import { hojeEmRecife } from '@/lib/datas'
import { FEATURES } from '@/lib/features'
import { repositorio } from '@/lib/dados'
import { calcularReleaseAtual, janelaAberta } from '@/lib/releases'

export interface Status {
  produto: string
  versao: string
  ambiente: string
  commit: string
  modoDeDados: string
  dadosPersistentes: boolean
  driverConfiguracao: string
  configuracaoGravavel: boolean
  hojeRecife: string
  releasePublico: string
  /** Janela de vitrine aberta: todo visitante vê o semestre inteiro. */
  vitrineAberta: boolean
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
  const dados = repositorio()
  const config = await store.ler()
  const panorama = await dados.panorama()
  const lancamentos = await dados.lancamentos()
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
    modoDeDados: dados.nome,
    dadosPersistentes: dados.persistente,
    driverConfiguracao: store.nome,
    configuracaoGravavel: store.gravavel,
    hojeRecife: hoje,
    releasePublico: release ?? '—',
    vitrineAberta: janelaAberta(),
    ciclosNoCronograma: CRONOGRAMA.length,
    funcionalidades: FEATURES.length,
    registros: {
      areas: panorama.areas.length,
      indicadores: panorama.indicadores.length,
      ciclos: panorama.ciclos.length,
      lancamentos: lancamentos.length,
    },
    latenciaMs: Math.round((performance.now() - inicio) * 100) / 100,
    ok: true,
  }
}
