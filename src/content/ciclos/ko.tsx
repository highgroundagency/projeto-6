import { Citacao, Grade, Cartao, Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import { WIREFRAMES } from '@/components/wireframe'
import { CSD } from '@/content/analises'
import {
  ARQUIVO_PDF,
  DEMO_PITCH,
  DURACAO_PITCH_SEGUNDOS,
  LEGENDAS_DO_WIREFRAME,
  SLIDES,
  formatarTempo,
} from '@/content/pitch'
import { OBJETIVOS_ESPECIFICOS, OBJETIVO_GERAL, URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 'ko',
  marcador: 'PRUMO-MARCADOR-CICLO-ko',

  objetivo: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo:
      'Apresentar o projeto nos dez minutos que o professor liberou, direto do site. Os seis falam. Entram o problema, os objetivos, as análises, a ideação, a solução e o cronograma.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Conferimos o roteiro linha a linha contra o que está no repositório. Checamos quem junta os números e quem aprova. Checamos os quatro papéis, as oito telas do sistema e as etapas do mês. E cada número dito no palco. As correções estão na tabela do documento abaixo.',
      'Os slides viraram um endereço do próprio site: /pitch. Ele é liberado pela mesma porta que decide quando cada parte do registro aparece. São nove slides, uma ideia por slide. Tem setas do teclado e notas do apresentador. E a memória de cálculo de verdade dentro do slide da demonstração. Ela é o passo a passo da conta.',
      'A regra oficial chegou: a Portaria Conjunta nº 001/2024, publicada no Diário Oficial de 21/09/2024. Copiamos o texto dela para o repositório e comparamos com o cálculo do sistema. Ela confirma o nosso modelo e corrige dois pontos.',
      'Geramos o PDF e as imagens dos slides a partir do próprio /pitch. Eles têm a mesma cara do site. O PDF pode ser baixado de dentro da própria apresentação. É a reserva para o caso de a sala não ter internet.',
      'O briefing oficial do Kick-off chegou na véspera. É o documento que diz o que o Kick-off precisa ter. Ele traz sete critérios de avaliação. E pede uma estrutura mínima de oito seções para o site. Conferimos o nosso material contra ele. Achamos três peças que não existiam em lugar nenhum. Eram o objetivo geral com os específicos. A matriz CSD, a lista de certezas, suposições e dúvidas. E os wireframes de baixa fidelidade, os desenhos simples das telas. Produzimos as três nesta semana. Estão nos documentos abaixo, com a data verdadeira.',
      'A apresentação cresceu de nove para dezessete slides. O tempo foi de 4:55 para 9:00, dentro dos dez minutos que o professor liberou. Os slides novos cobrem exatamente os critérios que faltavam. São eles: os objetivos, as fontes da pesquisa, a matriz CSD e o benchmarking com a SWOT. E também as técnicas de ideação, a justificativa da escolha, os wireframes e o cronograma com responsável.',
      'O site ganhou o índice das oito seções no topo. Ganhou a biblioteca com todos os documentos publicados. E ganhou o cronograma das 18 semanas. Cada entrega mostra o estado e o responsável. Até aqui esse cronograma só existia atrás da senha do painel administrativo.',
      'Kerry Muniz entrou na equipe nesta semana. O nome dele está na capa da apresentação, porque ele está na sala. Ele não recebeu bloco de fala: o roteiro já estava dividido e ensaiado, e dar um a quem chegou ontem seria inventar participação. A frente dele começa na Semana 5, apoiando pesquisa e validação.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        decisao: 'Apresentar direto do site, sem arquivo de slides.',
        porque:
          'O pitch é conteúdo do projeto como qualquer outro. Entra no Git. Passa pela liberação e pelo teste que prova que nada vaza antes da hora. Depois, a banca acessa pelo mesmo endereço. O PDF é só a reserva, não o original.',
      },
      {
        decisao: 'Memória de cálculo ao vivo, não em imagem.',
        porque:
          'É o nosso argumento contra a planilha. Ver o número se explicar sozinho vale mais que ouvir falar disso. A memória é montada junto com o slide, no servidor. Nenhum serviço de fora pode cair no meio. Sem internet na sala, a reserva é o PDF, que a própria apresentação baixa.',
      },
      {
        decisao: 'Fala dividida por bloco do roteiro, não por quem construiu.',
        porque:
          'A orientação que recebemos pede que todos falem. A equipe construiu tudo junta, e o pitch é da equipe. Cada bloco tem uma voz, para a fala ter ritmo. As perguntas, qualquer um responde.',
      },
      {
        decisao: 'A portaria entra no repositório; a planilha anonimizada, não.',
        porque:
          'A portaria é um documento público. A planilha tem gente, mesmo com os nomes trocados. O repositório é público: dado real da SESAU ali não tem volta. Ela fica como referência privada da equipe, para conferir a regra.',
      },
      {
        decisao: 'Abrir pelo problema, não pela solução.',
        porque: 'A relevância do case é o que sustenta o projeto. A tecnologia é consequência.',
      },
      {
        decisao: 'Crescer a apresentação em vez de cortar, usando os dez minutos liberados.',
        porque:
          'O briefing cobra sete critérios. Três não apareciam em slide nenhum na versão de 4:55. Com os dez minutos, cobrir os sete custa menos que escolher quais perder. Sobrou um minuto de margem: ensaio que fecha no limite estoura no dia.',
      },
      {
        decisao: 'Datar a matriz CSD e os wireframes nesta semana, e dizer isso no documento.',
        porque:
          'Os dois não existiam. Escrevê-los como se fossem de agosto deixaria o registro mais bonito e menos verdadeiro. O site inteiro vale pelo que ele registra. A Semana 3 prometeu telas em papel e não publicou. O documento dos wireframes reconhece isso, em vez de esconder.',
      },
      {
        decisao: 'Índice das oito seções na página, não no cabeçalho.',
        porque:
          'O cabeçalho foi desenhado para três destinos. Com oito, ele não cabe numa tela de 360px. E o índice na página serve de ordem de leitura para quem avalia. Um menu não faz isso.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Ainda não fizemos o ensaio cronometrado com os seis integrantes. O endereço /pitch mostra o tempo de cada slide nas notas, para isso.',
      'O cálculo ainda segue a regra que deduzimos na reunião de 22/08, não a portaria. A média das notas dos itens medidos e a redistribuição de peso do art. 8º entram como regra versão 3, na Semana 5.',
      'O benchmarking não nomeia concorrentes: as cinco referências são tipos de ferramenta, não produtos com nome. Nomeá-las exige um levantamento que não coube nesta semana.',
      'A dinâmica real das três técnicas de ideação continua sem foto ou registro. O que está publicado é o roteiro previsto, e corrigimos o checklist para dizer isso.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'A primeira versão do roteiro passava de 7 minutos. Tiramos a arquitetura do pitch e deixamos para a hora das perguntas da banca.',
      },
      {
        origem: 'cliente',
        texto:
          'O órgão enviou a portaria que regulamenta a gratificação. Enviou também uma planilha anonimizada de um ciclo real, para conferirmos a regra. Só a portaria entra no repositório.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Ensaiar com cronômetro em /pitch e ajustar os blocos que estourarem.',
      'Preparar as respostas para as perguntas prováveis da banca, listadas no documento abaixo.',
      'Entrar na Semana 5 com a regra oficial carregada no cálculo, como regra versão 3. E com o desenho da arquitetura pronto.',
      'Subir o PDF da apresentação para a pasta da equipe no Drive e ligar o link no site. É o último item do checklist do professor ainda em aberto.',
      'Levar à secretaria as cinco dúvidas da matriz CSD, começando pela redistribuição de peso do art. 8º.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Fala: capa, problema, objetivos e fechamento.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Fala: fontes da pesquisa, quem sofre com o problema, matriz CSD.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Fala: técnicas de ideação, por que a ideia venceu, wireframes.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Fala: demonstração ao vivo, regra guardada como dado.',
      },
      { integrante: 'rafael', contribuicao: 'Fala: dados, modelos e riscos.' },
      {
        integrante: 'fernando',
        contribuicao: 'Fala: roteiro, benchmarking com SWOT, cronograma.',
      },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Os slides do pitch, no site', url: '/pitch' },
      { tipo: 'documento', rotulo: 'A regra oficial', url: '#doc-ko-regua-oficial' },
      { tipo: 'documento', rotulo: 'Objetivo geral e específicos', url: '#doc-ko-objetivos' },
      { tipo: 'documento', rotulo: 'Matriz CSD', url: '#doc-ko-csd' },
      {
        tipo: 'prototipo',
        rotulo: 'Wireframes de baixa fidelidade',
        url: '#doc-ko-wireframes',
      },
      { tipo: 'documento', rotulo: 'Os sete critérios do Kick-off', url: '#doc-ko-criterios' },
      {
        tipo: 'codigo',
        rotulo: 'Roteiro, PDF e portaria transcrita',
        url: `${URL_REPOSITORIO}/tree/main/docs`,
      },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'apresentacao',
    titulo: 'A apresentação do Kick-off',
    resumo: 'os dezessete slides, o que tem em cada um, e o caminho para abrir e para baixar.',
    Conteudo: () => (
      <>
        <p>
          A apresentação não é um arquivo à parte: ela é uma página deste mesmo site, com o
          sistema rodando de verdade dentro de um dos slides. São {SLIDES.length} slides e{' '}
          {formatarTempo(DURACAO_PITCH_SEGUNDOS)} de fala.
        </p>
        <p>
          <a href="/pitch" className="underline underline-offset-4 hover:text-acento">
            Abrir a apresentação →
          </a>{' '}
          <span className="text-apagado">ou</span>{' '}
          <a
            href={ARQUIVO_PDF}
            download
            className="underline underline-offset-4 hover:text-acento"
          >
            baixar em PDF
          </a>
          . O PDF tem as mesmas telas, para o caso de a sala ficar sem rede.
        </p>
        <div className="mt-4">
          <Lista itens={SLIDES.map((slide) => `${slide.numero}. ${slide.titulo}`)} />
        </div>
      </>
    ),
  },
  {
    id: 'regua-oficial',
    titulo: 'A regra oficial: Portaria Conjunta nº 001/2024',
    resumo:
      'o que a portaria confirma no nosso modelo, e os dois pontos em que ela nos corrige.',
    Conteudo: () => (
      <>
        <p>
          Publicada no Diário Oficial do Recife nº 131, de 21/09/2024, valendo desde 01/09/2024.
          Ela detalha os indicadores do Decreto nº 36.482/2023 e os itens medidos de cada um (os
          subindicadores). Também cria a Comissão de Avaliação de Metas. O texto completo está
          em <code>docs/portaria-001-2024.md</code>; abaixo, só o que importa para o cálculo.
        </p>
        <div className="mt-4">
          <Citacao fonte="Art. 6º">
            A Comissão de Avaliação de Metas (CAM) é a responsável por consolidar, analisar,
            deliberar e divulgar os resultados da avaliação do cumprimento dos indicadores de
            gestão e dos recursos interpostos.
          </Citacao>
        </div>
        <div className="mt-4">
          <Tabela
            colunas={['Tema', 'O cálculo hoje (regra v2)', 'A portaria', 'Estado']}
            linhas={[
              [
                'O que se preenche',
                'Cada item medido: um valor direto, ou numerador e denominador',
                'Cada item medido tem a fórmula numerador ÷ denominador × 100, ou é uma contagem direta',
                'Confirmado',
              ],
              [
                'Meta e peso por tipo de unidade',
                'Para cada par tipo de unidade e indicador, a regra guarda a meta e o peso. A regra tem número de versão',
                'O Indicador 4 muda inteiro por tipo (USF, CAPS, UBT, UCIS, CECON, MAC), e os pesos mudam por função',
                'Confirmado',
              ],
              [
                'Nota do distrito',
                'Média simples das notas das unidades',
                'Média das notas das unidades, em todos os indicadores distritais',
                'Confirmado',
              ],
              [
                'Como o indicador é composto',
                'Tira a média dos valores informados. Só depois compara com a meta para virar nota',
                'Cada item medido vira nota primeiro. Depois tira a média simples dessas notas. O Indicador 4 usa média ponderada',
                'Diverge: vira regra v3 na Semana 5',
              ],
              [
                'Indicador sem lançamento',
                'Dá nota zero e mostra um aviso',
                'Art. 8º: ignora o indicador e divide o peso dele entre os outros, na proporção',
                'Diverge: vira regra v3 na Semana 5',
              ],
              [
                'Quem aprova',
                'A Coordenação da SEAB, dentro do sistema',
                'A CAM, com apoio da SECOGE, com pelo menos 4 membros presentes (arts. 5º e 6º)',
                'O sistema cuida do dia a dia. A aprovação final é da CAM, fora do sistema',
              ],
              [
                'Contestação',
                'A tela existe, mas não controla prazo',
                'Art. 9º: 10 dias corridos para recorrer, 5 dias úteis para responder',
                'O prazo entra na regra v3',
              ],
            ]}
          />
        </div>
        <div className="mt-4">
          <Lista
            itens={[
              'Fluxo do art. 7º: cada secretaria executiva coleta os dados e envia à SECOGE até o dia 20. A CAM valida e publica até o último dia útil. A SEGTES pede a implantação na folha até o 6º dia útil do segundo mês.',
              'A comissão tem sete áreas: SECOGE, SEAB, SEAF, SEGTES, SERMAC, SEVS e SEPLAGTD, cada uma com titular e suplente. Os nomes ficaram fora do repositório de propósito.',
              'São cinco indicadores: registro de medicamentos e MMH; gestão do trabalho; satisfação do usuário; desempenho das unidades; e vigilância em saúde, este só para funções distritais. Os pesos são 20%, 20%, 20%, 40% e 30%, e variam por função.',
            ]}
          />
        </div>
        <div className="mt-3">
          <Nota>
            A demonstração do pitch usa a unidade fictícia {DEMO_PITCH.unidadeId}, gerada por
            programa. Ela roda na regra v2, a que deduzimos em 22/08. A regra oficial vira a
            regra v3 na Semana 5, e o slide 7 diz isso em voz alta.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'objetivos',
    titulo: 'Objetivo geral e objetivos específicos',
    resumo: 'o que o produto tem que fazer, e até quando cada parte fica de pé.',
    Conteudo: () => (
      <>
        <p>
          Escritos na semana do Kick-off. Até aqui o projeto tinha metas de entrega da
          disciplina, com data de marco. Mas não tinha o objetivo do PRODUTO dito com todas as
          letras. O briefing do Kick-off cobra os dois, e eles não são a mesma coisa.
        </p>
        <div className="mt-4">
          <Citacao fonte="Objetivo geral">{OBJETIVO_GERAL}</Citacao>
        </div>
        <div className="mt-4">
          <Tabela
            colunas={['Objetivo específico', 'O que ele exige', 'Verificável em']}
            linhas={OBJETIVOS_ESPECIFICOS.map((o) => [o.resumo, o.detalhe, o.quando])}
          />
        </div>
        <div className="mt-3">
          <Nota>
            Não confundir com os Objetivos SMART da Semana 2. Aqueles são metas de entrega da
            disciplina, como ter o cálculo coberto por testes até a Semana 6. Ou coletar
            feedback na Semana 11. Estes dizem o que o sistema tem de fazer. Os dois convivem, e
            nenhum substitui o outro.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'csd',
    titulo: 'Matriz CSD: certezas, suposições e dúvidas',
    resumo:
      'o que sabemos com fonte, o que assumimos para poder andar, e o que falta perguntar.',
    Conteudo: () => (
      <>
        <p>
          Montada na semana do Kick-off, e não em agosto. O material já estava escrito, só que
          espalhado. As suposições moravam em comentário de código e numa nota da Semana 3. As
          certezas, na portaria transcrita. As dúvidas, na ata da reunião de 22/08. Só faltava
          juntar tudo na matriz.
        </p>
        {CSD.map((coluna) => (
          <div key={coluna.chave} className="mt-4">
            <Secao titulo={coluna.titulo}>
              <Tabela
                colunas={[coluna.titulo, 'De onde vem']}
                linhas={coluna.itens.map((item) => [item.texto, item.fonte])}
              />
            </Secao>
          </div>
        ))}
        <div className="mt-3">
          <Nota>
            Toda linha da primeira coluna tem uma origem que dá para conferir. É isso que separa
            uma matriz CSD de uma lista de opiniões: certeza sem fonte é chute com voz firme. As
            suposições também estão declaradas dentro do código, onde elas agem.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'wireframes',
    titulo: 'Wireframes de baixa fidelidade',
    resumo: 'os quatro desenhos das telas centrais, em traço de papel.',
    Conteudo: () => (
      <>
        <p>
          Desenhados na semana do Kick-off, a partir das telas que já existiam. A Semana 3
          prometeu as primeiras telas em papel, como produto do Crazy 8&rsquo;s. O desenho não
          chegou a ser publicado. Em vez de datá-lo em agosto, ele nasce aqui, com a data certa.
        </p>
        <p>
          Não há uma palavra dentro dos desenhos, e isso é de propósito. Wireframe de baixa
          fidelidade usa barra cinza no lugar de texto. Assim a conversa é sobre onde cada coisa
          fica, e não sobre a escolha da frase.
        </p>
        <div className="mt-4">
          <Grade colunas={2}>
            {WIREFRAMES.map(({ id, Desenho }, indice) => (
              <Cartao key={id} titulo={LEGENDAS_DO_WIREFRAME[indice]}>
                <Desenho className="w-full" />
              </Cartao>
            ))}
          </Grade>
        </div>
        <div className="mt-3">
          <Nota>
            A tela pronta que saiu do segundo desenho está em <code>/sistema</code> e no slide
            da demonstração. Ela roda com dados de teste. O par desenho e tela é a nossa
            resposta ao critério de solução do Kick-off.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'criterios',
    titulo: 'Os sete critérios do Kick-off, e onde cada um está',
    resumo: 'o mapa para quem avalia: cada critério do briefing com o link do que o sustenta.',
    Conteudo: () => (
      <>
        <p>
          O briefing do Kick-off lista sete critérios. E pede todo o material organizado no site
          da equipe. Esta tabela existe para quem avalia não ter que procurar. Cada linha aponta
          para o documento ou a seção que sustenta aquele critério.
        </p>
        <div className="mt-4">
          <Tabela
            colunas={['Critério', 'O que o briefing pede', 'Onde está']}
            linhas={[
              [
                '1. Problema',
                'Descrição clara do desafio e evidências de pesquisa: dados, contexto e referências',
                'Seção “o problema” na página inicial; “O processo hoje” na Semana 2; “O que já sabemos” na Semana 1; a portaria transcrita neste ciclo; slides 3 e 4',
              ],
              [
                '2. Objetivos',
                'Objetivo geral e objetivos específicos alinhados ao problema',
                'O documento de objetivos acima; os Objetivos SMART na Semana 2; slide 5',
              ],
              [
                '3. Análises',
                'CSD, mapa de empatia, personas, benchmarking e SWOT',
                'A matriz CSD acima; “Personas e mapa de empatia”, “Benchmarking” e “Análise SWOT” na Semana 2; slides 6, 7 e 8',
              ],
              [
                '4. Ideação',
                'Evidência das técnicas aplicadas e justificativa da ideia escolhida',
                '“Roteiro das três técnicas”, “Alternativas levantadas” e “Justificativa da escolha” na Semana 3; slides 9 e 10',
              ],
              [
                '5. Solução',
                'Solução inicial e protótipos de baixa fidelidade com wireframes',
                'Os wireframes acima; “Proposta em uma página”, “Escopo” e “Backlog inicial” na Semana 4; o sistema rodando em /sistema; slides 11, 12 e 13',
              ],
              [
                '6. Cronograma',
                'Atividades, estado, prazos e responsáveis',
                'A seção de cronograma na página inicial, com as 18 semanas, o estado de cada entrega e quem responde por ela; slide 16',
              ],
              [
                '7. Documentação',
                'Todo o conteúdo organizado no site da equipe',
                'A seção de documentos na página inicial, com os documentos de todas as semanas publicadas, e o índice das oito seções no topo',
              ],
            ]}
          />
        </div>
        <div className="mt-3">
          <Nota>
            O que o briefing chama de Google Site é, aqui, este próprio site. Ele fica guardado
            no Git e é liberado ciclo a ciclo. É o material avaliado. A apresentação fica em
            /pitch, e o PDF dela pode ser baixado de dentro da própria apresentação.
          </Nota>
        </div>
      </>
    ),
  },
] as const satisfies readonly Documento[]
