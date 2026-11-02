import 'server-only'
import type { Ambiente } from '@/lib/ambiente'
import { bancoCompartilhado, driverPostgres } from './driver-postgres'
import { fonteDoAmbiente, type Banco } from './postgres/conexao'
import { driverSeed } from './driver-seed'
import type { RepositorioDados } from './tipos'

export type { Panorama, RepositorioDados, Resultado } from './tipos'

/**
 * Camada de dados do sistema.
 *
 * A fonte é o PostgreSQL (`driver-postgres.ts`). As credenciais vêm do AWS
 * Secrets Manager quando `DATABASE_SECRET_ID` está definido, ou de
 * `DATABASE_URL` no desenvolvimento (`postgres/conexao.ts`).
 * As oito telas não mudaram com a troca: elas falam com `RepositorioDados`,
 * e é isso que esta abstração existia para garantir (ADR-011).
 *
 * O seed em memória continua existindo para duas coisas só: alimentar a carga
 * inicial do banco (`npm run db:preparar`) e os testes de unidade que não
 * sobem banco. Para a aplicação usá-lo, é preciso pedir explicitamente com
 * `DADOS_DRIVER=seed`. Sem banco configurado, o sistema avisa em vez de cair
 * calado nos dados em memória.
 */

export class BancoNaoConfigurado extends Error {
  constructor() {
    super(
      'Banco de dados não configurado. Rode `docker compose up -d --build`, ou defina ' +
        'DATABASE_URL (desenvolvimento) ou DATABASE_SECRET_ID (AWS Secrets Manager). ' +
        'Ver docs/banco.md.',
    )
    this.name = 'BancoNaoConfigurado'
  }
}

export function escolherDriver(ambiente: Ambiente): RepositorioDados {
  const escolhido = ambiente.DADOS_DRIVER?.trim().toLowerCase()
  if (escolhido === 'seed') return driverSeed()

  const fonte = fonteDoAmbiente(ambiente)
  if (!fonte) throw new BancoNaoConfigurado()
  return driverPostgres(bancoCompartilhado(fonte))
}

let cache: RepositorioDados | null = null

export function repositorio(): RepositorioDados {
  if (cache) return cache
  cache = escolherDriver(process.env)
  return cache
}

/** Usado nos testes para injetar um driver. */
export function definirRepositorio(driver: RepositorioDados | null): void {
  cache = driver
}

/**
 * O banco em si, para o que não é dado de domínio: as contas de acesso
 * (`src/lib/auth/`). `null` quando o app roda sem banco (`DADOS_DRIVER=seed`),
 * e aí não há login: o sistema fica só leitura.
 */
export function bancoDaAplicacao(ambiente: Ambiente = process.env): Banco | null {
  if (ambiente.DADOS_DRIVER?.trim().toLowerCase() === 'seed') return null
  const fonte = fonteDoAmbiente(ambiente)
  return fonte ? bancoCompartilhado(fonte) : null
}
