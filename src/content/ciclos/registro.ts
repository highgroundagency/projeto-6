import 'server-only'
import type { CicloId } from '@/lib/cronograma'
import type { ModuloCiclo } from '@/lib/registro/tipos'

/**
 * Registry dos conteúdos de ciclo.
 *
 * POR QUE CARREGADORES PREGUIÇOSOS E NÃO UM BARREL:
 * um `import` estático de todos os ciclos avaliaria os módulos futuros, e eles
 * acabariam no payload RSC enviado ao visitante. Aqui o módulo só é avaliado
 * depois que o gate de release aprovou aquele ciclo.
 *
 * `Record<CicloId, …>` obriga a listar os 18 ciclos: `null` é uma decisão
 * explícita de "ainda sem registro", nunca um esquecimento silencioso.
 *
 * `import 'server-only'` faz o build falhar se algum Client Component tentar
 * importar este arquivo.
 */
export type CarregadorCiclo = () => Promise<ModuloCiclo>

export const CARREGADORES: Record<CicloId, CarregadorCiclo | null> = {
  s1: () => import('./s1'),
  s2: () => import('./s2'),
  s3: () => import('./s3'),
  s4: () => import('./s4'),
  // Imprensados não têm registro próprio: as entregas da semana são
  // acumuladas na seguinte. `null` aqui é decisão, não esquecimento.
  i1: null,
  ko: () => import('./ko'),
  s5: () => import('./s5'),
  s6: () => import('./s6'),
  sr1: () => import('./sr1'),
  i2: null,
  s7: () => import('./s7'),
  s8: () => import('./s8'),
  i3: null,
  s9: () => import('./s9'),
  s10: () => import('./s10'),
  s11: () => import('./s11'),
  s12: () => import('./s12'),
  sr2: () => import('./sr2'),
}

export function temRegistro(id: CicloId): boolean {
  return CARREGADORES[id] !== null
}

export interface CicloCarregado {
  id: CicloId
  modulo: ModuloCiclo
}

/**
 * Carrega apenas os ciclos informados — que devem ser, sempre, o resultado do
 * gate de release. Passar a lista completa aqui anularia toda a proteção.
 */
export async function carregarCiclos(ids: readonly CicloId[]): Promise<CicloCarregado[]> {
  const carregados = await Promise.all(
    ids.map(async (id) => {
      const carregador = CARREGADORES[id]
      if (!carregador) return null
      return { id, modulo: await carregador() }
    }),
  )
  return carregados.filter((c): c is CicloCarregado => c !== null)
}
