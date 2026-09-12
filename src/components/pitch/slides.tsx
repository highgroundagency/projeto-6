import type { ReactNode } from 'react'
import { MarcaCesar } from '@/components/base/marca'
import { Etiqueta } from '@/components/base/selo'
import { HorizonteDoRecife } from '@/components/pitch/horizonte'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import { WIREFRAMES } from '@/components/wireframe'
import {
  BENCHMARKING,
  CONCLUSAO_CURTA,
  CSD,
  PONTO_DE_COMPARACAO,
  RAZOES_DA_ESCOLHA,
  SWOT,
  TECNICAS_DE_IDEACAO,
} from '@/content/analises'
import { EQUIPE, nomeCurto } from '@/content/equipe'
import resultados from '@/content/ml/resultados.json'
import {
  CAMINHO_DO_NUMERO,
  COMPROMISSOS_ATE_O_SR1,
  FONTES_DA_PESQUISA,
  LEGENDAS_DO_WIREFRAME,
  ROTEIRO,
  ROTULO_DO_MAPA,
  CONTAGENS_PITCH,
  DEMO_PITCH,
  ETAPAS_DO_MES,
  FRASE_DO_MODELO,
  LEGENDAS_DA_BASE,
  LEGENDAS_DE_RISCO,
  ROTULOS_DA_BASE,
  ROTULOS_DE_RISCO,
  PAPEIS_EM_UMA_LINHA,
  PESSOAS,
  ROTULO_DA_DEMO,
  SLIDES,
  formatarTempo,
  inicioDoSlide,
  type Slide,
} from '@/content/pitch'
import {
  CLIENTE,
  ENDERECO_SITE,
  INSTITUICAO,
  OBJETIVOS_ESPECIFICOS,
  PRODUTO,
  URL_SITE,
} from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { avaliacoesDaUnidade, carregarDados } from '@/lib/dados/consultas'
import { formatarBR } from '@/lib/datas'
import { cn } from '@/lib/utils'

/**
 * Os nove slides, renderizados no servidor.
 *
 * Cada slide é uma `<section>` com `data-slide`, e a página inteira é uma
 * pilha legível sem JavaScript. O componente cliente (`deck.tsx`) só decide
 * qual seção aparece. Nenhum texto de slide passa por props para ele.
 *
 * NENHUM LITERAL DE CONTEÚDO AQUI DENTRO: todo texto de tela vem de
 * `src/content/pitch.ts`, porque é lá que `pitch.test.ts` conta as palavras e
 * impõe o teto por slide. O que este arquivo escolhe é a FORMA do visual, não
 * as palavras. Número vindo de dado real (a contagem da base, a acurácia do
 * modelo, as datas do cronograma) é exceção declarada: ele não é texto de
 * autor, e mudá-lo à mão seria inventar evidência.
 *
 * O visual segue a folha de especificação: hairlines que se encostam, tudo
 * minúsculo, caixa alta só em rótulo, e no máximo três usos do acento por
 * tela. O slide da demonstração veste a pele do sistema por dentro, porque o
 * que ele mostra É o sistema.
 */
export async function Slides() {
  const dados = await carregarDados()
  const avaliacao = (await avaliacoesDaUnidade(DEMO_PITCH.unidadeId)).find(
    (a) => a.cicloId === DEMO_PITCH.cicloId,
  )
  if (!avaliacao) throw new Error(`Demonstração sem avaliação: ${DEMO_PITCH.unidadeId}`)
  const unidadeDemo = dados.unidadePorId(DEMO_PITCH.unidadeId)
  const ko = cicloPorId('ko')

  const [
    capa,
    roteiro,
    problema,
    evidencias,
    objetivos,
    quemSofre,
    csd,
    referencias,
    ideacao,
    escolha,
    wireframes,
    ideia,
    comoFunciona,
    dadosSlide,
    riscos,
    cronograma,
    fechamento,
  ] = SLIDES

  // O JSON dos modelos é heterogêneo; só o classificador tem acurácia e referência.
  const classificador = resultados.modelos.find((m) => m.modelo === 'classificacao')
  const acuracia = classificador?.metricas?.acuracia
  const referencia = classificador?.referencia?.acuracia
  const comparacao =
    typeof acuracia === 'number' && typeof referencia === 'number' ? { acuracia, referencia } : null

  return (
    <>
      {/* 1 · Capa */}
      <Quadro slide={capa} className="grao">
        <span className="pilula self-start">
          kick-off · {formatarBR(ko.data)} · {INSTITUICAO.equipe} · {INSTITUICAO.escola}
        </span>
        <h1 className="hero mt-6">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h1>
        <p className="slide-apoio text-texto">{capa.apoio}</p>
        <p className="mt-6 text-sm">{CLIENTE.orgao}</p>
        {/* A EQUIPE INTEIRA na capa, não só quem fala. O briefing manda todo
            mundo estar presente e diz que o professor pode perguntar a
            qualquer um: quem assiste precisa saber de quem é cada rosto antes
            da primeira fala. Quem entrou depois do início aparece igual, e a
            nota do slide diz desde quando. */}
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {EQUIPE.map((integrante) => (
            <li key={integrante.id}>{integrante.nome}</li>
          ))}
        </ul>
        <MarcaCesar className="mt-8 h-8 self-start" />
        <HorizonteDoRecife className="horizonte" />
      </Quadro>

      {/* 2 · O roteiro. Meio slide, dez segundos: só para a plateia saber onde
          a fala vai parar. A ordem é a dos sete critérios do briefing. */}
      <Quadro slide={roteiro}>
        <Titulo slide={roteiro} />
        <ol className="cascata mt-8 grid sm:grid-cols-2 md:grid-cols-4">
          {ROTEIRO.map((parada, indice) => (
            <li key={parada} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{parada}</p>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 3 · O problema */}
      <Quadro slide={problema}>
        <Titulo slide={problema} />
        <ol className="cascata relative mt-8 grid md:grid-cols-5">
          {/* O ponto que percorre o caminho e trava na etapa da planilha. Só
              aparece na largura em que as cinco etapas ficam lado a lado:
              empilhadas, ele andaria na diagonal e não diria nada. */}
          <span aria-hidden className="viajante hidden md:block" />
          {ETAPAS_DO_MES.map((etapa, indice) => (
            <li
              key={etapa.quem}
              className={cn('bloco-raso md:-ml-px', etapa.quebra && 'border-acento md:z-10')}
            >
              <span className="ordinal">0{indice + 1}</span>
              <p className="mt-2 text-lg text-texto">{etapa.quem}</p>
              <p className="mt-1 text-base">{etapa.oQue}</p>
              {etapa.quebra ? (
                <Etiqueta tom="acento" className="mt-3">
                  aqui quebra
                </Etiqueta>
              ) : null}
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 4 · De onde saiu a pesquisa. Uma fonte por cartão, com a data: o
          critério pede evidência, e evidência sem origem não é evidência. */}
      <Quadro slide={evidencias}>
        <Titulo slide={evidencias} />
        <ol className="cascata mt-8 grid md:grid-cols-3">
          {FONTES_DA_PESQUISA.map((item, indice) => (
            <li key={item.fonte} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-2xl">{item.fonte}</p>
              <p className="mt-2 text-base">{item.onde}</p>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 5 · Os objetivos. O geral é a frase de apoio; os específicos são a
          grade, cada um com o prazo em que a gente se compromete. */}
      <Quadro slide={objetivos}>
        <Titulo slide={objetivos} />
        <ol className="cascata mt-8 grid sm:grid-cols-2 md:grid-cols-3">
          {OBJETIVOS_ESPECIFICOS.map((objetivo, indice) => (
            <li key={objetivo.resumo} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{objetivo.resumo}</p>
              <p className="rotulo mt-2">{objetivo.quando}</p>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 6 · Quem sofre */}
      <Quadro slide={quemSofre}>
        <Titulo slide={quemSofre} />
        {/* O MESMO NÚMERO do título, gigante, atrás das três pessoas: é o
            valor que a demonstração calcula no slide seguinte, lido do motor.
            A plateia reencontra o número dois slides depois, e aí ele se
            explica. Decorativo para o leitor de tela, então fica escondido. */}
        <span aria-hidden className="fantasma numero">
          {avaliacao.score.toFixed(2).replace('.', ',')}
        </span>
        <ul className="cascata mt-8 grid md:grid-cols-3">
          {PESSOAS.map((pessoa) => (
            <li key={pessoa.papel} className="bloco-raso md:-ml-px">
              <p className="rotulo">{pessoa.papel}</p>
              <p className="titulo-bloco mt-2 text-2xl">{pessoa.quem}</p>
              <p className="mt-3 text-base">{pessoa.dor}</p>
            </li>
          ))}
        </ul>
        <p className="rotulo mt-4">{ROTULO_DO_MAPA}</p>
      </Quadro>

      {/* 7 · A matriz CSD. Três colunas, a contagem de cada uma no número
          grande, e os dois primeiros itens como amostra: a matriz inteira é o
          documento do ciclo, não o slide. */}
      <Quadro slide={csd}>
        <Titulo slide={csd} />
        <dl className="cascata mt-8 grid md:grid-cols-3">
          {CSD.map((coluna) => (
            <div key={coluna.chave} className="bloco-raso md:-ml-px">
              <dt>
                <span className="numero text-4xl text-texto">{coluna.itens.length}</span>{' '}
                <span className="rotulo">{coluna.titulo}</span>
              </dt>
              <dd className="mt-3">
                <ul className="space-y-1 text-base">
                  {coluna.itens.slice(0, 2).map((item) => (
                    <li key={item.resumo}>{item.resumo}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Quadro>

      {/* 8 · Benchmarking e SWOT no mesmo slide: os dois respondem à mesma
          pergunta, o que já existe lá fora e o que temos aqui dentro. */}
      <Quadro slide={referencias}>
        <Titulo slide={referencias} />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <ul className="cascata grid">
              {BENCHMARKING.slice(0, 3).map((referencia) => (
                <li key={referencia.curto} className="bloco-raso">
                  <p className="titulo-bloco text-lg">{referencia.curto}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-l-2 border-acento pl-3 text-base text-texto">
              {CONCLUSAO_CURTA}
            </p>
          </div>
          <dl className="cascata grid grid-cols-2">
            {SWOT.map((quadrante) => (
              <div key={quadrante.titulo} className="bloco-raso -ml-px">
                <dt className="rotulo">{quadrante.titulo}</dt>
                <dd className="mt-2 text-base">{quadrante.curto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Quadro>

      {/* 9 · As três técnicas de ideação, com o tempo de cada e o que saiu. */}
      <Quadro slide={ideacao}>
        <Titulo slide={ideacao} />
        <ol className="cascata mt-8 grid md:grid-cols-3">
          {TECNICAS_DE_IDEACAO.map((tecnica) => (
            <li key={tecnica.nome} className="bloco-raso md:-ml-px">
              <p className="numero text-4xl text-texto">{tecnica.minutos} min</p>
              <p className="titulo-bloco mt-3 text-xl">{tecnica.nome}</p>
              <p className="mt-2 text-base">{tecnica.produtoCurto}</p>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 10 · A escolha e as quatro razões. As notas das oito alternativas
          ficam no documento; aqui entra só a que venceu e o porquê. */}
      <Quadro slide={escolha}>
        <Titulo slide={escolha} />
        <ul className="cascata mt-8 grid sm:grid-cols-2 md:grid-cols-4">
          {RAZOES_DA_ESCOLHA.map((razao) => (
            <li key={razao.titulo} className="bloco-raso md:-ml-px">
              <p className="rotulo">{razao.titulo}</p>
              <p className="mt-2 text-base">{razao.curto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-base">{PONTO_DE_COMPARACAO}</p>
      </Quadro>

      {/* 11 · Do papel para a tela: os quatro wireframes lado a lado. O
          desenho não tem uma palavra dentro; a legenda vem de pitch.ts. */}
      <Quadro slide={wireframes}>
        <Titulo slide={wireframes} />
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {WIREFRAMES.map(({ id, Desenho }, indice) => (
            <li key={id}>
              <Desenho className="w-full" />
              <p className="rotulo mt-2">{LEGENDAS_DO_WIREFRAME[indice]}</p>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 12 · A ideia, ao vivo. A tela é da demonstração; a explicação é da fala. */}
      <Quadro slide={ideia} className="slide-demo">
        <Titulo slide={ideia} />
        <div
          data-pele="sistema"
          className="demo mt-4 rounded-2xl bg-fundo p-4 text-texto sm:p-5"
        >
          <p className="rotulo">
            {unidadeDemo?.nome ?? DEMO_PITCH.unidadeId} · {ROTULO_DA_DEMO}
          </p>
          <div className="mt-3">
            <CartaoScore avaliacao={avaliacao} />
          </div>
          <div className="mt-3">
            <MemoriaDeCalculo avaliacao={avaliacao} aberta compacta />
          </div>
        </div>
      </Quadro>

      {/* 13 · Como funciona */}
      <Quadro slide={comoFunciona}>
        <Titulo slide={comoFunciona} />
        <ol className="cascata mt-8 grid md:grid-cols-4">
          {CAMINHO_DO_NUMERO.map((passo, indice) => (
            <li key={passo.nome} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{passo.nome}</p>
              <p className="mt-1 text-base">{passo.como}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <ul className="grid gap-x-10 gap-y-1 text-base sm:grid-cols-2">
            {PAPEIS_EM_UMA_LINHA.map((papel) => (
              <li key={papel.papel}>
                <span className="text-texto">{papel.papel}</span> {papel.faz}
              </li>
            ))}
          </ul>
        </div>
      </Quadro>

      {/* 14 · Dados */}
      <Quadro slide={dadosSlide}>
        <Titulo slide={dadosSlide} />
        <dl className="cascata mt-8 grid md:grid-cols-3">
          <Contagem numero={dados.unidades.length} rotulo={ROTULOS_DA_BASE.unidades}>
            {LEGENDAS_DA_BASE.unidades}
          </Contagem>
          <Contagem numero={dados.subindicadores.length} rotulo={ROTULOS_DA_BASE.subindicadores}>
            {LEGENDAS_DA_BASE.subindicadores}
          </Contagem>
          <Contagem numero={dados.ciclos.length} rotulo={ROTULOS_DA_BASE.competencias}>
            {LEGENDAS_DA_BASE.competencias}
          </Contagem>
        </dl>
        <p className="mt-6 max-w-prose text-sm">
          {FRASE_DO_MODELO}
          {comparacao ? (
            <>
              :{' '}
              <span className="numero text-texto">{decimal(comparacao.acuracia)}</span> contra{' '}
              <span className="numero text-texto">{decimal(comparacao.referencia)}</span>
            </>
          ) : null}
          .
        </p>
      </Quadro>

      {/* 15 · Riscos e transparência */}
      <Quadro slide={riscos}>
        <Titulo slide={riscos} />
        <dl className="cascata mt-8 grid md:grid-cols-4">
          <Contagem numero={CONTAGENS_PITCH.ameacasStride} rotulo={ROTULOS_DE_RISCO.stride}>
            {LEGENDAS_DE_RISCO.stride}
          </Contagem>
          <Contagem numero={CONTAGENS_PITCH.itensOwasp} rotulo={ROTULOS_DE_RISCO.owasp}>
            {LEGENDAS_DE_RISCO.owasp}
          </Contagem>
          <Contagem
            numero={CONTAGENS_PITCH.principiosPrivacidade}
            rotulo={ROTULOS_DE_RISCO.privacidade}
          >
            {LEGENDAS_DE_RISCO.privacidade}
          </Contagem>
          <Contagem numero={CONTAGENS_PITCH.usosDeIa} rotulo={ROTULOS_DE_RISCO.ia}>
            {LEGENDAS_DE_RISCO.ia}
          </Contagem>
        </dl>
      </Quadro>

      {/* 16 · O cronograma: os três compromissos até o SR1, cada um com a
          data que vem do cronograma e o nome de quem puxa. */}
      <Quadro slide={cronograma}>
        <Titulo slide={cronograma} />
        <ol className="cascata mt-8 grid md:grid-cols-3">
          {COMPROMISSOS_ATE_O_SR1.map((item, indice) => {
            const ciclo = cicloPorId(item.ciclo)
            const ultimo = indice === COMPROMISSOS_ATE_O_SR1.length - 1
            return (
              <li
                key={item.ciclo}
                className={cn('bloco-raso md:-ml-px', ultimo && 'border-acento md:z-10')}
              >
                <p className="rotulo">{ciclo.rotulo.toLowerCase()}</p>
                <p className="numero mt-1 text-2xl text-texto">{formatarBR(ciclo.data)}</p>
                <p className="mt-2 text-sm">{item.compromisso}</p>
                <p className="rotulo mt-2">{nomeCurto(item.quem).toLowerCase()}</p>
              </li>
            )
          })}
        </ol>
      </Quadro>

      {/* 17 · Fechamento */}
      <Quadro slide={fechamento} className="grao">
        <h2 className="hero">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h2>
        <p className="slide-apoio text-texto">{fechamento.apoio}</p>
        <a
          href={URL_SITE}
          className="numero mt-6 inline-block self-start text-xl text-texto underline decoration-linha-alta underline-offset-8 hover:decoration-acento sm:text-3xl"
        >
          {ENDERECO_SITE}
        </a>
        <p className="mt-8 text-sm">
          {INSTITUICAO.escola} · {INSTITUICAO.curso} · {INSTITUICAO.periodo} ·{' '}
          {INSTITUICAO.equipe}
        </p>
        <p className="fonte-display mt-10 text-2xl">perguntas?</p>
        <HorizonteDoRecife className="horizonte" />
      </Quadro>
    </>
  )
}

/* ------------------------------------------------------------------------- */

function Quadro({
  slide,
  className,
  children,
}: {
  slide: Slide
  className?: string
  children: ReactNode
}) {
  const indice = SLIDES.findIndex((s) => s.id === slide.id)
  const quemFala = nomeCurto(slide.quemFala)

  return (
    <section
      id={`slide-${slide.numero}`}
      data-slide={slide.numero}
      aria-label={`Slide ${slide.numero} de ${SLIDES.length}: ${slide.titulo}`}
      className={cn('slide', className)}
    >
      <div className="slide-corpo flex flex-col">{children}</div>

      <details className="notas sem-impressao">
        <summary>
          <span className="rotulo">notas</span>
          <span>
            {quemFala.toLowerCase()} · {formatarTempo(slide.segundos)} · começa em{' '}
            {formatarTempo(inicioDoSlide(indice))}
          </span>
        </summary>
        <ol>
          {slide.notas.map((nota) => (
            <li key={nota}>{nota}</li>
          ))}
        </ol>
      </details>

      <footer className="slide-rodape">
        <span>
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento">
            _
          </span>{' '}
          · kick-off
        </span>
        <span className="numero">
          {slide.numero}/{SLIDES.length}
        </span>
      </footer>
    </section>
  )
}

function Titulo({ slide }: { slide: Slide }) {
  return (
    <>
      <h2 className="slide-titulo">{slide.titulo}</h2>
      <p className="slide-apoio">{slide.apoio}</p>
    </>
  )
}

function Contagem({
  numero,
  rotulo,
  children,
}: {
  numero: number
  rotulo: string
  children: ReactNode
}) {
  return (
    <div className="bloco-raso md:-ml-px">
      <dt className="rotulo">{rotulo}</dt>
      <dd className="odometro fonte-display numero mt-1 text-6xl leading-none">{numero}</dd>
      <dd aria-hidden className="risco-anima mt-3 h-px w-10 bg-linha-alta" />
      <dd className="mt-2 text-sm">{children}</dd>
    </div>
  )
}

/** 0,667 em vez de 0.667: a tela fala português. */
function decimal(valor: number): string {
  return valor.toFixed(3).replace('.', ',')
}
