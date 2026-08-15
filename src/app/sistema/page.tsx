import type { Metadata } from 'next'
import Link from 'next/link'
import { Num } from '@/components/base/num'
import { CLIENTE, PERGUNTA_DO_PROJETO } from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { PERFIS } from '@/lib/features'
import { featuresLiberadas, perfilAtual } from '@/lib/sistema'
import { obterVisao } from '@/lib/visao'

export const metadata: Metadata = {
  title: 'Sistema',
  description: 'MVP do sistema de cálculo da gratificação por desempenho.',
}

export const dynamic = 'force-dynamic'

/** Primeiro ciclo que libera alguma funcionalidade — usado na mensagem de espera. */
const PRIMEIRO_CICLO_COM_FUNCIONALIDADE = 's5'

export default async function CascaDoSistema() {
  const visao = await obterVisao()
  const perfil = await perfilAtual()
  const liberadas = featuresLiberadas(visao)
  const abertura = cicloPorId(PRIMEIRO_CICLO_COM_FUNCIONALIDADE)

  return (
    <>
      <header className="border-b border-linha pb-5">
        <h1 className="fonte-display text-3xl">Gratificação por desempenho</h1>
        <p className="mt-1 max-w-prose text-sm text-cinza-forte">
          MVP para a {CLIENTE.orgao}. Todos os dados exibidos são sintéticos.
        </p>
        <p className="mt-3 max-w-prose border-l-2 border-laranja pl-3 text-sm">
          {PERGUNTA_DO_PROJETO}
        </p>
      </header>

      {liberadas.length === 0 ? (
        <section className="mt-8 border border-dashed border-linha px-5 py-8">
          <h2 className="fonte-display text-xl">O sistema ainda não entrou em operação</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed">
            As telas do MVP são liberadas a partir da{' '}
            <strong>{abertura?.rotulo}</strong>, em{' '}
            <Num>{abertura ? formatarBR(abertura.data) : '—'}</Num>. Até lá, a trajetória do
            projeto está no{' '}
            <Link href="/registro" className="underline underline-offset-4">
              registro
            </Link>
            .
          </p>
          <p className="mt-3 max-w-prose text-xs text-cinza-forte">
            Esta página não lista o que ainda não existe: funcionalidade não liberada
            responde 404, e não uma prévia do que vem por aí.
          </p>
        </section>
      ) : (
        <section className="mt-8">
          <h2 className="rotulo">
            Telas disponíveis para o perfil {PERFIS[perfil].rotulo}
          </h2>
          <p className="mt-1 text-sm text-cinza-forte">{PERFIS[perfil].descricao}</p>

          <ul className="mt-3 grid gap-px border border-linha bg-linha sm:grid-cols-2">
            {liberadas.map((feature) => {
              const doPerfil = feature.perfis.includes(perfil)
              return (
                <li key={feature.id} className="bg-white">
                  {doPerfil ? (
                    <Link href={feature.rota} className="block h-full p-4 hover:bg-papel-2">
                      <span className="fonte-display block text-base">{feature.rotulo}</span>
                      <span className="mt-1 block text-sm text-cinza-forte">
                        {feature.descricao}
                      </span>
                    </Link>
                  ) : (
                    <div className="h-full p-4 opacity-50">
                      <span className="fonte-display block text-base">{feature.rotulo}</span>
                      <span className="mt-1 block text-sm text-cinza-forte">
                        Não faz parte das atribuições deste perfil.
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
