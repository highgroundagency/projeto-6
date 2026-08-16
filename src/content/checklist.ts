import type { IntegranteId } from '@/content/equipe'
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
  { ciclo: 's2', evidencia: 'Problema contextualizado', status: 'feito', responsavel: 'matheus' },
  {
    ciclo: 's2',
    evidencia: 'Personas e stakeholders',
    status: 'feito',
    responsavel: 'matheus',
    link: '/registro#ciclo-s2',
  },
  { ciclo: 's2', evidencia: 'Mapa de empatia', status: 'feito', responsavel: 'matheus', link: '/registro#ciclo-s2' },
  { ciclo: 's2', evidencia: 'Benchmarking', status: 'feito', responsavel: 'fernando' },
  { ciclo: 's2', evidencia: 'SWOT', status: 'feito', responsavel: 'gabriel' },
  { ciclo: 's2', evidencia: 'Objetivos', status: 'feito', responsavel: 'gabriel' },
  { ciclo: 's2', evidencia: 'Cronograma inicial', status: 'validado', responsavel: 'joao-henrique' },

  { ciclo: 's3', evidencia: "Brainwriting, Brainstorming e Crazy 8's registrados", status: 'feito', responsavel: 'joao-pedro' },
  { ciclo: 's3', evidencia: 'Alternativas levantadas', status: 'feito', responsavel: 'joao-pedro' },
  { ciclo: 's3', evidencia: 'Critérios de decisão', status: 'feito', responsavel: 'gabriel' },
  { ciclo: 's3', evidencia: 'Ideia escolhida com justificativa', status: 'feito', responsavel: 'gabriel' },

  { ciclo: 's4', evidencia: 'Proposta de solução', status: 'feito', responsavel: 'gabriel' },
  { ciclo: 's4', evidencia: 'Escopo preliminar', status: 'feito', responsavel: 'joao-henrique' },
  { ciclo: 's4', evidencia: 'Backlog inicial', status: 'feito', responsavel: 'gabriel' },

  { ciclo: 'ko', evidencia: 'Pitch de 5 min: problema, relevância, ideia priorizada, direcionamento', status: 'em_andamento', responsavel: 'gabriel' },
  { ciclo: 'ko', evidencia: 'Fala distribuída entre os 6 integrantes', status: 'em_andamento', responsavel: 'joao-pedro' },
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
