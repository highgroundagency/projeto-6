/**
 * A FAIXA DO RECIFE, em xilogravura.
 *
 * Desenhada no vocabulário de J. Borges, de Bezerros: mancha cheia em vez de
 * fio fino, corte branco por dentro da mancha, hachura paralela no lugar de
 * sombra, e a cena inteira achatada, sem perspectiva. Sol com cara, mandacaru
 * com flor, casario enfileirado, passarinho no céu e a cercadura de
 * triângulos que fecha a estampa de cordel.
 *
 * POR QUE ESTA CENA, E NÃO UM MAPA. O cliente é a Secretaria de Saúde do
 * RECIFE, prefeitura: mapa do Brasil seria errado, e o de Pernambuco inteiro,
 * largo demais. Então a faixa mostra o estado como ele é, sem escolher um
 * lado: o sol e o mandacaru do sertão, o casario e a água da cidade.
 *
 * COMO ELA CONVIVE COM A CASA. O resto do site é hairline de 1px; aqui a
 * regra muda de propósito, porque xilogravura não tem fio fino. O que não
 * muda é a paleta: a tinta é `--color-apagado`, o corte é a cor do fundo, e o
 * acento aparece uma vez só, no disco do sol. Sem texto dentro, então ela não
 * entra na conta de palavras do slide; `aria-hidden` porque é ilustração, e
 * quem usa leitor de tela não perde nada.
 */

/**
 * A cena é LARGA de propósito: 1600 por 250. Ocupando a largura toda do
 * slide, essa proporção deixa a estampa com cerca de um terço da altura, e
 * não com metade dela, que era o que engolia o texto da capa. Pela mesma
 * razão o sol foi para a direita: o texto mora na esquerda.
 */
const RAIOS = Array.from({ length: 16 }, (_, i) => i * 22.5)
const SOL = { x: 1310, y: 96 }
const CASAS = [560, 630, 700, 770]
const CACTOS = [
  // O canto esquerdo fica VAZIO: é onde mora o texto da capa e a logo da
  // instituição. Estampa que cobre assinatura deixa de ser estampa.
  { x: 360, altura: 118, espelho: 1 },
  { x: 1010, altura: 96, espelho: -1 },
]
const PASSAROS = [
  { x: 560, y: 44, escala: 1 },
  { x: 620, y: 24, escala: 0.8 },
  { x: 900, y: 48, escala: 0.9 },
]

/** A hachura da xilogravura: linhas paralelas, sempre na mesma direção. */
function hachura(x: number, y: number, largura: number, linhas: number, passo: number) {
  return Array.from({ length: linhas }, (_, i) => `M${x} ${y + i * passo} h${largura}`).join(' ')
}

/** A onda do rio, meia-lua atrás de meia-lua. */
function onda(x: number, y: number, vezes: number) {
  return `M${x} ${y} ` + Array.from({ length: vezes }, () => 'q 11 -9 22 0').join(' ')
}

/** A cercadura de triângulos que fecha a estampa. */
function cercadura(y: number, altura: number) {
  const dente = 24
  let d = `M0 ${y}`
  for (let x = 0; x < 1600; x += dente) {
    d += ` l${dente / 2} ${-altura} l${dente / 2} ${altura}`
  }
  return d
}

export function HorizonteDoRecife({ className }: { className?: string }) {
  // A tinta é o traço mais forte da casa, não o texto: a estampa é fundo de
  // capa, e precisa ficar atrás da palavra sem competir com ela.
  const tinta = 'var(--color-linha-alta)'
  const corte = 'var(--color-fundo)'

  return (
    <svg aria-hidden viewBox="0 0 1600 250" fill="none" className={className}>
      {/* O SOL COM CARA, o motivo mais reconhecível da xilogravura do sertão. */}
      <g>
        {RAIOS.map((angulo, i) => (
          <path
            key={angulo}
            transform={`rotate(${angulo} ${SOL.x} ${SOL.y})`}
            d={
              i % 2 === 0
                ? `M${SOL.x - 6} ${SOL.y - 56} L${SOL.x} ${SOL.y - 90} L${SOL.x + 6} ${SOL.y - 56} Z`
                : `M${SOL.x - 5} ${SOL.y - 52} L${SOL.x} ${SOL.y - 74} L${SOL.x + 5} ${SOL.y - 52} Z`
            }
            fill={tinta}
          />
        ))}
        <circle cx={SOL.x} cy={SOL.y} r="44" fill="var(--color-acento)" />
        {/* Os cortes do rosto: olhos, boca e as bochechas riscadas. */}
        <circle cx={SOL.x - 16} cy={SOL.y - 10} r="6" fill={corte} />
        <circle cx={SOL.x + 16} cy={SOL.y - 10} r="6" fill={corte} />
        <path
          d={`M${SOL.x - 18} ${SOL.y + 16} q18 14 36 0 q-18 6 -36 0 Z`}
          fill={corte}
        />
        <path d={hachura(SOL.x - 34, SOL.y + 26, 16, 2, 5)} stroke={corte} strokeWidth="2" />
        <path d={hachura(SOL.x + 18, SOL.y + 26, 16, 2, 5)} stroke={corte} strokeWidth="2" />
      </g>

      {/* OS PASSARINHOS, dois traços grossos cada, como no corte da madeira. */}
      {PASSAROS.map((passaro) => (
        <g
          key={`${passaro.x}-${passaro.y}`}
          transform={`translate(${passaro.x} ${passaro.y}) scale(${passaro.escala})`}
          stroke={tinta}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M0 0 q14 -14 26 0" />
          <path d="M26 0 q14 -14 26 0" />
        </g>
      ))}

      {/* O MANDACARU: tronco de costelas, braços erguidos e flor na ponta. */}
      {CACTOS.map((cacto) => (
        <g key={cacto.x} transform={`translate(${cacto.x} 196) scale(${cacto.espelho} 1)`}>
          <path d={`M-17 0 v${-cacto.altura} q0 -20 17 -20 q17 0 17 20 V0 Z`} fill={tinta} />
          <path d={`M-17 -58 h-24 q-16 0 -16 -18 v-30 q0 -14 13 -14 q13 0 13 14 v24 h14 Z`} fill={tinta} />
          <path d={`M17 -76 h22 q16 0 16 -18 v-22 q0 -13 12 -13 q12 0 12 13 v30 q0 20 -22 20 H17 Z`} fill={tinta} />
          {/* As costelas, cortadas na madeira. */}
          <path
            d={`M-9 -12 v${-cacto.altura + 10} M0 -12 v${-cacto.altura + 16} M9 -12 v${-cacto.altura + 10}`}
            stroke={corte}
            strokeWidth="2"
          />
          {/* A flor do mandacaru. */}
          <g transform={`translate(0 ${-cacto.altura - 22})`}>
            {[0, 45, 90, 135].map((a) => (
              <path key={a} transform={`rotate(${a})`} d="M-3 -16 L0 -26 L3 -16 Z" fill={tinta} />
            ))}
            <circle r="7" fill={tinta} />
            <circle r="3" fill={corte} />
          </g>
        </g>
      ))}

      {/* O CASARIO: quatro casas enfileiradas, telhado hachurado, porta e
          janela cortadas. É a cidade, do jeito que ela aparece no cordel. */}
      {CASAS.map((x, i) => {
        const altura = i % 2 === 0 ? 56 : 66
        return (
          <g key={x}>
            <path d={`M${x} ${196 - altura} h56 v${altura} h-56 Z`} fill={tinta} />
            <path d={`M${x - 9} ${196 - altura} L${x + 28} ${196 - altura - 30} L${x + 65} ${196 - altura} Z`} fill={tinta} />
            <path
              d={hachura(x - 2, 196 - altura - 22, 60, 3, 6)}
              stroke={corte}
              strokeWidth="1.5"
            />
            <path d={`M${x + 22} 196 v-26 h12 v26 Z`} fill={corte} />
            <path d={`M${x + 8} ${196 - altura + 14} h10 v10 h-10 Z`} fill={corte} />
            <path d={`M${x + 38} ${196 - altura + 14} h10 v10 h-10 Z`} fill={corte} />
          </g>
        )
      })}

      {/* O CHÃO e o rio: a linha grossa da terra e as meias-luas da água. */}
      <path d="M0 194 h1600 v6 H0 Z" fill={tinta} />
      <g stroke={tinta} strokeWidth="3" strokeLinecap="round" fill="none">
        <path d={onda(30, 214, 35)} />
        <path d={onda(0, 230, 36)} />
      </g>

      {/* A cercadura de cordel, no pé da estampa. */}
      <path d={cercadura(250, 12)} fill={tinta} />
    </svg>
  )
}
