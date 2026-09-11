import { Citacao, Grade, Cartao, Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import { WIREFRAMES } from '@/components/wireframe'
import { CSD } from '@/content/analises'
import { integrantePorId } from '@/content/equipe'
import {
  DEMO_PITCH,
  DURACAO_PITCH_SEGUNDOS,
  SLIDES,
  formatarTempo,
  inicioDoSlide,
} from '@/content/pitch'
import { LEGENDAS_DO_WIREFRAME } from '@/content/pitch'
import { OBJETIVOS_ESPECIFICOS, OBJETIVO_GERAL, URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 'ko',
  marcador: 'PRUMO-MARCADOR-CICLO-ko',

  objetivo: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo:
      'Apresentar o problema, os objetivos, as análises, a ideação, a solução e o cronograma dentro dos dez minutos liberados, com fala distribuída entre os seis, direto do site.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Roteiro conferido linha a linha contra o repositório: quem consolida e homologa, os quatro papéis, as oito telas, os estados do mês e cada número dito no palco. As correções estão na tabela do documento abaixo.',
      'Os slides viraram uma rota do próprio site, /pitch, liberada pelo mesmo motor de releases do registro: nove telas, uma ideia por tela, setas do teclado, notas do apresentador e a memória de cálculo real dentro do slide da demonstração.',
      'A régua oficial chegou: a Portaria Conjunta nº 001/2024, publicada no Diário Oficial de 21/09/2024, foi transcrita para o repositório e comparada com o motor. Ela confirma o modelo e corrige dois pontos.',
      'PDF e capturas gerados a partir da própria rota, na identidade do site. O PDF é baixável pelo próprio deck, para o caso de a sala não ter rede.',
      'O briefing oficial do Kick-off chegou na véspera, com sete critérios de avaliação e uma estrutura mínima de oito seções para o site. A auditoria contra ele achou três peças que não existiam em lugar nenhum: objetivo geral e específicos, a matriz CSD e os wireframes de baixa fidelidade. As três foram produzidas nesta semana e estão nos documentos abaixo, com a data verdadeira.',
      'O deck cresceu de nove para dezessete slides e de 4:55 para 9:00, dentro dos dez minutos que o professor liberou. Os slides novos cobrem exatamente os critérios que não apareciam: objetivos, as fontes da pesquisa, a matriz CSD, benchmarking com SWOT, as técnicas de ideação, a justificativa da escolha, os wireframes e o cronograma com responsável.',
      'O site ganhou o índice das oito seções no topo, a biblioteca com todos os documentos publicados e o cronograma das 18 semanas com estado e responsável, que até aqui só existia atrás da senha do painel.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        decisao: 'Apresentar direto do site, não de um arquivo de slides.',
        porque:
          'O pitch é conteúdo do projeto como qualquer outro: entra no Git, passa pelo release e pelo teste de vazamento, e a banca acessa depois pelo mesmo endereço. O PDF é a reserva, não o original.',
      },
      {
        decisao: 'Mostrar a memória de cálculo ao vivo, e não uma imagem dela.',
        porque:
          'É o argumento do projeto contra a planilha; ver o número se explicar sozinho vale mais que ouvir sobre isso. A memória é renderizada no servidor junto com o slide, então não há serviço externo que possa cair no meio: a reserva contra sala sem rede é o PDF, que o próprio deck baixa.',
      },
      {
        decisao: 'Dividir a apresentação por bloco do roteiro, não por quem construiu o quê.',
        porque:
          'A diretriz pede fala distribuída; a equipe construiu tudo em conjunto, e o pitch é da equipe. Cada bloco tem uma voz para a fala ter ritmo, e as perguntas qualquer um responde.',
      },
      {
        decisao: 'A portaria entra no repositório; a planilha anonimizada que veio junto, não.',
        porque:
          'A portaria é ato público. A planilha tem gente, mesmo com o nome trocado, e o repositório é público: dado real da SESAU ali é irreversível. Ela fica como referência privada da equipe para validar a régua.',
      },
      {
        decisao: 'Abrir pelo problema, não pela solução.',
        porque: 'A relevância do case é o que sustenta o projeto; a tecnologia é consequência.',
      },
      {
        decisao: 'Crescer o deck em vez de cortar, usando os dez minutos liberados.',
        porque:
          'O briefing cobra sete critérios, e três deles não apareciam em slide nenhum na versão de 4:55. Com a permissão dos dez minutos, cobrir os sete custa menos que escolher quais perder. Ficou um minuto de margem: ensaio que fecha no limite estoura no dia.',
      },
      {
        decisao: 'Datar a matriz CSD e os wireframes nesta semana, e dizer isso no documento.',
        porque:
          'Os dois artefatos não existiam. Escrevê-los como se fossem de agosto deixaria o registro mais bonito e menos verdadeiro, e o site inteiro vale pelo que ele registra. A Semana 3 prometeu telas em papel e não publicou: o documento dos wireframes reconhece isso em vez de esconder.',
      },
      {
        decisao: 'O índice das oito seções mora na página, não no cabeçalho.',
        porque:
          'O cabeçalho foi desenhado para três destinos e estoura em 360px com oito. O índice na página também serve de ordem de leitura para quem avalia, coisa que um menu não faz.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Ensaio cronometrado com os seis integrantes ainda não realizado. A rota /pitch mostra o tempo de cada slide nas notas para isso.',
      'O motor ainda calcula pela régua deduzida na reunião de 22/08, não pela portaria: a média das notas dos subindicadores e a redistribuição de peso do art. 8º entram como regra versão 3 na Semana 5.',
      'O benchmarking não nomeia concorrentes: as cinco referências são categorias de ferramenta, não produtos identificados. Nomeá-las exige um levantamento que não coube nesta semana.',
      'A dinâmica real das três técnicas de ideação continua sem registro em foto ou artefato: o que está publicado é o roteiro previsto, e o checklist foi corrigido para dizer isso.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'Primeira versão do roteiro passava de 7 minutos. O corte foi tirar arquitetura do pitch e deixá-la para a arguição.',
      },
      {
        origem: 'cliente',
        texto:
          'O órgão enviou a portaria que regulamenta a gratificação e uma planilha anonimizada de um ciclo real, para a equipe conferir a régua. Só a portaria entra no repositório.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Ensaiar com cronômetro em /pitch e ajustar os blocos que estourarem.',
      'Preparar as respostas das perguntas prováveis da banca, listadas no documento abaixo.',
      'Entrar na Semana 5 com a régua oficial carregada no motor como regra versão 3, e com o diagrama de arquitetura pronto.',
      'Subir o PDF da apresentação para a pasta da equipe no Drive e ligar o link no site, que é o último item do checklist do professor ainda em aberto.',
      'Levar à secretaria as cinco dúvidas da matriz CSD, a começar pela redistribuição de peso do art. 8º.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao: 'Fala: capa, o problema, os objetivos e o fechamento.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Fala: as fontes da pesquisa, quem sofre com o problema e a matriz CSD.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Fala: as técnicas de ideação, por que a ideia venceu e os wireframes.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Fala: a demonstração ao vivo e a regra guardada como dado.',
      },
      { integrante: 'rafael', contribuicao: 'Fala: os dados, os modelos e os riscos.' },
      {
        integrante: 'fernando',
        contribuicao: 'Fala: o roteiro, o benchmarking com a SWOT e o cronograma.',
      },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Os slides do pitch, no site', url: '/pitch' },
      { tipo: 'documento', rotulo: 'A régua oficial', url: '#doc-ko-regua-oficial' },
      { tipo: 'documento', rotulo: 'Roteiro do pitch', url: '#doc-ko-roteiro-pitch' },
      { tipo: 'documento', rotulo: 'Objetivo geral e específicos', url: '#doc-ko-objetivos' },
      { tipo: 'documento', rotulo: 'Matriz CSD', url: '#doc-ko-csd' },
      { tipo: 'prototipo', rotulo: 'Wireframes de baixa fidelidade', url: '#doc-ko-wireframes' },
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
    id: 'roteiro-pitch',
    titulo: `Roteiro do pitch: ${formatarTempo(DURACAO_PITCH_SEGUNDOS)}`,
    resumo: `os ${SLIDES.length} slides, com o tempo, quem fala e o que a tela mostra em cada um.`,
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Começa em', 'Slide', 'Quem fala', 'O que a tela mostra', 'Tempo']}
          linhas={SLIDES.map((slide, indice) => [
            formatarTempo(inicioDoSlide(indice)),
            `${slide.numero}. ${slide.titulo}`,
            integrantePorId(slide.quemFala).nome.split(' ')[0],
            slide.visual,
            formatarTempo(slide.segundos),
          ])}
        />
        <div className="mt-3">
          <Nota>
            Soma: {formatarTempo(DURACAO_PITCH_SEGUNDOS)}. A fala de cada slide está nas notas do
            apresentador, em /pitch, com a tecla n. Quem fala não opera: uma pessoa fica na
            tela o tempo todo, avançando com as setas. O deck baixa o PDF de reserva pelo
            próprio cabeçalho, para o caso de a sala não ter rede.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'regua-oficial',
    titulo: 'A régua oficial: Portaria Conjunta nº 001/2024',
    resumo:
      'o que a norma publicada confirma no modelo do Prumo, e os dois pontos em que ela o corrige.',
    Conteudo: () => (
      <>
        <p>
          Publicada no Diário Oficial do Recife nº 131, de 21/09/2024, com efeito desde
          01/09/2024. É o ato que detalha os indicadores e subindicadores do Decreto nº
          36.482/2023 e institui a Comissão de Avaliação de Metas. A transcrição está em{' '}
          <code>docs/portaria-001-2024.md</code>; abaixo, o que importa para o motor.
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
            colunas={['Tema', 'O motor hoje (regra v2)', 'A portaria', 'Estado']}
            linhas={[
              [
                'O que se preenche',
                'Subindicador: valor direto ou numerador e denominador',
                'Cada subindicador tem fórmula numerador ÷ denominador × 100, ou contagem direta',
                'Confirmado',
              ],
              [
                'Régua por tipo de unidade',
                'Aplicabilidade tipo × indicador → meta e peso, na regra versionada',
                'O Indicador 4 muda inteiro por tipo (USF, CAPS, UBT, UCIS, CECON, MAC) e os pesos mudam por função',
                'Confirmado',
              ],
              [
                'Nota do distrito',
                'Média simples das unidades',
                'Média das notas das unidades, em todos os indicadores distritais',
                'Confirmado',
              ],
              [
                'Composição do indicador',
                'Média dos valores apurados, graduada depois contra a meta',
                'Média simples das notas dos subindicadores, cada uma já graduada; o Indicador 4 usa média ponderada',
                'Diverge: regra v3 na Semana 5',
              ],
              [
                'Indicador sem lançamento',
                'zera com aviso',
                'Art. 8º: desconsidera e redistribui o peso proporcionalmente',
                'Diverge: regra v3 na Semana 5',
              ],
              [
                'Quem homologa',
                'Coordenação da SEAB, no sistema',
                'A CAM, com apoio da SECOGE, quórum de 4 (arts. 5º e 6º)',
                'O perfil do sistema é operacional; a CAM homologa fora dele',
              ],
              [
                'Contestação',
                'Tela sem prazo',
                'Art. 9º: 10 dias corridos para recorrer, 5 dias úteis para responder',
                'Prazo entra na regra v3',
              ],
            ]}
          />
        </div>
        <div className="mt-4">
          <Lista
            itens={[
              'Fluxo do art. 7º: cada secretaria executiva coleta e envia à SECOGE até o dia 20; a CAM valida e publica até o último dia útil; a SEGTES pede a implantação na folha até o 6º dia útil do segundo mês.',
              'A comissão tem sete áreas: SECOGE, SEAB, SEAF, SEGTES, SERMAC, SEVS e SEPLAGTD, com titular e suplente cada. Os nomes ficaram fora do repositório de propósito.',
              'Cinco indicadores: registro de medicamentos e MMH; gestão do trabalho; satisfação do usuário; desempenho das unidades; e vigilância em saúde, este só para funções distritais. Pesos de 20%, 20%, 20%, 40% e 30%, variando por função.',
            ]}
          />
        </div>
        <div className="mt-3">
          <Nota>
            A demonstração do pitch usa a unidade sintética {DEMO_PITCH.unidadeId} na regra
            v2, a deduzida em 22/08. A régua oficial vira a regra v3 na Semana 5, e o slide 7
            diz isso em voz alta.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'perguntas',
    titulo: 'Perguntas prováveis da banca',
    resumo: 'o que esperamos ouvir e a resposta que o repositório sustenta.',
    Conteudo: () => (
      <>
        <Lista
          itens={[
            '"Vocês já falaram com o cliente?" Sim. Reunião em 22/08 com a SECOGE, ata sintetizada na Semana 3; e em 05/09 o órgão enviou a portaria e uma planilha anonimizada. A validação formal da régua com a SEAB está marcada para o caminho até o SR1.',
            '"E se a portaria mudar?" Regra é dado versionado, não código. Cria-se uma versão nova; os meses já homologados continuam reproduzindo o resultado antigo, porque cada ciclo aponta para a versão que usou. A própria chegada da portaria oficial é o primeiro caso real disso: vira a regra v3.',
            '"Qual o diferencial em relação à planilha?" A memória de cálculo: cada número responde de onde veio, com o subindicador, a meta e o peso que o geraram. E a trilha: toda escrita tem autor, data, antes e depois. Nenhuma ferramenta pronta do benchmarking da Semana 2 versiona regra normativa nem produz memória de cálculo.',
            '"Onde entra o machine learning, e por que ele não decide?" Fora do cálculo. Os modelos treinam offline e publicam sinais na tela de analytics, cada um com a linha de base ao lado; o classificador de meta perde para o palpite majoritário e isso está escrito. A portaria é determinística; o modelo diz onde olhar, não quanto alguém recebe.',
            '"Por que o banco está desligado?" Porque o MVP não precisa dele para provar a tese, e ligar um banco a um repositório público com dado de servidor seria o risco errado na hora errada. O schema PostgreSQL com RLS e gatilhos está escrito e testado contra um banco real; a camada de dados isola as telas para ele entrar sem reescrever tela.',
            '"Como garantem que não há dado real?" A base é gerada por script com semente fixa, e há teste que falha se um CPF, e-mail ou telefone aparecer nela. A planilha anonimizada do cliente não entrou no repositório, e nenhum dado real entra em prompt de IA.',
          ]}
        />
        <div className="mt-3">
          <Nota>
            O Kick-off tem peso formativo na matriz: a nota não vem daqui, mas o direcionamento
            que sai da arguição orienta tudo até o SR1.
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
          disciplina, com data de marco, mas não tinha o objetivo do PRODUTO dito com todas as
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
            Não confundir com os Objetivos SMART da Semana 2: aqueles são metas de entrega da
            disciplina (ter o motor coberto por testes até a Semana 6, coletar feedback na
            Semana 11). Estes dizem o que o sistema tem de fazer. Os dois convivem, e nenhum
            substitui o outro.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'csd',
    titulo: 'Matriz CSD: certezas, suposições e dúvidas',
    resumo: 'o que sabemos com fonte, o que assumimos para poder andar, e o que falta perguntar.',
    Conteudo: () => (
      <>
        <p>
          Montada na semana do Kick-off, e não em agosto. O material estava todo escrito, só que
          espalhado: as suposições moravam em comentário de código e numa nota da Semana 3, as
          certezas na portaria transcrita, e as dúvidas na ata da reunião de 22/08. O que faltava
          era a matriz.
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
            Toda linha da primeira coluna tem origem verificável, e é isso que separa uma matriz
            CSD de uma lista de opiniões: certeza sem fonte é chute com voz firme. As suposições
            estão declaradas também dentro do código, onde elas agem.
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
          prometeu as primeiras telas em papel como produto do Crazy 8&rsquo;s, e o artefato não
          chegou a ser publicado; em vez de datá-lo em agosto, ele nasce aqui, com a data certa.
        </p>
        <p>
          Não há uma palavra dentro dos desenhos, e isso é de propósito: wireframe de baixa
          fidelidade usa barra cinza no lugar de texto para a conversa ser sobre onde cada coisa
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
            A tela pronta que saiu do segundo desenho está em <code>/sistema</code> e dentro do
            slide da demonstração, rodando com dados de teste. O par entre o desenho e a tela é a
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
          O briefing do Kick-off lista sete critérios e pede que todo o material esteja
          organizado no site da equipe. Esta tabela existe para quem avalia não ter que procurar:
          cada linha aponta para o documento ou a seção que sustenta aquele critério.
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
            O que o briefing chama de Google Site é, aqui, este próprio site: ele é versionado no
            Git, tem release por ciclo e é o artefato avaliado. A apresentação fica em /pitch, e o
            PDF dela é baixável pelo próprio deck.
          </Nota>
        </div>
      </>
    ),
  },
] as const satisfies readonly Documento[]
