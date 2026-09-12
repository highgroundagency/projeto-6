import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/**
 * SR1 — primeira apresentação de resultados. PLANEJAMENTO: ver a nota em s5.tsx.
 *
 * O bloco `feedback` fica vazio DE PROPÓSITO e é o único que não pode ser
 * preenchido antes da hora: o retorno da banca é fala de terceiro, e escrever
 * por ela seria fabricar evidência. Ele é preenchido no dia, com origem
 * declarada.
 */
export const registro = {
  ciclo: 'sr1',
  marcador: 'PRUMO-MARCADOR-CICLO-sr1',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Mostrar à banca o problema, a pesquisa e o protótipo navegável. Sair da apresentação com o retorno da banca anotado e em ordem de prioridade.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Apresentamos o pitch de cinco minutos.',
      'Fizemos a demonstração ao vivo de um caminho do sistema. Primeiro o lançamento, depois o cálculo, por fim a memória de cálculo (o passo a passo da conta).',
      'Enviamos o Pacote de entrega do SR1, conforme a matriz de evidências.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Demonstrar ao vivo, sem vídeo gravado.',
        porque:
          'Um vídeo gravado esconde travamentos e não prova que o sistema roda. Se cair ao vivo, cai na frente de todo mundo, e isso também é informação.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Anotar neste bloco de feedback o que a banca disse, e de quem veio.',
      'Reordenar o backlog, a lista de tarefas das quatro sprints, pelo que a banca apontou.',
      'Marcar para a Semana 11 a conversa de validação com a Comissão de Avaliação de Metas (CAM).',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Apresentou o pitch e respondeu às perguntas.' },
      { integrante: 'joao-pedro', contribuicao: 'Demonstrou o protótipo ao vivo.' },
      { integrante: 'matheus', contribuicao: 'Apresentou a pesquisa e as personas.' },
      { integrante: 'kerry', contribuicao: 'Ajudou a anotar o retorno da banca.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Pacote de entrega do SR1', url: '#doc-sr1-pacote' },
      {
        tipo: 'documento',
        rotulo: 'Direito: base legal e dados pessoais',
        url: '#doc-sr1-direito-base-legal',
      },
      { tipo: 'prototipo', rotulo: 'Protótipo apresentado', url: '/sistema' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'direito-base-legal',
    titulo: 'Direito: base legal e dados pessoais',
    resumo: 'que dado o sistema usaria, de quem, e com base em qual artigo da lgpd.',
    Conteudo: () => (
      <>
        <Secao
          titulo="Base legal para usar os dados"
          descricao="A LGPD permite usar dados pessoais para executar política pública prevista em lei e regulamento. É o art. 7º, III da LGPD."
        >
          <Lista
            itens={[
              'A gratificação foi criada por portaria. Sem usar esses dados, não há como executá-la.',
              'O sistema não pede consentimento ao servidor, e nem deveria. Numa relação de trabalho desigual, o consentimento seria frágil. E se o servidor recusasse, não daria para respeitar a recusa sem impedir a política.',
              'Quem responde pelos dados (a controladora) é a Secretaria de Saúde do Recife. O encarregado (a pessoa de contato sobre dados) é indicado pela Prefeitura. O sistema só mostra o canal para falar com ele.',
            ]}
          />
        </Secao>

        <Secao
          titulo="Quais dados o sistema guardaria"
          descricao="O que existiria no sistema real, de quem seria cada dado e para que serviria."
        >
          <Tabela
            colunas={['Categoria', 'Titular', 'Necessário para']}
            linhas={[
              [
                'Quem é o servidor (nome, matrícula, cargo, lotação)',
                'Servidor avaliado',
                'Ligar o resultado à pessoa certa',
              ],
              [
                'Onde o servidor trabalha (área, período de exercício)',
                'Servidor avaliado',
                'Saber quais indicadores valem para ele',
              ],
              [
                'Desempenho (a nota, chamada de score, a faixa, a memória de cálculo e o histórico)',
                'Servidor avaliado',
                'Calcular a gratificação e explicar o resultado',
              ],
              [
                'Quem fez o lançamento (quem informou, quando)',
                'Servidor da área técnica',
                'Ter o histórico de quem informou, para poder responsabilizar',
              ],
              [
                'Contestação (motivo, resposta da comissão)',
                'Servidor avaliado',
                'Garantir o direito de defesa (devido processo)',
              ],
            ]}
          />
          <Nota>
            O sistema não guarda dados sensíveis, os do art. 5º, II. Também não guarda dados de
            pacientes, dados bancários nem valores de folha. Ele só calcula o percentual devido.
            A folha de pagamento é outro sistema, e deixamos isso fora do escopo de forma
            declarada.
          </Nota>
        </Secao>

        <Secao titulo="No MVP, nada disso existe">
          <Lista
            itens={[
              'A base de dados é 100% sintética, ou seja, inventada por programa. Ela usa uma semente fixa, por isso sai sempre igual. Nenhum servidor real está no repositório.',
              'Um teste automático confere a base. Ele falha se aparecer CPF, e-mail, telefone ou matrícula.',
              'A tabela acima descreve o que existiria no sistema real. Assim, a análise jurídica não precisa esperar o dado real chegar.',
            ]}
          />
        </Secao>
      </>
    ),
  },
  {
    id: 'pacote',
    titulo: 'Pacote de entrega do SR1',
    resumo: 'o que entregamos e onde cada peça está no site.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Peça', 'Onde está']}
          linhas={[
            ['Problema, pergunta e cliente', 'Página inicial'],
            ['Personas e mapa de empatia', 'Registro, Semana 2'],
            ['Benchmarking e SWOT', 'Registro, Semana 2'],
            ['Proposta, escopo e backlog', 'Registro, Semana 4'],
            ['Arquitetura e modelo de dados', 'Registro, Semana 5'],
            ['Protótipo navegável', 'Sistema'],
            ['Registro semanal', 'Página inicial, seção Registro semanal'],
            ['Uso de IA', 'Transparência no uso de IA'],
          ]}
        />
        <Lista
          itens={[
            'Nenhuma peça é PDF. Tudo é conteúdo do site, guardado no Git com histórico de versões.',
            'O que ainda não foi aprovado leva o selo de rascunho na própria página.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
