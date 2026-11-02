import Link from 'next/link'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { MarcaPrumo } from '@/components/base/marca'
import { Rodape } from '@/components/base/rodape'
import { BotaoTema } from '@/components/base/botao-tema'
import { SeletorDePerfil } from '@/components/sistema/seletor-perfil'
import { PERFIS } from '@/lib/features'
import { identidadeAtual } from '@/lib/sistema'
import { temaAtual } from '@/lib/tema'
import { obterVisao } from '@/lib/visao'

export const dynamic = 'force-dynamic'

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const visao = await obterVisao()
  const identidade = await identidadeAtual()
  const tema = await temaAtual()

  return (
    // O atributo liga a pele do sistema (ADR-031): sans do aparelho, cartões
    // arredondados, fundo neutro. A faixa de admin/vitrine fica dentro do
    // envelope e herda a pele: cromo acompanha a superfície em que está.
    <div data-pele="sistema" className="min-h-dvh bg-fundo text-texto">
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

          {/* Com login, a conta manda e o seletor some: o perfil vem do banco.
              Sem login, o seletor continua para navegar as visões, só leitura
              (ADR-051). */}
          <div className="flex flex-wrap items-center gap-3">
            {identidade.autenticada ? (
              <form
                action="/api/sistema/sair"
                method="post"
                className="flex flex-wrap items-center gap-2"
              >
                <span className="text-sm">
                  <span className="rotulo">Conectado como</span>{' '}
                  <strong className="font-semibold">{identidade.login}</strong>
                  <span className="text-apagado">: {PERFIS[identidade.perfil].rotulo}</span>
                </span>
                <button
                  type="submit"
                  className="rounded-full border border-linha-alta px-3 py-1 text-xs hover:bg-superficie hover:text-texto"
                >
                  Sair
                </button>
              </form>
            ) : (
              <>
                <SeletorDePerfil perfil={identidade.perfil} />
                <Link
                  href="/sistema/entrar"
                  className="rounded-full border border-linha-alta px-3 py-1 text-xs hover:bg-superficie hover:text-texto"
                >
                  Entrar
                </Link>
              </>
            )}
            <BotaoTema tema={tema} voltarPara="/sistema" />
          </div>
        </div>
      </div>

      {/* O SUMÁRIO NÃO MORA AQUI. Ele precisa da query string para preservar o
          estado das outras telas ao pular de uma para outra, e layout do App
          Router não recebe `searchParams`. Ver `Sumario` em page.tsx. */}

      <main id="conteudo" className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        {children}
        <Rodape className="mt-10" />
      </main>
    </div>
  )
}
