import type { IntegranteId } from '@/content/equipe'
import { URL_REPOSITORIO } from '@/content/produto'
import { CRONOGRAMA, type CicloId } from '@/lib/cronograma'

/**
 * Checklist da matriz de avaliação (§7.2, item 7).
 *
 * O painel EXIBE este checklist, mas não o edita por formulário: status de
 * entrega é conteúdo, e conteúdo vive no Git (§7.3). Editar aqui deixa histórico
 * de quem mudou o quê e quando — que é justamente o que o projeto defende.
 *
 * A lista de evidências não é repetida: ela vem de `cronograma.ts`. Aqui só
 * entram as evidências cujo status saiu do padrão "a fazer".
 */

export type StatusEvidencia = 'a_fazer' | 'em_andamento' | 'feito' | 'validado'

export const ROTULO_STATUS: Record<StatusEvidencia, string> = {
  a_fazer: 'a fazer',
  em_andamento: 'em andamento',
  feito: 'feito',
  validado: 'validado',
}

export interface ItemChecklist {
  readonly ciclo: CicloId
  /** Precisa bater exatamente com uma evidência declarada em cronograma.ts. */
  readonly evidencia: string
  readonly status: StatusEvidencia
  readonly responsavel?: IntegranteId
  readonly link?: string
}

export const CHECKLIST: readonly ItemChecklist[] = [
  { ciclo: 's1', evidencia: 'Equipe formada', status: 'feito', responsavel: 'gabriel' },
  { ciclo: 's1', evidencia: 'Papéis definidos', status: 'validado', responsavel: 'gabriel' },
  { ciclo: 's1', evidencia: 'Case escolhido', status: 'feito', responsavel: 'gabriel' },
  {
    ciclo: 's1',
    evidencia: 'Registro do projeto criado',
    status: 'feito',
    responsavel: 'fernando',
    link: '/registro',
  },

  { ciclo: 's2', evidencia: 'Pesquisa estruturada', status: 'feito', responsavel: 'matheus' },
  {
    ciclo: 's2',
    evidencia: 'Problema contextualizado',
    status: 'feito',
    responsavel: 'matheus',
  },
  {
    ciclo: 's2',
    evidencia: 'Personas e stakeholders',
    status: 'feito',
    responsavel: 'matheus',
    link: '/#doc-s2-personas',
  },
  {
    ciclo: 's2',
    evidencia: 'Mapa de empatia',
    status: 'feito',
    responsavel: 'matheus',
    link: '/#doc-s2-personas',
  },
  {
    ciclo: 's2',
    evidencia: 'Benchmarking',
    status: 'feito',
    responsavel: 'fernando',
    link: '/#doc-s2-benchmarking',
  },
  {
    ciclo: 's2',
    evidencia: 'SWOT',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s2-swot',
  },
  {
    ciclo: 's2',
    evidencia: 'Objetivos',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s2-objetivos',
  },
  {
    ciclo: 's2',
    evidencia: 'Cronograma inicial',
    status: 'validado',
    responsavel: 'joao-henrique',
  },

  {
    ciclo: 's3',
    // EM ANDAMENTO, e não feito. O que está publicado é o ROTEIRO das três
    // técnicas; a dinâmica real continua sem foto nem artefato, e o próprio
    // bloqueio da Semana 3 diz isso. Marcar como feito aqui contradizia o
    // registro a dois cliques de distância, e a banca acha isso.
    evidencia: "Brainwriting, Brainstorming e Crazy 8's registrados",
    status: 'em_andamento',
    responsavel: 'joao-pedro',
    link: '/#doc-s3-tecnicas-ideacao',
  },
  {
    ciclo: 's3',
    evidencia: 'Alternativas levantadas',
    status: 'feito',
    responsavel: 'joao-pedro',
    link: '/#doc-s3-alternativas',
  },
  { ciclo: 's3', evidencia: 'Critérios de decisão', status: 'feito', responsavel: 'gabriel' },
  {
    ciclo: 's3',
    evidencia: 'Ideia escolhida com justificativa',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s3-justificativa',
  },
  {
    ciclo: 's3',
    evidencia: 'Reunião com o cliente registrada',
    status: 'feito',
    responsavel: 'matheus',
    link: '/#doc-s3-reuniao-cliente',
  },

  {
    ciclo: 's4',
    evidencia: 'Proposta de solução',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s4-proposta',
  },
  {
    ciclo: 's4',
    evidencia: 'Escopo preliminar',
    status: 'feito',
    responsavel: 'joao-henrique',
    link: '/#doc-s4-escopo',
  },
  {
    ciclo: 's4',
    evidencia: 'Backlog inicial',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s4-backlog',
  },
  // Estas duas existiam no cronograma e não tinham status declarado: caíam em
  // "a fazer" em silêncio, e uma delas é exatamente um item do checklist do
  // professor. Agora dizem onde estão.
  { ciclo: 's4', evidencia: 'Papéis', status: 'validado', responsavel: 'gabriel' },
  {
    ciclo: 's4',
    evidencia: 'Cronograma de execução',
    status: 'feito',
    responsavel: 'fernando',
    link: '/#cronograma',
  },

  // O Kick-off passou (12/09). Os dois itens ficaram "em andamento" depois da
  // apresentação, e o cronograma público mostrava um marco vencido como se
  // ainda estivesse acontecendo. Os dezessete slides e a fala dividida entre
  // os seis estão em /pitch e no registro validado do ciclo.
  {
    ciclo: 'ko',
    evidencia: 'Pitch: problema, objetivos, análises, ideação, solução e cronograma',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/pitch',
  },
  {
    ciclo: 'ko',
    evidencia: 'Fala distribuída entre quem apresenta',
    status: 'feito',
    responsavel: 'joao-pedro',
    link: '/pitch',
  },
  {
    ciclo: 'ko',
    evidencia: 'Objetivo geral e objetivos específicos',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-ko-objetivos',
  },
  {
    ciclo: 'ko',
    evidencia: 'Matriz CSD',
    status: 'feito',
    responsavel: 'matheus',
    link: '/#doc-ko-csd',
  },
  {
    ciclo: 'ko',
    evidencia: 'Wireframes de baixa fidelidade',
    status: 'feito',
    responsavel: 'joao-pedro',
    link: '/#doc-ko-wireframes',
  },

  // SEMANA 5 EM DIANTE: status pelo que existe no repositório em 25/09, não
  // pelo que foi prometido. O responsável segue a frente de cada um em
  // `equipe.ts`; a equipe confirma os donos. Sem estas linhas o cronograma
  // público mostrava s5, s6 e SR1 inteiros "a fazer", com o trabalho no ar.
  {
    ciclo: 's5',
    evidencia: 'Diagrama de arquitetura',
    status: 'feito',
    responsavel: 'joao-henrique',
    link: '/arquitetura',
  },
  {
    // Era "em andamento" com o gerador sintético da lente de ML, que saiu na
    // ADR-043. O fluxo de dados do sistema, do teclado da unidade ao painel,
    // está no documento de nuvem desta semana.
    ciclo: 's5',
    evidencia: 'Fluxo de dados',
    status: 'feito',
    responsavel: 'joao-henrique',
    link: '/#doc-s5-nuvem',
  },
  {
    ciclo: 's5',
    evidencia: 'Primeiras telas',
    status: 'feito',
    responsavel: 'joao-pedro',
    link: '/sistema',
  },
  {
    // O CI roda typecheck, testes com Postgres, build, vazamento e e2e a cada
    // envio ao GitHub.
    ciclo: 's5',
    evidencia: 'Pipeline',
    status: 'feito',
    responsavel: 'fernando',
    link: `${URL_REPOSITORIO}/blob/main/.github/workflows/ci.yml`,
  },
  {
    ciclo: 's5',
    evidencia: 'Backlog técnico',
    status: 'feito',
    responsavel: 'joao-henrique',
    link: '/#doc-s6-backlog',
  },

  {
    // Em andamento, e não feito: o mapa existe, mas a apresentação e o ensaio
    // são desta semana.
    ciclo: 's6',
    evidencia: 'Pacote SR1',
    status: 'em_andamento',
    responsavel: 'gabriel',
    link: '/#doc-sr1-pacote',
  },
  {
    ciclo: 's6',
    evidencia: 'Protótipo atualizado',
    status: 'feito',
    responsavel: 'joao-pedro',
    link: '/sistema',
  },
  {
    ciclo: 's6',
    evidencia: 'Escopo revisado',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s6-escopo-revisado',
  },
  {
    ciclo: 's6',
    evidencia: 'Cronograma e backlog',
    status: 'feito',
    responsavel: 'gabriel',
    link: '/#doc-s6-backlog',
  },
  {
    ciclo: 's6',
    evidencia: 'Riscos',
    status: 'feito',
    responsavel: 'fernando',
    link: '/#doc-s6-riscos',
  },

  {
    ciclo: 'sr1',
    evidencia: 'Pesquisa consolidada',
    status: 'feito',
    responsavel: 'matheus',
    link: '/#doc-sr1-sintese-da-pesquisa',
  },
  {
    // Em andamento: o escopo ainda depende de respostas da Secretaria
    // (cortes das classes, porte, Indicador 3).
    ciclo: 'sr1',
    evidencia: 'Escopo maduro',
    status: 'em_andamento',
    responsavel: 'gabriel',
    link: '/#doc-s6-escopo-revisado',
  },
  {
    ciclo: 'sr1',
    evidencia: 'Protótipo de baixa/média fidelidade',
    status: 'feito',
    responsavel: 'joao-pedro',
    link: '/sistema',
  },
  {
    ciclo: 'sr1',
    evidencia: 'Desenvolvimento iniciado',
    status: 'feito',
    responsavel: 'joao-henrique',
    link: URL_REPOSITORIO,
  },
  {
    ciclo: 'sr1',
    evidencia: 'Evidências técnicas',
    status: 'feito',
    responsavel: 'fernando',
    link: '/#doc-sr1-seguranca',
  },
  {
    // Em andamento: o planejado contra realizado está escrito, e o retorno da
    // banca entra no dia.
    ciclo: 'sr1',
    evidencia: 'Plano de correção de rota',
    status: 'em_andamento',
    responsavel: 'gabriel',
    link: '/#doc-sr1-correcao-de-rota',
  },
]

export interface LinhaChecklist {
  ciclo: CicloId
  rotuloCiclo: string
  data: string
  evidencia: string
  status: StatusEvidencia
  responsavel?: IntegranteId
  link?: string
}

/** Junta as evidências do cronograma com os status declarados acima. */
export function montarChecklist(): LinhaChecklist[] {
  return CRONOGRAMA.flatMap((ciclo) =>
    ciclo.evidencias.map((evidencia) => {
      const item = CHECKLIST.find((i) => i.ciclo === ciclo.id && i.evidencia === evidencia)
      return {
        ciclo: ciclo.id as CicloId,
        rotuloCiclo: ciclo.rotulo,
        data: ciclo.data,
        evidencia,
        status: item?.status ?? 'a_fazer',
        responsavel: item?.responsavel,
        link: item?.link,
      }
    }),
  )
}
