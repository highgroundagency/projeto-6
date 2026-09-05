import type { ReactNode } from 'react'
import { MarcaCesar } from '@/components/base/marca'
import { Etiqueta } from '@/components/base/selo'
import { CartaoScore, MemoriaDeCalculo } from '@/components/sistema/memoria'
import { integrantePorId } from '@/content/equipe'
import resultados from '@/content/ml/resultados.json'
import {
  COMPROMISSOS_ATE_O_SR1,
  CONTAGENS_PITCH,
  DEMO_PITCH,
  SLIDES,
  formatarTempo,
  inicioDoSlide,
  type Slide,
} from '@/content/pitch'
import { CLIENTE, ENDERECO_SITE, INSTITUICAO, PRODUTO, URL_SITE } from '@/content/produto'
import { ROTULO_ESTADO, ORDEM_ESTADOS } from '@/lib/calculo/tipos'
import { cicloPorId } from '@/lib/cronograma'
import { avaliacoesDaUnidade, carregarDados } from '@/lib/dados/consultas'
import { formatarBR } from '@/lib/datas'
import { ORDEM_PERFIS, PERFIS } from '@/lib/features'
import { cn } from '@/lib/utils'

/**
 * Os nove slides, renderizados no servidor.
 *
 * Cada slide é uma `<section>` com `data-slide`, e a página inteira é uma
 * pilha legível sem JavaScript. O componente cliente (`deck.tsx`) só decide
 * qual seção aparece. Nenhum texto de slide passa por props para ele.
 *
 * O visual segue a folha de especificação (regra da casa): hairlines que se
 * encostam, tudo minúsculo, caixa alta só em rótulo, e no máximo três usos do
 * acento por tela. O slide da demonstração veste a pele do sistema por dentro,
 * porque o que ele mostra É o sistema.
 */
export async function Slides() {
  const dados = await carregarDados()
  const avaliacao = (await avaliacoesDaUnidade(DEMO_PITCH.unidadeId)).find(
    (a) => a.cicloId === DEMO_PITCH.cicloId,
  )
  if (!avaliacao) throw new Error(`Demonstração sem avaliação: ${DEMO_PITCH.unidadeId}`)
  const unidadeDemo = dados.unidadePorId(DEMO_PITCH.unidadeId)
  const cicloDemo = dados.cicloPorId(DEMO_PITCH.cicloId)
  const tipoDemo = unidadeDemo ? dados.tipoUnidadePorId(unidadeDemo.tipoId) : undefined
  const ko = cicloPorId('ko')

  const [capa, problema, quemSofre, ideia, comoFunciona, dadosSlide, riscos, ateOSr1, fechamento] =
    SLIDES

  // O JSON dos modelos é heterogêneo; só o classificador tem acurácia e referência.
  const classificador = resultados.modelos.find((m) => m.modelo === 'classificacao')
  const acuracia = classificador?.metricas?.acuracia
  const referencia = classificador?.referencia?.acuracia
  const comparacao =
    typeof acuracia === 'number' && typeof referencia === 'number' ? { acuracia, referencia } : null

  return (
    <>
      {/* 1 · Capa */}
      <Quadro slide={capa} className="grao">
        <span className="pilula self-start">
          kick-off · {formatarBR(ko.data)} · {INSTITUICAO.equipe} · {INSTITUICAO.escola}
        </span>
        <h1 className="hero mt-6">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento">
            _
          </span>
        </h1>
        <p className="slide-apoio text-texto">{capa.apoio}</p>
        <p className="mt-6 text-sm">{CLIENTE.orgao}</p>
        <MarcaCesar className="mt-8 h-8 self-start" />
      </Quadro>

      {/* 2 · O problema */}
      <Quadro slide={problema}>
        <Titulo slide={problema} />
        <ol className="mt-6 grid md:grid-cols-5">
          {ETAPAS_DA_PORTARIA.map((etapa, indice) => (
            <li
              key={etapa.quem}
              className={cn('bloco-raso md:-ml-px', etapa.quebra && 'border-acento md:z-10')}
            >
              <span className="ordinal">0{indice + 1}</span>
              <p className="mt-2 text-sm text-texto">{etapa.quem}</p>
              <p className="mt-0.5 text-xs">{etapa.oQue}</p>
              {etapa.quebra ? (
                <Etiqueta tom="acento" className="mt-3">
                  aqui quebra
                </Etiqueta>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm">
          <span className="rotulo text-texto">na portaria</span> cinco indicadores, com
          subindicadores; metas mensais; pesos que mudam por tipo de unidade e por função.{' '}
          <span className="rotulo text-texto">na planilha</span> a conta inteira, sem memória.
        </p>
      </Quadro>

      {/* 3 · Quem sofre */}
      <Quadro slide={quemSofre}>
        <Titulo slide={quemSofre} />
        <ul className="mt-6 grid md:grid-cols-3">
          {PESSOAS.map((pessoa) => (
            <li key={pessoa.papel} className="bloco-raso md:-ml-px">
              <p className="rotulo">{pessoa.papel}</p>
              <p className="titulo-bloco mt-2">{pessoa.quem}</p>
              <p className="mt-2 text-sm">{pessoa.situacao}</p>
              <p className="mt-3 text-sm">
                <span className="text-texto">precisa:</span> {pessoa.precisa}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-texto">teme:</span> {pessoa.teme}
              </p>
            </li>
          ))}
        </ul>
      </Quadro>

      {/* 4 · A ideia, ao vivo */}
      <Quadro slide={ideia} className="slide-demo">
        <Titulo slide={ideia} />
        <div
          data-pele="sistema"
          data-captura="memoria"
          className="demo mt-5 rounded-2xl bg-fundo p-4 text-texto sm:p-5"
        >
          <p className="rotulo">
            {unidadeDemo?.nome ?? DEMO_PITCH.unidadeId}
            {tipoDemo ? ` · ${tipoDemo.nome}` : ''}
            {cicloDemo ? ` · competência ${cicloDemo.competencia} · ${ROTULO_ESTADO[cicloDemo.estado].toLowerCase()}` : ''}
            {' · base sintética'}
          </p>
          <div className="mt-3">
            <CartaoScore avaliacao={avaliacao} />
          </div>
          <div className="mt-3">
            <MemoriaDeCalculo avaliacao={avaliacao} aberta />
          </div>
        </div>
        <details className="captura sem-impressao mt-3 border border-linha">
          <summary className="cursor-pointer px-3 py-2 text-xs">
            <span className="rotulo">reserva</span> captura estática da mesma tela, se a
            demonstração falhar
          </summary>
          {/* eslint-disable-next-line @next/next/no-img-element -- captura versionada, sem otimização */}
          <img
            src="/pitch/memoria.png"
            alt={`Captura da memória de cálculo da ${unidadeDemo?.nome ?? 'unidade da demonstração'}`}
            width={1134}
            height={1008}
            className="border-t border-linha"
          />
        </details>
      </Quadro>

      {/* 5 · Como funciona */}
      <Quadro slide={comoFunciona}>
        <Titulo slide={comoFunciona} />
        <ol className="mt-6 grid md:grid-cols-4">
          {CAMINHO_DO_NUMERO.map((passo, indice) => (
            <li key={passo.nome} className="bloco-raso md:-ml-px">
              <span className="ordinal">0{indice + 1}</span>
              <p className="titulo-bloco mt-2">{passo.nome}</p>
              <p className="mt-1 text-sm">{passo.como}</p>
            </li>
          ))}
        </ol>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <p className="rotulo">quem</p>
            <ul className="mt-2 space-y-1 text-sm">
              {ORDEM_PERFIS.map((id) => (
                <li key={id}>
                  <span className="text-texto">{PERFIS[id].rotulo.toLowerCase()}:</span>{' '}
                  {PERFIS[id].descricao.toLowerCase().replace(/\.$/, '')}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="rotulo">o mês, uma etapa por vez</p>
            <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {ORDEM_ESTADOS.map((estado, indice) => (
                <li key={estado} className="flex items-center gap-2">
                  {indice > 0 ? (
                    <span aria-hidden className="text-linha-alta">
                      →
                    </span>
                  ) : null}
                  <span className={cn(indice === ORDEM_ESTADOS.length - 1 && 'text-texto')}>
                    {ROTULO_ESTADO[estado].toLowerCase()}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm">
              cada ciclo aponta para a versão da regra que usou. mudou a portaria, nasce a{' '}
              <span className="text-acento">versão 3</span>; o que já foi homologado não muda.
            </p>
          </div>
        </div>
      </Quadro>

      {/* 6 · Dados */}
      <Quadro slide={dadosSlide}>
        <Titulo slide={dadosSlide} />
        <dl className="mt-6 grid md:grid-cols-3">
          <Contagem numero={dados.unidades.length} rotulo="unidades sintéticas">
            {dados.distritos.length} distritos · {dados.tiposUnidade.length} tipos de unidade ·{' '}
            {dados.gerentes.length} gerentes avaliados
          </Contagem>
          <Contagem numero={dados.subindicadores.length} rotulo="subindicadores">
            em {dados.indicadores.length} indicadores, com meta e peso por tipo de unidade, em{' '}
            {dados.regras.length} versões da regra
          </Contagem>
          <Contagem numero={dados.ciclos.length} rotulo="competências">
            geradas com semente {resultados.semente}: quem duvidar de um número roda e confere
          </Contagem>
        </dl>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <p className="text-sm">
            <span className="rotulo text-texto">aprendizado de máquina</span>{' '}
            {resultados.modelos.length} modelos treinados fora do app, cada um publicado com a
            linha de base ao lado.
            {comparacao ? (
              <>
                {' '}
                o classificador de meta acerta{' '}
                <span className="numero text-texto">{decimal(comparacao.acuracia)}</span>; chutar
                a classe majoritária acerta{' '}
                <span className="numero text-texto">{decimal(comparacao.referencia)}</span>.
                perde, e isso está na tela.
              </>
            ) : null}{' '}
            nada daqui entra no cálculo.
          </p>
          <p className="border-l-2 border-acento pl-3 text-sm">
            <span className="rotulo text-texto">a régua oficial</span> a portaria pública entra
            no repositório e vira a próxima versão da regra. a planilha anonimizada que o
            cliente enviou fica fora dele, e serve para conferir a régua.
          </p>
        </div>
      </Quadro>

      {/* 7 · Riscos e transparência */}
      <Quadro slide={riscos}>
        <Titulo slide={riscos} />
        <dl className="mt-6 grid md:grid-cols-4">
          <Contagem numero={CONTAGENS_PITCH.ameacasStride} rotulo="ameaças STRIDE">
            mapeadas, cada uma com mitigação e estado
          </Contagem>
          <Contagem numero={CONTAGENS_PITCH.itensOwasp} rotulo="itens OWASP">
            conferidos; {CONTAGENS_PITCH.owaspParciais} parciais, declarados como tal
          </Contagem>
          <Contagem numero={CONTAGENS_PITCH.principiosPrivacidade} rotulo="princípios de privacidade">
            privacy by design, com o arquivo onde cada um está
          </Contagem>
          <Contagem numero={CONTAGENS_PITCH.usosDeIa} rotulo="usos de IA">
            registrados: o que foi gerado, onde entrou, quem validou
          </Contagem>
        </dl>
        <div className="mt-5 border-l-2 border-acento pl-3">
          <p className="rotulo text-texto">o que não fizemos, escrito</p>
          <ul className="mt-2 grid gap-x-8 gap-y-1 text-sm md:grid-cols-2">
            {NAO_FEITO.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Quadro>

      {/* 8 · Até o SR1 */}
      <Quadro slide={ateOSr1}>
        <Titulo slide={ateOSr1} />
        <ol className="mt-6 grid md:grid-cols-3">
          {COMPROMISSOS_ATE_O_SR1.map((item, indice) => {
            const ciclo = cicloPorId(item.ciclo)
            const ultimo = indice === COMPROMISSOS_ATE_O_SR1.length - 1
            return (
              <li
                key={item.ciclo}
                className={cn('bloco-raso md:-ml-px', ultimo && 'border-acento md:z-10')}
              >
                <p className="rotulo">{ciclo.rotulo.toLowerCase()}</p>
                <p className="numero mt-1 text-2xl text-texto">{formatarBR(ciclo.data)}</p>
                <p className="mt-2 text-sm">{item.compromisso}</p>
              </li>
            )
          })}
        </ol>
        <p className="mt-6 text-sm">
          o motor continua puro e a régua continua dado: a portaria entra como versão, não
          como reescrita. o que a banca disser hoje entra no diário de bordo e orienta essas
          três semanas.
        </p>
      </Quadro>

      {/* 9 · Fechamento */}
      <Quadro slide={fechamento} className="grao">
        <h2 className="hero">
          {PRODUTO.nome.toLowerCase()}
          <span aria-hidden className="text-acento">
            _
          </span>
        </h2>
        <p className="slide-apoio text-texto">{fechamento.apoio}</p>
        <a
          href={URL_SITE}
          className="numero mt-6 inline-block self-start text-xl text-texto underline decoration-linha-alta underline-offset-8 hover:decoration-acento sm:text-3xl"
        >
          {ENDERECO_SITE}
        </a>
        <p className="mt-8 text-sm">
          {INSTITUICAO.escola} · {INSTITUICAO.curso} · {INSTITUICAO.periodo} ·{' '}
          {INSTITUICAO.equipe}
        </p>
        <p className="mt-10 fonte-display text-2xl">perguntas?</p>
      </Quadro>
    </>
  )
}

/* ------------------------------------------------------------------------- */

function Quadro({
  slide,
  className,
  children,
}: {
  slide: Slide
  className?: string
  children: ReactNode
}) {
  const indice = SLIDES.findIndex((s) => s.id === slide.id)
  const quemFala = integrantePorId(slide.quemFala).nome.split(' ')[0]

  return (
    <section
      id={`slide-${slide.numero}`}
      data-slide={slide.numero}
      aria-label={`Slide ${slide.numero} de ${SLIDES.length}: ${slide.titulo}`}
      className={cn('slide', className)}
    >
      <div className="slide-corpo flex flex-col">{children}</div>

      <details className="notas sem-impressao">
        <summary>
          <span className="rotulo">notas</span>
          <span>
            {quemFala.toLowerCase()} · {formatarTempo(slide.segundos)} · começa em{' '}
            {formatarTempo(inicioDoSlide(indice))}
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
          · kick-off
        </span>
        <span className="numero">
          {slide.numero}/{SLIDES.length}
        </span>
      </footer>
    </section>
  )
}

function Titulo({ slide }: { slide: Slide }) {
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
  children: ReactNode
}) {
  return (
    <div className="bloco-raso md:-ml-px">
      <dt className="rotulo">{rotulo}</dt>
      <dd className="fonte-display numero mt-1 text-4xl">{numero}</dd>
      <dd className="mt-2 text-sm">{children}</dd>
    </div>
  )
}

/** 0,667 em vez de 0.667: a tela fala português. */
function decimal(valor: number): string {
  return valor.toFixed(3).replace('.', ',')
}

/* O fluxo do art. 7º da Portaria Conjunta nº 001/2024. */
const ETAPAS_DA_PORTARIA: readonly { quem: string; oQue: string; quebra?: boolean }[] = [
  { quem: 'unidades e secretarias executivas', oQue: 'coletam os números do mês' },
  { quem: 'SECOGE', oQue: 'recebe tudo até o dia 20' },
  { quem: 'comissão de avaliação', oQue: 'consolida e valida, à mão, em planilha', quebra: true },
  { quem: 'SEGTES', oQue: 'pede a implantação até o 6º dia útil' },
  { quem: 'SEPLAGTD', oQue: 'paga na folha' },
]

/* As três personas da Semana 2, no vocabulário de depois da reunião com o cliente. */
const PESSOAS = [
  {
    papel: 'quem consolida',
    quem: 'analista da comissão',
    situacao: 'opera a planilha mestre há três ciclos e é procurada sempre que alguém contesta.',
    precisa: 'fechar o ciclo sem medo de ter errado uma fórmula.',
    teme: 'descobrir um erro depois do pagamento.',
  },
  {
    papel: 'quem informa',
    quem: 'gerente de unidade',
    situacao:
      'responde pelos subindicadores da unidade, sempre em cima do prazo, entre outras dez prioridades.',
    precisa: 'saber exatamente o que informar e até quando.',
    teme: 'ser cobrada por um dado que já enviou.',
  },
  {
    papel: 'quem é avaliada',
    quem: 'coordenadora avaliada',
    situacao: 'recebe a gratificação e vê só o resultado final, sem o caminho que levou até ele.',
    precisa: 'entender por que o valor foi aquele.',
    teme: 'ser avaliada por dado que não pôde conferir.',
  },
] as const

const CAMINHO_DO_NUMERO = [
  { nome: 'subindicador', como: 'o que a unidade preenche: valor direto, ou numerador e denominador.' },
  { nome: 'indicador', como: 'a composição dos subindicadores, feita pelo motor, sem ninguém digitar.' },
  { nome: 'meta e peso', como: 'da regra vigente, pelo tipo da unidade. versionados, nunca editados.' },
  { nome: 'nota e faixa', como: 'de 0 a 100, com a conta inteira aberta para conferir.' },
] as const

const NAO_FEITO = [
  'login simulado: o perfil vem de um seletor, e a tela diz isso.',
  'banco desligado: o schema com RLS existe e está testado, mas o app roda em memória.',
  'modelos treinados no recorte antigo do domínio, com aviso na tela.',
  'motor na régua deduzida: a portaria vira a versão 3 na semana 5.',
] as const
