/**
 * Gerador pseudoaleatório com semente fixa (mulberry32).
 *
 * Determinístico de propósito: o mesmo seed produz sempre os mesmos dados, em
 * qualquer máquina. Sem isso, cada build teria números diferentes e nenhum
 * teste sobre o seed seria confiável.
 */
export function prng(semente: number): () => number {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

export function entre(aleatorio: () => number, minimo: number, maximo: number): number {
  return minimo + aleatorio() * (maximo - minimo)
}

export function escolher<T>(aleatorio: () => number, itens: readonly T[]): T {
  return itens[Math.floor(aleatorio() * itens.length) % itens.length]
}
