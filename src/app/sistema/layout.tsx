import Link from 'next/link'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { MarcaPrumo } from '@/components/base/marca'
import { Rodape } from '@/components/base/rodape'
import { PERFIS } from '@/lib/features'
import { exigeAutenticacao, featuresLiberadas, identidadeAtual } from '@/lib/sistema'
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

      <div className="border-b border-linha bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <div className="flex items-baseline gap-3">
            <Link href="/sistema">
              <MarcaPrumo tamanho="pequeno" />
            </Link>
            <span className="rotulo">Sistema</span>
          </div>

          {identidade.autenticada ? (
            // Sessão real do Supabase Auth: o perfil vem do banco e não se troca
            // no seletor — trocar de papel exige trocar de conta.
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rotulo">{PERFIS[identidade.perfil].rotulo}</span>
              <span className="text-cinza-forte">{identidade.email}</span>
              <form action="/api/sistema/sair" method="post">
                <button
                  type="submit"
                  className="border border-tinta px-2 py-1 text-xs hover:bg-tinta hover:text-papel"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : exigeAutenticacao() ? (
            <Link
              href="/sistema/entrar"
              className="border border-tinta px-3 py-1 text-sm hover:bg-tinta hover:text-papel"
            >
              Entrar
            </Link>
          ) : (
            // Modo seed: login simulado (§8.1). Preferência de navegação, não
            // autenticação — e a tela diz isso com todas as letras.
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
                className="border border-tinta px-2 py-1 text-xs hover:bg-tinta hover:text-papel"
              >
                Trocar
              </button>
            </form>
          )}
        </div>

        {doPerfil.length > 0 ? (
          <nav aria-label="Telas do sistema" className="mx-auto max-w-6xl px-5 pb-2 sm:px-8">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {doPerfil.map((feature) => (
                <li key={feature.id}>
                  <Link href={feature.rota} className="hover:text-laranja">
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
