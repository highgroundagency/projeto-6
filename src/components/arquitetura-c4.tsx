import type { ReactNode } from 'react'

/**
 * Os diagramas C4 de contexto e de contêineres, desenhados em SVG.
 *
 * A referência é o C4 clássico de ferramenta de diagrama: caixas espalhadas no
 * espaço, o tipo entre colchetes ([pessoa], [sistema], [contêiner]), setas com
 * rótulo dizendo o que passa por elas, fronteira tracejada em volta do que é
 * nosso, cilindro para banco. Tudo SVG renderizado no servidor: zero
 * JavaScript, e as cores vêm dos tokens, então os dois temas funcionam.
 *
 * As POSIÇÕES são constantes calculadas à mão. É deliberado: um motor de
 * layout automático viraria dependência e aleatoriedade; coordenadas fixas
 * são chatas de escrever uma vez e determinísticas para sempre. Em tela
 * estreita o desenho NÃO encolhe até virar poeira: o invólucro rola na
 * horizontal, como toda tabela larga do site.
 */

/* ── primitivas ─────────────────────────────────────────────────────────── */

function TextoDaCaixa({
  tipo,
  nome,
  desc,
  clara = false,
  tamanhoNome = 15,
}: {
  tipo: string
  nome: string
  desc?: string
  /** Texto sobre preenchimento de acento (a caixa em foco). */
  clara?: boolean
  tamanhoNome?: number
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '6px 10px',
        boxSizing: 'border-box',
        lineHeight: 1.3,
        color: clara ? 'var(--color-ink)' : 'var(--color-texto)',
      }}
    >
      <span style={{ fontSize: 10, opacity: clara ? 0.85 : undefined, color: clara ? undefined : 'var(--color-apagado)' }}>
        {tipo}
      </span>
      <span style={{ fontSize: tamanhoNome, fontWeight: 650 }}>{nome}</span>
      {desc ? (
        <span
          style={{
            fontSize: 10.5,
            marginTop: 2,
            opacity: clara ? 0.9 : undefined,
            color: clara ? undefined : 'var(--color-apagado)',
          }}
        >
          {desc}
        </span>
      ) : null}
    </div>
  )
}

interface PropsCaixa {
  x: number
  y: number
  w: number
  h: number
  tipo: string
  nome: string
  desc?: string
  variante?: 'pessoa' | 'foco' | 'conteiner' | 'externo' | 'desligado'
  tamanhoNome?: number
}

function Caixa({ x, y, w, h, tipo, nome, desc, variante = 'conteiner', tamanhoNome }: PropsCaixa) {
  const preenchimento =
    variante === 'foco'
      ? 'var(--color-acento)'
      : variante === 'pessoa' || variante === 'externo'
        ? 'var(--color-superficie)'
        : variante === 'desligado'
          ? 'transparent'
          : 'var(--color-cartao)'
  const contorno =
    variante === 'foco'
      ? 'var(--color-acento)'
      : variante === 'desligado' || variante === 'pessoa'
        ? 'var(--color-linha-alta)'
        : 'var(--color-linha)'
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={variante === 'pessoa' ? 18 : 12}
        style={{
          fill: preenchimento,
          stroke: contorno,
          strokeWidth: variante === 'foco' ? 2 : 1.25,
          strokeDasharray: variante === 'desligado' ? '6 5' : undefined,
        }}
      />
      <foreignObject x={x} y={y} width={w} height={h}>
        <TextoDaCaixa tipo={tipo} nome={nome} desc={desc} clara={variante === 'foco'} tamanhoNome={tamanhoNome} />
      </foreignObject>
    </g>
  )
}

/** Cilindro de banco de dados, o clássico. */
function Cilindro({
  x,
  y,
  w,
  h,
  tipo,
  nome,
  desc,
  desligado = false,
}: Omit<PropsCaixa, 'variante'> & { desligado?: boolean }) {
  const ry = 12
  const estilo = {
    fill: desligado ? 'transparent' : 'var(--color-superficie)',
    stroke: 'var(--color-linha-alta)',
    strokeWidth: 1.25,
    strokeDasharray: desligado ? '6 5' : undefined,
  }
  return (
    <g>
      <path
        d={`M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} V ${y + h - ry} A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry} Z`}
        style={estilo}
      />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} style={{ ...estilo, fill: desligado ? 'transparent' : 'var(--color-superficie)' }} />
      <foreignObject x={x} y={y + ry} width={w} height={h - ry}>
        <TextoDaCaixa tipo={tipo} nome={nome} desc={desc} />
      </foreignObject>
    </g>
  )
}

/** Fronteira tracejada com o nome no canto, como no C4 de ferramenta. */
function Fronteira({
  x,
  y,
  w,
  h,
  nome,
  nota,
}: {
  x: number
  y: number
  w: number
  h: number
  nome: string
  nota?: string
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={16}
        style={{ fill: 'none', stroke: 'var(--color-linha-alta)', strokeWidth: 1.25, strokeDasharray: '8 6' }}
      />
      <foreignObject x={x + 12} y={y + h - 30} width={w - 24} height={24}>
        <div
          style={{
            fontSize: 10.5,
            color: 'var(--color-apagado)',
            display: 'flex',
            gap: 8,
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontWeight: 650 }}>{nome}</span>
          {nota ? <span>{nota}</span> : null}
        </div>
      </foreignObject>
    </g>
  )
}

/**
 * Seta com rótulo. `pontos` é a polilinha inteira; o rótulo senta no ponto
 * médio informado (`rx`, `ry`), num selo com fundo para não brigar com a linha.
 */
function Seta({
  pontos,
  rotulo,
  rx,
  ry,
  larguraRotulo = 120,
  tracejada = false,
}: {
  pontos: string
  rotulo?: string
  rx?: number
  ry?: number
  larguraRotulo?: number
  tracejada?: boolean
}) {
  return (
    <g>
      <polyline
        points={pontos}
        style={{
          fill: 'none',
          stroke: 'var(--color-linha-alta)',
          strokeWidth: 1.25,
          strokeDasharray: tracejada ? '5 5' : undefined,
        }}
        markerEnd="url(#ponta-de-seta)"
      />
      {rotulo && rx !== undefined && ry !== undefined ? (
        <foreignObject x={rx - larguraRotulo / 2} y={ry - 10} width={larguraRotulo} height={30}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: 9.5,
                lineHeight: 1.25,
                color: 'var(--color-apagado)',
                background: 'var(--color-fundo)',
                border: '1px solid var(--color-linha)',
                borderRadius: 999,
                padding: '1.5px 7px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {rotulo}
            </span>
          </div>
        </foreignObject>
      ) : null}
    </g>
  )
}

/**
 * `larguraMinima` é o que separa um desenho legível de um desenho bonitinho.
 *
 * Um SVG com `width: 100%` encolhe até caber, e encolher texto de 10px num
 * container de 896px vira poeira de 5px. A largura mínima faz o invólucro
 * ROLAR na horizontal em vez de espremer, que é a troca certa: rolar é um
 * incômodo, ilegível é um desenho perdido. Quanto maior o desenho, maior o
 * piso, e o de componentes tem o maior de todos porque é o que vai para o
 * projetor.
 */
function Tela({
  largura,
  altura,
  titulo,
  larguraMinima = 720,
  children,
}: {
  largura: number
  altura: number
  titulo: string
  larguraMinima?: number
  children: ReactNode
}) {
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={titulo}
        style={{ minWidth: larguraMinima, width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <marker
            id="ponta-de-seta"
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={7}
            markerHeight={7}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--color-linha-alta)' }} />
          </marker>
        </defs>
        {children}
      </svg>
    </div>
  )
}

/* ── nível 1: contexto ──────────────────────────────────────────────────── */

const PESSOAS_C4: readonly [string, string][] = [
  // nome, o que faz (o verbo vai na seta). Os quatro primeiros são os atores
  // que o cliente nomeou na reunião de 22/08 (ADR-034).
  ['Gerente de unidade', 'preenche e confere'],
  ['Gerente distrital', 'acompanha e revisa'],
  ['Coordenação SEAB', 'coordena e homologa'],
  ['Administrador', 'cuida da plataforma'],
  ['Professor', 'lê o registro'],
  ['Dono do site', 'libera conteúdo'],
]

export function DiagramaContexto() {
  const L = 980
  const wP = 150
  const hP = 64
  const yP = 14
  const passo = 164
  const x0 = 8

  // Fronteira e sistema em foco
  const fb = { x: 240, y: 208, w: 500, h: 168 }
  const foco = { x: 280, y: 232, w: 420, h: 104 }

  // Externos embaixo
  const ext = [
    { x: 60, y: 452, nome: 'GitHub', desc: 'guarda o código' },
    { x: 620, y: 452, nome: 'Google Drive', desc: 'a pasta de documentos' },
  ]

  return (
    <Tela largura={L} altura={570} titulo="Diagrama C4 de contexto do Prumo">
      {/* pessoas, uma fileira em cima */}
      {PESSOAS_C4.map(([nome], i) => (
        <Caixa
          key={nome}
          x={x0 + i * passo}
          y={yP}
          w={wP}
          h={hP}
          tipo="[pessoa]"
          nome={nome}
          variante="pessoa"
          tamanhoNome={12.5}
        />
      ))}

      {/* cada pessoa desce para o sistema, com o verbo na seta */}
      {PESSOAS_C4.map(([nome, verbo], i) => {
        const cx = x0 + i * passo + wP / 2
        const alvoX = foco.x + 40 + i * ((foco.w - 80) / 5)
        const meioY = i % 2 === 0 ? 122 : 166
        return (
          <Seta
            key={nome}
            pontos={`${cx},${yP + hP} ${cx},${meioY} ${alvoX},${meioY} ${alvoX},${foco.y - 2}`}
            rotulo={verbo}
            rx={cx}
            ry={meioY - (i % 2 === 0 ? 11 : -11)}
            larguraRotulo={150}
          />
        )
      })}

      <Fronteira {...fb} nome="na Vercel" nota="funções serverless: acordam por visita, dormem depois" />
      <Caixa
        {...foco}
        tipo="[sistema]"
        nome="Prumo"
        desc="o site do projeto, o sistema da gratificação e o painel do dono"
        variante="foco"
        tamanhoNome={18}
      />

      {/* externos */}
      <Caixa x={ext[0].x} y={ext[0].y} w={300} h={84} tipo="[sistema externo]" nome={ext[0].nome} desc={ext[0].desc} variante="externo" />
      <Caixa x={ext[1].x} y={ext[1].y} w={300} h={84} tipo="[sistema externo]" nome={ext[1].nome} desc={ext[1].desc} variante="externo" />

      <Seta
        pontos={`${ext[0].x + 150},${ext[0].y} ${ext[0].x + 150},414 ${foco.x + 60},414 ${foco.x + 60},${fb.y + fb.h + 2}`}
        rotulo="cada push vira deploy"
        rx={ext[0].x + 150}
        ry={430}
        larguraRotulo={150}
      />
      <Seta
        pontos={`${foco.x + 360},${fb.y + fb.h} ${foco.x + 360},414 ${ext[1].x + 150},414 ${ext[1].x + 150},${ext[1].y - 2}`}
        rotulo="só um link para os documentos"
        rx={ext[1].x + 150}
        ry={430}
        larguraRotulo={190}
      />
    </Tela>
  )
}

/* ── nível 2: contêineres ───────────────────────────────────────────────── */

export function DiagramaConteineres() {
  const L = 980

  const usuario = { x: 370, y: 12, w: 240, h: 70 }
  const fbVercel = { x: 24, y: 130, w: 932, h: 300 }
  const app = { x: 64, y: 168, w: 400, h: 118 }
  const rotas = { x: 540, y: 160, w: 380, h: 86 }
  const middleware = { x: 540, y: 266, w: 380, h: 76 }
  const fbDados = { x: 24, y: 490, w: 450, h: 190 }
  const base = { x: 70, y: 524, w: 356, h: 116 }
  const schema = { x: 560, y: 524, w: 356, h: 116 }
  const fbOffline = { x: 24, y: 740, w: 932, h: 150 }
  const pipeline = { x: 64, y: 774, w: 380, h: 82 }
  const artefato = { x: 540, y: 774, w: 380, h: 82 }

  return (
    <Tela largura={L} altura={910} titulo="Diagrama C4 de contêineres do Prumo">
      <Caixa {...usuario} tipo="[pessoa]" nome="Usuário" desc="qualquer um dos seis papéis, num navegador" variante="pessoa" />

      <Fronteira {...fbVercel} nome="Prumo · na Vercel" nota="tudo renderizado no servidor; quase nenhum JavaScript no navegador" />
      <Caixa
        {...app}
        tipo="[contêiner · React Server Components]"
        nome="Aplicação Next.js"
        desc="o site, as 8 telas, o painel, o motor de cálculo (função pura) e o motor de liberações por calendário"
      />
      <Caixa
        {...rotas}
        tipo="[contêiner · Node runtime]"
        nome="Route handlers"
        desc="login, avanço de etapa, lançamento, contestação, CSV, tema, perfil"
      />
      <Caixa
        {...middleware}
        tipo="[contêiner · Edge runtime]"
        nome="Middleware"
        desc="a primeira porta da rota /admin"
      />

      {/* usuário → app e → rotas */}
      <Seta
        pontos={`${usuario.x + 60},${usuario.y + usuario.h} ${usuario.x + 60},124 ${app.x + 200},124 ${app.x + 200},${app.y - 2}`}
        rotulo="abre as páginas (HTTPS)"
        rx={app.x + 200}
        ry={110}
        larguraRotulo={160}
      />
      <Seta
        pontos={`${usuario.x + 180},${usuario.y + usuario.h} ${usuario.x + 180},124 ${rotas.x + 190},124 ${rotas.x + 190},${rotas.y - 2}`}
        rotulo="envia formulários (POST, HTML puro)"
        rx={rotas.x + 190}
        ry={110}
        larguraRotulo={220}
      />
      {/* middleware guarda a porta */}
      <Seta
        pontos={`${middleware.x},${middleware.y + 38} ${app.x + app.w + 38},${middleware.y + 38} ${app.x + app.w + 38},${app.y + 100} ${app.x + app.w + 2},${app.y + 100}`}
        rotulo="guarda o /admin"
        rx={app.x + app.w + 40}
        ry={middleware.y + 24}
        larguraRotulo={110}
      />

      <Fronteira {...fbDados} nome="dados" nota="nenhum dado real, por regra da casa" />
      <Cilindro
        {...base}
        tipo="[em memória · semente fixa 20262]"
        nome="Base sintética"
        desc="12 unidades em 3 distritos, 7 tipos, 8 indicadores, 12 subindicadores, 7 meses, trilha imutável; zera a cada deploy"
      />
      <Cilindro
        {...schema}
        tipo="[SQL versionado · RLS e 4 gatilhos]"
        nome="Schema PostgreSQL guardado"
        desc="testado no CI contra um banco real; NÃO ligado ao aplicativo"
        desligado
      />

      {/* app e rotas falam com a base */}
      <Seta
        pontos={`${app.x + 130},${app.y + app.h} ${app.x + 130},${base.y - 14} ${base.x + 178},${base.y - 14} ${base.x + 178},${base.y - 2}`}
        rotulo="lê"
        rx={app.x + 130}
        ry={462}
        larguraRotulo={50}
      />
      <Seta
        pontos={`${rotas.x + 100},${middleware.y + middleware.h} ${rotas.x + 100},472 ${base.x + 300},472 ${base.x + 300},${base.y - 2}`}
        rotulo="escrevem na memória"
        rx={rotas.x + 100}
        ry={458}
        larguraRotulo={140}
      />
      {/* base pode semear o schema, mas nada roda por ele */}
      <Seta
        pontos={`${base.x + base.w},${base.y + 58} ${schema.x - 2},${schema.y + 58}`}
        rotulo="semeável por npm run semear"
        rx={(base.x + base.w + schema.x) / 2}
        ry={base.y + 44}
        larguraRotulo={185}
        tracejada
      />

      <Fronteira {...fbOffline} nome="offline" nota="roda no computador de quem treina, nunca em produção" />
      <Caixa
        {...pipeline}
        tipo="[Python · scikit-learn]"
        nome="Pipeline de machine learning"
        desc="classificação, regressão e clustering, contra um palpite bobo"
        variante="externo"
      />
      <Caixa
        {...artefato}
        tipo="[JSON versionado no repositório]"
        nome="resultados.json"
        desc="o laudo; nenhuma predição entra no cálculo da nota"
        variante="externo"
      />
      <Seta
        pontos={`${pipeline.x + pipeline.w},${pipeline.y + 40} ${artefato.x - 2},${artefato.y + 40}`}
        rotulo="exporta"
        rx={(pipeline.x + pipeline.w + artefato.x) / 2}
        ry={pipeline.y + 26}
        larguraRotulo={70}
      />
      {/* o laudo sobe para a tela de analytics */}
      <Seta
        pontos={`${artefato.x + artefato.w},${artefato.y + 40} 952,${artefato.y + 40} 952,${app.y + 60} ${app.x + app.w + 2},${app.y + 60}`}
        rotulo="a tela de analytics lê"
        rx={912}
        ry={470}
        larguraRotulo={132}
      />
    </Tela>
  )
}

/* ── nível 3: componentes ───────────────────────────────────────────────── */

/**
 * As camadas como COLUNAS, e não como faixas empilhadas.
 *
 * A versão em mermaid deste mesmo desenho sai com 3283px de altura, porque o
 * motor de layout empilha uma fronteira embaixo da outra. Altura é o pior
 * formato possível para projetar: o público lê as três primeiras caixas e perde
 * o resto. Em colunas, a dependência anda da esquerda para a direita, cabe num
 * projetor de proporção larga, e a camada de domínio fica onde a leitura
 * termina, que é exatamente o que ela é.
 *
 * O QUE O DESENHO PRECISA PROVAR: que a dependência aponta para dentro. Duas
 * setas pulam camada de propósito (a tela chama o motor e o repositório direto,
 * sem passar pela aplicação), e isso é verdade no código, então está no desenho.
 * O que não acontece nunca é uma seta SAIR do domínio: a coluna do motor recebe
 * setas e não emite nenhuma para fora dela. É a afirmação que
 * `src/lib/pureza.test.ts` transforma em teste.
 */

const COL_W = 214
const COL_X = [276, 616, 956, 1296, 1636] as const
const CX = COL_X.map((x) => x + COL_W / 2)
const LIN_Y = [64, 200, 336, 472] as const
const CY = LIN_Y.map((y) => y + 42)

export function DiagramaComponentes() {
  return (
    <Tela
      largura={1890}
      altura={806}
      larguraMinima={1400}
      titulo="Diagrama de componentes do App Router"
    >
      {/* fronteiras: uma por camada, na ordem da dependência */}
      <Fronteira x={COL_X[0] - 14} y={48} w={COL_W + 28} h={546} nome="apresentação" nota="server components" />
      <Fronteira x={COL_X[1] - 14} y={48} w={COL_W + 28} h={546} nome="portões" nota="release, depois perfil" />
      <Fronteira x={COL_X[2] - 14} y={48} w={COL_W + 28} h={546} nome="aplicação" nota="rotas e estado" />
      <Fronteira x={COL_X[3] - 14} y={48} w={COL_W + 28} h={546} nome="domínio" nota="puro: sem I/O, sem relógio" />
      <Fronteira x={COL_X[4] - 14} y={48} w={COL_W + 28} h={546} nome="acesso a dados" nota="driver único" />

      <Caixa x={24} y={200} w={160} h={84} tipo="pessoa" nome="Usuário" desc="os quatro perfis, mais o professor" variante="pessoa" />

      {/* apresentação */}
      <Caixa x={COL_X[0]} y={LIN_Y[0]} w={COL_W} h={84} tipo="componente" nome="app/page.tsx" desc="as oito seções e o diário semanal" />
      <Caixa x={COL_X[0]} y={LIN_Y[1]} w={COL_W} h={84} tipo="componente" nome="sistema/telas" desc="as oito telas, sem portão por dentro" />
      <Caixa x={COL_X[0]} y={LIN_Y[2]} w={COL_W} h={84} tipo="componente" nome="memoria.tsx" desc="a conta aberta; só exibe, não recalcula" />

      {/* portões */}
      <Caixa x={COL_X[1]} y={LIN_Y[0]} w={COL_W} h={84} tipo="borda" nome="middleware.ts" desc="barra /admin antes de acordar a função" />
      <Caixa x={COL_X[1]} y={LIN_Y[1]} w={COL_W} h={84} tipo="componente" nome="exigirFeature + exigirPerfil" desc="os dois portões, nessa ordem" tamanhoNome={11} />
      <Caixa x={COL_X[1]} y={LIN_Y[2]} w={COL_W} h={84} tipo="componente" nome="lib/features.ts" desc="tela → ciclo que a libera, e perfis" />
      <Caixa x={COL_X[1]} y={LIN_Y[3]} w={COL_W} h={84} tipo="componente" nome="lib/admin/guard.ts" desc="sessão, senha e tentativas" />

      {/* aplicação */}
      <Caixa x={COL_X[2]} y={LIN_Y[0]} w={COL_W} h={84} tipo="rotas" nome="app/api/**/route.ts" desc="oito rotas de escrita" />
      <Caixa x={COL_X[2]} y={LIN_Y[1]} w={COL_W} h={84} tipo="componente" nome="lib/visao.ts" desc="resolve admin, data simulada e ciclos" />
      <Caixa x={COL_X[2]} y={LIN_Y[2]} w={COL_W} h={84} tipo="componente" nome="lib/config/store.ts" desc="estado de release, driver trocável" />

      {/* domínio */}
      <Caixa x={COL_X[3]} y={LIN_Y[0]} w={COL_W} h={84} tipo="puro" nome="calculo/motor.ts" desc="a nota, a faixa e a memória" variante="foco" />
      <Caixa x={COL_X[3]} y={LIN_Y[1]} w={COL_W} h={84} tipo="puro" nome="lib/releases.ts" desc="o que está visível hoje" />
      <Caixa x={COL_X[3]} y={LIN_Y[2]} w={COL_W} h={84} tipo="puro" nome="lib/cronograma.ts" desc="fonte única das datas" />
      <Caixa x={COL_X[3]} y={LIN_Y[3]} w={COL_W} h={84} tipo="puro" nome="lib/datas.ts" desc="aritmética civil em Recife" />

      {/* acesso a dados */}
      <Caixa x={COL_X[4]} y={LIN_Y[0]} w={COL_W} h={84} tipo="componente" nome="lib/dados/index.ts" desc="repositório; a tela nunca fala com o seed" />
      <Caixa x={COL_X[4]} y={LIN_Y[1]} w={COL_W} h={84} tipo="componente" nome="dados/mapeadores.ts" desc="traduz a forma da origem" />

      <Cilindro x={COL_X[2]} y={704} w={COL_W} h={72} tipo="arquivo" nome="config-site.json" desc="estado de release em dev" />
      <Cilindro x={COL_X[4]} y={704} w={COL_W} h={72} tipo="base de dados" nome="seed em memória" desc="base sintética, semente fixa" />

      {/* quem entra */}
      <Seta pontos="184,242 276,242" rotulo="usa o sistema" rx={230} ry={242} larguraRotulo={104} />
      <Seta pontos={`184,268 228,268 228,${CY[0]} ${COL_X[0]},${CY[0]}`} rotulo="lê o registro" rx={252} ry={CY[0]} larguraRotulo={100} />
      <Seta pontos={`184,216 206,216 206,24 ${CX[1]},24 ${CX[1]},${LIN_Y[0]}`} rotulo="pede /admin" rx={470} ry={24} larguraRotulo={104} />

      {/* a cadeia pela ordem das camadas */}
      <Seta pontos={`490,${CY[1]} ${COL_X[1]},${CY[1]}`} rotulo="passa pelos portões" rx={553} ry={CY[1]} larguraRotulo={136} />
      <Seta pontos={`${CX[1]},284 ${CX[1]},336`} rotulo="consulta ciclo e perfis" rx={CX[1]} ry={310} larguraRotulo={146} />
      <Seta pontos={`830,${CY[1]} ${COL_X[2]},${CY[1]}`} rotulo="pergunta release e perfil" rx={893} ry={CY[1]} larguraRotulo={156} />
      <Seta pontos={`1170,${CY[1]} ${COL_X[3]},${CY[1]}`} rotulo="calcula os ciclos visíveis" rx={1233} ry={CY[1]} larguraRotulo={156} />
      <Seta pontos={`${CX[3]},284 ${CX[3]},336`} rotulo="lê as dezoito datas" rx={CX[3]} ry={310} larguraRotulo={132} />
      <Seta pontos={`1510,250 1560,250 1560,506 1510,506`} rotulo="compara datas civis" rx={1560} ry={378} larguraRotulo={136} />

      {/* as duas que pulam camada, e são verdade */}
      <Seta pontos={`490,252 524,252 524,626 1270,626 1270,${CY[0]} ${COL_X[3]},${CY[0]}`} rotulo="calcula e recebe a memória" rx={880} ry={626} larguraRotulo={176} />
      <Seta pontos={`490,266 552,266 552,662 1610,662 1610,${CY[0]} ${COL_X[4]},${CY[0]}`} rotulo="pede unidades e lançamentos" rx={1080} ry={662} larguraRotulo={186} />
      <Seta pontos={`${CX[2]},${LIN_Y[0]} ${CX[2]},40 ${CX[4]},40 ${CX[4]},${LIN_Y[0]}`} rotulo="grava lançamento e contestação" rx={1400} ry={40} larguraRotulo={200} />

      {/* até a origem */}
      <Seta pontos={`${CX[4]},148 ${CX[4]},200`} rotulo="converte a forma" rx={CX[4]} ry={174} larguraRotulo={120} />
      <Seta pontos={`1800,284 1800,704`} rotulo="lê a base sintética" rx={1800} ry={470} larguraRotulo={132} />
      <Seta pontos={`1120,420 1120,704`} rotulo="lê e grava em dev" rx={1120} ry={560} larguraRotulo={128} />
    </Tela>
  )
}

/* ── nível 4: código ────────────────────────────────────────────────────── */

/**
 * Caixa de classe: cabeçalho com o nome e lista de campos alinhada à esquerda.
 *
 * Diferente da `Caixa` dos outros níveis, que centraliza tudo: aqui a leitura é
 * de lista, e lista centralizada é ilegível. Os campos são os REAIS de
 * `src/lib/calculo/tipos.ts`. Desenho que inventa atributo ensina errado, e
 * quem for conferir abre o arquivo e compara.
 */
function CaixaDeClasse({
  x,
  y,
  w,
  h,
  nome,
  estereotipo,
  campos,
}: {
  x: number
  y: number
  w: number
  h: number
  nome: string
  estereotipo?: string
  campos: readonly string[]
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        style={{ fill: 'var(--color-cartao)', stroke: 'var(--color-linha)', strokeWidth: 1.25 }}
      />
      <line
        x1={x}
        y1={y + 40}
        x2={x + w}
        y2={y + 40}
        style={{ stroke: 'var(--color-linha)', strokeWidth: 1 }}
      />
      <foreignObject x={x} y={y} width={w} height={h}>
        <div style={{ height: '100%', boxSizing: 'border-box', padding: '7px 12px 10px' }}>
          <div style={{ height: 33, textAlign: 'center' }}>
            {estereotipo ? (
              <div style={{ fontSize: 9.5, color: 'var(--color-apagado)' }}>«{estereotipo}»</div>
            ) : null}
            <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--color-texto)' }}>{nome}</div>
          </div>
          <ul style={{ margin: '13px 0 0', padding: 0, listStyle: 'none' }}>
            {campos.map((campo) => (
              <li
                key={campo}
                style={{ fontSize: 10.5, lineHeight: 1.5, color: 'var(--color-apagado)' }}
              >
                {campo}
              </li>
            ))}
          </ul>
        </div>
      </foreignObject>
    </g>
  )
}

export function DiagramaCodigo() {
  return (
    <Tela largura={1930} altura={570} larguraMinima={1300} titulo="Diagrama de classes do domínio do cálculo">
      <CaixaDeClasse
        x={40}
        y={40}
        w={260}
        h={212}
        nome="RegraDePontuacao"
        campos={['id, versao', 'vigenteDe, vigenteAte', 'metodo', 'pontuacaoMaxima', 'semLancamento', 'tetoAtingimento', 'arredondamento']}
      />
      <CaixaDeClasse
        x={40}
        y={300}
        w={260}
        h={190}
        nome="Lancamento"
        campos={['subindicadorId', 'valor', 'numerador', 'denominador', 'registradoEm', 'autor, evidencia']}
      />

      <CaixaDeClasse x={440} y={40} w={240} h={124} nome="Aplicabilidade" campos={['tipoUnidadeId', 'indicadorId', 'meta', 'peso']} />
      <CaixaDeClasse x={440} y={196} w={240} h={100} nome="GraduacaoSubindicador" campos={['subindicadorId', 'degraus: Degrau[]']} />
      <CaixaDeClasse x={440} y={328} w={240} h={124} nome="Degrau" campos={['de', 'ate', 'nota (0 a 1)']} />

      <CaixaDeClasse
        x={820}
        y={128}
        w={280}
        h={262}
        nome="Motor"
        estereotipo="módulo puro"
        campos={['calcularAvaliacao()', 'apurarSubindicador()', 'notaDoDegrau()', 'calcularAtingimento()', 'faixaDoScore()', 'regraVigente()', 'arredondar()']}
      />

      <CaixaDeClasse x={1240} y={40} w={250} h={140} nome="Avaliacao" campos={['unidadeId, cicloId', 'score (0 a 100)', 'faixa', 'avisos[]']} />
      <CaixaDeClasse
        x={1240}
        y={228}
        w={250}
        h={190}
        nome="MemoriaDeCalculo"
        campos={['regraId, versaoRegra', 'metodo', 'somaPesos', 'somaContribuicoes', 'score', 'formula']}
      />

      <CaixaDeClasse
        x={1630}
        y={40}
        w={250}
        h={212}
        nome="PassoMemoria"
        campos={['indicador, meta', 'valor', 'mediaDasNotas', 'nota', 'pontos, peso', 'contribuicao']}
      />
      <CaixaDeClasse
        x={1630}
        y={300}
        w={250}
        h={172}
        nome="PassoSubindicador"
        campos={['numerador, denominador', 'valor', 'nota', 'aviso']}
      />

      {/* a regra e as partes que ela guarda */}
      <Seta pontos="300,102 440,102" rotulo="meta e peso por tipo" rx={370} ry={102} larguraRotulo={136} />
      <Seta pontos="300,246 440,246" rotulo="a régua de cada um" rx={370} ry={246} larguraRotulo={128} />
      <Seta pontos="680,246 716,246 716,390 680,390" rotulo="ordena os degraus" rx={716} ry={318} larguraRotulo={126} />

      {/* o que entra no motor */}
      <Seta pontos="680,102 750,102 750,180 820,180" rotulo="aplica por tipo" rx={750} ry={141} larguraRotulo={106} />
      <Seta pontos="680,390 750,390 750,330 820,330" rotulo="gradua o valor" rx={750} ry={360} larguraRotulo={104} />
      <Seta pontos="300,420 370,420 370,528 960,528 960,390" rotulo="apura o último de cada subindicador" rx={620} ry={528} larguraRotulo={218} />

      {/* o que sai, e a conta que vem junto */}
      <Seta pontos="1100,180 1170,180 1170,110 1240,110" rotulo="número e memória" rx={1170} ry={145} larguraRotulo={124} />
      <Seta pontos="1365,180 1365,228" rotulo="carrega a conta" rx={1365} ry={204} larguraRotulo={110} />
      <Seta pontos="1490,300 1560,300 1560,200 1630,200" rotulo="uma linha por indicador" rx={1560} ry={250} larguraRotulo={148} />
      <Seta pontos="1755,252 1755,300" rotulo="e um por subindicador" rx={1755} ry={276} larguraRotulo={146} />
    </Tela>
  )
}
