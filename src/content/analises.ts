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
      'A Portaria Conjunta nº 001/2024, no Diário Oficial do Recife nº 131 de 21/09/2024, detalha os cinco indicadores, os subindicadores e os pesos por função.',
    fonte: 'docs/portaria-001-2024.md',
  },
  {
    resumo: 'a conta é feita à mão',
    texto:
      'O fechamento mensal passa por planilha, e a conferência é linha a linha, feita por poucas pessoas.',
    fonte: 'enunciado do case e reunião de 22/08',
  },
  {
    resumo: 'o resultado vira folha',
    texto:
      'O art. 7º manda a SEGTES pedir a implantação do resultado na folha até o 6º dia útil do segundo mês. Não é indicador de vitrine: é dinheiro no salário.',
    fonte: 'Portaria, art. 7º',
  },
  {
    resumo: 'quem decide é uma comissão',
    texto:
      'A Comissão de Avaliação de Metas reúne sete áreas da prefeitura e delibera com quórum de quatro.',
    fonte: 'Portaria, arts. 5º e 6º',
  },
  {
    resumo: 'já tentaram, e parou',
    texto:
      'Houve uma tentativa anterior de automatizar o cálculo, abandonada. É demanda represada, e também um aviso sobre o que não repetir.',
    fonte: 'enunciado do case',
  },
  {
    resumo: 'existe prazo para recorrer',
    texto:
      'O art. 9º dá 10 dias corridos para o gestor contestar e 5 dias úteis para a comissão responder.',
    fonte: 'Portaria, art. 9º',
  },
]

/** O que assumimos para poder andar, e que ainda pode cair. */
export const SUPOSICOES: readonly ItemCSD[] = [
  {
    resumo: 'a nota do distrito é média simples',
    texto:
      'A nota do distrito é a média das notas das unidades, sem ponderar por porte. A agregação real pode ser diferente, e se for vira campo da regra, não reescrita do sistema.',
    fonte: 'src/lib/calculo/motor.ts',
  },
  {
    resumo: 'a planilha real confirma o modelo',
    texto:
      'O desenho do cálculo foi deduzido do case e da conversa com o cliente. A planilha que a Secretaria prometeu mandar é que decide se ele está certo.',
    fonte: 'Semana 3, nota das suposições declaradas',
  },
  {
    resumo: 'o ciclo é mensal',
    texto:
      'Cada ciclo é um mês fechado, com envio das unidades até o dia 20. Um ciclo com outro recorte quebraria a tela de fechamento, não a conta.',
    fonte: 'Portaria, art. 7º, lido como regra geral',
  },
  {
    resumo: 'as unidades enviam por planilha',
    texto:
      'Hoje o número sai da unidade em planilha ou e-mail. Se houver sistema de origem, a coleta muda de forma e o lançamento manual vira exceção.',
    fonte: 'reunião de 22/08, não confirmado',
  },
  {
    resumo: 'a comissão decide fora do sistema',
    texto:
      'O sistema registra o resultado; a deliberação da comissão continua acontecendo em reunião. Se ela quiser deliberar por dentro, entra uma tela nova.',
    fonte: 'leitura do art. 6º pela equipe',
  },
]

/** O que não sabemos, e a quem vamos perguntar. */
export const DUVIDAS: readonly ItemCSD[] = [
  {
    resumo: 'como redistribuir o peso que falta',
    texto:
      'O art. 8º manda desconsiderar o indicador sem lançamento e redistribuir o peso proporcionalmente. Falta saber se a redistribuição é sobre os pesos do grupo ou sobre o total.',
    fonte: 'a perguntar à Secretaria, entra na regra v3',
  },
  {
    resumo: 'quem publica, e onde',
    texto:
      'A portaria diz que a comissão divulga o resultado. Não sabemos em que veículo, nem se o gestor recebe aviso individual.',
    fonte: 'a perguntar à Secretaria',
  },
  {
    resumo: 'como se contesta hoje',
    texto:
      'Existe prazo, mas não sabemos se o recurso é processo em papel, e-mail ou formulário. Isso decide como a tela de contestação vai conversar com o que já existe.',
    fonte: 'a perguntar à Secretaria',
  },
  {
    resumo: 'dado real, algum dia',
    texto:
      'Hoje tudo é inventado por um gerador. Falta saber se existe caminho para o sistema receber dado de verdade, com que base legal e sob qual responsabilidade.',
    fonte: 'lente de Direito, docs/privacidade.md',
  },
  {
    resumo: 'a agenda da comissão cabe no semestre',
    texto:
      'A validação com o cliente está marcada para a Semana 11. Se a agenda da comissão não abrir, a prova do sistema contra a planilha escorrega para o SR2.',
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
    serve: 'Transparência ativa, indicador com ficha técnica e série histórica',
    naoServe:
      'São vitrines de divulgação: não calculam efeito financeiro nem guardam trilha de decisão',
  },
  {
    referencia: 'Sistemas de monitoramento de metas do SUS',
    curto: 'metas do SUS',
    serve:
      'Indicador com fonte, periodicidade e meta pactuada, vocabulário que a SESAU já usa',
    naoServe: 'Regra de cálculo fixa no sistema; nossa portaria muda e precisa ser ajustável',
  },
  {
    referencia: 'Ferramenta de OKR (acompanhamento de objetivos)',
    curto: 'ferramentas de OKR',
    serve: 'Cadência de check-in, responsável por resultado e visualização de progresso',
    naoServe: 'Não guarda versão de regra normativa nem produz conta conferível',
  },
  {
    referencia: 'Ferramenta de OKR (gestão por resultados corporativa)',
    curto: 'gestão por resultados',
    serve: 'Peso por objetivo e agregação de score, modelo matemático parecido com o nosso',
    naoServe:
      'Score é gerencial, não é ato administrativo com efeito em folha; e a licença por usuário não cabe no órgão',
  },
  {
    referencia: 'Planilha atual da comissão',
    curto: 'a planilha de hoje',
    serve: 'Flexibilidade total e custo zero de adoção',
    naoServe:
      'Sem trilha, sem versão, sem controle de acesso e com o conhecimento preso em quem a escreveu',
  },
]

/** A frase que fecha o benchmarking, e que justifica construir em vez de comprar. */
export const CONCLUSAO_BENCHMARKING =
  'Nenhuma ferramenta pronta junta as três coisas: regra com versão, conta aberta e registro de quem mudou.'

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
      'Cliente real, com processo escrito em portaria',
      'Equipe de seis com frentes bem separadas',
      'Problema com regra explícita: dá para modelar e testar',
    ],
  },
  {
    titulo: 'Fraquezas',
    curto: 'a portaria chegou tarde',
    itens: [
      'Ninguém da equipe conhece o processo por dentro',
      'A portaria só chegou na quinta semana',
      'Um semestre para um domínio com regra complexa',
    ],
  },
  {
    titulo: 'Oportunidades',
    curto: 'já tentaram, e parou',
    itens: [
      'Uma tentativa anterior foi abandonada: há demanda represada',
      'A conta aberta é ganho direto para quem é avaliado',
      'Os mesmos dados alimentam a lente de aprendizado de máquina',
    ],
  },
  {
    titulo: 'Ameaças',
    curto: 'a portaria pode mudar',
    itens: [
      'A agenda da comissão pode inviabilizar a validação',
      'Mudança de portaria durante o semestre',
      'O escopo crescer para a folha de pagamento, que está fora',
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
    como: 'Cada integrante escreve três ideias em silêncio, sem discutir, e passa a folha adiante. Quem recebe amplia a ideia do colega em vez de criticá-la.',
    produto: '18 ideias escritas, sem viés de quem fala primeiro.',
    produtoCurto: '18 ideias no papel',
  },
  {
    nome: 'Brainstorming',
    minutos: 25,
    como: 'Discussão aberta a partir das folhas do brainwriting, agrupando ideias parecidas e nomeando os grupos.',
    produto: 'De 6 a 8 alternativas distintas, já agrupadas.',
    produtoCurto: 'oito alternativas',
  },
  {
    nome: "Crazy 8's",
    minutos: 8,
    como: 'Oito esboços de tela em oito minutos, individualmente, para as duas alternativas mais votadas.',
    produto: 'Primeiras telas em papel, insumo do protótipo.',
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
      'Ataca a causa do problema: a regra da portaria hoje só existe dentro de fórmulas de planilha.',
  },
  {
    titulo: 'Aderência',
    curto: 'mudar a regra não é mudar o programa',
    texto:
      'Ajustar indicadores e regras pela interface faz com que mudança de portaria não vire mudança de software.',
  },
  {
    titulo: 'Esforço',
    curto: 'alto, mas cabe em fatias',
    texto:
      'Alto, mas fatiável: lançamento, cálculo e conta aberta cabem até o SR1; auditoria e gestão vêm nas sprints.',
  },
  {
    titulo: 'Sinergia',
    curto: 'o modelo entrou junto, não separado',
    texto:
      'O modelo que prevê risco não virou produto separado: entrou como funcionalidade da mesma base.',
  },
]

/** O que a linha de base faz na matriz, em oito palavras. */
export const PONTO_DE_COMPARACAO = 'a planilha melhorada fica como ponto de comparação'

export const NOTA_DA_ESCOLHA =
  'A alternativa de melhorar a planilha continua na matriz de propósito: ela é o ponto de comparação contra o qual o ganho do sistema é medido na validação da Semana 11.'

/** O mapa de empatia da analista, a pessoa que carrega o processo hoje. */
export const MAPA_DE_EMPATIA = [
  {
    termo: 'Diz',
    definicao: '“Se mexer numa fórmula, tenho que conferir a planilha inteira de novo.”',
  },
  {
    termo: 'Pensa',
    definicao:
      'Que a responsabilidade por um erro vai recair sobre ela, mesmo quando o dado veio errado da origem.',
  },
  {
    termo: 'Faz',
    definicao:
      'Confere linha a linha, mantém cópias de segurança por versão e guarda e-mails como comprovação.',
  },
  {
    termo: 'Sente',
    definicao: 'Insegurança no fechamento e alívio quando o ciclo passa sem contestação.',
  },
  {
    termo: 'Dores',
    definicao:
      'Retrabalho a cada mudança de regra, ausência de trilha e dependência de estar presente para o processo andar.',
  },
  {
    termo: 'Ganhos',
    definicao:
      'Fechar o ciclo com o cálculo explicado sozinho e conseguir tirar férias sem travar a comissão.',
  },
] as const
