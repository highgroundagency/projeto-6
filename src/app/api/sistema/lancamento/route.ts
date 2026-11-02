import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { repositorio } from '@/lib/dados'
import { carregarDados } from '@/lib/dados/consultas'
import { comParametros, redirecionar } from '@/lib/http'
import { exigirPerfil, identidadeQueEscreve, SO_LEITURA } from '@/lib/sistema'
import { ancoraDaTela } from '@/lib/sistema/parametros'

/** Volta para a sanfona de lançamento, já aberta e com a unidade preservada. */
function deVolta(unidade: string, resultado: { ok?: string; erro?: string }): string {
  return comParametros(
    '/sistema',
    { abrir: 'lancamento', de: 'lancamento', lanc_unidade: unidade, ...resultado },
    ancoraDaTela('lancamento'),
  )
}

/**
 * Registro de lançamento (§8.4, tela 3), por SUBINDICADOR.
 *
 * Toda entrada passa por zod antes de tocar em qualquer coisa (§9): número
 * finito e não negativo, evidência com conteúdo, subindicador, unidade e ciclo
 * existentes. Subindicador 'indice' exige `valor`; 'razao' exige `numerador` e
 * `denominador`. A janela de prazo é garantida pela camada de dados.
 *
 * A escrita vai para o banco (`driver-postgres.ts`) e vale para todos. O
 * gatilho `lancamento_dentro_da_janela` recusa o que chegar fora do prazo
 * mesmo que esta rota esqueça de checar.
 */
const corpoSchema = z.object({
  subindicadorId: z.string().min(1).max(80),
  unidadeId: z.string().min(1).max(80),
  cicloId: z.string().min(1).max(80),
  valor: z.coerce.number().finite().min(0).max(1_000_000_000).optional(),
  numerador: z.coerce.number().finite().min(0).max(1_000_000_000).optional(),
  denominador: z.coerce.number().finite().min(0).max(1_000_000_000).optional(),
  evidencia: z.string().trim().min(5).max(300),
})

function opcional(bruto: FormDataEntryValue | null): FormDataEntryValue | undefined {
  return bruto === null || bruto === '' ? undefined : bruto
}

export async function POST(requisicao: NextRequest) {
  await exigirPerfil('lancamento')

  const formulario = await requisicao.formData()
  const unidadeBruta = String(formulario.get('unidadeId') ?? '')

  const analisado = corpoSchema.safeParse({
    subindicadorId: formulario.get('subindicadorId'),
    unidadeId: formulario.get('unidadeId'),
    cicloId: formulario.get('cicloId'),
    valor: opcional(formulario.get('valor')),
    numerador: opcional(formulario.get('numerador')),
    denominador: opcional(formulario.get('denominador')),
    evidencia: formulario.get('evidencia'),
  })

  if (!analisado.success) {
    const primeiro = analisado.error.issues[0]
    return redirecionar(
      deVolta(unidadeBruta, {
        erro: `Lançamento recusado em ${primeiro.path.join('.')}: ${primeiro.message}.`,
      }),
    )
  }

  const dados = analisado.data
  const identidade = await identidadeQueEscreve()
  if (!identidade) return redirecionar(deVolta(dados.unidadeId, { erro: SO_LEITURA }))

  if (identidade.perfil === 'administrador') {
    return redirecionar(deVolta(dados.unidadeId, { erro: 'Este perfil não lança números.' }))
  }

  const panorama = await carregarDados()
  const subindicador = panorama.subindicadorPorId(dados.subindicadorId)
  const unidade = panorama.unidadePorId(dados.unidadeId)
  if (!subindicador || !unidade) {
    return redirecionar(
      deVolta(dados.unidadeId, { erro: 'Subindicador ou unidade desconhecidos.' }),
    )
  }

  // A conta manda, não o formulário: o id da unidade vem do navegador e pode
  // ter sido trocado à mão. Gerente de unidade lança pela dele; o distrital,
  // pelas do distrito dele; a SEAB, por qualquer uma (a unidade atrasada).
  if (identidade.perfil === 'gerente_unidade' && unidade.id !== identidade.unidadeId) {
    return redirecionar(
      deVolta(dados.unidadeId, { erro: 'Esta conta só lança pela própria unidade.' }),
    )
  }
  if (identidade.perfil === 'gerente_distrital' && unidade.distritoId !== identidade.distritoId) {
    return redirecionar(
      deVolta(dados.unidadeId, {
        erro: 'Esta conta só lança pelas unidades do próprio distrito.',
      }),
    )
  }

  // A forma tem de bater com o tipo: 'indice' pede valor; 'razao', a fração.
  if (subindicador.tipo === 'indice' && dados.valor === undefined) {
    return redirecionar(
      deVolta(dados.unidadeId, { erro: 'Este subindicador pede um valor direto.' }),
    )
  }
  if (
    subindicador.tipo === 'razao' &&
    (dados.numerador === undefined || dados.denominador === undefined)
  ) {
    return redirecionar(
      deVolta(dados.unidadeId, { erro: 'Este subindicador pede numerador e denominador.' }),
    )
  }

  const agora = new Date().toISOString()
  // O autor da trilha é a CONTA que lançou: com login, a trilha diz quem foi,
  // não só o papel.
  const autor = identidade.login ?? identidade.perfil
  const resultado = await repositorio().registrarLancamento(
    {
      subindicadorId: dados.subindicadorId,
      unidadeId: dados.unidadeId,
      cicloId: dados.cicloId,
      valor: subindicador.tipo === 'indice' ? (dados.valor ?? null) : null,
      numerador: subindicador.tipo === 'razao' ? (dados.numerador ?? null) : null,
      denominador: subindicador.tipo === 'razao' ? (dados.denominador ?? null) : null,
      evidencia: dados.evidencia,
      autor,
      perfil: identidade.perfil,
    },
    agora,
  )

  return redirecionar(
    deVolta(dados.unidadeId, { [resultado.ok ? 'ok' : 'erro']: resultado.mensagem }),
  )
}
