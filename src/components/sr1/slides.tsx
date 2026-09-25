import type { ReactNode } from 'react'
import { MarcaCesar } from '@/components/base/marca'
import { Etiqueta } from '@/components/base/selo'
import { HorizonteDoRecife } from '@/components/pitch/horizonte'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import {
  ACHADOS_DA_PLANILHA,
  CITACAO_DA_SECRETARIA,
  COLUNAS_DA_ROTA,
  COLUNAS_DOS_ERROS,
  COMPROMISSOS_NO_SR1,
  CORRECAO_DE_ROTA,
  DATA_DO_SR1,
  DEMO_SR1,
  DESTAQUE_DO_MOTOR,
  ENDERECO_DA_ARQUITETURA,
  ENDERECO_DA_DEMO,
  ENDERECO_DO_ML,
  ETAPAS_DO_MES,
  FALTA_NA_CONFIANCA,
  FUNIL_SR1,
  LIMITE_DOS_MODELOS,
  MODELOS_SR1,
  NOME_DA_UNIDADE_DO_DECK,
  NIVEIS_C4,
  NOME_DO_PAPEL,
  ORDEM_DOS_PAPEIS,
  PARADAS_ATE_O_SR2,
  PILULA_DA_CAPA_SR1,
  REGRA_DA_PORTA,
  RISCOS_SR1,
  ROTEIRO_SR1,
  ROTULO_DA_BASE,
  ROTULO_DA_DEMO_SR1,
  ROTULO_DA_UNIDADE_DO_DECK,
  ROTULO_DAS_TELAS,
  ROTULO_SE_PERGUNTAREM_SR1,
  ROTULOS_DA_CONFIANCA,
  ROTULOS_DA_SEGURANCA,
  TELAS_NO_SR1,
  TESTES_DO_MOTOR,
  TIPOS_DE_UNIDADE,
  TRES_CONTAS,
  TRES_ERROS,
  classe,
  formatarTempo,
  inicioNaVersao,
  nota,
  notasNaVersao,
  segundosNaVersao,
  slidesDaVersao,
  telasDoPapel,
  type SlideSR1,
  type SlideSR1Id,
  type Versao,
} from '@/content/apresentacao-sr1'
import { EQUIPE, nomeCurto } from '@/content/equipe'
import { CONTAGENS_PITCH } from '@/content/pitch'
import { CLIENTE, ENDERECO_SITE, INSTITUICAO, PRODUTO, URL_SITE } from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { BASE } from '@/lib/seed'
import { cn } from '@/lib/utils'

/**
 * Os slides do SR1, renderizados no servidor.
 *
 * O MESMO CONTRATO DO KICK-OFF: cada slide é uma `<section>` com `data-slide`,
 * a página é uma pilha legível sem JavaScript, e o componente cliente
 * (`pitch/deck.tsx`, reaproveitado sem mudança) só decide qual seção aparece.
 * Nenhum texto passa por props para ele.
 *
 * NENHUM LITERAL DE CONTEÚDO AQUI: as palavras vêm de
 * `src/content/apresentacao-sr1.ts`, onde o teste conta o teto por slide. Os
 * números vêm do motor de cálculo, dos JSON dos cadernos e do cronograma.
 *
 * DUAS VERSÕES. A completa tem os dezesseis slides; a curta, só os que têm
 * `curto`, renumerados de 1 em diante, com a fala cortada nas primeiras linhas.
 * O corpo de cada slide é o mesmo nas duas: só muda quem entra.
 *
 * O ACENTO, SLIDE A SLIDE. O cursor do rodapé já é um uso; cada slide gasta no
 * máximo mais dois, sempre no ponto que a fala aponta.
 */
export function SlidesSR1({ versao }: { versao: Versao }) {
  const lista = slidesDaVersao(versao)
  const sr1 = cicloPorId('sr1')
  const mesesFechados = BASE.ciclos.filter(
    (c) => c.estado === 'homologado' || c.estado === 'publicado',
  ).length

  const corpo: Record<SlideSR1Id, (slide: SlideSR1) => ReactNode> = {
    /* 1 · Capa. A equipe inteira, não só quem fala. */
    capa: (slide) => (
      <>
        <span className="pilula self-start">
          {PILULA_DA_CAPA_SR1} · {formatarBR(DATA_DO_SR1)} · {INSTITUICAO.equipe} ·{' '}
          {INSTITUICAO.escola}
        </span>
        <h1 className="hero mt-6">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h1>
        <p className="slide-apoio text-texto">{slide.apoio}</p>
        <p className="mt-6 text-sm">{CLIENTE.orgao}</p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {EQUIPE.map((integrante) => (
            <li key={integrante.id}>{integrante.nome}</li>
          ))}
        </ul>
        <MarcaCesar className="mt-8 h-8 self-start" />
        <HorizonteDoRecife className="horizonte" />
      </>
    ),

    /* 2 · O roteiro: onde a fala vai parar. */
    roteiro: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {ROTEIRO_SR1.map((parada, indice) => (
            <li key={parada} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{parada}</p>
            </li>
          ))}
        </ol>
      </>
    ),

    /* 3 · O problema: o caminho do Kick-off, e agora a frase do cliente. */
    problema: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata relative mt-8 grid grid-cols-1 md:grid-cols-5">
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
        <figure className="mt-8 border-l border-linha-alta pl-4">
          <blockquote className="fonte-display text-2xl text-texto sm:text-3xl">
            “{CITACAO_DA_SECRETARIA.frase}”
          </blockquote>
          <figcaption className="rotulo mt-2">{CITACAO_DA_SECRETARIA.fonte}</figcaption>
        </figure>
      </>
    ),

    /* 4 · A planilha por dentro: o funil e três achados. */
    planilha: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <ol className="cascata grid grid-cols-1">
            {FUNIL_SR1.map((passo, indice) => (
              <li key={passo.rotulo} className="bloco-raso flex items-baseline gap-4">
                <span
                  className={cn(
                    'numero fonte-display w-24 shrink-0 text-4xl leading-none',
                    indice === FUNIL_SR1.length - 1 ? 'text-acento' : 'text-texto',
                  )}
                >
                  {passo.numero}
                </span>
                <span>
                  <span className="block text-base text-texto">{passo.rotulo}</span>
                  {'motivo' in passo ? (
                    <span className="rotulo mt-1 block">{passo.motivo}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
          <ul className="cascata grid grid-cols-1">
            {ACHADOS_DA_PLANILHA.map((achado) => (
              <li key={achado.texto} className="bloco-raso flex items-baseline gap-4">
                <span className="numero fonte-display w-16 shrink-0 text-3xl leading-none text-texto">
                  {achado.numero}
                </span>
                <span className="text-base">{achado.texto}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="rotulo mt-6">{ROTULO_DA_BASE}</p>
      </>
    ),

    /* 5 · Três coisas que a gente tinha errado. */
    erros: (slide) => (
      <>
        <Titulo slide={slide} />
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr>
              <th scope="col" className="rotulo pb-2 font-normal">
                {COLUNAS_DOS_ERROS.antes}
              </th>
              <th scope="col" className="rotulo pb-2 font-normal">
                {COLUNAS_DOS_ERROS.depois}
              </th>
            </tr>
          </thead>
          <tbody className="cascata">
            {TRES_ERROS.map((erro) => (
              <tr key={erro.antes} className="border-t border-linha">
                <td className="py-3 pr-6 text-lg line-through decoration-linha-alta">
                  {erro.antes}
                </td>
                <td className="py-3 text-lg text-texto">{erro.depois}</td>
              </tr>
            ))}
            <tr className="border-t border-linha">
              <td className="py-3 pr-6 text-lg line-through decoration-linha-alta">
                {TIPOS_DE_UNIDADE.antes}
              </td>
              <td className="py-3 text-lg text-texto">{TIPOS_DE_UNIDADE.depois}</td>
            </tr>
          </tbody>
        </table>
      </>
    ),

    /* 6 · A regra mudou, e maio não: a mesma unidade em três contas. O
       acento vai no número que NÃO mudou, que é o que o título afirma. */
    regra: (slide) => (
      <>
        <Titulo slide={slide} />
        <p className="rotulo mt-6">
          {NOME_DA_UNIDADE_DO_DECK} · {ROTULO_DA_UNIDADE_DO_DECK}
        </p>
        <ol className="cascata mt-3 grid grid-cols-1 md:grid-cols-3">
          {TRES_CONTAS.map((conta, indice) => (
            <li
              key={conta.id}
              className={cn('bloco-raso md:-ml-px', indice === 0 && 'border-acento md:z-10')}
            >
              <p className="rotulo">{conta.rotulo}</p>
              <p
                className={cn(
                  'numero fonte-display mt-3 text-5xl leading-none sm:text-6xl',
                  indice === 0 ? 'text-acento' : 'text-texto',
                )}
              >
                {nota(conta.avaliacao)}
              </p>
              <p className="mt-3 text-base">{classe(conta.avaliacao)}</p>
              <p className="rotulo mt-2">{conta.versao}</p>
            </li>
          ))}
        </ol>
      </>
    ),

    /* 7 · A demonstração. Ao vivo no sistema; de reserva, a conta de junho
       pela versão 3, calculada pelo motor na hora de montar o slide. */
    demo: (slide) => (
      <>
        <Titulo slide={slide} />
        <div data-pele="sistema" className="demo mt-4 rounded-2xl bg-fundo p-4 text-texto sm:p-5">
          <p className="rotulo">
            {NOME_DA_UNIDADE_DO_DECK} · {ROTULO_DA_DEMO_SR1} ·{' '}
            <span className="numero">{ENDERECO_DA_DEMO}</span>
          </p>
          <div className="mt-3">
            <CartaoScore avaliacao={DEMO_SR1.avaliacao} />
          </div>
          <div className="mt-3">
            <MemoriaDeCalculo avaliacao={DEMO_SR1.avaliacao} aberta compacta />
          </div>
        </div>
      </>
    ),

    /* 8 · Cada um vê o que é seu. */
    papeis: (slide) => (
      <>
        <Titulo slide={slide} />
        <ul className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {ORDEM_DOS_PAPEIS.map((papel) => (
            <li key={papel} className="bloco-raso md:-ml-px">
              <p className="numero fonte-display text-5xl leading-none text-texto">
                {telasDoPapel(papel)}
                <span className="rotulo ml-2 align-middle">
                  / {TELAS_NO_SR1.length} {ROTULO_DAS_TELAS}
                </span>
              </p>
              <p className="titulo-bloco mt-3 text-lg">{NOME_DO_PAPEL[papel]}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-l-2 border-acento pl-3 text-base text-texto">{REGRA_DA_PORTA}</p>
      </>
    ),

    /* 9 · Os quatro zooms do C4. */
    arquitetura: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {NIVEIS_C4.map((nivel, indice) => (
            <li key={nivel.nivel} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{nivel.nivel}</p>
              <p className="mt-2 text-base">{nivel.mostra}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-l-2 border-acento pl-3 text-base text-texto">{DESTAQUE_DO_MOTOR}</p>
        <Endereco rota={ENDERECO_DA_ARQUITETURA} />
      </>
    ),

    /* 10 · Como sabemos que a conta está certa. */
    confianca: (slide) => (
      <>
        <Titulo slide={slide} />
        <dl className="cascata mt-8 grid grid-cols-1 md:grid-cols-3">
          <Contagem numero={TESTES_DO_MOTOR} rotulo={ROTULOS_DA_CONFIANCA.testes}>
            {ROTULOS_DA_CONFIANCA.testesLegenda}
          </Contagem>
          <Contagem numero={BASE.regras.length} rotulo={ROTULOS_DA_CONFIANCA.regras}>
            {ROTULOS_DA_CONFIANCA.regrasLegenda}
          </Contagem>
          <Contagem numero={mesesFechados} rotulo={ROTULOS_DA_CONFIANCA.meses}>
            {ROTULOS_DA_CONFIANCA.mesesLegenda}
          </Contagem>
        </dl>
        <p className="mt-6 text-base">{FALTA_NA_CONFIANCA}</p>
      </>
    ),

    /* 11 · A base de verdade, na lente de aprendizado de máquina. */
    ml: (slide) => (
      <>
        <Titulo slide={slide} />
        <ul className="cascata mt-8 grid grid-cols-1 md:grid-cols-3">
          {MODELOS_SR1.map((modelo) => (
            <li key={modelo.id} className="bloco-raso md:-ml-px">
              <p className="rotulo">{modelo.tarefa}</p>
              <p className="numero fonte-display mt-3 text-5xl leading-none text-texto">
                {modelo.numero}
              </p>
              <p className="mt-2 text-base">{modelo.rotulo}</p>
              <p className="rotulo mt-2">{modelo.referencia}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-l-2 border-acento pl-3 text-base text-texto">
          {LIMITE_DOS_MODELOS}
        </p>
        <Endereco rota={ENDERECO_DO_ML} />
      </>
    ),

    /* 12 · Riscos, ditos antes. */
    riscos: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
          <ol className="cascata grid grid-cols-1">
            {RISCOS_SR1.map((risco, indice) => (
              <li key={risco} className="bloco-raso flex items-baseline gap-4">
                <span className="ordinal">0{indice + 1}</span>
                <span className="text-base text-texto">{risco}</span>
              </li>
            ))}
          </ol>
          <dl className="cascata grid grid-cols-1">
            <Contagem numero={CONTAGENS_PITCH.ameacasStride} rotulo={ROTULOS_DA_SEGURANCA.stride} />
            <Contagem numero={CONTAGENS_PITCH.itensOwasp} rotulo={ROTULOS_DA_SEGURANCA.owasp} />
          </dl>
        </div>
      </>
    ),

    /* 13 · O que prometemos, e o que fizemos. O estado é rótulo de estado:
       caixa alta, e o único acento é o que não foi feito. */
    prometido: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 md:grid-cols-3">
          {COMPROMISSOS_NO_SR1.map((item) => {
            const ciclo = cicloPorId(item.ciclo)
            return (
              <li key={item.ciclo} className="bloco-raso md:-ml-px">
                <p className="rotulo">
                  {ciclo.rotulo.toLowerCase()} · {formatarBR(ciclo.data)} ·{' '}
                  {nomeCurto(item.quem).toLowerCase()}
                </p>
                <p className="titulo-bloco mt-3 text-xl">{item.compromisso}</p>
                <Etiqueta
                  tom={item.estado === 'feito' ? 'ok' : item.estado === 'não feito' ? 'acento' : 'neutro'}
                  className="mt-3 uppercase"
                >
                  {item.estado}
                </Etiqueta>
                <p className="mt-3 text-base">{item.porque}</p>
              </li>
            )
          })}
        </ol>
      </>
    ),

    /* 14 · A correção de rota. */
    rota: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="rotulo">{COLUNAS_DA_ROTA.entra}</p>
            <ul className="cascata mt-3 grid grid-cols-1">
              {CORRECAO_DE_ROTA.entra.map((item) => (
                <li key={item} className="bloco-raso text-lg text-texto">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo">{COLUNAS_DA_ROTA.depois}</p>
            <ul className="cascata mt-3 grid grid-cols-1">
              {CORRECAO_DE_ROTA.depois.map((item) => (
                <li key={item} className="bloco-raso text-lg">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    ),

    /* 15 · Até o SR2: datas do cronograma, a validação em destaque. */
    sr2: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7">
          {PARADAS_ATE_O_SR2.map((parada) => {
            const ciclo = cicloPorId(parada.ciclo)
            return (
              <li
                key={parada.ciclo}
                className={cn('bloco-raso md:-ml-px', parada.destaque && 'border-acento md:z-10')}
              >
                <p className="numero text-xl text-texto">{formatarBR(ciclo.data).slice(0, 5)}</p>
                <p className="rotulo mt-1">{ciclo.rotulo.toLowerCase()}</p>
                <p className="mt-2 text-sm">{parada.entrega}</p>
              </li>
            )
          })}
        </ol>
      </>
    ),

    /* 16 · Fechamento. */
    fechamento: (slide) => (
      <>
        <h2 className="hero">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h2>
        <p className="slide-apoio text-texto">{slide.apoio}</p>
        <a
          href={URL_SITE}
          className="numero mt-6 inline-block self-start text-xl text-texto underline decoration-linha-alta underline-offset-8 hover:decoration-acento sm:text-3xl"
        >
          {ENDERECO_SITE}
        </a>
        <p className="mt-8 text-sm">
          {INSTITUICAO.escola} · {INSTITUICAO.curso} · {INSTITUICAO.periodo} ·{' '}
          {INSTITUICAO.equipe} · {sr1.rotulo.toLowerCase()}
        </p>
        <p className="fonte-display mt-10 text-2xl">perguntas?</p>
        <HorizonteDoRecife className="horizonte" />
      </>
    ),
  }

  const classeDoQuadro: Partial<Record<SlideSR1Id, string>> = {
    capa: 'grao',
    demo: 'slide-demo',
    fechamento: 'grao',
  }

  return (
    <>
      {lista.map((slide, indice) => (
        <Quadro
          key={slide.id}
          slide={slide}
          posicao={indice + 1}
          total={lista.length}
          inicio={inicioNaVersao(indice, versao)}
          versao={versao}
          className={classeDoQuadro[slide.id as SlideSR1Id]}
        >
          {corpo[slide.id as SlideSR1Id](slide)}
        </Quadro>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------------- */

function Quadro({
  slide,
  posicao,
  total,
  inicio,
  versao,
  className,
  children,
}: {
  slide: SlideSR1
  posicao: number
  total: number
  inicio: number
  versao: Versao
  className?: string
  children: ReactNode
}) {
  const notas = notasNaVersao(slide, versao)

  return (
    <section
      id={`slide-${posicao}`}
      data-slide={posicao}
      aria-label={`Slide ${posicao} de ${total}: ${slide.titulo}`}
      className={cn('slide slide-sr1', className)}
    >
      <div className="slide-corpo flex flex-col">{children}</div>

      <details className="notas sem-impressao">
        <summary>
          <span className="rotulo">notas</span>
          <span>
            {nomeCurto(slide.quemFala).toLowerCase()} ·{' '}
            {formatarTempo(segundosNaVersao(slide, versao))} · começa em {formatarTempo(inicio)}
          </span>
        </summary>
        <ol>
          {notas.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ol>
        {slide.perguntas?.length ? (
          <div className="notas-perguntas">
            <p className="rotulo">{ROTULO_SE_PERGUNTAREM_SR1}</p>
            <ul>
              {slide.perguntas.map((pergunta) => (
                <li key={pergunta}>{pergunta}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </details>

      <footer className="slide-rodape">
        <span>
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento">
            _
          </span>{' '}
          · {PILULA_DA_CAPA_SR1}
        </span>
        <span className="numero">
          {posicao}/{total}
        </span>
      </footer>
    </section>
  )
}

/** Uma rota do site, clicável no deck e legível no papel. */
function Endereco({ rota }: { rota: string }) {
  return (
    <a
      href={rota}
      className="numero mt-4 self-start text-sm underline decoration-linha-alta underline-offset-4 hover:decoration-acento"
    >
      {ENDERECO_SITE}
      {rota}
    </a>
  )
}

function Titulo({ slide }: { slide: SlideSR1 }) {
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
  children?: ReactNode
}) {
  return (
    <div className="bloco-raso md:-ml-px">
      <dt className="rotulo">{rotulo}</dt>
      <dd className="odometro fonte-display numero mt-1 text-6xl leading-none">{numero}</dd>
      <dd aria-hidden className="risco-anima mt-3 h-px w-10 bg-linha-alta" />
      {children ? <dd className="mt-2 text-sm">{children}</dd> : null}
    </div>
  )
}

/* Tipo reexportado para a página, que não precisa conhecer o conteúdo. */
export type { Versao }
