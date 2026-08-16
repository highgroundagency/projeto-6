import type { Metadata } from 'next'
import Link from 'next/link'
import { MarcaCesar } from '@/components/base/marca'
import { Num } from '@/components/base/num'
import { Aviso } from '@/components/sistema/base'
import { ICONE_DA_TELA } from '@/components/sistema/icones'
import { ExplicacaoDosPerfis } from '@/components/sistema/perfis'
import { Tela } from '@/components/sistema/tela'
import { TelaAnalytics } from '@/components/sistema/telas/analytics'
import { TelaAuditoria } from '@/components/sistema/telas/auditoria'
import { TelaCam } from '@/components/sistema/telas/cam'
import { TelaContestacao } from '@/components/sistema/telas/contestacao'
import { TelaGestao } from '@/components/sistema/telas/gestao'
import { TelaIndicadores } from '@/components/sistema/telas/indicadores'
import { TelaLancamento } from '@/components/sistema/telas/lancamento'
import { TelaMeuResultado } from '@/components/sistema/telas/meu-resultado'
import type { ContextoTela } from '@/components/sistema/telas/tipos'
import { PalcoDoTutorial, passosDoTutorial } from '@/components/sistema/tour'
import { Tutorial } from '@/components/sistema/tutorial'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { PERFIS, type Feature, type FeatureId } from '@/lib/features'
import { featuresDoPerfilAtual, featuresLiberadas, identidadeAtual } from '@/lib/sistema'
import { lerParametros, linkDaTela, type ParametrosSistema } from '@/lib/sistema/parametros'
import { obterVisao } from '@/lib/visao'

export const metadata: Metadata = {
  title: 'Sistema',
  description: 'MVP do sistema de cálculo da gratificação por desempenho.',
}

export const dynamic = 'force-dynamic'

/** Primeiro ciclo que libera alguma funcionalidade — usado na mensagem de espera. */
const PRIMEIRO_CICLO_COM_FUNCIONALIDADE = 's5'

/**
 * O sumário, grudado no topo enquanto se rola.
 *
 * Cada item é um botão de verdade: borda, ícone e rótulo. A barra antiga eram
 * links soltos que ninguém identificava como clicáveis, repetindo uma grade de
 * cartões logo abaixo — duas navegações para o mesmo lugar. Ficou uma.
 *
 * SÓ AS TELAS DO PERFIL. Nada em cinza, nada de "indisponível": o que não é
 * seu não aparece.
 *
 * `overflow-x-auto` com `whitespace-nowrap` é o que segura 360px — em tela
 * estreita a fila rola na horizontal em vez de estourar a largura do corpo.
 */
function Sumario({
  telas,
  params,
  ativa,
}: {
  telas: readonly Feature[]
  params: ParametrosSistema
  ativa?: string
}) {
  return (
    <nav
      id="sumario"
      aria-label="Telas do sistema"
      className="sticky top-0 z-30 -mx-5 border-y border-linha bg-fundo/95 px-5 py-2.5 backdrop-blur sm:-mx-8 sm:px-8"
    >
      {/* Rola na horizontal enquanto a tela é estreita; a partir de sm as
          pílulas quebram em linha, para nenhuma ficar cortada na borda. */}
      <ul className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible">
        {telas.map((feature) => {
          const Icone = ICONE_DA_TELA[feature.id as FeatureId]
          const atual = feature.id === ativa
          return (
            <li key={feature.id} className="shrink-0">
              <a
                href={linkDaTela(params, feature.id as FeatureId)}
                aria-current={atual ? 'true' : undefined}
                className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs whitespace-nowrap transition-colors hover:border-acento hover:text-acento ${
                  atual ? 'border-acento text-acento' : 'border-linha'
                }`}
              >
                <Icone aria-hidden size={15} strokeWidth={1.5} />
                {feature.rotulo}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * O sistema inteiro, numa página só (ADR-023).
 *
 * Antes cada funcionalidade era uma rota: clicar levava embora, e de lá não
 * existia caminho de volta a não ser o botão do navegador. Agora o sumário fica
 * grudado no topo e cada tela abre logo abaixo, na mesma página.
 *
 * A ORDEM DOS GATES IMPORTA e é esta:
 *
 *   1. release — a tela existe hoje?
 *   2. perfil  — ela é de quem está aqui?
 *   3. só então o componente é montado.
 *
 * Sanfona fechada NÃO esconde HTML (ADR-018): quem não passou pelos dois gates
 * não chega a ser renderizado. Inverter isso derrubaria o §6.2 sem que nada
 * aparentemente quebrasse, que é o pior tipo de regressão.
 */
export default async function SistemaCompleto({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const visao = await obterVisao()
  const identidade = await identidadeAtual()
  const params = lerParametros(await searchParams)

  const liberadas = featuresLiberadas(visao)
  const doPerfil = featuresDoPerfilAtual(visao, identidade.perfil)
  const abertura = cicloPorId(PRIMEIRO_CICLO_COM_FUNCIONALIDADE)

  const ctx: ContextoTela = {
    params,
    perfil: identidade.perfil,
    admin: visao.admin && !visao.verComoVisitante,
    disponiveis: doPerfil.map((f) => f.id as FeatureId),
    gestorId: identidade.gestorId,
  }

  /** O corpo de cada tela, sem a casca. Serve à página e ao palco do tutorial. */
  function corpoDaTela(id: FeatureId): React.ReactNode {
    switch (id) {
      case 'painel-cam':
        return <TelaCam ctx={ctx} />
      case 'indicadores':
        return <TelaIndicadores />
      case 'lancamento':
        return <TelaLancamento ctx={ctx} />
      case 'meu-resultado':
        return <TelaMeuResultado ctx={ctx} />
      case 'auditoria':
        return <TelaAuditoria ctx={ctx} />
      case 'painel-gestao':
        return <TelaGestao ctx={ctx} />
      case 'analytics':
        return <TelaAnalytics />
      case 'contestacao':
        return <TelaContestacao ctx={ctx} />
    }
  }

  /** Monta a tela só se ela sobreviveu aos dois gates. */
  function montar(id: FeatureId) {
    const feature = doPerfil.find((f) => f.id === id)
    if (!feature) return null
    return (
      <Tela key={id} feature={feature} aberta={params.abrir === id}>
        {corpoDaTela(id)}
      </Tela>
    )
  }

  /**
   * MODO TUTORIAL.
   *
   * `?passo=N` troca a página inteira: uma tela só no palco, o alvo do passo
   * contornado e a barra do guia no rodapé. Sai antes de qualquer outra coisa
   * ser montada, porque o ponto do passeio é justamente não ter distração.
   *
   * O passo é clampado em vez de devolver 404: `?passo=99` digitado à mão leva
   * ao último passo, não a uma página de erro no meio de um tutorial.
   */
  const passos = passosDoTutorial(identidade.perfil, ctx.disponiveis)
  const passoPedido = Number(params.passo)
  if (params.passo && passos.length > 0 && Number.isFinite(passoPedido)) {
    const indice = Math.min(Math.max(Math.trunc(passoPedido), 1), passos.length)
    const passo = passos[indice - 1]

    return (
      <PalcoDoTutorial
        perfil={identidade.perfil}
        passos={passos}
        indice={indice}
        params={params}
      >
        {passo.tela ? corpoDaTela(passo.tela) : null}
      </PalcoDoTutorial>
    )
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-linha pb-5">
        <h1 className="fonte-display text-2xl sm:text-3xl">Gratificação por desempenho</h1>
        {/* A logo da instituição fecha o cabeçalho do MVP: quem abre esta tela
            numa banca precisa saber de onde ela vem sem voltar para a home. */}
        <MarcaCesar className="h-7 shrink-0" />
      </header>

      {liberadas.length === 0 ? (
        <section className="mt-8 border border-dashed border-linha px-5 py-8">
          <h2 className="fonte-display text-xl">O sistema ainda não entrou em operação</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed">
            As telas do MVP são liberadas a partir da <strong>{abertura?.rotulo}</strong>, em{' '}
            <Num>{abertura ? formatarBR(abertura.data) : 'data a definir'}</Num>. Até lá, a
            trajetória do projeto está no{' '}
            <Link href="/registro" className="underline underline-offset-4">
              registro
            </Link>
            .
          </p>
          <p className="mt-3 max-w-prose text-xs text-apagado">
            Esta página não lista o que ainda não existe: funcionalidade não liberada responde
            404, e não uma prévia do que vem por aí.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-7" aria-labelledby="titulo-perfil">
            <h2 id="titulo-perfil" className="rotulo">
              Você está usando como {PERFIS[identidade.perfil].rotulo}
            </h2>
            <p className="mt-1 max-w-prose text-sm text-apagado">
              {PERFIS[identidade.perfil].quemE}
            </p>

            <div className="mt-4">
              <Tutorial
                perfil={identidade.perfil}
                disponiveis={ctx.disponiveis}
                params={params}
              />
            </div>
          </section>

          {/* SUMÁRIO, TELAS E PAPÉIS DIVIDEM ESTE CONTÊINER de propósito:
              `position: sticky` só gruda enquanto o PAI está em tela. Num
              invólucro só dele, o sumário rolaria para fora na primeira
              passada, que é exatamente o oposto de ficar fixo no topo. */}
          <div className="mt-6">
            {doPerfil.length > 0 ? (
              <Sumario telas={doPerfil} params={params} ativa={params.abrir} />
            ) : null}

            {doPerfil.length === 0 ? (
              <Aviso>
                Nenhuma das telas já liberadas pertence a este perfil. Troque o papel no seletor
                acima para ver o sistema pelos olhos de quem o usa nesta etapa.
              </Aviso>
            ) : (
              <section className="mt-5" aria-labelledby="titulo-telas">
                <h2 id="titulo-telas" className="sr-only">
                  Telas
                </h2>
                <p className="text-sm lowercase text-apagado">
                  clique num título e a tela abre aqui mesmo. nada abre em outra página.
                </p>

                <div className="mt-4">
                  {montar('painel-cam')}
                  {montar('indicadores')}
                  {montar('lancamento')}
                  {montar('meu-resultado')}
                  {montar('auditoria')}
                  {montar('painel-gestao')}
                  {montar('analytics')}
                  {montar('contestacao')}
                </div>
              </section>
            )}

            <section className="mt-10" aria-labelledby="titulo-papeis">
              <h2 id="titulo-papeis" className="rotulo">
                Os quatro papéis do processo
              </h2>
              <p className="mt-1 max-w-prose text-sm text-apagado">
                Quem é cada pessoa na SESAU, o que ela faz e o que o processo impede que ela
                faça. É esta divisão que o seletor lá em cima simula.
              </p>
              <div className="mt-4">
                <ExplicacaoDosPerfis telas={liberadas} destacar={identidade.perfil} />
              </div>
            </section>
          </div>
        </>
      )}
    </>
  )
}
