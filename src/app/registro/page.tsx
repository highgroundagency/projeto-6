import { redirect } from 'next/navigation'

/**
 * O registro deixou de ser uma página separada.
 *
 * Ele vive na raiz, junto do problema, da equipe e dos marcos — separar as duas
 * coisas obrigava o professor a escolher por onde entrar antes de saber o que
 * havia de cada lado. Esta rota fica só para não quebrar link já compartilhado
 * e leva direto à seção.
 */
export default function PaginaRegistro() {
  redirect('/#registro')
}
