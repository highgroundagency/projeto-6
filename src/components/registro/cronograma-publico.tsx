import { Num } from '@/components/base/num'
import { ROTULO_STATUS, montarChecklist, type StatusEvidencia } from '@/content/checklist'
import { nomeCurto, type IntegranteId } from '@/content/equipe'
import { CRONOGRAMA, type CicloId } from '@/lib/cronograma'
import { formatarBR } from '@/lib/datas'
import { cn } from '@/lib/utils'

/**
 * O CRONOGRAMA PÚBLICO: as dezoito semanas, com entrega, prazo, estado e dono.
 *
 * Os quatro dados que o briefing do Kick-off cobra já existiam, e nenhum deles
 * era público: as atividades e os prazos em `src/lib/cronograma.ts`, o estado e
 * o responsável em `src/content/checklist.ts`. `montarChecklist()` já juntava
 * os dois, e o único consumidor era o painel atrás da senha. Ou seja: o
 * professor não via nada disso.
 *
 * Uma linha por semana, e não por entrega: com 69 evidências a tabela vira
 * planilha, que é justamente o que este projeto existe para não ser. O detalhe
 * de cada entrega está no registro da semana, a um clique.
 *
 * SEMANA NÃO LIBERADA APARECE. O que aparece dela é o PLANO (o nome da semana,
 * a data e o que ela promete entregar), que é público desde o primeiro dia: é o
 * calendário da disciplina. O que continua fechado é o registro, o texto do que
 * aconteceu. A regra do §6.3 é sobre conteúdo, não sobre cronograma.
 */

const ORDEM: Record<StatusEvidencia, number> = {
  a_fazer: 0,
  em_andamento: 1,
  feito: 2,
  validado: 3,
}

/** O estado da semana é o do seu item menos adiantado. */
function estadoDaSemana(estados: readonly StatusEvidencia[]): StatusEvidencia {
  if (estados.length === 0) return 'a_fazer'
  return estados.reduce((pior, atual) => (ORDEM[atual] < ORDEM[pior] ? atual : pior))
}

function Pastilha({ status }: { status: StatusEvidencia }) {
  return (
    <span
      className={cn(
        'pilula whitespace-nowrap',
        status === 'validado' && 'border-acento text-acento',
        status === 'a_fazer' && 'text-apagado',
      )}
    >
      {ROTULO_STATUS[status]}
    </span>
  )
}

export function CronogramaPublico({
  visiveis,
  cicloCorrente,
}: {
  visiveis: readonly CicloId[]
  cicloCorrente: CicloId | null
}) {
  const linhas = montarChecklist()

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-xs">
        <caption className="sr-only">
          As dezoito semanas do semestre, com o que cada uma entrega, a data, o estado e quem
          responde.
        </caption>
        <thead>
          <tr className="border-y border-linha-alta">
            {['Semana', 'Data', 'O que a semana entrega', 'Estado', 'Quem responde'].map(
              (coluna) => (
                <th key={coluna} className="rotulo px-2 py-2 text-left align-bottom">
                  {coluna}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {CRONOGRAMA.map((ciclo) => {
            const doCiclo = linhas.filter((l) => l.ciclo === ciclo.id)
            const status = estadoDaSemana(doCiclo.map((l) => l.status))
            const donos = [
              ...new Set(
                doCiclo
                  .map((l) => l.responsavel)
                  .filter((id): id is IntegranteId => id !== undefined),
              ),
            ]
            const liberado = visiveis.includes(ciclo.id as CicloId)
            const atual = ciclo.id === cicloCorrente

            return (
              <tr
                key={ciclo.id}
                className={cn(
                  'border-b border-linha align-top',
                  atual && 'bg-superficie',
                  ciclo.tipo === 'marco' && 'border-b-linha-alta',
                )}
              >
                <td className="px-2 py-2 whitespace-nowrap">
                  {liberado ? (
                    <a href={`#ciclo-${ciclo.id}`} className="hover:text-acento">
                      {ciclo.rotulo}
                    </a>
                  ) : (
                    <span className="text-apagado">{ciclo.rotulo}</span>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <Num>{formatarBR(ciclo.data)}</Num>
                </td>
                <td className="px-2 py-2">
                  {ciclo.evidencias.length > 0 ? ciclo.evidencias.join(' · ') : 'entregas da semana anterior'}
                </td>
                <td className="px-2 py-2">
                  <Pastilha status={status} />
                </td>
                <td className="px-2 py-2">
                  {donos.length > 0
                    ? donos.map((id) => nomeCurto(id)).join(', ')
                    : <span className="text-apagado">a definir</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
