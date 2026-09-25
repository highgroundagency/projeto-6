import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { exigirAdmin } from '@/lib/admin/guard'
import { repositorio } from '@/lib/dados'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirPerfil, perfilAtual } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'
import { garantirVisitante } from '@/lib/sistema/visitante'

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
 * ÚNICA ESCRITA DO SISTEMA QUE EXIGE CREDENCIAL (ADR-015). Até o SR1 o estado
 * do ciclo era um só para todos os visitantes, e um clique alheio fechava a
 * janela de lançamento para todo mundo. Hoje o avanço cai na cópia de quem
 * clicou (ver `sistema/estado.ts`), então a demonstração do admin não muda a
 * tela de ninguém. A credencial continua: avançar etapa é da SEAB, e a
 * transição não tem volta pela interface. `exigirAdmin` responde 404 em vez de
 * 403 pela mesma razão de `/admin` — não confirmar o mecanismo a quem não
 * deveria conhecê-lo.
 *
 * A checagem de perfil, essa sim, é conveniência de interface: o seletor de
 * perfil é simulado. A validação da transição vive na camada de escrita — e, no
 * schema de `supabase/migrations/`, num gatilho do banco.
 */
export async function POST(requisicao: NextRequest) {
  await exigirAdmin()
  await exigirPerfil('painel-seab')

  if ((await perfilAtual()) !== 'seab') {
    return redirecionar(deVolta({ erro: 'Somente a SEAB pode avançar o ciclo.' }))
  }

  const formulario = await requisicao.formData()
  const analisado = corpoSchema.safeParse({
    cicloId: formulario.get('cicloId'),
    confirmo: formulario.get('confirmo'),
  })

  if (!analisado.success) {
    return redirecionar(deVolta({ erro: 'Confirme a transição antes de avançar.' }))
  }

  await garantirVisitante()
  const resultado = await repositorio().avancarCiclo(
    analisado.data.cicloId,
    'seab',
    new Date().toISOString(),
  )

  return redirecionar(deVolta({ [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }))
}
