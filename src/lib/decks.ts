import { CRONOGRAMA, type Ciclo, type CicloId } from './cronograma'
import { somarDias, type DataISO } from './datas'
import { DIAS_DE_DESTAQUE_DO_PITCH } from './releases'

/**
 * Os marcos que têm apresentação no site, e onde ela mora.
 *
 * Nasceu no SR1. O atalho do topo e o bloco "a entrega da vez" sabiam de um
 * deck só, o do Kick-off, e dez dias depois dele o site deixava de oferecer
 * apresentação nenhuma, justamente na semana de preparar a próxima. Aqui cada
 * marco com deck diz a rota, o PDF e a palavra que o professor usa para ele.
 *
 * Função pura, como `releases.ts`: o "hoje" entra de fora, e o portão do
 * ciclo também, na forma de uma função `podeVer`. Quem chama confere a sessão;
 * isto aqui só faz a conta de datas.
 */
export interface DeckDoMarco {
  readonly ciclo: CicloId
  readonly rota: string
  readonly pdf: string
  /** A palavra do atalho do topo: a que o professor usa, nunca o nome interno. */
  readonly rotulo: string
  /** O título do link, para quem passa o mouse ou usa leitor de tela. */
  readonly titulo: string
}

export const DECKS_DOS_MARCOS: readonly DeckDoMarco[] = [
  {
    ciclo: 'ko',
    rota: '/pitch',
    pdf: '/pitch/pdf',
    rotulo: 'kick-off',
    titulo: 'A apresentação do Kick-off',
  },
  { ciclo: 'sr1', rota: '/sr1', pdf: '/sr1/pdf', rotulo: 'sr1', titulo: 'A apresentação do SR1' },
]

/**
 * Que deck o site deve oferecer nesta data, se algum.
 *
 * O do marco MAIS RECENTE que o visitante já vê e cuja janela de destaque
 * ainda não fechou. A janela é a mesma do Kick-off: dez dias depois do marco
 * (`DIAS_DE_DESTAQUE_DO_PITCH`). O começo dela é o portão do ciclo, não uma
 * data: enquanto o marco não abriu, a rota responde 404 e o botão levaria a
 * lugar nenhum.
 */
export function deckEmDestaque(
  hoje: DataISO,
  podeVer: (ciclo: CicloId) => boolean,
  ciclos: readonly Ciclo[] = CRONOGRAMA,
  decks: readonly DeckDoMarco[] = DECKS_DOS_MARCOS,
): DeckDoMarco | null {
  const abertos = decks.filter((deck) => {
    const marco = ciclos.find((c) => c.id === deck.ciclo)
    return (
      marco !== undefined &&
      podeVer(deck.ciclo) &&
      hoje <= somarDias(marco.data, DIAS_DE_DESTAQUE_DO_PITCH)
    )
  })
  return abertos.at(-1) ?? null
}
