/**
 * Entidades do sistema de gratificação (§8.2), remodeladas depois da reunião
 * com o cliente de 22/08 (ADR-034): quem se preenche é o SUBINDICADOR, o
 * indicador é calculado; a rede é Secretaria → distrito sanitário → unidade; e
 * a aplicabilidade (que indicador vale, com que meta e peso) depende do TIPO
 * da unidade e mora na regra versionada.
 *
 * Todos os dados que preenchem estes tipos são SINTÉTICOS. Nenhum dado real de
 * pessoa ou da SESAU entra no repositório.
 */

/**
 * Para onde o indicador deve andar.
 *
 * `faixa_ideal` é a terceira, e ela existe porque a planilha do cliente tem
 * subindicador em que passar do alvo TAMBÉM perde ponto: há régua em que ficar
 * entre 65 e 85 vale nota cheia e 90 vale menos. Com duas direções só, o motor
 * premiaria o excesso. Ela só tem sentido no método de notas: no método de
 * atingimento não há como exprimir um teto sem inverter a conta.
 */
export type Direcao = 'maior_melhor' | 'menor_melhor' | 'faixa_ideal'

export type Periodicidade = 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual'

export type EstadoCiclo =
  | 'rascunho'
  | 'lancamento_aberto'
  | 'em_validacao'
  | 'homologado'
  | 'publicado'

export const ORDEM_ESTADOS: readonly EstadoCiclo[] = [
  'rascunho',
  'lancamento_aberto',
  'em_validacao',
  'homologado',
  'publicado',
]

export const ROTULO_ESTADO: Record<EstadoCiclo, string> = {
  rascunho: 'Rascunho',
  lancamento_aberto: 'Lançamento aberto',
  em_validacao: 'Em validação',
  homologado: 'Homologado',
  publicado: 'Publicado',
}

/**
 * A explicação de cada etapa, em linguagem de balcão.
 *
 * Os nomes das etapas vêm do processo real e não dá para trocá-los sem perder a
 * ligação com a portaria. O que dá para fazer é explicar cada um em uma frase
 * curta, sem palavra de sistema, e mostrar essa frase SEMPRE ao lado do nome.
 */
export const EXPLICACAO_ESTADO: Record<EstadoCiclo, string> = {
  rascunho: 'O mês ainda está sendo preparado. Ninguém informa nada por enquanto.',
  lancamento_aberto: 'O prazo está aberto: cada unidade entra e informa os números do mês.',
  em_validacao: 'O prazo acabou. A SEAB confere os números antes de fazer a conta.',
  homologado: 'A conta foi feita e a SEAB aprovou o resultado.',
  publicado: 'O resultado está no ar. Cada gerente pode ver a nota da sua unidade.',
}

export interface CicloAvaliacao {
  readonly id: string
  /** Competência no formato `YYYY-MM`. */
  readonly competencia: string
  readonly estado: EstadoCiclo
  readonly janelaLancamentoInicio: string
  readonly janelaLancamentoFim: string
  /**
   * Início da janela de revisão (`YYYY-MM-DD`): os dias finais do prazo em que
   * a unidade pode corrigir o que já lançou, com o valor antigo preservado na
   * trilha. É um PERÍODO dentro de `lancamento_aberto`, não um sexto estado: a
   * máquina de estados do processo real não muda por causa disso.
   */
  readonly revisaoInicio: string
  /** Versão da regra usada quando o ciclo foi homologado. */
  readonly regraId: string
}

/** Distrito sanitário: o degrau entre a Secretaria e as unidades. */
export interface Distrito {
  readonly id: string
  readonly nome: string
}

/**
 * Tipo de unidade de saúde (USF, CAPS, UPA...). É ele que decide quais
 * indicadores se aplicam e com que pesos — ver `Aplicabilidade`.
 */
export interface TipoUnidade {
  readonly id: string
  readonly nome: string
  readonly sigla: string
}

/** Unidade de saúde: quem lança os números e quem recebe a nota. */
export interface Unidade {
  readonly id: string
  readonly nome: string
  readonly distritoId: string
  readonly tipoId: string
}

export type EscopoGerente = 'unidade' | 'distrito'

/**
 * Quem é avaliado: o gerente da unidade (pela nota da unidade) e o gerente
 * distrital (pela média das unidades do distrito).
 *
 * `unidadeId` é obrigatório quando o escopo é 'unidade'; `distritoId`, quando o
 * escopo é 'distrito'. O outro campo fica nulo — o distrito de um gerente de
 * unidade se descobre pela própria unidade, e duplicar seria pedir divergência.
 */
export interface Gerente {
  readonly id: string
  readonly nome: string
  readonly cargo: string
  readonly escopo: EscopoGerente
  readonly unidadeId: string | null
  readonly distritoId: string | null
}

/**
 * Indicador CALCULADO: catálogo global, sem meta nem peso próprios.
 *
 * Meta e peso dependem do tipo da unidade e mudam de ano em ano, então moram
 * na regra versionada (`Aplicabilidade`) — foi o que a reunião de 22/08
 * esclareceu. O que se preenche são os subindicadores dele.
 */
export interface Indicador {
  readonly id: string
  readonly nome: string
  /** Unidade de MEDIDA (%, dias, atendimentos) — não confundir com `Unidade`. */
  readonly unidadeMedida: string
  readonly direcao: Direcao
  readonly fonte: string
  readonly periodicidade: Periodicidade
}

export type TipoSubindicador = 'indice' | 'razao'

/**
 * O que a unidade de fato preenche.
 *
 * 'indice' recebe um valor direto; 'razao' recebe numerador e denominador
 * (ex.: gestantes com pré-natal em dia ÷ gestantes cadastradas) e o valor
 * apurado é a proporção em percentual.
 */
export interface Subindicador {
  readonly id: string
  readonly indicadorId: string
  readonly nome: string
  readonly tipo: TipoSubindicador
  /** Rótulos dos campos de 'razao', para a tela de lançamento. */
  readonly rotuloNumerador?: string
  readonly rotuloDenominador?: string
}

export type StatusLancamento = 'rascunho' | 'enviado' | 'validado' | 'rejeitado'

/**
 * Um lançamento por SUBINDICADOR, por unidade, por ciclo.
 *
 * Para subindicador 'indice', `valor` preenchido; para 'razao', `numerador` e
 * `denominador`. Os campos que não valem para o tipo ficam nulos.
 */
export interface Lancamento {
  readonly id: string
  readonly subindicadorId: string
  readonly unidadeId: string
  readonly cicloId: string
  readonly valor: number | null
  readonly numerador: number | null
  readonly denominador: number | null
  readonly evidencia: string
  readonly autor: string
  readonly registradoEm: string
  readonly status: StatusLancamento
}

/**
 * Um degrau da régua: o intervalo do VALOR apurado e a nota que ele vale.
 *
 * Intervalo `[de, ate)`, igual ao resto do sistema. `de: null` é "sem piso" e
 * `ate: null` é "sem teto". A ordem da lista manda: vence o primeiro degrau que
 * contém o valor, então uma régua não monótona (a faixa ideal) se escreve sem
 * campo novo, só pondo o degrau de nota cheia no meio.
 */
export interface Degrau {
  readonly de: number | null
  readonly ate: number | null
  /** Nota de 0 a 1. É a escala da planilha do cliente, não a de 0 a 10. */
  readonly nota: number
}

/**
 * Como um subindicador vira nota, no método de notas.
 *
 * MORA NA REGRA VERSIONADA porque é exatamente o que muda de versão para
 * versão. A régua de um mesmo subindicador já mudou na prática sem mudar a
 * portaria, e é isso que a coluna "peso atual (excepcional)" da planilha do
 * cliente registra.
 */
export interface GraduacaoSubindicador {
  readonly subindicadorId: string
  readonly degraus: readonly Degrau[]
}

/**
 * A SEGUNDA gradação: a média das notas dos subindicadores passa por outra
 * régua antes de virar a nota do indicador.
 *
 * Não é detalhe: sem ela, uma média de 0,6 valeria 0,6. Com ela, a mesma média
 * pode valer 0,5, porque a portaria gradua de novo no fim (Indicador 2,
 * etapa 03). Indicador sem entrada aqui usa a própria média.
 */
export interface GraduacaoIndicador {
  readonly indicadorId: string
  readonly degraus: readonly Degrau[]
}

/**
 * Como a regra transforma o que foi lançado em pontos.
 *
 * - `atingimento`: valor composto ÷ meta, graduado UMA vez no fim. Foi o que a
 *   equipe assumiu antes de ver a planilha, e é o que as regras v1 e v2 usam.
 * - `notas`: cada subindicador vira nota primeiro, a média das notas vira a
 *   nota do indicador, e há uma segunda gradação opcional. É o que a planilha
 *   do cliente faz, conferido fórmula a fórmula.
 *
 * As duas convivem de propósito. Um ciclo fechado sob a v2 tem de continuar
 * devolvendo o mesmo número depois da v3, e regra é dado: trocar o método é
 * publicar uma versão nova, nunca editar a vigente.
 */
export type MetodoDeCalculo = 'atingimento' | 'notas'

/** Faixa de atingimento → pontos. Intervalo fechado à esquerda, aberto à direita. */
export interface FaixaPontuacao {
  /** Atingimento mínimo, em fração (0.9 = 90%). */
  readonly de: number
  /** Atingimento máximo exclusivo. `null` = sem teto superior. */
  readonly ate: number | null
  readonly pontos: number
}

export interface FaixaGratificacao {
  /** Score mínimo, de 0 a 100. */
  readonly de: number
  readonly ate: number | null
  readonly rotulo: string
  /** Percentual da gratificação devida nesta faixa. */
  readonly percentual: number
}

export type ModoArredondamento = 'meio_para_cima' | 'meio_para_baixo' | 'truncar'

export type TratamentoSemLancamento = 'zera_com_aviso' | 'ignora' | 'usa_meta'

/**
 * O vínculo indicador × tipo de unidade, com a meta e o peso daquele ano.
 *
 * É DA REGRA versionada de propósito: "o que vale para cada tipo, com que
 * peso" é exatamente o que muda de ano em ano. Um indicador sem aplicabilidade
 * para o tipo da unidade fica fora da conta daquela unidade.
 */
export interface Aplicabilidade {
  readonly tipoUnidadeId: string
  readonly indicadorId: string
  readonly meta: number
  /** Peso relativo do indicador naquele tipo. Não precisa somar 1: o motor normaliza. */
  readonly peso: number
}

/**
 * Regra de pontuação VERSIONADA.
 *
 * Alterar uma regra cria uma nova versão; a vigente nunca é editada. Sem isso,
 * um ciclo já homologado deixaria de reproduzir o próprio resultado — que é
 * exatamente o problema que o projeto ataca. Regra é dado, não código.
 */
export interface RegraDePontuacao {
  readonly id: string
  readonly versao: number
  readonly descricao: string
  /** Competência inicial de vigência, `YYYY-MM`. */
  readonly vigenteDe: string
  readonly vigenteAte: string | null
  readonly faixas: readonly FaixaPontuacao[]
  readonly pontuacaoMaxima: number
  readonly faixasGratificacao: readonly FaixaGratificacao[]
  readonly aplicabilidades: readonly Aplicabilidade[]
  readonly arredondamento: {
    readonly casas: number
    readonly modo: ModoArredondamento
  }
  /** Teto de atingimento, em fração. 1.5 = ninguém passa de 150%. */
  readonly tetoAtingimento: number
  readonly semLancamento: TratamentoSemLancamento
  /** Ausente quer dizer `atingimento`: é o que as regras v1 e v2 já publicadas usam. */
  readonly metodo?: MetodoDeCalculo
  /** Só no método de notas: a régua de cada subindicador. */
  readonly graduacoes?: readonly GraduacaoSubindicador[]
  /** Só no método de notas: a régua aplicada sobre a média, quando existe. */
  readonly segundaGraduacao?: readonly GraduacaoIndicador[]
}

/** A conta de um subindicador dentro do passo do indicador. */
export interface PassoSubindicador {
  readonly subindicadorId: string
  readonly subindicador: string
  readonly tipo: TipoSubindicador
  readonly numerador: number | null
  readonly denominador: number | null
  /** Valor apurado: o próprio valor no 'indice', a proporção em % na 'razao'. */
  readonly valor: number | null
  /** Nota de 0 a 1 no método de notas. Ausente no método de atingimento. */
  readonly nota?: number | null
  readonly aviso?: string
}

export interface PassoMemoria {
  readonly indicadorId: string
  readonly indicador: string
  readonly unidadeMedida: string
  readonly direcao: Direcao
  /** Como o valor do indicador nasceu, subindicador por subindicador. */
  readonly subPassos: readonly PassoSubindicador[]
  /** Valor composto do indicador: média simples dos subindicadores apurados. */
  readonly valor: number | null
  readonly meta: number
  /** Atingimento antes do teto. `null` quando não houve lançamento. */
  readonly atingimentoBruto: number | null
  readonly atingimento: number | null
  readonly aplicouTeto: boolean
  readonly faixa: string
  /** Média das notas dos subindicadores, ANTES da segunda gradação. */
  readonly mediaDasNotas?: number | null
  /** Nota do indicador depois da segunda gradação. No método de notas, é o que vira pontos. */
  readonly nota?: number | null
  readonly pontos: number
  readonly peso: number
  readonly pesoNormalizado: number
  readonly contribuicao: number
  readonly aviso?: string
}

export interface MemoriaDeCalculo {
  readonly regraId: string
  readonly versaoRegra: number
  /** Qual caminho a conta seguiu. A tela muda de coluna por causa dele. */
  readonly metodo: MetodoDeCalculo
  readonly passos: readonly PassoMemoria[]
  readonly somaPesos: number
  readonly somaContribuicoes: number
  readonly pontuacaoMaxima: number
  readonly score: number
  readonly formula: string
}

/** A nota de uma UNIDADE num ciclo. O gerente da unidade responde por ela. */
export interface Avaliacao {
  readonly unidadeId: string
  readonly cicloId: string
  readonly score: number
  readonly faixa: FaixaGratificacao | null
  readonly memoria: MemoriaDeCalculo
  readonly avisos: readonly string[]
}

/**
 * A nota de um DISTRITO num ciclo: média simples das unidades dele.
 *
 * SUPOSIÇÃO declarada (a validar com a planilha prometida pelo cliente): a
 * agregação distrital pode ter ponderação própria na regra real.
 */
export interface AvaliacaoDistrital {
  readonly distritoId: string
  readonly cicloId: string
  readonly score: number
  readonly faixa: FaixaGratificacao | null
  readonly porUnidade: readonly { readonly unidadeId: string; readonly score: number }[]
  readonly avisos: readonly string[]
}

export type TipoEvento =
  | 'ciclo_criado'
  | 'ciclo_estado_alterado'
  | 'indicador_criado'
  | 'indicador_alterado'
  | 'regra_versionada'
  | 'lancamento_registrado'
  | 'lancamento_alterado'
  | 'avaliacao_calculada'
  | 'contestacao_aberta'
  | 'contestacao_respondida'

/** Trilha append-only: nada se apaga, tudo guarda o antes e o depois. */
export interface EventoAuditoria {
  readonly id: string
  readonly quando: string
  readonly autor: string
  readonly perfil: string
  readonly tipo: TipoEvento
  readonly entidade: string
  readonly descricao: string
  readonly antes: Record<string, unknown> | null
  readonly depois: Record<string, unknown> | null
}

export type StatusContestacao = 'aberta' | 'em_analise' | 'respondida' | 'acatada' | 'recusada'

export interface Contestacao {
  readonly id: string
  readonly gerenteId: string
  readonly cicloId: string
  readonly indicadorId: string | null
  readonly motivo: string
  readonly abertaEm: string
  readonly status: StatusContestacao
  readonly resposta: string | null
}
