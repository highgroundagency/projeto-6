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
      'Entender o problema a fundo: quem sofre com ele, como ele é hoje e o que já existe no mercado.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Pesquisa estruturada em três frentes: processo atual, entes públicos comparáveis e ferramentas de gestão de metas.',
      'Três personas construídas a partir dos papéis descritos no case.',
      'Mapa de empatia da analista da CAM, que é quem opera a planilha hoje.',
      'Benchmarking com entes públicos e duas ferramentas de OKR, separando o que serve do que não serve para órgão público.',
      'SWOT do projeto e objetivos SMART escritos.',
      'Cronograma inicial fechado nos 18 ciclos do semestre.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        decisao:
          'Tratar a memória de cálculo como funcionalidade central, não como relatório extra.',
        porque:
          'É o que responde "de onde veio este número?", a pergunta que a planilha não responde.',
      },
      {
        decisao:
          'Indicadores e regras serão parametrizáveis pela interface, não escritos em código.',
        porque:
          'A portaria muda; se a regra virar código, cada mudança de portaria vira release de software.',
      },
      {
        decisao: 'Versionar regra de pontuação em vez de editá-la.',
        porque:
          'Um ciclo já homologado precisa continuar reproduzindo o mesmo resultado para sempre.',
      },
      {
        decisao: 'Escolher a analista da CAM como persona primária.',
        porque:
          'É quem carrega o processo hoje; se a solução não servir para ela, não serve para ninguém.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Ainda sem acesso ao texto da portaria vigente: os indicadores usados no MVP seguem fictícios e verossímeis até lá.',
      'Contato com a CAM ainda não confirmado para a entrevista de validação.',
    ],
  },

  feedback: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'O benchmarking mostrou que ferramenta de OKR resolve acompanhamento, não cálculo normativo com efeito financeiro. Isso reforça construir em vez de adotar.',
      },
    ],
  },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      'Rodar Brainwriting, Brainstorming e Crazy 8’s com os seis integrantes.',
      'Levantar de 6 a 8 alternativas de solução e classificá-las por impacto, esforço e aderência.',
      'Escolher a ideia a desenvolver e registrar a justificativa.',
    ],
  },

  responsaveis: {
    selo: 'validado',
    validadoPor: 'fernando',
    conteudo: [
      {
        integrante: 'matheus',
        contribuicao: 'Conduziu a pesquisa, as personas e o mapa de empatia.',
      },
      {
        integrante: 'gabriel',
        contribuicao: 'Escreveu os objetivos SMART e consolidou a SWOT.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Fez o benchmarking e o recorte de LGPD do problema.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Modelou o processo atual como fluxo, do lançamento à homologação.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Traduziu as personas em necessidades de interface.',
      },
      {
        integrante: 'rafael',
        contribuicao: 'Mapeou quais perguntas do problema são respondíveis por modelo.',
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
    resumo: 'como a gratificação é calculada antes do prumo existir.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Etapa', 'Quem faz', 'Como é hoje', 'Onde quebra']}
          linhas={[
            [
              'Coleta',
              'Áreas técnicas',
              'Cada área envia seus números por planilha ou e-mail',
              'Formato livre, sem validação na origem',
            ],
            [
              'Consolidação',
              'CAM',
              'Cópia manual para uma planilha mestre',
              'Erro de digitação e de fórmula passa despercebido',
            ],
            [
              'Cálculo',
              'CAM',
              'Fórmulas encadeadas na própria planilha',
              'Regra da portaria fica implícita na célula',
            ],
            [
              'Conferência',
              'CAM',
              'Revisão por leitura, sem trilha',
              'Não há como refazer o caminho de um número',
            ],
            [
              'Divulgação',
              'CAM',
              'Resultado enviado ao gestor avaliado',
              'Contestação vira troca de e-mails',
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
          descricao="Personagens fictícios construídos a partir dos papéis descritos no case. Nenhum dado real de pessoa foi usado."
        >
          <Grade colunas={3}>
            <Cartao titulo="Analista da CAM" etiqueta="Primária">
              <p>
                Opera a planilha mestre há três ciclos. Conhece as regras de cor e é procurada
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
                Responde por informar de 4 a 8 indicadores da própria área, sempre em cima do
                prazo, entre outras dez prioridades.
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
                Recebe a gratificação variável e vê apenas o resultado final, sem o caminho que
                levou até ele.
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
          descricao="A pessoa que carrega o processo hoje."
        >
          <ListaDefinicao itens={MAPA_DE_EMPATIA.map((i) => ({ ...i }))} />
        </Secao>
      </>
    ),
  },
  {
    id: 'benchmarking',
    titulo: 'Benchmarking',
    resumo: 'o que as referências resolvem e o que não serve para este caso.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Referência', 'O que serve', 'O que não serve']}
          linhas={BENCHMARKING.map((r) => [r.referencia, r.serve, r.naoServe])}
        />
        <div className="mt-3">
          <Nota>
            Conclusão do benchmarking: {CONCLUSAO_BENCHMARKING} Essa combinação é o núcleo do
            problema, e é por isso que a decisão foi construir.
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
            'Entregar, até o SR1 (03/10), um protótipo navegável com as telas de lançamento, cálculo e memória de cálculo, validado internamente pelos seis integrantes.',
            'Ter o motor de cálculo coberto por testes automatizados nos casos-limite (faixas de fronteira, arredondamento, indicador sem lançamento e troca de versão de regra) até a Semana 6.',
            'Demonstrar, até a Semana 9, o ciclo completo de lançamento a homologação com trilha de auditoria imutável, usando exclusivamente dados sintéticos.',
            'Coletar, na Semana 11, feedback estruturado de pelo menos um integrante da CAM por entrevista semiestruturada e questionário, e registrar os ajustes decorrentes.',
            'Chegar ao SR2 (05/12) com documentação técnica, análise de segurança e de privacidade publicadas junto ao MVP.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
