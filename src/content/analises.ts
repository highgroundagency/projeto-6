/**
 * A MATRIZ CSD: certezas, suposições e dúvidas.
 *
 * Montada na semana do Kick-off, e não em agosto. O material estava todo
 * escrito, só que espalhado: as suposições moravam em comentário de código
 * (`src/lib/calculo/motor.ts`) e numa nota da Semana 3, as certezas na
 * portaria transcrita em `docs/portaria-001-2024.md`, e as dúvidas na ata da
 * reunião de 22/08. O que faltava era a matriz. O documento do ciclo diz essa
 * data com todas as letras: registro que finge ter nascido antes deixa de
 * servir como registro.
 *
 * FONTE ÚNICA de propósito: a mesma matriz aparece no slide e no documento, e
 * duas cópias divergem na primeira correção.
 *
 * Cada item carrega `fonte`, que é o que separa uma matriz CSD de uma lista de
 * opiniões: certeza sem origem é chute com voz firme.
 */

export interface ItemCSD {
  /** Três a cinco palavras: é o que cabe no slide. */
  readonly resumo: string
  /** A frase inteira, para o documento. */
  readonly texto: string
  /** Onde isso se sustenta. Arquivo, artigo da portaria ou a conversa. */
  readonly fonte: string
}

/** O que sabemos, com origem verificável. */
export const CERTEZAS: readonly ItemCSD[] = [
  {
    resumo: 'a regra está publicada',
    texto:
      'A Portaria Conjunta nº 001/2024 saiu no Diário Oficial do Recife nº 131, de 21/09/2024. Ela detalha os cinco indicadores e os itens medidos dentro de cada um. Diz também o peso de cada indicador por função.',
    fonte: 'docs/portaria-001-2024.md',
  },
  {
    resumo: 'a conta é feita à mão',
    texto:
      'Todo mês, o fechamento é feito numa planilha. A conferência é linha a linha, e poucas pessoas fazem esse trabalho.',
    fonte: 'enunciado do case e reunião de 22/08',
  },
  {
    resumo: 'o resultado vira folha',
    texto:
      'O art. 7º manda a SEGTES pedir que o resultado entre na folha de pagamento. O prazo é o 6º dia útil do segundo mês. Não é um número de vitrine: é dinheiro no salário.',
    fonte: 'Portaria, art. 7º',
  },
  {
    resumo: 'quem decide é uma comissão',
    texto:
      'A Comissão de Avaliação de Metas reúne sete áreas da prefeitura. Para decidir, precisa de quatro presentes (o quórum).',
    fonte: 'Portaria, arts. 5º e 6º',
  },
  {
    resumo: 'já tentaram, e parou',
    texto:
      'Já tentaram automatizar o cálculo antes, e a tentativa foi abandonada. Isso mostra que a necessidade existe e está esperando. E também avisa o que não devemos repetir.',
    fonte: 'enunciado do case',
  },
  {
    resumo: 'existe prazo para recorrer',
    texto:
      'O art. 9º dá ao gestor 10 dias corridos para contestar o resultado. A comissão tem 5 dias úteis para responder.',
    fonte: 'Portaria, art. 9º',
  },
]

/** O que assumimos para poder andar, e que ainda pode cair. */
export const SUPOSICOES: readonly ItemCSD[] = [
  {
    resumo: 'a nota do distrito é média simples',
    texto:
      'A nota do distrito é a média simples das notas das unidades. Unidade grande e unidade pequena pesam igual. A conta real pode ser outra. Se for, ela vira um campo na regra guardada, sem reescrever o sistema.',
    fonte: 'src/lib/calculo/motor.ts',
  },
  {
    resumo: 'a planilha real confirma o modelo',
    texto:
      'Desenhamos o cálculo a partir do case e da conversa com o cliente. A Secretaria prometeu mandar a planilha real. É ela que vai dizer se acertamos.',
    fonte: 'Semana 3, nota das suposições declaradas',
  },
  {
    resumo: 'o ciclo é mensal',
    texto:
      'Cada ciclo é um mês inteiro. As unidades enviam os números até o dia 20. Se o ciclo tivesse outro período, a tela de fechamento quebraria. A conta em si continuaria certa.',
    fonte: 'Portaria, art. 7º, lido como regra geral',
  },
  {
    resumo: 'as unidades enviam por planilha',
    texto:
      'Hoje o número sai da unidade em planilha ou e-mail. Se existir um sistema de origem, a coleta muda de forma. Aí, digitar o número à mão vira exceção.',
    fonte: 'reunião de 22/08, não confirmado',
  },
  {
    resumo: 'a comissão decide fora do sistema',
    texto:
      'O sistema registra o resultado. A comissão continua decidindo em reunião, fora do sistema. Se ela quiser decidir por dentro, entra uma tela nova.',
    fonte: 'leitura do art. 6º pela equipe',
  },
]

/** O que não sabemos, e a quem vamos perguntar. */
export const DUVIDAS: readonly ItemCSD[] = [
  {
    resumo: 'como redistribuir o peso que falta',
    texto:
      'O art. 8º diz o que fazer quando um indicador fica sem número informado. Ele sai da conta, e o peso dele é dividido entre os outros, na proporção de cada um. Falta saber se essa divisão é entre os pesos do grupo ou entre o total.',
    fonte: 'a perguntar à Secretaria, entra na regra v3',
  },
  {
    resumo: 'quem publica, e onde',
    texto:
      'A portaria diz que a comissão divulga o resultado. Não sabemos onde ela publica. Também não sabemos se cada gestor recebe um aviso.',
    fonte: 'a perguntar à Secretaria',
  },
  {
    resumo: 'como se contesta hoje',
    texto:
      'O prazo para recorrer existe. Mas não sabemos como o recurso é feito hoje: em papel, por e-mail ou num formulário. A resposta define como a tela de contestação vai se encaixar no que já existe.',
    fonte: 'a perguntar à Secretaria',
  },
  {
    resumo: 'dado real, algum dia',
    texto:
      'Hoje todos os dados são inventados por um programa gerador. Falta saber se o sistema pode um dia receber dado de verdade. E, se puder, com que base legal e quem responde por ele.',
    fonte: 'lente de Direito, docs/privacidade.md',
  },
  {
    resumo: 'a agenda da comissão cabe no semestre',
    texto:
      'A validação com o cliente está marcada para a Semana 11. Se a agenda da comissão não abrir, o teste do sistema contra a planilha atrasa para o SR2.',
    fonte: 'risco declarado na SWOT da Semana 2',
  },
]

/** A matriz inteira, na ordem em que ela é lida. */
export const CSD = [
  { chave: 'certezas', titulo: 'Certezas', itens: CERTEZAS },
  { chave: 'suposicoes', titulo: 'Suposições', itens: SUPOSICOES },
  { chave: 'duvidas', titulo: 'Dúvidas', itens: DUVIDAS },
] as const

/* -------------------------------------------------------------------------
   AS ANÁLISES DA SEMANA 2 E DA SEMANA 3, COMO DADO

   Elas nasceram dentro dos arquivos de ciclo, em JSX. Viraram dado aqui
   quando o pitch passou a mostrá-las: o slide e o documento têm que dizer o
   mesmo número de alternativas e a mesma conclusão, e duas cópias divergem na
   primeira correção. O conteúdo é o mesmo, palavra por palavra; o que mudou é
   quem é dono dele.
------------------------------------------------------------------------- */

export interface Referencia {
  readonly referencia: string
  /** O apelido curto, de duas ou três palavras: é o que cabe no slide. */
  readonly curto: string
  readonly serve: string
  readonly naoServe: string
}

export const BENCHMARKING: readonly Referencia[] = [
  {
    referencia: 'Painéis de indicadores de entes públicos',
    curto: 'painéis públicos',
    serve:
      'Publicam os dados por conta própria (transparência ativa). Cada indicador tem ficha técnica e histórico ao longo do tempo.',
    naoServe:
      'São vitrines de divulgação. Não calculam quanto dinheiro sai disso, nem guardam o histórico de quem decidiu o quê.',
  },
  {
    referencia: 'Sistemas de monitoramento de metas do SUS',
    curto: 'metas do SUS',
    serve:
      'Cada indicador tem fonte, frequência de medição e meta combinada. É o vocabulário que a SESAU já usa.',
    naoServe:
      'A regra de cálculo é fixa dentro do sistema. A nossa portaria muda, então a regra precisa ser ajustável.',
  },
  {
    referencia: 'Ferramenta de OKR (acompanhamento de objetivos)',
    curto: 'ferramentas de OKR',
    serve:
      'Reuniões de acompanhamento em ritmo fixo, um responsável por cada resultado e o progresso visível.',
    naoServe:
      'Não guarda a regra da portaria com número de versão. Também não mostra a conta de um jeito que dê para conferir.',
  },
  {
    referencia: 'Ferramenta de OKR (gestão por resultados corporativa)',
    curto: 'gestão por resultados',
    serve:
      'Cada objetivo tem um peso, e as notas se juntam numa nota final. A conta é parecida com a nossa.',
    naoServe:
      'A nota ali é só para gestão. Não é um ato administrativo que mexe na folha de pagamento. E o modelo de licença por usuário não cabe no órgão.',
  },
  {
    referencia: 'Planilha atual da comissão',
    curto: 'a planilha de hoje',
    serve: 'Faz o que quiserem e não custa nada para começar a usar.',
    naoServe:
      'Não guarda quem mudou o quê. Não tem versão nem controle de quem pode acessar. E só quem escreveu a planilha entende como ela funciona.',
  },
]

/** A frase que fecha o benchmarking, e que justifica construir em vez de comprar. */
export const CONCLUSAO_BENCHMARKING =
  'Nenhuma ferramenta pronta junta as três coisas: regra com versão, conta aberta para conferir e registro de quem mudou.'

/** A mesma conclusão em oito palavras, para caber no slide. */
export const CONCLUSAO_CURTA = 'nenhuma junta regra com versão, conta aberta e registro'

export interface Quadrante {
  readonly titulo: string
  /** O quadrante em quatro palavras: é o que cabe no slide. */
  readonly curto: string
  readonly itens: readonly [string, ...string[]]
}

export const SWOT: readonly Quadrante[] = [
  {
    titulo: 'Forças',
    curto: 'cliente real, regra escrita',
    itens: [
      'Temos um cliente real, e o processo dele está escrito numa portaria',
      'Somos sete, com frentes separadas e pouca sobreposição',
      'O problema tem regra escrita: dá para desenhar no sistema e testar',
    ],
  },
  {
    titulo: 'Fraquezas',
    curto: 'a portaria chegou tarde',
    itens: [
      'Ninguém da equipe conhece o processo por dentro',
      'A portaria só chegou na quinta semana',
      'Só um semestre para um assunto com regra complicada',
    ],
  },
  {
    titulo: 'Oportunidades',
    curto: 'já tentaram, e parou',
    itens: [
      'Já tentaram antes e pararam: a necessidade existe e está esperando',
      'Ver a conta aberta é ganho direto para quem é avaliado',
      'Os mesmos dados servem para a parte de aprendizado de máquina',
    ],
  },
  {
    titulo: 'Ameaças',
    curto: 'a portaria pode mudar',
    itens: [
      'A agenda da comissão pode impedir a validação',
      'A portaria pode mudar no meio do semestre',
      'O projeto crescer até a folha de pagamento, que não faz parte dele',
    ],
  },
]

export interface TecnicaDeIdeacao {
  readonly nome: string
  readonly minutos: number
  readonly como: string
  readonly produto: string
  /** O produto em três palavras, para o slide. */
  readonly produtoCurto: string
}

export const TECNICAS_DE_IDEACAO: readonly TecnicaDeIdeacao[] = [
  {
    nome: 'Brainwriting',
    minutos: 20,
    como: 'Cada integrante escreve três ideias em silêncio, sem discutir. Depois passa a folha adiante. Quem recebe amplia a ideia do colega, em vez de criticar.',
    produto: '18 ideias escritas, sem o peso de quem fala primeiro.',
    produtoCurto: '18 ideias no papel',
  },
  {
    nome: 'Brainstorming',
    minutos: 25,
    como: 'Conversa aberta sobre as folhas do brainwriting. Juntamos as ideias parecidas e demos nome a cada grupo.',
    produto: 'De 6 a 8 alternativas diferentes, já agrupadas.',
    produtoCurto: 'oito alternativas',
  },
  {
    nome: "Crazy 8's",
    minutos: 8,
    como: 'Cada um desenha oito rascunhos de tela em oito minutos. Fizemos isso para as duas alternativas mais votadas.',
    produto: 'As primeiras telas em papel, que serviram de base para o protótipo.',
    produtoCurto: 'telas em papel',
  },
]

export type SituacaoAlternativa =
  | 'Linha de base'
  | 'Descartada'
  | 'Escolhida'
  | 'Adiada'
  | 'Incorporada'

export interface Alternativa {
  readonly nome: string
  readonly impacto: number
  readonly esforco: number
  readonly aderencia: number
  readonly situacao: SituacaoAlternativa
}

export const ALTERNATIVAS: readonly Alternativa[] = [
  {
    nome: 'Planilha padronizada com validação e trava de fórmula',
    impacto: 2,
    esforco: 1,
    aderencia: 4,
    situacao: 'Linha de base',
  },
  {
    nome: 'Formulário de coleta mais planilha de junção',
    impacto: 2,
    esforco: 2,
    aderencia: 4,
    situacao: 'Descartada',
  },
  {
    nome: 'Sistema web com regra ajustável e a conta aberta',
    impacto: 5,
    esforco: 4,
    aderencia: 5,
    situacao: 'Escolhida',
  },
  {
    nome: 'Painel de indicadores sem cálculo de gratificação',
    impacto: 2,
    esforco: 3,
    aderencia: 3,
    situacao: 'Descartada',
  },
  {
    nome: 'Robô que lê as planilhas e junta tudo sozinho',
    impacto: 3,
    esforco: 4,
    aderencia: 2,
    situacao: 'Descartada',
  },
  {
    nome: 'Módulo dentro de um sistema público já existente',
    impacto: 4,
    esforco: 5,
    aderencia: 2,
    situacao: 'Descartada',
  },
  {
    nome: 'Aplicativo de celular para o gestor avaliado',
    impacto: 2,
    esforco: 3,
    aderencia: 2,
    situacao: 'Adiada',
  },
  {
    nome: 'Modelo que prevê risco de não bater a meta',
    impacto: 3,
    esforco: 3,
    aderencia: 4,
    situacao: 'Incorporada',
  },
]

export const ALTERNATIVA_ESCOLHIDA = ALTERNATIVAS.find((a) => a.situacao === 'Escolhida')!

export interface RazaoDaEscolha {
  readonly titulo: string
  readonly texto: string
  /** A razão em cinco palavras, para o slide. */
  readonly curto: string
}

export const RAZOES_DA_ESCOLHA: readonly RazaoDaEscolha[] = [
  {
    titulo: 'Impacto',
    curto: 'ataca a causa, não o sintoma',
    texto:
      'Ataca a causa do problema. Hoje a regra da portaria só existe dentro de fórmulas de planilha.',
  },
  {
    titulo: 'Aderência',
    curto: 'mudar a regra não é mudar o programa',
    texto:
      'Indicadores e regras se ajustam pela tela. Assim, quando a portaria muda, o programa não precisa mudar.',
  },
  {
    titulo: 'Esforço',
    curto: 'alto, mas cabe em fatias',
    texto:
      'É alto, mas dá para dividir em fatias. Lançamento, cálculo e conta aberta cabem até o SR1. Auditoria e gestão vêm depois, nas sprints.',
  },
  {
    titulo: 'Sinergia',
    curto: 'o modelo entrou junto, não separado',
    texto:
      'O modelo que prevê risco não virou um produto separado. Entrou como uma funcionalidade a mais, sobre a mesma base.',
  },
]

/** O que a linha de base faz na matriz, em oito palavras. */
export const PONTO_DE_COMPARACAO = 'a planilha melhorada fica como ponto de comparação'

export const NOTA_DA_ESCOLHA =
  'A ideia de melhorar a planilha continua na matriz de propósito. Ela é o ponto de comparação. Na validação da Semana 11, o ganho do sistema será medido contra ela.'

/** O mapa de empatia da analista, a pessoa que carrega o processo hoje. */
export const MAPA_DE_EMPATIA = [
  {
    termo: 'Diz',
    definicao: '“Se mexer numa fórmula, tenho que conferir a planilha inteira de novo.”',
  },
  {
    termo: 'Pensa',
    definicao:
      'Que a culpa de qualquer erro vai cair nela. Mesmo quando o dado já chegou errado de quem enviou.',
  },
  {
    termo: 'Faz',
    definicao:
      'Confere linha a linha. Guarda uma cópia de segurança de cada versão. Guarda também os e-mails, como prova.',
  },
  {
    termo: 'Sente',
    definicao: 'Insegurança na hora do fechamento. Alívio quando o ciclo passa sem contestação.',
  },
  {
    termo: 'Dores',
    definicao:
      'Refazer tudo a cada mudança de regra. Não ter registro de quem mudou o quê. E o processo só andar quando ela está presente.',
  },
  {
    termo: 'Ganhos',
    definicao:
      'Fechar o ciclo com um cálculo que se explica sozinho. E conseguir tirar férias sem travar a comissão.',
  },
] as const
