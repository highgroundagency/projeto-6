import 'server-only'
import resultados from '@/content/ml/resultados.json'

/**
 * Resultados da lente de machine learning.
 *
 * O JSON é produzido offline por `ml/exportar.py` e versionado no Git. Não há
 * inferência em tempo real: carregar scikit-learn a cada requisição custaria
 * segundos de cold start para exibir números que só mudam entre deploys.
 *
 * O que se ganha em troca da simplicidade é auditabilidade — o arquivo carrega
 * semente, commit, versão do sklearn e data, então qualquer pessoa reproduz o
 * número rodando os mesmos dois comandos. Ver ADR-022.
 */

export interface ReferenciaModelo {
  readonly nome: string
  readonly acuracia?: number
  readonly f1?: number
  readonly mae?: number
  readonly observacao?: string
}

export interface AreaAgrupada {
  readonly area_id: string
  readonly grupo: string
  readonly atingimento_medio: number
  readonly volatilidade: number
}

export interface Importancia {
  readonly atributo: string
  readonly peso: number
}

export interface MetricasModelo {
  readonly acuracia?: number
  readonly precisao?: number
  readonly revocacao?: number
  readonly f1?: number
  readonly mae?: number
  readonly r2?: number
  readonly silhueta?: number
  readonly k?: number
  readonly amostras_teste?: number
  readonly positivos_no_teste?: number
  /**
   * Se o modelo supera a linha de base. `false` é publicado igual: um resultado
   * negativo escondido é pior que um resultado negativo.
   */
  readonly supera_referencia?: boolean
  readonly importancias?: readonly Importancia[]
  readonly areas?: readonly AreaAgrupada[]
}

export interface ModeloExportado {
  readonly modelo: string
  readonly pergunta: string
  readonly metodo: string
  readonly metricas: MetricasModelo
  readonly referencia: ReferenciaModelo
  readonly limitacao: string
}

export interface ResultadosML {
  readonly gerado_em: string
  readonly semente: number
  readonly commit: string
  readonly versao_sklearn: string
  readonly base: string
  readonly aviso: string
  readonly modelos: readonly ModeloExportado[]
}

export const ML: ResultadosML = resultados as ResultadosML

export function modeloPorId(id: string): ModeloExportado | undefined {
  return ML.modelos.find((m) => m.modelo === id)
}

/** Rótulo curto de cada família, para o cabeçalho do painel. */
export const ROTULO_MODELO: Record<string, string> = {
  classificacao: 'Classificação — atingir a meta',
  classificacao_tendencia: 'Classificação — tendência',
  regressao: 'Regressão',
  clustering: 'Clustering',
}
