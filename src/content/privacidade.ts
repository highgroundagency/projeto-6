import { MARCOS_PARALELOS } from '@/lib/cronograma'

/**
 * A ATIVIDADE 2 DE DIREITO, COMO DADO.
 *
 * "Levantamento de requisitos de privacy by design", da disciplina de
 * Fundamentos de Projeto 6: tópicos em direito (30% da AV1). O PDF entregue é
 * o original; aqui fica a transcrição que o site renderiza (regra 5: documento
 * de entrega é TSX) e que o deck do SR1 conta. As contagens do deck saem
 * daqui, nunca digitadas.
 *
 * DUAS DIFERENÇAS EM RELAÇÃO AO PDF, as duas declaradas no documento do site:
 *
 * 1. O PDF cita a Portaria Conjunta SESAU nº 05/2023 como norma da política.
 *    Ela foi revogada pela Portaria Conjunta nº 001/2024 (art. 12), que é a
 *    que o projeto usa (`docs/portaria-001-2024.md`). Aqui citamos a vigente.
 *
 * 2. A coluna `estado` não existe no PDF. É onde cada requisito está no código
 *    de hoje, conferido arquivo a arquivo, e `hoje` diz o que existe e o que
 *    falta. Quem muda o sistema muda esta coluna junto.
 *
 * Nenhuma linha daqui é dado de pessoa: são CATEGORIAS de dado ("matrícula
 * funcional"), não valores. O sistema continua rodando só com dados de teste.
 */

export const ATIVIDADE_2 = (() => {
  const marco = MARCOS_PARALELOS.find(
    (m) => m.trilha === 'direito' && m.rotulo.startsWith('Direito: Atividade 2'),
  )
  if (!marco) throw new Error('A Atividade 2 de Direito precisa de marco em cronograma.ts')
  return {
    titulo: 'Levantamento de requisitos de privacy by design',
    disciplina: 'Fundamentos de Projeto 6: tópicos em direito',
    peso: '30% da AV1',
    entrega: marco.data,
  }
})()

/* -------------------------------------------------------------------------
   Base legal
------------------------------------------------------------------------- */

export const BASE_LEGAL_DA_ATIVIDADE = [
  'A base é o art. 7º, III da LGPD, lido com o art. 23: tratamento pelo Poder Público para executar política pública. Não é o consentimento. Numa relação hierárquica entre a Administração e o servidor avaliado, o consentimento seria frágil.',
  'Para dado sensível, vale o art. 11, II, "b".',
  'A SESAU é a controladora. Um eventual fornecedor de tecnologia seria operador. O encarregado (arts. 23, III e 41) é o canal com os titulares e com a ANPD. O compartilhamento entre órgãos segue o art. 26.',
  'Transparência e privacidade: o Tema 483 do STF (ARE 652.777/SP) permite divulgar nome e remuneração do servidor, mas não alcança as notas individuais de avaliação, que são informação pessoal de acesso restrito (art. 31 da LAI).',
  'Dado sensível que não parece sensível: a nota é dado comum, mas o motivo registrado (licença médica, falta por dia de greve) revela saúde ou filiação sindical. É a regra do art. 11, § 1º.',
] as const

/** As normas da política, com a vigente no lugar da revogada que o PDF cita. */
export const NORMAS_DA_POLITICA = [
  'Lei Municipal nº 18.969/2022',
  'Decreto nº 36.482/2023',
  'Portaria Conjunta nº 001/2024',
] as const

export const NOTA_DA_PORTARIA =
  'O PDF da atividade cita a Portaria Conjunta SESAU nº 05/2023. Ela foi revogada pela Portaria Conjunta nº 001/2024 (art. 12), que é a vigente e a que o projeto usa. Aqui citamos a vigente.'

/* -------------------------------------------------------------------------
   4.1 Mapeamento de dados pessoais
------------------------------------------------------------------------- */

export type ClasseDoDado =
  | 'comum'
  | 'comum, com ressalva'
  | 'sensível'
  | 'sensível por inferência'
  | 'potencialmente sensível'

export interface DadoPessoal {
  readonly dado: string
  readonly classe: ClasseDoDado
  readonly porque: string
}

export const DADOS_PESSOAIS: readonly DadoPessoal[] = [
  {
    dado: 'Nome completo do gestor avaliado',
    classe: 'comum',
    porque: 'Identifica diretamente a pessoa natural (art. 5º, I), sem revelar categoria sensível.',
  },
  {
    dado: 'Matrícula funcional',
    classe: 'comum',
    porque: 'Identificador único do servidor no órgão (art. 5º, I).',
  },
  {
    dado: 'CPF, se usado como identificador ou login',
    classe: 'comum',
    porque:
      'Dado identificador (art. 5º, I). Por ser identificador nacional, pede segurança reforçada.',
  },
  {
    dado: 'Cargo, função e lotação (unidade de saúde)',
    classe: 'comum',
    porque: 'Dados funcionais ligados a pessoa identificável (art. 5º, I).',
  },
  {
    dado: 'E-mail funcional',
    classe: 'comum',
    porque: 'Dado de contato de pessoa identificável (art. 5º, I).',
  },
  {
    dado: 'Indicadores de desempenho individuais',
    classe: 'comum',
    porque:
      'Referem-se a pessoa identificável (art. 5º, I). Sozinhos, não revelam categoria sensível.',
  },
  {
    dado: 'Notas e resultados de avaliação',
    classe: 'comum',
    porque:
      'Avaliação individual (art. 5º, I). Comum, porém de acesso restrito (art. 31 da LAI), e fora do alcance do Tema 483 do STF.',
  },
  {
    dado: 'Histórico de avaliações ao longo do tempo',
    classe: 'comum',
    porque: 'Série temporal (art. 5º, I). Acumulada, permite traçar perfil: exige prazo de guarda.',
  },
  {
    dado: 'Quem lançou cada indicador',
    classe: 'comum',
    porque:
      'O servidor que lança também é titular (art. 5º, I): a proteção não se limita ao avaliado.',
  },
  {
    dado: 'Registros de auditoria (IP, usuário, data e hora, ação)',
    classe: 'comum',
    porque: 'IP junto com identificador de usuário torna a pessoa identificável (art. 5º, I).',
  },
  {
    dado: 'Código de afastamento, licença médica ou abono que justifique meta não atingida',
    classe: 'sensível por inferência',
    porque:
      'Não há campo chamado "saúde", mas o registro revela a condição de saúde do gestor: é dado de saúde (art. 5º, II), pela regra do art. 11, § 1º.',
  },
  {
    dado: 'Falta ou desconto por dia de greve, ou licença para mandato sindical',
    classe: 'sensível por inferência',
    porque:
      'Ao compor a produtividade, expõe de forma indireta filiação sindical e posição política (art. 5º, II, com o art. 11, § 1º).',
  },
  {
    dado: 'Autodeclaração racial, se ligada a política de cotas no cadastro funcional',
    classe: 'sensível',
    porque: 'Origem racial ou étnica é categoria expressa do art. 5º, II.',
  },
  {
    dado: 'Dados biométricos, em login ou ponto integrado',
    classe: 'sensível',
    porque: 'Dado biométrico ligado a pessoa natural é sensível por definição (art. 5º, II).',
  },
  {
    dado: 'Texto livre da contestação',
    classe: 'potencialmente sensível',
    porque:
      'Pode receber, sem querer, dado de saúde, sindical ou religioso (art. 5º, II, com o art. 11, § 1º). Trata-se pelo pior caso.',
  },
  {
    dado: 'Foto funcional, se exibida no perfil',
    classe: 'comum, com ressalva',
    porque:
      'Em regra é comum. Vira sensível se for usada para inferir origem racial ou étnica, ou passar por reconhecimento facial (art. 5º, II).',
  },
]

/* -------------------------------------------------------------------------
   4.2 e 4.3 Riscos e requisitos
------------------------------------------------------------------------- */

/** Os sete princípios de privacy by design (Cavoukian, 2009). */
export const PRINCIPIOS_PBD = [
  'proativo, não reativo',
  'privacidade como padrão',
  'privacidade embutida no design',
  'funcionalidade total: soma positiva',
  'segurança de ponta a ponta',
  'visibilidade e transparência',
  'respeito ao titular',
] as const

export type PrincipioPbD = (typeof PRINCIPIOS_PBD)[number]

/**
 * Onde cada requisito está HOJE:
 * - no MVP: o critério de verificação já vale no sistema;
 * - em parte: parte do requisito está no código, e `hoje` diz o que falta;
 * - no backlog: ainda não começou, e cabe no protótipo;
 * - na implantação: depende de infraestrutura real (banco, rotina agendada,
 *   migração), fora do escopo acadêmico do MVP.
 */
export const ESTADOS_DO_REQUISITO = ['no MVP', 'em parte', 'no backlog', 'na implantação'] as const
export type EstadoDoRequisito = (typeof ESTADOS_DO_REQUISITO)[number]

export interface RequisitoDePrivacidade {
  readonly dados: string
  readonly risco: string
  readonly porque: string
  readonly principio: PrincipioPbD
  readonly requisito: string
  readonly criterio: string
  readonly estado: EstadoDoRequisito
  readonly hoje: string
}

export const REQUISITOS_DE_PRIVACIDADE: readonly RequisitoDePrivacidade[] = [
  {
    dados: 'Indicadores e notas de todos os gestores',
    risco:
      'O painel de gestão pode mostrar indicadores de gestores fora da área de quem está usando.',
    porque:
      'Viola a necessidade (art. 6º, III) e expõe dado de avaliação a quem não deveria ter acesso.',
    principio: 'privacidade embutida no design',
    requisito:
      'Controle de acesso por papel, com escopo por área, decidido no servidor e não na interface. Por padrão, nenhum painel mostra indicador individual de outra área.',
    criterio:
      'Quem entra como gestor da área X não recebe, em nenhuma consulta ou API, dado de gestor de outra área.',
    estado: 'em parte',
    hoje: 'Cada tela confere o perfil no servidor e responde 404 a quem não pode. O gerente distrital vê só o próprio distrito, também no CSV. O perfil ainda vem de um seletor, sem login.',
  },
  {
    dados: 'Notas, indicadores e identificadores',
    risco:
      'A API devolve a avaliação a partir de um identificador sequencial, sem verificar autorização (IDOR).',
    porque:
      'Permite raspar a base inteira. Viola a segurança (art. 6º, VII) e o dever do art. 46: a privacidade fica contornável por fora da interface.',
    principio: 'proativo, não reativo',
    requisito:
      'A API exige token válido, usa identificadores não sequenciais e confere o escopo do usuário a cada requisição.',
    criterio:
      'Requisição sem token recebe 401. Identificador de outra área recebe 404. Uma varredura sequencial não devolve dado nenhum.',
    estado: 'em parte',
    hoje: 'As telas e a exportação conferem o perfil no servidor a cada requisição. Sem login real não há token, e os identificadores são nomes legíveis, não sorteados.',
  },
  {
    dados: 'Histórico de avaliações',
    risco: 'Não há prazo de guarda para avaliações antigas.',
    porque:
      'O dado fica sem prazo e sem justificativa: fere a prevenção (art. 6º, VIII) e o término do tratamento (arts. 15 e 16).',
    principio: 'segurança de ponta a ponta',
    requisito:
      'Data de expiração em cada registro e uma rotina agendada que, no fim do prazo, anonimiza (guardando a série estatística) ou elimina.',
    criterio:
      'Registro vencido não aparece identificável em nenhuma consulta. Cada expurgo registra quanto tratou.',
    estado: 'na implantação',
    hoje: 'O protótipo não guarda nada entre reinícios. A proposta de prazo está em docs/privacidade.md e depende da Secretaria.',
  },
  {
    dados: 'Avaliações de servidores desligados',
    risco: 'Avaliações de gestores exonerados ou aposentados ficam guardadas sem prazo.',
    porque:
      'Acabada a finalidade, não há base para manter: necessidade (art. 6º, III) e prevenção (art. 6º, VIII).',
    principio: 'segurança de ponta a ponta',
    requisito:
      'O desligamento (exoneração ou aposentadoria) dispara a contagem do prazo de guarda, com anonimização automática ao fim dele.',
    criterio:
      'Avaliação de servidor desligado, depois do prazo, não volta com dado identificável em nenhuma consulta.',
    estado: 'na implantação',
    hoje: 'Depende do cadastro funcional real, que o protótipo não tem.',
  },
  {
    dados: 'Base de avaliações e histórico',
    risco: 'Usar a base para treinar um modelo que classifique gestores de baixo desempenho.',
    porque:
      'Desvio de finalidade (art. 6º, I): uso preditivo individual que a portaria não prevê. Atrai o art. 20 e o risco de discriminação (art. 6º, IX).',
    principio: 'funcionalidade total: soma positiva',
    requisito:
      'Os modelos só trabalham com indicadores e áreas agregadas, nunca com perfil individual. Nenhuma saída de modelo entra no cálculo da gratificação, e a decisão continua humana e contestável (art. 20).',
    criterio:
      'Nenhum modelo recebe identificador de gestor como atributo, e o motor de cálculo não lê saída de modelo (teste de dependência).',
    estado: 'no MVP',
    hoje: 'Os modelos leem a base por unidade, sem dado de pessoa. Um teste confere que o motor só usa os próprios tipos e que nenhum atributo dos modelos aponta para gestor: src/lib/calculo/fronteira.test.ts.',
  },
  {
    dados: 'Texto livre da contestação',
    risco: 'O servidor escreve, por conta própria, dado sensível (saúde, sindicato) no texto aberto.',
    porque:
      'Tratamento além do necessário (art. 6º, III), que atrai o regime de dado sensível (art. 11, § 1º) sem as salvaguardas dele.',
    principio: 'privacidade como padrão',
    requisito:
      'Aviso fixo pedindo para não escrever dado sensível. Texto cifrado no armazenamento e legível só pelo gestor que escreveu e pela CAM.',
    criterio:
      'O aviso aparece no formulário. Os perfis de área técnica e de auditoria não leem o texto de nenhuma contestação.',
    estado: 'em parte',
    hoje: 'O formulário da contestação avisa para não escrever dado sensível. A cifragem depende do banco real.',
  },
  {
    dados: 'Notas e indicadores identificados',
    risco: 'A exportação em CSV faz circular dado identificado fora do sistema.',
    porque:
      'Perder o controle das cópias compromete a segurança (art. 6º, VII e art. 46) e a responsabilização (art. 6º, X).',
    principio: 'visibilidade e transparência',
    requisito:
      'Exportação restrita por perfil, com preferência por dado agregado, e registro de cada exportação (usuário, data, recorte e número de linhas).',
    criterio:
      'Perfil sem permissão não exporta, e toda exportação gera um evento que não se apaga na trilha de auditoria.',
    estado: 'em parte',
    hoje: 'Só os perfis do painel da gestão exportam, e há a opção anônima. A exportação ainda não gera evento na trilha.',
  },
  {
    dados: 'Notas individuais',
    risco: 'Um ranking comparativo mostra a nota de um gestor, com o nome, aos colegas.',
    porque:
      'Uso que pode discriminar e constranger (art. 6º, IX), e quebra o acesso restrito (art. 31 da LAI).',
    principio: 'privacidade como padrão',
    requisito:
      'Proibida a nota com nome entre pares. Ranking só agregado, com a anonimização ligada por padrão para projetar em reunião.',
    criterio:
      'Nenhum perfil vê a nota com nome de um par. O painel projeta agregados sem nomes.',
    estado: 'em parte',
    hoje: 'O gerente de unidade não abre o ranking, e o ranking tem modo anônimo. O modo anônimo ainda não vem ligado por padrão.',
  },
  {
    dados: 'Registros de auditoria',
    risco: 'A trilha identifica quem lança e fica guardada sem prazo.',
    porque:
      'Tensão entre responsabilização (art. 6º, X) e necessidade (art. 6º, III). Sem prazo, fere o art. 15.',
    principio: 'segurança de ponta a ponta',
    requisito:
      'Política escrita de guarda dos registros, com prazo proporcional e acesso restrito ao perfil de auditoria.',
    criterio:
      'A política está publicada, registro vencido é descartado, e o próprio acesso aos registros é auditado.',
    estado: 'em parte',
    hoje: 'A trilha só abre para o administrador e para a SEAB. Falta a política de guarda com prazo.',
  },
  {
    dados: 'Todos os dados de avaliação',
    risco: 'A CAM e as áreas técnicas acessam além da atribuição legal de cada uma.',
    porque: 'Privilégio em excesso contraria a necessidade (art. 6º, III) e a finalidade (art. 6º, I).',
    principio: 'privacidade embutida no design',
    requisito:
      'Menor privilégio pela atribuição legal: a CAM acessa o necessário para apurar, e a área técnica só os próprios indicadores, sem ver notas.',
    criterio:
      'As consultas da CAM não devolvem dado fora da apuração, e o perfil de área técnica não devolve nota de nenhum gestor.',
    estado: 'em parte',
    hoje: 'Cada tela declara quais perfis a abrem, e um teste percorre as telas contra os perfis. O perfil de área técnica ainda não existe no sistema.',
  },
  {
    dados: 'Dados de gestores',
    risco: 'Compartilhamento com outros órgãos ou entes sem base legal.',
    porque:
      'Uso compartilhado exige finalidade específica (art. 26), e o § 1º proíbe, em regra, a transferência a ente privado.',
    principio: 'visibilidade e transparência',
    requisito:
      'Nenhuma integração externa sem base legal escrita, e registro de todo fluxo de compartilhamento.',
    criterio:
      'Toda integração ativa tem base registrada e gera um evento de compartilhamento na trilha.',
    estado: 'no MVP',
    hoje: 'O sistema não tem integração externa: nenhum dado sai dele por outro caminho.',
  },
  {
    dados: 'Base antiga completa',
    risco: 'Planilhas antigas e espalhadas, com link público, vazam durante a migração.',
    porque:
      'Falha de segurança (art. 6º, VII e art. 46) que a prevenção (art. 6º, VIII) evitaria na transição.',
    principio: 'proativo, não reativo',
    requisito:
      'Plano de migração com inventário das planilhas, revogação dos links públicos e revisão de permissões antes de desligar as planilhas.',
    criterio: 'A auditoria depois da migração confirma zero planilha antiga com link público.',
    estado: 'na implantação',
    hoje: 'Não há migração no protótipo, e a planilha da Secretaria não entra no repositório (ADR-035).',
  },
  {
    dados: 'Toda a base',
    risco: 'Incidente de segurança sem plano de resposta e sem aviso ao titular e à ANPD.',
    porque:
      'Descumpre o dever de comunicar incidente com risco relevante (art. 48) e a responsabilização (art. 6º, X).',
    principio: 'proativo, não reativo',
    requisito:
      'Plano de resposta a incidentes, com alerta de acesso fora do padrão, registro do evento e fluxo de aviso ao titular e à ANPD.',
    criterio:
      'Um incidente simulado dispara o alerta, gera o registro e inicia o aviso no prazo da política.',
    estado: 'no backlog',
    hoje: 'Há o procedimento de revogação de chaves em docs/seguranca.md, mas ainda não há plano de resposta a incidentes com aviso ao titular e à ANPD.',
  },
  {
    dados: 'Todos os dados de titulares',
    risco: 'Falta encarregado identificado e um canal para exercer os direitos.',
    porque:
      'Frustra os direitos do art. 18, o livre acesso (art. 6º, IV) e o dever de indicar encarregado (arts. 23, III e 41).',
    principio: 'respeito ao titular',
    requisito:
      'Encarregado identificado no sistema e canal com protocolo para acesso, correção e informação. No produto: "meu resultado" (acesso), contestação (correção) e memória de cálculo (informação sobre o tratamento).',
    criterio:
      'Uma solicitação de teste gera protocolo, é atendida no fluxo e fica registrada. O encarregado aparece sem login.',
    estado: 'em parte',
    hoje: 'Meu resultado, a contestação e a memória de cálculo estão no ar. Falta identificar o encarregado, que é indicado pela Prefeitura.',
  },
  {
    dados: 'Painéis agregados',
    risco: 'Os painéis permitem reidentificar alguém em recortes com poucos servidores.',
    porque:
      'Agregação insuficiente expõe o indivíduo: fere a necessidade (art. 6º, III) e a anonimização efetiva (art. 12).',
    principio: 'privacidade como padrão',
    requisito:
      'Painéis só agregados, com supressão automática de recortes abaixo de um número mínimo de pessoas.',
    criterio:
      'Nenhuma combinação de filtros isola uma pessoa, e recortes abaixo do mínimo aparecem suprimidos.',
    estado: 'no backlog',
    hoje: 'Ainda não há número mínimo. O mesmo cuidado vale para a base por unidade da lente de ML, discutido no documento de Direito.',
  },
]

/* -------------------------------------------------------------------------
   5. O que a atividade acrescenta ao sistema
------------------------------------------------------------------------- */

export interface ItemDePrivacidade {
  readonly item: string
  readonly detalhe: string
  /** Números dos riscos, na ordem de REQUISITOS_DE_PRIVACIDADE (1 a 15). Vazio = todos. */
  readonly riscos: readonly number[]
  readonly estado: 'feito' | 'em parte' | 'a fazer'
}

export const BACKLOG_DE_PRIVACIDADE: readonly ItemDePrivacidade[] = [
  {
    item: 'Ciclo de guarda completo',
    detalhe:
      'Data de expiração e rotina de expurgo, com o desligamento de exonerados e aposentados disparando o prazo. A anonimização guarda a série estatística.',
    riscos: [3, 4, 9],
    estado: 'a fazer',
  },
  {
    item: 'Autorização conferida no servidor',
    detalhe:
      'Identificadores não sequenciais e conferência de escopo a cada requisição, não importa a interface.',
    riscos: [1, 2, 10],
    estado: 'em parte',
  },
  {
    item: 'Proteção do texto da contestação',
    detalhe: 'Aviso contra dado sensível, cifragem no armazenamento e leitura só pelo autor e pela CAM.',
    riscos: [6],
    estado: 'em parte',
  },
  {
    item: 'Registro das exportações',
    detalhe: 'Um evento que não se apaga, com usuário, data, recorte e volume, a cada exportação.',
    riscos: [7],
    estado: 'a fazer',
  },
  {
    item: 'Supressão de recortes pequenos',
    detalhe: 'Número mínimo de pessoas, configurável, nos painéis agregados.',
    riscos: [15],
    estado: 'a fazer',
  },
  {
    item: 'Encarregado e canal do titular',
    detalhe: 'Identificação visível e fluxo com protocolo para acesso, correção e informação.',
    riscos: [14],
    estado: 'em parte',
  },
  {
    item: 'Fronteira do uso de modelos',
    detalhe:
      'Garantir por teste que nenhum modelo recebe identificador de gestor e que nenhuma saída alimenta o cálculo.',
    riscos: [5],
    estado: 'feito',
  },
  {
    item: 'Validação com a CAM',
    detalhe:
      'Conferir indicadores e regras com a portaria vigente e usar os critérios de verificação deste catálogo como roteiro de testes.',
    riscos: [],
    estado: 'a fazer',
  },
]

export const NOTA_DA_IMPLANTACAO =
  'O que depende de infraestrutura real (cifragem no armazenamento, rotina agendada e migração das planilhas) fica como requisito de implantação, fora do escopo acadêmico do protótipo, que roda só com dados de teste.'

/* -------------------------------------------------------------------------
   Contagens, para o deck e o documento
------------------------------------------------------------------------- */

export function contarRequisitos(estado: EstadoDoRequisito): number {
  return REQUISITOS_DE_PRIVACIDADE.filter((r) => r.estado === estado).length
}

export const DADOS_SENSIVEIS = DADOS_PESSOAIS.filter((d) => d.classe !== 'comum' && d.classe !== 'comum, com ressalva')
