import type { ReactNode } from 'react'
import type { CicloId } from '@/lib/cronograma'
import type { IntegranteId } from '@/content/equipe'

/**
 * Tipos do registro semanal (§5 do briefing).
 *
 * A regra: se um ciclo publicado estiver incompleto, o BUILD QUEBRA. Por isso
 * todos os blocos são obrigatórios e as listas usam `NaoVazio`, que recusa `[]`
 * em tempo de compilação. O que o tipo não pega — string vazia, link malformado,
 * semana passada sem registro — é coberto por `registro.test.ts`.
 */

export type Selo = 'rascunho' | 'validado'

/** Lista que o compilador recusa vazia. */
export type NaoVazio<T> = readonly [T, ...T[]]

export interface Bloco<T> {
  readonly selo: Selo
  /** Quem validou. `null` enquanto o bloco estiver em rascunho. */
  readonly validadoPor: IntegranteId | null
  readonly conteudo: T
}

export interface Decisao {
  readonly decisao: string
  /** Por que foi decidido assim — uma linha. */
  readonly porque: string
}

export type OrigemFeedback = 'professor' | 'cliente' | 'equipe'

export interface Feedback {
  readonly origem: OrigemFeedback
  readonly texto: string
}

export interface Contribuicao {
  readonly integrante: IntegranteId
  readonly contribuicao: string
}

export type TipoEvidencia =
  | 'prototipo'
  | 'codigo'
  | 'testes'
  | 'dashboard'
  | 'documento'

export interface Evidencia {
  readonly tipo: TipoEvidencia
  readonly rotulo: string
  readonly url: string
}

export interface RegistroSemana {
  readonly ciclo: CicloId
  /**
   * Marcador único do ciclo, renderizado como `data-marcador` no cartão.
   * É a sonda usada por `scripts/verificar-vazamento.ts` para provar que
   * conteúdo de release futuro não chega ao visitante.
   */
  readonly marcador: string
  readonly objetivo: Bloco<string>
  readonly avancos: Bloco<NaoVazio<string>>
  readonly decisoes: Bloco<NaoVazio<Decisao>>
  readonly bloqueios: Bloco<NaoVazio<string> | 'nenhum'>
  readonly feedback: Bloco<NaoVazio<Feedback> | 'nenhum'>
  readonly proximosPassos: Bloco<NaoVazio<string>>
  readonly responsaveis: Bloco<NaoVazio<Contribuicao>>
  readonly evidencias: Bloco<readonly Evidencia[]>
}

/**
 * Módulo de conteúdo de um ciclo.
 *
 * REGRA DE OURO: estes módulos são SEMPRE Server Components. Nada de
 * `'use client'` aqui dentro — um componente cliente geraria um chunk próprio
 * no bundle, descobrível mesmo sem estar referenciado. Interatividade vem de
 * componentes compartilhados em `src/components/`, que existem no bundle
 * independentemente do release e portanto não revelam nada.
 */
/**
 * Um documento da semana — SWOT, personas, mapa de empatia, backlog.
 *
 * O documento vive AQUI, em TSX versionado, e é renderizado dentro da própria
 * página. Nada de PDF: quem avalia clica no título e lê ali mesmo, sem trocar
 * de aba, sem baixar arquivo e sem depender de link que expira.
 *
 * Como qualquer conteúdo de ciclo, é Server Component — a regra de ouro acima
 * vale igual aqui.
 */
export interface Documento {
  /** Único dentro do ciclo. Vira a âncora `#doc-<ciclo>-<id>`. */
  readonly id: string
  readonly titulo: string
  /** Uma linha dizendo o que o documento entrega, visível com ele fechado. */
  readonly resumo: string
  readonly Conteudo: () => ReactNode
}

export interface ModuloCiclo {
  readonly registro: RegistroSemana
  /** Documentos da semana, cada um numa sanfona própria. */
  readonly documentos?: readonly Documento[]
  /** Conteúdo longo que não é documento fechado (roteiros, notas). */
  readonly Detalhes?: () => ReactNode
}

export const ROTULO_EVIDENCIA: Record<TipoEvidencia, string> = {
  prototipo: 'Protótipo',
  codigo: 'Código',
  testes: 'Testes',
  dashboard: 'Dashboard',
  documento: 'Documento',
}

export const ROTULO_ORIGEM: Record<OrigemFeedback, string> = {
  professor: 'Professor',
  cliente: 'Cliente',
  equipe: 'Equipe',
}
