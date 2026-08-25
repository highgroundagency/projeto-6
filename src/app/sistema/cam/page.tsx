import { redirect } from 'next/navigation'
import { exigirPerfil } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/**
 * Painel da SEAB — rota histórica (do tempo do nome CAM), hoje um
 * redirecionamento (ADR-023).
 *
 * A tela virou uma sanfona dentro de `/sistema`. A rota continua existindo
 * porque links antigos existem, e desemboca na página nova, já com a sanfona
 * certa aberta.
 *
 * O REDIRECIONAMENTO VEM DEPOIS DOS GATES, nunca antes. `exigirPerfil` responde
 * 404 quando a funcionalidade ainda não foi liberada ou não pertence ao perfil
 * ativo, e é isso que mantém o §6.2 de pé: quem digita a URL de uma tela que não
 * é sua não descobre que ela existe, nem por um redirecionamento.
 */
export const dynamic = 'force-dynamic'

export default async function RotaCam() {
  await exigirPerfil('painel-seab')
  redirect(`/sistema?abrir=painel-seab${ancoraDaTela('painel-seab')}`)
}
