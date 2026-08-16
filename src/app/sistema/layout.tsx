import Link from 'next/link'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { MarcaPrumo } from '@/components/base/marca'
import { Rodape } from '@/components/base/rodape'
import { PERFIS } from '@/lib/features'
import { featuresLiberadas, identidadeAtual } from '@/lib/sistema'
import { obterVisao } from '@/lib/visao'

export const dynamic = 'force-dynamic'

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const visao = await obterVisao()
  const identidade = await identidadeAtual()
  const liberadas = featuresLiberadas(visao)
  const doPerfil = liberadas.filter((f) => f.perfis.includes(identidade.perfil))

  return (
    <>
      <FaixaAdmin visao={visao} />

      <div className="border-b border-linha bg-fundo">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-baseline gap-3">
            <Link href="/sistema">
              <MarcaPrumo tamanho="pequeno" />
            </Link>
            <span className="rotulo">Sistema</span>
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
              Perfil simulado
            </label>
            <select
              id="perfil"
              name="perfil"
              defaultValue={identidade.perfil}
              className="border border-linha px-2 py-1 text-sm"
            >
              {Object.entries(PERFIS).map(([id, dados]) => (
                <option key={id} value={id}>
                  {dados.rotulo}
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

        {doPerfil.length > 0 ? (
          <nav aria-label="Telas do sistema" className="mx-auto max-w-6xl px-5 pb-2 sm:px-8">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {doPerfil.map((feature) => (
                <li key={feature.id}>
                  <Link href={feature.rota} className="hover:text-acento">
                    {feature.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      <main id="conteudo" className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        {children}
        <Rodape className="mt-10" />
      </main>
    </>
  )
}
