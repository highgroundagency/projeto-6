import {
  ChartColumn,
  History,
  LayoutDashboard,
  MessageSquareWarning,
  PencilLine,
  Ruler,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { FeatureId } from '@/lib/features'

/**
 * Um símbolo por funcionalidade.
 *
 * Fica AQUI e não em `features.ts` de propósito: aquele arquivo é dado puro,
 * lido também pelo script de verificação de vazamento, que roda fora do React.
 * Um import de componente ali arrastaria a árvore de ícones para dentro de um
 * módulo que só precisava de strings.
 *
 * Regra da casa nº 9 (um acento só): o ícone conta como uma das três aparições
 * do laranja na tela, e por isso ele é o único elemento colorido do sumário.
 */
export const ICONE_DA_TELA: Record<FeatureId, LucideIcon> = {
  'painel-cam': LayoutDashboard,
  indicadores: Ruler,
  lancamento: PencilLine,
  'meu-resultado': Target,
  auditoria: History,
  'painel-gestao': ChartColumn,
  analytics: Sparkles,
  contestacao: MessageSquareWarning,
}
