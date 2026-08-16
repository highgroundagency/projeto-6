import { Num } from '@/components/base/num'
import { Etiqueta } from '@/components/base/selo'
import { MarcaPrumo } from '@/components/base/marca'
import { PRODUTO, URL_DRIVE } from '@/content/produto'
import { cicloPorId, type CicloId } from '@/lib/cronograma'
import { diferencaEmDias, formatarBR, formatarExtenso, type DataISO } from '@/lib/datas'
import { proximoMarco } from '@/lib/releases'

export function TopoRegistro({
  hoje,
  cicloCorrente,
  admin,
}: {
  hoje: DataISO
  cicloCorrente: CicloId | null
  admin: boolean
}) {
  const marco = proximoMarco(hoje)
  const diasAteMarco = marco ? diferencaEmDias(hoje, marco.data) : null
  const ciclo = cicloCorrente ? cicloPorId(cicloCorrente) : null

  return (
    <header className="border-b border-linha pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MarcaPrumo tamanho="medio" />
          <p className="mt-1 text-sm text-apagado">Registro do projeto · {PRODUTO.subtitulo}</p>
        </div>

        {URL_DRIVE ? (
          <a
            href={URL_DRIVE}
            target="_blank"
            rel="noreferrer noopener"
            className="border border-linha bg-fundo px-3 py-1.5 text-xs hover:border-linha-alta"
          >
            Pasta do projeto no Drive ↗
          </a>
        ) : admin ? (
          <span className="border border-dashed border-alerta/50 px-3 py-1.5 text-xs text-alerta">
            Configure NEXT_PUBLIC_DRIVE_URL para exibir o link do Drive
          </span>
        ) : null}
      </div>

      <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-baseline gap-2">
          <dt className="rotulo">Hoje</dt>
          <dd>
            <Num>{formatarBR(hoje)}</Num>
          </dd>
        </div>

        {ciclo ? (
          <div className="flex items-baseline gap-2">
            <dt className="rotulo">Ciclo atual</dt>
            <dd>
              <Etiqueta tom="acento">{ciclo.rotulo}</Etiqueta>
            </dd>
          </div>
        ) : null}

        {marco && diasAteMarco !== null ? (
          <div className="flex items-baseline gap-2">
            <dt className="rotulo">Próximo marco</dt>
            <dd>
              {marco.rotulo} em <Num>{formatarBR(marco.data)}</Num>{' '}
              <span className="text-apagado">
                {diasAteMarco === 0 ? '— é hoje' : `— faltam ${diasAteMarco} dias`}
              </span>
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="sr-only">Data de referência: {formatarExtenso(hoje)}.</p>
    </header>
  )
}
