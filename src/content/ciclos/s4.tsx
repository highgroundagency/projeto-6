import { Lista, Quadro, Secao, Tabela } from '@/components/conteudo'
import type { RegistroSemana } from '@/lib/registro/tipos'

export const registro = {
  ciclo: 's4',
  marcador: 'PRUMO-MARCADOR-CICLO-s4',

  objetivo: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo:
      'Transformar a ideia escolhida em proposta com escopo delimitado, backlog priorizado e cronograma de execução.',
  },

  avancos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Proposta de solução escrita em uma página.',
      'Escopo dentro e fora definido, com o que fica explicitamente de fora.',
      'Backlog inicial em épicos e histórias de usuário, classificado por MoSCoW.',
      'Papéis confirmados e cronograma de execução amarrado aos marcos do semestre.',
    ],
  },

  decisoes: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        decisao: 'Folha de pagamento fica fora do escopo.',
        porque:
          'O sistema calcula e publica o resultado; integrar com folha exige acesso e homologação que o semestre não comporta.',
      },
      {
        decisao: 'Quatro perfis de acesso desde o protótipo: CAM, área técnica, gestor avaliado e auditoria.',
        porque:
          'O controle de acesso é parte do problema de confiabilidade, não um enfeite para depois.',
      },
      {
        decisao: 'Auditoria é append-only: nada se apaga.',
        porque:
          'Trilha que pode ser editada não serve de prova, e é isso que a planilha já não oferece.',
      },
      {
        decisao: 'Priorização por MoSCoW com o corte do SR1 nos "Must".',
        porque: 'Deixa explícito o que é entrega mínima e o que é desejável.',
      },
    ],
  },

  bloqueios: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: 'nenhum',
  },

  feedback: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        origem: 'equipe',
        texto:
          'O backlog nasceu grande demais para um semestre. O corte foi feito na revisão: 25 histórias, com os "Must" cabendo até o SR1.',
      },
    ],
  },

  proximosPassos: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      'Preparar o pitch de 5 minutos do Kick-off, com fala dividida entre os seis.',
      'Fechar o diagrama de arquitetura e o fluxo de dados para a Semana 5.',
    ],
  },

  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { integrante: 'gabriel', contribuicao: 'Escreveu a proposta e o backlog priorizado.' },
      { integrante: 'joao-henrique', contribuicao: 'Delimitou o escopo técnico e as fronteiras de integração.' },
      { integrante: 'joao-pedro', contribuicao: 'Converteu as histórias em fluxo de telas.' },
      { integrante: 'matheus', contribuicao: 'Amarrou cada história a uma dor levantada na pesquisa.' },
      { integrante: 'rafael', contribuicao: 'Especificou as histórias da frente de dados e ML.' },
      { integrante: 'fernando', contribuicao: 'Revisou o escopo sob a ótica de segurança e privacidade.' },
    ],
  },

  evidencias: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      { tipo: 'documento', rotulo: 'Proposta e escopo', url: '/registro#s4' },
      { tipo: 'documento', rotulo: 'Backlog inicial', url: '/registro#s4' },
    ],
  },
} satisfies RegistroSemana

export function Detalhes() {
  return (
    <>
      <Secao titulo="Proposta em uma página">
        <Lista
          itens={[
            'O quê: um sistema web que substitui a planilha de consolidação da gratificação por desempenho.',
            'Para quem: CAM, áreas técnicas que informam dados, gestores avaliados e auditoria.',
            'Como: indicadores e regras cadastrados pela interface; regra versionada; cálculo por função pura; memória de cálculo exibida junto de cada resultado; trilha de auditoria imutável.',
            'Por que agora: o processo depende de poucas pessoas e não tem rastreabilidade — um erro só aparece depois do pagamento.',
            'Como saberemos que deu certo: qualquer número do resultado responde “de onde veio?” em um clique, e o mesmo ciclo recalculado devolve o mesmo valor.',
          ]}
        />
      </Secao>

      <Secao titulo="Escopo">
        <Quadro
          quadrantes={[
            {
              titulo: 'Dentro',
              itens: [
                'Cadastro de ciclos, áreas, indicadores e regras de pontuação versionadas',
                'Lançamento de valores pelas áreas técnicas, com validação e evidência',
                'Motor de cálculo com memória de cálculo por indicador',
                'Estados do ciclo, da abertura à publicação, com trilha de auditoria',
                'Consulta do próprio resultado pelo gestor e abertura de contestação',
                'Painel agregado por área e exportação em CSV',
                'Analytics com os resultados dos modelos e o método declarado',
              ],
            },
            {
              titulo: 'Fora',
              itens: [
                'Integração com folha de pagamento',
                'Autenticação corporativa da prefeitura',
                'Migração de dados históricos reais',
                'Aplicativo mobile nativo',
                'Cálculo de outras verbas que não a gratificação por desempenho',
              ],
            },
          ]}
        />
      </Secao>

      <Secao
        titulo="Backlog inicial"
        descricao="Vinte e cinco histórias em cinco épicos. MoSCoW: M = obrigatória, S = importante, C = desejável, W = fora desta versão."
      >
        <Tabela
          colunas={['Épico', 'História', 'MoSCoW']}
          linhas={[
            ['Ciclo', 'Como CAM, quero abrir um ciclo de avaliação para que as áreas possam lançar dados', 'M'],
            ['Ciclo', 'Como CAM, quero definir a janela de lançamento para controlar o prazo', 'M'],
            ['Ciclo', 'Como CAM, quero avançar o estado do ciclo para refletir a etapa real do processo', 'M'],
            ['Ciclo', 'Como CAM, quero homologar o ciclo para congelar os resultados', 'M'],
            ['Ciclo', 'Como CAM, quero publicar o ciclo para que os gestores vejam seus resultados', 'S'],
            ['Indicadores', 'Como CAM, quero cadastrar indicadores com meta, peso e direção para refletir a portaria', 'M'],
            ['Indicadores', 'Como CAM, quero definir se o indicador é maior-melhor ou menor-melhor para calcular corretamente', 'M'],
            ['Indicadores', 'Como CAM, quero criar uma nova versão da regra para não alterar ciclos já fechados', 'M'],
            ['Indicadores', 'Como CAM, quero ver o diff entre versões da regra para saber o que mudou', 'S'],
            ['Indicadores', 'Como CAM, quero definir a vigência da regra para que cada ciclo use a versão certa', 'M'],
            ['Lançamento', 'Como área técnica, quero lançar o valor do meu indicador para cumprir minha parte', 'M'],
            ['Lançamento', 'Como área técnica, quero anexar a evidência do dado para sustentar o que informei', 'M'],
            ['Lançamento', 'Como área técnica, quero editar meu lançamento dentro do prazo para corrigir engano', 'M'],
            ['Lançamento', 'Como área técnica, quero ver o histórico da minha área para acompanhar o que já enviei', 'S'],
            ['Lançamento', 'Como área técnica, quero ser avisada de valor fora do padrão para conferir antes de enviar', 'C'],
            ['Resultado', 'Como gestor avaliado, quero ver meu score e minha faixa para saber meu resultado', 'M'],
            ['Resultado', 'Como gestor avaliado, quero abrir a memória de cálculo para entender de onde veio o número', 'M'],
            ['Resultado', 'Como gestor avaliado, quero comparar meus ciclos para acompanhar minha evolução', 'S'],
            ['Resultado', 'Como gestor avaliado, quero abrir contestação para questionar um resultado', 'S'],
            ['Resultado', 'Como CAM, quero responder a contestação para encerrar o questionamento com registro', 'S'],
            ['Governança', 'Como auditoria, quero ver a linha do tempo de tudo que aconteceu para fiscalizar', 'M'],
            ['Governança', 'Como auditoria, quero que nada possa ser apagado para que a trilha sirva de prova', 'M'],
            ['Governança', 'Como CAM, quero ver agregados por área para enxergar o funil do ciclo', 'S'],
            ['Governança', 'Como CAM, quero exportar os resultados em CSV para usar em outros relatórios', 'C'],
            ['Governança', 'Como CAM, quero ver o risco de não-atingimento no próximo ciclo para agir antes', 'C'],
          ]}
        />
      </Secao>
    </>
  )
}
