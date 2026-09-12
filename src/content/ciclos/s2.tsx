import {
  Cartao,
  Grade,
  Lista,
  ListaDefinicao,
  Nota,
  Quadro,
  Secao,
  Tabela,
} from '@/components/conteudo'
import {
  BENCHMARKING,
  CONCLUSAO_BENCHMARKING,
  MAPA_DE_EMPATIA,
  SWOT,
} from '@/content/analises'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's2',
  marcador: 'PRUMO-MARCADOR-CICLO-s2',

  objetivo: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo:
      'Entender o problema a fundo: quem sofre com ele, como ele funciona hoje e o que já existe no mercado.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Fizemos a pesquisa em três frentes. Olhamos o processo atual, outros entes públicos (governos e órgãos parecidos) e ferramentas de gestão de metas.',
      'Criamos três personas: personagens fictícios que representam quem usa o sistema. Elas seguem os papéis descritos no case.',
      'Montamos o mapa de empatia da analista da CAM. É ela quem opera a planilha hoje.',
      'Comparamos o que já existe (benchmarking): entes públicos e duas ferramentas de OKR. Separamos o que serve do que não serve para órgão público.',
      'Escrevemos a SWOT do projeto: forças, fraquezas, oportunidades e ameaças. Escrevemos também os objetivos SMART.',
      'Fechamos o cronograma inicial com os 18 ciclos do semestre.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao: 'Memória de cálculo é funcionalidade central, não relatório extra.',
        porque:
          'Ela mostra o caminho de cada número. É o que responde "de onde veio este número?", a pergunta que a planilha não responde.',
      },
      {
        decisao: 'Indicadores e regras se ajustam pela tela, não no código.',
        porque:
          'A portaria muda. Se a regra estivesse escrita no código, cada portaria nova exigiria uma nova versão do programa.',
      },
      {
        decisao: 'Regra de pontuação ganha versão nova em vez de ser editada.',
        porque:
          'Um ciclo já aprovado precisa continuar dando o mesmo resultado para sempre.',
      },
      {
        decisao: 'A analista da CAM é a persona primária.',
        porque:
          'É ela quem carrega o processo hoje. Se a solução não servir para ela, não serve para ninguém.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Ainda não temos o texto da portaria em vigor. Até lá, os indicadores do MVP seguem inventados, mas parecidos com os reais.',
      'Ainda não confirmamos o contato com a CAM para a entrevista de validação.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'O benchmarking mostrou que ferramenta de OKR serve para acompanhar metas. Ela não faz a conta definida na portaria, a que mexe com o pagamento das pessoas. Isso reforça a escolha: construir em vez de adotar uma ferramenta pronta.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Rodar as dinâmicas de Brainwriting, Brainstorming e Crazy 8’s com os seis integrantes.',
      'Levantar de 6 a 8 alternativas de solução. Classificar cada uma por impacto, esforço e aderência.',
      'Escolher a ideia que vamos desenvolver e registrar o porquê.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        integrante: 'matheus',
        contribuicao: 'Conduziu pesquisa, personas e mapa de empatia.',
      },
      {
        integrante: 'gabriel',
        contribuicao: 'Escreveu os objetivos SMART e montou a SWOT.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Fez o benchmarking e a análise de LGPD do problema.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Desenhou o processo atual como um fluxo, do lançamento à aprovação.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Traduziu as personas em necessidades de tela.',
      },
      {
        integrante: 'rafael',
        contribuicao: 'Mapeou quais perguntas do problema um modelo de aprendizado de máquina consegue responder.',
      },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        tipo: 'documento',
        rotulo: 'Personas e mapa de empatia',
        url: '#doc-s2-personas',
      },
      {
        tipo: 'documento',
        rotulo: 'Benchmarking',
        url: '#doc-s2-benchmarking',
      },
      { tipo: 'documento', rotulo: 'Análise SWOT', url: '#doc-s2-swot' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'processo-hoje',
    titulo: 'O processo hoje',
    resumo: 'como a gratificação é calculada hoje, antes do prumo existir.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Etapa', 'Quem faz', 'Como é hoje', 'Onde quebra']}
          linhas={[
            [
              'Coleta',
              'Áreas técnicas',
              'Cada área manda seus números por planilha ou e-mail',
              'Cada uma manda do seu jeito, e ninguém confere na origem',
            ],
            [
              'Consolidação',
              'CAM',
              'Cópia feita à mão para uma planilha principal',
              'Erro de digitação ou de fórmula passa sem ninguém ver',
            ],
            [
              'Cálculo',
              'CAM',
              'Fórmulas ligadas umas às outras, dentro da própria planilha',
              'A regra da portaria fica escondida dentro das células',
            ],
            [
              'Conferência',
              'CAM',
              'Alguém lê e revisa, sem histórico do que conferiu',
              'Não dá para refazer o caminho de um número',
            ],
            [
              'Divulgação',
              'CAM',
              'O resultado é enviado ao gestor avaliado',
              'Quem discorda entra numa troca de e-mails',
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: 'personas',
    titulo: 'Personas e mapa de empatia',
    resumo: 'três personagens fictícios e o mapa da analista que carrega o processo.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Personas"
          descricao="Personagens inventados a partir dos papéis descritos no case. Nenhum dado real de pessoa foi usado."
        >
          <Grade colunas={3}>
            <Cartao titulo="Analista da CAM" etiqueta="Primária">
              <p>
                Opera a planilha principal há três ciclos. Sabe as regras de cor. É procurada
                sempre que alguém contesta um resultado.
              </p>
              <p>
                <strong>Precisa:</strong> fechar o ciclo sem medo de ter errado uma fórmula.
              </p>
              <p>
                <strong>Teme:</strong> descobrir um erro depois do pagamento.
              </p>
            </Cartao>
            <Cartao titulo="Gestor de área técnica" etiqueta="Secundária">
              <p>
                Informa de 4 a 8 indicadores da própria área. Faz isso sempre em cima do prazo,
                no meio de outras dez prioridades.
              </p>
              <p>
                <strong>Precisa:</strong> saber exatamente o que informar e até quando.
              </p>
              <p>
                <strong>Teme:</strong> ser cobrado por um dado que ele já enviou.
              </p>
            </Cartao>
            <Cartao titulo="Coordenadora avaliada" etiqueta="Secundária">
              <p>
                Recebe a gratificação variável. Vê só o resultado final, sem o caminho que levou
                até ele.
              </p>
              <p>
                <strong>Precisa:</strong> entender por que o valor foi aquele.
              </p>
              <p>
                <strong>Teme:</strong> ser avaliada por dado que ela não pôde conferir.
              </p>
            </Cartao>
          </Grade>
        </Secao>

        <Secao
          titulo="Mapa de empatia: analista da CAM"
          descricao="A pessoa que carrega o processo hoje: o que ela diz, pensa, faz e sente, suas dores e seus ganhos."
        >
          <ListaDefinicao itens={MAPA_DE_EMPATIA.map((i) => ({ ...i }))} />
        </Secao>
      </>
    ),
  },
  {
    id: 'benchmarking',
    titulo: 'Benchmarking',
    resumo: 'o que cada referência resolve e o que não serve para o nosso caso.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Referência', 'O que serve', 'O que não serve']}
          linhas={BENCHMARKING.map((r) => [r.referencia, r.serve, r.naoServe])}
        />
        <div className="mt-3">
          <Nota>
            Conclusão do benchmarking: {CONCLUSAO_BENCHMARKING} Essas três coisas juntas são o
            centro do nosso problema. Por isso decidimos construir em vez de adotar uma
            ferramenta pronta.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'swot',
    titulo: 'Análise SWOT',
    resumo: 'forças, fraquezas, oportunidades e ameaças do projeto.',
    Conteudo: () => (
      <>
        <Quadro quadrantes={SWOT.map((q) => ({ titulo: q.titulo, itens: [...q.itens] }))} />
      </>
    ),
  },
  {
    id: 'objetivos',
    titulo: 'Objetivos SMART',
    resumo: 'cinco metas com prazo e critério de verificação.',
    Conteudo: () => (
      <>
        <Lista
          itens={[
            'Até o SR1 (03/10), entregar um protótipo navegável com as telas de lançamento, cálculo e memória de cálculo. Os seis integrantes conferem e aprovam o protótipo entre si.',
            'Até a Semana 6, ter o motor de cálculo (a parte que faz a conta) coberto por testes automáticos. Os testes cobrem os casos-limite, os de borda. São quatro: valor na fronteira entre faixas, arredondamento, indicador sem lançamento e troca de versão da regra.',
            'Até a Semana 9, mostrar o ciclo inteiro, do lançamento à aprovação. Com o histórico de quem mudou o quê, sem jeito de apagar, e só com dados inventados.',
            'Na Semana 11, colher feedback estruturado de pelo menos um integrante da CAM, por entrevista semiestruturada e questionário. Registrar os ajustes que vierem daí.',
            'Chegar ao SR2 (05/12) com o MVP publicado junto com a documentação técnica. Publicar também a análise de segurança e a de privacidade.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
