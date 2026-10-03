import type { ReactNode } from 'react'
import { MarcaCesar } from '@/components/base/marca'
import { SECOES } from '@/components/base/indice'
import { Etiqueta } from '@/components/base/selo'
import { HorizonteDoRecife } from '@/components/pitch/horizonte'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import { WIREFRAMES } from '@/components/wireframe'
import {
  ALTERNATIVAS_SR1,
  APRENDIZADOS_SR1,
  AVANCO,
  BACKLOG_SR1,
  BALANCO_SR1,
  COLUNAS_DA_EQUIPE,
  COLUNAS_DA_MATRIZ,
  CONCLUSAO_SR1,
  CSD_RESPONDIDO,
  CSD_SR1,
  DRIVE_SR1,
  COLUNAS_DAS_FONTES,
  COLUNAS_DO_PLANEJADO,
  COLUNAS_DOS_EXISTENTES,
  COMPROMISSOS_NO_SR1,
  CONTAGENS_DA_SOLUCAO,
  DATA_DO_SR1,
  DEMO_SR1,
  DIFERENCIAIS_SR1,
  DISCIPLINAS_SR1,
  ENDERECO_DA_DEMO,
  EQUIPE_SR1,
  ESCOPO_SR1,
  FASES_DO_SEMESTRE,
  EM_ANDAMENTO_SR1,
  AINDA_NAO_SR1,
  FERRAMENTAS_SR1,
  FLUXO_DO_MES,
  FONTES_SR1,
  FUNIL_DA_IDEACAO,
  LEGENDA_DA_MATRIZ,
  DECISOES_DO_WIREFRAME_SR1,
  LEGENDAS_DO_WIREFRAME_SR1,
  MAPA_NO_SR1,
  NOME_DA_UNIDADE_DO_DECK,
  NOME_DO_PAPEL,
  OBJETIVOS_NO_SR1,
  ORDEM_DOS_PAPEIS,
  PARADAS_ATE_O_SR2,
  PERGUNTA_FINAL,
  PESSOAS_SR1,
  PERCENTUAL_A_CONFIRMAR,
  PILULA_DA_CAPA_SR1,
  PLANEJADO_X_REALIZADO,
  PROBLEMA_SR1,
  QUADRANTES_SR1,
  REFERENCIAS_SR1,
  ROTULO_DO_CONTRA,
  ROTEIRO_SR1,
  ROTINA_DA_SEMANA,
  ROTULO_DA_DEMO_SR1,
  ROTULO_DAS_FERRAMENTAS,
  ROTULO_DAS_PERSONAS,
  ROTULO_DO_MAPA_SR1,
  ROTULO_DOS_COMPROMISSOS,
  ROTULO_DOS_MINUTOS,
  ROTULO_DOS_PAPEIS,
  ROTULO_EM_ANDAMENTO,
  ROTULO_SE_PERGUNTAREM_SR1,
  SITE_SR1,
  SLIDES_SR1,
  TECNICAS_SR1,
  TELAS_NO_SR1,
  formatarTempo,
  inicioDoSlide,
  rotuloDaParte,
  type EstadoDoCompromisso,
  type EstadoDoObjetivo,
  type SlideSR1,
  type SlideSR1Id,
} from '@/content/apresentacao-sr1'
import { EQUIPE, nomeCurto } from '@/content/equipe'
import { CLIENTE, ENDERECO_SITE, INSTITUICAO, PRODUTO, URL_SITE } from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { PERFIS } from '@/lib/features'
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
 * números vêm do motor de cálculo, dos JSON dos cadernos, do cronograma, do
 * checklist e do backlog.
 *
 * NA ORDEM DA RUBRICA (ADR-047). O rodapé de cada slide diz a parte da
 * rubrica a que ele responde, com o número do critério, e o `atual/total`
 * em tamanho de ler numa chamada de vídeo.
 *
 * SEM TABELA DE VERDADE. As matrizes do slide 9 e do slide 17 são grades de
 * linhas: numa `<table>`, 360px de largura pediam rolagem lateral, e o teste
 * do celular reprova qualquer caixa que vaze. Na tela larga, a grade alinha
 * as colunas do mesmo jeito.
 *
 * O ACENTO, SLIDE A SLIDE. O cursor do rodapé já é um uso; cada slide gasta no
 * máximo mais dois, sempre no ponto que a fala aponta.
 */
export function SlidesSR1() {
  const lista = SLIDES_SR1 as readonly SlideSR1[]

  const corpo: Record<SlideSR1Id, (slide: SlideSR1) => ReactNode> = {
    /* 1 · Capa: equipe, projeto, disciplina, data e cliente. */
    capa: (slide) => (
      <>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="pilula">
            {PILULA_DA_CAPA_SR1} · {formatarBR(DATA_DO_SR1)}
          </span>
          <MarcaCesar className="h-14" />
        </div>
        <h1 className="hero mt-6">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h1>
        <p className="slide-apoio text-texto">{slide.apoio}</p>
        <p className="mt-6 text-base text-texto">
          {INSTITUICAO.disciplina} · {INSTITUICAO.escola} · {INSTITUICAO.curso} ·{' '}
          {INSTITUICAO.periodo} · {INSTITUICAO.equipe}
        </p>
        <p className="mt-1 text-base">
          {CLIENTE.orgao} · {CLIENTE.areaCurta}
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-base">
          {EQUIPE.map((integrante) => (
            <li key={integrante.id}>{integrante.nome}</li>
          ))}
        </ul>
        <HorizonteDoRecife className="horizonte" />
      </>
    ),

    /* 2 · O roteiro é a rubrica: cada parte com os slides dela. */
    roteiro: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {ROTEIRO_SR1.map((parte) => (
            <li key={parte.id} className="bloco-raso md:-ml-px">
              <span className="ordinal">{parte.criterio}</span>
              <p className="titulo-bloco mt-2 text-xl">{parte.nome}</p>
              <p className="rotulo mt-2">{parte.slides}</p>
            </li>
          ))}
        </ol>
      </>
    ),

    /* 3 · O problema: onde, causas e consequências. */
    problema: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="cascata mt-8 grid grid-cols-1 md:grid-cols-3">
          <div className="bloco-raso md:-ml-px">
            <p className="rotulo">{PROBLEMA_SR1.onde.rotulo}</p>
            <p className="mt-3 text-lg text-texto">{PROBLEMA_SR1.onde.texto}</p>
          </div>
          <Coluna rotulo={PROBLEMA_SR1.causas.rotulo} itens={PROBLEMA_SR1.causas.itens} />
          <Coluna
            rotulo={PROBLEMA_SR1.consequencias.rotulo}
            itens={PROBLEMA_SR1.consequencias.itens}
          />
        </div>
      </>
    ),

    /* 4 · A pesquisa: as fontes com data e o que a planilha corrigiu. O
       acento vai na planilha, que é a fonte que a fala aponta. */
    pesquisa: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-7 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="rotulo">{COLUNAS_DAS_FONTES.fontes}</p>
            <ol className="cascata mt-3 grid grid-cols-1">
              {FONTES_SR1.map((fonte) => (
                <li
                  key={fonte.quando}
                  className={cn(
                    'bloco-raso linha-sr1 flex items-baseline gap-4',
                    fonte.quando === '22/09' && 'border-acento',
                  )}
                >
                  <span className="numero w-24 shrink-0 text-base text-texto">{fonte.quando}</span>
                  <span className="text-base">{fonte.fonte}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="rotulo">{COLUNAS_DAS_FONTES.aprendizados}</p>
            <ul className="cascata mt-3 grid grid-cols-1">
              {APRENDIZADOS_SR1.itens.map((item) => (
                <li key={item.antes} className="bloco-raso linha-sr1 text-base">
                  <span className="line-through decoration-linha-alta">{item.antes}</span>
                  <span aria-hidden className="mx-2">
                    →
                  </span>
                  <span className="text-texto">{item.depois}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    ),

    /* 5 · A matriz CSD de 25/09: a contagem e dois exemplos de cada coluna. */
    csd: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="cascata mt-7 grid grid-cols-1 md:grid-cols-3">
          {CSD_SR1.map((coluna) => (
            <div key={coluna.rotulo} className="bloco-raso md:-ml-px">
              <p className="flex items-baseline gap-3">
                <span className="numero fonte-display text-5xl leading-none text-texto">
                  {coluna.total}
                </span>
                <span className="titulo-bloco text-lg">{coluna.rotulo}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {coluna.exemplos.map((exemplo) => (
                  <li key={exemplo} className="text-base">
                    {exemplo}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 border-l border-linha-alta pl-3 text-base">
          <span className="rotulo mr-3">{CSD_RESPONDIDO.rotulo}</span>
          <span className="text-texto">{CSD_RESPONDIDO.texto}</span>
        </p>
      </>
    ),

    /* 6 · Quem usa: as personas, o mapa de empatia e os papéis que viraram. */
    usuarios: (slide) => (
      <>
        <Titulo slide={slide} />
        <p className="rotulo mt-6">{ROTULO_DAS_PERSONAS}</p>
        <ul className="cascata mt-2 grid grid-cols-1 md:grid-cols-3">
          {PESSOAS_SR1.map((pessoa) => (
            <li key={pessoa.quem} className="bloco-raso md:-ml-px">
              <p className="titulo-bloco text-lg">{pessoa.quem}</p>
              <p className="mt-1 text-base">{pessoa.dor}</p>
            </li>
          ))}
        </ul>
        <p className="rotulo mt-5">{ROTULO_DO_MAPA_SR1}</p>
        <dl className="mt-2 grid grid-cols-1 md:grid-cols-3">
          {MAPA_NO_SR1.map((quadrante) => (
            <div key={quadrante.termo} className="bloco-raso md:-ml-px">
              <dt className="rotulo">{quadrante.termo}</dt>
              <dd className="mt-1 text-base text-texto">{quadrante.curto}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-base">
          <span className="rotulo mr-3">{ROTULO_DOS_PAPEIS}</span>
          <span className="text-texto">
            {ORDEM_DOS_PAPEIS.map((p) => NOME_DO_PAPEL[p]).join(' · ')}
          </span>
        </p>
      </>
    ),

    /* 7 · O que já existe: benchmarking pela lacuna e a SWOT pelo resumo. */
    existentes: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-7 grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="rotulo">{COLUNAS_DOS_EXISTENTES.benchmarking}</p>
            <ul className="cascata mt-3 grid grid-cols-1">
              {REFERENCIAS_SR1.map((ref) => (
                <li
                  key={ref.nome}
                  className="bloco-raso linha-sr1 grid grid-cols-1 gap-1 sm:grid-cols-[13.5rem_1fr] sm:gap-4"
                >
                  <span className="text-base text-texto">{ref.nome}</span>
                  <span className="text-base">{ref.lacuna}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo">{COLUNAS_DOS_EXISTENTES.swot}</p>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2">
              {QUADRANTES_SR1.map((q) => (
                <div key={q.titulo} className="bloco-raso sm:-ml-px">
                  <dt className="rotulo">{q.titulo}</dt>
                  <dd className="mt-1 text-base text-texto">{q.curto}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </>
    ),

    /* 8 · Os objetivos, cada um com o prazo e o estado de hoje. */
    objetivos: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5">
          {OBJETIVOS_NO_SR1.map((objetivo) => (
            <li key={objetivo.resumo} className="bloco-raso md:-ml-px">
              <p className="rotulo">{objetivo.quando}</p>
              <p className="titulo-bloco mt-2 text-lg">{objetivo.resumo}</p>
              <Etiqueta tom={tomDoObjetivo(objetivo.estado)} className="mt-3 uppercase">
                {objetivo.estado}
              </Etiqueta>
              {objetivo.proximo ? <p className="mt-2 text-base">{objetivo.proximo}</p> : null}
            </li>
          ))}
        </ol>
        <p className="mt-6 border-l border-linha-alta pl-4 text-base">{ESCOPO_SR1.fora}</p>
      </>
    ),

    /* 9 · As técnicas de ideação e o funil até a escolhida. */
    tecnicas: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 md:grid-cols-3">
          {TECNICAS_SR1.map((tecnica, indice) => (
            <li key={tecnica.nome} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{tecnica.nome}</p>
              <p className="rotulo mt-1">
                {tecnica.minutos} {ROTULO_DOS_MINUTOS}
              </p>
              <p className="mt-3 text-base">{tecnica.como}</p>
              <p className="mt-3 text-lg text-texto">{tecnica.produto}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {FUNIL_DA_IDEACAO.map((passo, indice) => (
            <span key={passo.rotulo} className="flex items-baseline gap-2">
              {indice > 0 ? (
                <span aria-hidden className="text-apagado">
                  →
                </span>
              ) : null}
              <span
                className={cn(
                  'numero fonte-display text-4xl leading-none',
                  indice === FUNIL_DA_IDEACAO.length - 1 ? 'text-acento' : 'text-texto',
                )}
              >
                {passo.numero}
              </span>
              <span className="text-base">{passo.rotulo}</span>
            </span>
          ))}
        </p>
      </>
    ),

    /* 10 · A matriz de decisão inteira, a escolhida em destaque. */
    escolha: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-6" role="table" aria-label={slide.titulo}>
          <div
            role="row"
            className="hidden grid-cols-[1fr_6rem_6rem_6rem_11rem] gap-3 px-4 pb-2 md:grid"
          >
            <span role="columnheader" className="rotulo">
              {COLUNAS_DA_MATRIZ.alternativa}
            </span>
            <span role="columnheader" className="rotulo text-right">
              {COLUNAS_DA_MATRIZ.impacto}
            </span>
            <span role="columnheader" className="rotulo text-right">
              {COLUNAS_DA_MATRIZ.esforco}
            </span>
            <span role="columnheader" className="rotulo text-right">
              {COLUNAS_DA_MATRIZ.aderencia}
            </span>
            <span role="columnheader" className="rotulo md:pl-8">
              {COLUNAS_DA_MATRIZ.destino}
            </span>
          </div>
          {ALTERNATIVAS_SR1.map((alternativa) => (
            <div
              key={alternativa.nome}
              role="row"
              className={cn(
                'bloco-raso linha-sr1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 md:grid-cols-[1fr_6rem_6rem_6rem_11rem]',
                alternativa.escolhida && 'border-acento',
              )}
            >
              <span
                role="cell"
                className={cn('text-base', alternativa.escolhida ? 'text-texto' : '')}
              >
                {alternativa.nome}
              </span>
              <Nota rotulo={COLUNAS_DA_MATRIZ.impacto} valor={alternativa.impacto} />
              <Nota rotulo={COLUNAS_DA_MATRIZ.esforco} valor={alternativa.esforco} />
              <Nota rotulo={COLUNAS_DA_MATRIZ.aderencia} valor={alternativa.aderencia} />
              <span
                role="cell"
                className={cn('rotulo self-center md:pl-8', alternativa.escolhida && 'text-texto')}
              >
                {alternativa.destino}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-base">
          <span className="rotulo mr-3">{LEGENDA_DA_MATRIZ.rotulo}</span>
          <span className="text-texto">{LEGENDA_DA_MATRIZ.texto}</span>
        </p>
      </>
    ),

    /* 11 · Uma disciplina por cartão, cada uma com duas decisões. */
    disciplinas: (slide) => (
      <>
        <Titulo slide={slide} />
        <ul className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {DISCIPLINAS_SR1.map((disciplina) => (
            <li key={disciplina.nome} className="bloco-raso md:-ml-px">
              <p className="titulo-bloco text-lg">{disciplina.nome}</p>
              <ul className="mt-3 space-y-2">
                {disciplina.itens.map((item) => (
                  <li key={item} className="text-base text-texto">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </>
    ),

    /* 12 · A solução: o caminho de um mês, e o tamanho do sistema. */
    solucao: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {FLUXO_DO_MES.map((passo, indice) => (
            <li
              key={passo.quem}
              className={cn(
                'bloco-raso md:-ml-px',
                indice === FLUXO_DO_MES.length - 1 && 'border-acento md:z-10',
              )}
            >
              <span className="ordinal">0{indice + 1}</span>
              <p className="rotulo mt-2">{passo.quem}</p>
              <p className="mt-2 text-lg text-texto">{passo.faz}</p>
            </li>
          ))}
        </ol>
        <dl className="cascata mt-6 flex flex-wrap gap-x-10 gap-y-3">
          <Numero numero={TELAS_NO_SR1.length} rotulo={CONTAGENS_DA_SOLUCAO.telas} />
          <Numero numero={Object.keys(PERFIS).length} rotulo={CONTAGENS_DA_SOLUCAO.papeis} />
          <Numero numero={BASE.regras.length} rotulo={CONTAGENS_DA_SOLUCAO.regras} />
        </dl>
        <p className="mt-5 text-base">
          <span className="rotulo mr-3">{AINDA_NAO_SR1.rotulo}</span>
          <span className="text-texto">{AINDA_NAO_SR1.texto}</span>
        </p>
      </>
    ),

    /* 13 · Os protótipos de baixa fidelidade. */
    wireframes: (slide) => (
      <>
        <Titulo slide={slide} />
        <ul className="cascata mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {WIREFRAMES.map(({ id, Desenho }, indice) => (
            <li key={id} className="wireframe-sr1">
              <Desenho className="w-full" />
              <p className="mt-2 text-base text-texto">{LEGENDAS_DO_WIREFRAME_SR1[indice]}</p>
              <p className="mt-1 text-sm">{DECISOES_DO_WIREFRAME_SR1[indice]}</p>
            </li>
          ))}
        </ul>
      </>
    ),

    /* 14 · A demonstração. Ao vivo no sistema; de reserva, a conta de junho
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
            <CartaoScore
              avaliacao={DEMO_SR1.avaliacao}
              percentualAConfirmar={PERCENTUAL_A_CONFIRMAR}
              enxuto
            />
          </div>
          <div className="mt-3">
            <MemoriaDeCalculo avaliacao={DEMO_SR1.avaliacao} aberta compacta enxuta />
          </div>
        </div>
      </>
    ),

    /* 15 · Os três diferenciais. O acento vai no número que NÃO mudou. */
    diferenciais: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-8 grid grid-cols-1 md:grid-cols-3">
          {DIFERENCIAIS_SR1.map((diferencial, indice) => (
            <li key={diferencial.id} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-xl">{diferencial.titulo}</p>
              <p className="mt-2 text-base text-texto">{diferencial.texto}</p>
              {'contra' in diferencial ? (
                <p className="mt-3 text-base">
                  <span className="rotulo mr-2">{ROTULO_DO_CONTRA}:</span>
                  {diferencial.contra}
                </p>
              ) : null}
              {'numero' in diferencial ? (
                <>
                  <p className="numero fonte-display mt-4 text-5xl leading-none text-acento">
                    {diferencial.numero}
                  </p>
                  <p className="mt-2 text-base text-texto">{diferencial.legenda}</p>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </>
    ),

    /* 16 · O ciclo de vida: as fases com as datas do cronograma, a rotina e
       o backlog. O acento vai na fase de hoje. */
    processo: (slide) => (
      <>
        <Titulo slide={slide} />
        <ol className="cascata mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9">
          {FASES_DO_SEMESTRE.map((fase) => (
            <li
              key={fase.nome}
              className={cn(
                'bloco-raso celula-sr1 -ml-px',
                fase.atual && 'border-acento',
              )}
            >
              <p className="numero text-sm text-texto">{datasDaFase(fase.ciclos)}</p>
              <p className="mt-1 text-base leading-snug text-texto">{fase.nome}</p>
              <p className="mt-1 text-sm leading-snug">{fase.faz}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
          <div>
            <p className="rotulo">{ROTINA_DA_SEMANA.rotulo}</p>
            <ul className="mt-2 space-y-1.5">
              {ROTINA_DA_SEMANA.itens.map((item) => (
                <li key={item} className="text-base text-texto">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo">
              {BACKLOG_SR1.rotulo} <span className="normal-case">{BACKLOG_SR1.metodo}</span>
            </p>
            <dl className="mt-2 space-y-1.5">
              {BACKLOG_SR1.itens.map((item) => (
                <div key={item.rotulo} className="flex items-baseline gap-3">
                  <dd className="numero w-8 shrink-0 text-right text-2xl leading-none text-texto">
                    {item.numero}
                  </dd>
                  <dt className="text-base">
                    {item.rotulo} · {item.noAr} {BACKLOG_SR1.noAr}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-base text-texto">{BACKLOG_SR1.primeiras}</p>
          </div>
        </div>
      </>
    ),

    /* 17 · Papéis e responsabilidades, um por linha. */
    equipe: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-6" role="table" aria-label={slide.titulo}>
          <div role="row" className="hidden grid-cols-[9rem_22rem_1fr] gap-4 px-4 pb-1.5 md:grid">
            <span role="columnheader" className="rotulo">
              {COLUNAS_DA_EQUIPE.nome}
            </span>
            <span role="columnheader" className="rotulo">
              {COLUNAS_DA_EQUIPE.papel}
            </span>
            <span role="columnheader" className="rotulo">
              {COLUNAS_DA_EQUIPE.responsabilidades}
            </span>
          </div>
          {EQUIPE_SR1.map((integrante) => (
            <div
              key={integrante.id}
              role="row"
              className="bloco-raso linha-sr1 grid grid-cols-1 gap-x-4 md:grid-cols-[9rem_22rem_1fr]"
            >
              <span role="cell" className="text-base text-texto">
                {integrante.nome}
              </span>
              <span role="cell" className="text-base text-texto">
                {integrante.papel}
              </span>
              <span role="cell" className="text-base">
                {integrante.responsabilidades}
              </span>
            </div>
          ))}
        </div>
      </>
    ),

    /* 18 · As ferramentas, o site no lugar do Google Site e a pasta do Drive. */
    ferramentas: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="rotulo">{ROTULO_DAS_FERRAMENTAS}</p>
            <ul className="mt-2">
              {FERRAMENTAS_SR1.map((ferramenta) => (
                <li
                  key={ferramenta.nome}
                  className="grid grid-cols-1 border-t border-linha py-2 sm:grid-cols-[9rem_1fr] sm:gap-3"
                >
                  <span className="text-base text-texto">{ferramenta.nome}</span>
                  <span className="text-base">{ferramenta.para}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo">{SITE_SR1.rotulo}</p>
            <a
              href={URL_SITE}
              className="numero mt-2 inline-block text-lg text-texto underline decoration-linha-alta underline-offset-4 hover:decoration-acento"
            >
              {ENDERECO_SITE}
            </a>
            <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {SECOES.map((secao) => (
                <li key={secao.ancora} className="flex items-baseline gap-2 text-base">
                  <span className="numero text-apagado">{secao.numero}</span>
                  <span className="text-texto">{secao.rotulo}</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-base">{SITE_SR1.diario}</p>
            <p className="rotulo mt-5">{DRIVE_SR1.rotulo}</p>
            <ul className="mt-2 space-y-1">
              {DRIVE_SR1.itens.map((item) => (
                <li key={item} className="text-base text-texto">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    ),

    /* 19 · Planejado x realizado, fase a fase, com quem respondeu. */
    planejado: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="mt-5" role="table" aria-label={slide.titulo}>
          <div role="row" className="hidden grid-cols-[14rem_5rem_6rem_1fr] gap-3 px-4 pb-1.5 md:grid">
            <span role="columnheader" className="rotulo">
              {COLUNAS_DO_PLANEJADO.fase}
            </span>
            <span role="columnheader" className="rotulo">
              {COLUNAS_DO_PLANEJADO.data}
            </span>
            <span role="columnheader" className="rotulo">
              {COLUNAS_DO_PLANEJADO.entregue}
            </span>
            <span role="columnheader" className="rotulo">
              {COLUNAS_DO_PLANEJADO.quem}
            </span>
          </div>
          {PLANEJADO_X_REALIZADO.map((linha) => {
            const ciclo = cicloPorId(linha.ciclo)
            const completo = linha.entregues === linha.planejadas
            return (
              <div
                key={linha.ciclo}
                role="row"
                className="bloco-raso linha-sr1 grid grid-cols-[1fr_auto] gap-x-3 md:grid-cols-[14rem_5rem_6rem_1fr]"
              >
                <span role="cell" className="text-base text-texto">
                  {/* Minúscula é a identidade; a sigla do marco fica como sigla. */}
                  {ciclo.rotulo.toLowerCase().replace(/\bsr(\d)\b/g, 'SR$1')}
                </span>
                <span role="cell" className="numero text-base">
                  {formatarBR(ciclo.data).slice(0, 5)}
                </span>
                <span
                  role="cell"
                  className={cn('numero text-base', completo ? 'text-ok' : 'text-texto')}
                >
                  {linha.entregues}/{linha.planejadas}
                </span>
                <span role="cell" className="text-base">
                  {linha.responsaveis.map((r) => nomeCurto(r)).join(', ')}
                </span>
              </div>
            )
          })}
        </div>
        {EM_ANDAMENTO_SR1.length > 0 ? (
          <p className="mt-4 text-base text-balance">
            <Etiqueta className="mr-3 uppercase">{ROTULO_EM_ANDAMENTO}</Etiqueta>
            {EM_ANDAMENTO_SR1.map((grupo, indice) => (
              <span key={grupo.dono ?? 'sem-dono'}>
                {indice > 0 ? ' · ' : null}
                <span className="text-texto">{listaNaTela(grupo.itens)}</span>
                {grupo.dono ? ` (${nomeCurto(grupo.dono)})` : null}
              </span>
            ))}
          </p>
        ) : null}
      </>
    ),

    /* 20 · O avanço em três contas, e os compromissos do Kick-off. O único
       acento é o compromisso que não foi feito. */
    avanco: (slide) => (
      <>
        <Titulo slide={slide} />
        <dl className="cascata mt-7 grid grid-cols-1 md:grid-cols-3">
          {AVANCO.map((item) => (
            <div key={item.id} className="bloco-raso md:-ml-px">
              <dd className="odometro fonte-display numero text-6xl leading-none text-texto">
                {item.numero}
              </dd>
              <dt className="mt-3 text-base text-texto">{item.rotulo}</dt>
              <dd className="mt-1 text-base">{item.conta}</dd>
            </div>
          ))}
        </dl>
        <p className="rotulo mt-6">{ROTULO_DOS_COMPROMISSOS}</p>
        <ul className="mt-2 grid grid-cols-1 md:grid-cols-3">
          {COMPROMISSOS_NO_SR1.map((item) => (
            <li key={item.ciclo} className="bloco-raso md:-ml-px">
              <p className="text-base text-texto">{item.compromisso}</p>
              <Etiqueta tom={tomDoCompromisso(item.estado)} className="mt-2 uppercase">
                {item.estado}
              </Etiqueta>
              <p className="mt-2 text-base">
                {item.dono}: {item.agora}
              </p>
            </li>
          ))}
        </ul>
      </>
    ),

    /* 21 · O balanço do projeto e da equipe, cada ponto com o tratamento. */
    balanco: (slide) => (
      <>
        <Titulo slide={slide} />
        <div className="cascata mt-7 grid grid-cols-1 md:grid-cols-3">
          <Coluna rotulo={BALANCO_SR1.fortes.rotulo} itens={BALANCO_SR1.fortes.itens} />
          <Tratamentos rotulo={BALANCO_SR1.melhorias.rotulo} itens={BALANCO_SR1.melhorias.itens} />
          <Tratamentos rotulo={BALANCO_SR1.riscos.rotulo} itens={BALANCO_SR1.riscos.itens} />
        </div>
      </>
    ),

    /* 22 · Fechamento: a conclusão do problema ao plano, o caminho até o SR2,
       o endereço e as perguntas. */
    fechamento: (slide) => (
      <>
        <h2 className="slide-titulo">
          {slide.titulo}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h2>
        <p className="slide-apoio">{slide.apoio}</p>
        <ol className="cascata mt-6 grid grid-cols-1 md:grid-cols-3">
          {CONCLUSAO_SR1.map((passo, indice) => (
            <li key={passo.rotulo} className="bloco-raso md:-ml-px">
              <p className="rotulo">
                {indice > 0 ? <span aria-hidden>→ </span> : null}
                {passo.rotulo}
              </p>
              <p className="mt-1 text-lg text-texto">{passo.texto}</p>
            </li>
          ))}
        </ol>
        <ol className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7">
          {PARADAS_ATE_O_SR2.map((parada) => {
            const ciclo = cicloPorId(parada.ciclo)
            return (
              <li
                key={parada.ciclo}
                className={cn('bloco-raso celula-sr1 -ml-px', parada.destaque && 'border-acento')}
              >
                <p className="numero text-lg text-texto">{formatarBR(ciclo.data).slice(0, 5)}</p>
                <p className="mt-1 text-base leading-snug">{parada.entrega}</p>
              </li>
            )
          })}
        </ol>
        <p className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <a
            href={URL_SITE}
            className="numero text-xl text-texto underline decoration-linha-alta underline-offset-8 hover:decoration-acento sm:text-2xl"
          >
            {ENDERECO_SITE}
          </a>
          <span className="fonte-display text-3xl text-texto">{PERGUNTA_FINAL}</span>
        </p>
      </>
    ),
  }

  const classeDoQuadro: Partial<Record<SlideSR1Id, string>> = {
    capa: 'grao',
    demo: 'slide-demo',
  }

  return (
    <>
      {lista.map((slide, indice) => (
        <Quadro
          key={slide.id}
          slide={slide}
          posicao={indice + 1}
          total={lista.length}
          inicio={inicioDoSlide(indice)}
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
  className,
  children,
}: {
  slide: SlideSR1
  posicao: number
  total: number
  inicio: number
  className?: string
  children: ReactNode
}) {
  const parte = rotuloDaParte(slide.parte)

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
            {nomeCurto(slide.quemFala).toLowerCase()} · {formatarTempo(slide.segundos)} · começa em{' '}
            {formatarTempo(inicio)}
          </span>
        </summary>
        <ol>
          {slide.notas.map((linha) => (
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
          · sr1{parte ? <> · {parte}</> : null}
        </span>
        <span className="numero rodape-posicao">
          {posicao}/{total}
        </span>
      </footer>
    </section>
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

/** Um bloco com rótulo e uma lista curta: causas, consequências, balanço. */
function Coluna({ rotulo, itens }: { rotulo: string; itens: readonly string[] }) {
  return (
    <div className="bloco-raso md:-ml-px">
      <p className="rotulo">{rotulo}</p>
      <ul className="mt-3 space-y-2">
        {itens.map((item) => (
          <li key={item} className="text-base text-texto">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Um bloco de pontos, cada um com o que fazemos sobre ele. */
function Tratamentos({
  rotulo,
  itens,
}: {
  rotulo: string
  itens: readonly { ponto: string; trato: string }[]
}) {
  return (
    <div className="bloco-raso md:-ml-px">
      <p className="rotulo">{rotulo}</p>
      <ul className="mt-3 space-y-3">
        {itens.map((item) => (
          <li key={item.ponto} className="text-base">
            <span className="block text-texto">{item.ponto}</span>
            <span className="block">→ {item.trato}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Uma nota de 1 a 5 da matriz. No celular, o rótulo vai junto do número. */
function Nota({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <span role="cell" className="numero text-base text-texto md:text-right">
      <span className="rotulo mr-1 md:hidden">{rotulo}</span>
      {valor}
    </span>
  )
}

/** Um número grande com o rótulo ao lado. */
function Numero({ numero, rotulo }: { numero: number; rotulo: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dd className="numero fonte-display text-4xl leading-none text-texto">{numero}</dd>
      <dt className="text-base">{rotulo}</dt>
    </div>
  )
}

/** As datas de uma fase: um dia, "08 a 15/08" no mesmo mês, "17/10 a 14/11" entre dois. */
/** "a, b e c": os itens de um mesmo dono, numa linha. */
function listaNaTela(itens: readonly string[]): string {
  return itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`
}

function datasDaFase(ciclos: readonly Parameters<typeof cicloPorId>[0][]): string {
  const primeira = formatarBR(cicloPorId(ciclos[0]).data).slice(0, 5)
  const ultima = formatarBR(cicloPorId(ciclos[ciclos.length - 1]).data).slice(0, 5)
  if (primeira === ultima) return primeira
  const mesmoMes = primeira.slice(3) === ultima.slice(3)
  return mesmoMes ? `${primeira.slice(0, 2)} a ${ultima}` : `${primeira} a ${ultima}`
}

function tomDoObjetivo(estado: EstadoDoObjetivo): 'ok' | 'neutro' {
  return estado === 'alcançado' ? 'ok' : 'neutro'
}

function tomDoCompromisso(estado: EstadoDoCompromisso): 'ok' | 'acento' | 'neutro' {
  if (estado === 'feito') return 'ok'
  if (estado === 'não feito') return 'acento'
  return 'neutro'
}
