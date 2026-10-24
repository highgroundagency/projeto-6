/**
 * O número mínimo do recorte (risco 15 da Atividade 2 de Direito).
 *
 * Esconder o nome não basta quando o recorte é pequeno. No Distrito Oeste da
 * base de teste, as quatro unidades são de quatro tipos diferentes: com a sigla
 * na coluna, "unidade 03 · CECON" é a única CECON do distrito, e todo mundo na
 * reunião sabe de quem é a nota. Por isso, no modo anônimo:
 *
 * - um tipo com menos de `MINIMO_DO_RECORTE` unidades no recorte tem a sigla
 *   suprimida;
 * - um recorte inteiro com menos que isso não mostra ranking nenhum.
 *
 * Três é o menor número em que "uma delas" deixa de apontar para alguém por
 * eliminação, e é arbitrado: a portaria não fixa um mínimo, e o documento de
 * Direito pede que ele exista, não que seja este. Mudar é mudar esta constante.
 */
export const MINIMO_DO_RECORTE = 3

/** Os tipos que aparecem menos que o mínimo na lista: as siglas que somem. */
export function tiposSuprimidos(tiposDoRecorte: readonly string[]): ReadonlySet<string> {
  const contagem = new Map<string, number>()
  for (const tipo of tiposDoRecorte) contagem.set(tipo, (contagem.get(tipo) ?? 0) + 1)
  return new Set(
    [...contagem].filter(([, quantos]) => quantos < MINIMO_DO_RECORTE).map(([tipo]) => tipo),
  )
}

/** Recorte pequeno demais para um ranking anônimo. */
export function recortePequenoDemais(unidadesNoRecorte: number): boolean {
  return unidadesNoRecorte < MINIMO_DO_RECORTE
}
