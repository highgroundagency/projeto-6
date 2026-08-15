import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Ambiente } from '@/lib/ambiente'

/**
 * Clientes do Supabase (F3).
 *
 * Dois clientes, dois propósitos:
 *
 * - `clienteDaSessao()` usa a chave ANÔNIMA e carrega a sessão do usuário nos
 *   cookies. Toda consulta feita por ele passa pelas políticas de RLS. É o
 *   cliente do dia a dia.
 *
 * - `clienteDeServico()` usa a SERVICE ROLE, que ignora RLS. Só existe para
 *   duas coisas: semear a base e gravar a configuração do site a partir do
 *   painel já protegido por senha. Nunca chega ao navegador — este arquivo é
 *   `server-only` e a variável não tem prefixo `NEXT_PUBLIC_`.
 */

export interface ConfiguracaoSupabase {
  url: string
  chaveAnonima: string
  chaveDeServico?: string
}

export function lerConfiguracao(env: Ambiente = process.env): ConfiguracaoSupabase | null {
  const url = env.SUPABASE_URL?.trim() || env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const chaveAnonima = env.SUPABASE_ANON_KEY?.trim() || env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !chaveAnonima) return null

  return { url, chaveAnonima, chaveDeServico: env.SUPABASE_SERVICE_ROLE?.trim() || undefined }
}

export function supabaseConfigurado(env: Ambiente = process.env): boolean {
  return lerConfiguracao(env) !== null
}

/** Cliente com a sessão do usuário. Sujeito a RLS — é isso que o torna seguro. */
export async function clienteDaSessao(): Promise<SupabaseClient> {
  const configuracao = lerConfiguracao()
  if (!configuracao) {
    throw new Error(
      'Supabase não configurado: defina SUPABASE_URL e SUPABASE_ANON_KEY, ou use NEXT_PUBLIC_DATA_MODE=seed.',
    )
  }

  const armazemDeCookies = await cookies()

  return createServerClient(configuracao.url, configuracao.chaveAnonima, {
    cookies: {
      getAll() {
        return armazemDeCookies.getAll()
      },
      setAll(paraGravar) {
        try {
          for (const { name, value, options } of paraGravar) {
            armazemDeCookies.set(name, value, options)
          }
        } catch {
          // Server Components não podem gravar cookie. A renovação do token
          // acontece no middleware, que pode — aqui o silêncio é correto.
        }
      },
    },
  })
}

/**
 * Cliente administrativo. IGNORA RLS: use só onde a autorização já foi feita
 * por outro meio, e nunca a partir de entrada não confiável.
 */
export function clienteDeServico(): SupabaseClient {
  const configuracao = lerConfiguracao()
  if (!configuracao?.chaveDeServico) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE não configurada. Ela é necessária para semear a base e gravar a configuração do site.',
    )
  }

  return createClient(configuracao.url, configuracao.chaveDeServico, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
