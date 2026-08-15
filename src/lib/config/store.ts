import 'server-only'
import { driverArquivo } from './driver-arquivo'
import { driverMemoria } from './driver-memoria'
import { configPadrao, type ConfigSite, type ConfigStore } from './tipos'

const CAMINHO_PADRAO = process.env.CONFIG_SITE_ARQUIVO ?? '.dados/config-site.json'

/**
 * Driver de produção antes da F3: lê os padrões do ambiente e recusa escrita.
 *
 * O filesystem da Vercel é read-only, então gravar JSON em disco falharia em
 * runtime. Até o Supabase entrar, a configuração global de produção vem de env
 * var (mudança = redeploy) e o painel avisa isso na cara do operador. As
 * mudanças que o admin faz no painel viram um overlay assinado na sessão dele
 * — valem para a própria visão, não para o público. Ver docs/releases.md.
 */
function driverSomenteLeitura(base: ConfigSite): ConfigStore {
  return {
    nome: 'env (somente leitura até a F3)',
    gravavel: false,
    async ler() {
      return { ...base, travas: { ...base.travas } }
    },
    async gravar() {
      throw new Error(
        'Configuração global é somente leitura neste ambiente. Use o overlay da sessão ou altere as env vars de release.',
      )
    },
    async historico() {
      return []
    },
  }
}

let cache: ConfigStore | null = null

export function obterStore(): ConfigStore {
  if (cache) return cache
  cache =
    process.env.VERCEL || process.env.CONFIG_SITE_SOMENTE_LEITURA === '1'
      ? driverSomenteLeitura(configPadrao())
      : driverArquivo(CAMINHO_PADRAO)
  return cache
}

/** Usado nos testes de integração para trocar o driver. */
export function definirStore(store: ConfigStore | null): void {
  cache = store
}

export { driverMemoria }
