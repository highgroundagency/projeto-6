import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Botao } from '@/components/base/botao'
import { MarcaPrumo } from '@/components/base/marca'
import { Aviso } from '@/components/sistema/base'
import { exigeAutenticacao, identidadeAtual } from '@/lib/sistema'

export const metadata: Metadata = {
  title: 'Entrar no sistema',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Login do sistema (F3).
 *
 * Só existe quando o Supabase está configurado. No modo seed não há o que
 * autenticar: o seletor de perfil dá conta da demonstração, e fingir uma tela
 * de login ali seria teatro.
 */
export default async function EntrarNoSistema({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; erro?: string }>
}) {
  if (!exigeAutenticacao()) redirect('/sistema')

  const identidade = await identidadeAtual()
  if (identidade.autenticada) redirect('/sistema')

  const { destino, erro } = await searchParams

  return (
    <main id="conteudo" className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <MarcaPrumo tamanho="medio" />
      <h1 className="fonte-display mt-4 text-2xl">Entrar no sistema</h1>
      <p className="mt-1 text-sm text-cinza-forte">
        Acesso da CAM, das áreas técnicas, dos gestores avaliados e da auditoria.
      </p>

      <form action="/api/sistema/entrar" method="post" className="mt-6 space-y-3">
        <input type="hidden" name="destino" value={destino ?? '/sistema'} />

        <div>
          <label htmlFor="email" className="rotulo">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            className="mt-1.5 w-full border border-tinta bg-white px-3 py-2 text-base"
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
            className="numero mt-1.5 w-full border border-tinta bg-white px-3 py-2 text-base"
          />
        </div>

        {erro ? <Aviso tom="alerta">{decodeURIComponent(erro)}</Aviso> : null}

        <Botao type="submit" variante="primario" tamanho="grande" className="w-full">
          Entrar
        </Botao>
      </form>

      {identidade.email && !identidade.autenticada ? (
        <p className="mt-4 text-xs text-vinho-alerta">
          A conta {identidade.email} não tem vínculo com nenhum perfil do processo. Peça à
          CAM para cadastrar o vínculo antes de acessar.
        </p>
      ) : null}

      <Link href="/" className="rotulo mt-6 hover:text-tinta">
        ← Voltar ao início
      </Link>
    </main>
  )
}
