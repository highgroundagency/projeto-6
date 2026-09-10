import { CRONOGRAMA, type CicloId } from '@/lib/cronograma'
import { hojeEmRecife } from '@/lib/datas'
import {
  ADIANTAMENTO_PADRAO,
  calcularReleaseAtual,
  ciclosVisiveis,
  ehSemanaCorrente,
  pitchEmDestaque,
} from '@/lib/releases'

/**
 * Que ciclos o visitante enxerga HOJE, derivado do cronograma real.
 *
 * Estes números eram literais nos testes: `s4` era "a semana que o visitante
 * ainda não vê". Só que o release anda com o calendário, e no dia em que a s4
 * virou pública o teste passou a falhar sozinho, sem ninguém ter tocado no
 * código. Foram três falhas de CI por isso.
 *
 * Um teste com data embutida não está errado hoje e certo amanhã: ele está
 * errado desde sempre e só cobra a conta depois. Por isso o recorte sai da
 * mesma fonte única de verdade que a aplicação usa (`src/lib/cronograma.ts`),
 * e não de um id escrito à mão.
 */
function recorte() {
  const hoje = hojeEmRecife()
  const releaseAtual = calcularReleaseAtual({ hoje, adiantamentoDias: ADIANTAMENTO_PADRAO })
  const visiveis = ciclosVisiveis({ releaseAtual })

  // Só ciclos que RENDERIZAM um cartão de registro entram na conta. Os
  // imprensados (`tipo: 'pausa'`) têm carregador `null` de propósito: as
  // entregas deles são acumuladas na semana seguinte. Procurar o marcador de um
  // imprensado não acha nada nem para o admin, e o teste falharia acusando um
  // vazamento que não existe.
  //
  // O registry é `server-only` e não pode ser importado aqui, então o critério é
  // o `tipo` do cronograma. `cronograma.test.ts` guarda a equivalência entre os
  // dois, para esta dedução não apodrecer caladinha.
  const comRegistro = CRONOGRAMA.filter((c) => c.tipo !== 'pausa').map((c) => c.id as CicloId)

  return {
    visiveis: comRegistro.filter((id) => visiveis.includes(id)),
    ocultos: comRegistro.filter((id) => !visiveis.includes(id)),
    /** Inclui os imprensados: eles aparecem como cartão, só não têm registro. */
    todosVisiveis: CRONOGRAMA.map((c) => c.id as CicloId).filter((id) => visiveis.includes(id)),
  }
}

const RECORTE = recorte()

/** Um ciclo que o visitante JÁ vê. O primeiro, que é o mais estável. */
export const CICLO_PUBLICO: CicloId = RECORTE.visiveis[0]

/** Todos os ciclos que o visitante vê hoje: para um teste perguntar por um específico. */
export const CICLOS_PUBLICOS: readonly CicloId[] = RECORTE.visiveis

/**
 * Qual cartão deve estar marcado como "esta semana" hoje, se algum.
 *
 * Nas semanas imprensadas é um cartão SEM registro, e depois que o cronograma
 * acaba não é nenhum. Derivar isto é o que impede o teste de exigir uma
 * pílula que a página não tem como mostrar: ele ficou vermelho de 05/09 a
 * 11/09 exatamente por isso, e teria voltado ao verde sozinho no sábado,
 * escondendo o defeito em vez de expô-lo.
 */
export const CICLO_DA_SEMANA: CicloId | null =
  RECORTE.todosVisiveis.find((id) => ehSemanaCorrente(hojeEmRecife(), id)) ?? null

/** O topo do site deve oferecer o pitch hoje? Mesma conta que a home faz. */
export const DEVE_OFERECER_PITCH: boolean =
  RECORTE.todosVisiveis.includes('ko') && pitchEmDestaque(hojeEmRecife())

/** O primeiro ciclo que o visitante AINDA não vê: o alvo natural do teste de vazamento. */
export const CICLO_OCULTO: CicloId = RECORTE.ocultos[0]

/**
 * O marcador que o registro imprime no HTML de cada ciclo renderizado.
 *
 * Procurar por ele é o que torna o teste de vazamento honesto: `<details>`
 * fechado continua no DOM, então "não aparece na tela" não prova nada.
 */
export function marcador(ciclo: CicloId): string {
  return `PRUMO-MARCADOR-CICLO-${ciclo}`
}
