import Link from 'next/link'
import { ClipboardCheck, ScrollText, Scale } from 'lucide-react'
import { Chamada } from '@/components/base/botao'
import { Cabecalho } from '@/components/base/cabecalho'
import { Indice } from '@/components/base/indice'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { AcaoDoFluxo, Conector, EstadoDoFluxo, Fluxo } from '@/components/base/fluxo'
import { MarcaCesar } from '@/components/base/marca'
import { Num } from '@/components/base/num'
import { Rodape } from '@/components/base/rodape'
import { Selo } from '@/components/base/selo'
import {
  AtalhosDeDocumento,
  Biblioteca,
  escolher,
  listarDocumentos,
} from '@/components/registro/biblioteca'
import { CronogramaPublico } from '@/components/registro/cronograma-publico'
import { EntregaDaVez } from '@/components/registro/entrega-da-vez'
import { CicloSemRegistro, RegistroSemana } from '@/components/registro/registro-semana'
import { TimelineCiclos, TrilhaMarcos } from '@/components/registro/trilhas'
import { ExplicacaoDosPerfis } from '@/components/sistema/perfis'
import { carregarCiclos, temRegistro } from '@/content/ciclos/registro'
import { EQUIPE, SELO_PAPEIS } from '@/content/equipe'
import { INSTITUICAO, PERGUNTA_DO_PROJETO, PROBLEMA } from '@/content/produto'
import { cicloPorId } from '@/lib/cronograma'
import { cicloCorrente, proximoMarco } from '@/lib/releases'
import { formatarBR } from '@/lib/datas'
import { ehSemanaCorrente } from '@/lib/releases'
import { featuresLiberadas } from '@/lib/sistema'
import { temaAtual } from '@/lib/tema'
import { obterVisao, podeVer } from '@/lib/visao'

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
  const tema = await temaAtual()

  // O GATE ACONTECE AQUI: só os ciclos aprovados chegam ao carregador. Passar a
  // lista completa anularia a proteção do §6.3 — e não adianta dobrar a semana
  // numa sanfona, porque `<details>` fechado continua no DOM.
  const idsVisiveisComRegistro = visao.visiveis.filter((id) => temRegistro(id))
  const carregados = await carregarCiclos(idsVisiveisComRegistro)

  // Do mais recente para o mais antigo: quem abre a página quer a semana atual.
  const emOrdemInversa = [...carregados].reverse()
  const semRegistro = visao.visiveis.filter((id) => !temRegistro(id)).reverse()

  // A biblioteca lê os MESMOS módulos já carregados: nenhum import a mais, e
  // nenhum documento de ciclo fechado, porque o gate aconteceu lá em cima.
  const documentos = listarDocumentos(
    carregados.map(({ id, modulo }) => ({
      id,
      rotuloCiclo: cicloPorId(id).rotulo,
      documentos: modulo.documentos,
    })),
  )
  const hoje = cicloCorrente(visao.hoje)

  // A ENTREGA DA VEZ: o próximo marco do cronograma, com o que ele já publicou.
  // Os documentos saem dos módulos JÁ CARREGADOS, então um marco ainda fechado
  // aparece com nome e data (que são públicos: é o calendário da disciplina) e
  // sem uma linha do que ele vai entregar.
  const marco = proximoMarco(visao.hoje)
  const moduloDoMarco = marco ? carregados.find((c) => c.id === marco.id) : undefined

  return (
    <>
      <FaixaAdmin visao={visao} />
      <Cabecalho tema={tema} />

      <main id="conteudo" className="mx-auto max-w-[1100px] px-0 sm:px-8">
        {/* Hero — o único lugar da página com imagem. */}
        <section id="topo" className="grao bloco border-x-0 border-t-0 pt-16 sm:pt-24">
          {/* No mobile a marca e a pílula ficam centradas e empilhadas; da
              largura sm para cima voltam a alinhar à esquerda com o resto. */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <MarcaCesar className="h-10" />
            <span className="pilula numero">
              {INSTITUICAO.curso} · {INSTITUICAO.equipe}
            </span>
          </div>

          <h1 className="hero cursor mt-8">gratificação fora da planilha</h1>

          {/* O subtítulo diz o que o sistema FAZ, numa frase que qualquer
              pessoa entende. O problema fica para o bloco abaixo. */}
          <p className="prosa mt-7 text-base lowercase">
            a conta da gratificação feita às claras: qualquer número da tela mostra de onde
            veio.
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

        {/* A entrega da vez vem ANTES do índice: a primeira pergunta de quem
            abre o site no dia é "o que é hoje", não "o que tem aqui". */}
        {marco ? (
          <EntregaDaVez
            marco={marco}
            hoje={visao.hoje}
            objetivo={moduloDoMarco?.modulo.registro.objetivo.conteudo ?? null}
            documentos={documentos.filter((doc) => doc.ciclo === marco.id)}
            slidesLiberados={marco.id === 'ko' && podeVer(visao, 'ko')}
          />
        ) : null}

        {/* O índice das oito seções, logo abaixo do hero: ele é o mapa e a
            ordem de leitura para quem chega para avaliar. */}
        <section className="bloco revelar" aria-labelledby="titulo-indice">
          <h2 id="titulo-indice" className="rotulo">
            o que tem aqui
          </h2>
          <div className="mt-5">
            <Indice />
          </div>
        </section>

        {/* Equipe: nome, papel e frente de cada integrante. */}
        <section
          id="equipe"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-equipe"
        >
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

        <section
          id="problema"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-problema"
        >
          <h2 id="titulo-problema" className="rotulo">
            o problema
          </h2>
          <div className="prosa mt-4 space-y-3 text-sm">
            {PROBLEMA.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
          <AtalhosDeDocumento
            documentos={escolher(documentos, [
              's2-processo-hoje',
              's1-o-que-sabemos',
              'ko-regua-oficial',
            ])}
          />
        </section>

        {/* Quem é quem. O problema acima fala de um processo com quatro atores,
            e sem saber quem eles são o resto do site fica abstrato. Aparece
            também dentro do /sistema, ao lado do seletor de perfil.

            As telas passadas são as JÁ LIBERADAS, não as oito: descrever o que
            ainda não saiu entregaria o roteiro que o §6.2 manda guardar. */}
        <section
          id="usuario"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-papeis"
        >
          <h2 id="titulo-papeis" className="rotulo">
            o usuário
          </h2>
          <p className="prosa mt-2 text-sm lowercase">
            quatro papéis no sistema, e o que cada um pode e não pode fazer. quem são essas
            pessoas, o que elas temem e o que elas precisam está nas personas e no mapa de
            empatia.
          </p>
          <div className="mt-6">
            <ExplicacaoDosPerfis telas={featuresLiberadas(visao)} />
          </div>
          <AtalhosDeDocumento documentos={escolher(documentos, ['s2-personas'])} />
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
                    atual={ehSemanaCorrente(visao.hoje, id)}
                  />
                ))}
              </div>

              {semRegistro.length > 0 ? (
                <div className="mt-6 space-y-2">
                  {semRegistro.map((id) => (
                    <CicloSemRegistro key={id} ciclo={id} atual={ehSemanaCorrente(visao.hoje, id)} />
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

        {/* O desenho de como o processo funciona, do prazo aberto ao resultado
            publicado. É o fluxo REAL da máquina de estados do motor, contado em
            linguagem de balcão: cada pílula é uma etapa do mês, cada cartão é o
            que alguém faz para o mês andar. */}
        <section
          id="solucao"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-como-funciona"
        >
          <h2 id="titulo-como-funciona" className="titulo-bloco">
            a solução, e como ela funciona
          </h2>

          {/* Antes do desenho, o mapa do site em duas frases: sem isso, quem
              chega não sabe o que é diário e o que é programa. */}
          <div className="prosa mt-4 space-y-3 text-sm">
            <p>
              este site tem duas partes. esta página é o diário do projeto: o que a equipe fez a
              cada semana, com as entregas dentro. o{' '}
              <Link href="/sistema" className="underline underline-offset-4">
                sistema
              </Link>{' '}
              é o programa de exemplo que faz a conta da gratificação.
            </p>
            <p>
              no sistema, todo mês passa pelas etapas abaixo, sempre nesta ordem e uma de cada
              vez. cada passagem fica gravada num histórico que ninguém consegue apagar.
            </p>
          </div>

          <div className="mt-10">
            <Fluxo>
              <EstadoDoFluxo explicacao="o prazo está aberto: é hora de informar os números do mês.">
                lançamento aberto
              </EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo
                icone={<ClipboardCheck size={24} strokeWidth={1.5} />}
                titulo="1 · cada unidade informa seus números"
              >
                quem tem o dado preenche os subindicadores e diz de onde cada número veio, dentro do prazo. nos dias finais, a janela de revisão deixa corrigir com histórico.
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo explicacao="o prazo acabou. a SEAB confere os números antes da conta.">
                em validação
              </EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo
                icone={<Scale size={24} strokeWidth={1.5} />}
                titulo="2 · a SEAB faz a conta"
              >
                cada número vira pontos, e os pontos viram uma nota de 0 a 100. a conta fica
                aberta para qualquer um conferir.
                <span className="numero mt-2 block text-xs">
                  nota = (Σ pontos × peso) ÷ (Σ peso × pontuação máxima) × 100
                </span>
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo explicacao="a conta foi feita e a SEAB aprovou o resultado.">
                homologado
              </EstadoDoFluxo>
              <Conector />
              <AcaoDoFluxo
                icone={<ScrollText size={24} strokeWidth={1.5} />}
                titulo="3 · o gerente confere a nota"
              >
                vê a conta linha por linha. se discordar, pede revisão no prazo e recebe
                resposta por escrito.
              </AcaoDoFluxo>
              <Conector />
              <EstadoDoFluxo explicacao="o resultado está no ar: cada gerente vê a nota da sua unidade.">
                publicado
              </EstadoDoFluxo>
            </Fluxo>
          </div>

          <AtalhosDeDocumento
            documentos={escolher(documentos, [
              'ko-wireframes',
              's4-proposta',
              's4-escopo',
              's4-backlog',
            ])}
          />
        </section>

        {/* 06 · O processo: como a equipe chegou até aqui. Não repete os
            documentos, aponta para eles. Conteúdo duplicado é conteúdo que
            diverge. */}
        <section
          id="processo"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-processo"
        >
          <h2 id="titulo-processo" className="rotulo">
            o processo
          </h2>
          <p className="prosa mt-2 text-sm lowercase">
            o que a equipe estudou antes de decidir, e como a ideia foi escolhida: a matriz de
            certezas, suposições e dúvidas, o que já existe lá fora, o retrato do projeto e as
            três dinâmicas de ideação.
          </p>
          <AtalhosDeDocumento
            documentos={escolher(documentos, [
              'ko-csd',
              's2-benchmarking',
              's2-swot',
              'ko-objetivos',
              's2-objetivos',
              's3-tecnicas-ideacao',
              's3-alternativas',
              's3-justificativa',
              's3-reuniao-cliente',
            ])}
          />
        </section>

        {/* 07 · O cronograma. Os quatro dados que o briefing pede (atividade,
            prazo, estado e responsável) já existiam e só o painel com senha
            mostrava. */}
        <section
          id="cronograma"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-cronograma"
        >
          <h2 id="titulo-cronograma" className="rotulo">
            o cronograma
          </h2>
          <p className="prosa mt-2 text-sm lowercase">
            as dezoito semanas do semestre, com o que cada uma entrega, a data, o estado e quem
            responde. a semana liberada leva ao registro dela.
          </p>
          <TimelineCiclos
            visiveis={visao.visiveis}
            comRegistro={visao.visiveis.filter((id) => temRegistro(id))}
            cicloCorrente={hoje}
          />
          <CronogramaPublico visiveis={visao.visiveis} cicloCorrente={hoje} />
        </section>

        {/* 08 · A biblioteca: todo documento publicado, num lugar só. */}
        <section
          id="documentos"
          className="bloco revelar scroll-mt-20"
          aria-labelledby="titulo-documentos"
        >
          <h2 id="titulo-documentos" className="rotulo">
            os documentos
          </h2>
          <p className="prosa mt-2 text-sm lowercase">
            tudo que foi entregue até aqui, por semana. cada título abre o documento inteiro
            dentro da página, sem baixar arquivo e sem trocar de aba.
          </p>
          <Biblioteca documentos={documentos} />
        </section>

        {/* A porta para os desenhos da arquitetura. O conteúdo mora em página
            própria porque veste a pele do sistema (ADR-031 e ADR-032): misturar
            as duas identidades numa seção ficaria pior que um clique. */}
        <section
          id="arquitetura"
          className="bloco revelar scroll-mt-20 border-b-0"
          aria-labelledby="titulo-arquitetura"
        >
          <h2 id="titulo-arquitetura" className="rotulo">
            Arquitetura
          </h2>
          <p className="prosa mt-4 text-sm">
            como o sistema é feito por dentro, em quatro desenhos: quem usa, as peças, o
            caminho que um número percorre até virar nota, e as classes que ele guarda. clica
            e abre, com direito ao prompt que redesenha tudo em qualquer IA.
          </p>
          <div className="mt-6">
            <Chamada href="/arquitetura" variante="secundario">
              ver a arquitetura
            </Chamada>
          </div>
        </section>

        <Rodape className="px-6 pb-8 sm:px-0" />
      </main>
    </>
  )
}
