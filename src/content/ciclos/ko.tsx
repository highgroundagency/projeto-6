import { Citacao, Lista, Nota, Tabela } from '@/components/conteudo'
import { integrantePorId } from '@/content/equipe'
import {
  DEMO_PITCH,
  DURACAO_PITCH_SEGUNDOS,
  SLIDES,
  formatarTempo,
  inicioDoSlide,
} from '@/content/pitch'
import { URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 'ko',
  marcador: 'PRUMO-MARCADOR-CICLO-ko',

  objetivo: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo:
      'Apresentar em 5 minutos o problema, sua relevância, a ideia priorizada e o direcionamento do projeto, com fala distribuída entre os seis, direto do site.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Roteiro conferido linha a linha contra o repositório: quem consolida e homologa, os quatro papéis, as oito telas, os estados do mês e cada número dito no palco. As correções estão na tabela do documento abaixo.',
      'Os slides viraram uma rota do próprio site, /pitch, liberada pelo mesmo motor de releases do registro: nove telas, uma ideia por tela, setas do teclado, notas do apresentador e a memória de cálculo real dentro do slide da demonstração.',
      'A régua oficial chegou: a Portaria Conjunta nº 001/2024, publicada no Diário Oficial de 21/09/2024, foi transcrita para o repositório e comparada com o motor. Ela confirma o modelo e corrige dois pontos.',
      'PDF e capturas gerados a partir da própria rota, na identidade do site, versionados para o caso de a rede falhar no dia.',
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
        decisao: 'Mostrar a memória de cálculo ao vivo, com captura estática de reserva no mesmo slide.',
        porque:
          'É o argumento do projeto contra a planilha; ver o número se explicar sozinho vale mais que ouvir sobre isso. A captura existe para a demonstração falhar sem parar o roteiro.',
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
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Ensaio cronometrado com os seis integrantes ainda não realizado. A rota /pitch mostra o tempo de cada slide nas notas para isso.',
      'O motor ainda calcula pela régua deduzida na reunião de 22/08, não pela portaria: a média das notas dos subindicadores e a redistribuição de peso do art. 8º entram como regra versão 3 na Semana 5.',
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
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Fala: capa, o problema e o fechamento.' },
      { integrante: 'matheus', contribuicao: 'Fala: quem sofre com o problema.' },
      { integrante: 'joao-pedro', contribuicao: 'Fala: a ideia priorizada, com a demonstração ao vivo.' },
      { integrante: 'joao-henrique', contribuicao: 'Fala: como funciona, regra como dado.' },
      { integrante: 'rafael', contribuicao: 'Fala: os dados e o que os modelos respondem.' },
      { integrante: 'fernando', contribuicao: 'Fala: riscos, transparência e o caminho até o SR1.' },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Os slides do pitch, no site', url: '/pitch' },
      { tipo: 'documento', rotulo: 'A régua oficial', url: '#doc-ko-regua-oficial' },
      { tipo: 'documento', rotulo: 'Roteiro do pitch', url: '#doc-ko-roteiro-pitch' },
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
    titulo: 'Roteiro do pitch: 4 minutos e 55 segundos',
    resumo: 'os nove slides, com o tempo, quem fala e o que a tela mostra em cada um.',
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
            tela o tempo todo, avançando com as setas. Se a demonstração do slide 4 falhar, a
            captura estática está no próprio slide.
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
] as const satisfies readonly Documento[]
