import type { ReactNode } from 'react'
import { MarcaCesar } from '@/components/base/marca'
import {
  Barra,
  BarraDivergente,
  Caixas,
  Dispersao,
  Faixa,
  Histograma,
  MapaDeAusentes,
  MapaDeCalor,
} from '@/components/ml/graficos'
import { HorizonteDoRecife } from '@/components/pitch/horizonte'
import {
  CITACAO_DA_SECRETARIA,
  CODIFICACOES,
  COLUNAS_CRUAS_NO_SLIDE,
  COLUNAS_DAS_FEATURES,
  COLUNAS_DO_TRATAMENTO,
  COLUNAS_MODELADAS,
  DATA_DA_AV1,
  DATA_DA_ENTREGA_FINAL,
  DECISOES_DO_TRATAMENTO,
  DESCARTADAS,
  DESTAQUES_ML,
  ETAPAS,
  FEATURES_NOVAS,
  FICHA_DA_ORIGEM,
  FORMULA_DO_RESULTADO,
  FUNIL_ML,
  GRUPO_DA_DISCIPLINA,
  INCONSISTENCIAS_ML,
  INDICADORES_ML,
  INSIGHTS_EDA,
  LIMITE_ML,
  NOMES_DAS_NOTAS,
  ONDE_ESTA_CADA_ENTREGA,
  PADRONIZACAO,
  PAPEIS_DAS_COLUNAS,
  PERGUNTAS,
  PILULA_DA_CAPA,
  PROXIMOS_PASSOS,
  ROTEIRO_ML,
  ROTULO_DA_ENTREGA_FINAL,
  ROTULO_DA_ETAPA,
  ROTULO_DO_ALVO,
  ROTULOS_DA_CODIFICACAO,
  ROTULOS_DA_CORRELACAO,
  ROTULOS_DA_DISPERSAO,
  ROTULOS_DA_DISTRIBUICAO,
  ROTULOS_DA_EDA_DAS_FEATURES,
  ROTULOS_DAS_CLASSES,
  ROTULOS_DOS_FALTANTES,
  ROTULOS_DOS_GRUPOS,
  ROTULOS_DOS_TIPOS,
  SLIDES_ML,
  TAREFAS_ML,
  USOS_ML,
  decimal,
  formatarTempo,
  inicioDoSlideML,
  milhar,
  porcento,
  rotuloDaColuna,
  type SlideML,
} from '@/content/apresentacao-ml'
import dados from '@/content/ml/apresentacao.json'
import { CLIENTE, ENDERECO_SITE, INSTITUICAO, PRODUTO, URL_SITE } from '@/content/produto'
import { formatarBR } from '@/lib/datas'
import { cn } from '@/lib/utils'

/**
 * Os vinte slides da AV1 de machine learning, renderizados no servidor.
 *
 * O MESMO CONTRATO DO PITCH DO KICK-OFF: cada slide é uma `<section>` com
 * `data-slide`, a página é uma pilha legível sem JavaScript, e o componente
 * cliente (`pitch/deck.tsx`, reaproveitado sem mudança) só decide qual seção
 * aparece. Nenhum texto passa por props para ele.
 *
 * NENHUM LITERAL DE CONTEÚDO AQUI: as palavras vêm de
 * `src/content/apresentacao-ml.ts`, onde o teste conta o teto por slide, e os
 * números vêm de `ml/apresentacao.json`, que o caderno 07 grava. Este arquivo
 * escolhe a forma do visual.
 *
 * O ACENTO, SLIDE A SLIDE. O cursor do rodapé já é um uso; cada slide gasta no
 * máximo mais dois, e sempre no ponto que a fala aponta: o peso de 40%, o
 * corte de 90%, a célula do ind3, as seis linhas fora da regra.
 */
export function SlidesML() {
  const [
    capa,
    roteiro,
    contexto,
    objetivo,
    uso,
    origem,
    colunas,
    tabela,
    distribuicao,
    grupos,
    correlacao,
    faltantes,
    inconsistencias,
    foraDaRegra,
    insights,
    tratamento,
    codificacao,
    features,
    edaFeatures,
    fechamento,
  ] = SLIDES_ML

  const B = dados.base
  const classes = dados.classes
  const totalClasses = classes.abaixo_de_90 + classes.noventa_ou_mais
  const maiorPapel = Math.max(...B.papeis.map((p) => p.colunas))
  const maiorOutlier = Math.max(...dados.outliers.map((o) => o.percentual))
  const cruas = dados.mais_correlatas.slice(0, COLUNAS_CRUAS_NO_SLIDE)

  return (
    <>
      {/* 1 · Capa. O grupo que assina a AV1, que não é a equipe do projeto. */}
      <Quadro slide={capa} className="grao capa-ml">
        <span className="pilula self-start">
          {PILULA_DA_CAPA} · {formatarBR(DATA_DA_AV1)} · {INSTITUICAO.escola}
        </span>
        <h1 className="hero mt-6">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento pisca">
            _
          </span>
        </h1>
        <p className="slide-apoio text-texto">{capa.apoio}</p>
        <p className="mt-5 text-sm">
          {CLIENTE.orgao} · {INSTITUICAO.curso} · {INSTITUICAO.periodo}
        </p>
        <ul className="mt-4 flex max-w-4xl flex-wrap gap-x-5 gap-y-1 text-sm">
          {GRUPO_DA_DISCIPLINA.map((nome) => (
            <li key={nome}>{nome}</li>
          ))}
        </ul>
        <MarcaCesar className="mt-7 h-8 self-start" />
        <HorizonteDoRecife className="horizonte" />
      </Quadro>

      {/* 2 · O roteiro, na ordem das etapas da avaliação. */}
      <Quadro slide={roteiro}>
        <Titulo slide={roteiro} />
        <ol className="cascata mt-8 grid sm:grid-cols-2 md:grid-cols-5">
          {ROTEIRO_ML.map((parada, indice) => {
            const etapa = (indice + 1) as keyof typeof ETAPAS
            return (
              <li key={parada} className="bloco-raso md:-ml-px">
                <span className="ordinal">0{etapa}</span>
                <p className="titulo-bloco mt-2 text-xl">{parada}</p>
                <p className="rotulo mt-2">{ETAPAS[etapa]}</p>
              </li>
            )
          })}
        </ol>
      </Quadro>

      {/* 3 · O contexto: os quatro pesos, a conta e a frase da Secretaria. */}
      <Quadro slide={contexto}>
        <Titulo slide={contexto} />
        <Faixa
          className="cascata mt-7"
          fatias={INDICADORES_ML.map((indicador) => ({
            valor: indicador.peso,
            destaque: indicador.peso === 40,
            conteudo: (
              <>
                <p className="numero fonte-display text-3xl leading-none md:text-4xl">
                  {indicador.peso}%
                </p>
                <p className="numero mt-2 text-xs">{indicador.id}</p>
                <p className="mt-0.5 text-sm text-texto">{indicador.nome}</p>
              </>
            ),
          }))}
        />
        <p className="numero mt-5 text-base text-texto md:text-lg">{FORMULA_DO_RESULTADO}</p>
        <blockquote className="mt-6 border-l-2 border-acento pl-4">
          <p className="fonte-display text-xl md:text-2xl">“{CITACAO_DA_SECRETARIA.frase}”</p>
          <footer className="rotulo mt-2">{CITACAO_DA_SECRETARIA.fonte}</footer>
        </blockquote>
      </Quadro>

      {/* 4 · O objetivo e as três tarefas, cada uma com o alvo. */}
      <Quadro slide={objetivo}>
        <Titulo slide={objetivo} />
        <ol className="cascata mt-7 grid md:grid-cols-3">
          {TAREFAS_ML.map((tarefa, indice) => (
            <li key={tarefa.tarefa} className="bloco-raso flex flex-col md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="rotulo mt-2">{tarefa.tarefa}</p>
              <p className="titulo-bloco mt-1 text-xl">{tarefa.pergunta}</p>
              <div className="mt-auto border-t pt-3">
                <p className="rotulo mt-3">{ROTULO_DO_ALVO}</p>
                <p className="numero mt-1 text-2xl text-texto">{tarefa.alvo}</p>
                <p className="text-sm">{tarefa.tipoDoAlvo}</p>
              </div>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 5 · Para que serve, e o limite. */}
      <Quadro slide={uso}>
        <Titulo slide={uso} />
        <ul className="cascata mt-7 grid sm:grid-cols-2 md:grid-cols-4">
          {USOS_ML.map((item, indice) => (
            <li key={item.titulo} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-lg">{item.titulo}</p>
              <p className="mt-1 text-sm">{item.texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl border-l-2 border-acento pl-4 text-base text-texto">
          {LIMITE_ML}
        </p>
      </Quadro>

      {/* 6 · A origem: o funil de linhas e a ficha do arquivo. */}
      <Quadro slide={origem}>
        <Titulo slide={origem} />
        <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ol className="cascata grid">
            {FUNIL_ML.map((etapa) => (
              <li key={etapa.rotulo} className="bloco-raso">
                <div className="flex items-baseline gap-4">
                  <span className="odometro fonte-display numero w-24 shrink-0 text-5xl leading-none">
                    {etapa.numero}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-texto">{etapa.rotulo}</p>
                    <Barra className="mt-2" fracao={etapa.numero / B.linhas} />
                    <p className="mt-2 text-sm">{etapa.motivo}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <dl className="cascata grid content-start">
            {FICHA_DA_ORIGEM.map((item) => (
              <div key={item.rotulo} className="bloco-raso">
                <dt className="rotulo">{item.rotulo}</dt>
                <dd className="mt-1 text-sm text-texto">{item.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Quadro>

      {/* 7 · As colunas: os sete papéis e os tipos antes e depois. */}
      <Quadro slide={colunas}>
        <Titulo slide={colunas} />
        <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <ul className="grid gap-2.5">
            {B.papeis.map((papel) => (
              <li
                key={papel.papel}
                className="grid grid-cols-[13.5rem_minmax(0,1fr)_2.5rem] items-center gap-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-texto">
                    {papel.papel.toLowerCase()}
                  </span>
                  <span className="block truncate text-xs">
                    {PAPEIS_DAS_COLUNAS[papel.papel]}
                  </span>
                </span>
                <Barra fracao={papel.colunas / maiorPapel} />
                <span className="numero text-right text-sm text-texto">{papel.colunas}</span>
              </li>
            ))}
          </ul>
          <div className="grid content-start gap-6">
            <div>
              <p className="rotulo">{ROTULOS_DOS_TIPOS.leitura}</p>
              <ul className="mt-3 grid gap-2">
                {(['texto', 'inteiro', 'decimal'] as const).map((tipo) => (
                  <li
                    key={tipo}
                    className="grid grid-cols-[5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm"
                  >
                    <span className="text-texto">{ROTULOS_DOS_TIPOS[tipo]}</span>
                    <Barra fracao={B.tipos_na_leitura[tipo] / B.colunas} />
                    <span className="numero text-right text-texto">{B.tipos_na_leitura[tipo]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="rotulo">{ROTULOS_DOS_TIPOS.depois}</p>
              <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
                <span className="numero fonte-display text-4xl leading-none">
                  {B.categoricas.length}
                </span>
                <span className="text-sm">
                  <span className="block text-texto">{ROTULOS_DOS_TIPOS.categoricas}</span>
                  {B.categoricas.map((c) => `${c.coluna.toLowerCase()}: ${c.valores}`).join(' · ')}
                </span>
                <span className="numero fonte-display text-4xl leading-none">{B.numericas}</span>
                <span className="self-center text-sm text-texto">{ROTULOS_DOS_TIPOS.numericas}</span>
              </div>
            </div>
          </div>
        </div>
      </Quadro>

      {/* 8 · A tabela modelada e as classes. */}
      <Quadro slide={tabela}>
        <Titulo slide={tabela} />
        <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <dl className="cascata grid">
            {COLUNAS_MODELADAS.map((coluna) => {
              const ehAlvo = 'alvo' in coluna && coluna.alvo
              return (
                <div
                  key={coluna.coluna}
                  className="bloco-raso grid grid-cols-[8.5rem_minmax(0,1fr)] items-baseline gap-3 !py-2.5"
                >
                  <dt className="numero text-base text-texto">{coluna.coluna}</dt>
                  <dd className="min-w-0 text-sm">
                    <span className="rotulo mr-3">{coluna.tipo}</span>
                    <span className={cn(ehAlvo && 'text-texto')}>{coluna.papel}</span>
                  </dd>
                </div>
              )
            })}
          </dl>
          <div className="grid content-start">
            <p className="rotulo">{ROTULOS_DAS_CLASSES.titulo}</p>
            <div className="mt-3 grid grid-cols-2">
              {[
                { rotulo: ROTULOS_DAS_CLASSES.noventaOuMais, valor: classes.noventa_ou_mais },
                { rotulo: ROTULOS_DAS_CLASSES.abaixo, valor: classes.abaixo_de_90 },
              ].map((classe) => (
                <div key={classe.rotulo} className="bloco-raso -ml-px first:ml-0">
                  <p className="odometro fonte-display numero text-6xl leading-none">
                    {classe.valor}
                  </p>
                  <p className="numero mt-2 text-sm text-texto">
                    {porcento(classe.valor, totalClasses)}
                  </p>
                  <p className="text-sm">{classe.rotulo}</p>
                </div>
              ))}
            </div>
            {/* A classe positiva (abaixo de 90%, o 1 do alvo) leva o acento. */}
            <div aria-hidden className="mt-4 flex h-3 gap-px">
              <span className="graf-barra" style={{ flexBasis: `${(classes.noventa_ou_mais / totalClasses) * 100}%` }} />
              <span className="bg-acento" style={{ flexBasis: `${(classes.abaixo_de_90 / totalClasses) * 100}%` }} />
            </div>
            <p className="mt-4 text-sm">{ROTULOS_DAS_CLASSES.nota}</p>
          </div>
        </div>
      </Quadro>

      {/* 9 · As distribuições: cinco histogramas, na ordem das notas. */}
      <Quadro slide={distribuicao}>
        <Titulo slide={distribuicao} />
        <ul className="cascata mt-7 grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-5">
          {dados.distribuicao.map((nota) => {
            const comum = nota.degraus[0]
            return (
              <li key={nota.coluna} className="min-w-0">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="numero text-base text-texto">{nota.coluna}</span>
                  <span className="truncate text-xs">{NOMES_DAS_NOTAS[nota.coluna]}</span>
                </p>
                <Histograma className="graf-eixo mt-2 h-36 border-b" contagens={nota.histograma.contagens} />
                <p className="numero mt-1 flex justify-between text-[0.65rem]">
                  <span>{decimal(nota.histograma.de)}</span>
                  <span>{decimal(nota.histograma.ate)}</span>
                </p>
                <dl className="mt-3 grid gap-1 text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="rotulo">{ROTULOS_DA_DISTRIBUICAO.assimetria}</dt>
                    <dd className="numero text-texto">{decimal(nota.assimetria)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="rotulo">{ROTULOS_DA_DISTRIBUICAO.maisComum}</dt>
                    <dd className="numero text-texto">{enxuto(comum.valor)}</dd>
                  </div>
                  <dd className="numero text-right text-xs">
                    {comum.unidades} {ROTULOS_DA_DISTRIBUICAO.unidades}
                  </dd>
                </dl>
              </li>
            )
          })}
        </ul>
      </Quadro>

      {/* 10 · Família e distrito, na mesma escala, com o corte de 90%. */}
      <Quadro slide={grupos}>
        <Titulo slide={grupos} />
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {[
            { titulo: ROTULOS_DOS_GRUPOS.familia, linhas: dados.por_familia },
            { titulo: ROTULOS_DOS_GRUPOS.distrito, linhas: dados.por_distrito },
          ].map((painel) => (
            <div key={painel.titulo} className="min-w-0">
              <p className="rotulo mb-3">{painel.titulo}</p>
              <Caixas
                de={0.6}
                ate={2}
                marcas={[0.6, 1, 1.4, 1.8]}
                corte={0.9}
                rotuloDoCorte={ROTULOS_DOS_GRUPOS.corte}
                linhas={painel.linhas.map((linha) => ({ rotulo: linha.grupo, caixa: linha }))}
              />
            </div>
          ))}
        </div>
      </Quadro>

      {/* 11 · A correlação: a matriz das notas e as colunas cruas. */}
      <Quadro slide={correlacao}>
        <Titulo slide={correlacao} />
        <div className="mt-7 grid items-start gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="rotulo mb-3">{ROTULOS_DA_CORRELACAO.matriz}</p>
            <MapaDeCalor
              className="max-w-[22rem]"
              colunas={dados.correlacao.colunas}
              matriz={dados.correlacao.matriz}
              destaque={[2, 4]}
              formatar={(valor) => decimal(valor)}
            />
          </div>
          <div className="min-w-0">
            <p className="rotulo mb-3">
              {ROTULOS_DA_CORRELACAO.colunas} · {ROTULOS_DA_CORRELACAO.escala}
            </p>
            <ul className="grid gap-2.5">
              {cruas.map((coluna) => (
                <li
                  key={coluna.coluna}
                  className="grid grid-cols-[9.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm"
                >
                  <span className="truncate text-texto">{rotuloDaColuna(coluna.coluna)}</span>
                  <BarraDivergente valor={coluna.r} />
                  <span className="numero text-right">{decimal(coluna.r)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Quadro>

      {/* 12 · Ausentes e outliers. */}
      <Quadro slide={faltantes}>
        <Titulo slide={faltantes} />
        <div className="mt-7 grid items-start gap-10 md:grid-cols-2">
          <div className="min-w-0">
            <p className="rotulo mb-3">{ROTULOS_DOS_FALTANTES.mapa}</p>
            <MapaDeAusentes className="flex aspect-[260/150] w-full items-center justify-center">
              <div className="border border-linha-alta bg-fundo px-5 py-3 text-center">
                <p className="odometro fonte-display numero text-6xl leading-none">
                  {dados.faltantes.depois_da_conversao}
                </p>
                <p className="mt-1 text-sm text-texto">{ROTULOS_DOS_FALTANTES.ausentes}</p>
              </div>
            </MapaDeAusentes>
            <p className="numero mt-2 text-xs">
              {ROTULOS_DOS_FALTANTES.dimensoes} = {milhar(B.celulas)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="rotulo mb-3">{ROTULOS_DOS_FALTANTES.outliers}</p>
            <ul className="grid gap-3">
              {dados.outliers.map((outlier) => (
                <li
                  key={outlier.coluna}
                  className="grid grid-cols-[3.5rem_minmax(0,1fr)_6.5rem] items-center gap-3 text-sm"
                >
                  <span className="numero text-texto">{outlier.coluna}</span>
                  <Barra fracao={outlier.percentual / maiorOutlier} />
                  <span className="numero text-right">
                    <span className="text-texto">{outlier.unidades}</span> ·{' '}
                    {decimal(outlier.percentual, 1)}%
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-texto">{ROTULOS_DOS_FALTANTES.macNoGeral}</p>
          </div>
        </div>
      </Quadro>

      {/* 13 · As inconsistências, cada uma com o tamanho. */}
      <Quadro slide={inconsistencias}>
        <Titulo slide={inconsistencias} />
        <ul className="cascata mt-7 grid sm:grid-cols-2 md:grid-cols-3">
          {INCONSISTENCIAS_ML.map((item) => (
            <li key={item.texto} className="bloco-raso md:-ml-px">
              <p className="odometro fonte-display numero text-5xl leading-none">{item.numero}</p>
              <p className="mt-3 text-sm text-texto">{item.texto}</p>
            </li>
          ))}
        </ul>
      </Quadro>

      {/* 14 · As seis linhas fora da regra: o gráfico que vira argumento. */}
      <Quadro slide={foraDaRegra}>
        <Titulo slide={foraDaRegra} />
        <div className="mt-5 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Dispersao
            className="mx-auto w-full max-w-[21rem]"
            de={0.6}
            ate={2}
            marcas={[0.6, 1, 1.4, 1.8]}
            rotuloX={ROTULOS_DA_DISPERSAO.eixoX}
            rotuloY={ROTULOS_DA_DISPERSAO.eixoY}
            rotuloDaDiagonal={ROTULOS_DA_DISPERSAO.diagonal}
            pontos={dados.dispersao.map((ponto) => ({
              x: ponto.esperado,
              y: ponto.lancado,
              destaque: ponto.fora,
            }))}
          />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-linha-alta">
                <th className="rotulo pb-2 text-left font-medium">{ROTULOS_DA_DISPERSAO.unidade}</th>
                <th className="rotulo pb-2 text-right font-medium">{ROTULOS_DA_DISPERSAO.esperado}</th>
                <th className="rotulo pb-2 text-right font-medium">{ROTULOS_DA_DISPERSAO.lancado}</th>
              </tr>
            </thead>
            <tbody className="numero">
              {dados.linhas_fora_da_regra.map((linha) => (
                <tr key={`${linha.tipo}-${linha.distrito}`} className="border-b">
                  <td className="py-2 text-texto">
                    <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-acento" />
                    {linha.tipo} · {linha.distrito}
                  </td>
                  <td className="py-2 text-right">{decimal(linha.esperado, 3)}</td>
                  <td className="py-2 text-right text-texto">{decimal(linha.lancado, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Quadro>

      {/* 15 · Os achados da exploração, cada um com o que mudou. */}
      <Quadro slide={insights}>
        <Titulo slide={insights} />
        <ol className="cascata mt-7 grid sm:grid-cols-2 md:grid-cols-3">
          {INSIGHTS_EDA.map((item, indice) => (
            <li key={item.achado} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="mt-2 text-base text-texto">{item.achado}</p>
              <p className="mt-2 text-sm">→ {item.efeito}</p>
            </li>
          ))}
        </ol>
      </Quadro>

      {/* 16 · O tratamento: problema, decisão e porquê. */}
      <Quadro slide={tratamento}>
        <Titulo slide={tratamento} />
        <table className="mt-7 w-full text-sm">
          <thead>
            <tr className="border-b border-linha-alta">
              {COLUNAS_DO_TRATAMENTO.map((coluna) => (
                <th key={coluna} className="rotulo pb-2 pr-4 text-left font-medium">
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DECISOES_DO_TRATAMENTO.map((linha) => (
              <tr key={linha.problema} className="border-b align-top">
                <td className="py-2.5 pr-4">{linha.problema}</td>
                <td className="py-2.5 pr-4 text-texto">{linha.decisao}</td>
                <td className="py-2.5">{linha.porque}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Quadro>

      {/* 17 · A codificação, a padronização e as MAC por nível. */}
      <Quadro slide={codificacao}>
        <Titulo slide={codificacao} />
        <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <dl className="cascata grid">
            {CODIFICACOES.map((item) => (
              <div
                key={item.coluna}
                className="bloco-raso grid grid-cols-[11.5rem_minmax(0,1fr)] gap-x-4 !py-3"
              >
                <dt>
                  <span className="block text-sm">{item.coluna}</span>
                  <span className="titulo-bloco block text-lg">{item.tecnica}</span>
                </dt>
                <dd className="self-center text-sm">{item.porque}</dd>
              </div>
            ))}
            <div className="bloco-raso grid grid-cols-[11.5rem_minmax(0,1fr)] gap-x-4 !py-3">
              <dt className="titulo-bloco self-center text-lg">{PADRONIZACAO.titulo}</dt>
              <dd className="self-center text-sm">{PADRONIZACAO.texto}</dd>
            </div>
          </dl>
          <div className="min-w-0">
            <p className="rotulo mb-3">{ROTULOS_DA_CODIFICACAO.nivelMac}</p>
            <Caixas
              de={0.6}
              ate={1.35}
              marcas={[0.6, 0.8, 1, 1.2]}
              corte={0.9}
              rotuloDoCorte={ROTULOS_DOS_GRUPOS.corte}
              linhas={dados.codificacao.nivel_mac.map((nivel) => ({
                rotulo: `MAC ${nivel.nivel}`,
                caixa: nivel,
              }))}
            />
            <p className="numero mt-6 text-base text-texto">{ROTULOS_DA_CODIFICACAO.resultado}</p>
          </div>
        </div>
      </Quadro>

      {/* 18 · As seis features novas, em ficha. */}
      <Quadro slide={features}>
        <Titulo slide={features} />
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-linha-alta">
              {COLUNAS_DAS_FEATURES.map((coluna, indice) => (
                <th
                  key={coluna}
                  className={cn(
                    'rotulo pb-2 pr-4 text-left font-medium',
                    // "como" e "distribuição" saem no celular: a fala cobre.
                    (indice === 1 || indice === 3) && 'hidden md:table-cell',
                  )}
                >
                  {coluna}
                </th>
              ))}
              <th className="rotulo pb-2 text-right font-medium">
                {ROTULOS_DA_DISTRIBUICAO.assimetria}
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES_NOVAS.map((feature) => {
              const eda = dados.features_novas.find((f) => f.coluna === feature.coluna)
              return (
                <tr key={feature.coluna} className="border-b align-middle">
                  <td className="numero break-all py-2 pr-4 text-texto">{feature.coluna}</td>
                  <td className="numero hidden py-2 pr-4 md:table-cell">{feature.como}</td>
                  <td className="py-2 pr-4">{feature.porque}</td>
                  <td className="hidden w-32 py-2 pr-4 md:table-cell">
                    {eda ? (
                      <Histograma className="graf-eixo h-8 border-b" contagens={eda.histograma.contagens} />
                    ) : null}
                  </td>
                  <td className="numero py-2 text-right text-texto">
                    {eda ? decimal(eda.assimetria) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Quadro>

      {/* 19 · A EDA das features: correlação com os dois alvos. */}
      <Quadro slide={edaFeatures}>
        <Titulo slide={edaFeatures} />
        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <div className="min-w-0 text-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] gap-x-3 border-b border-linha-alta pb-2 md:grid-cols-[15rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-4">
              <span />
              <span className="rotulo">{ROTULOS_DA_EDA_DAS_FEATURES.comGeral}</span>
              <span className="rotulo">{ROTULOS_DA_EDA_DAS_FEATURES.comAbaixo}</span>
            </div>
            <ul>
              {dados.correlacao_features.map((linha) => (
                <li
                  key={linha.coluna}
                  className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-x-3 border-b py-1.5 md:grid-cols-[15rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-x-4"
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className={cn('numero truncate', linha.nova && 'text-texto')}>
                      {linha.coluna}
                    </span>
                    {linha.nova ? (
                      <span className="rotulo text-[0.6rem]">{ROTULOS_DA_EDA_DAS_FEATURES.nova}</span>
                    ) : null}
                  </span>
                  {/* No celular a barra sai e fica o número: 4,5rem não
                      desenham correlação nenhuma. */}
                  <span className="grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_3rem]">
                    <BarraDivergente className="hidden md:block" valor={linha.com_geral} />
                    <span className="numero text-right">{decimal(linha.com_geral)}</span>
                  </span>
                  <span className="grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_3rem]">
                    <BarraDivergente className="hidden md:block" valor={linha.com_abaixo_de_90} />
                    <span className="numero text-right">{decimal(linha.com_abaixo_de_90)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-6 text-sm">
            <div>
              <p className="rotulo">{ROTULOS_DA_EDA_DAS_FEATURES.redundancia}</p>
              <ul className="mt-2 grid gap-1">
                {dados.redundantes.map((par) => (
                  <li key={`${par.a}-${par.b}`} className="flex items-baseline justify-between gap-3">
                    <span className="numero truncate">
                      {par.a} · {par.b}
                    </span>
                    <span className="numero text-texto">{decimal(par.correlacao)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs">{ROTULOS_DA_EDA_DAS_FEATURES.redundanciaNota}</p>
            </div>
            <div>
              <p className="rotulo">{ROTULOS_DA_EDA_DAS_FEATURES.descartadas}</p>
              <ul className="mt-2 grid gap-2">
                {DESCARTADAS.map((item) => (
                  <li key={item.nome}>
                    <span className="block text-texto">{item.nome}</span>
                    <span className="block text-xs">{item.porque}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Quadro>

      {/* 20 · O fechamento: destaques, o que vem depois e onde ler. */}
      <Quadro slide={fechamento} className="grao">
        <h2 className="slide-titulo">{fechamento.titulo}</h2>
        <ol className="cascata mt-6 grid md:grid-cols-3">
          {DESTAQUES_ML.map((destaque, indice) => (
            <li key={destaque.titulo} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2 text-lg">{destaque.titulo}</p>
              <p className="mt-1 text-sm">{destaque.texto}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 max-w-4xl text-sm">
          {PROXIMOS_PASSOS} ·{' '}
          <span className="text-texto">
            {ROTULO_DA_ENTREGA_FINAL} {formatarBR(DATA_DA_ENTREGA_FINAL)}
          </span>
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {ONDE_ESTA_CADA_ENTREGA.map((item) => (
            <div key={item.oQue} className="flex flex-wrap gap-x-2">
              <dt>{item.oQue}</dt>
              <dd className="numero text-texto">{item.onde}</dd>
            </div>
          ))}
        </dl>
        {/* Sem a faixa do Recife aqui, ao contrário do Kick-off: este
            fechamento tem três vezes mais texto, e o desenho passava por cima
            do endereço. A capa continua com ela. */}
        <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-3">
          <a
            href={`${URL_SITE}/ml`}
            className="numero text-lg text-texto underline decoration-linha-alta underline-offset-8 hover:decoration-acento sm:text-2xl"
          >
            {ENDERECO_SITE}/ml
          </a>
          <p className="fonte-display text-2xl">{PERGUNTAS}</p>
        </div>
      </Quadro>
    </>
  )
}

/* ------------------------------------------------------------------------- */

/** 0,5 e 1,89 em vez de 0,500 e 1,890: até três casas, sem zero sobrando. */
function enxuto(valor: number): string {
  return decimal(valor, 3).replace(/,?0+$/, '')
}

function Quadro({
  slide,
  className,
  children,
}: {
  slide: SlideML
  className?: string
  children: ReactNode
}) {
  const indice = SLIDES_ML.findIndex((s) => s.id === slide.id)

  return (
    <section
      id={`slide-${slide.numero}`}
      data-slide={slide.numero}
      aria-label={`Slide ${slide.numero} de ${SLIDES_ML.length}: ${slide.titulo}`}
      className={cn('slide slide-ml', className)}
    >
      <div className="slide-corpo flex flex-col">{children}</div>

      <details className="notas sem-impressao">
        <summary>
          <span className="rotulo">notas</span>
          <span>
            {formatarTempo(slide.segundos)} · começa em {formatarTempo(inicioDoSlideML(indice))}
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
          · {PILULA_DA_CAPA}
        </span>
        <span className="numero">
          {slide.numero}/{SLIDES_ML.length}
        </span>
      </footer>
    </section>
  )
}

function Titulo({ slide }: { slide: SlideML }) {
  return (
    <>
      {slide.etapa ? (
        <p className="rotulo">
          {ROTULO_DA_ETAPA} <span className="numero">{slide.etapa}</span> · {ETAPAS[slide.etapa]}
        </p>
      ) : null}
      <h2 className="slide-titulo mt-1.5">{slide.titulo}</h2>
      <p className="slide-apoio">{slide.apoio}</p>
    </>
  )
}
