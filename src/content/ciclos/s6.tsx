import { Lista, Nota, Secao, Tabela } from '@/components/conteudo'
import { nomeCurto, type IntegranteId } from '@/content/equipe'
import type { Documento, RegistroSemana } from '@/lib/registro/tipos'

/**
 * Semana 6: Pré-SR1. A semana vai de 26/09 a 02/10.
 *
 * PÚBLICA PARA O VISITANTE DESDE 25/09. Pelo calendário seria 19/09, com o
 * adiantamento de sete dias, mas a produção lia o adiantamento como zero até o
 * deploy de 2aede44 (docs/releases.md). E o selo `rascunho` não aparece para
 * ninguém (ADR-026): o visitante lê tudo aqui como fato. Por isso a regra deste
 * arquivo é dura: só entra o que tem fonte no repositório, com data.
 *
 * REESCRITO E CONFERIDO EM 02/10, último dia da semana, a pedido do Gabriel. O
 * que era plano ("vamos fechar o pacote", "vamos ensaiar") virou o que o
 * repositório registra: a revisão do deck em 28/09 (ba7f393, ADR-047) e a
 * Atividade 2 de Direito como documento do SR1. O ensaio e a conferência dos
 * links no site publicado não têm registro, e por isso não entraram; quem
 * ensaiar acrescenta a linha com a data e o tempo medido. Também mudaram: as
 * oito telas (25/09, e não "com a liberação desta semana"), a data das análises
 * de segurança e privacidade (15/08, commit 38cde3a), as decisões que
 * descreviam o deck de 24/09 e a pergunta 13 nos bloqueios.
 *
 * Validados: objetivo, avanços, decisões, bloqueios, próximos passos e
 * evidências. Em `rascunho`: o feedback, porque "nenhum" não se confere no
 * repositório, e os responsáveis, que cada integrante confirma.
 */
export const registro = {
  ciclo: 's6',
  marcador: 'PRUMO-MARCADOR-CICLO-s6',

  objetivo: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo:
      'Chegar ao SR1 com o protótipo navegável, o pacote de entrega fechado e a apresentação ensaiada pelos sete.',
  },

  avancos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Desde 25/09, as oito telas do sistema estão no ar. Naquele dia entraram juntas meu resultado, a trilha de auditoria, o painel da gestão, analytics e contestação.',
      'As análises de segurança e de privacidade existem desde 15/08. Agora a de segurança também está no site, no pacote do SR1.',
      'Riscos, escopo revisado e backlog com estado viraram documentos desta semana. Antes, nenhum dos três estava no site.',
      'As orientações do SR1 chegaram em 28/09: até 15 minutos, com seis critérios de conteúdo e a apresentação avaliada à parte. O deck foi refeito na ordem delas (ADR-047).',
      'Em 28/09, o deck foi revisado como banca antes de ir para o Drive. As afirmações que o repositório não sustentava mudaram (ADR-047).',
      'A Atividade 2 de Direito, com entrega em 28/09, virou documento do SR1: os requisitos de privacy by design, cada um com o estado no sistema.',
    ],
  },

  decisoes: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      {
        decisao: 'A apresentação do SR1 segue a ordem das orientações e abre pelo problema.',
        porque:
          'O problema é o que sustenta o projeto, como no Kick-off, e a imersão no problema é o primeiro critério das orientações. A conta aberta aparece depois, na demonstração ao vivo.',
      },
      {
        decisao: 'A arquitetura não tem slide próprio no deck do SR1.',
        porque:
          'Nenhum dos sete critérios das orientações de 28/09 é de arquitetura. O slide das disciplinas cita o C4 em quatro níveis, e o desenho fica em /arquitetura.',
      },
      {
        decisao: 'O roteiro da apresentação sai do registro da semana.',
        porque:
          'Material de preparação não é entrega (ADR-040). O roteiro fica em docs/pitch-sr1.md, e a fala de cada slide fica nas notas de /sr1.',
      },
    ],
  },

  bloqueios: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'As perguntas 4 e 6 a 13 para a Secretaria continuam abertas. Sem elas, os cortes das classes seguem como suposição, e falta a autorização por escrito para publicar a base por unidade.',
    ],
  },

  /* "nenhum" fica em rascunho: a ausência de retorno não se confere no
     repositório. As orientações de 28/09 são regra da avaliação, não retorno
     sobre o projeto. */
  feedback: { selo: 'rascunho', validadoPor: null, conteudo: 'nenhum' },

  proximosPassos: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      'Apresentar o SR1.',
      'Anotar o retorno da banca no registro do SR1, dizendo de quem veio cada fala.',
      'Reordenar o backlog pelo que a banca apontar.',
    ],
  },

  /* Em rascunho até cada integrante confirmar a própria linha e passá-la para o
     que de fato fez. A lista segue a frente de cada um (src/content/equipe.ts) e
     a divisão da fala no deck do SR1 (src/content/apresentacao-sr1.ts). */
  responsaveis: {
    selo: 'rascunho',
    validadoPor: null,
    conteudo: [
      {
        integrante: 'gabriel',
        contribuicao:
          'Fecha o pacote do SR1 e o backlog com estado.',
      },
      {
        integrante: 'joao-pedro',
        contribuicao: 'Prepara a demonstração ao vivo e o caminho de reserva.',
      },
      {
        integrante: 'joao-henrique',
        contribuicao: 'Confere o escopo revisado contra o código.',
      },
      {
        integrante: 'fernando',
        contribuicao: 'Confere o registro de riscos e a segurança publicada no site.',
      },
      {
        integrante: 'matheus',
        contribuicao: 'Consolida a pesquisa e leva as perguntas abertas à Secretaria.',
      },
      {
        integrante: 'rafael',
        contribuicao:
          'Prepara os slides dos critérios da escolha, das quatro disciplinas e do balanço.',
      },
      { integrante: 'kerry', contribuicao: 'Apoia a síntese da pesquisa e o ensaio.' },
    ],
  },

  evidencias: {
    selo: 'validado',
    validadoPor: 'gabriel',
    conteudo: [
      { tipo: 'prototipo', rotulo: 'Protótipo navegável', url: '/sistema' },
      { tipo: 'documento', rotulo: 'Cronograma com responsável', url: '/#cronograma' },
    ],
  },
} satisfies RegistroSemana

/* ---------------------------------------------------------------------------
   Riscos
   ------------------------------------------------------------------------- */

type Nivel = 'já acontece' | 'alta' | 'média' | 'baixa'

export interface Risco {
  readonly risco: string
  readonly probabilidade: Nivel
  readonly impacto: string
  readonly mitigacao: string
  /** O dono segue a frente de cada um em `src/content/equipe.ts`. */
  readonly dono: IntegranteId
}

/**
 * O registro de riscos do Pré-SR1.
 *
 * Os nove primeiros vieram da auditoria de 24/09. Os três últimos, das
 * orientações de 28/09 (ADR-047), das perguntas à banca e da ADR-043. "já
 * acontece" quer dizer que o risco não é hipótese: o fato já está no código ou
 * no repositório.
 */
export const RISCOS: readonly Risco[] = [
  {
    risco:
      'Os cortes das classes e os percentuais são suposição nossa. A v3 usa 0,80 como corte, e os percentuais estão no Decreto 36.482/2023, que não temos.',
    probabilidade: 'alta',
    impacto: 'Alto: uma nota pode cair na classe errada.',
    mitigacao:
      'Levar as perguntas 6 e 7 à SEAB. Buscar o decreto, que é ato público. A resposta entra como versão nova da regra.',
    dono: 'matheus',
  },
  {
    risco: 'O sistema usa 8 indicadores de teste. A portaria tem 5, com outros itens medidos.',
    probabilidade: 'já acontece',
    impacto: 'Alto: a demonstração prova o método, não a régua oficial.',
    mitigacao:
      'Dizer isso na tela e em voz alta. Trocar o catálogo pelos 5 da portaria depois do SR1.',
    dono: 'joao-henrique',
  },
  {
    risco:
      'O porte das unidades ficou fora: USF 1 a 8, MAC 1 a 4, CAPS II ou III e CAPS III 24h.',
    probabilidade: 'já acontece',
    impacto: 'Médio: a meta ou o peso podem mudar com o porte.',
    mitigacao:
      'Perguntar à SEAB o que o porte muda. Ele entra como campo da regra, sem mudar a forma do motor (ADR-042).',
    dono: 'matheus',
  },
  {
    risco: 'O prazo de contestação do art. 9º não existe no sistema.',
    probabilidade: 'já acontece',
    impacto: 'Alto: é uma regra da portaria, e a tela aceita pedido fora do prazo.',
    mitigacao:
      'A tela já diz que o prazo ainda não existe. Levar o prazo para a regra nas sprints.',
    dono: 'joao-henrique',
  },
  {
    risco: 'A escrita do protótipo fica em memória: some no reinício e pode não valer entre duas instâncias do servidor.',
    probabilidade: 'média',
    impacto: 'Médio: um lançamento feito na demonstração pode não aparecer na tela seguinte.',
    mitigacao:
      'Desde 25/09 cada visitante escreve numa cópia própria, e a tela diz isso. Levar a reserva no próprio slide e o PDF.',
    dono: 'joao-henrique',
  },
  {
    risco: 'A demonstração ao vivo precisa de sessão de admin para fechar o mês.',
    probabilidade: 'média',
    impacto: 'Alto: sem a sessão, nenhuma nota nova aparece na frente da banca.',
    mitigacao: 'Testar a sessão antes de começar. Levar a reserva no próprio slide e o PDF.',
    dono: 'joao-pedro',
  },
  {
    risco: 'A agenda da SEAB e da CAM pode não abrir a tempo.',
    probabilidade: 'média',
    impacto: 'Alto: a conferência da conta com a Secretaria atrasa.',
    mitigacao:
      'Mandar as perguntas por escrito antes do SR1. Pedir a data da Semana 11 já agora.',
    dono: 'gabriel',
  },
  {
    risco:
      "O schema guardado em supabase/migrations/ ainda tem 'cam' como perfil. O app diz 'seab'.",
    probabilidade: 'já acontece',
    impacto: 'Baixo: o schema não está ligado ao app.',
    mitigacao: 'Alinhar o schema antes de ligar qualquer banco. A diferença está na ADR-042.',
    dono: 'joao-henrique',
  },
  {
    risco:
      'A base por unidade da SESAU está num repositório público. Em 39 das 90 combinações de tipo e distrito há uma unidade só.',
    probabilidade: 'já acontece',
    impacto: 'Alto: a unidade única pode apontar o gerente, que recebe a gratificação.',
    mitigacao:
      'Pedir à Secretaria a autorização por escrito para publicar. Decidir entre generalizar e justificar. Dado de pessoa segue barrado por teste.',
    dono: 'fernando',
  },
  {
    risco:
      'A apresentação passar dos 15 minutos. As orientações de 28/09 dizem que a banca interrompe no limite.',
    probabilidade: 'média',
    impacto: 'Alto: o que vem depois do corte não é avaliado.',
    mitigacao:
      'O deck fecha abaixo de 12 minutos de fala, com mais de 3 de margem. Ensaiar os sete, com cronômetro e a demonstração inteira.',
    dono: 'gabriel',
  },
  {
    risco:
      'A pesquisa não tem entrevista com quem opera o processo. As personas vieram do caso.',
    probabilidade: 'já acontece',
    impacto: 'Médio: a banca pode não aceitar como pesquisa consolidada.',
    mitigacao:
      'Perguntar à banca se a pesquisa precisa ser primária. Entrevistar na Semana 11, com o roteiro de validação.',
    dono: 'matheus',
  },
  {
    risco: 'O sistema roda na base de teste, e a lente de ML roda na base da SESAU.',
    probabilidade: 'já acontece',
    impacto: 'Médio: os números de /sistema e de /ml não se comparam.',
    mitigacao: 'Dizer qual base cada tela usa. Não misturar os números na apresentação.',
    dono: 'rafael',
  },
]

/* ---------------------------------------------------------------------------
   Backlog com estado
   ------------------------------------------------------------------------- */

export type Moscow = 'M' | 'S' | 'C'

/** O estado conferido no código em 25/09, não o prometido. */
export type EstadoHistoria = 'no_ar' | 'so_leitura' | 'em_parte' | 'falta'

export const ROTULO_ESTADO_HISTORIA: Record<EstadoHistoria, string> = {
  no_ar: 'no ar',
  so_leitura: 'só leitura',
  em_parte: 'em parte',
  falta: 'falta',
}

export interface Historia {
  readonly epico: string
  /** A história da Semana 4, encurtada para caber na tabela. */
  readonly historia: string
  readonly moscow: Moscow
  readonly estado: EstadoHistoria
  /** Onde o estado se confere, em uma frase. */
  readonly onde: string
}

/**
 * As 26 histórias do backlog inicial da Semana 4, com o estado de hoje.
 *
 * O documento da Semana 4 fica como estava: ele é o registro daquela semana.
 * Aqui a mesma lista ganha uma coluna, conferida contra o código.
 */
export const BACKLOG: readonly Historia[] = [
  {
    epico: 'Ciclo',
    historia: 'SEAB abre um ciclo de avaliação',
    moscow: 'M',
    estado: 'falta',
    onde: 'Os meses vêm prontos da base de teste. Não há ação de abrir ciclo',
  },
  {
    epico: 'Ciclo',
    historia: 'SEAB define a janela de lançamento, com a revisão nos dias finais',
    moscow: 'M',
    estado: 'falta',
    onde: 'A janela vem da base de teste. A tela de lançamento só mostra as datas',
  },
  {
    epico: 'Ciclo',
    historia: 'SEAB avança a etapa do ciclo',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Painel da SEAB. Só com sessão de admin (ADR-015)',
  },
  {
    epico: 'Ciclo',
    historia: 'SEAB aprova o ciclo, e os resultados não mudam mais',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Homologar faz a conta de todas as unidades. Só com sessão de admin',
  },
  {
    epico: 'Ciclo',
    historia: 'SEAB publica o ciclo para os gerentes',
    moscow: 'S',
    estado: 'no_ar',
    onde: 'É a última etapa do mesmo botão. Só com sessão de admin',
  },
  {
    epico: 'Régua',
    historia: 'SEAB cadastra indicadores formados por itens medidos',
    moscow: 'M',
    estado: 'so_leitura',
    onde: 'Tela de indicadores. O catálogo aparece, mas não há cadastro',
  },
  {
    epico: 'Régua',
    historia: 'SEAB define quais indicadores valem por tipo, com meta e peso',
    moscow: 'M',
    estado: 'so_leitura',
    onde: 'Tela de indicadores mostra a régua por tipo. Mudar é por código',
  },
  {
    epico: 'Régua',
    historia: 'SEAB cria uma versão nova da regra sem alterar ciclos fechados',
    moscow: 'M',
    estado: 'so_leitura',
    onde: 'As regras v1, v2 e v3 existem como dado. A v3 entrou por código em 23/09',
  },
  {
    epico: 'Régua',
    historia: 'SEAB compara duas versões da regra',
    moscow: 'S',
    estado: 'no_ar',
    onde: 'Tela de indicadores: o quadro do que mudou entre duas versões',
  },
  {
    epico: 'Régua',
    historia: 'SEAB define de quando até quando a regra vale',
    moscow: 'M',
    estado: 'so_leitura',
    onde: 'A vigência aparece em cada versão. Não há como editar',
  },
  {
    epico: 'Lançamento',
    historia: 'Gerente de unidade informa cada item medido',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Tela de lançamento: valor, ou numerador e denominador',
  },
  {
    epico: 'Lançamento',
    historia: 'Gerente de unidade anexa a evidência do dado',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Campo "de onde veio", em texto. Não há envio de arquivo',
  },
  {
    epico: 'Lançamento',
    historia: 'Gerente de unidade corrige na janela de revisão, com o valor antigo guardado',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'A correção vira lançamento novo. O antigo fica na trilha',
  },
  {
    epico: 'Lançamento',
    historia: 'Gerente distrital revisa os dados das unidades do distrito',
    moscow: 'S',
    estado: 'em_parte',
    onde: 'O perfil distrital lança e corrige, mas o seletor mostra todas as unidades',
  },
  {
    epico: 'Lançamento',
    historia: 'Gerente de unidade é avisado de valor fora do padrão antes de enviar',
    moscow: 'C',
    estado: 'falta',
    onde: 'Não há aviso antes do envio',
  },
  {
    epico: 'Resultado',
    historia: 'Gerente de unidade vê a nota e a faixa da unidade',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Tela meu resultado',
  },
  {
    epico: 'Resultado',
    historia: 'Gerente de unidade abre a memória de cálculo, item por item',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Tela meu resultado, com a conta inteira aberta',
  },
  {
    epico: 'Resultado',
    historia: 'Gerente distrital vê a nota como média das unidades, com a conta aberta',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Tela meu resultado, no perfil distrital',
  },
  {
    epico: 'Resultado',
    historia: 'Gerente compara os próprios ciclos',
    moscow: 'S',
    estado: 'no_ar',
    onde: 'Tela meu resultado: a evolução mês a mês',
  },
  {
    epico: 'Resultado',
    historia: 'Gerente abre contestação',
    moscow: 'S',
    estado: 'no_ar',
    onde: 'Tela de contestação, sem o prazo do art. 9º',
  },
  {
    epico: 'Resultado',
    historia: 'SEAB responde à contestação, com tudo registrado',
    moscow: 'S',
    estado: 'falta',
    onde: 'A tela mostra respostas da base de teste. Não há como responder',
  },
  {
    epico: 'Governança',
    historia: 'Administrador vê a linha do tempo de tudo o que aconteceu',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'Trilha de auditoria, no ar desde 25/09',
  },
  {
    epico: 'Governança',
    historia: 'Administrador garante que nada pode ser apagado',
    moscow: 'M',
    estado: 'no_ar',
    onde: 'A trilha só recebe linha nova. Não existe caminho de apagar',
  },
  {
    epico: 'Governança',
    historia: 'SEAB vê os totais por distrito',
    moscow: 'S',
    estado: 'no_ar',
    onde: 'Painel da gestão: nota por distrito',
  },
  {
    epico: 'Governança',
    historia: 'SEAB exporta os resultados em CSV',
    moscow: 'C',
    estado: 'no_ar',
    onde: 'Painel da gestão: o botão de baixar a planilha',
  },
  {
    epico: 'Governança',
    historia: 'SEAB vê o risco de a meta não ser atingida no próximo ciclo',
    moscow: 'C',
    estado: 'no_ar',
    onde: 'Analytics: unidades com risco de não bater a meta',
  },
]

/** Quantas histórias de uma prioridade estão em cada estado. */
export function contarBacklog(moscow: Moscow, estado?: EstadoHistoria): number {
  return BACKLOG.filter((h) => h.moscow === moscow && (!estado || h.estado === estado)).length
}

/**
 * Dívida técnica que não é história de usuário. Cada item diz de onde veio,
 * para ninguém ter de acreditar na lista.
 */
const BACKLOG_TECNICO = [
  ['Trocar os 8 indicadores de teste pelos 5 da portaria', 'docs/retomada.md'],
  ['Levar o porte das unidades para a regra', 'ADR-042'],
  ['Levar o prazo do art. 9º para a contestação', 'Portaria, art. 9º; docs/arquitetura.md'],
  ['Tratar o Indicador 3, que é bimestral', 'docs/perguntas-para-a-sesau.md, pergunta 4'],
  ["Alinhar o schema guardado: o perfil 'cam' vira 'seab'", 'ADR-042'],
  ['Tirar da memória o contador de tentativas do login', 'docs/seguranca.md'],
  ["Trocar 'unsafe-inline' da CSP por nonce", 'docs/seguranca.md'],
  ['Manter os dois caminhos do motor conferidos juntos', 'ADR-041'],
] as const

/* ---------------------------------------------------------------------------
   Documentos
   ------------------------------------------------------------------------- */

export const documentos = [
  {
    id: 'checklist',
    titulo: 'Checklist do SR1',
    resumo: 'o que precisa estar pronto, e como saber que cada item está pronto.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Item', 'Critério de pronto']}
          linhas={[
            ['Problema e pergunta', 'Os dois publicados na página, com o nome do cliente'],
            [
              'Pesquisa consolidada',
              'Cada fonte com a data e o que ela mudou no produto. A matriz CSD atualizada',
            ],
            [
              'Protótipo navegável',
              'As oito telas abrem. Do lançamento à memória de cálculo, sem tela morta',
            ],
            ['Riscos, escopo e backlog', 'Os três documentos desta semana, com dono e estado'],
            [
              'Evidências técnicas',
              'Arquitetura, nuvem, segurança, privacidade, ML e uso de IA, todos no site',
            ],
            [
              'Correção de rota',
              'Planejado contra realizado, com motivo e ajuste de cada desvio',
            ],
            [
              'Registro semanal',
              'Todas as semanas que já passaram estão publicadas e validadas',
            ],
            [
              'Apresentação',
              'Ensaiada pelos sete e cronometrada. Fecha em até 13 minutos, dentro dos 15 das orientações de 28/09',
            ],
            [
              'Slides no Drive',
              'O PDF do deck na pasta da equipe, com cada slide numerado como atual/total',
            ],
          ]}
        />
      </>
    ),
  },
  {
    id: 'riscos',
    titulo: 'Riscos',
    resumo: 'o que pode dar errado até o sr2, com probabilidade, impacto, mitigação e dono.',
    Conteudo: () => (
      <>
        <Tabela
          colunas={['Risco', 'Probabilidade', 'Impacto', 'Mitigação', 'Dono']}
          linhas={RISCOS.map((r) => [
            r.risco,
            r.probabilidade,
            r.impacto,
            r.mitigacao,
            nomeCurto(r.dono),
          ])}
        />
        <div className="mt-3">
          <Nota>
            “Já acontece” quer dizer que o risco não é hipótese: o fato já está no código ou no
            repositório. O dono segue a frente de cada um na equipe. As fontes são
            docs/perguntas-para-a-sesau.md, docs/perguntas-para-a-banca.md, docs/seguranca.md,
            docs/privacidade.md e as ADR-041 a ADR-047.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'escopo-revisado',
    titulo: 'Escopo revisado',
    resumo: 'o que entrou, o que saiu e o que ficou para depois da portaria e da planilha.',
    Conteudo: () => (
      <>
        <p>
          O escopo da Semana 4 foi escrito antes da portaria e da planilha. Esta é a revisão
          depois das duas. Cada linha diz o motivo e onde ele se confere.
        </p>
        <div className="mt-4">
          <Secao titulo="Entra">
            <Tabela
              colunas={['O quê', 'Por quê', 'Fonte']}
              linhas={[
                [
                  'Os sete tipos de unidade da portaria: USF, UBT, UBT Mista, CAPS, CECON, UCIS e MAC',
                  'UPA e policlínica não existem na portaria',
                  'ADR-042',
                ],
                [
                  'A regra v3: média das notas, peso redistribuído e nota de 0 a 1',
                  'É o método da planilha da Secretaria, lida em 22/09',
                  'ADR-041',
                ],
                [
                  'Item em que passar do alvo também perde ponto',
                  'A planilha tem esse caso, e a régua antiga premiaria o exagero',
                  'ADR-041',
                ],
                [
                  'Numerador maior que denominador vira erro',
                  'A planilha marca ERRO na célula. Antes, passava como nota cheia',
                  'ADR-041',
                ],
                [
                  'A base por unidade da SESAU, só na lente de ML',
                  'É dado da instituição, sem nome, CPF, matrícula, e-mail ou telefone de ninguém, com autorização',
                  'ADR-043 e ADR-044',
                ],
                [
                  'As oito telas no protótipo do SR1',
                  'A banca navega o protótipo inteiro, e não só metade',
                  'src/lib/features.ts',
                ],
              ]}
            />
          </Secao>
          <Secao titulo="Sai">
            <Tabela
              colunas={['O quê', 'Por quê', 'Fonte']}
              linhas={[
                ['UPA e policlínica como tipos de unidade', 'Não estão na portaria', 'ADR-042'],
                [
                  'O método antigo como regra dos meses novos',
                  'A planilha mostrou que ele estava errado. Ele fica só para os meses até maio',
                  'ADR-041',
                ],
                [
                  'A base inventada na lente de ML',
                  'A lente passou a ler a base real por unidade',
                  'ADR-043',
                ],
              ]}
            />
          </Secao>
          <Secao titulo="Fica para depois do SR1">
            <Tabela
              colunas={['O quê', 'Por quê', 'Fonte']}
              linhas={[
                [
                  'Os 5 indicadores da portaria no lugar dos 8 de teste',
                  'Trocar o catálogo é trabalho grande. Cabe nas sprints',
                  'docs/retomada.md',
                ],
                [
                  'O porte das unidades',
                  'Falta saber se ele muda a meta, o peso ou os dois',
                  'ADR-042',
                ],
                [
                  'O prazo de contestação do art. 9º',
                  'É regra da portaria e ainda não está no motor',
                  'Portaria, art. 9º',
                ],
                [
                  'O Indicador 3, que é bimestral',
                  'O motor não trata a exceção, e falta a resposta da SEAB',
                  'Pergunta 4 à SESAU',
                ],
                [
                  'Os cortes das classes e os percentuais',
                  'Estão como suposição até a SEAB responder',
                  'Perguntas 6 e 7 à SESAU',
                ],
                [
                  'Abrir ciclo e definir a janela pela tela',
                  'Hoje os meses vêm prontos da base de teste',
                  'Backlog abaixo',
                ],
              ]}
            />
          </Secao>
        </div>
        <div className="mt-3">
          <Nota>
            Continua fora, como na Semana 4: folha de pagamento, login da prefeitura, aplicativo
            de celular e outras verbas. O dado real continua fora do sistema. Ele entrou só na
            lente de ML, e só o da instituição.
          </Nota>
        </div>
      </>
    ),
  },
  {
    id: 'backlog',
    titulo: 'Backlog com estado',
    resumo: 'as 26 histórias da semana 4, cada uma com o estado conferido no código.',
    Conteudo: () => (
      <>
        <p>
          As mesmas histórias do backlog inicial da Semana 4, agora com o estado de hoje. São{' '}
          {BACKLOG.length} histórias: {contarBacklog('M')} obrigatórias (Must),{' '}
          {contarBacklog('S')} desejáveis (Should) e {contarBacklog('C')} possíveis (Could).
        </p>
        <div className="mt-4">
          <Tabela
            colunas={['Épico', 'História', 'MoSCoW', 'Estado', 'Onde se confere']}
            linhas={BACKLOG.map((h) => [
              h.epico,
              h.historia,
              h.moscow,
              ROTULO_ESTADO_HISTORIA[h.estado],
              h.onde,
            ])}
          />
        </div>
        <div className="mt-3">
          <Nota>
            Das {contarBacklog('M')} obrigatórias, {contarBacklog('M', 'no_ar')} estão no ar,{' '}
            {contarBacklog('M', 'so_leitura')} só mostram o que existe e{' '}
            {contarBacklog('M', 'falta')} faltam. “Só leitura” quer dizer que a tela mostra o
            dado, mas mudar ainda é por código.
          </Nota>
        </div>
        <div className="mt-6">
          <Secao
            titulo="Backlog técnico"
            descricao="O trabalho que não é história de usuário, e de onde cada item veio."
          >
            <Tabela colunas={['Item', 'Fonte']} linhas={BACKLOG_TECNICO} />
          </Secao>
        </div>
        <div className="mt-3">
          <Lista
            itens={[
              'A ordem das sprints sai depois do SR1, com o retorno da banca.',
              'O cronograma com responsável de cada entrega está na seção de cronograma desta página.',
            ]}
          />
        </div>
      </>
    ),
  },
] as const satisfies readonly Documento[]
