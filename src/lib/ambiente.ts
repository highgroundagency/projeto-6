/**
 * Visão mínima do ambiente.
 *
 * As funções que leem configuração recebem o ambiente por parâmetro em vez de
 * ler `process.env` direto — assim os testes injetam um objeto simples, sem
 * precisar mexer no ambiente do processo nem lutar com o tipo `ProcessEnv`.
 */
export type Ambiente = Record<string, string | undefined>
