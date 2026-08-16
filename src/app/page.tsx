import Link from 'next/link'
import { ClipboardCheck, ScrollText, Scale } from 'lucide-react'
import { Chamada } from '@/components/base/botao'
import { Cabecalho } from '@/components/base/cabecalho'
import { AcaoDoFluxo, Conector, EstadoDoFluxo, Fluxo } from '@/components/base/fluxo'
import { Rodape } from '@/components/base/rodape'
import { INSTITUICAO } from '@/content/produto'
import { BASE } from '@/lib/seed'

/**
 * Porta de entrada.
 *
 * Uma folha de especificação: o que a coisa faz, em números e em fluxo, sem
 * parágrafo de venda. A bifurcação continua sendo o centro — o professor
 * escolhe entrar pelo registro ou pelo sistema —, agora ancorada no que o
 * sistema é.
 *
 * É a única rota estática do site: não lê cookie nem data, então serve HTML
 * pronto do CDN e mantém o LCP baixo.
 */

const NUMEROS = [
  { valor: BASE.indicadores.length, legenda: 'indicadores na base sintética' },
  { valor: BASE.areas.length, legenda: 'áreas que lançam dados' },
  { valor: BASE.regras.length, legenda: 'versões da mesma regra' },
] as const

function Porta({
  href,
  ordem,
  rotulo,
  descricao,
  className,
}: {
  href: string
  ordem: string
  rotulo: string
  descricao: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-52 flex-col justify-between gap-8 border border-linha p-8 transition-colors hover:bg-superficie focus-visible:bg-superficie sm:p-10 ${className ?? ''}`}
    >
      <span className="ordinal numero transition-colors group-hover:text-acento">{ordem}</span>
      <span>
        <span className="titulo-bloco block text-2xl sm:text-3xl">{rotulo}</span>
        <span className="mt-2 flex items-center gap-2 text-sm lowercase">
          {descricao}
          <span aria-hidden className="text-acento transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
    </Link>
  )
}

export default function PortaDeEntrada() {
  return (
    <>
      <Cabecalho />

      {/* Sangria total no mobile: em 360px cada pixel de padding lateral tira
          tamanho da headline, e o bloco encostado na borda reforça a leitura
          de tabela. Do sm para cima o conteúdo volta a respirar. */}
      <main id="conteudo" className="mx-auto max-w-[1100px] px-0 pt-16 sm:px-8">
        {/* Hero — o único lugar da página com imagem. */}
        <section className="grao bloco border-x-0 border-t-0 pt-20 sm:pt-28">
          {/* O período fica de fora: já está no rodapé, e a pílula com os três
              precisava quebrar em duas linhas em 360px. */}
          <span className="pilula numero">
            {INSTITUICAO.escola} · {INSTITUICAO.equipe}
          </span>

          <h1 className="hero cursor mt-8">gratificação fora da planilha</h1>

          <p className="prosa mt-7 text-base lowercase">
            dezenas de indicadores, várias áreas, uma portaria. hoje isso vive em planilha
            manual na comissão de avaliação de metas.
          </p>

          <div className="mt-9">
            <Chamada href="/registro">ver o registro →</Chamada>
          </div>
        </section>

        {/* Número no lugar de frase. */}
        <section aria-label="O caso em números" className="grade-blocos grade-3">
          {NUMEROS.map((item) => (
            <div key={item.legenda} className="bloco revelar">
              <p className="stat numero">{item.valor}</p>
              <p className="rotulo mt-3">{item.legenda}</p>
            </div>
          ))}
        </section>

        <nav aria-label="Escolha por onde entrar" className="grade-blocos grade-2">
          <Porta
            href="/registro"
            ordem="01"
            rotulo="registro do projeto"
            descricao="a trajetória da equipe, semana a semana"
          />
          <Porta
            href="/sistema"
            ordem="02"
            rotulo="sistema"
            descricao="o mvp funcionando"
          />
        </nav>

        {/* O fluxo real do ciclo, não um fluxo ilustrativo. */}
        <section className="bloco revelar">
          <h2 className="titulo-bloco">o ciclo</h2>
          <p className="prosa mt-2 text-sm lowercase">
            cada estado só avança um passo por vez, e a passagem fica na trilha.
          </p>

          <div className="mt-10">
            <Fluxo>
              <EstadoDoFluxo>lançamento aberto</EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo icone={<ClipboardCheck size={24} strokeWidth={1.5} />} titulo="área técnica informa">
                valor e evidência de cada indicador, dentro da janela do ciclo.
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo>em validação</EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo icone={<Scale size={24} strokeWidth={1.5} />} titulo="cam apura">
                a regra vigente na competência vira score, faixa e memória de cálculo.
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo>homologado</EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo icone={<ScrollText size={24} strokeWidth={1.5} />} titulo="gestor confere">
                cada número aberto até a origem. discordou, contesta no prazo.
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo>publicado</EstadoDoFluxo>
            </Fluxo>
          </div>
        </section>

        <section className="bloco revelar border-b-0">
          <h2 className="titulo-bloco">memória de cálculo</h2>
          <p className="prosa mt-2 text-sm lowercase">
            planilha manual sai. cada valor fica rastreável até a origem.
          </p>
          <p className="numero mt-6 text-sm text-apagado">
            score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100
          </p>
        </section>

        <Rodape className="px-6 pb-8 sm:px-0" />
      </main>
    </>
  )
}
