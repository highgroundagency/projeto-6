import 'server-only'
import resultados from '@/content/ml/resultados.json'

/**
 * Resultados da lente de machine learning.
 *
 * O JSON é produzido offline pelos cadernos de `ml/notebooks` (o 06 escreve o
 * arquivo) e versionado no Git. Não há
 * inferência em tempo real: carregar scikit-learn a cada requisição custaria
 * segundos de cold start para exibir números que só mudam entre deploys.
 *
 * O que se ganha em troca da simplicidade é auditabilidade — o arquivo carrega
 * semente, commit, versão do sklearn e data, então qualquer pessoa reproduz o
 * número rodando os seis cadernos em ordem. Ver ADR-022 e ADR-043.
 */

export interface ReferenciaModelo {
  readonly nome: string
  readonly acuracia?: number
  readonly f1?: number
  readonly mae?: number
  readonly observacao?: string
}

/** Um grupo do clustering. Agrupa unidades, nunca pessoas. */
export interface GrupoDeUnidades {
  readonly nome: string
  readonly unidades: number
  readonly resultado_medio: number
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
  readonly grupos?: readonly GrupoDeUnidades[]
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
  classificacao: 'Classificação: abaixo de 90%',
  regressao: 'Regressão',
  clustering: 'Clustering',
}
