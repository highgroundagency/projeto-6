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
  readonly fonte: 'briefing' | 'matriz'
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
      'src/components/sistema/telas/lancamento.tsx: um formulário por indicador da área',
      'src/app/api/sistema/lancamento/route.ts: a escrita, com o autor registrado',
    ],
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
      'src/lib/sistema.ts: `exigirPerfil` fecha cada tela no servidor e responde 404',
      'src/lib/sistema.test.ts: as 8 telas contra os 4 perfis, sem amostragem',
      'supabase/migrations/: as políticas de RLS que fariam isso valer de verdade',
    ],
    ressalva:
      'O perfil vem de um seletor simulado, não de autenticação. O recorte é real e roda no servidor, mas quem escolhe o papel é o próprio visitante. O RBAC de verdade está escrito e testado no schema, e desligado do app (ADR-011).',
  },
  {
    id: 'regras-da-portaria',
    fonte: 'briefing',
    pedido: 'E aplicação automática das regras previstas na portaria.',
    estado: 'parcial',
    onde: [
      'src/lib/calculo/motor.ts: a regra é aplicada automaticamente sobre os lançamentos',
      'src/components/sistema/telas/indicadores.tsx: a regra é dado versionado, com diff entre versões',
    ],
    ressalva:
      'A equipe não teve acesso à portaria vigente. Os pesos e as faixas da base são arbitrados e precisam de conferência com a CAM: está declarado como bloqueio no registro da Semana 5.',
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
      'src/components/sistema/telas/cam.tsx: funil por área e pendências do ciclo corrente',
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
      'ml/: gerador, modelos e exportador; separação treino/teste temporal, nunca aleatória',
      'src/components/sistema/telas/analytics.tsx: cada modelo com método, métrica E linha de base',
      'Um modelo publicado como resultado NEGATIVO, porque não supera a referência',
    ],
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
    estado: 'atendido',
    onde: [
      'src/content/ciclos/s3.tsx: roteiro das três técnicas, alternativas e justificativa',
    ],
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
      'docs/arquitetura.md: diagramas C4 de contexto e de contêiner',
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
      'src/content/ciclos/s11.tsx: roteiro da entrevista e tarefas do teste de usabilidade, cronometrado',
    ],
    ressalva:
      'Os INSTRUMENTOS estão prontos; o resultado não existe porque a semana não chegou. O bloco de feedback está em "nenhum" de propósito: inventar fala de cliente seria fabricar evidência (ADR-020).',
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
      '420 testes de unidade em Vitest, 72 end-to-end em Playwright',
      'scripts/verificar-vazamento.ts: 98 checagens contra o build de produção',
    ],
  },

  {
    id: 'acessibilidade',
    fonte: 'matriz',
    pedido:
      'Qualidade da solução e adequação às necessidades dos usuários (critério de validação do SR2).',
    estado: 'parcial',
    onde: [
      'src/lib/contraste.test.ts: 19 checagens de contraste AA, nos dois temas, lidas do próprio globals.css',
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
]
