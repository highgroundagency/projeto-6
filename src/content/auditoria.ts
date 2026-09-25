/**
 * Auditoria do projeto contra o que o professor pediu.
 *
 * As duas fontes são os PDFs da disciplina: o briefing do case da SESAU e a
 * Matriz Integrada do Projeto 6. Cada linha abaixo cita o texto do professor e
 * aponta ONDE, no repositório, aquilo está atendido. Onde não está, a linha diz
 * isso com todas as letras: uma auditoria que só encontra acertos não auditou
 * nada.
 *
 * Isto é dado versionado de propósito. Auditoria em conversa se perde; auditoria
 * em arquivo entra no diff, é revisada em PR e sai no dossiê.
 */

export type EstadoRequisito =
  /** Existe, funciona e tem teste ou documento apontando para ele. */
  | 'atendido'
  /** Existe de forma parcial, e o que falta está declarado. */
  | 'parcial'
  /** Deliberadamente fora do escopo, com o motivo dito. */
  | 'fora_de_escopo'

export const ROTULO_ESTADO_REQUISITO: Record<EstadoRequisito, string> = {
  atendido: 'atendido',
  parcial: 'parcial',
  fora_de_escopo: 'fora de escopo',
}

export interface Requisito {
  readonly id: string
  /** De onde veio a exigência: o briefing do case ou a matriz. */
  readonly fonte: 'briefing' | 'matriz' | 'kickoff'
  /** O texto do professor, o mais literal possível. */
  readonly pedido: string
  readonly estado: EstadoRequisito
  /** Onde isso está no repositório. Caminhos, não promessas. */
  readonly onde: readonly string[]
  /** O que ainda falta, quando falta. Vazio só quando não falta nada. */
  readonly ressalva?: string
}

export const REQUISITOS: readonly Requisito[] = [
  // ---- Briefing: a "Ideia de solução" ------------------------------------
  {
    id: 'plataforma-web',
    fonte: 'briefing',
    pedido:
      'Uma plataforma web que automatize todo o processo de avaliação de desempenho e cálculo da gratificação.',
    estado: 'atendido',
    onde: [
      'src/app/sistema/page.tsx: as oito telas do MVP numa página',
      'src/lib/calculo/motor.ts: o cálculo, como função pura',
    ],
  },
  {
    id: 'area-informa',
    fonte: 'briefing',
    pedido: 'Permitindo que cada área técnica informe seus indicadores diretamente no sistema.',
    estado: 'atendido',
    onde: [
      'src/components/sistema/telas/lancamento.tsx: um formulário por subindicador da unidade, com numerador e denominador quando é razão',
      'src/app/api/sistema/lancamento/route.ts: a escrita, com o autor registrado',
    ],
    ressalva:
      'A reunião com o cliente (22/08, ADR-034) trocou "área técnica" por UNIDADE: quem informa é a unidade de saúde, e o que se preenche é o subindicador. O pedido do briefing segue atendido, com o vocabulário corrigido pelo processo real.',
  },
  {
    id: 'regras-validacao',
    fonte: 'briefing',
    pedido: 'Com regras de validação.',
    estado: 'atendido',
    onde: [
      'src/app/api/sistema/lancamento/route.ts: zod valida tipo, faixa e tamanho antes de qualquer escrita',
      'src/lib/dados/consultas.ts: `pareceErroDeDigitacao` sinaliza valor absurdo sem bloquear',
      'A janela de prazo fecha o lançamento fora do período, e a tentativa fica na trilha',
    ],
  },
  {
    id: 'perfis-acesso',
    fonte: 'briefing',
    pedido: 'Com perfis de acesso.',
    estado: 'parcial',
    onde: [
      'src/lib/features.ts: os quatro papéis que o CLIENTE nomeou (SEAB, administrador, gerente distrital, gerente de unidade)',
      'src/lib/sistema.ts: `exigirPerfil` fecha cada tela no servidor e responde 404',
      'src/lib/sistema.test.ts: as 8 telas contra os 4 perfis, sem amostragem',
      'supabase/migrations/: as políticas de RLS que fariam isso valer de verdade',
    ],
    ressalva:
      'O perfil vem de um seletor simulado, não de autenticação. O recorte é real e roda no servidor, mas quem escolhe o papel é o próprio visitante. O RBAC de verdade está escrito e testado no schema, e desligado do app (ADR-011); as políticas guardadas ainda usam os papéis anteriores à ADR-034, com pendência declarada em docs/banco.md.',
  },
  {
    id: 'regras-da-portaria',
    fonte: 'briefing',
    pedido: 'E aplicação automática das regras previstas na portaria.',
    estado: 'parcial',
    onde: [
      'src/lib/calculo/motor.ts: a regra é aplicada automaticamente sobre os lançamentos',
      'src/lib/seed/gerar.ts: a regra v3, no motor desde 23/09, com o método de notas lido da planilha do cliente (ADR-041)',
      'src/components/sistema/telas/indicadores.tsx: a regra é dado versionado, com diff entre versões',
      'docs/portaria-001-2024.md: a portaria transcrita, com artigo e data',
    ],
    ressalva:
      'A portaria chegou em 05/09 e a planilha do cliente em 22/09. O método entrou como regra v3: média das notas, peso redistribuído pelo art. 8º e nota de 0 a 1. Continua faltando: os oito indicadores do seed são de teste, e a portaria tem cinco; o porte fica de fora; o Indicador 3 é bimestral e o motor só conhece o mês; o prazo de recurso do art. 9º não está implementado; e os cortes das classes e os percentuais são suposição até o Decreto nº 36.482/2023. As perguntas abertas estão em docs/perguntas-para-a-sesau.md.',
  },
  {
    id: 'rastreabilidade',
    fonte: 'briefing',
    pedido: 'A solução deve oferecer rastreabilidade.',
    estado: 'atendido',
    onde: [
      'src/components/sistema/telas/auditoria.tsx: linha do tempo append-only com antes e depois',
      'Toda escrita gera evento no mesmo passo: não existe caminho que grave sem registrar',
    ],
  },
  {
    id: 'historico',
    fonte: 'briefing',
    pedido: 'Histórico das avaliações.',
    estado: 'atendido',
    onde: [
      'src/components/sistema/telas/meu-resultado.tsx: score por competência, ciclo a ciclo',
      'Regra versionada: recalcular um ciclo antigo reproduz o mesmo número',
    ],
  },
  {
    id: 'transparencia',
    fonte: 'briefing',
    pedido: 'Transparência dos cálculos.',
    estado: 'atendido',
    onde: [
      'src/components/sistema/memoria.tsx: a memória de cálculo abre indicador, valor, meta, atingimento, pontos, peso e contribuição, com a fórmula ao pé',
      'A memória sai do MESMO cálculo que produz o score, nunca de uma recontagem paralela',
    ],
  },
  {
    id: 'paineis-gestao',
    fonte: 'briefing',
    pedido: 'E painéis de acompanhamento para a gestão.',
    estado: 'atendido',
    onde: [
      'src/components/sistema/telas/painel-seab.tsx: funil por unidade e pendências do ciclo corrente',
      'src/components/sistema/telas/gestao.tsx: agregados, ranking anonimizável e exportação em CSV',
    ],
  },

  // ---- Matriz: as três disciplinas-alvo ----------------------------------
  {
    id: 'lente-seguranca',
    fonte: 'matriz',
    pedido:
      'Disciplina-alvo: Segurança da Informação. Mecanismos de segurança, controles, proteção.',
    estado: 'atendido',
    onde: [
      'docs/seguranca.md: STRIDE por ameaça, OWASP Top 10 com estado, e as limitações declaradas',
      'src/lib/admin/: senha só no servidor, cookie HMAC-SHA256, comparação em tempo constante, rate limit',
      'supabase/migrations/: políticas de RLS testadas contra um Postgres real',
    ],
  },
  {
    id: 'lente-ml',
    fonte: 'matriz',
    pedido:
      'Disciplina-alvo: Aprendizado de Máquina. Possibilidades de aplicação de ML, funcionalidades inteligentes, evolução dos modelos.',
    estado: 'atendido',
    onde: [
      'ml/notebooks/: os cadernos, com todo o código, sobre a base por unidade da SESAU em ml/data/, autorizada pela Secretaria (ADR-043 e ADR-044)',
      'src/components/sistema/telas/analytics.tsx: cada modelo com método, métrica E linha de base',
      '/ml: os slides da AV1 de machine learning, com os números lidos do caderno 07',
    ],
    ressalva:
      'A classificação e a regressão têm métrica alta porque o resultado geral é soma ponderada das mesmas notas: os modelos mostram o que mais pesa e não substituem o cálculo, e os cadernos dizem isso. A base é o retrato de um ciclo, então não há separação temporal. E 39 das 90 combinações tipo × distrito da base têm uma linha só, o que pode apontar a unidade e o gerente dela: a análise está em docs/privacidade.md.',
  },
  {
    id: 'lente-nuvem',
    fonte: 'matriz',
    pedido:
      'Disciplina-alvo: Arquitetura Nativa na Nuvem. Componentes de infraestrutura, integração entre componentes, infraestrutura de execução.',
    estado: 'atendido',
    onde: [
      'docs/nuvem.md: onde cada componente executa, pipeline ponta a ponta, doze fatores, escala e trade-offs',
      'Documento no registro da Semana 5, âncora #doc-s5-nuvem',
      'Documento no registro da Semana 12, âncora #doc-s12-nuvem',
    ],
    ressalva:
      'ESTA LENTE FOI A ÚLTIMA A ENTRAR. A auditoria de 16/08 encontrou o projeto nomeando "Projeto, Machine Learning e Direito Digital" como suas três lentes, quando a matriz nomeia "Segurança da Informação, Aprendizado de Máquina e Arquitetura Nativa na Nuvem". Nenhuma métrica de produção foi medida: os números de escala são raciocínio de capacidade, não benchmark.',
  },

  // ---- Matriz: entregas de processo --------------------------------------
  {
    id: 'registro-semanal',
    fonte: 'matriz',
    pedido:
      'Evidência esperada em toda semana: registro do grupo com entregas, responsáveis e evidências.',
    estado: 'atendido',
    onde: [
      'src/content/ciclos/: um arquivo por ciclo, com os oito blocos fixos',
      'A página inicial traz as 18 semanas em sanfona, com selo e validador por bloco',
    ],
  },
  {
    id: 'imersao',
    fonte: 'matriz',
    pedido:
      'Semana 2: personas, mapa de empatia, benchmarking, SWOT, objetivos e cronograma inicial.',
    estado: 'atendido',
    onde: ['src/content/ciclos/s2.tsx: cinco documentos renderizados dentro do site, sem PDF'],
  },
  {
    id: 'ideacao',
    fonte: 'matriz',
    pedido:
      'Semana 3: Brainwriting, Brainstorming e Crazy 8’s; alternativas, critérios e justificativa.',
    estado: 'parcial',
    onde: [
      'src/content/ciclos/s3.tsx: roteiro das três técnicas, alternativas e justificativa',
      'src/content/analises.ts: as técnicas e as oito alternativas como dado, lidas também pelo pitch',
    ],
    ressalva:
      'O que está publicado é o ROTEIRO previsto das três dinâmicas, não o registro do que aconteceu: não há foto nem artefato da sessão. O bloqueio está declarado na Semana 3, e o checklist foi corrigido de "feito" para "em andamento" em 11/09, porque ele contradizia o próprio registro.',
  },
  {
    id: 'proposta',
    fonte: 'matriz',
    pedido:
      'Semana 4: proposta de solução, escopo preliminar, backlog inicial, papéis e cronograma.',
    estado: 'atendido',
    onde: ['src/content/ciclos/s4.tsx: proposta em uma página, escopo e backlog inicial'],
  },
  {
    id: 'arquitetura',
    fonte: 'matriz',
    pedido: 'Semana 5: diagrama da arquitetura, fluxo de dados, primeiras telas, pipeline.',
    estado: 'atendido',
    onde: [
      'docs/arquitetura.md: os quatro níveis do C4, as características priorizadas e o estilo escolhido',
      'src/app/arquitetura/page.tsx: os quatro níveis do C4 desenhados no site',
      'src/content/ciclos/s5.tsx: arquitetura, modelo de dados e a lente de nuvem',
    ],
  },
  {
    id: 'validacao-cliente',
    fonte: 'matriz',
    pedido:
      'Semana 11: entrevistas e questionários com o cliente; ajustes no MVP com base no feedback.',
    estado: 'parcial',
    onde: [
      'src/content/ciclos/s3.tsx: a PRIMEIRA conversa real com o cliente (22/08), registrada como documento, com o replanejamento que ela causou',
      'src/content/ciclos/s11.tsx: roteiro da entrevista e tarefas do teste de usabilidade, cronometrado',
    ],
    ressalva:
      'A validação formal da Semana 11 ainda não aconteceu. O que existe é a reunião de levantamento de 22/08, que já mudou o domínio (ADR-034), e a planilha enviada em 22/09, que mudou a regra (ADR-041). Fala de cliente só entra registrada, nunca inventada (ADR-020).',
  },
  {
    id: 'planejado-realizado',
    fonte: 'matriz',
    pedido: 'SR2: comparação planejado x realizado; limitações, trade-offs e próximos passos.',
    estado: 'parcial',
    onde: [
      'src/content/ciclos/s12.tsx: a tabela planejado × realizado e o trabalho futuro declarado',
    ],
    ressalva:
      'A coluna "realizado" fica "a preencher" até o semestre terminar, pela mesma razão do item acima.',
  },
  {
    id: 'documentacao-tecnica',
    fonte: 'matriz',
    pedido: 'SR2: documentação técnica; evidências técnicas consolidadas.',
    estado: 'atendido',
    onde: [
      'docs/: arquitetura, decisões, segurança, nuvem, privacidade, banco, releases e validação',
      'DOSSIE.txt: o projeto inteiro em texto, gerado do próprio código',
    ],
  },
  {
    id: 'testes',
    fonte: 'matriz',
    pedido: 'Evidências de testes; registros de testes e evolução do backlog.',
    estado: 'atendido',
    onde: [
      '694 casos em Vitest, contados em 25/09 (671 rodam localmente; 23 exigem um PostgreSQL real e rodam no CI), 55 deles no motor de cálculo',
      '152 testes em Playwright, contados em 25/09, em desktop e em 360px',
      'scripts/verificar-vazamento.ts: 179 checagens contra o build de produção, contadas em 25/09',
    ],
  },

  // ---- Matriz: o SR1 -----------------------------------------------------
  // Os outros critérios do SR1 (pesquisa consolidada, escopo maduro, plano de
  // correção de rota) apontam para documentos do registro, e entram aqui com a
  // âncora do documento quando ele existir. Caminho, não promessa.
  {
    id: 'sr1-prototipo',
    fonte: 'matriz',
    pedido: 'SR1: protótipo de baixa/média fidelidade.',
    estado: 'atendido',
    onde: [
      'src/components/wireframe.tsx e src/content/ciclos/ko.tsx: os quatro wireframes de baixa fidelidade',
      '/sistema: o protótipo navegável, com as oito telas e os quatro perfis',
    ],
    ressalva:
      'Os wireframes foram desenhados depois das telas, na semana do Kick-off, e o documento diz isso. Não há etapa de média fidelidade: o protótipo navegável ocupa esse lugar.',
  },
  {
    id: 'sr1-desenvolvimento',
    fonte: 'matriz',
    pedido: 'SR1: desenvolvimento iniciado.',
    estado: 'atendido',
    onde: [
      'src/lib/calculo/motor.ts: o motor puro, com as regras v1, v2 e v3',
      'src/lib/features.ts: as oito telas, liberadas com a Semana 6',
      '.github/workflows/ci.yml: typecheck, testes, build, verificação de vazamento e e2e a cada push',
    ],
    ressalva:
      'Os oito indicadores do seed são de teste, não os cinco da portaria. A escrita do protótipo vive em memória, numa cópia por visitante, e some no reinício.',
  },
  {
    id: 'sr1-evidencias-tecnicas',
    fonte: 'matriz',
    pedido: 'SR1: evidências técnicas.',
    estado: 'atendido',
    onde: [
      'docs/seguranca.md: STRIDE com 14 ameaças e OWASP Top 10 com 5 itens parciais',
      'docs/nuvem.md e /arquitetura: onde cada peça roda, e os quatro níveis do C4',
      'docs/privacidade.md: a LGPD aplicada e a identificação indireta na base da SESAU',
      'src/lib/dados-do-cliente.test.ts: a fronteira da ADR-044 como teste, sobre ml/data/ inteiro',
    ],
    ressalva:
      'O banco com RLS está escrito e testado, mas desligado, e o login é simulado. Nenhuma métrica de desempenho foi medida: os números de escala são raciocínio de capacidade.',
  },

  {
    id: 'acessibilidade',
    fonte: 'matriz',
    pedido:
      'Qualidade da solução e adequação às necessidades dos usuários (critério de validação do SR2).',
    estado: 'parcial',
    onde: [
      'src/lib/contraste.test.ts: 35 checagens de contraste AA, nos dois temas e nas duas peles, lidas do próprio globals.css',
      'Modo claro e escuro com botão, tema no cookie e aplicado pelo servidor (ADR-027)',
      'Navegação por teclado: sanfonas nativas, foco visível com anel de acento, link de pular para o conteúdo',
      'e2e roda em 1280px e em 360px, e falha se a página estourar a largura',
    ],
    ressalva:
      'Não houve teste com leitor de tela real nem com pessoas com deficiência. O que existe é conformidade verificada de contraste, foco e semântica, que é um piso, não uma validação de uso.',
  },

  // ---- Fora de escopo, dito na cara --------------------------------------
  {
    id: 'folha-pagamento',
    fonte: 'briefing',
    pedido: 'Integração com folha de pagamento.',
    estado: 'fora_de_escopo',
    onde: ['src/content/ciclos/s4.tsx: o escopo declara isso desde a proposta'],
    ressalva:
      'O produto calcula o percentual devido e audita o caminho até ele. Pagar é outro sistema, e prometer isso num semestre seria promessa vazia.',
  },
  {
    id: 'google-site',
    fonte: 'matriz',
    pedido: 'Semana 1: Google Site do grupo criado.',
    estado: 'atendido',
    onde: [
      'A página inicial deste repositório substitui o Google Site, e é o artefato avaliado',
    ],
    ressalva:
      'A ferramenta é outra, a evidência é a mesma: registro semanal público, com histórico versionado em vez de edição anônima.',
  },

  // ---- Briefing do Kick-off (11/09): os sete critérios -------------------
  {
    id: 'ko-problema',
    fonte: 'kickoff',
    pedido:
      'Critério 1: descrição clara e objetiva do problema, com evidências de pesquisa (dados, contexto e referências).',
    estado: 'atendido',
    onde: [
      'A seção "o problema" na página inicial, com atalho para os documentos que a sustentam',
      'src/content/ciclos/ko.tsx: a portaria transcrita, com artigo e data',
      'Slides 3 e 4 do pitch: o caminho do dinheiro e as três fontes da pesquisa',
    ],
  },
  {
    id: 'ko-objetivos',
    fonte: 'kickoff',
    pedido: 'Critério 2: objetivo geral e objetivos específicos alinhados ao problema.',
    estado: 'atendido',
    onde: [
      'src/content/produto.ts: OBJETIVO_GERAL e OBJETIVOS_ESPECIFICOS, fonte única',
      'src/content/ciclos/ko.tsx: o documento de objetivos, que separa produto de entrega',
      'Slide 5 do pitch',
    ],
    ressalva:
      'NÃO EXISTIAM ATÉ 11/09. O projeto tinha cinco metas SMART de entrega da disciplina, escritas na Semana 2, e nenhum objetivo de produto dito com esse nome.',
  },
  {
    id: 'ko-analises',
    fonte: 'kickoff',
    pedido: 'Critério 3: CSD, mapa de empatia, personas, benchmarking e SWOT.',
    estado: 'parcial',
    onde: [
      'src/content/analises.ts: a matriz CSD, o benchmarking, a SWOT e o mapa de empatia como dado',
      'src/content/ciclos/s2.tsx: personas, mapa de empatia, benchmarking e SWOT',
      'src/content/ciclos/ko.tsx: a matriz CSD, com a fonte de cada certeza',
      'Slides 6, 7 e 8 do pitch',
    ],
    ressalva:
      'A matriz CSD não existia até 11/09 e foi montada na semana do Kick-off, a partir do que as semanas 1 a 4 deixaram espalhado; o documento diz essa data. E o benchmarking não nomeia concorrentes: as cinco referências são categorias de ferramenta, não produtos identificados.',
  },
  {
    id: 'ko-wireframes',
    fonte: 'kickoff',
    pedido: 'Critério 5: solução inicial e protótipos de baixa fidelidade com wireframes.',
    estado: 'atendido',
    onde: [
      'src/components/wireframe.tsx: quatro telas em SVG, sem uma palavra dentro',
      'src/content/ciclos/ko.tsx: o documento dos wireframes, com a data em que foram feitos',
      'src/content/ciclos/s4.tsx: proposta, escopo e backlog',
      '/sistema: o protótipo de alta fidelidade, rodando com dados de teste',
      'Slides 11, 12 e 13 do pitch',
    ],
    ressalva:
      'Os wireframes não existiam até 11/09. A Semana 3 prometeu "primeiras telas em papel" como produto do Crazy 8’s e o artefato não foi publicado; estes foram desenhados na semana do Kick-off, a partir das telas que já existiam.',
  },
  {
    id: 'ko-cronograma',
    fonte: 'kickoff',
    pedido: 'Critério 6: cronograma com atividades, status, prazos e responsáveis.',
    estado: 'atendido',
    onde: [
      'A seção de cronograma na página inicial: as 18 semanas com entrega, data, estado e dono',
      'src/lib/cronograma.ts e src/content/checklist.ts, juntados por montarChecklist()',
      'Slide 16 do pitch',
    ],
    ressalva:
      'Os quatro dados já existiam, e até 11/09 só o painel administrativo, atrás de senha, os mostrava juntos. O visitante via apenas os três marcos.',
  },
  {
    id: 'ko-documentacao',
    fonte: 'kickoff',
    pedido:
      'Critério 7: todo o conteúdo organizado no site, na estrutura mínima de oito seções.',
    estado: 'parcial',
    onde: [
      'src/components/base/indice.tsx: o índice das oito seções, na numeração do briefing',
      'src/components/registro/biblioteca.tsx: todo documento publicado, com link para a âncora',
    ],
    ressalva:
      'Falta o link para a pasta da equipe no Drive, que o checklist do professor pede junto com a apresentação salva lá. A variável NEXT_PUBLIC_DRIVE_URL está vazia, e sem ela o site não mostra link nenhum.',
  },
]
