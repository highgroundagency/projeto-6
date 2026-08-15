import type { Metadata } from 'next'
import Link from 'next/link'
import { Botao } from '@/components/base/botao'
import { MarcaPrumo } from '@/components/base/marca'
import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { montarChecklist, ROTULO_STATUS, type StatusEvidencia } from '@/content/checklist'
import { integrantePorId } from '@/content/equipe'
import { temRegistro } from '@/content/ciclos/registro'
import { exigirAdmin } from '@/lib/admin/guard'
import { obterStore } from '@/lib/config/store'
import { CRONOGRAMA, MARCOS_PARALELOS, type CicloId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { FEATURES } from '@/lib/features'
import { ADIANTAMENTOS_SUGERIDOS, calcularReleaseAtual } from '@/lib/releases'
import { obterVisao } from '@/lib/visao'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const TOM_STATUS: Record<StatusEvidencia, 'neutro' | 'laranja' | 'ok'> = {
  a_fazer: 'neutro',
  em_andamento: 'laranja',
  feito: 'ok',
  validado: 'ok',
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8 border border-linha bg-white">
      <header className="border-b border-linha px-4 py-3">
        <h2 className="fonte-display text-lg">{titulo}</h2>
        {descricao ? <p className="mt-0.5 text-sm text-cinza-forte">{descricao}</p> : null}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  )
}

export default async function PainelAdmin({
  searchParams,
}: {
  searchParams: Promise<{ 'apenas-sessao'?: string }>
}) {
  // Segunda camada de proteção, independente do middleware.
  await exigirAdmin()

  const visao = await obterVisao()
  const store = obterStore()
  const historico = await store.historico(30)
  const checklist = montarChecklist()
  const { 'apenas-sessao': apenasSessao } = await searchParams

  const previaAdiantamento = ADIANTAMENTOS_SUGERIDOS.map((dias) => ({
    dias,
    release: calcularReleaseAtual({ hoje: visao.hojeReal, adiantamentoDias: dias }),
  }))

  return (
    <main id="conteudo" className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-linha pb-5">
        <div>
          <MarcaPrumo tamanho="medio" />
          <h1 className="fonte-display mt-1 text-2xl">Painel administrativo</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/registro" className="rotulo hover:text-tinta">
            Ver registro
          </Link>
          <form action="/api/admin/sair" method="post">
            <Botao type="submit" variante="contorno" tamanho="pequeno">
              Sair
            </Botao>
          </form>
        </div>
      </header>

      {!store.gravavel ? (
        <p className="mt-5 border border-vinho-alerta/40 bg-vinho-alerta/10 px-4 py-3 text-sm">
          <strong>Configuração global somente leitura neste ambiente.</strong> O
          filesystem da Vercel não aceita escrita e o projeto não usa banco. O que você
          mudar aqui vale para a <strong>sua sessão</strong>; para mudar o que o público
          vê, altere as variáveis <Num>RELEASE_ADIANTAMENTO_DIAS</Num>,{' '}
          <Num>RELEASE_OVERRIDE</Num> e <Num>RELEASE_TRAVAS</Num> e faça o redeploy. Ver{' '}
          <Num>docs/releases.md</Num>.
        </p>
      ) : null}

      {apenasSessao ? (
        <p className="mt-5 border border-laranja/50 bg-laranja-fraco px-4 py-3 text-sm">
          Mudança aplicada apenas à sua sessão.
        </p>
      ) : null}

      <Secao titulo="Estado atual">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { termo: 'Hoje (Recife)', valor: formatarBR(visao.hojeReal) },
            {
              termo: 'Data em uso',
              valor: visao.hoje === visao.hojeReal ? 'real' : `simulada ${formatarBR(visao.hoje)}`,
            },
            {
              termo: 'Release atual',
              valor: `${visao.release.releaseAtual ?? '—'}${visao.release.manual ? ' (fixado)' : ''}`,
            },
            { termo: 'Adiantamento', valor: `${visao.release.adiantamentoDias} dias` },
            { termo: 'Ciclos visíveis', valor: `${visao.visiveis.length} de ${CRONOGRAMA.length}` },
            { termo: 'Modo', valor: visao.modoCompleto ? 'completo' : 'como visitante' },
            { termo: 'Driver de configuração', valor: store.nome },
            { termo: 'Travas ativas', valor: String(Object.keys(visao.release.travas).length) },
          ].map((item) => (
            <div key={item.termo} className="border border-linha px-3 py-2">
              <dt className="rotulo">{item.termo}</dt>
              <dd className="numero mt-0.5 text-sm">{item.valor}</dd>
            </div>
          ))}
        </dl>
      </Secao>

      <Secao
        titulo="Ver como visitante"
        descricao="Enxergue exatamente o recorte público — opcionalmente numa data futura."
      >
        <form action="/api/admin/config" method="post" className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="acao" value="visao" />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="verComoVisitante"
              defaultChecked={visao.verComoVisitante}
              className="size-4 accent-[color:var(--color-laranja)]"
            />
            Ver como visitante
          </label>

          <div>
            <label htmlFor="dataSimulada" className="rotulo">
              Data simulada
            </label>
            <input
              id="dataSimulada"
              name="dataSimulada"
              type="date"
              defaultValue={visao.dataSimulada ?? ''}
              min={CRONOGRAMA[0].data}
              className="numero mt-1 block border border-linha px-2 py-1.5 text-sm"
            />
          </div>

          <Botao type="submit" variante="primario">
            Aplicar
          </Botao>
          <Botao
            type="submit"
            name="acao"
            value="limpar-overlay"
            variante="fantasma"
            tamanho="pequeno"
          >
            Limpar simulação
          </Botao>
        </form>
      </Secao>

      <Secao
        titulo="Release"
        descricao="O adiantamento move todos os ciclos de uma vez; o seletor fixa um release à mão."
      >
        <form action="/api/admin/config" method="post" className="space-y-4">
          <input type="hidden" name="acao" value="release" />

          <div>
            <span className="rotulo">Adiantamento (dias)</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <input
                name="adiantamentoDias"
                type="number"
                min={0}
                max={120}
                defaultValue={visao.release.adiantamentoDias}
                className="numero w-24 border border-linha px-2 py-1.5 text-sm"
              />
              <ul className="flex flex-wrap gap-2 text-xs text-cinza-forte">
                {previaAdiantamento.map((previa) => (
                  <li
                    key={previa.dias}
                    className={cn(
                      'border border-linha px-2 py-1',
                      previa.dias === visao.release.adiantamentoDias && 'border-laranja bg-laranja-fraco',
                    )}
                  >
                    <Num>{previa.dias}d</Num> → <Num>{previa.release ?? '—'}</Num>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label htmlFor="overrideRelease" className="rotulo">
              Fixar release manualmente
            </label>
            <select
              id="overrideRelease"
              name="overrideRelease"
              defaultValue={visao.release.override ?? ''}
              className="numero mt-1.5 block w-full max-w-sm border border-linha px-2 py-1.5 text-sm"
            >
              <option value="">automático (pela data)</option>
              {CRONOGRAMA.map((ciclo) => (
                <option key={ciclo.id} value={ciclo.id}>
                  {ciclo.id} — {ciclo.rotulo} ({formatarBR(ciclo.data)})
                </option>
              ))}
            </select>
          </div>

          <Botao type="submit" variante="primario">
            Aplicar release
          </Botao>
        </form>
      </Secao>

      <Secao
        titulo="Travas por ciclo"
        descricao="Libera ou esconde um ciclo isolado, sem mexer no release."
      >
        <form action="/api/admin/config" method="post">
          <input type="hidden" name="acao" value="travas" />

          <div className="overflow-x-auto border border-linha">
            <table className="w-full min-w-[38rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-linha bg-papel-2">
                  <th className="rotulo px-3 py-2 text-left">Ciclo</th>
                  <th className="rotulo px-3 py-2 text-left">Data</th>
                  <th className="rotulo px-3 py-2 text-left">Registro</th>
                  {(['automatico', 'sempre_visivel', 'sempre_oculto'] as const).map((opcao) => (
                    <th key={opcao} className="rotulo px-3 py-2 text-left">
                      {opcao.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRONOGRAMA.map((ciclo) => {
                  const atual = visao.release.travas[ciclo.id as CicloId] ?? 'automatico'
                  return (
                    <tr key={ciclo.id} className="border-b border-linha last:border-0">
                      <td className="px-3 py-1.5">
                        <Num className="text-xs">{ciclo.id}</Num>{' '}
                        <span className="text-cinza-forte">{ciclo.rotulo}</span>
                      </td>
                      <td className="numero px-3 py-1.5 whitespace-nowrap">
                        {formatarBR(ciclo.data)}
                      </td>
                      <td className="px-3 py-1.5">
                        {temRegistro(ciclo.id as CicloId) ? (
                          <Etiqueta tom="ok">escrito</Etiqueta>
                        ) : (
                          <Etiqueta>vazio</Etiqueta>
                        )}
                      </td>
                      {(['automatico', 'sempre_visivel', 'sempre_oculto'] as const).map((opcao) => (
                        <td key={opcao} className="px-3 py-1.5">
                          <input
                            type="radio"
                            name={`trava:${ciclo.id}`}
                            value={opcao}
                            defaultChecked={atual === opcao}
                            aria-label={`${ciclo.rotulo}: ${opcao}`}
                            className="size-4 accent-[color:var(--color-laranja)]"
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Botao type="submit" variante="primario" className="mt-3">
            Aplicar travas
          </Botao>
        </form>
      </Secao>

      <Secao titulo="Funcionalidades do sistema" descricao="Cada tela e o ciclo que a libera.">
        <ul className="grid gap-px border border-linha bg-linha sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const liberada = visao.visiveis.includes(feature.ciclo)
            return (
              <li key={feature.id} className="flex items-start justify-between gap-3 bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{feature.rotulo}</p>
                  <p className="numero text-xs text-cinza-forte">{feature.rota}</p>
                </div>
                <Etiqueta tom={liberada ? 'ok' : 'neutro'}>
                  {feature.ciclo} · {liberada ? 'no ar' : '404'}
                </Etiqueta>
              </li>
            )
          })}
        </ul>
      </Secao>

      <Secao
        titulo="Log de liberações"
        descricao="Toda alteração de configuração global fica registrada aqui."
      >
        {historico.length === 0 ? (
          <p className="text-sm text-cinza-forte">
            Nenhuma alteração registrada neste ambiente.
          </p>
        ) : (
          <ol className="divide-y divide-linha border-y border-linha text-sm">
            {historico.map((linha) => (
              <li key={linha.id} className="flex flex-wrap items-baseline gap-x-3 py-2">
                <Num className="text-xs text-cinza-forte">{linha.quando.slice(0, 16).replace('T', ' ')}</Num>
                <span className="numero text-xs">{linha.campo}</span>
                <span>
                  <Num>{linha.de}</Num> <span aria-hidden className="text-laranja">→</span>{' '}
                  <Num>{linha.para}</Num>
                </span>
                <span className="rotulo">{linha.autor}</span>
              </li>
            ))}
          </ol>
        )}
      </Secao>

      <Secao
        titulo="Checklist da matriz"
        descricao="Evidências exigidas por ciclo. Editável em src/content/checklist.ts — status é conteúdo e vive no Git."
      >
        <div className="overflow-x-auto border border-linha">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-linha bg-papel-2">
                <th className="rotulo px-3 py-2 text-left">Ciclo</th>
                <th className="rotulo px-3 py-2 text-left">Evidência</th>
                <th className="rotulo px-3 py-2 text-left">Status</th>
                <th className="rotulo px-3 py-2 text-left">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((linha, i) => (
                <tr key={`${linha.ciclo}-${i}`} className="border-b border-linha last:border-0">
                  <td className="numero px-3 py-1.5 text-xs whitespace-nowrap">{linha.ciclo}</td>
                  <td className="px-3 py-1.5">
                    {linha.link ? (
                      <Link href={linha.link} className="underline underline-offset-2">
                        {linha.evidencia}
                      </Link>
                    ) : (
                      linha.evidencia
                    )}
                  </td>
                  <td className="px-3 py-1.5">
                    <Etiqueta tom={TOM_STATUS[linha.status]}>{ROTULO_STATUS[linha.status]}</Etiqueta>
                  </td>
                  <td className="px-3 py-1.5 text-cinza-forte">
                    {linha.responsavel ? integrantePorId(linha.responsavel).nome : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao
        titulo="Faixas paralelas"
        descricao="Marcos de Machine Learning e Direito Digital, e o que este projeto alimenta em cada um."
      >
        <ul className="divide-y divide-linha border-y border-linha">
          {MARCOS_PARALELOS.map((marco) => (
            <li key={`${marco.trilha}-${marco.data}`} className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <div className="flex items-baseline gap-2">
                <Num className="text-xs">{formatarBR(marco.data)}</Num>
                <Etiqueta>{marco.trilha}</Etiqueta>
              </div>
              <div>
                <p className="text-sm font-medium">{marco.rotulo}</p>
                <p className="text-xs text-cinza-forte">{marco.oQueOProjetoAlimenta}</p>
              </div>
            </li>
          ))}
        </ul>
      </Secao>
    </main>
  )
}
