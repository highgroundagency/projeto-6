import { existsSync, readFileSync } from 'node:fs'

/**
 * Lê `.env.local` e `.env` para os scripts de linha de comando, sem
 * dependência nova: só `CHAVE=valor`, uma por linha. O que já está no ambiente
 * vence o arquivo. O Next lê esses arquivos sozinho; os scripts não.
 */
export function lerEnvLocal(): void {
  for (const arquivo of ['.env.local', '.env']) {
    if (!existsSync(arquivo)) continue
    for (const linha of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
      const casamento = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (!casamento || process.env[casamento[1]]) continue
      process.env[casamento[1]] = casamento[2].replace(/^["']|["']$/g, '')
    }
  }
}
