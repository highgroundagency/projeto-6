import type { FeatureId, PerfilId } from '@/lib/features'

/**
 * O aprendizado guiado, um por papel.
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
  cam: {
    resumo:
      'Você cuida do processo inteiro. Os passos abaixo seguem a ordem de um mês de verdade, do começo ao resultado.',
    passos: [
      {
        titulo: 'Veja o que será medido',
        oQueFazer:
          'Esta tela é a lista do que conta ponto. Cada linha mostra um indicador, a meta dele e o peso: quanto maior o peso, mais ele vale na nota.',
        porque:
          'Antes de alguém informar número, todo mundo precisa conhecer a régua. Régua que muda no meio do caminho é o que faz as pessoas desconfiarem do resultado.',
        tela: 'indicadores',
        alvo: 'ind-catalogo',
      },
      {
        titulo: 'Veja quem já mandou os números',
        oQueFazer:
          'Cada barra mostra quantos números aquela área já informou no mês. Barra cheia: área em dia. Logo abaixo, a lista de quem ainda falta.',
        porque:
          'Hoje essa informação só existe cobrando por e-mail. Aqui ela aparece na tela, na hora.',
        tela: 'painel-cam',
        alvo: 'cam-funil',
      },
      {
        titulo: 'Lance por uma área, se precisar',
        oQueFazer:
          'Escolha a área e digite o valor e a origem dele. A comissão pode fazer isso no lugar de uma área atrasada.',
        porque:
          'O mês não pode travar por causa de uma área. E fica registrado que foi você quem lançou, não a área.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Avance a etapa do mês',
        oQueFazer:
          'O trilho no topo mostra em que etapa o mês está, e o quadro logo abaixo explica cada uma. Quando o prazo acabar, marque a confirmação e clique no botão laranja.',
        porque:
          'O mês anda uma etapa por vez, e cada avanço fica anotado no histórico. Assim ninguém tem dúvida se um número ainda pode mudar.',
        tela: 'painel-cam',
        alvo: 'cam-estado',
      },
      {
        titulo: 'Confira uma nota antes de divulgar',
        oQueFazer:
          'Escolha um gestor e abra a conta dele, linha por linha. É a mesma tela que ele vai ver.',
        porque:
          'Olhar a nota com os olhos de quem recebe evita a pergunta sem resposta na reunião.',
        tela: 'meu-resultado',
        alvo: 'res-memoria',
      },
      {
        titulo: 'Veja o resumo geral',
        oQueFazer:
          'Escolha o mês, ligue "esconder os nomes" se for apresentar em público, e baixe a planilha se precisar.',
        porque:
          'O resumo é o que vai para a reunião de gestão. Esconder os nomes deixa comparar as áreas sem expor pessoas.',
        tela: 'painel-gestao',
        alvo: 'gest-ranking',
      },
      {
        titulo: 'Descubra onde olhar no próximo mês',
        oQueFazer:
          'Esta tela aponta as áreas com resultado mais baixo e os números que parecem erro de digitação.',
        porque:
          'Nada daqui muda a nota de ninguém. Serve para a comissão saber onde ajudar primeiro.',
        tela: 'analytics',
        alvo: 'ana-risco',
      },
      {
        titulo: 'Responda quem discordou',
        oQueFazer:
          'Aqui ficam os pedidos de revisão. Leia o motivo de cada um e responda por escrito.',
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

  area_tecnica: {
    resumo:
      'Seu papel é simples e é o mais importante de todos: informar o número certo, dizer de onde ele veio, e dentro do prazo.',
    passos: [
      {
        titulo: 'Escolha a sua área',
        oQueFazer:
          'Use a caixa de seleção. A lista abaixo muda e passa a mostrar só os indicadores da área escolhida.',
        porque: 'Cada área responde pelos próprios números, e só pelos próprios.',
        tela: 'lancamento',
        alvo: 'lanc-area',
      },
      {
        titulo: 'Digite o valor e diga de onde veio',
        oQueFazer:
          'Preencha o número e, ao lado, a origem dele: o relatório ou o sistema de onde você tirou. Os dois campos são obrigatórios.',
        porque:
          'Número sem origem não dá para conferir depois. A origem é o que protege você se alguém duvidar.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Repare no aviso laranja',
        oQueFazer:
          'Se o valor ficar muito longe da meta, aparece um aviso embaixo do campo. Ele não trava o envio: só pede que você confira.',
        porque:
          'O erro mais comum é a vírgula no lugar errado. O sistema avisa, e quem decide é você, que tem o dado na mão.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Errou? Corrija sem medo',
        oQueFazer:
          'Envie de novo com o valor certo. O campo já mostra o que foi enviado antes.',
        porque:
          'A correção entra como registro novo e o valor antigo fica guardado. Corrigir às claras é diferente de apagar.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
    ],
  },

  gestor: {
    resumo:
      'Você é quem recebe a nota. Aqui dá para entender a conta inteira, e discordar dela por escrito se for o caso.',
    passos: [
      {
        titulo: 'Veja a sua nota',
        oQueFazer:
          'Escolha o mês. O cartão do topo mostra a nota, de 0 a 100, e a faixa de pagamento que ela dá.',
        porque: 'Hoje a nota chega pronta, sem explicação. Aqui ela chega com a régua junto.',
        tela: 'meu-resultado',
        alvo: 'res-score',
      },
      {
        titulo: 'Abra a conta inteira',
        oQueFazer:
          'Clique em "memória de cálculo". É o extrato da nota: cada linha mostra um indicador, o valor informado, a meta e os pontos que ele rendeu. No fim, a soma que vira a nota.',
        porque:
          'É a resposta para "por que a minha nota deu isso?". A conta fica aberta para você conferir, sem depender de ninguém.',
        tela: 'meu-resultado',
        alvo: 'res-memoria',
      },
      {
        titulo: 'Compare com os meses anteriores',
        oQueFazer: 'As barras mostram a sua nota mês a mês.',
        porque: 'Um número sozinho diz pouco. A sequência mostra para onde você está indo.',
        tela: 'meu-resultado',
        alvo: 'res-evolucao',
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

  auditoria: {
    resumo:
      'Você pode ver tudo e não mexe em nada. O caminho abaixo confere um mês do fim para o começo, que é como se audita.',
    passos: [
      {
        titulo: 'Comece pelo resultado divulgado',
        oQueFazer: 'Escolha um mês fechado e olhe o ranking.',
        porque: 'Toda conferência começa pelo que foi divulgado: é a afirmação a testar.',
        tela: 'painel-gestao',
        alvo: 'gest-ranking',
      },
      {
        titulo: 'Refaça a conta de alguém',
        oQueFazer: 'Escolha um gestor e abra a conta dele, linha por linha.',
        porque:
          'A regra é sempre a mesma: a mesma entrada tem de dar a mesma nota. Se não der, há um problema.',
        tela: 'meu-resultado',
        alvo: 'res-memoria',
      },
      {
        titulo: 'Confira qual régua valia naquele mês',
        oQueFazer:
          'Veja as versões da regra e o quadro do que mudou de uma versão para a outra.',
        porque:
          'Mês antigo se confere com a regra da época. Por isso regra antiga nunca é apagada, só substituída.',
        tela: 'indicadores',
        alvo: 'ind-regras',
      },
      {
        titulo: 'Volte aos números de origem',
        oQueFazer:
          'Escolha a área e compare o valor informado com a origem declarada ao lado dele.',
        porque: 'A nota só é boa se o número que entrou for bom.',
        tela: 'lancamento',
        alvo: 'lanc-formularios',
      },
      {
        titulo: 'Cheque a condução do mês',
        oQueFazer: 'Veja em que etapa o mês está e quais áreas ficaram devendo.',
        porque:
          'Mês fechado com área faltando é um achado de auditoria, e aqui isso aparece na tela.',
        tela: 'painel-cam',
        alvo: 'cam-funil',
      },
      {
        titulo: 'Veja se quem discordou foi respondido',
        oQueFazer: 'Percorra os pedidos de revisão e confira se cada um tem resposta.',
        porque:
          'Pedido sem resposta é o problema mais comum nesse tipo de processo. Aqui ele fica visível.',
        tela: 'contestacao',
        alvo: 'cont-lista',
      },
      {
        titulo: 'Percorra o histórico completo',
        oQueFazer:
          'Filtre pelo mês e leia os registros em ordem: quem fez, quando, antes e depois.',
        porque:
          'O histórico não pode ser editado por ninguém. É por isso que ele serve de prova.',
        tela: 'auditoria',
        alvo: 'aud-linha',
      },
      {
        titulo: 'Confira o que o robô não faz',
        oQueFazer:
          'Na tela de sinais, veja que cada modelo mostra o método e o acerto, comparado com um palpite simples.',
        porque:
          'Nenhum resultado de modelo entra na nota de ninguém. Ele só aponta onde olhar, e isso está escrito na tela.',
        tela: 'analytics',
        alvo: 'ana-modelos',
      },
    ],
  },
}
