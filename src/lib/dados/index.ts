import 'server-only'
import { supabaseConfigurado } from '@/lib/supabase/cliente'
import { driverSeed } from './driver-seed'
import { driverSupabase } from './driver-supabase'
import type { RepositorioDados } from './tipos'

export type { Panorama, RepositorioDados, Resultado } from './tipos'

/**
 * Escolha do driver de dados.
 *
 * Padrão: seed em memória, para que `git clone && npm run dev` funcione sem
 * nenhuma credencial. Com `SUPABASE_URL` e `SUPABASE_ANON_KEY` definidas, o
 * Supabase assume. `NEXT_PUBLIC_DATA_MODE=seed` força o seed mesmo com o
 * Supabase configurado — útil para demonstrar sem tocar na base real.
 */
let cache: RepositorioDados | null = null

export function repositorio(): RepositorioDados {
  if (cache) return cache

  const forcarSeed = process.env.NEXT_PUBLIC_DATA_MODE === 'seed'
  cache = !forcarSeed && supabaseConfigurado() ? driverSupabase() : driverSeed()
  return cache
}

/** Usado nos testes para injetar um driver. */
export function definirRepositorio(driver: RepositorioDados | null): void {
  cache = driver
}
