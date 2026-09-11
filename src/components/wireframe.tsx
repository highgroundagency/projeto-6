/**
 * OS WIREFRAMES DE BAIXA FIDELIDADE, em SVG.
 *
 * Desenhados na semana do Kick-off, a partir das telas que já existiam. A
 * Semana 3 prometeu "primeiras telas em papel" como produto do Crazy 8's e o
 * artefato nunca foi publicado; em vez de fingir que ele estava lá desde
 * agosto, estes quatro nasceram agora e o documento do ciclo diz a data.
 *
 * POR QUE AINDA VALE DESENHAR UM WIREFRAME quando o sistema já roda: porque o
 * wireframe mostra a DECISÃO de layout sem a distração do acabamento. Ao lado
 * da tela pronta, ele conta em dois segundos o que a tela levou três semanas
 * para virar.
 *
 * SEM UMA PALAVRA DENTRO. Duas razões. A primeira é de vocabulário: wireframe
 * de baixa fidelidade usa barra cinza no lugar de texto justamente para a
 * conversa ser sobre estrutura, e não sobre a escolha da frase. A segunda é de
 * casa: todo texto que aparece num slide mora em `src/content/pitch.ts`, onde
 * o teto de palavras é contado. Rótulo escondido dentro de um SVG furaria o
 * teto sem ninguém ver. A legenda de cada desenho vem de fora.
 *
 * Server Component, e mora em `src/components/` e não em
 * `src/content/ciclos/`: conteúdo de ciclo não pode gerar chunk próprio
 * (regra 3 da casa).
 */

const TRACO = 'var(--color-linha-alta)'
const FRACO = 'var(--color-linha)'
const CHEIO = 'var(--color-superficie)'

/** Uma barra cinza no lugar de uma linha de texto. */
function Texto({ x, y, w, h = 5 }: { x: number; y: number; w: number; h?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={FRACO} />
}

/** Uma caixa vazia: campo, cartão ou área. */
function Caixa({
  x,
  y,
  w,
  h,
  cheia = false,
}: {
  x: number
  y: number
  w: number
  h: number
  cheia?: boolean
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="3"
      fill={cheia ? CHEIO : 'none'}
      stroke={TRACO}
      strokeWidth="1"
    />
  )
}

/** Um botão: pílula preenchida. */
function Botao({ x, y, w = 42, h = 12 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={TRACO} />
      <rect x={x + 8} y={y + h / 2 - 2} width={w - 16} height="4" rx="2" fill="var(--color-fundo)" />
    </g>
  )
}

/** A moldura da tela, com a barra do topo e o lugar do título. */
function Tela({ children, titulo = 70 }: { children: React.ReactNode; titulo?: number }) {
  return (
    <>
      <rect x="1" y="1" width="318" height="198" rx="6" fill="none" stroke={TRACO} strokeWidth="1.5" />
      <line x1="1" y1="22" x2="319" y2="22" stroke={TRACO} strokeWidth="1" />
      <circle cx="13" cy="11.5" r="3" fill={FRACO} />
      <circle cx="23" cy="11.5" r="3" fill={FRACO} />
      <circle cx="33" cy="11.5" r="3" fill={FRACO} />
      <Texto x={44} y={9} w={titulo} h={6} />
      {children}
    </>
  )
}

function Moldura({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 320 200" className={className} fill="none">
      {children}
    </svg>
  )
}

/** 1 · Lançamento: a unidade digita os números do mês. */
export function WireframeLancamento({ className }: { className?: string }) {
  return (
    <Moldura className={className}>
      <Tela>
        {/* A barra lateral com o menu dos perfis. */}
        <line x1="60" y1="22" x2="60" y2="199" stroke={FRACO} strokeWidth="1" />
        {[34, 48, 62, 76, 90].map((y) => (
          <Texto key={y} x={10} y={y} w={38} />
        ))}

        <Texto x={74} y={34} w={110} h={8} />
        <Texto x={74} y={50} w={70} />

        {/* Quatro pares de rótulo e campo: é o miolo da tela. */}
        {[66, 96, 126, 156].map((y) => (
          <g key={y}>
            <Texto x={74} y={y} w={80} />
            <Caixa x={74} y={y + 10} w={110} h={14} />
            <Texto x={196} y={y} w={44} />
            <Caixa x={196} y={y + 10} w={50} h={14} />
          </g>
        ))}

        <Botao x={258} y={172} />
      </Tela>
    </Moldura>
  )
}

/** 2 · A nota com a conta aberta: o cartão e a tabela linha a linha. */
export function WireframeConta({ className }: { className?: string }) {
  return (
    <Moldura className={className}>
      <Tela>
        {/* O cartão da nota: o número grande à esquerda, a faixa à direita. */}
        <Caixa x={14} y={32} w={292} h={40} cheia />
        <rect x="26" y="42" width="52" height="20" rx="2" fill={TRACO} />
        <Texto x={26} y={66} w={40} />
        <Texto x={236} y={44} w={58} />
        <Texto x={250} y={56} w={44} h={8} />

        {/* A tabela: cabeçalho e cinco linhas, sete colunas. */}
        <Caixa x={14} y={82} w={292} h={86} />
        <rect x="14" y="82" width="292" height="14" fill={CHEIO} />
        {[14, 110, 150, 190, 230, 262, 288].map((x) => (
          <Texto key={x} x={x + 6} y={86} w={x === 14 ? 44 : 22} h={4} />
        ))}
        {[96, 110, 124, 138, 152].map((y) => (
          <g key={y}>
            <line x1="14" y1={y} x2="306" y2={y} stroke={FRACO} strokeWidth="0.5" />
            <Texto x={20} y={y + 4} w={80} h={4} />
            {[116, 156, 196, 236, 268, 294].map((x) => (
              <Texto key={x} x={x} y={y + 4} w={14} h={4} />
            ))}
          </g>
        ))}
        <line x1="14" y1="166" x2="306" y2="166" stroke={TRACO} strokeWidth="1" />

        {/* A conta final, destacada por uma barra na lateral. */}
        <rect x="14" y="174" width="3" height="18" fill="var(--color-acento)" />
        <Texto x={24} y={177} w={150} h={4} />
        <Texto x={24} y={185} w={96} h={6} />
      </Tela>
    </Moldura>
  )
}

/** 3 · Painel do distrito: quem já mandou, quem falta. */
export function WireframePainel({ className }: { className?: string }) {
  return (
    <Moldura className={className}>
      <Tela>
        {/* Três números de resumo, lado a lado. */}
        {[14, 118, 222].map((x) => (
          <g key={x}>
            <Caixa x={x} y={32} w={84} h={34} cheia />
            <rect x={x + 10} y={40} width="26" height="14" rx="2" fill={TRACO} />
            <Texto x={x + 10} y={58} w={52} h={4} />
          </g>
        ))}

        {/* A lista das unidades, cada uma com a pílula do estado. */}
        <Texto x={14} y={78} w={64} h={6} />
        {[92, 112, 132, 152, 172].map((y, i) => (
          <g key={y}>
            <line x1="14" y1={y + 16} x2="306" y2={y + 16} stroke={FRACO} strokeWidth="0.5" />
            <Texto x={14} y={y + 4} w={96} />
            <Texto x={130} y={y + 4} w={40} h={4} />
            <rect
              x="212"
              y={y}
              width="44"
              height="12"
              rx="6"
              fill="none"
              stroke={i < 3 ? TRACO : 'var(--color-acento)'}
              strokeWidth="1"
            />
            <Texto x={272} y={y + 4} w={34} h={4} />
          </g>
        ))}
      </Tela>
    </Moldura>
  )
}

/** 4 · Meu resultado: a nota do gestor e os meses anteriores. */
export function WireframeResultado({ className }: { className?: string }) {
  return (
    <Moldura className={className}>
      <Tela>
        <Texto x={14} y={34} w={80} h={6} />

        {/* O número, do tamanho que ele tem na tela de verdade. */}
        <rect x="14" y="50" width="96" height="34" rx="3" fill={TRACO} />
        <Texto x={14} y={90} w={70} h={4} />

        {/* A faixa de pagamento, à direita. */}
        <Caixa x={130} y={50} w={176} h={44} cheia />
        <Texto x={142} y={60} w={60} h={4} />
        <Texto x={142} y={70} w={100} h={8} />
        <Texto x={142} y={83} w={74} h={4} />

        {/* Os seis meses anteriores, em barras. */}
        <Texto x={14} y={108} w={54} h={5} />
        <line x1="14" y1="178" x2="306" y2="178" stroke={TRACO} strokeWidth="1" />
        {[24, 70, 116, 162, 208, 254].map((x, i) => (
          <rect
            key={x}
            x={x}
            y={178 - [30, 42, 38, 52, 46, 58][i]}
            width="34"
            height={[30, 42, 38, 52, 46, 58][i]}
            fill={i === 5 ? 'var(--color-acento)' : FRACO}
          />
        ))}
        {/* A sanfona fechada da conta, no pé: um clique e ela abre. */}
        <Caixa x={14} y={184} w={292} h={10} />
      </Tela>
    </Moldura>
  )
}

/** Os quatro, na ordem em que o processo acontece. */
export const WIREFRAMES = [
  { id: 'lancamento', Desenho: WireframeLancamento },
  { id: 'conta', Desenho: WireframeConta },
  { id: 'painel', Desenho: WireframePainel },
  { id: 'resultado', Desenho: WireframeResultado },
] as const
