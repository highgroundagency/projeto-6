import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { notFound } from 'next/navigation'
import { repositorio } from '@/lib/dados'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirPerfil, identidadeQueEscreve } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** Volta para a sanfona da SEAB, já aberta e com a faixa endereçada a ela. */
function deVolta(resultado: { ok?: string; erro?: string }): string {
  return comParametros(
    '/sistema',
    { abrir: 'painel-seab', de: 'painel-seab', ...resultado },
    ancoraDaTela('painel-seab'),
  )
}

const corpoSchema = z.object({
  cicloId: z.string().min(1).max(60),
  confirmo: z.literal('on'),
})

/**
 * Avanço de estado do ciclo.
 *
 * EXIGE A CONTA DA SEAB (ADR-051). Com o banco ligado, o estado do ciclo é um
 * só para todos: um avanço fecha a janela de lançamento para todo mundo, como
 * no processo real, e não tem volta, nem pela interface nem pelo banco
 * (gatilho `ciclo_transicao_valida`).
 *
 * Até a ADR-051 bastava a sessão do painel administrativo (ADR-015). Não basta
 * mais: a senha do painel é pública no briefing, e com a escrita gravando para
 * todos, ela abriria o banco a qualquer um que lesse o briefing. Quem não tem a
 * conta recebe 404, como antes, para não confirmar a rota.
 */
export async function POST(requisicao: NextRequest) {
  const identidade = await identidadeQueEscreve()
  if (!identidade || identidade.perfil !== 'seab') notFound()
  await exigirPerfil('painel-seab')

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({
    cicloId: formulario.get('cicloId'),
    confirmo: formulario.get('confirmo'),
  })

  if (!analisado.success) {
    return redirecionar(deVolta({ erro: 'Confirme a transição antes de avançar.' }))
  }

  const resultado = await repositorio().avancarCiclo(
    analisado.data.cicloId,
    identidade.login ?? 'seab',
    new Date().toISOString(),
  )

  return redirecionar(deVolta({ [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }))
}
