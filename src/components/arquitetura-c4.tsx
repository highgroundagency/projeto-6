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

function Tela({ largura, altura, titulo, children }: { largura: number; altura: number; titulo: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        role="img"
        aria-label={titulo}
        style={{ minWidth: 720, width: '100%', height: 'auto', display: 'block' }}
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
  // nome, o que faz (o verbo vai na seta)
  ['CAM', 'gere e homologa'],
  ['Área técnica', 'lança os números'],
  ['Gestor avaliado', 'vê a nota e contesta'],
  ['Auditoria', 'confere a trilha'],
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
        desc="10 áreas, 30 indicadores, 6 meses, trilha imutável; zera a cada deploy"
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
