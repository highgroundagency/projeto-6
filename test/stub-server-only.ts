/**
 * Stub de `server-only` para o Vitest.
 *
 * O pacote real lança erro quando importado fora de um Server Component. Nos
 * testes queremos justamente exercitar esses módulos, então ele é trocado por
 * este arquivo vazio via `resolve.alias` em vitest.config.mts.
 */
export {}
