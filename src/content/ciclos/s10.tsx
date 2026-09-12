import { Nota, Tabela } from '@/components/conteudo'
import { URL_REPOSITORIO } from '@/content/produto'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/** Semana 10 — Sprint 4. PLANEJAMENTO: ver a nota em s5.tsx. */
export const registro = {
  ciclo: 's10',
  marcador: 'PRUMO-MARCADOR-CICLO-s10',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Fechar a Sprint 4. Aplicar as correções apontadas no SR1. Entregar a lente de aprendizado de máquina (ML) como funcionalidade do produto, com o método escrito ao lado do número.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Aplicamos as correções do retorno do SR1. Cada correção fica ligada ao apontamento que a originou.',
      'Fizemos a tela de análises (analytics). Ela mostra os resultados dos modelos e deixa o método à vista.',
      'Treinamos os modelos só sobre a base sintética, a base gerada por programa. Nenhum dado real entrou.',
      'Publicamos as métricas, as medidas de quanto cada modelo acerta, junto do resultado. Elas não ficaram escondidas.',
      'Escrevemos as limitações do modelo na própria tela, na linguagem de quem vai ler.',
      'Reordenamos o backlog, a lista de tarefas, depois das correções. O que sobrou vai para a validação ou fica anotado como trabalho futuro.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'O método fica ao lado do número, sempre.',
        porque:
          'Previsão sem método escrito é só opinião com cara de dado. Num cálculo de gratificação, isso é grave.',
      },
      {
        decisao: 'O modelo não decide nada: informa.',
        porque:
          'Nenhum resultado do modelo de ML entra na conta da gratificação. A regra é a portaria, e a mesma entrada dá sempre o mesmo resultado.',
      },
    ],
  },

  bloqueios: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Fazer a validação com a Comissão de Avaliação de Metas (CAM) na Semana 11.',
      'Levar o backlog atualizado para a validação: o que a CAM apontar passa na frente do que sobrou.',
      'Juntar as três lentes no pacote de entrega do SR2.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'rafael',
        contribuicao: 'Gerador de dados, cadernos (notebooks) e modelos.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Tela de análises (analytics) e exibição das métricas.',
      },
      { integrante: 'fernando', contribuicao: 'Revisão das limitações escritas na tela.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'dashboard', rotulo: 'Tela de análises (analytics)', url: '/sistema/analytics' },
      { tipo: 'documento', rotulo: 'Método e limitações', url: '#doc-s10-metodo' },
      { tipo: 'documento', rotulo: 'Os seis cadernos', url: '#doc-s10-cadernos' },
      { tipo: 'codigo', rotulo: 'Cadernos (notebooks) e modelos', url: URL_REPOSITORIO },
    ],
  },
} satisfies RegistroSemana

export const documentos = [
  {
    id: 'cadernos',
    titulo: 'Os seis cadernos e o resultado negativo',
    resumo:
      'o que cada caderno (notebook) faz, e por que um dos modelos fica publicado como fracasso.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Caderno', 'O que faz']}
          linhas={[
            [
              '01: EDA',
              'Exploração inicial dos dados. Mostra como o atingimento da meta se distribui por área. É aqui que aparece o achado que muda o projeto: quase nada bate a meta',
            ],
            [
              '02: Pré-processamento',
              'Prepara os dados. Cada dado de entrada (atributo) olha só para os meses anteriores (shift(1)). Treino e teste são separados no tempo, para o modelo nunca ver o futuro',
            ],
            [
              '03: Classificação',
              'Responde duas perguntas de sim ou não. "Vai bater a meta?", que fracassa. "Vai melhorar?", que funciona',
            ],
            [
              '04: Regressão',
              'Estima o atingimento esperado. Mostra também quanto cada dado de entrada (atributo) pesou na estimativa',
            ],
            [
              '05: Clustering',
              'Agrupa ÁREAS parecidas, nunca pessoas. A silhueta, a medida de quão bem os grupos se separam, fica publicada ao lado',
            ],
            [
              '06: Conclusões',
              'Compara os quatro modelos. Deixa escrito o limite que não se negocia',
            ],
          ]}
        />
        <Nota>
          O modelo de &ldquo;vai bater a meta&rdquo; NÃO acerta mais do que chutar sempre a
          resposta mais comum. E fica publicado assim na tela de análises. O caderno 01 já
          explicava o porquê: com pouquíssimos casos de &ldquo;sim&rdquo;, não sobra padrão para
          o modelo aprender. O modelo não é ruim. A pergunta é que está mal feita para esta
          base. Não escondemos o que falhou para mostrar só o que deu certo. Isso seria escolher
          a medida de acerto depois de ver o resultado.
        </Nota>
      </>
    ),
  },
  {
    id: 'metodo',
    titulo: 'Método e limitações',
    resumo: 'o que o modelo faz, sobre o que foi treinado e onde ele erra.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Aspecto', 'O que vale']}
          linhas={[
            [
              'Base',
              'Só a base sintética: gerada por programa e sempre igual (semente fixa). Nenhum dado real de pessoa ou da SESAU',
            ],
            [
              'Escopo',
              'Ajuda a ler a tendência de cada área. Não entra no cálculo da gratificação',
            ],
            [
              'Métricas',
              'As medidas de acerto ficam publicadas na própria tela, junto do resultado',
            ],
            [
              'Limitação principal',
              'A base sintética reproduz a regra que a gerou, e o modelo aprende essa regra de volta. Com dado real, o desempenho seria outro',
            ],
            [
              'O que não faz',
              'Não classifica pessoa. Não recomenda pagamento. Não substitui a portaria',
            ],
          ]}
        />
      </>
    ),
  },
] as const satisfies readonly Documento[]
