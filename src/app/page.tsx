import { ClipboardCheck, ScrollText, Scale } from 'lucide-react'
import { Chamada } from '@/components/base/botao'
import { Cabecalho } from '@/components/base/cabecalho'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { AcaoDoFluxo, Conector, EstadoDoFluxo, Fluxo } from '@/components/base/fluxo'
import { MarcaCesar } from '@/components/base/marca'
import { Num } from '@/components/base/num'
import { Rodape } from '@/components/base/rodape'
import { Selo } from '@/components/base/selo'
import { CicloSemRegistro, RegistroSemana } from '@/components/registro/registro-semana'
import { TrilhaMarcos } from '@/components/registro/trilhas'
import { carregarCiclos, temRegistro } from '@/content/ciclos/registro'
import { EQUIPE, SELO_PAPEIS } from '@/content/equipe'
import { INSTITUICAO, PERGUNTA_DO_PROJETO, PROBLEMA } from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { obterVisao } from '@/lib/visao'

/**
 * A página. Não uma porta de entrada para outras páginas: o site inteiro.
 *
 * O professor abre e tem tudo — o problema, a equipe, os marcos e cada semana
 * do registro, dobrada numa sanfona. O único link que sai daqui é o sistema.
 *
 * ELA DEIXOU DE SER ESTÁTICA. Antes servia HTML pronto do CDN porque não lia
 * nada; agora precisa do gate de release, que depende de cookie e do calendário.
 * HTML assado no build congelaria o release ou vazaria semana futura — e o §6.3
 * não admite nenhum dos dois. O custo é uma renderização por requisição.
 */
export const dynamic = 'force-dynamic'

export default async function Pagina() {
  const visao = await obterVisao()

  // O GATE ACONTECE AQUI: só os ciclos aprovados chegam ao carregador. Passar a
  // lista completa anularia a proteção do §6.3 — e não adianta dobrar a semana
  // numa sanfona, porque `<details>` fechado continua no DOM.
  const idsVisiveisComRegistro = visao.visiveis.filter((id) => temRegistro(id))
  const carregados = await carregarCiclos(idsVisiveisComRegistro)

  // Do mais recente para o mais antigo: quem abre a página quer a semana atual.
  const emOrdemInversa = [...carregados].reverse()
  const semRegistro = visao.visiveis.filter((id) => !temRegistro(id)).reverse()

  return (
    <>
      <FaixaAdmin visao={visao} />
      <Cabecalho />

      <main id="conteudo" className="mx-auto max-w-[1100px] px-0 sm:px-8">
        {/* Hero — o único lugar da página com imagem. */}
        <section className="grao bloco border-x-0 border-t-0 pt-16 sm:pt-24">
          {/* No mobile a marca e a pílula ficam centradas e empilhadas; da
              largura sm para cima voltam a alinhar à esquerda com o resto. */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <MarcaCesar className="h-10" />
            <span className="pilula numero">
              {INSTITUICAO.curso} · {INSTITUICAO.equipe}
            </span>
          </div>

          <h1 className="hero cursor mt-8">gratificação fora da planilha</h1>

          {/* O subtítulo diz o que o sistema FAZ. O que é o problema fica para o
              bloco abaixo — antes os dois contavam a mesma coisa. */}
          <p className="prosa mt-7 text-base lowercase">
            a regra vira dado versionado, e cada valor abre até a origem que o gerou.
          </p>

          {/* Dois caminhos, um por linha: o sistema e as entregas da semana.
              O segundo é âncora na própria página, logo abaixo. */}
          <div className="mt-9 flex flex-col items-start gap-3">
            <Chamada href="/sistema">ver o sistema →</Chamada>
            <Chamada href="#registro" variante="secundario">
              ver entregas ↓
            </Chamada>
          </div>
        </section>

        {/* Equipe: nome, papel e frente de cada integrante. */}
        <section id="equipe" className="bloco revelar scroll-mt-20" aria-labelledby="titulo-equipe">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="titulo-equipe" className="rotulo">
              equipe
            </h2>
            <Selo selo={SELO_PAPEIS} />
          </div>

          <ul className="mt-6 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPE.map((integrante) => (
              <li key={integrante.id} className="flex gap-3">
                <span
                  aria-hidden
                  className="numero flex size-9 shrink-0 items-center justify-center border border-linha-alta text-xs"
                >
                  {integrante.iniciais}
                </span>
                <div className="min-w-0">
                  <p className="fonte-display text-sm leading-tight">{integrante.nome}</p>
                  <p className="rotulo mt-1 text-acento">{integrante.papel}</p>
                  <p className="mt-1.5 text-xs leading-relaxed">{integrante.frente}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* A pergunta do projeto tem bloco próprio, antes do problema: ela é o
            que a banca cobra que o registro responda. */}
        <section className="bloco revelar" aria-labelledby="titulo-pergunta">
          <h2 id="titulo-pergunta" className="rotulo">
            a pergunta do projeto
          </h2>
          <p className="titulo-bloco prosa mt-5 border-l-2 border-acento pl-5 text-xl normal-case sm:text-2xl">
            {PERGUNTA_DO_PROJETO}
          </p>
        </section>

        <section className="bloco revelar" aria-labelledby="titulo-problema">
          <h2 id="titulo-problema" className="rotulo">
            o problema
          </h2>
          <div className="prosa mt-4 space-y-3 text-sm">
            {PROBLEMA.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
        </section>

        {/* O registro semanal, dobrado. Fica logo depois do problema: é o que o
            professor vem buscar toda semana, e não deve exigir rolagem. */}
        <section id="registro" className="bloco scroll-mt-20" aria-labelledby="titulo-registro">
          <h2 id="titulo-registro" className="rotulo">
            Registro semanal
          </h2>
          <p className="prosa mt-2 text-sm lowercase">
            uma semana por linha. a setinha abre as entregas daquela semana.
          </p>
          {/* Todas recolhidas, sem exceção. Quem chega procura UMA semana; abrir
              qualquer uma por padrão empurra as outras para fora da tela. A da
              vez vem marcada, que resolve o mesmo sem ocupar espaço. */}

          {emOrdemInversa.length === 0 ? (
            <p className="mt-6 border border-dashed border-linha px-4 py-6 text-sm">
              O semestre ainda não começou. O primeiro registro é publicado em{' '}
              <Num>{formatarBR(cicloPorId('s1').data)}</Num>.
            </p>
          ) : (
            <>
              <div className="mt-6">
                {emOrdemInversa.map(({ id, modulo }) => (
                  <RegistroSemana
                    key={id}
                    registro={modulo.registro}
                    documentos={modulo.documentos}
                    detalhes={modulo.Detalhes ? <modulo.Detalhes /> : undefined}
                    atual={id === visao.release.cicloCorrente}
                  />
                ))}
              </div>

              {semRegistro.length > 0 ? (
                <div className="mt-6 space-y-2">
                  {semRegistro.map((id) => (
                    <CicloSemRegistro key={id} ciclo={id} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>

        {/* A TrilhaMarcos já traz a própria section e o próprio heading. */}
        <div className="bloco revelar">
          <TrilhaMarcos hoje={visao.hoje} />
        </div>

        {/* O fluxo real do ciclo, não um fluxo ilustrativo. */}
        <section className="bloco revelar border-b-0">
          <h2 className="titulo-bloco">o ciclo</h2>
          <p className="prosa mt-2 text-sm lowercase">
            cada estado só avança um passo por vez, e a passagem fica na trilha.
          </p>

          <div className="mt-10">
            <Fluxo>
              <EstadoDoFluxo>lançamento aberto</EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo
                icone={<ClipboardCheck size={24} strokeWidth={1.5} />}
                titulo="área técnica informa"
              >
                valor e evidência de cada indicador, dentro da janela do ciclo.
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo>em validação</EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo icone={<Scale size={24} strokeWidth={1.5} />} titulo="cam apura">
                a regra vigente na competência vira score, faixa e memória de cálculo.
                <span className="numero mt-2 block text-xs">
                  score = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100
                </span>
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

        <Rodape className="px-6 pb-8 sm:px-0" />
      </main>
    </>
  )
}
