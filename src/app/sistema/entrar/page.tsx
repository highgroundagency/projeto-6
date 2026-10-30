import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Botao } from '@/components/base/botao'
import { identidadeAtual } from '@/lib/sistema'

export const metadata: Metadata = {
  title: 'Entrar no sistema',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const MENSAGENS: Record<string, string> = {
  '1': 'Não foi possível entrar. Confira o login e a senha.',
  indisponivel: 'O login está indisponível agora. Tente de novo em alguns minutos.',
}

/**
 * Login do /sistema.
 *
 * Formulário HTML puro: o POST vai direto para o route handler, o único lugar
 * onde a senha é conferida. Nenhum JavaScript de cliente envolvido.
 */
export default async function EntrarNoSistema({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  if ((await identidadeAtual()).autenticada) redirect('/sistema')
  const { erro } = await searchParams
  const mensagem = erro ? (MENSAGENS[erro] ?? MENSAGENS['1']) : null

  return (
    <section className="mx-auto max-w-sm py-6">
      <h1 className="fonte-display text-2xl">Entrar</h1>
      <p className="mt-1 text-sm text-apagado">
        Para lançar, contestar ou avançar a etapa do mês. Sem entrar, o sistema abre só para
        leitura.
      </p>

      <form action="/api/sistema/entrar" method="post" className="mt-6 space-y-4">
        <div>
          <label htmlFor="login" className="rotulo">
            Login
          </label>
          <input
            id="login"
            name="login"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
            maxLength={60}
            className="mt-1.5 w-full rounded-lg border border-linha-alta bg-fundo px-3 py-2 text-base"
          />
        </div>
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
            maxLength={200}
            className="mt-1.5 w-full rounded-lg border border-linha-alta bg-fundo px-3 py-2 text-base"
          />
        </div>

        {mensagem ? (
          <p
            role="alert"
            className="rounded-lg border border-alerta/40 bg-alerta/10 px-3 py-2 text-sm text-alerta"
          >
            {mensagem}
          </p>
        ) : null}

        <Botao type="submit" variante="primario" tamanho="grande" className="w-full">
          Entrar
        </Botao>
      </form>

      <p className="mt-6 text-xs text-apagado">
        Não tem conta? Quem cria é a equipe do projeto. Enquanto isso,{' '}
        <Link href="/sistema" className="underline underline-offset-4 hover:text-texto">
          navegue como visitante
        </Link>
        .
      </p>
    </section>
  )
}
