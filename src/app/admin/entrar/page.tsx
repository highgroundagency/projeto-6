import type { Metadata } from 'next'
import Link from 'next/link'
import { Botao } from '@/components/base/botao'
import { MarcaPrumo } from '@/components/base/marca'

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Tela de login do painel.
 *
 * Formulário HTML puro: o POST vai direto para o route handler, que é o único
 * lugar onde a senha é conferida. Nenhum JavaScript de cliente envolvido.
 */
export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <main id="conteudo" className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <MarcaPrumo tamanho="medio" />
      <h1 className="fonte-display mt-4 text-2xl">Painel administrativo</h1>
      <p className="mt-1 text-sm text-apagado">
        Acesso restrito à equipe do projeto.
      </p>

      <form action="/api/admin/entrar" method="post" className="mt-6 space-y-3">
        <div>
          <label htmlFor="senha" className="rotulo">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="numero mt-1.5 w-full border border-linha-alta bg-fundo px-3 py-2 text-base"
          />
        </div>

        {erro ? (
          <p
            role="alert"
            className="border border-alerta/40 bg-alerta/10 px-3 py-2 text-sm text-alerta"
          >
            Não foi possível entrar.
          </p>
        ) : null}

        <Botao type="submit" variante="primario" tamanho="grande" className="w-full">
          Entrar
        </Botao>
      </form>

      <Link href="/" className="rotulo mt-6 hover:text-texto">
        ← Voltar ao início
      </Link>
    </main>
  )
}
