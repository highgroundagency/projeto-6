import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { ehAdmin } from '@/lib/admin/guard'
import {
  assinarToken,
  NOME_COOKIE_VISAO,
  obterSegredo,
  opcoesCookieSessao,
  verificarToken,
} from '@/lib/admin/sessao'
import { obterStore } from '@/lib/config/store'
import { redirecionar } from '@/lib/http'
import { IDS_CICLOS, type CicloId } from '@/lib/cronograma'
import { ehDataISO } from '@/lib/datas'
import { overlaySchema, type Overlay } from '@/lib/visao'

/**
 * Aplica as mudanças do painel (§7.2).
 *
 * Onde a mudança é gravada depende do ambiente:
 * - store gravável (dev): configuração GLOBAL, com linha no log de liberações;
 * - store somente leitura (produção antes da F3): overlay assinado na sessão
 *   do próprio admin, que muda a visão dele e não a do público.
 *
 * "Ver como visitante" e a data simulada são SEMPRE overlay: por natureza,
 * valem só para quem está conferindo.
 */

const cicloIdSchema = z.enum(IDS_CICLOS as unknown as [CicloId, ...CicloId[]])
const travaSchema = z.enum(['automatico', 'sempre_visivel', 'sempre_oculto'])

async function lerOverlayAtual(segredo: string): Promise<Overlay> {
  const cookieStore = await cookies()
  const bruto = await verificarToken<unknown>(
    cookieStore.get(NOME_COOKIE_VISAO)?.value,
    segredo,
  )
  const analisado = overlaySchema.safeParse(bruto ?? {})
  return analisado.success ? analisado.data : {}
}

function numeroOuIndefinido(valor: FormDataEntryValue | null): number | undefined {
  if (typeof valor !== 'string' || !valor.trim()) return undefined
  const numero = Number(valor)
  return Number.isFinite(numero) ? Math.trunc(numero) : undefined
}

export async function POST(requisicao: NextRequest) {
  // Segunda camada: o middleware já barrou, mas não confiamos só nele.
  if (!(await ehAdmin())) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 })
  }

  const segredo = obterSegredo()
  const formulario = await requisicao.formData()
  const acao = String(formulario.get('acao') ?? '')
  const store = obterStore()

  const overlay = await lerOverlayAtual(segredo)
  let novoOverlay: Overlay = { ...overlay }
  let patchGlobal: {
    adiantamentoDias?: number
    overrideRelease?: CicloId | null
    travas?: Overlay['travas']
  } = {}

  switch (acao) {
    case 'visao': {
      const verComoVisitante = formulario.get('verComoVisitante') === 'on'
      const data = String(formulario.get('dataSimulada') ?? '').trim()
      novoOverlay = {
        ...novoOverlay,
        verComoVisitante,
        dataSimulada: data && ehDataISO(data) ? data : undefined,
      }
      break
    }

    case 'release': {
      const adiantamento = numeroOuIndefinido(formulario.get('adiantamentoDias'))
      const overrideBruto = String(formulario.get('overrideRelease') ?? '').trim()
      const override = overrideBruto ? cicloIdSchema.safeParse(overrideBruto) : null

      patchGlobal = {
        ...(adiantamento !== undefined && adiantamento >= 0 && adiantamento <= 120
          ? { adiantamentoDias: adiantamento }
          : {}),
        overrideRelease: override?.success ? override.data : null,
      }
      break
    }

    case 'travas': {
      const travas: NonNullable<Overlay['travas']> = {}
      for (const id of IDS_CICLOS) {
        const valor = travaSchema.safeParse(formulario.get(`trava:${id}`))
        if (valor.success && valor.data !== 'automatico') travas[id] = valor.data
      }
      patchGlobal = { travas }
      break
    }

    case 'limpar-overlay': {
      novoOverlay = {}
      break
    }

    default:
      return NextResponse.json({ erro: 'ação desconhecida' }, { status: 400 })
  }

  if (Object.keys(patchGlobal).length > 0) {
    if (store.gravavel) {
      await store.gravar(patchGlobal, 'painel')
      // Overlay deixa de fazer sentido para os campos recém-gravados no global.
      novoOverlay = {
        ...novoOverlay,
        adiantamentoDias: undefined,
        overrideRelease: undefined,
        travas: undefined,
      }
    } else {
      // Ambiente somente leitura: a mudança vale para a sessão deste admin.
      novoOverlay = { ...novoOverlay, ...patchGlobal }
    }
  }

  const resposta = redirecionar(store.gravavel ? '/admin' : '/admin?apenas-sessao=1')

  if (acao === 'limpar-overlay') {
    resposta.cookies.delete(NOME_COOKIE_VISAO)
  } else {
    resposta.cookies.set(
      NOME_COOKIE_VISAO,
      await assinarToken(novoOverlay, segredo),
      opcoesCookieSessao(),
    )
  }

  return resposta
}
