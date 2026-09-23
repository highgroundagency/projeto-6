import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Os gráficos da AV1 de machine learning, desenhados em HTML.
 *
 * NÃO SÃO IMAGENS DO MATPLOTLIB, e é decisão. A identidade do site tem uma
 * imagem só (o gradiente granulado), e um PNG colado não acompanha o tema: no
 * claro ele viraria um retângulo escuro no meio do papel. Aqui cada barra, caixa
 * e ponto é um elemento com a cor de um token (regra 10 da casa), o texto é
 * texto de verdade (lê no projetor, copia, passa pelo leitor de tela) e o
 * número vem do JSON que o caderno 07 grava.
 *
 * NENHUMA POSIÇÃO USA `transform`. A folha de impressão zera toda
 * transformação dentro de `.slide` para o PDF sair no estado final das
 * animações; um ponto centralizado com `translate(-50%)` sairia deslocado
 * justamente no arquivo que vira reserva. Por isso o centro é feito com margem
 * negativa, e a posição, com `left` e `bottom` em porcentagem.
 *
 * NENHUM RÓTULO ABAIXO DE 12px (`text-xs`). A banca lê de três metros, e a
 * revisão de 23/09 achou a frase que explica o slide 14 em 9,6px.
 *
 * O ACENTO É DE QUEM CHAMA. Os componentes aceitam um destaque, mas quem
 * decide onde o laranja cai é o slide, que conta os três usos da regra 11.
 */

/** Uma escala linear de [min, max] para [0, 100], em porcentagem. */
export function escala(min: number, max: number): (valor: number) => number {
  return (valor) => ((valor - min) / (max - min)) * 100
}

/** O texto misturado com transparente: o único tom dos gráficos além do acento. */
export function tinta(percentual: number): string {
  return `color-mix(in srgb, var(--color-texto) ${percentual}%, transparent)`
}

/* -------------------------------------------------------------------------
   Histograma
------------------------------------------------------------------------- */

export function Histograma({
  contagens,
  className,
}: {
  contagens: readonly number[]
  className?: string
}) {
  const maior = Math.max(...contagens, 1)
  return (
    <div aria-hidden className={cn('graf-histograma flex items-end gap-px', className)}>
      {contagens.map((contagem, indice) => (
        <span
          key={indice}
          className="graf-barra min-w-0 flex-1"
          style={{ height: contagem === 0 ? 0 : `max(2px, ${(contagem / maior) * 100}%)` }}
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------
   Barra horizontal simples e barra divergente (correlação)
------------------------------------------------------------------------- */

export function Barra({
  fracao,
  destaque = false,
  className,
}: {
  /** De 0 a 1: quanto do trilho a barra ocupa. */
  fracao: number
  destaque?: boolean
  className?: string
}) {
  return (
    <span aria-hidden className={cn('graf-trilho relative block h-2.5', className)}>
      <span
        className={cn('absolute inset-y-0 left-0', destaque ? 'bg-acento' : 'graf-barra')}
        style={{ width: `${Math.max(0, Math.min(1, fracao)) * 100}%` }}
      />
    </span>
  )
}

/** Correlação de −1 a 1: o zero no meio, a barra cresce para o lado do sinal. */
export function BarraDivergente({
  valor,
  destaque = false,
  className,
}: {
  valor: number
  destaque?: boolean
  className?: string
}) {
  const metade = Math.min(1, Math.abs(valor)) * 50
  return (
    <span aria-hidden className={cn('graf-trilho relative block h-2.5', className)}>
      <span className="graf-zero absolute inset-y-[-3px] left-1/2 w-px" />
      <span
        className={cn('absolute inset-y-0', destaque ? 'bg-acento' : 'graf-barra')}
        style={{ left: `${valor >= 0 ? 50 : 50 - metade}%`, width: `${metade}%` }}
      />
    </span>
  )
}

/* -------------------------------------------------------------------------
   Caixas (boxplot horizontal), com eixo e linha de corte
------------------------------------------------------------------------- */

export interface Caixa {
  readonly n: number
  readonly q1: number
  readonly mediana: number
  readonly q3: number
  readonly bigode_baixo: number
  readonly bigode_alto: number
  readonly fora: readonly number[]
}

export interface LinhaDeCaixas {
  readonly rotulo: string
  readonly caixa: Caixa
}

/** Os cabeçalhos da tabela que substitui o desenho no leitor de tela. */
export interface RotulosDasCaixas {
  readonly grupo: string
  readonly n: string
  readonly q1: string
  readonly mediana: string
  readonly q3: string
  readonly baixo: string
  readonly alto: string
  readonly fora: string
}

/**
 * Um conjunto de caixas na mesma escala. O corte, quando existe, é uma linha
 * vertical tracejada no acento: é ele que diz o que a caixa significa.
 *
 * O desenho é escondido do leitor de tela, que lê no lugar dele uma tabela com
 * os mesmos números: quartis, mediana, bigodes e pontos fora.
 */
export function Caixas({
  linhas,
  de,
  ate,
  marcas,
  corte,
  rotuloDoCorte,
  rotuloDoN,
  rotulosDaTabela,
  formatar,
  alta = false,
  className,
}: {
  linhas: readonly LinhaDeCaixas[]
  de: number
  ate: number
  marcas: readonly number[]
  corte?: number
  rotuloDoCorte?: string
  rotuloDoN?: string
  rotulosDaTabela: RotulosDasCaixas
  formatar: (valor: number) => string
  /** Linhas mais altas, para quando há poucos grupos e espaço sobrando. */
  alta?: boolean
  className?: string
}) {
  const x = escala(de, ate)
  const linha = alta ? 'h-9' : 'h-6'
  const T = rotulosDaTabela
  return (
    <div className={className}>
      <div aria-hidden className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 text-xs">
        {/* A faixa de cima leva o cabeçalho do n e o rótulo do corte: embaixo,
            o rótulo caía em cima da última caixa. */}
        <span className="flex h-5 items-end justify-end">
          {rotuloDoN ? <span className="numero">{rotuloDoN}</span> : null}
        </span>
        <span className="relative h-5">
          {corte !== undefined && rotuloDoCorte ? (
            <span
              className="numero absolute bottom-0 text-xs text-acento"
              style={{ left: `${x(corte)}%`, marginLeft: '-2ch' }}
            >
              {rotuloDoCorte}
            </span>
          ) : null}
        </span>
        {linhas.map(({ rotulo, caixa }) => (
          <div key={rotulo} className="contents">
            <span className={cn('flex items-center justify-between gap-1', linha)}>
              <span className="text-texto">{rotulo}</span>
              <span className="numero">{caixa.n}</span>
            </span>
            <span className={cn('relative', linha)}>
              {corte !== undefined ? (
                <span
                  className="graf-corte absolute inset-y-0 z-[1] w-0"
                  style={{ left: `${x(corte)}%` }}
                />
              ) : null}
              <span
                className="graf-bigode absolute top-1/2 h-px"
                style={{
                  left: `${x(caixa.bigode_baixo)}%`,
                  width: `${x(caixa.bigode_alto) - x(caixa.bigode_baixo)}%`,
                }}
              />
              <span
                className={cn('graf-caixa absolute', alta ? 'inset-y-2' : 'inset-y-1')}
                style={{
                  left: `${x(caixa.q1)}%`,
                  width: `max(2px, ${x(caixa.q3) - x(caixa.q1)}%)`,
                }}
              />
              <span
                className={cn(
                  'graf-mediana absolute z-[2] w-0.5',
                  alta ? 'inset-y-1.5' : 'inset-y-0.5',
                )}
                style={{ left: `${x(caixa.mediana)}%`, marginLeft: -1 }}
              />
              {caixa.fora.map((valor, indice) => (
                <span
                  key={`${valor}-${indice}`}
                  className="graf-ponto graf-ponto-meio top-1/2 z-[2]"
                  style={{ left: `${x(valor)}%` }}
                />
              ))}
            </span>
          </div>
        ))}
        <span />
        <Eixo de={de} ate={ate} marcas={marcas} />
      </div>
      {/* `sr-only` num div, e não na tabela: tabela ignora `width: 1px` e
          ocupava a largura inteira dela, empurrando o slide no celular. */}
      <div className="sr-only">
        <table>
          <thead>
            <tr>
              {[T.grupo, T.n, T.q1, T.mediana, T.q3, T.baixo, T.alto, T.fora].map(
                (cabecalho) => (
                  <th key={cabecalho} scope="col">
                    {cabecalho}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ rotulo, caixa }) => (
              <tr key={rotulo}>
                <th scope="row">{rotulo}</th>
                <td>{caixa.n}</td>
                <td>{formatar(caixa.q1)}</td>
                <td>{formatar(caixa.mediana)}</td>
                <td>{formatar(caixa.q3)}</td>
                <td>{formatar(caixa.bigode_baixo)}</td>
                <td>{formatar(caixa.bigode_alto)}</td>
                <td>{caixa.fora.map(formatar).join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** As marcas de um eixo horizontal. */
export function Eixo({
  de,
  ate,
  marcas,
  formatar = (valor) => valor.toFixed(1).replace('.', ','),
  className,
}: {
  de: number
  ate: number
  marcas: readonly number[]
  formatar?: (valor: number) => string
  className?: string
}) {
  const x = escala(de, ate)
  return (
    <span className={cn('graf-eixo relative mt-1 block h-5 border-t', className)}>
      {marcas.map((marca) => (
        <span
          key={marca}
          className="numero absolute top-0.5 text-xs"
          style={{ left: `${x(marca)}%`, marginLeft: '-1.5ch' }}
        >
          {formatar(marca)}
        </span>
      ))}
    </span>
  )
}

/* -------------------------------------------------------------------------
   Dispersão com diagonal
------------------------------------------------------------------------- */

export interface Ponto {
  readonly x: number
  readonly y: number
  readonly destaque?: boolean
}

/**
 * Pontos num quadrado, os dois eixos na mesma escala: a diagonal é y = x. Os
 * destacados vêm por último, para ficarem por cima. O leitor de tela recebe o
 * `resumo` no lugar dos pontos, e a tabela ao lado dá as linhas uma a uma.
 */
export function Dispersao({
  pontos,
  de,
  ate,
  marcas,
  rotuloX,
  rotuloY,
  rotuloDaDiagonal,
  resumo,
  className,
}: {
  pontos: readonly Ponto[]
  de: number
  ate: number
  marcas: readonly number[]
  rotuloX: string
  rotuloY: string
  rotuloDaDiagonal: string
  resumo: string
  className?: string
}) {
  const x = escala(de, ate)
  const ordenados = [...pontos].sort(
    (a, b) => Number(a.destaque ?? false) - Number(b.destaque ?? false),
  )
  const formatar = (valor: number) => valor.toFixed(1).replace('.', ',')

  return (
    <figure
      aria-label={resumo}
      className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-x-2', className)}
    >
      <span
        aria-hidden
        className="rotulo self-center text-xs [writing-mode:vertical-rl] rotate-180"
      >
        {rotuloY}
      </span>
      <div aria-hidden className="flex min-h-0 flex-col">
        <div className="graf-quadro relative aspect-square min-h-0 flex-1 border">
          {marcas.map((marca) =>
            marca === de ? null : (
              <span
                key={`y-${marca}`}
                className="numero absolute left-1 text-xs"
                style={{ bottom: `${x(marca)}%`, marginBottom: '-0.5rem' }}
              >
                {formatar(marca)}
              </span>
            ),
          )}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="0"
              className="graf-diagonal"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="rotulo absolute bottom-2 right-2 text-xs">{rotuloDaDiagonal}</span>
          {ordenados.map((ponto, indice) => (
            <span
              key={indice}
              className={cn('graf-ponto', ponto.destaque && 'graf-ponto-acento')}
              style={{ left: `${x(ponto.x)}%`, bottom: `${x(ponto.y)}%` }}
            />
          ))}
        </div>
        {/* A borda de baixo do quadro já é o eixo: o traço do Eixo sai. */}
        <Eixo
          className="mt-0 border-t-0"
          de={de}
          ate={ate}
          marcas={marcas.filter((m) => m !== de)}
          formatar={formatar}
        />
        <span className="rotulo text-center text-xs">{rotuloX}</span>
      </div>
    </figure>
  )
}

/* -------------------------------------------------------------------------
   Mapa de calor da correlação
------------------------------------------------------------------------- */

/**
 * A matriz inteira, com o valor escrito em cada célula. O tom é a força da
 * correlação (o valor absoluto); o sinal está no número, que a fala lê.
 *
 * DUAS FAIXAS DE TOM, E UM BURACO NO MEIO. A mistura do texto com transparente
 * passa por uma zona em que nem texto claro nem escuro dá contraste, e essa
 * zona fica em lugares diferentes no escuro e no claro. Correlação fraca vai
 * até uns 35% de tinta com o texto normal; forte começa em 65% com o texto na
 * cor do fundo. Nas duas pontas o contraste passa de 4,5:1 nos dois temas.
 *
 * A diagonal (uma coluna com ela mesma, sempre 1) sai quase apagada: ela não
 * informa nada e puxava o olho antes da célula que o slide discute.
 */
export function MapaDeCalor({
  colunas,
  matriz,
  destaque,
  formatar,
  className,
}: {
  colunas: readonly string[]
  matriz: readonly (readonly number[])[]
  destaque?: readonly [number, number]
  formatar: (valor: number) => string
  className?: string
}) {
  const estilo = {
    gridTemplateColumns: `auto repeat(${colunas.length}, minmax(0, 1fr))`,
  } as CSSProperties
  return (
    <div className={cn('grid text-sm', className)} style={estilo}>
      <span />
      {colunas.map((coluna) => (
        <span key={`topo-${coluna}`} className="numero pb-1 text-center text-xs">
          {coluna}
        </span>
      ))}
      {matriz.map((linha, i) => (
        <div key={colunas[i]} className="contents">
          <span className="numero self-center pr-2 text-right text-xs">{colunas[i]}</span>
          {linha.map((valor, j) => {
            const diagonal = i === j
            const modulo = Math.abs(valor)
            const forte = modulo > 0.6
            const mistura = forte ? 65 + (modulo - 0.6) * 37.5 : 6 + modulo * 48
            const tom = tinta(Math.round(diagonal ? 6 : mistura))
            const marcada = destaque && destaque[0] === i && destaque[1] === j
            const corDoTexto = diagonal
              ? 'var(--color-apagado)'
              : forte
                ? 'var(--color-fundo)'
                : 'var(--color-texto)'
            return (
              <span
                key={`${i}-${j}`}
                className={cn(
                  'numero graf-celula flex aspect-square items-center justify-center',
                  marcada && 'graf-celula-acento',
                )}
                style={{ background: tom, color: corDoTexto }}
              >
                {formatar(valor)}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------
   Faixa proporcional (pesos)
------------------------------------------------------------------------- */

export interface Fatia {
  readonly valor: number
  readonly conteudo: ReactNode
  readonly destaque?: boolean
}

/**
 * Uma faixa dividida na proporção dos valores, com o conteúdo de cada pedaço
 * dentro dele. As bordas se encostam, como os blocos do site.
 *
 * No celular a proporção cede: quatro fatias de 20% em 360px encavalavam os
 * números. Abaixo de `md` a faixa vira uma grade de duas colunas; em grade o
 * `flex-basis` não tem efeito, então a proporção volta sozinha em `md`.
 */
export function Faixa({ fatias, className }: { fatias: readonly Fatia[]; className?: string }) {
  const total = fatias.reduce((soma, f) => soma + f.valor, 0)
  return (
    <div className={cn('grid grid-cols-2 md:flex', className)}>
      {fatias.map((fatia, indice) => (
        <div
          key={indice}
          className={cn(
            'relative min-w-0 border px-3 py-2 even:-ml-px [&:nth-child(n+3)]:-mt-px',
            'md:mt-0 md:-ml-px md:first:ml-0 md:[&:nth-child(n+3)]:mt-0',
            fatia.destaque ? 'z-10 border-acento' : 'border-linha-alta',
          )}
          style={{ flexBasis: `${(fatia.valor / total) * 100}%`, flexGrow: 0, flexShrink: 0 }}
        >
          {fatia.conteudo}
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------
   Mapa de ausentes
------------------------------------------------------------------------- */

/**
 * A planilha inteira como uma grade de células. Célula ausente seria pintada
 * no acento; como não há nenhuma, a grade sai inteira no tom neutro, e o
 * gráfico mostra exatamente o que o caderno mostra: nada.
 */
export function MapaDeAusentes({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  // A grade desenhada é mais grossa que a planilha (260 colunas viram 52
  // quadros): célula de 1,5px some no projetor e vira cinza liso. A legenda,
  // que quem chama escreve, diz o tamanho de verdade.
  return <div className={cn('graf-ausentes relative border', className)}>{children}</div>
}
