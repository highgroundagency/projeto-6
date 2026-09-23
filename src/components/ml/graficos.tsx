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

/**
 * Um conjunto de caixas na mesma escala. O corte, quando existe, é uma linha
 * vertical tracejada no acento: é ele que diz o que a caixa significa.
 */
export function Caixas({
  linhas,
  de,
  ate,
  marcas,
  corte,
  rotuloDoCorte,
  className,
}: {
  linhas: readonly LinhaDeCaixas[]
  de: number
  ate: number
  marcas: readonly number[]
  corte?: number
  rotuloDoCorte?: string
  className?: string
}) {
  const x = escala(de, ate)
  return (
    <div className={cn('grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 text-xs', className)}>
      {/* O rótulo do corte fica NO ALTO, numa faixa própria: embaixo ele caía
          em cima da última caixa. */}
      {corte !== undefined && rotuloDoCorte ? (
        <>
          <span />
          <span className="relative h-4">
            <span
              className="numero absolute bottom-0 text-[0.65rem] text-acento"
              style={{ left: `${x(corte)}%`, marginLeft: '-1ch' }}
            >
              {rotuloDoCorte}
            </span>
          </span>
        </>
      ) : null}
      {linhas.map(({ rotulo, caixa }) => (
        <div key={rotulo} className="contents">
          <span className="flex items-baseline justify-between gap-1 leading-6">
            <span className="text-texto">{rotulo}</span>
            <span className="numero text-[0.65rem]">{caixa.n}</span>
          </span>
          <span className="relative h-6">
            {corte !== undefined ? (
              <span className="graf-corte absolute inset-y-0 w-0" style={{ left: `${x(corte)}%` }} />
            ) : null}
            <span
              className="graf-bigode absolute top-1/2 h-px"
              style={{
                left: `${x(caixa.bigode_baixo)}%`,
                width: `${x(caixa.bigode_alto) - x(caixa.bigode_baixo)}%`,
              }}
            />
            <span
              className="graf-caixa absolute inset-y-1"
              style={{
                left: `${x(caixa.q1)}%`,
                width: `max(2px, ${x(caixa.q3) - x(caixa.q1)}%)`,
              }}
            />
            <span
              className="graf-mediana absolute inset-y-0.5 w-0.5"
              style={{ left: `${x(caixa.mediana)}%`, marginLeft: -1 }}
            />
            {caixa.fora.map((valor, indice) => (
              <span
                key={`${valor}-${indice}`}
                className="graf-ponto graf-ponto-meio top-1/2"
                style={{ left: `${x(valor)}%` }}
              />
            ))}
          </span>
        </div>
      ))}
      <span />
      <Eixo de={de} ate={ate} marcas={marcas} />
    </div>
  )
}

/** As marcas de um eixo horizontal. */
export function Eixo({
  de,
  ate,
  marcas,
  formatar = (valor) => valor.toFixed(1).replace('.', ','),
}: {
  de: number
  ate: number
  marcas: readonly number[]
  formatar?: (valor: number) => string
}) {
  const x = escala(de, ate)
  return (
    <span className="graf-eixo relative mt-1 block h-5 border-t">
      {marcas.map((marca) => (
        <span
          key={marca}
          className="numero absolute top-0.5 text-[0.65rem]"
          style={{ left: `${x(marca)}%`, marginLeft: '-1ch' }}
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
 * destacados vêm por último, para ficarem por cima.
 */
export function Dispersao({
  pontos,
  de,
  ate,
  marcas,
  rotuloX,
  rotuloY,
  rotuloDaDiagonal,
  className,
}: {
  pontos: readonly Ponto[]
  de: number
  ate: number
  marcas: readonly number[]
  rotuloX: string
  rotuloY: string
  rotuloDaDiagonal: string
  className?: string
}) {
  const x = escala(de, ate)
  const ordenados = [...pontos].sort((a, b) => Number(a.destaque ?? false) - Number(b.destaque ?? false))
  const formatar = (valor: number) => valor.toFixed(1).replace('.', ',')

  return (
    <figure className={cn('grid grid-cols-[auto_minmax(0,1fr)] gap-x-2', className)}>
      <span className="rotulo self-center text-[0.65rem] [writing-mode:vertical-rl] rotate-180">
        {rotuloY}
      </span>
      <div className="flex min-h-0 flex-col">
        <div className="graf-quadro relative aspect-square min-h-0 flex-1 border">
          {marcas.map((marca) => (
            <span
              key={`y-${marca}`}
              className="numero absolute left-1 text-[0.6rem]"
              style={{ bottom: `${x(marca)}%`, marginBottom: '-0.45rem' }}
            >
              {marca === de ? '' : formatar(marca)}
            </span>
          ))}
          <svg
            aria-hidden
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
          <span className="rotulo absolute bottom-2 right-2 text-[0.6rem]">{rotuloDaDiagonal}</span>
          {ordenados.map((ponto, indice) => (
            <span
              key={indice}
              className={cn('graf-ponto', ponto.destaque && 'graf-ponto-acento')}
              style={{ left: `${x(ponto.x)}%`, bottom: `${x(ponto.y)}%` }}
            />
          ))}
        </div>
        <Eixo de={de} ate={ate} marcas={marcas.filter((m) => m !== de)} formatar={formatar} />
        <figcaption className="rotulo -mt-1 text-center text-[0.65rem]">{rotuloX}</figcaption>
      </div>
    </figure>
  )
}

/* -------------------------------------------------------------------------
   Mapa de calor da correlação
------------------------------------------------------------------------- */

/**
 * A matriz inteira, com o valor escrito em cada célula. O tom é a força da
 * correlação (o valor absoluto); o sinal está no número, que a fala lê. Uma
 * célula pode ganhar o contorno do acento.
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
  const estilo = { gridTemplateColumns: `auto repeat(${colunas.length}, minmax(0, 1fr))` } as CSSProperties
  return (
    <div className={cn('grid text-xs', className)} style={estilo}>
      <span />
      {colunas.map((coluna) => (
        <span key={`topo-${coluna}`} className="numero pb-1 text-center text-[0.7rem]">
          {coluna}
        </span>
      ))}
      {matriz.map((linha, i) => (
        <div key={colunas[i]} className="contents">
          <span className="numero self-center pr-2 text-right text-[0.7rem]">{colunas[i]}</span>
          {linha.map((valor, j) => {
            const forte = Math.abs(valor)
            const tom = tinta(Math.round(8 + forte * 62))
            const marcada = destaque && destaque[0] === i && destaque[1] === j
            return (
              <span
                key={`${i}-${j}`}
                className={cn(
                  'numero graf-celula flex aspect-square items-center justify-center',
                  marcada && 'graf-celula-acento',
                )}
                style={{
                  background: tom,
                  color: forte > 0.55 ? 'var(--color-fundo)' : 'var(--color-texto)',
                }}
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
   Faixa proporcional (pesos, classes, tipos)
------------------------------------------------------------------------- */

export interface Fatia {
  readonly valor: number
  readonly conteudo: ReactNode
  readonly destaque?: boolean
}

/**
 * Uma faixa dividida na proporção dos valores, com o conteúdo de cada pedaço
 * dentro dele. As bordas se encostam, como os blocos do site.
 */
export function Faixa({ fatias, className }: { fatias: readonly Fatia[]; className?: string }) {
  const total = fatias.reduce((soma, f) => soma + f.valor, 0)
  return (
    <div className={cn('flex', className)}>
      {fatias.map((fatia, indice) => (
        <div
          key={indice}
          className={cn(
            'relative -ml-px min-w-0 border px-3 py-2 first:ml-0',
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
