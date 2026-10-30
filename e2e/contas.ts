/**
 * As contas da suíte de ponta a ponta (ADR-051). Criadas pelo `webServer` do
 * `playwright.config.ts` num banco DESCARTÁVEL, que a suíte apaga a cada
 * execução: a senha só existe lá, e por isso pode morar no repositório.
 */
export const SENHA_E2E = 'senha-das-contas-do-e2e'

export const CONTA_SEAB = 'e2e-seab'
export const CONTA_CANARIO = 'e2e-canario'
