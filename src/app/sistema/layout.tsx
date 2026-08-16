import Link from 'next/link'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { MarcaPrumo } from '@/components/base/marca'
import { Rodape } from '@/components/base/rodape'
import { ORDEM_PERFIS, PERFIS } from '@/lib/features'
import { identidadeAtual } from '@/lib/sistema'
import { obterVisao } from '@/lib/visao'

export const dynamic = 'force-dynamic'

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const visao = await obterVisao()
  const identidade = await identidadeAtual()

  return (
    <>
      <FaixaAdmin visao={visao} />

      {/* Identidade e seletor: rolam junto com a página. O que fica grudado é o
          sumário, logo abaixo, porque é ele que se usa o tempo todo. */}
      <div className="border-b border-linha bg-fundo">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-linha px-2.5 py-1 text-xs lowercase transition-colors hover:border-acento hover:text-acento"
            >
              <span aria-hidden>←</span>
              voltar para o site
            </Link>
            <span aria-hidden className="text-linha-alta">
              ·
            </span>
            <Link href="/sistema" className="flex items-baseline gap-3">
              <MarcaPrumo tamanho="pequeno" />
              <span className="rotulo">Sistema</span>
            </Link>
          </div>

          {/* Login simulado (§8.1): preferência de navegação, não autenticação.
              O RBAC real está em supabase/migrations/ como políticas de RLS —
              escrito e testado, mas não ligado ao app (ADR-011). */}
          <form
            action="/api/sistema/perfil"
            method="post"
            className="flex flex-wrap items-center gap-2"
          >
            <label htmlFor="perfil" className="rotulo">
              Estou usando como
            </label>
            <select
              id="perfil"
              name="perfil"
              defaultValue={identidade.perfil}
              className="border border-linha px-2 py-1 text-sm"
            >
              {ORDEM_PERFIS.map((id) => (
                <option key={id} value={id}>
                  {PERFIS[id].rotulo}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="border border-linha-alta px-2 py-1 text-xs hover:bg-superficie hover:text-texto"
            >
              Trocar
            </button>
          </form>
        </div>
      </div>

      {/* O SUMÁRIO NÃO MORA AQUI. Ele precisa da query string para preservar o
          estado das outras telas ao pular de uma para outra, e layout do App
          Router não recebe `searchParams`. Ver `Sumario` em page.tsx. */}

      <main id="conteudo" className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        {children}
        <Rodape className="mt-10" />
      </main>
    </>
  )
}
