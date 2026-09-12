import { redirect } from 'next/navigation'

/**
 * `/kickoff` leva à apresentação.
 *
 * O deck mora em `/pitch` porque "pitch" é como a equipe chama a peça por
 * dentro. Só que quem avalia chama de Kick-off, e foi exatamente isso que
 * aconteceu: alguém procurou a página do Kick-off no site e não achou, porque
 * a palavra não existia em rota nem em botão nenhum.
 *
 * Mesmo espírito de `/registro`: rota curta que não quebra, e que leva direto
 * ao lugar certo. O portão de release continua sendo o de `/pitch`, então
 * antes da liberação do ciclo isto redireciona para um 404 honesto.
 */
export default function PaginaKickoff() {
  redirect('/pitch')
}
