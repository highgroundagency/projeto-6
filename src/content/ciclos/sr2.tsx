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
      'Mostrar o sistema (MVP) funcionando e contar o caminho do semestre. Apresentar as três lentes da disciplina, já juntas num só produto.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Demonstramos o ciclo completo, com as cinco etapas: lançamento, apuração, memória de cálculo, auditoria e contestação.',
      'Entregamos o pacote final. Ele segue a matriz de evidências, a lista do que a disciplina pede.',
      'Publicamos o comparativo entre o que planejamos e o que fizemos. Cada desvio está explicado.',
      'O registro das doze semanas está completo e validado.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'A apresentação final mostra também o que não foi feito.',
        porque:
          'Dizer o que fica para depois mostra que escolhemos prioridades de propósito. Esconder o que faltou seria o contrário disso.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Escrever neste bloco de feedback o retorno final da banca, dizendo de quem veio.',
      'Arquivar o repositório com a documentação na versão final.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Faz a narração e fecha o pacote final.' },
      { integrante: 'joao-pedro', contribuicao: 'Demonstra o ciclo completo do sistema.' },
      { integrante: 'rafael', contribuicao: 'Apresenta a lente de machine learning.' },
      {
        integrante: 'fernando',
        contribuicao: 'Lente de direito digital e documentação final.',
      },
      { integrante: 'kerry', contribuicao: 'Ajuda a reunir as peças do pacote final.' },
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
            ['MVP funcionando', 'Sistema: oito telas, com dados de teste gerados por programa'],
            ['Registro das doze semanas', 'Página inicial, seção Registro semanal'],
            ['Documentos de pesquisa e proposta', 'Dentro de cada semana, numa sanfona que abre ao clicar'],
            ['Arquitetura e modelo de dados', 'Registro, Semana 5, e docs/arquitetura.md'],
            ['Análise de segurança', 'docs/seguranca.md: STRIDE e OWASP Top 10'],
            ['Análise de privacidade', 'docs/privacidade.md: LGPD e Privacy by Design'],
            ['Decisões de arquitetura', 'docs/decisoes.md: cada decisão (ADR) com o que se perdeu em troca'],
            ['Uso de IA', 'Transparência no uso de IA'],
            ['Planejado × realizado', 'Registro, Semana 12'],
          ]}
        />
        <Lista
          itens={[
            'Nenhuma peça é PDF. Tudo é conteúdo do site, guardado no Git com histórico de versões.',
            'Nenhuma peça usa dado real de pessoa ou da SESAU.',
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
              'Um problema real, bem delimitado. Pesquisa com o cliente, o sistema (MVP) funcionando e o registro semanal.',
              'Página inicial e sistema',
            ],
            [
              'Machine learning',
              'Um gerador de dados de teste, os modelos treinados e a tela de analytics, que explica o método usado.',
              'Sistema → Analytics',
            ],
            [
              'Direito digital',
              'A base legal para tratar os dados. O Privacy by Design, apontando onde está no código. Os direitos dos titulares, as pessoas donas dos dados.',
              'docs/privacidade.md',
            ],
          ]}
        />
        <Lista
          itens={[
            'As três lentes olham para o mesmo produto. Não são três trabalhos costurados um no outro.',
            'A lente de machine learning (ML) não decide pagamento. A regra da portaria é determinística, dá sempre o mesmo resultado para os mesmos números. E continua sendo assim.',
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
