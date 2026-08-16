import { Lista, Tabela } from '@/components/conteudo'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** SR2 — entrega final. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 'sr2',
  marcador: 'PRUMO-MARCADOR-CICLO-sr2',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Apresentar o MVP funcionando, a trajetória do semestre e as três lentes da disciplina consolidadas.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Demonstração do ciclo completo: lançamento, apuração, memória de cálculo, auditoria e contestação.',
      'Pacote final submetido conforme a matriz de evidências.',
      'Comparativo planejado × realizado publicado, com os desvios explicados.',
      'Registro semanal completo das doze semanas, validado.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A apresentação final mostra também o que não foi feito.',
        porque:
          'Trabalho futuro declarado é sinal de que houve priorização consciente; esconder lacuna é o contrário disso.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Transcrever o retorno final da banca neste bloco de feedback, com origem.',
      'Arquivar o repositório com a documentação em versão final.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Narração e fechamento do pacote final.' },
      { integrante: 'joao-pedro', contribuicao: 'Demonstração do ciclo completo.' },
      { integrante: 'rafael', contribuicao: 'Apresentação da lente de machine learning.' },
      {
        integrante: 'fernando',
        contribuicao: 'Lente de direito digital e documentação final.',
      },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Pacote final do SR2', url: '#doc-sr2-pacote' },
      { tipo: 'documento', rotulo: 'As três lentes', url: '#doc-sr2-lentes' },
      { tipo: 'prototipo', rotulo: 'Sistema funcionando', url: '/sistema' },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'pacote',
    titulo: 'Pacote final do SR2',
    resumo: 'tudo o que foi entregue e onde está no site.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Peça', 'Onde está']}
          linhas={[
            ['MVP funcionando', 'Sistema — oito telas com dados sintéticos'],
            ['Registro das doze semanas', 'Página inicial, seção Registro semanal'],
            ['Documentos de pesquisa e proposta', 'Dentro de cada semana, em sanfona'],
            ['Arquitetura e modelo de dados', 'Registro, Semana 5, e docs/arquitetura.md'],
            ['Análise de segurança', 'docs/seguranca.md — STRIDE e OWASP Top 10'],
            ['Análise de privacidade', 'docs/privacidade.md — LGPD e Privacy by Design'],
            ['Decisões de arquitetura', 'docs/decisoes.md — ADRs com o que se perdeu em troca'],
            ['Uso de IA', 'Transparência no uso de IA'],
            ['Planejado × realizado', 'Registro, Semana 12'],
          ]}
        />
        <Lista
          itens={[
            'Nenhuma peça é PDF: tudo é conteúdo do site, versionado no Git.',
            'Nenhum dado real de pessoa ou da SESAU em nenhuma delas.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'lentes',
    titulo: 'As três lentes',
    resumo: 'o que projeto, machine learning e direito digital entregaram neste produto.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Lente', 'O que entregou', 'Onde se vê']}
          linhas={[
            [
              'Projeto',
              'Problema real recortado, pesquisa com o cliente, MVP funcionando e registro semanal',
              'Página inicial e sistema',
            ],
            [
              'Machine learning',
              'Gerador sintético, modelos treinados e a tela de analytics com método declarado',
              'Sistema → Analytics',
            ],
            [
              'Direito digital',
              'Base legal do tratamento, Privacy by Design apontando o código, direitos dos titulares',
              'docs/privacidade.md',
            ],
          ]}
        />
        <Lista
          itens={[
            'As três lentes atravessam o mesmo produto — não são três trabalhos costurados.',
            'A lente de ML não decide pagamento: a regra da portaria é determinística e continua sendo.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
