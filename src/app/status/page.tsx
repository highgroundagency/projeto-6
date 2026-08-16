import type { Metadata } from 'next'
import Link from 'next/link'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { Rodape } from '@/components/base/rodape'
import { coletarStatus } from '@/lib/status'

export const metadata: Metadata = {
  title: 'Status',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function PaginaStatus() {
  const status = await coletarStatus()

  const linhas: [string, string][] = [
    ['Produto', status.produto],
    ['Versão', status.versao],
    ['Ambiente', status.ambiente],
    ['Commit', status.commit],
    ['Driver de dados', status.modoDeDados],
    ['Escrita persistente', status.dadosPersistentes ? 'sim' : 'não (memória do processo)'],
    ['Driver de configuração', status.driverConfiguracao],
    ['Configuração gravável', status.configuracaoGravavel ? 'sim' : 'não'],
    ['Hoje (America/Recife)', status.hojeRecife],
    ['Release público', status.releasePublico],
    ['Ciclos no cronograma', String(status.ciclosNoCronograma)],
    ['Funcionalidades mapeadas', String(status.funcionalidades)],
    ['Áreas · indicadores', `${status.registros.areas} · ${status.registros.indicadores}`],
    ['Ciclos · lançamentos', `${status.registros.ciclos} · ${status.registros.lancamentos}`],
    ['Latência de coleta', `${status.latenciaMs} ms`],
  ]

  return (
    <main id="conteudo" className="mx-auto max-w-2xl px-5 py-7 sm:px-8">
      <header className="flex items-end justify-between gap-4 border-b border-linha pb-5">
        <div>
          <h1 className="fonte-display text-2xl">Status</h1>
          <p className="mt-1 text-sm text-apagado">Health check da aplicação.</p>
        </div>
        <Etiqueta tom="ok">operacional</Etiqueta>
      </header>

      <dl className="mt-6 divide-y divide-linha border-y border-linha">
        {linhas.map(([termo, valor]) => (
          <div key={termo} className="grid gap-1 py-2 sm:grid-cols-[14rem_1fr] sm:gap-4">
            <dt className="rotulo">{termo}</dt>
            <dd className="numero text-sm">{valor}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-apagado">
        Versão em JSON para monitoração:{' '}
        <Link href="/api/status" className="underline underline-offset-4">
          /api/status
        </Link>
      </p>

      <Rodape className="mt-10" />
    </main>
  )
}
