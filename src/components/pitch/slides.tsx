import type { ReactNode } from 'react'
import { MarcaCesar } from '@/components/base/marca'
import { Etiqueta } from '@/components/base/selo'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import { integrantePorId } from '@/content/equipe'
import resultados from '@/content/ml/resultados.json'
import {
  CAMINHO_DO_NUMERO,
  COMPROMISSOS_ATE_O_SR1,
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
import { CLIENTE, ENDERECO_SITE, INSTITUICAO, PRODUTO, URL_SITE } from '@/content/produto'
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

  const [capa, problema, quemSofre, ideia, comoFunciona, dadosSlide, riscos, ateOSr1, fechamento] =
    SLIDES

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
        <MarcaCesar className="mt-8 h-8 self-start" />
      </Quadro>

      {/* 2 · O problema */}
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

      {/* 3 · Quem sofre */}
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
      </Quadro>

      {/* 4 · A ideia, ao vivo. A tela é da demonstração; a explicação é da fala. */}
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
            <MemoriaDeCalculo avaliacao={avaliacao} aberta />
          </div>
        </div>
      </Quadro>

      {/* 5 · Como funciona */}
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

      {/* 6 · Dados */}
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

      {/* 7 · Riscos e transparência */}
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

      {/* 8 · Até o SR1 */}
      <Quadro slide={ateOSr1}>
        <Titulo slide={ateOSr1} />
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
              </li>
            )
          })}
        </ol>
      </Quadro>

      {/* 9 · Fechamento */}
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
  const quemFala = integrantePorId(slide.quemFala).nome.split(' ')[0]

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
