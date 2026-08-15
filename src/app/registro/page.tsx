import type { Metadata } from 'next'
import { FaixaAdmin } from '@/components/base/faixa-admin'
import { Rodape } from '@/components/base/rodape'
import { CabecalhoProjeto, Equipe } from '@/components/registro/cabecalho-projeto'
import {
  CicloSemRegistro,
  RegistroSemana,
} from '@/components/registro/registro-semana'
import { TimelineCiclos, TrilhaMarcos } from '@/components/registro/trilhas'
import { TopoRegistro } from '@/components/registro/topo'
import { carregarCiclos, temRegistro } from '@/content/ciclos/registro'
import { IDS_CICLOS, cicloPorId } from '@/lib/cronograma'
import { obterVisao } from '@/lib/visao'

export const metadata: Metadata = {
  title: 'Registro do projeto',
  description:
    'Registro semanal do Projeto 6 — objetivo, avanços, decisões, bloqueios, feedback, próximos passos, responsáveis e evidências de cada ciclo.',
}

/**
 * O gate de release lê cookie e depende da data corrente, então a página é
 * dinâmica de propósito: HTML assado no build ficaria errado assim que o
 * calendário virasse.
 */
export const dynamic = 'force-dynamic'

export default async function PaginaRegistro() {
  const visao = await obterVisao()

  // O gate acontece AQUI: só os ciclos aprovados chegam ao carregador. Passar a
  // lista completa anularia a proteção do §6.3.
  const idsVisiveisComRegistro = visao.visiveis.filter((id) => temRegistro(id))
  const carregados = await carregarCiclos(idsVisiveisComRegistro)

  // Do mais recente para o mais antigo: quem abre a página quer a semana atual.
  const emOrdemInversa = [...carregados].reverse()

  const semRegistro = visao.visiveis.filter((id) => !temRegistro(id)).reverse()
  const idsComRegistro = IDS_CICLOS.filter((id) => temRegistro(id))

  return (
    <>
      <FaixaAdmin visao={visao} />

      <main id="conteudo" className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
        <TopoRegistro
          hoje={visao.hoje}
          cicloCorrente={visao.release.cicloCorrente}
          admin={visao.admin}
        />

        <CabecalhoProjeto />
        <Equipe />
        <TrilhaMarcos hoje={visao.hoje} />
        <TimelineCiclos
          visiveis={visao.visiveis}
          comRegistro={idsComRegistro}
          cicloCorrente={visao.release.cicloCorrente}
        />

        <section className="mt-10" aria-labelledby="titulo-registros">
          <h2 id="titulo-registros" className="rotulo">
            Registro semanal
          </h2>

          {emOrdemInversa.length === 0 ? (
            <p className="mt-3 border border-dashed border-linha px-4 py-6 text-sm text-cinza-forte">
              O semestre ainda não começou. O primeiro registro é publicado em{' '}
              {cicloPorId('s1').data.split('-').reverse().join('/')}.
            </p>
          ) : (
            <div className="mt-3 space-y-6">
              {emOrdemInversa.map(({ id, modulo }) => (
                <RegistroSemana
                  key={id}
                  registro={modulo.registro}
                  detalhes={modulo.Detalhes ? <modulo.Detalhes /> : undefined}
                />
              ))}

              {semRegistro.length > 0 ? (
                <div className="space-y-2">
                  {semRegistro.map((id) => (
                    <CicloSemRegistro key={id} ciclo={id} />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </section>

        <Rodape className="mt-10" />
      </main>
    </>
  )
}
