import type { FeatureId, PerfilId } from '@/lib/features'

/**
 * O aprendizado guiado, um por papel — os papéis que o cliente nomeou na
 * reunião de 22/08 (ADR-034).
 *
 * Cada passo é uma parada de um passeio DENTRO do sistema: com `?passo=N` a
 * página monta a tela do passo sozinha no palco e contorna o elemento que o
 * texto está descrevendo. Ver `src/components/sistema/tour.tsx`.
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
  /**
   * O `data-alvo` do elemento que o passo está descrevendo.
   *
   * É o que faz o passeio APONTAR em vez de só narrar. O nome tem de existir na
   * tela correspondente, e há teste que falha se não existir: um passo que
   * contorna o vazio é pior que um passo sem contorno.
   */
  readonly alvo: string | null
}

export interface Tutorial {
  readonly resumo: string
  readonly passos: readonly PassoTutorial[]
}

export const TUTORIAIS: Record<PerfilId, Tutorial> = {
  seab: {
    resumo:
      'Você coordena o processo inteiro. Os passos abaixo seguem a ordem de um mês de verdade, do começo ao resultado.',
    passos: [
      {
        titulo: 'Veja a régua de cada tipo de unidade',
        oQueFazer:
          'Esta tela mostra o que conta ponto: cada indicador, os subindicadores que o compõem, e a meta e o peso que valem para cada tipo de unidade, USF, CAPS, UPA ou policlínica.',
        porque:
          'Foi o que a reunião com o cliente deixou claro: a régua depende do tipo da unidade. Régua que muda no meio do caminho é o que faz as pessoas desconfiarem do resultado.',
        tela: 'indicadores',
        alvo: 'ind-regua',
      },
      {
        titulo: 'Veja quem já mandou os números',
        oQueFazer:
          'Cada barra mostra quantos subindicadores aquela unidade já informou no mês. Barra cheia: unidade em dia. Logo abaixo, a lista de quem ainda falta.',
        porque:
          'Hoje essa informação só existe cobrando por e-mail. Aqui ela aparece na tela, na hora, unidade por unidade.',
        tela: 'painel-seab',
        alvo: 'seab-funil',
      },
      {
        titulo: 'Lance por uma unidade, se precisar',
        oQueFazer:
          'Escolha a unidade e preencha os subindicadores: valor direto, ou numerador e denominador. A SEAB pode fazer isso no lugar de uma unidade atrasada.',
        porque:
          'O mês não pode travar por causa de uma unidade. E fica registrado que foi você quem lançou, não a unidade.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Avance a etapa do mês',
        oQueFazer:
          'O trilho no topo mostra em que etapa o mês está, e o quadro logo abaixo explica cada uma. Quando o prazo acabar, marque a confirmação e clique no botão laranja.',
        porque:
          'O mês anda uma etapa por vez, e cada avanço fica anotado no histórico. Assim ninguém tem dúvida se um número ainda pode mudar.',
        tela: 'painel-seab',
        alvo: 'seab-estado',
      },
      {
        titulo: 'Confira uma nota antes de divulgar',
        oQueFazer:
          'Escolha um gerente e abra a conta dele, linha por linha, com os subindicadores dentro de cada indicador. É a mesma tela que ele vai ver.',
        porque:
          'Olhar a nota com os olhos de quem recebe evita a pergunta sem resposta na reunião.',
        tela: 'meu-resultado',
        alvo: 'res-memoria',
      },
      {
        titulo: 'Veja o resumo geral',
        oQueFazer:
          'Escolha o mês e o distrito, ligue "esconder os nomes" se for apresentar em público, e baixe a planilha se precisar.',
        porque:
          'O resumo é o que vai para a reunião de gestão. A nota de cada distrito é a média das unidades dele, que é a nota do gerente distrital.',
        tela: 'painel-gestao',
        alvo: 'gest-ranking',
      },
      {
        titulo: 'Descubra onde olhar no próximo mês',
        oQueFazer:
          'Esta tela aponta as unidades com resultado mais baixo e os números que parecem erro de digitação.',
        porque:
          'Nada daqui muda a nota de ninguém. Serve para a SEAB saber onde ajudar primeiro.',
        tela: 'analytics',
        alvo: 'ana-risco',
      },
      {
        titulo: 'Acompanhe quem discordou',
        oQueFazer:
          'Aqui ficam os pedidos de revisão, com a situação e a resposta de cada um. No protótipo as respostas vêm da base de exemplo; o formulário de responder entra com a persistência real.',
        porque:
          'Pedido sem resposta escrita é caixa de sugestões. A resposta fica guardada junto do pedido, para sempre.',
        tela: 'contestacao',
        alvo: 'cont-lista',
      },
      {
        titulo: 'Mostre o que aconteceu',
        oQueFazer:
          'O histórico lista tudo: quem fez, quando, como estava antes e como ficou. Dá para filtrar por tipo ou por mês.',
        porque:
          'É a diferença entre dizer que o processo foi correto e conseguir provar que foi.',
        tela: 'auditoria',
        alvo: 'aud-linha',
      },
    ],
  },

  administrador: {
    resumo:
      'Você cuida da plataforma, não das notas. O caminho abaixo confere se a ferramenta está em ordem, do cadastro à trilha.',
    passos: [
      {
        titulo: 'Confira os cadastros',
        oQueFazer:
          'Esta tela lista o catálogo inteiro: indicadores, subindicadores e a régua de cada tipo de unidade. É o que você mantém em dia.',
        porque:
          'Cadastro errado vira nota errada. A régua é da SEAB, mas quem garante que ela está carregada certa é você.',
        tela: 'indicadores',
        alvo: 'ind-catalogo',
      },
      {
        titulo: 'Acompanhe o andamento do mês',
        oQueFazer:
          'O painel mostra a etapa do mês e o funil de lançamento por unidade. Você acompanha; quem avança a etapa é a SEAB.',
        porque:
          'Quando uma unidade liga dizendo que "não consegue lançar", a resposta começa aqui: ou o prazo fechou, ou é chamado de suporte.',
        tela: 'painel-seab',
        alvo: 'seab-funil',
      },
      {
        titulo: 'Veja o conjunto pelos painéis',
        oQueFazer:
          'O painel da gestão soma tudo: média, ranking das unidades e a nota de cada distrito.',
        porque:
          'Para dar suporte é preciso ver o que cada perfil vê. Este é o retrato que a gestão olha.',
        tela: 'painel-gestao',
        alvo: 'gest-numeros',
      },
      {
        titulo: 'Confira os sinais de analytics',
        oQueFazer:
          'Veja os números que parecem erro de digitação e as unidades em risco. Nada daqui muda nota.',
        porque:
          'É o lugar onde um problema de dado aparece primeiro, antes de virar contestação.',
        tela: 'analytics',
        alvo: 'ana-suspeitos',
      },
      {
        titulo: 'Percorra a trilha de auditoria',
        oQueFazer:
          'Filtre o histórico por tipo ou por mês e leia os registros: quem fez, quando, antes e depois.',
        porque:
          'A trilha só cresce, nunca encolhe, e ninguém a edita, nem você. É isso que faz dela prova.',
        tela: 'auditoria',
        alvo: 'aud-linha',
      },
    ],
  },

  gerente_distrital: {
    resumo:
      'Você responde pelo distrito: acompanha as unidades, revisa números na janela de revisão, e a sua nota é a média delas.',
    passos: [
      {
        titulo: 'Veja o retrato do seu distrito',
        oQueFazer:
          'O painel abre já recortado no seu distrito: a média, o ranking das suas unidades e quem está com aviso.',
        porque:
          'O seu resultado nasce daqui: a nota do distrito é a média das notas das unidades dele.',
        tela: 'painel-gestao',
        alvo: 'gest-ranking',
      },
      {
        titulo: 'Revise um lançamento na janela',
        oQueFazer:
          'Escolha a unidade e confira os subindicadores lançados. Nos dias finais do prazo, a janela de revisão, dá para corrigir: o valor antigo fica guardado.',
        porque:
          'Foi um pedido do cliente: cinco dias no fim do mês para revisão, com histórico. Corrigir às claras é diferente de apagar.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Veja a sua nota e a composição dela',
        oQueFazer:
          'Escolha um gerente distrital no seletor. O cartão mostra a média do distrito, e o quadro "como a média foi composta" abre a nota de cada unidade que entrou na conta.',
        porque:
          'Uma média sem composição é um número solto. Aqui dá para ver de onde cada décimo veio.',
        tela: 'meu-resultado',
        alvo: 'res-seletor',
      },
      {
        titulo: 'Discorde, se for o caso',
        oQueFazer:
          'Abra uma contestação, diga qual indicador (ou a nota toda) e escreva o motivo.',
        porque:
          'Discordar deixa de ser telefonema e vira pedido registrado, com prazo e resposta escrita.',
        tela: 'contestacao',
        alvo: 'cont-abrir',
      },
    ],
  },

  gerente_unidade: {
    resumo:
      'Você preenche os subindicadores da sua unidade e recebe a nota dela. O caminho abaixo é o seu mês inteiro.',
    passos: [
      {
        titulo: 'Escolha a sua unidade',
        oQueFazer:
          'Use a caixa de seleção. A lista abaixo muda e mostra só o que o TIPO da sua unidade preenche: um CAPS não vê os indicadores de pré-natal de uma USF.',
        porque:
          'Cada unidade responde pelos próprios números, e a régua dela depende do tipo. Foi o que o cliente explicou na reunião.',
        tela: 'lancamento',
        alvo: 'lanc-unidade',
      },
      {
        titulo: 'Preencha cada subindicador',
        oQueFazer:
          'Alguns pedem um valor direto; outros pedem numerador e denominador, por exemplo, gestantes com consulta em dia sobre gestantes cadastradas. Diga sempre de onde o número veio.',
        porque:
          'O indicador é calculado a partir do que você preenche. Número sem origem não dá para conferir depois, e a origem é o que protege você.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Errou? Corrija na janela de revisão',
        oQueFazer:
          'Envie de novo com o valor certo, até o fim do prazo. Os dias finais são a janela de revisão; o campo já mostra o que foi enviado antes.',
        porque:
          'A correção entra como registro novo e o valor antigo fica guardado. Corrigir às claras é diferente de apagar.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Veja a nota da sua unidade',
        oQueFazer:
          'Escolha o mês. O cartão do topo mostra a nota, de 0 a 100, e a faixa de pagamento que ela dá.',
        porque: 'Hoje a nota chega pronta, sem explicação. Aqui ela chega com a régua junto.',
        tela: 'meu-resultado',
        alvo: 'res-score',
      },
      {
        titulo: 'Abra a conta inteira',
        oQueFazer:
          'Clique em "memória de cálculo". Cada linha é um indicador, com os subindicadores que você preencheu dentro dela, a meta do seu tipo de unidade e os pontos que rendeu.',
        porque:
          'É a resposta para "por que a minha nota deu isso?". A conta fica aberta para você conferir, sem depender de ninguém.',
        tela: 'meu-resultado',
        alvo: 'res-memoria',
      },
      {
        titulo: 'Discorde, se for o caso',
        oQueFazer:
          'Clique em "abrir contestação", diga qual indicador (ou a nota toda) e escreva o motivo.',
        porque:
          'Discordar deixa de ser telefonema e vira pedido registrado, com prazo e resposta escrita. É um direito seu.',
        tela: 'contestacao',
        alvo: 'cont-abrir',
      },
    ],
  },
}
