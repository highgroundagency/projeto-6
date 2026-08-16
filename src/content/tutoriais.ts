import type { FeatureId, PerfilId } from '@/lib/features'

/**
 * O aprendizado guiado, um por papel.
 *
 * Não é um tour de overlay: é uma lista numerada em que cada passo aponta para
 * a sanfona da tela correspondente. Sem JavaScript, sem biblioteca, e continua
 * funcionando quando a pessoa imprime a página.
 *
 * CADA PASSO PRECISA DE UMA TELA EXISTENTE. A interface descarta os passos cujo
 * `tela` ainda não foi liberada ou não pertence ao perfil: um tutorial que
 * ensina a usar o que não saiu é exatamente a tela de "em breve" que o §6.2
 * proíbe, só que em prosa.
 */
export interface PassoTutorial {
  readonly titulo: string
  /** O que a pessoa faz de fato, na ordem. */
  readonly oQueFazer: string
  /** Por que este passo existe no processo, e não só na interface. */
  readonly porque: string
  /** `null` = passo de contexto, sem tela para abrir. */
  readonly tela: FeatureId | null
}

export interface Tutorial {
  readonly resumo: string
  readonly passos: readonly PassoTutorial[]
}

export const TUTORIAIS: Record<PerfilId, Tutorial> = {
  cam: {
    resumo:
      'Você conduz o ciclo inteiro. O percurso abaixo é a ordem em que as coisas acontecem numa competência real, do cadastro à publicação.',
    passos: [
      {
        titulo: 'Confira a régua antes de abrir o ciclo',
        oQueFazer:
          'Abra "indicadores e regras" e leia o catálogo: meta, peso, unidade e fonte de cada indicador. Desça até o diff entre versões da regra.',
        porque:
          'A régua precisa estar acertada antes de alguém informar valor. Mudar peso no meio do ciclo é o que produz a desconfiança que este projeto ataca.',
        tela: 'indicadores',
      },
      {
        titulo: 'Acompanhe quem já informou',
        oQueFazer:
          'No dashboard, olhe o funil por área e a lista de pendências. Cada barra é a fração de indicadores já lançados por aquela área.',
        porque:
          'É a informação que hoje só existe cobrando por e-mail. Ver a pendência em tela substitui a pergunta "vocês já mandaram?".',
        tela: 'painel-cam',
      },
      {
        titulo: 'Cubra a área que não conseguir lançar',
        oQueFazer:
          'Em "lançamento", escolha a área pendente e informe valor e evidência em nome dela.',
        porque:
          'A CAM pode lançar por terceiros para o ciclo não travar, e o autor do lançamento fica registrado assim mesmo. Cobrir não é apagar de quem era a responsabilidade.',
        tela: 'lancamento',
      },
      {
        titulo: 'Feche a janela e apure',
        oQueFazer:
          'Ainda no dashboard, use o trilho de estados para avançar o ciclo. A transição pede confirmação e entra na trilha com o estado anterior.',
        porque:
          'A máquina anda um passo por vez, de propósito. Sem estado explícito, ninguém sabe se um número ainda pode mudar.',
        tela: 'painel-cam',
      },
      {
        titulo: 'Confira uma conta antes de publicar',
        oQueFazer:
          'Em "meu resultado", escolha um gestor e abra a memória de cálculo linha a linha.',
        porque:
          'É a mesma tela que o avaliado vai abrir. Ver o resultado pelos olhos dele antes de publicar é o que evita a pergunta que ninguém sabe responder na reunião.',
        tela: 'meu-resultado',
      },
      {
        titulo: 'Publique e olhe o agregado',
        oQueFazer:
          'No painel da gestão, escolha a competência, ligue a anonimização e exporte o CSV.',
        porque:
          'O agregado é o que vai para a reunião. A anonimização existe para que a comparação entre áreas possa ser projetada sem expor pessoas.',
        tela: 'painel-gestao',
      },
      {
        titulo: 'Descubra onde olhar no próximo ciclo',
        oQueFazer:
          'Em analytics, veja as áreas com menor atingimento médio e os lançamentos marcados como possível erro de digitação.',
        porque:
          'Nenhum número daqui entra na conta da gratificação, e isso é regra, não limitação. Analytics serve para priorizar apoio, não para pontuar ninguém.',
        tela: 'analytics',
      },
      {
        titulo: 'Responda quem discordou',
        oQueFazer: 'Abra a contestação e leia o motivo registrado, com o ciclo e o indicador.',
        porque:
          'Contestação sem resposta escrita é ouvidoria de fachada. O registro é o que permite auditar depois se a comissão respondeu.',
        tela: 'contestacao',
      },
      {
        titulo: 'Prove o que aconteceu',
        oQueFazer:
          'Na auditoria, filtre por tipo de evento e confira o antes e o depois de cada mudança.',
        porque:
          'É a diferença entre afirmar que o processo foi correto e conseguir demonstrar isso.',
        tela: 'auditoria',
      },
    ],
  },

  area_tecnica: {
    resumo:
      'Seu papel é curto e é o mais importante do ciclo: informar o número certo, com a evidência que o sustenta, dentro do prazo.',
    passos: [
      {
        titulo: 'Escolha a sua área',
        oQueFazer:
          'Em "lançamento", use o seletor de área. A lista abaixo passa a mostrar só os indicadores daquela unidade.',
        porque:
          'Cada área responde pelo que produz. Lançar indicador alheio é como assinar relatório de outro setor.',
        tela: 'lancamento',
      },
      {
        titulo: 'Informe valor e evidência juntos',
        oQueFazer:
          'Preencha o valor e, ao lado, de onde ele veio: sistema de origem, relatório, competência. Os dois campos são obrigatórios.',
        porque:
          'Número sem procedência é opinião. A evidência é o que torna a conferência possível meses depois, quando ninguém lembra.',
        tela: 'lancamento',
      },
      {
        titulo: 'Repare no aviso de valor estranho',
        oQueFazer:
          'Se o valor ficar muito longe da meta, aparece um alerta laranja embaixo do campo. Ele não impede o envio.',
        porque:
          'A vírgula no lugar errado é o erro mais comum e o mais caro. O sistema sinaliza e deixa a decisão com quem tem o dado na mão.',
        tela: 'lancamento',
      },
      {
        titulo: 'Corrigiu? Não some com o anterior',
        oQueFazer:
          'Reenvie o formulário com o valor certo. O campo já vem preenchido com o atual.',
        porque:
          'A correção entra como versão nova e o valor antigo continua na trilha. É o que separa corrigir de encobrir.',
        tela: 'lancamento',
      },
    ],
  },

  gestor: {
    resumo:
      'Você é quem a avaliação afeta. O sistema foi desenhado para que você consiga refazer a própria conta, e discordar dela por escrito.',
    passos: [
      {
        titulo: 'Veja o número e a faixa',
        oQueFazer:
          'Em "meu resultado", escolha o ciclo. O cartão do topo traz o score e a faixa de gratificação alcançada.',
        porque:
          'Hoje esse número chega pronto, sem contexto. Aqui ele vem com a faixa e com a régua que a produziu.',
        tela: 'meu-resultado',
      },
      {
        titulo: 'Abra a memória de cálculo',
        oQueFazer:
          'Clique em "memória de cálculo". Cada linha mostra indicador, valor informado, meta, atingimento, pontos, peso e contribuição, e ao pé a fórmula.',
        porque:
          'É a resposta para "por que deu isso?". A conta inteira fica aberta, item por item, e fecha na soma que você vê no cartão.',
        tela: 'meu-resultado',
      },
      {
        titulo: 'Compare com os seus ciclos anteriores',
        oQueFazer: 'Desça até "evolução entre ciclos" e veja o score por competência.',
        porque:
          'Um número sozinho não informa. A série mostra tendência, que é o que serve para conversar sobre desempenho.',
        tela: 'meu-resultado',
      },
      {
        titulo: 'Discorde formalmente, se for o caso',
        oQueFazer:
          'Use "abrir contestação", aponte o indicador (ou o resultado inteiro) e descreva o motivo.',
        porque:
          'Discordar deixa de ser telefonema e vira registro com prazo e resposta. É o direito de revisão do art. 20 da LGPD funcionando na prática.',
        tela: 'contestacao',
      },
    ],
  },

  auditoria: {
    resumo:
      'Você enxerga as oito telas e não escreve em nenhuma. O percurso abaixo é o de conferir um ciclo do fim para o começo, que é como auditoria se faz.',
    passos: [
      {
        titulo: 'Comece pelo resultado publicado',
        oQueFazer: 'No painel da gestão, escolha a competência fechada e observe o ranking.',
        porque:
          'É o que foi divulgado. Toda conferência parte da afirmação que se quer testar.',
        tela: 'painel-gestao',
      },
      {
        titulo: 'Refaça a conta de um avaliado',
        oQueFazer: 'Em "meu resultado", selecione o gestor e abra a memória de cálculo.',
        porque:
          'O motor é determinístico: o mesmo insumo com a mesma regra dá o mesmo número, sempre. Se não der, existe defeito.',
        tela: 'meu-resultado',
      },
      {
        titulo: 'Confira a régua vigente na competência',
        oQueFazer:
          'Em "indicadores e regras", veja a vigência de cada versão e o diff entre elas.',
        porque:
          'Ciclo antigo tem de ser apurado com a regra da época. Regra editada no lugar apagaria essa possibilidade.',
        tela: 'indicadores',
      },
      {
        titulo: 'Volte aos insumos que geraram o número',
        oQueFazer:
          'Em "lançamento", escolha a área e compare o valor informado com a evidência declarada ao lado.',
        porque:
          'O score só é bom se o insumo for. A evidência é o que permite conferir a origem sem pedir favor a ninguém.',
        tela: 'lancamento',
      },
      {
        titulo: 'Cheque a condução do ciclo',
        oQueFazer:
          'No dashboard da CAM, veja em que estado o ciclo está e quais áreas ficaram pendentes.',
        porque:
          'Ciclo apurado com área faltando é achado de auditoria, e o funil mostra isso sem depender do relato de ninguém.',
        tela: 'painel-cam',
      },
      {
        titulo: 'Veja se quem discordou foi respondido',
        oQueFazer:
          'Na contestação, percorra os registros e confira se cada um tem resposta da comissão.',
        porque:
          'Contestação aberta sem resposta é o achado mais comum em processo de avaliação, e aqui ela fica visível em vez de arquivada.',
        tela: 'contestacao',
      },
      {
        titulo: 'Percorra a trilha do começo ao fim',
        oQueFazer:
          'Na auditoria, filtre pelo ciclo e leia os eventos em ordem: quem informou, quando, e qual era o valor anterior.',
        porque:
          'A trilha é append-only. É a única peça do sistema que serve de prova, justamente porque ninguém a edita.',
        tela: 'auditoria',
      },
      {
        titulo: 'Verifique o que o modelo NÃO fez',
        oQueFazer:
          'Em analytics, confira que cada modelo publica método, métrica e linha de base, e leia a limitação declarada.',
        porque:
          'Nenhuma saída de modelo entra no cálculo. Analytics aponta onde olhar; quem decide é a comissão, e a decisão é contestável.',
        tela: 'analytics',
      },
    ],
  },
}
