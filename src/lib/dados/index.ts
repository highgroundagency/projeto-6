import 'server-only'
import { driverSeed } from './driver-seed'
import type { RepositorioDados } from './tipos'

export type { Panorama, RepositorioDados, Resultado } from './tipos'

/**
 * Camada de dados do sistema.
 *
 * Hoje há um driver só: o seed em memória, com semente fixa. A abstração
 * permanece porque é ela que mantém as oito telas sem acesso a dados espalhado
 * — e porque o schema de `supabase/migrations/` está escrito e testado, então
 * ligar um driver de banco depois é acrescentar um arquivo, não reescrever
 * telas. Ver docs/decisoes.md (ADR-011).
 */
let cache: RepositorioDados | null = null

export function repositorio(): RepositorioDados {
  if (cache) return cache
  cache = driverSeed()
  return cache
}

/** Usado nos testes para injetar um driver. */
export function definirRepositorio(driver: RepositorioDados | null): void {
  cache = driver
}
