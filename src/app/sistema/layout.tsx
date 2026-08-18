import Link from 'next/link'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { MarcaPrumo } from '@/components/base/marca'
import { Rodape } from '@/components/base/rodape'
import { BotaoTema } from '@/components/base/botao-tema'
import { SeletorDePerfil } from '@/components/sistema/seletor-perfil'
import { identidadeAtual } from '@/lib/sistema'
import { temaAtual } from '@/lib/tema'
import { obterVisao } from '@/lib/visao'

export const dynamic = 'force-dynamic'

export default async function LayoutSistema({ children }: { children: React.ReactNode }) {
  const visao = await obterVisao()
  const identidade = await identidadeAtual()
  const tema = await temaAtual()

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
          <div className="flex flex-wrap items-center gap-3">
            <SeletorDePerfil perfil={identidade.perfil} />
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
    </>
  )
}
