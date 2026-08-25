import type { Metadata } from 'next'
import Link from 'next/link'
import { GitBranch, PencilLine, Scale, ScrollText, Sigma } from 'lucide-react'
import { AcaoDoFluxo, Conector, EstadoDoFluxo, Fluxo } from '@/components/base/fluxo'
import { Rodape } from '@/components/base/rodape'
import { URL_REPOSITORIO } from '@/content/produto'

export const metadata: Metadata = {
  title: 'Arquitetura',
  description: 'Os desenhos de contexto, contêineres e fluxo do Prumo, com a explicação do que é C4.',
}

/**
 * A arquitetura em desenhos, dentro do site (regra da casa nº 5: documento de
 * entrega é página, nunca arquivo para baixar).
 *
 * Os mesmos diagramas existem em Mermaid em docs/arquitetura.md; aqui eles são
 * redesenhados na identidade do site, com a explicação de C4 em linguagem
 * simples e o prompt que regenera tudo em qualquer IA. O leitor desta página é
 * a própria equipe e quem quiser entender o sistema sem abrir o repositório.
 */

const NIVEIS_C4 = [
  {
    nivel: '1 · contexto',
    mapa: 'o mapa-múndi',
    oQueMostra: 'O sistema é uma caixa única: quem o usa e com quem ele conversa.',
  },
  {
    nivel: '2 · contêineres',
    mapa: 'o mapa do país',
    oQueMostra:
      'Abre a caixa: as peças que executam ou guardam algo. Contêiner aqui não é Docker, é qualquer coisa que roda ou armazena.',
  },
  {
    nivel: '3 · componentes',
    mapa: 'o mapa da cidade',
    oQueMostra: 'Abre uma peça: os módulos dentro dela (motor de cálculo, portões, camada de dados).',
  },
  {
    nivel: '4 · código',
    mapa: 'a planta da casa',
    oQueMostra: 'Classes e funções. Quase ninguém desenha: o próprio código conta essa parte melhor.',
  },
] as const

const PESSOAS = [
  ['CAM', 'gere o mês: cadastra, abre o prazo, calcula, aprova e divulga'],
  ['Área técnica', 'informa os números da própria área, com a origem de cada um'],
  ['Gestor avaliado', 'vê a própria nota, a conta aberta, e contesta se discordar'],
  ['Auditoria', 'lê tudo, refaz a conta, não muda nada'],
  ['Professor', 'acompanha o registro semanal público do projeto'],
  ['Dono do site', 'opera as liberações por um painel protegido por senha'],
] as const

const EXTERNOS = [
  ['GitHub', 'guarda o código; cada atualização vira deploy sozinha'],
  ['Vercel', 'hospeda o site em funções que acordam por visita'],
  ['Google Drive', 'só um link para a pasta de documentos da equipe'],
] as const

const GRUPOS_CONTEINERES = [
  {
    grupo: 'na Vercel, a cada visita',
    itens: [
      {
        nome: 'Aplicação Next.js',
        tec: 'TypeScript · React Server Components',
        desc: 'O site, as 8 telas do sistema, o painel e o motor de cálculo (função pura). Tudo desenhado no servidor: quase nenhum JavaScript chega ao navegador.',
        desligado: false,
      },
      {
        nome: 'Middleware',
        tec: 'Edge runtime',
        desc: 'A primeira porta da rota /admin.',
        desligado: false,
      },
      {
        nome: 'Route handlers',
        tec: 'Node runtime',
        desc: 'Login, avanço de etapa, lançamento, contestação, exportar CSV, tema, perfil e health check.',
        desligado: false,
      },
    ],
  },
  {
    grupo: 'dados',
    itens: [
      {
        nome: 'Base sintética em memória',
        tec: 'TypeScript · semente fixa 20262',
        desc: '10 áreas, 10 gestores fictícios, 30 indicadores, 6 meses e a trilha imutável. É a fonte ativa; zera a cada deploy, e é assim de propósito.',
        desligado: false,
      },
      {
        nome: 'Schema PostgreSQL guardado',
        tec: 'SQL versionado · RLS e 4 gatilhos',
        desc: 'Escrito e testado contra um banco real no CI, e DESLIGADO do aplicativo por decisão de escopo. O cofre está pronto, na caixa.',
        desligado: true,
      },
    ],
  },
  {
    grupo: 'offline, antes do deploy',
    itens: [
      {
        nome: 'Pipeline de machine learning',
        tec: 'Python · scikit-learn',
        desc: 'Treina classificação, regressão e clustering sobre a base sintética e compara com um palpite bobo.',
        desligado: false,
      },
      {
        nome: 'resultados.json versionado',
        tec: 'JSON no repositório',
        desc: 'O laudo que a tela de analytics apenas lê. Nenhuma predição entra no cálculo da nota.',
        desligado: false,
      },
    ],
  },
] as const

const PROMPT_DIAGRAMAS = `Você é um arquiteto de software especialista no modelo C4. Crie os
diagramas do sistema descrito abaixo, em três entregas: (1) contexto,
C4 nível 1; (2) contêineres, C4 nível 2; (3) um fluxo simples do caminho
de um número, do lançamento até a nota.

Regras de honestidade, que valem mais que estética: não invente
componentes nem integrações; o banco aparece com anotação "escrito e
testado, NÃO ligado ao aplicativo"; o pipeline de ML roda offline e o
site apenas lê um JSON versionado, nenhuma predição entra no cálculo;
os dados são 100% sintéticos e vivem em memória; o seletor de papéis é
login simulado de demonstração.

FATOS. Nome: Prumo, sistema web acadêmico (CESAR School) que substitui
a planilha da gratificação por desempenho da SESAU Recife. Pessoas:
CAM (gere o mês e homologa), área técnica (informa os números da própria
área), gestor avaliado (vê a própria nota e contesta), auditoria (lê
tudo, não escreve), professor (lê o registro semanal), dono (opera
liberações por painel com senha). Externos: GitHub (código; push vira
deploy), Vercel (hospedagem serverless), Google Drive (só um link).
Contêineres: aplicação Next.js 15 App Router com React Server Components
(site, 8 telas, painel e motor de cálculo puro: score = soma de pontos x
peso sobre o máximo possível, x 100); middleware Edge protegendo /admin;
route handlers Node (login, ciclo, lançamento, contestação, CSV, tema,
perfil, status); base sintética em memória com semente fixa 20262 (10
áreas, 10 gestores, 30 indicadores, 6 meses, trilha imutável); motor de
liberações por calendário (conteúdo futuro não vai ao navegador; tela
não liberada responde 404); schema PostgreSQL versionado com RLS e 4
gatilhos, testado no CI e DESLIGADO; pipeline de ML offline em Python
que exporta src/content/ml/resultados.json. Relações: pessoas acessam
por HTTPS com formulários HTML puros; a aplicação lê a base em memória e
o JSON de ML; o schema pode ser semeado pela mesma base, mas nenhuma
requisição passa por ele.

SAÍDA: cada diagrama num bloco Mermaid separado (C4Context, C4Container
e flowchart), rótulos em português, uma linha por descrição, sem
travessão. Uma única cor de destaque, laranja #F7580B. Feche com uma
legenda de 3 linhas explicando como ler C4 para quem nunca viu.`

export default function PaginaArquitetura() {
  return (
    <main id="conteudo" className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
      <header className="border-b border-linha pb-5">
        <Link href="/" className="rotulo hover:text-texto">
          ← página inicial
        </Link>
        <h1 className="fonte-display mt-3 text-3xl">arquitetura em desenhos</h1>
        <p className="mt-2 max-w-prose border-l-2 border-acento pl-3 text-sm leading-relaxed">
          O Prumo por dentro, em três desenhos: quem usa, de que peças ele é feito e o caminho
          que um número percorre até virar nota. Sem precisar abrir o repositório.
        </p>
      </header>

      {/* ------------------------------------------------------------------ */}
      <section className="mt-8" aria-labelledby="titulo-c4">
        <h2 id="titulo-c4" className="titulo-bloco">
          antes de tudo: o que é C4?
        </h2>
        <p className="prosa mt-2 text-sm leading-relaxed">
          C4 é um jeito de desenhar a arquitetura de um sistema em quatro níveis de zoom, como
          um mapa. Esta página mostra os dois primeiros, que são os que importam para entender
          o projeto, mais o fluxo do cálculo.
        </p>
        <ul className="mt-4">
          {NIVEIS_C4.map((n) => (
            <li key={n.nivel} className="mt-[-1px] flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-linha px-4 py-2.5">
              <span className="rotulo w-36 shrink-0">{n.nivel}</span>
              <span className="numero text-xs text-acento">{n.mapa}</span>
              <span className="min-w-0 flex-1 basis-52 text-sm text-apagado">{n.oQueMostra}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="contexto" className="mt-10 scroll-mt-6" aria-labelledby="titulo-contexto">
        <h2 id="titulo-contexto" className="titulo-bloco">
          desenho 1 · contexto: o sistema visto de fora
        </h2>
        <p className="prosa mt-2 text-sm leading-relaxed">
          Leia de cima para baixo: as pessoas usam o Prumo, e o Prumo conversa com três coisas
          de fora.
        </p>

        <div className="mt-4">
          <p className="rotulo">quem usa</p>
          <ul className="mt-2">
            {PESSOAS.map(([quem, faz]) => (
              <li key={quem} className="mt-[-1px] flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-linha px-4 py-2.5">
                <span className="rotulo w-36 shrink-0 text-texto">{quem}</span>
                <span className="min-w-0 flex-1 basis-52 text-sm lowercase text-apagado">{faz}</span>
              </li>
            ))}
          </ul>

          <div aria-hidden className="conector mx-auto" />

          <div className="border-2 border-acento px-5 py-4 text-center">
            <p className="fonte-display text-xl">prumo</p>
            <p className="mt-1 text-sm lowercase text-apagado">
              o site do projeto e o sistema da gratificação, numa aplicação só
            </p>
          </div>

          <div aria-hidden className="conector mx-auto" />

          <p className="rotulo">com quem conversa</p>
          <ul className="mt-2">
            {EXTERNOS.map(([quem, como]) => (
              <li key={quem} className="mt-[-1px] flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-linha px-4 py-2.5">
                <span className="rotulo w-36 shrink-0 text-texto">{quem}</span>
                <span className="min-w-0 flex-1 basis-52 text-sm lowercase text-apagado">{como}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="conteineres" className="mt-10 scroll-mt-6" aria-labelledby="titulo-cont">
        <h2 id="titulo-cont" className="titulo-bloco">
          desenho 2 · contêineres: as peças da caixa
        </h2>
        <p className="prosa mt-2 text-sm leading-relaxed">
          Abrindo o Prumo, estas são as peças. A tracejada existe, está testada, e está
          desligada de propósito: nenhuma visita passa por ela.
        </p>

        {GRUPOS_CONTEINERES.map((g) => (
          <div key={g.grupo} className="mt-5">
            <p className="rotulo">{g.grupo}</p>
            <ul className="mt-2">
              {g.itens.map((c) => (
                <li
                  key={c.nome}
                  className={
                    c.desligado
                      ? 'mt-[-1px] border border-dashed border-linha-alta px-4 py-3'
                      : 'mt-[-1px] border border-linha px-4 py-3'
                  }
                >
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="rotulo text-texto">{c.nome}</span>
                    <span className="numero text-xs text-apagado">{c.tec}</span>
                    {c.desligado ? <span className="pilula">não ligado</span> : null}
                  </p>
                  <p className="prosa mt-1 text-sm lowercase text-apagado">{c.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      <section id="fluxo" className="mt-10 scroll-mt-6" aria-labelledby="titulo-fluxo">
        <h2 id="titulo-fluxo" className="titulo-bloco">
          desenho 3 · o caminho de um número
        </h2>
        <p className="prosa mt-2 text-sm leading-relaxed">
          Do dedo da área técnica até a nota do gestor, tudo passa por aqui, nesta ordem.
        </p>

        <div className="mt-6">
          <Fluxo>
            <AcaoDoFluxo icone={<PencilLine size={18} strokeWidth={1.5} />} titulo="Lançamento">
              a área informa o valor e diz de onde ele veio. entrada inválida é recusada na
              hora, e fora do prazo o campo trava.
            </AcaoDoFluxo>
            <Conector />
            <AcaoDoFluxo icone={<ScrollText size={18} strokeWidth={1.5} />} titulo="Trilha">
              cada lançamento vira um registro que não se apaga: quem, quando, e como estava
              antes.
            </AcaoDoFluxo>
            <Conector />
            <AcaoDoFluxo icone={<Scale size={18} strokeWidth={1.5} />} titulo="Regra vigente">
              a versão da regra que valia naquele mês entra na conta. regra não se edita:
              muda-se de versão.
            </AcaoDoFluxo>
            <Conector />
            <AcaoDoFluxo icone={<Sigma size={18} strokeWidth={1.5} />} titulo="Motor de cálculo">
              função pura: mesma entrada, mesma saída, sempre. sai a nota, a faixa e a memória
              de cálculo passo a passo.
            </AcaoDoFluxo>
            <Conector />
            <EstadoDoFluxo explicacao="o gestor vê a nota e a conta aberta; a gestão vê o agregado e exporta">
              nota + memória de cálculo
            </EstadoDoFluxo>
          </Fluxo>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      <section className="mt-10" aria-labelledby="titulo-prompt">
        <h2 id="titulo-prompt" className="titulo-bloco">
          quer redesenhar? o prompt está aqui
        </h2>
        <p className="prosa mt-2 text-sm leading-relaxed">
          Estes desenhos também existem em Mermaid no repositório (
          <a
            href={`${URL_REPOSITORIO}/blob/main/docs/arquitetura.md`}
            className="underline decoration-linha-alta underline-offset-4 hover:text-acento"
          >
            docs/arquitetura.md
          </a>
          ). E o texto abaixo, colado em qualquer IA, regenera os três em Mermaid, fiéis ao
          sistema real: os fatos e as regras de honestidade já vão dentro.
        </p>

        <details className="group mt-4 border border-linha">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm lowercase transition-colors hover:bg-superficie [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <GitBranch aria-hidden size={16} strokeWidth={1.5} className="text-apagado" />
              abrir o prompt completo
            </span>
            <span aria-hidden className="text-apagado transition-transform group-open:rotate-90">
              →
            </span>
          </summary>
          <pre className="overflow-x-auto border-t border-linha bg-superficie px-4 py-4 text-xs leading-relaxed whitespace-pre-wrap">
            {PROMPT_DIAGRAMAS}
          </pre>
        </details>
      </section>

      <Rodape className="mt-10" />
    </main>
  )
}
